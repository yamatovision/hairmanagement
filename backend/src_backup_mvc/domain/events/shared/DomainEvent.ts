/**
 * DomainEvent
 * すべてのドメインイベントの基底クラス
 * 
 * 変更履歴:
 * - 2025/3/30: 初期実装 (Claude)
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * ドメインイベントのメタデータタイプ
 */
export interface DomainEventMetadata {
  /**
   * イベント発生元のコンテキスト情報
   */
  source?: {
    /**
     * イベントを発生させたエンティティの種類
     */
    entityType?: string;
    
    /**
     * イベントを発生させたエンティティのID
     */
    entityId?: string;
    
    /**
     * イベントをトリガーしたユーザーID
     */
    userId?: string;
  },
  
  /**
   * イベントメッセージのトラッキング情報
   */
  tracking?: {
    /**
     * 相関イベントID
     */
    correlationId?: string;
    
    /**
     * 回数（再送の場合に増加）
     */
    attempt?: number;
  }
}

/**
 * ドメインイベントのシリアライズ用インターフェース
 */
export interface SerializedDomainEvent {
  eventId: string;
  eventType: string;
  occurredAt: string; // ISO形式の日付文字列
  metadata?: DomainEventMetadata;
  payload: any;
}

/**
 * すべてのドメインイベントの基底クラス
 */
export abstract class DomainEvent {
  readonly eventId: string;
  readonly occurredAt: Date;
  readonly metadata?: DomainEventMetadata;

  /**
   * ドメインイベントコンストラクタ
   * @param eventType イベントの種類
   * @param metadata イベントメタデータ（オプション）
   */
  constructor(
    public readonly eventType: string,
    metadata?: DomainEventMetadata
  ) {
    this.eventId = uuidv4();
    this.occurredAt = new Date();
    this.metadata = metadata;
  }

  /**
   * イベントのペイロードを取得
   * 各イベントクラスでオーバーライドする必要があります
   */
  abstract getPayload(): any;

  /**
   * イベントをシリアライズ
   */
  serialize(): SerializedDomainEvent {
    return {
      eventId: this.eventId,
      eventType: this.eventType,
      occurredAt: this.occurredAt.toISOString(),
      metadata: this.metadata,
      payload: this.getPayload()
    };
  }

  /**
   * シリアライズされたイベントをJSON文字列に変換
   */
  toJSON(): string {
    return JSON.stringify(this.serialize());
  }
}