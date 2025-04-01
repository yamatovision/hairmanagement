/**
 * EventBus
 * ドメインイベントの発行と購読を行うイベントバス
 * 
 * 変更履歴:
 * - 2025/3/30: 初期実装 (Claude)
 */

import { injectable } from 'tsyringe';
import { DomainEvent } from '../../domain/events/shared/DomainEvent';
import { logger } from '../../utils/logger.util';

/**
 * イベントハンドラーの型定義
 */
export type EventHandler<T extends DomainEvent = DomainEvent> = (event: T) => Promise<void> | void;

/**
 * イベントバスのインターフェース
 */
export interface IEventBus {
  /**
   * イベントを発行
   * @param event 発行するドメインイベント
   */
  publish<T extends DomainEvent>(event: T): Promise<void>;

  /**
   * 複数のイベントを発行
   * @param events 発行するドメインイベントの配列
   */
  publishAll(events: DomainEvent[]): Promise<void>;

  /**
   * イベントハンドラーを登録
   * @param eventType イベントの種類
   * @param handler イベントハンドラー関数
   */
  subscribe<T extends DomainEvent = DomainEvent>(eventType: string, handler: EventHandler<T>): void;

  /**
   * イベントハンドラーを削除
   * @param eventType イベントの種類
   * @param handler イベントハンドラー関数
   */
  unsubscribe<T extends DomainEvent = DomainEvent>(eventType: string, handler: EventHandler<T>): void;
}

/**
 * インメモリ実装のイベントバス
 */
@injectable()
export class InMemoryEventBus implements IEventBus {
  // イベントタイプごとのハンドラーマップ
  private eventHandlers: Map<string, Set<EventHandler>> = new Map();

  /**
   * イベントを発行し、登録されたすべてのハンドラーに通知
   * @param event 発行するドメインイベント
   */
  async publish<T extends DomainEvent>(event: T): Promise<void> {
    const handlers = this.eventHandlers.get(event.eventType) || new Set<EventHandler>();
    
    // 無同期でハンドラーを実行（非ブロッキング）
    const promises = Array.from(handlers).map(async handler => {
      try {
        await handler(event);
      } catch (error) {
        logger.error(`イベント処理中にエラーが発生しました (${event.eventType}):`, error);
        // エラーが発生しても他のハンドラーの処理は続行
      }
    });
    
    // すべてのハンドラーの実行完了を待機
    await Promise.all(promises);
    
    // イベントのシリアライズされた形式をログに出力（デバッグ用）
    logger.debug(`イベント発行: ${event.eventType}`, { eventId: event.eventId });
  }

  /**
   * 複数のイベントを発行
   * @param events 発行するドメインイベントの配列
   */
  async publishAll(events: DomainEvent[]): Promise<void> {
    // 各イベントを並列で発行
    await Promise.all(events.map(event => this.publish(event)));
  }

  /**
   * イベントハンドラーを登録
   * @param eventType イベントの種類
   * @param handler イベントハンドラー関数
   */
  subscribe<T extends DomainEvent = DomainEvent>(eventType: string, handler: EventHandler<T>): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set<EventHandler>());
    }
    
    this.eventHandlers.get(eventType)!.add(handler as EventHandler);
    logger.debug(`イベントハンドラー登録: ${eventType}`);
  }

  /**
   * イベントハンドラーを削除
   * @param eventType イベントの種類
   * @param handler イベントハンドラー関数
   */
  unsubscribe<T extends DomainEvent = DomainEvent>(eventType: string, handler: EventHandler<T>): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.delete(handler as EventHandler);
      
      // ハンドラーが空になった場合はエントリを削除
      if (handlers.size === 0) {
        this.eventHandlers.delete(eventType);
      }
      
      logger.debug(`イベントハンドラー削除: ${eventType}`);
    }
  }
}