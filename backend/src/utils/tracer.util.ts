/**
 * トレーサーユーティリティ
 * 
 * システム全体でのデータフロー追跡を可能にするユーティリティ
 * データ変換や処理パイプラインの追跡、診断情報の収集に使用
 * 
 * 作成日: 2025/04/05
 * 作成者: Claude
 */

import { randomUUID } from 'crypto';

/**
 * トレースレベル列挙型
 */
export enum TraceLevel {
  NONE = 'none',
  ERROR = 'error',
  BASIC = 'basic',
  DETAILED = 'detailed',
  DEBUG = 'debug'
}

/**
 * トレースイベント型
 */
export interface TraceEvent {
  id: string;
  parentId?: string;
  traceId: string;
  timestamp: string;
  type: 'start' | 'end' | 'transform' | 'error' | 'info';
  operation: string;
  data?: any;
  metadata?: Record<string, any>;
  duration?: number;
}

/**
 * トレースコンテキスト型
 */
export interface TraceContext {
  traceId: string;
  parentId?: string;
  operation: string;
  metadata?: Record<string, any>;
}

/**
 * トレーサークラス - データ変換や処理フローの追跡
 */
export class Tracer {
  private static instance: Tracer;
  private events: TraceEvent[] = [];
  private traceLevel: TraceLevel = TraceLevel.ERROR;
  private enabled: boolean = false;
  
  /**
   * シングルトンインスタンスを取得
   */
  static getInstance(): Tracer {
    if (!Tracer.instance) {
      Tracer.instance = new Tracer();
    }
    return Tracer.instance;
  }
  
  /**
   * プライベートコンストラクタ
   */
  private constructor() {
    // 環境変数からトレースレベルを設定
    const envTraceLevel = process.env.TRACE_LEVEL?.toLowerCase();
    if (envTraceLevel) {
      switch (envTraceLevel) {
        case 'none':
          this.traceLevel = TraceLevel.NONE;
          this.enabled = false;
          break;
        case 'error':
          this.traceLevel = TraceLevel.ERROR;
          this.enabled = true;
          break;
        case 'basic':
          this.traceLevel = TraceLevel.BASIC;
          this.enabled = true;
          break;
        case 'detailed':
          this.traceLevel = TraceLevel.DETAILED;
          this.enabled = true;
          break;
        case 'debug':
          this.traceLevel = TraceLevel.DEBUG;
          this.enabled = true;
          break;
        default:
          // デフォルトはERRORレベル
          this.traceLevel = TraceLevel.ERROR;
          this.enabled = true;
      }
    } else {
      // 環境変数が設定されていない場合はERRORレベル
      this.traceLevel = process.env.NODE_ENV === 'development' 
        ? TraceLevel.BASIC 
        : TraceLevel.ERROR;
      this.enabled = true;
    }
  }
  
  /**
   * トレースが有効かどうか判定
   * @param level 必要なトレースレベル
   * @returns 有効かどうか
   */
  isEnabled(level: TraceLevel = TraceLevel.BASIC): boolean {
    if (!this.enabled) return false;
    
    switch (level) {
      case TraceLevel.NONE:
        return false;
      case TraceLevel.ERROR:
        return this.traceLevel >= TraceLevel.ERROR;
      case TraceLevel.BASIC:
        return this.traceLevel >= TraceLevel.BASIC;
      case TraceLevel.DETAILED:
        return this.traceLevel >= TraceLevel.DETAILED;
      case TraceLevel.DEBUG:
        return this.traceLevel >= TraceLevel.DEBUG;
      default:
        return false;
    }
  }
  
  /**
   * トレースレベルを設定
   * @param level 設定するトレースレベル
   */
  setTraceLevel(level: TraceLevel): void {
    this.traceLevel = level;
    this.enabled = level !== TraceLevel.NONE;
  }
  
  /**
   * トレースの有効/無効を設定
   * @param enabled 有効にするかどうか
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
  
  /**
   * 新しいトレースコンテキストを開始
   * @param operation 操作名
   * @param metadata メタデータ
   * @param parentContext 親コンテキスト（省略可）
   * @returns トレースコンテキスト
   */
  startTrace(
    operation: string,
    metadata?: Record<string, any>,
    parentContext?: TraceContext
  ): TraceContext {
    // トレースが無効の場合は空のコンテキストを返す
    if (!this.isEnabled(TraceLevel.BASIC)) {
      return {
        traceId: '',
        operation: '',
        metadata: {}
      };
    }
    
    const traceId = parentContext?.traceId || randomUUID();
    const parentId = parentContext?.parentId;
    const eventId = randomUUID();
    
    const context: TraceContext = {
      traceId,
      parentId: eventId,
      operation,
      metadata
    };
    
    // startイベントを記録
    this.addEvent({
      id: eventId,
      parentId,
      traceId,
      timestamp: new Date().toISOString(),
      type: 'start',
      operation,
      metadata,
    });
    
    return context;
  }
  
  /**
   * トレースの終了
   * @param context トレースコンテキスト
   * @param data 結果データ
   */
  endTrace(context: TraceContext, data?: any): void {
    if (!this.isEnabled(TraceLevel.BASIC) || !context.traceId) {
      return;
    }
    
    const { traceId, parentId, operation, metadata } = context;
    
    // endイベントを記録
    this.addEvent({
      id: randomUUID(),
      parentId,
      traceId,
      timestamp: new Date().toISOString(),
      type: 'end',
      operation,
      data: this.isEnabled(TraceLevel.DETAILED) ? data : undefined,
      metadata,
    });
  }
  
  /**
   * データ変換イベントを記録
   * @param context トレースコンテキスト
   * @param fromData 変換前データ
   * @param toData 変換後データ
   * @param transformName 変換名
   */
  traceTransform(
    context: TraceContext,
    fromData: any,
    toData: any,
    transformName: string
  ): void {
    if (!this.isEnabled(TraceLevel.DETAILED) || !context.traceId) {
      return;
    }
    
    const { traceId, parentId, operation, metadata } = context;
    
    // transformイベントを記録
    this.addEvent({
      id: randomUUID(),
      parentId,
      traceId,
      timestamp: new Date().toISOString(),
      type: 'transform',
      operation: `${operation}.${transformName}`,
      data: {
        from: fromData,
        to: toData
      },
      metadata,
    });
  }
  
  /**
   * エラーイベントを記録
   * @param context トレースコンテキスト
   * @param error エラー
   * @param additionalData 追加データ
   */
  traceError(
    context: TraceContext,
    error: any,
    additionalData?: any
  ): void {
    if (!this.isEnabled(TraceLevel.ERROR) || !context.traceId) {
      return;
    }
    
    const { traceId, parentId, operation, metadata } = context;
    
    // エラーデータの準備
    let errorData: any = {};
    
    if (error instanceof Error) {
      errorData = {
        message: error.message,
        name: error.name,
        stack: error.stack
      };
    } else if (typeof error === 'string') {
      errorData = { message: error };
    } else {
      try {
        errorData = { ...error };
      } catch (e) {
        errorData = { message: 'Unstringifiable error' };
      }
    }
    
    // errorイベントを記録
    this.addEvent({
      id: randomUUID(),
      parentId,
      traceId,
      timestamp: new Date().toISOString(),
      type: 'error',
      operation,
      data: {
        error: errorData,
        additionalData
      },
      metadata,
    });
  }
  
  /**
   * 情報イベントを記録
   * @param context トレースコンテキスト
   * @param message メッセージ
   * @param data 追加データ
   */
  traceInfo(
    context: TraceContext,
    message: string,
    data?: any
  ): void {
    if (!this.isEnabled(TraceLevel.DETAILED) || !context.traceId) {
      return;
    }
    
    const { traceId, parentId, operation, metadata } = context;
    
    // infoイベントを記録
    this.addEvent({
      id: randomUUID(),
      parentId,
      traceId,
      timestamp: new Date().toISOString(),
      type: 'info',
      operation,
      data: {
        message,
        details: data
      },
      metadata,
    });
  }
  
  /**
   * イベントを追加
   * @param event トレースイベント
   */
  private addEvent(event: TraceEvent): void {
    this.events.push(event);
    
    // デバッグモードの場合はコンソールに出力
    if (this.isEnabled(TraceLevel.DEBUG)) {
      console.debug(`[TRACE] ${event.type.toUpperCase()} - ${event.operation}`, {
        traceId: event.traceId,
        eventId: event.id,
        parentId: event.parentId,
        data: event.data
      });
    }
    
    // TODO: 保存先の設定（ファイル、DB、外部サービス等）
  }
  
  /**
   * 特定のトレースIDに対応するイベントを取得
   * @param traceId トレースID
   * @returns イベント配列
   */
  getTraceEvents(traceId: string): TraceEvent[] {
    return this.events.filter(event => event.traceId === traceId);
  }
  
  /**
   * すべてのトレースイベントを取得
   * @returns イベント配列
   */
  getAllEvents(): TraceEvent[] {
    return [...this.events];
  }
  
  /**
   * トレースイベントをクリア
   */
  clearEvents(): void {
    this.events = [];
  }
  
  /**
   * トレースレポートを生成
   * @param traceId トレースID（省略時は全イベント）
   * @returns フォーマットされたレポート
   */
  generateReport(traceId?: string): string {
    const events = traceId
      ? this.getTraceEvents(traceId)
      : this.getAllEvents();
    
    if (events.length === 0) {
      return 'No trace events found.';
    }
    
    let report = `Trace Report - ${new Date().toISOString()}\n`;
    report += `Total Events: ${events.length}\n\n`;
    
    const groupedByTraceId: Record<string, TraceEvent[]> = {};
    
    // トレースIDでグループ化
    events.forEach(event => {
      if (!groupedByTraceId[event.traceId]) {
        groupedByTraceId[event.traceId] = [];
      }
      groupedByTraceId[event.traceId].push(event);
    });
    
    // トレースごとにレポート生成
    Object.entries(groupedByTraceId).forEach(([currentTraceId, traceEvents]) => {
      report += `=== Trace ID: ${currentTraceId} ===\n`;
      report += `Events: ${traceEvents.length}\n`;
      
      // イベントをタイムスタンプでソート
      const sortedEvents = [...traceEvents].sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      // トレースツリーを構築
      const eventMap: Record<string, { event: TraceEvent, children: string[] }> = {};
      let rootEvents: string[] = [];
      
      sortedEvents.forEach(event => {
        eventMap[event.id] = { event, children: [] };
        
        if (event.parentId && eventMap[event.parentId]) {
          eventMap[event.parentId].children.push(event.id);
        } else {
          rootEvents.push(event.id);
        }
      });
      
      // トレースツリーの表示
      const printEvent = (eventId: string, level = 0) => {
        const indent = '  '.repeat(level);
        const { event, children } = eventMap[eventId];
        
        const timestamp = new Date(event.timestamp).toISOString().split('T')[1].replace('Z', '');
        report += `${indent}${timestamp} [${event.type}] ${event.operation}\n`;
        
        if (event.data && this.isEnabled(TraceLevel.DETAILED)) {
          report += `${indent}  Data: ${JSON.stringify(event.data, null, 2).split('\n').join('\n' + indent + '  ')}\n`;
        }
        
        children.forEach(childId => {
          printEvent(childId, level + 1);
        });
      };
      
      rootEvents.forEach(rootId => {
        printEvent(rootId);
      });
      
      report += '\n';
    });
    
    return report;
  }
}

// シングルトンインスタンスをエクスポート
export const tracer = Tracer.getInstance();

/**
 * トレース関数のデコレータ - クラスメソッド用
 * @param level トレースレベル
 */
export function Trace(level: TraceLevel = TraceLevel.BASIC) {
  return function(
    target: any, 
    propertyKey: string, 
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function(...args: any[]) {
      const tracer = Tracer.getInstance();
      
      // トレースが無効の場合は元のメソッドを実行
      if (!tracer.isEnabled(level)) {
        return originalMethod.apply(this, args);
      }
      
      // クラス名とメソッド名からオペレーション名を生成
      const className = this.constructor.name;
      const operation = `${className}.${propertyKey}`;
      
      // トレースの開始
      const context = tracer.startTrace(operation, {
        args: args.length > 0 ? args : undefined,
        className,
        methodName: propertyKey
      });
      
      try {
        // メソッドを実行
        const startTime = Date.now();
        const result = originalMethod.apply(this, args);
        const duration = Date.now() - startTime;
        
        // Promiseの場合は特別な処理
        if (result instanceof Promise) {
          return result
            .then((value) => {
              tracer.endTrace(context, {
                result: value,
                duration
              });
              return value;
            })
            .catch((error) => {
              tracer.traceError(context, error);
              throw error;
            });
        }
        
        // 通常の結果の場合
        tracer.endTrace(context, {
          result,
          duration
        });
        
        return result;
      } catch (error) {
        tracer.traceError(context, error);
        throw error;
      }
    };
    
    return descriptor;
  };
}

export default tracer;