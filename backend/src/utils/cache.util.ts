/**
 * キャッシュとメモ化のためのユーティリティ関数
 * 
 * パフォーマンス最適化とデータ変換の効率化のために使用
 * 
 * 作成日: 2025/04/05
 * 作成者: Claude
 */

/**
 * メモ化デコレータ - 関数の結果をキャッシュし、同じ引数で呼ばれた場合に
 * 再計算を回避する
 * 
 * @param keyGenerator キャッシュキー生成関数（オプション）
 * @returns メモ化された関数を返すデコレータ
 */
export function Memoize(keyGenerator?: (...args: any[]) => string) {
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const cacheKey = `__memoized_${propertyKey}`;
    
    // キャッシュが存在しない場合は作成
    if (!target[cacheKey]) {
      // WeakMapとMapの二重構造でメモリリークを防止
      // オブジェクトの場合はWeakMapで参照を保持
      target[cacheKey] = new WeakMap<object, Map<string, any>>();
    }
    
    descriptor.value = function(...args: any[]) {
      // インスタンスごとにキャッシュを分ける
      if (!target[cacheKey].has(this)) {
        target[cacheKey].set(this, new Map<string, any>());
      }
      
      const instanceCache = target[cacheKey].get(this);
      
      // カスタムキー生成関数または引数の文字列化
      const key = keyGenerator 
        ? keyGenerator(...args)
        : JSON.stringify(args);
      
      // キャッシュにヒットした場合はキャッシュから返す
      if (instanceCache.has(key)) {
        console.debug(`[Memoize] Cache hit for ${propertyKey} with key ${key}`);
        return instanceCache.get(key);
      }
      
      // キャッシュミスの場合は計算し、結果をキャッシュ
      console.debug(`[Memoize] Cache miss for ${propertyKey} with key ${key}`);
      const result = originalMethod.apply(this, args);
      instanceCache.set(key, result);
      
      return result;
    };
    
    return descriptor;
  };
}

/**
 * 非同期関数用のメモ化デコレータ - Promiseの結果をキャッシュ
 * 
 * @param keyGenerator キャッシュキー生成関数（オプション）
 * @returns メモ化された非同期関数を返すデコレータ
 */
export function MemoizeAsync(keyGenerator?: (...args: any[]) => string) {
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const cacheKey = `__memoized_async_${propertyKey}`;
    
    // キャッシュが存在しない場合は作成
    if (!target[cacheKey]) {
      target[cacheKey] = new WeakMap<object, Map<string, Promise<any>>>();
    }
    
    descriptor.value = async function(...args: any[]) {
      // インスタンスごとにキャッシュを分ける
      if (!target[cacheKey].has(this)) {
        target[cacheKey].set(this, new Map<string, Promise<any>>());
      }
      
      const instanceCache = target[cacheKey].get(this);
      
      // カスタムキー生成関数または引数の文字列化
      const key = keyGenerator 
        ? keyGenerator(...args)
        : JSON.stringify(args);
      
      // キャッシュにヒットした場合はキャッシュから返す
      if (instanceCache.has(key)) {
        console.debug(`[MemoizeAsync] Cache hit for ${propertyKey} with key ${key}`);
        return instanceCache.get(key);
      }
      
      // キャッシュミスの場合は計算し、結果をキャッシュ
      console.debug(`[MemoizeAsync] Cache miss for ${propertyKey} with key ${key}`);
      const resultPromise = originalMethod.apply(this, args);
      instanceCache.set(key, resultPromise);
      
      // エラー時にキャッシュからエントリを削除
      resultPromise.catch(() => {
        instanceCache.delete(key);
      });
      
      return resultPromise;
    };
    
    return descriptor;
  };
}

/**
 * 時間制限付きキャッシュクラス
 * 一定時間後に自動的にキャッシュエントリを無効化
 */
export class TimedCache<T> {
  private cache = new Map<string, { value: T; expires: number }>();
  
  /**
   * コンストラクタ
   * @param defaultTtl デフォルトのキャッシュ有効期間（ミリ秒）
   */
  constructor(private defaultTtl: number = 60 * 60 * 1000) {} // 1時間
  
  /**
   * キャッシュからアイテムを取得
   * @param key キー
   * @returns キャッシュアイテム（存在しない場合はundefined）
   */
  get(key: string): T | undefined {
    const item = this.cache.get(key);
    
    // キャッシュミスまたは期限切れ
    if (!item || item.expires < Date.now()) {
      if (item) {
        this.cache.delete(key); // 期限切れアイテムを削除
      }
      return undefined;
    }
    
    return item.value;
  }
  
  /**
   * キャッシュにアイテムを設定
   * @param key キー
   * @param value 値
   * @param ttl キャッシュ有効期間（ミリ秒）
   */
  set(key: string, value: T, ttl = this.defaultTtl): void {
    this.cache.set(key, {
      value,
      expires: Date.now() + ttl
    });
  }
  
  /**
   * キャッシュからアイテムを削除
   * @param key キー
   */
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  /**
   * キャッシュをクリア
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * 期限切れのアイテムを全て削除
   */
  purgeExpired(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (item.expires < now) {
        this.cache.delete(key);
      }
    }
  }
}