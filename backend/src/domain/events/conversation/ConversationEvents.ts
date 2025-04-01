/**
 * ConversationEvents
 * 会話ドメインのイベント
 * 
 * 変更履歴:
 * - 2025/3/30: 初期実装 (Claude)
 */

import { DomainEvent } from '../shared/DomainEvent';

/**
 * 会話作成イベント
 */
export class ConversationCreatedEvent extends DomainEvent {
  /**
   * コンストラクタ
   * @param conversationId 会話ID
   * @param userId ユーザーID
   * @param contextData 会話コンテキストデータ
   */
  constructor(
    public readonly conversationId: string,
    public readonly userId: string,
    public readonly contextData?: {
      fortuneId?: string;
      teamId?: string;
      relatedGoalId?: string;
      initialPrompt?: string;
    }
  ) {
    super('conversation.created', {
      source: {
        entityType: 'Conversation',
        entityId: conversationId,
        userId: userId
      }
    });
  }

  /**
   * イベントのペイロードを取得
   */
  getPayload(): any {
    return {
      conversationId: this.conversationId,
      userId: this.userId,
      contextData: this.contextData
    };
  }
}

/**
 * メッセージ追加イベント
 */
export class MessageAddedEvent extends DomainEvent {
  /**
   * コンストラクタ
   * @param conversationId 会話ID
   * @param messageId メッセージID
   * @param userId ユーザーID
   * @param content メッセージ内容
   * @param isUserMessage ユーザーメッセージかどうか
   * @param metadata メタデータ
   */
  constructor(
    public readonly conversationId: string,
    public readonly messageId: string,
    public readonly userId: string,
    public readonly content: string,
    public readonly isUserMessage: boolean,
    public readonly metadata?: Record<string, any>
  ) {
    super('conversation.message.added', {
      source: {
        entityType: 'Conversation',
        entityId: conversationId,
        userId: userId
      }
    });
  }

  /**
   * イベントのペイロードを取得
   */
  getPayload(): any {
    return {
      conversationId: this.conversationId,
      messageId: this.messageId,
      userId: this.userId,
      content: this.content,
      isUserMessage: this.isUserMessage,
      timestamp: this.occurredAt.toISOString(),
      metadata: this.metadata
    };
  }
}

/**
 * 感情分析結果イベント
 */
export class SentimentAnalyzedEvent extends DomainEvent {
  /**
   * コンストラクタ
   * @param conversationId 会話ID
   * @param messageId メッセージID
   * @param userId ユーザーID
   * @param sentiment 感情スコア情報
   */
  constructor(
    public readonly conversationId: string,
    public readonly messageId: string,
    public readonly userId: string,
    public readonly sentiment: {
      score: number; // -1.0 〜 1.0
      magnitude?: number; // 0.0 〜 ⇬
      categories?: { name: string; confidence: number; }[];
      entities?: { name: string; type: string; sentiment: number; }[];
    }
  ) {
    super('conversation.sentiment.analyzed', {
      source: {
        entityType: 'Conversation',
        entityId: conversationId,
        userId: userId
      }
    });
  }

  /**
   * イベントのペイロードを取得
   */
  getPayload(): any {
    return {
      conversationId: this.conversationId,
      messageId: this.messageId,
      userId: this.userId,
      sentiment: this.sentiment
    };
  }
}

/**
 * 五行属性タグ付けイベント
 */
export class ElementalTaggingEvent extends DomainEvent {
  /**
   * コンストラクタ
   * @param conversationId 会話ID
   * @param messageId メッセージID
   * @param userId ユーザーID
   * @param elementalAttributes 五行属性情報
   */
  constructor(
    public readonly conversationId: string,
    public readonly messageId: string,
    public readonly userId: string,
    public readonly elementalAttributes: {
      element?: string; // 木、火、土、金、水
      yinYang?: 'yin' | 'yang';
      intensity?: number; // 0-100
      keywords?: string[];
    }
  ) {
    super('conversation.elemental.tagged', {
      source: {
        entityType: 'Conversation',
        entityId: conversationId,
        userId: userId
      }
    });
  }

  /**
   * イベントのペイロードを取得
   */
  getPayload(): any {
    return {
      conversationId: this.conversationId,
      messageId: this.messageId,
      userId: this.userId,
      elementalAttributes: this.elementalAttributes
    };
  }
}

/**
 * 会話終了イベント
 */
export class ConversationEndedEvent extends DomainEvent {
  /**
   * コンストラクタ
   * @param conversationId 会話ID
   * @param userId ユーザーID
   * @param messageCount 全メッセージ数
   * @param duration 会話の所要時間（ミリ秒）
   * @param summary 会話の要約（オプション）
   */
  constructor(
    public readonly conversationId: string,
    public readonly userId: string,
    public readonly messageCount: number,
    public readonly duration: number,
    public readonly summary?: string
  ) {
    super('conversation.ended', {
      source: {
        entityType: 'Conversation',
        entityId: conversationId,
        userId: userId
      }
    });
  }

  /**
   * イベントのペイロードを取得
   */
  getPayload(): any {
    return {
      conversationId: this.conversationId,
      userId: this.userId,
      messageCount: this.messageCount,
      duration: this.duration,
      summary: this.summary
    };
  }
}