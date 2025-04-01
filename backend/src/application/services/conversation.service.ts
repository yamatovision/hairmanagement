import { injectable, inject } from 'tsyringe';
import { logger } from '../../utils/logger.util';
import { ConversationType, Message as ConversationMessage } from '../../domain/entities/Conversation';

// モックデータの型
interface MockMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata: any;
  createdAt: Date;
}

interface MockConversation {
  id: string;
  userId: string;
  type: ConversationType;
  messages: MockMessage[];
  isArchived: boolean;
  createdAt: Date;
}

/**
 * 会話サービス
 * AI対話に関する機能を提供
 */
@injectable()
export class ConversationService {
  constructor(
    // モック実装のためにDIは使わない
  ) {
    logger.info('ConversationService initialized');
  }

  /**
   * 会話の作成または続行
   */
  async createOrContinueConversation(
    userId: string,
    type: ConversationType,
    content: string,
    metadata: any = {}
  ): Promise<MockConversation> {
    logger.info(`Creating new conversation for user ${userId}, type: ${type}`);
    
    // モックレスポンスを作成
    const newMessage: MockMessage = {
      id: this.generateId('msg'),
      role: 'user',
      content,
      metadata,
      createdAt: new Date()
    };
    
    const aiResponse: MockMessage = {
      id: this.generateId('msg'),
      role: 'assistant',
      content: `これはモックレスポンスです。あなたのメッセージ: "${content}"`,
      metadata: {},
      createdAt: new Date()
    };
    
    const conversation: MockConversation = {
      id: this.generateId('conv'),
      userId,
      type,
      messages: [newMessage, aiResponse],
      isArchived: false,
      createdAt: new Date()
    };
    
    return conversation;
  }
  
  /**
   * 会話にメッセージを追加
   */
  async sendMessage(
    conversationId: string,
    userId: string,
    content: string
  ): Promise<MockConversation> {
    logger.info(`Adding message to conversation ${conversationId}`);
    
    const newMessage: MockMessage = {
      id: this.generateId('msg'),
      role: 'user',
      content,
      metadata: {},
      createdAt: new Date()
    };
    
    const aiResponse: MockMessage = {
      id: this.generateId('msg'),
      role: 'assistant',
      content: `これは続きのモックレスポンスです。あなたのメッセージ: "${content}"`,
      metadata: {},
      createdAt: new Date()
    };
    
    const conversation: MockConversation = {
      id: conversationId,
      userId,
      type: ConversationType.GENERAL,
      messages: [newMessage, aiResponse],
      isArchived: false,
      createdAt: new Date()
    };
    
    return conversation;
  }
  
  /**
   * ユーザーの会話一覧を取得
   */
  async getConversations(
    userId: string,
    limit: number = 10,
    includeArchived: boolean = false
  ): Promise<MockConversation[]> {
    logger.info(`Getting conversations for user ${userId}`);
    
    // モックデータを返す
    return [
      {
        id: this.generateId('conv'),
        userId,
        type: ConversationType.GENERAL,
        messages: [
          {
            id: this.generateId('msg'),
            role: 'user',
            content: 'こんにちは',
            metadata: {},
            createdAt: new Date(Date.now() - 10000)
          },
          {
            id: this.generateId('msg'),
            role: 'assistant',
            content: 'こんにちは、どうしましたか？',
            metadata: {},
            createdAt: new Date(Date.now() - 5000)
          }
        ],
        isArchived: false,
        createdAt: new Date(Date.now() - 15000)
      }
    ];
  }
  
  /**
   * 特定の会話を取得
   */
  async getConversationById(
    conversationId: string,
    userId: string
  ): Promise<MockConversation> {
    logger.info(`Getting conversation ${conversationId} for user ${userId}`);
    
    // モックデータを返す
    return {
      id: conversationId,
      userId,
      type: ConversationType.GENERAL,
      messages: [
        {
          id: this.generateId('msg'),
          role: 'user',
          content: 'こんにちは',
          metadata: {},
          createdAt: new Date(Date.now() - 10000)
        },
        {
          id: this.generateId('msg'),
          role: 'assistant',
          content: 'こんにちは、どうしましたか？',
          metadata: {},
          createdAt: new Date(Date.now() - 5000)
        }
      ],
      isArchived: false,
      createdAt: new Date(Date.now() - 15000)
    };
  }
  
  /**
   * 会話をアーカイブ
   */
  async archiveConversation(
    conversationId: string,
    userId: string
  ): Promise<boolean> {
    logger.info(`Archiving conversation ${conversationId} for user ${userId}`);
    return true; // モック成功
  }
  
  /**
   * メッセージをお気に入り登録
   */
  async toggleFavoriteMessage(
    messageId: string,
    userId: string
  ): Promise<boolean> {
    logger.info(`Toggling favorite for message ${messageId} by user ${userId}`);
    return true; // モック:お気に入り追加成功
  }
  
  /**
   * 呼び水質問の生成
   */
  async generatePromptQuestion(
    userId: string,
    fortuneId?: string
  ): Promise<string> {
    logger.info(`Generating prompt question for user ${userId}, fortune: ${fortuneId || 'none'}`);
    
    // いくつかのサンプル質問
    const sampleQuestions = [
      '今日のチームマネジメントで一番難しかったことは何ですか？',
      '今週のプロジェクトで成功した点は何だと思いますか？',
      '部下へのフィードバックで気をつけていることはありますか？',
      '最近チームメンバーとの相性で気になることはありますか？',
      'リーダーシップを発揮する上で大切にしている価値観は何ですか？'
    ];
    
    // ランダムに質問を選択
    const randomIndex = Math.floor(Math.random() * sampleQuestions.length);
    return sampleQuestions[randomIndex];
  }
  
  /**
   * チームメンバー相性チャットの開始
   */
  async startTeamMemberChat(
    userId: string,
    targetMemberId: string
  ): Promise<MockConversation> {
    logger.info(`Starting team member compatibility chat for user ${userId} with member ${targetMemberId}`);
    
    const userMessage: MockMessage = {
      id: this.generateId('msg'),
      role: 'user',
      content: `[システム] ユーザーIDが ${userId} のユーザーが、ユーザーIDが ${targetMemberId} のメンバーとの相性について会話を開始しました。`,
      metadata: { autoGenerated: true },
      createdAt: new Date()
    };
    
    const aiResponse: MockMessage = {
      id: this.generateId('msg'),
      role: 'assistant',
      content: `チームメンバーとの相性に関する質問にお答えします。どのような点について知りたいですか？例えば、コミュニケーションスタイルの違いや、協力してプロジェクトを進める際のアドバイスなどをお伝えできます。`,
      metadata: {},
      createdAt: new Date()
    };
    
    return {
      id: this.generateId('conv'),
      userId,
      type: ConversationType.TEAM_COMPATIBILITY,
      messages: [userMessage, aiResponse],
      isArchived: false,
      createdAt: new Date()
    };
  }
  
  /**
   * フォーチュンチャットの開始
   */
  async startFortuneChat(
    userId: string,
    fortune: any
  ): Promise<MockConversation> {
    logger.info(`Starting fortune chat for user ${userId} with fortune ${fortune.id}`);
    
    const userMessage: MockMessage = {
      id: this.generateId('msg'),
      role: 'user',
      content: `[システム] ユーザーIDが ${userId} のユーザーが、運勢IDが ${fortune.id} の運勢について会話を開始しました。`,
      metadata: { autoGenerated: true },
      createdAt: new Date()
    };
    
    const aiResponse: MockMessage = {
      id: this.generateId('msg'),
      role: 'assistant',
      content: `今日の運勢は「${fortune.rating}」です。\n\n${fortune.advice}\n\n何か具体的に気になることはありますか？`,
      metadata: {},
      createdAt: new Date()
    };
    
    return {
      id: this.generateId('conv'),
      userId,
      type: ConversationType.FORTUNE,
      messages: [userMessage, aiResponse],
      isArchived: false,
      createdAt: new Date()
    };
  }
  
  // ヘルパーメソッド
  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}