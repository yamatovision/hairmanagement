import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { logger } from '../../../utils/logger.util';
import { ConversationService } from '../../../application/services/conversation.service';
import { DailyFortuneService } from '../../../application/services/daily-fortune.service';
import { ConversationType } from '../../../domain/entities/Conversation';

/**
 * 会話コントローラー - シンプル化された設計
 * AI対話システム関連のエンドポイントを処理する
 */
@injectable()
export class ConversationController {
  constructor(
    @inject('ConversationService') private conversationService: ConversationService,
    @inject('DailyFortuneService') private fortuneService: DailyFortuneService,
    @inject('IUserRepository') private userRepository: any,
    @inject('IFortuneRepository') private fortuneRepository: any,
    @inject('ITeamRepository') private teamRepository: any
  ) {}

  /**
   * 会話を開始または継続する
   * 同じ日に同じタイプ・コンテキストの会話が既に存在する場合はそれを返す
   */
  async startOrContinueConversation(req: Request, res: Response, next: NextFunction) {
    console.log('会話開始リクエスト受信:', req.body);
    console.time('会話開始処理時間');
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '認証されていません'
        });
      }
      
      const { type, contextId } = req.body;
      
      // バリデーション
      if (!type || !['fortune', 'team', 'member'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: '無効な会話タイプです'
        });
      }
      
      if (!contextId) {
        return res.status(400).json({
          success: false,
          message: 'コンテキストIDが必要です'
        });
      }
      
      logger.debug(`会話開始/継続リクエスト: userId=${userId}, type=${type}, contextId=${contextId}`);
      
      // 今日の日付（00:00:00の時点）
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // 既存の会話を確認
      const existingConversation = await this.conversationService.findConversationByContext(
        userId,
        type,
        contextId,
        today
      );
      
      // 既存の会話がある場合はそれを返す
      if (existingConversation) {
        logger.debug(`既存の会話を継続: ${existingConversation.id}`);
        
        // 会話を整形して返す
        const formattedConversation = this.formatConversationResponse(existingConversation);
        
        return res.status(200).json({
          success: true,
          data: formattedConversation
        });
      }
      
      // DBから実際のコンテキストデータを取得
      console.log('実際のデータを取得します');
      let contextData;
      
      try {
        // 実データを取得する関数を呼び出し
        contextData = await this.getContextData(type, userId, contextId);
        
        // エラーチェック
        if (contextData.error) {
          logger.error(`コンテキストデータ取得エラー: ${contextData.error}`);
          return res.status(404).json({
            success: false,
            message: `コンテキストデータが見つかりません: ${contextData.error}`
          });
        }
        
        logger.debug(`コンテキストデータ取得成功: type=${type}, userId=${userId}, contextId=${contextId}`);
      } catch (error) {
        logger.error(`コンテキストデータ取得エラー: ${error.message}`);
        return res.status(404).json({
          success: false,
          message: 'コンテキストデータが見つかりません'
        });
      }
      
      if (!contextData) {
        return res.status(404).json({
          success: false,
          message: 'コンテキストデータが見つかりません'
        });
      }
      
      // 有効期限（翌日の0時）
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      // 会話タイプに応じた初期メッセージを作成
      const initialMessage = this.createInitialMessage(type, contextData);
      
      // 新しい会話を作成
      const conversationType = this.mapTypeToConversationType(type);
      const newConversation = await this.conversationService.createConversation(
        userId,
        conversationType,
        initialMessage,
        { contextId, contextData }, // コンテキストデータを含める
        tomorrow
      );
      
      // 応答を整形
      const formattedConversation = this.formatConversationResponse(newConversation);
      
      console.timeEnd('会話開始処理時間');
      res.status(201).json({
        success: true,
        data: formattedConversation
      });
    } catch (error) {
      logger.error('会話開始/継続エラー:', error);
      next(error);
    }
  }

  /**
   * 会話にメッセージを送信する
   */
  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const conversationId = req.params.id;
      const { content } = req.body;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '認証されていません'
        });
      }
      
      if (!content || typeof content !== 'string' || content.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'メッセージ内容は必須です'
        });
      }
      
      logger.debug(`メッセージ送信: conversationId=${conversationId}, userId=${userId}`);
      
      // メッセージを送信
      const result = await this.conversationService.sendMessage(
        conversationId,
        userId,
        content
      );
      
      // 最後のメッセージ（AI応答）を取得
      const lastMessage = result.messages.length > 0 
        ? result.messages[result.messages.length - 1] 
        : null;
      
      // レスポンスを整形
      const formattedMessage = lastMessage ? {
        id: lastMessage.id,
        sender: lastMessage.role,
        content: lastMessage.content,
        timestamp: lastMessage.createdAt.toISOString()
      } : null;
      
      res.status(200).json({
        success: true,
        data: {
          message: formattedMessage
        }
      });
    } catch (error) {
      logger.error('メッセージ送信エラー:', error);
      
      if (error.message === 'Conversation not found' || error.message === 'Unauthorized access to conversation') {
        return res.status(404).json({
          success: false,
          message: '会話が見つかりません'
        });
      }
      
      next(error);
    }
  }

  /**
   * 会話の詳細を取得する
   */
  async getConversationById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const conversationId = req.params.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '認証されていません'
        });
      }
      
      logger.debug(`会話取得: ${conversationId} by ${userId}`);
      
      // 会話の取得
      const conversation = await this.conversationService.getConversationById(
        conversationId,
        userId
      );
      
      // レスポンスを整形
      const formattedConversation = this.formatConversationResponse(conversation);
      
      res.status(200).json({
        success: true,
        data: formattedConversation
      });
    } catch (error) {
      logger.error('会話取得エラー:', error);
      
      if (error.message === 'Conversation not found' || error.message === 'Unauthorized access to conversation') {
        return res.status(404).json({
          success: false,
          message: '会話が見つかりません'
        });
      }
      
      next(error);
    }
  }

  /**
   * レスポンス用に会話を整形する
   */
  private formatConversationResponse(conversation: any) {
    return {
      id: conversation.id,
      type: conversation.type,
      messages: conversation.messages.map(msg => ({
        id: msg.id,
        sender: msg.role,
        content: msg.content,
        timestamp: msg.createdAt.toISOString()
      })),
      createdAt: conversation.createdAt.toISOString()
    };
  }

  /**
   * タイプに応じた初期メッセージを作成
   */
  private createInitialMessage(type: string, contextData: any): string {
    switch (type) {
      case 'fortune':
        // 四柱推命情報が存在する場合は詳細なプロンプトを生成
        if (contextData.sajuData && contextData.sajuData.fourPillars) {
          const { fourPillars, mainElement, yinYang, tenGods, branchTenGods } = contextData.sajuData;
          let prompt = `デイリー運勢に基づく相談を受け付けます。本日の運勢は「${contextData.rating || '良好'}」です。\n\n`;
          
          // 基本情報
          prompt += `【基本情報】\n`;
          prompt += `- 主要五行: ${mainElement || '木'}\n`;
          prompt += `- 陰陽: ${yinYang || '陽'}\n`;
          
          // 四柱情報（存在する場合）
          if (fourPillars) {
            prompt += `\n【四柱】\n`;
            if (fourPillars.yearPillar) {
              prompt += `- 年柱: ${fourPillars.yearPillar.fullStemBranch || `${fourPillars.yearPillar.stem}${fourPillars.yearPillar.branch}`}\n`;
            }
            if (fourPillars.monthPillar) {
              prompt += `- 月柱: ${fourPillars.monthPillar.fullStemBranch || `${fourPillars.monthPillar.stem}${fourPillars.monthPillar.branch}`}\n`;
            }
            if (fourPillars.dayPillar) {
              prompt += `- 日柱: ${fourPillars.dayPillar.fullStemBranch || `${fourPillars.dayPillar.stem}${fourPillars.dayPillar.branch}`} (日主)\n`;
            }
            if (fourPillars.hourPillar) {
              prompt += `- 時柱: ${fourPillars.hourPillar.fullStemBranch || `${fourPillars.hourPillar.stem}${fourPillars.hourPillar.branch}`}\n`;
            }
          }
          
          // 十神関係（存在する場合）
          if (tenGods && Object.keys(tenGods).length > 0) {
            prompt += `\n【十神関係】\n`;
            Object.entries(tenGods).forEach(([key, value]) => {
              prompt += `- ${key}柱: ${value}\n`;
            });
          }
          
          // 地支十神関係（存在する場合）
          if (branchTenGods && Object.keys(branchTenGods).length > 0) {
            prompt += `\n【地支十神関係】\n`;
            Object.entries(branchTenGods).forEach(([key, value]) => {
              prompt += `- ${key}柱地支: ${value}\n`;
            });
          }
          
          // 個人目標（存在する場合）
          if (contextData.personalGoal) {
            prompt += `\n【個人目標】\n${contextData.personalGoal}\n`;
          }
          
          // チーム目標（存在する場合）
          if (contextData.teamGoals && contextData.teamGoals.length > 0) {
            prompt += `\n【チーム目標】\n`;
            contextData.teamGoals.forEach((team: any) => {
              prompt += `- ${team.name}: ${team.goal}\n`;
            });
          }
          
          prompt += `\nこの情報をもとに、ユーザーの質問に回答してください。四柱推命の原理に基づいた深い洞察と実用的なアドバイスを提供してください。特に、ユーザーの「日主」と十神関係を重視し、今日の運勢に合わせたアドバイスを心がけてください。`;
          
          return prompt;
        }
        
        // 四柱推命情報がない場合は基本的なプロンプトを返す
        return `デイリー運勢に基づく相談を受け付けます。本日の運勢は「${contextData.rating || '良好'}」で、「${contextData.sajuData?.mainElement || '木'}」の「${contextData.sajuData?.yinYang || '陽'}」が特徴です。${contextData.personalGoal ? `あなたの目標「${contextData.personalGoal}」も考慮します。` : ''}どのようなことでも相談してください。`;
      
      case 'team':
        return `チーム「${contextData.name || '未設定'}」に関する相談を受け付けます。${contextData.goal ? `チームの目標は「${contextData.goal}」です。` : ''}チームの状況や目標について何でもお尋ねください。`;
      
      case 'member':
        let memberPrompt = `メンバー「${contextData.name || '未設定'}」さんとの相性に関する相談を受け付けます。`;
        
        // メンバーの四柱推命情報を含める（存在する場合）
        if (contextData.sajuData && contextData.sajuData.mainElement && contextData.sajuData.yinYang) {
          memberPrompt += `メンバーの五行属性は「${contextData.sajuData.mainElement}」の「${contextData.sajuData.yinYang}」です。`;
        }
        
        memberPrompt += `コミュニケーションや協力関係について何でもお尋ねください。`;
        return memberPrompt;
      
      default:
        return '何かお手伝いできることはありますか？';
    }
  }

  /**
   * 文字列のタイプをConversationTypeに変換
   */
  private mapTypeToConversationType(type: string): ConversationType {
    switch (type) {
      case 'fortune':
        return ConversationType.FORTUNE;
      case 'team':
        return ConversationType.TEAM_CONSULTATION;
      case 'member':
        return ConversationType.TEAM_MEMBER;
      default:
        return ConversationType.GENERAL;
    }
  }
  
  /**
   * コンテキストデータを取得する関数
   * モックデータを実際のDBデータに置き換え
   */
  private async getContextData(type: string, userId: string, contextId: string): Promise<any> {
    try {
      switch (type) {
        case 'fortune':
          // 実際のユーザーデータを取得
          const user = await this.userRepository.findById(userId);
          if (!user) {
            throw new Error(`ユーザーが見つかりません: ${userId}`);
          }
          
          // 今日の日付を取得（YYYY-MM-DD形式）
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          // 今日の運勢情報を取得
          const dailyFortune = await this.fortuneRepository.findByUserIdAndDate(userId, today);
          
          // ユーザーが所属するチーム情報を取得
          const teams = await this.teamRepository.findByFilter({
            $or: [
              { ownerId: userId },
              { admins: userId },
              { 'members.userId': userId }
            ]
          });
          
          // チーム目標情報をマッピング
          const teamGoals = teams.map(team => ({
            id: team.id,
            name: team.name || '名称未設定チーム',
            goal: team.goal || '目標未設定'
          }));
          
          // 必要なデータを返す
          return {
            id: contextId,
            rating: dailyFortune?.rating || '良好',
            sajuData: user.sajuProfile,
            personalGoal: user.personalGoal,
            teamGoals
          };
          
        case 'team':
          // チームコンテキストの取得
          const team = await this.teamRepository.findById(contextId);
          if (!team) {
            throw new Error(`チーム ${contextId} が見つかりません`);
          }
          
          return {
            id: contextId,
            name: team.name || 'チーム',
            goal: team.goal || ''
          };
          
        case 'member':
          // メンバーコンテキストの取得
          const memberUser = await this.userRepository.findById(contextId);
          if (!memberUser) {
            throw new Error(`ユーザー ${contextId} が見つかりません`);
          }
          
          return {
            id: contextId,
            name: memberUser.name || 'メンバー',
            sajuData: memberUser.sajuProfile
          };
          
        default:
          return { id: contextId, name: '不明' };
      }
    } catch (error) {
      console.error(`コンテキストデータ取得エラー: ${error.message}`);
      // デフォルト値を返す
      return { id: contextId, error: error.message };
    }
  }
}