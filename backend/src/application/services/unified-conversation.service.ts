/**
 * 統合会話サービス 
 * 
 * direct-chatモジュールとconversation.serviceを統合し、シームレスな会話体験を提供します。
 * 機能:
 * - 四柱推命データを含むシステムメッセージの構築
 * - メッセージのリアルタイムストリーミング
 * - 会話履歴の永続化
 * - チーム/個人/運勢の各コンテキストでの会話サポート
 * 
 * 作成日: 2025/04/05
 */
import { injectable, inject } from 'tsyringe';
import { logger } from '../../utils/logger.util';
import { ConversationType } from '../../domain/entities/Conversation';
import { IAIService } from '../../infrastructure/external/IAIService';
import { SystemMessageBuilderService } from './system-message-builder.service';
import mongoose from 'mongoose';

/**
 * ストリーミングコールバックインターフェース
 */
export interface StreamingCallbacks {
  onStart?: (data: any) => void;
  onDelta?: (data: any) => void;
  onComplete?: (data: any) => void;
  onError?: (error: any) => void;
}

/**
 * 会話オプションインターフェース
 */
export interface ConversationOptions {
  streaming?: boolean;
  maxTokens?: number;
  model?: string;
  metadata?: any;
}

/**
 * 統合会話サービス
 * direct-chatモジュールとconversation.serviceを統合
 */
@injectable()
export class UnifiedConversationService {
  // ClaudeAIサービスの設定
  private CLAUDE_MODEL: string;
  private CLAUDE_API_URL: string;
  private isDebugMode: boolean;

  constructor(
    @inject('IConversationRepository') private conversationRepository: any,
    @inject('SystemMessageBuilderService') private systemMessageBuilder: SystemMessageBuilderService,
    @inject('IAIService') private aiService: IAIService,
    @inject('IUserRepository') private userRepository: any,
    @inject('IFortuneRepository') private fortuneRepository: any,
    @inject('ITeamRepository') private teamRepository: any
  ) {
    this.CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-3-7-sonnet-20250219';
    this.CLAUDE_API_URL = process.env.CLAUDE_API_URL || 'https://api.anthropic.com/v1/messages';
    this.isDebugMode = process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development';
    
    logger.info('統合会話サービスが初期化されました');
    
    if (this.isDebugMode) {
      logger.debug('デバッグモード有効');
      logger.debug(`使用モデル: ${this.CLAUDE_MODEL}`);
      logger.debug(`API URL: ${this.CLAUDE_API_URL}`);
    }
  }

  /**
   * 会話の初期化または継続
   * @param userId ユーザーID
   * @param type 会話タイプ (fortune, team, member)
   * @param contextId コンテキストID
   * @param options 会話オプション
   * @returns 会話データ
   */
  async initializeConversation(
    userId: string,
    type?: string,
    contextId?: string,
    options: ConversationOptions = {}
  ): Promise<any> {
    logger.debug(`会話初期化: userId=${userId}, type=${type}, contextId=${contextId}`);
    
    try {
      // コンテキストIDが指定されない場合はデフォルト値を使用
      const targetContextId = contextId || 'default';
      const conversationType = this.mapTypeToConversationType(type);
      
      // 今日の日付（00:00:00の時点）
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // 既存の会話を確認（同じ日に同じタイプ・コンテキストの会話）
      const existingConversation = await this.findConversationByContext(
        userId,
        type || 'general',
        targetContextId,
        today
      );
      
      // 既存の会話がある場合はそれを返す
      if (existingConversation) {
        logger.debug(`既存の会話を継続: ${existingConversation.id}`);
        return existingConversation;
      }
      
      // 新しい会話を作成するために必要なコンテキスト情報を取得
      const contextData = await this.getContextData(type, userId, targetContextId);
      
      if (!contextData || contextData.error) {
        const errorMessage = contextData?.error || 'コンテキストデータが見つかりません';
        logger.error(`会話コンテキスト取得エラー: ${errorMessage}`);
        throw new Error(errorMessage);
      }
      
      // システムメッセージを構築
      const systemMessage = await this.buildSystemMessage(type, userId, targetContextId);
      
      // 有効期限（翌日の0時）
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      // 新しい会話を作成
      const newConversation = await this.createConversation(
        userId,
        conversationType,
        systemMessage,
        {
          contextId: targetContextId,
          contextData,
          ...options.metadata
        },
        tomorrow
      );
      
      logger.debug(`新しい会話が作成されました: ${newConversation.id}`);
      
      return newConversation;
    } catch (error) {
      logger.error('会話初期化エラー:', error);
      throw error;
    }
  }

  /**
   * メッセージを送信する
   * @param userId ユーザーID
   * @param content メッセージ内容
   * @param type 会話タイプ
   * @param contextId コンテキストID
   * @param previousMessages 過去のメッセージ（オプション）
   * @param streamingCallbacks ストリーミングコールバック（オプション）
   * @param options 追加オプション（オプション）
   * @returns 会話データまたはストリーミングコントローラー
   */
  async sendMessage(
    userId: string,
    content: string,
    type?: string,
    contextId?: string,
    previousMessages: any[] = [],
    streamingCallbacks?: StreamingCallbacks,
    options: ConversationOptions = {}
  ): Promise<any> {
    logger.debug(`メッセージ送信: userId=${userId}, type=${type}, contextId=${contextId}`);
    
    try {
      // ストリーミングモードが有効かどうか
      const useStreaming = !!streamingCallbacks;
      
      // 会話を初期化/取得
      const conversation = await this.initializeConversation(userId, type, contextId, options);
      
      if (!conversation) {
        throw new Error('会話の初期化に失敗しました');
      }
      
      // 会話IDを取得
      const conversationId = conversation.id;
      
      // ユーザーメッセージをフォーマット
      const userMessage = {
        id: this.generateId('msg'),
        role: 'user',
        content,
        metadata: {},
        createdAt: new Date()
      };
      
      // 会話に追加
      conversation.messages.push(userMessage);
      
      // 前回までの会話履歴を取得
      const messageHistory = previousMessages.length > 0
        ? previousMessages.map((msg: { sender: string; content: string }) => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.content
          }))
        : conversation.messages.map((msg: { role: string; content: string }) => ({
            role: msg.role,
            content: msg.content
          }));
      
      // システムメッセージが存在するか確認し、ない場合は追加
      const hasSystemMessage = messageHistory.some((msg: { role: string }) => msg.role === 'system');
      
      if (!hasSystemMessage && conversation.messages.length > 0 && conversation.messages[0].role === 'system') {
        // 先頭にシステムメッセージを追加
        messageHistory.unshift({
          role: 'system',
          content: conversation.messages[0].content
        });
      }
      
      // APIに送信するメッセージの最終確認
      this.logMessageFlow(messageHistory);
      
      // ストリーミングモードの場合
      if (useStreaming) {
        // 会話を保存（ユーザーメッセージのみ）
        conversation.updatedAt = new Date();
        await this.conversationRepository.update(conversationId, conversation);
        
        // ストリーミングハンドラーを作成
        return this.handleStreamingResponse(
          conversationId,
          messageHistory,
          streamingCallbacks,
          options
        );
      }
      
      // 非ストリーミングモード: AIサービスに送信
      const aiResponse = await this.aiService.sendMessage(messageHistory, {
        model: options.model || this.CLAUDE_MODEL,
        maxTokens: options.maxTokens || 1000
      });
      
      // AIレスポンスが正常に取得できたか確認
      if (!aiResponse || !aiResponse.content) {
        logger.error('AI応答生成エラー:', aiResponse);
        throw new Error('AIからの応答を取得できませんでした');
      }
      
      // AIメッセージを作成
      const aiMessage = {
        id: this.generateId('msg'),
        role: 'assistant',
        content: typeof aiResponse.content === 'string' 
          ? aiResponse.content 
          : aiResponse.content[0]?.text || 'レスポンスをパースできませんでした',
        metadata: {},
        createdAt: new Date()
      };
      
      // 会話に追加
      conversation.messages.push(aiMessage);
      
      // 会話を保存
      conversation.updatedAt = new Date();
      await this.conversationRepository.update(conversationId, conversation);
      
      // 更新された会話を返す
      return await this.conversationRepository.findById(conversationId);
    } catch (error) {
      logger.error('メッセージ送信エラー:', error);
      throw error;
    }
  }

  /**
   * ストリーミングレスポンスを処理する
   * @param conversationId 会話ID
   * @param messages メッセージ履歴
   * @param callbacks コールバック関数
   * @param options 追加オプション
   * @returns ストリーミングコントローラー
   */
  private async handleStreamingResponse(
    conversationId: string,
    messages: Array<{role: string, content: string}>,
    callbacks: StreamingCallbacks,
    options: ConversationOptions = {}
  ): Promise<any> {
    logger.debug(`ストリーミングレスポンス処理開始: conversationId=${conversationId}`);
    
    // 累積レスポンステキスト
    let accumulatedResponse = '';
    let isComplete = false;
    let controller = { cancel: () => {} };
    
    try {
      // AIサービスにリクエストを送信（カスタムコールバック付き）
      const customCallbacks = {
        onStart: (data: any) => {
          logger.debug('ストリーミング開始');
          if (callbacks.onStart) callbacks.onStart(data);
        },
        
        onDelta: (data: any) => {
          const textDelta = data?.delta || '';
          accumulatedResponse += textDelta;
          
          if (callbacks.onDelta) callbacks.onDelta({
            ...data,
            accumulatedText: accumulatedResponse
          });
        },
        
        onComplete: async (data: any) => {
          logger.debug('ストリーミング完了');
          isComplete = true;
          
          try {
            // 会話を取得して更新
            const conversation = await this.conversationRepository.findById(conversationId);
            
            if (conversation) {
              // AIメッセージを作成
              const aiMessage = {
                id: this.generateId('msg'),
                role: 'assistant',
                content: accumulatedResponse,
                metadata: {},
                createdAt: new Date()
              };
              
              // 会話に追加
              conversation.messages.push(aiMessage);
              
              // 会話を保存
              conversation.updatedAt = new Date();
              await this.conversationRepository.update(conversationId, conversation);
              
              logger.debug(`会話が更新されました: ${conversationId}`);
            } else {
              logger.error(`会話ID ${conversationId} が見つかりません`);
            }
          } catch (saveError) {
            logger.error('会話保存エラー:', saveError);
          }
          
          if (callbacks.onComplete) callbacks.onComplete({
            ...data,
            fullText: accumulatedResponse
          });
        },
        
        onError: (error: any) => {
          logger.error('ストリーミングエラー:', error);
          
          // エラー時にも会話を保存する
          this.saveErrorResponse(conversationId, error)
            .catch(saveError => logger.error('エラーレスポンス保存エラー:', saveError));
          
          if (callbacks.onError) callbacks.onError(error);
        }
      };
      
      // 擬似的なストリーミングコントローラーを作成
      controller = {
        cancel: () => {
          logger.debug('ストリーミングキャンセル要求');
          if (!isComplete) {
            // キャンセル時の処理（現在のところ実装なし）
            logger.debug('ストリーミングがキャンセルされました');
          }
        }
      };
      
      // モック応答を送信（実際の実装では、外部AIサービスを呼び出す）
      // 注: 実際のストリーミング実装は、サーバ側のイベントやWebSocketなどを使用します
      this.mockStreamingResponse(messages, customCallbacks, options);
      
      return controller;
    } catch (error) {
      logger.error('ストリーミング処理エラー:', error);
      
      if (callbacks.onError) {
        callbacks.onError(error);
      }
      
      // エラー時にも会話を保存する
      this.saveErrorResponse(conversationId, error)
        .catch(saveError => logger.error('エラーレスポンス保存エラー:', saveError));
      
      return controller;
    }
  }
  
  /**
   * モックストリーミングレスポンスを生成
   * @param messages メッセージ履歴
   * @param callbacks コールバック関数
   * @param options 追加オプション
   */
  private mockStreamingResponse(
    messages: Array<{role: string, content: string}>,
    callbacks: StreamingCallbacks,
    options: ConversationOptions = {}
  ): void {
    // モックレスポンスのテキスト
    const fullResponse = `はい、お手伝いします。今日の運勢に基づく相談にお答えします。

本日は木の五行が強調され、創造性や成長に適した日です。特に「比肩」の十神関係が影響しており、協力や調和を大切にする日となります。

今日の過ごし方として、以下をお勧めします:
1. チームでの協力作業に力を入れると良い結果が得られます
2. 新しいアイデアを形にする行動を始めるのに適しています
3. 自然に触れることで、さらに運気が高まります

日主の日柱と今日の地支十神関係は調和的で、特に午後から夕方にかけて運気が高まります。ぜひ前向きな姿勢で今日一日を過ごしてみてください。`;
    
    // 開始を通知
    if (callbacks.onStart) {
      callbacks.onStart({
        status: 'started',
        data: {
          type: options.metadata?.type || 'fortune',
          contextId: options.metadata?.contextId || 'default'
        }
      });
    }
    
    // テキストを小さな塊に分割して送信
    const chunks = fullResponse.split(' ').map(word => word + ' ');
    
    // 各チャンクを順番に送信
    let index = 0;
    
    const sendNextChunk = () => {
      if (index < chunks.length) {
        const chunk = chunks[index];
        index++;
        
        // デルタを送信
        if (callbacks.onDelta) {
          callbacks.onDelta({
            data: {
              delta: chunk
            }
          });
        }
        
        // 次のチャンクを送信（100ms間隔）
        setTimeout(sendNextChunk, 100);
      } else {
        // 完了を通知
        if (callbacks.onComplete) {
          callbacks.onComplete({
            status: 'completed',
            data: {
              usage: {
                prompt_tokens: 250,
                completion_tokens: fullResponse.length / 4
              }
            }
          });
        }
      }
    };
    
    // 最初のチャンクを送信
    sendNextChunk();
  }

  /**
   * エラー発生時にエラーメッセージを会話に保存
   * @param conversationId 会話ID
   * @param error エラー
   */
  private async saveErrorResponse(conversationId: string, error: any): Promise<void> {
    try {
      // 会話を取得
      const conversation = await this.conversationRepository.findById(conversationId);
      
      if (!conversation) {
        logger.error(`会話ID ${conversationId} が見つかりません`);
        return;
      }
      
      // エラーメッセージを作成
      const errorMessage = {
        id: this.generateId('msg'),
        role: 'assistant',
        content: 'すみません、現在AIサービスからの応答を取得できません。再度お試しいただくか、少し時間をおいてからお試しください。',
        metadata: { error: true, message: error instanceof Error ? error.message : '不明なエラー' },
        createdAt: new Date()
      };
      
      // 会話に追加
      conversation.messages.push(errorMessage);
      
      // 会話を保存
      conversation.updatedAt = new Date();
      await this.conversationRepository.update(conversationId, conversation);
      
      logger.debug(`エラーメッセージが保存されました: ${conversationId}`);
    } catch (error) {
      logger.error('エラーレスポンス保存中にエラーが発生しました:', error);
    }
  }

  /**
   * システムメッセージを構築する
   * @param type 会話タイプ
   * @param userId ユーザーID
   * @param contextId コンテキストID
   * @returns システムメッセージ
   */
  private async buildSystemMessage(
    type?: string,
    userId?: string,
    contextId?: string
  ): Promise<string> {
    try {
      if (!userId) {
        return 'どのようにお手伝いできますか？';
      }
      
      let context;
      
      // 会話タイプに応じてコンテキストを構築
      switch (type) {
        case 'fortune':
          context = await this.systemMessageBuilder.buildFortuneContextFromUserId(userId);
          break;
          
        case 'team':
          context = await this.systemMessageBuilder.buildTeamContextFromUserId(userId, contextId || '');
          break;
          
        case 'management':
          context = await this.systemMessageBuilder.buildManagementContextFromUserId(userId, contextId || '');
          break;
          
        default:
          // デフォルトのコンテキスト（一般的な会話）
          return 'お手伝いできることはありますか？';
      }
      
      if (!context) {
        logger.warn(`コンテキスト構築失敗: type=${type}, userId=${userId}, contextId=${contextId}`);
        return `${type || '一般'}に関する相談を受け付けます。どのようなことでも相談してください。`;
      }
      
      // SystemMessageBuilderサービスを使ってシステムメッセージを構築
      return this.systemMessageBuilder.buildSystemMessage(context);
    } catch (error) {
      logger.error('システムメッセージ構築エラー:', error);
      return `${type || '一般'}に関する相談を受け付けます。どのようなことでも相談してください。`;
    }
  }

  /**
   * ユニークIDを生成するヘルパー
   * @param prefix プレフィックス
   * @returns ユニークID
   */
  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  }
  
  /**
   * コンテキスト情報に基づいて会話を検索
   * 同じ日のデータのみを対象とする
   */
  async findConversationByContext(
    userId: string,
    type: string,
    contextId: string,
    dateAfter: Date
  ): Promise<any | null> {
    logger.debug(`コンテキストに基づく会話検索: userId=${userId}, type=${type}, contextId=${contextId}`);
    
    try {
      // MongoDBリポジトリのクエリを使用して会話を検索
      const conversations = await this.conversationRepository.findByCondition({
        userId: userId,
        type: this.mapTypeToConversationType(type),
        'metadata.contextId': contextId,
        createdAt: { $gte: dateAfter }
      });
      
      // 該当する会話があれば最初のものを返す
      if (conversations && conversations.length > 0) {
        return conversations[0];
      }
      
      return null;
    } catch (error) {
      logger.error('会話検索エラー:', error);
      return null;
    }
  }
  
  /**
   * 新しい会話を作成
   */
  async createConversation(
    userId: string,
    type: ConversationType,
    initialSystemMessage: string,
    metadata: any = {},
    expiresAt: Date | null = null
  ): Promise<any> {
    logger.debug(`会話作成: userId=${userId}, type=${type}`);
    
    // システムメッセージを作成
    const systemMessage = {
      id: this.generateId('msg'),
      role: 'system',
      content: initialSystemMessage,
      metadata: {},
      createdAt: new Date()
    };
    
    // 新しい会話オブジェクト
    const conversation = {
      userId,
      type,
      messages: [systemMessage],
      metadata,
      isArchived: false,
      createdAt: new Date(),
      expiresAt
    };
    
    try {
      // MongoDBリポジトリを使用して会話を保存
      return await this.conversationRepository.create(conversation);
    } catch (error) {
      logger.error('会話作成エラー:', error);
      throw error;
    }
  }
  
  /**
   * 会話IDに基づいて会話を取得
   */
  async getConversationById(
    conversationId: string,
    userId: string
  ): Promise<any> {
    logger.debug(`会話取得: id=${conversationId}, userId=${userId}`);
    
    const conversation = await this.conversationRepository.findById(conversationId);
    
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    
    if (conversation.userId !== userId) {
      throw new Error('Unauthorized access to conversation');
    }
    
    return conversation;
  }
  
  /**
   * ユーザーIDに基づいて会話一覧を取得
   */
  async getConversationsByUserId(
    userId: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<any[]> {
    logger.debug(`ユーザーの会話一覧取得: userId=${userId}`);
    
    try {
      const query = { userId };
      const { limit = 20, offset = 0 } = options;
      
      return await this.conversationRepository.findWithPagination(query, offset, limit);
    } catch (error) {
      logger.error('会話一覧取得エラー:', error);
      throw error;
    }
  }
  
  /**
   * 会話を削除
   */
  async deleteConversation(conversationId: string, userId: string): Promise<boolean> {
    logger.debug(`会話削除: id=${conversationId}, userId=${userId}`);
    
    // 会話を取得して権限チェック
    const conversation = await this.conversationRepository.findById(conversationId);
    
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    
    if (conversation.userId !== userId) {
      throw new Error('Unauthorized access to conversation');
    }
    
    // 論理削除（アーカイブフラグをセット）
    conversation.isArchived = true;
    conversation.updatedAt = new Date();
    
    await this.conversationRepository.update(conversationId, conversation);
    
    return true;
  }
  
  /**
   * メッセージフローをログ出力
   * @param messages メッセージ配列
   */
  private logMessageFlow(messages: Array<{role: string, content: string}>): void {
    if (!this.isDebugMode) return;
    
    logger.debug('====== メッセージフローを確認します ======');
    logger.debug(`メッセージ数: ${messages.length}`);
    
    const hasSystemMessage = messages.some(m => m.role === 'system');
    logger.debug(`システムメッセージの有無: ${hasSystemMessage ? 'あり' : 'なし'}`);
    
    if (messages.length > 0) {
      logger.debug(`先頭メッセージのロール: ${messages[0].role}`);
      
      if (messages[0].role === 'system') {
        logger.debug('正常: システムメッセージが先頭にあります');
      } else if (hasSystemMessage) {
        logger.debug('警告: システムメッセージが先頭にありません');
      }
    }
    
    logger.debug('========================================');
  }
  
  /**
   * 文字列のタイプをConversationTypeに変換
   */
  private mapTypeToConversationType(type?: string): ConversationType {
    switch (type) {
      case 'fortune':
        return ConversationType.FORTUNE;
      case 'team':
        return ConversationType.TEAM_CONSULTATION;
      case 'member':
        return ConversationType.TEAM_MEMBER;
      case 'management':
        // MANAGEMENT定義がないのでGENERALを使用
        return ConversationType.GENERAL;
      default:
        return ConversationType.GENERAL;
    }
  }
  
  /**
   * コンテキストデータを取得する関数
   * @param type 会話タイプ
   * @param userId ユーザーID
   * @param contextId コンテキストID
   */
  private async getContextData(type?: string, userId?: string, contextId?: string): Promise<any> {
    if (!userId) {
      return { id: contextId || 'default' };
    }
    
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
            id: contextId || 'default',
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
          return { id: contextId || 'default', name: '一般会話' };
      }
    } catch (error) {
      logger.error(`コンテキストデータ取得エラー: ${error instanceof Error ? error.message : '不明なエラー'}`);
      return { id: contextId || 'default', error: error instanceof Error ? error.message : '不明なエラー' };
    }
  }
}