/**
 * EventStore
 * ドメインイベントの永続化と取得を行うイベントストア
 * 
 * 変更履歴:
 * - 2025/3/30: 初期実装 (Claude)
 */

import { injectable } from 'tsyringe';
import { DomainEvent, SerializedDomainEvent } from '../../domain/events/shared/DomainEvent';
import { logger } from '../../utils/logger.util';

/**
 * イベントストアのインターフェース
 */
export interface IEventStore {
  /**
   * イベントを保存
   * @param event 保存するドメインイベント
   */
  saveEvent<T extends DomainEvent>(event: T): Promise<void>;
  
  /**
   * 複数のイベントを保存
   * @param events 保存するドメインイベントの配列
   */
  saveEvents(events: DomainEvent[]): Promise<void>;
  
  /**
   * 特定のイベントタイプのイベントを取得
   * @param eventType イベントタイプ
   * @param fromDate 取得開始日時
   * @param toDate 取得終了日時
   */
  getEventsByType(eventType: string, fromDate?: Date, toDate?: Date): Promise<SerializedDomainEvent[]>;
  
  /**
   * エンティティIDに関連するイベントを取得
   * @param entityType エンティティの種類
   * @param entityId エンティティID
   * @param fromDate 取得開始日時
   * @param toDate 取得終了日時
   */
  getEventsByEntity(entityType: string, entityId: string, fromDate?: Date, toDate?: Date): Promise<SerializedDomainEvent[]>;
  
  /**
   * 複数の条件でイベントを検索
   * @param criteria 検索条件
   */
  findEvents(criteria: EventSearchCriteria): Promise<SerializedDomainEvent[]>;
}

/**
 * イベント検索条件の型定義
 */
export interface EventSearchCriteria {
  eventTypes?: string[];
  entityTypes?: string[];
  entityIds?: string[];
  userIds?: string[];
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  offset?: number;
  correlationId?: string;
}

/**
 * インメモリ実装のイベントストア
 * 主に開発とテスト用。本番環境ではデータベース実装を使用することを推奨。
 */
@injectable()
export class InMemoryEventStore implements IEventStore {
  private events: SerializedDomainEvent[] = [];
  
  /**
   * イベントを保存
   * @param event 保存するドメインイベント
   */
  async saveEvent<T extends DomainEvent>(event: T): Promise<void> {
    this.events.push(event.serialize());
    logger.debug(`イベントを保存しました: ${event.eventType}`, { eventId: event.eventId });
  }
  
  /**
   * 複数のイベントを保存
   * @param events 保存するドメインイベントの配列
   */
  async saveEvents(events: DomainEvent[]): Promise<void> {
    this.events.push(...events.map(event => event.serialize()));
    logger.debug(`${events.length}件のイベントを保存しました`);
  }
  
  /**
   * 特定のイベントタイプのイベントを取得
   * @param eventType イベントタイプ
   * @param fromDate 取得開始日時
   * @param toDate 取得終了日時
   */
  async getEventsByType(eventType: string, fromDate?: Date, toDate?: Date): Promise<SerializedDomainEvent[]> {
    return this.events.filter(event => {
      // イベントタイプが一致
      if (event.eventType !== eventType) return false;
      
      // 開始日時フィルター
      if (fromDate && new Date(event.occurredAt) < fromDate) return false;
      
      // 終了日時フィルター
      if (toDate && new Date(event.occurredAt) > toDate) return false;
      
      return true;
    });
  }
  
  /**
   * エンティティIDに関連するイベントを取得
   * @param entityType エンティティの種類
   * @param entityId エンティティID
   * @param fromDate 取得開始日時
   * @param toDate 取得終了日時
   */
  async getEventsByEntity(entityType: string, entityId: string, fromDate?: Date, toDate?: Date): Promise<SerializedDomainEvent[]> {
    return this.events.filter(event => {
      // エンティティタイプとIDが一致
      if (event.metadata?.source?.entityType !== entityType) return false;
      if (event.metadata?.source?.entityId !== entityId) return false;
      
      // 開始日時フィルター
      if (fromDate && new Date(event.occurredAt) < fromDate) return false;
      
      // 終了日時フィルター
      if (toDate && new Date(event.occurredAt) > toDate) return false;
      
      return true;
    });
  }
  
  /**
   * 複数の条件でイベントを検索
   * @param criteria 検索条件
   */
  async findEvents(criteria: EventSearchCriteria): Promise<SerializedDomainEvent[]> {
    let result = this.events.filter(event => {
      // イベントタイプのフィルタリング
      if (criteria.eventTypes && criteria.eventTypes.length > 0) {
        if (!criteria.eventTypes.includes(event.eventType)) return false;
      }
      
      // エンティティタイプのフィルタリング
      if (criteria.entityTypes && criteria.entityTypes.length > 0) {
        if (!event.metadata?.source?.entityType || 
            !criteria.entityTypes.includes(event.metadata.source.entityType)) {
          return false;
        }
      }
      
      // エンティティIDのフィルタリング
      if (criteria.entityIds && criteria.entityIds.length > 0) {
        if (!event.metadata?.source?.entityId || 
            !criteria.entityIds.includes(event.metadata.source.entityId)) {
          return false;
        }
      }
      
      // ユーザーIDのフィルタリング
      if (criteria.userIds && criteria.userIds.length > 0) {
        if (!event.metadata?.source?.userId || 
            !criteria.userIds.includes(event.metadata.source.userId)) {
          return false;
        }
      }
      
      // 相関IDのフィルタリング
      if (criteria.correlationId) {
        if (!event.metadata?.tracking?.correlationId || 
            event.metadata.tracking.correlationId !== criteria.correlationId) {
          return false;
        }
      }
      
      // 日付範囲のフィルタリング
      const eventDate = new Date(event.occurredAt);
      if (criteria.fromDate && eventDate < criteria.fromDate) return false;
      if (criteria.toDate && eventDate > criteria.toDate) return false;
      
      return true;
    });
    
    // 日付順にソート
    result = result.sort((a, b) => {
      return new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime();
    });
    
    // ページング処理
    if (criteria.offset !== undefined && criteria.offset > 0) {
      result = result.slice(criteria.offset);
    }
    
    if (criteria.limit !== undefined && criteria.limit > 0) {
      result = result.slice(0, criteria.limit);
    }
    
    return result;
  }
}

/**
 * MongoDB実装のイベントストア
 * 本番環境用の実装
 */
@injectable()
export class MongoEventStore implements IEventStore {
  // 実装例（実際はMongooseモデルを使用）
  private serializedEvents: SerializedDomainEvent[] = []; // モック用データストア

  async saveEvent<T extends DomainEvent>(event: T): Promise<void> {
    // 仮実装（開発中）
    this.serializedEvents.push(event.serialize());
    logger.debug(`イベントをMongoDBに保存: ${event.eventType}`);
  }

  async saveEvents(events: DomainEvent[]): Promise<void> {
    // 仮実装（開発中）
    const serialized = events.map(event => event.serialize());
    this.serializedEvents.push(...serialized);
    logger.debug(`${events.length}件のイベントをMongoDBに保存`); 
  }

  async getEventsByType(eventType: string, fromDate?: Date, toDate?: Date): Promise<SerializedDomainEvent[]> {
    // 仮実装（開発中）
    return this.serializedEvents.filter(event => {
      if (event.eventType !== eventType) return false;
      
      if (fromDate && new Date(event.occurredAt) < fromDate) return false;
      if (toDate && new Date(event.occurredAt) > toDate) return false;
      
      return true;
    });
  }

  async getEventsByEntity(entityType: string, entityId: string, fromDate?: Date, toDate?: Date): Promise<SerializedDomainEvent[]> {
    // 仮実装（開発中）
    return this.serializedEvents.filter(event => {
      if (event.metadata?.source?.entityType !== entityType) return false;
      if (event.metadata?.source?.entityId !== entityId) return false;
      
      if (fromDate && new Date(event.occurredAt) < fromDate) return false;
      if (toDate && new Date(event.occurredAt) > toDate) return false;
      
      return true;
    });
  }

  async findEvents(criteria: EventSearchCriteria): Promise<SerializedDomainEvent[]> {
    // 仮実装（開発中） - 実際にはMongoDBのクエリを构築する
    let result = this.serializedEvents.filter(event => {
      // イベントタイプのフィルタリング
      if (criteria.eventTypes && criteria.eventTypes.length > 0) {
        if (!criteria.eventTypes.includes(event.eventType)) return false;
      }
      
      // エンティティタイプのフィルタリング
      if (criteria.entityTypes && criteria.entityTypes.length > 0) {
        if (!event.metadata?.source?.entityType || 
            !criteria.entityTypes.includes(event.metadata.source.entityType)) {
          return false;
        }
      }
      
      // 日付範囲のフィルタリング
      const eventDate = new Date(event.occurredAt);
      if (criteria.fromDate && eventDate < criteria.fromDate) return false;
      if (criteria.toDate && eventDate > criteria.toDate) return false;
      
      return true;
    });
    
    // ソートとページング
    result.sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());
    
    if (criteria.offset) {
      result = result.slice(criteria.offset);
    }
    
    if (criteria.limit) {
      result = result.slice(0, criteria.limit);
    }
    
    return result;
  }
}