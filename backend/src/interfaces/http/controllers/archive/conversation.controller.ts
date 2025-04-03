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
    @inject('DailyFortuneService') private fortuneService: DailyFortuneService
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
      
      // コンテキスト情報取得（モックデータ使用）
      console.log('モックデータを直接使用します');
      let contextData;
      
      try {
        // タイプに応じたモックデータ
        switch (type) {
          case 'fortune':
            contextData = { 
              id: contextId, 
              rating: '良好', 
              sajuData: { 
                mainElement: '木', 
                yinYang: '陽' 
              } 
            };
            break;
          case 'team':
            contextData = { id: contextId, name: 'チーム' };
            break;
          case 'member':
            contextData = { id: contextId, name: 'メンバー' };
            break;
          default:
            contextData = { id: contextId, name: '不明' };
        }
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
        { contextId },
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
        return `デイリー運勢に基づく相談を受け付けます。本日の運勢は「${contextData.rating || '良好'}」で、「${contextData.sajuData?.mainElement || '木'}」の「${contextData.sajuData?.yinYang || '陽'}」が特徴です。どのようなことでも相談してください。`;
      
      case 'team':
        return `チーム「${contextData.name}」に関する相談を受け付けます。チームの状況や目標について何でもお尋ねください。`;
      
      case 'member':
        return `メンバー「${contextData.name}」さんとの相性に関する相談を受け付けます。コミュニケーションや協力関係について何でもお尋ねください。`;
      
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
}