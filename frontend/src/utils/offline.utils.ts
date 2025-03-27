/**
 * オフラインモード関連のユーティリティ関数
 * 
 * オフライン状態の検出、オフラインデータの管理、
 * バックグラウンド同期機能を提供します。
 */

import { getStorageItem, setStorageItem } from './storage.utils';

// オフラインキューのストレージキー
const OFFLINE_QUEUE_KEY = 'offline_request_queue';
// オフラインデータのストレージキー（プレフィックス）
const OFFLINE_DATA_PREFIX = 'offline_data_';

// オフラインリクエストの型定義
interface OfflineRequest {
  id: string;
  url: string;
  method: string;
  body?: any;
  headers?: Record<string, string>;
  timestamp: number;
  retryCount: number;
}

/**
 * ネットワーク接続の状態を確認
 * @returns オンラインの場合はtrue、オフラインの場合はfalse
 */
export const isOnline = (): boolean => {
  return navigator.onLine;
};

/**
 * オフライン状態の変化を監視するリスナーを登録
 * @param onOffline オフラインになった時のコールバック
 * @param onOnline オンラインに戻った時のコールバック
 * @returns リスナーを削除する関数
 */
export const addConnectivityListeners = (
  onOffline: () => void,
  onOnline: () => void
): () => void => {
  window.addEventListener('offline', onOffline);
  window.addEventListener('online', onOnline);

  // クリーンアップ関数を返す
  return () => {
    window.removeEventListener('offline', onOffline);
    window.removeEventListener('online', onOnline);
  };
};

/**
 * オフラインモードが利用可能かどうか確認
 * @returns Service Workerが登録されていればtrue
 */
export const isOfflineModeAvailable = (): boolean => {
  return 'serviceWorker' in navigator && navigator.serviceWorker.controller !== null;
};

/**
 * オフラインリクエストをキューに追加
 * @param request 保存するリクエスト情報
 */
export const addToOfflineQueue = (request: Omit<OfflineRequest, 'id' | 'timestamp' | 'retryCount'>): void => {
  const queue = getOfflineQueue();
  
  // 新しいリクエストを作成
  const newRequest: OfflineRequest = {
    ...request,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    retryCount: 0
  };
  
  // キューに追加して保存
  queue.push(newRequest);
  setStorageItem(OFFLINE_QUEUE_KEY, queue);
  
  // 同期イベントを登録（利用可能な場合）
  registerSyncIfAvailable();
};

/**
 * オフラインキューからリクエストを取得
 * @returns 保存されたリクエストの配列
 */
export const getOfflineQueue = (): OfflineRequest[] => {
  return getStorageItem<OfflineRequest[]>(OFFLINE_QUEUE_KEY, []);
};

/**
 * オフラインキューからリクエストを削除
 * @param requestId 削除するリクエストのID
 */
export const removeFromOfflineQueue = (requestId: string): void => {
  const queue = getOfflineQueue();
  const updatedQueue = queue.filter(request => request.id !== requestId);
  setStorageItem(OFFLINE_QUEUE_KEY, updatedQueue);
};

/**
 * オフラインキューのリクエストを処理（オンラインに戻った時に呼び出す）
 * @returns 処理結果のPromise
 */
export const processOfflineQueue = async (): Promise<{ success: string[]; failed: string[] }> => {
  const queue = getOfflineQueue();
  const results = {
    success: [] as string[],
    failed: [] as string[]
  };
  
  if (queue.length === 0) {
    return results;
  }
  
  // 各リクエストを順次処理
  for (const request of queue) {
    try {
      // オンラインでなければ処理を中断
      if (!isOnline()) {
        break;
      }
      
      // リクエストを実行
      const response = await fetch(request.url, {
        method: request.method,
        headers: request.headers ? new Headers(request.headers) : undefined,
        body: request.body ? JSON.stringify(request.body) : undefined
      });
      
      if (response.ok) {
        // 成功したらキューから削除
        removeFromOfflineQueue(request.id);
        results.success.push(request.id);
      } else {
        // 失敗したらリトライカウントを増やす
        updateRetryCount(request.id);
        results.failed.push(request.id);
      }
    } catch (error) {
      console.error(`オフラインリクエストの処理中にエラーが発生しました: ${error}`);
      updateRetryCount(request.id);
      results.failed.push(request.id);
    }
  }
  
  return results;
};

/**
 * リクエストのリトライカウントを更新
 * @param requestId 更新するリクエストのID
 */
const updateRetryCount = (requestId: string): void => {
  const queue = getOfflineQueue();
  const updatedQueue = queue.map(request => {
    if (request.id === requestId) {
      return {
        ...request,
        retryCount: request.retryCount + 1
      };
    }
    return request;
  });
  
  setStorageItem(OFFLINE_QUEUE_KEY, updatedQueue);
};

/**
 * オフラインで使用するデータをキャッシュに保存
 * @param key データを識別するキー
 * @param data 保存するデータ
 * @param ttl 有効期限（ミリ秒）、デフォルトは24時間
 */
export const cacheOfflineData = <T>(
  key: string,
  data: T,
  ttl: number = 24 * 60 * 60 * 1000 // 24時間
): void => {
  const storageKey = `${OFFLINE_DATA_PREFIX}${key}`;
  
  const cacheData = {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + ttl
  };
  
  setStorageItem(storageKey, cacheData);
};

/**
 * キャッシュからオフラインデータを取得
 * @param key 取得するデータのキー
 * @returns キャッシュされたデータ、または期限切れ/存在しない場合はnull
 */
export const getOfflineData = <T>(key: string): T | null => {
  const storageKey = `${OFFLINE_DATA_PREFIX}${key}`;
  const cachedData = getStorageItem<{
    data: T;
    timestamp: number;
    expiresAt: number;
  }>(storageKey, null);
  
  // データが存在しない場合
  if (!cachedData) {
    return null;
  }
  
  // 期限切れの場合
  if (Date.now() > cachedData.expiresAt) {
    // 期限切れのデータは削除する
    localStorage.removeItem(storageKey);
    return null;
  }
  
  return cachedData.data;
};

/**
 * Service Workerの同期イベントを登録（利用可能な場合）
 */
const registerSyncIfAvailable = async (): Promise<void> => {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      // registration.sync が存在する場合のみ処理を実行
      if ('sync' in registration) {
        await (registration as any).sync.register('syncOfflineData');
        console.log('バックグラウンド同期を登録しました');
      } else {
        console.log('バックグラウンド同期APIが利用できません');
      }
    } catch (error) {
      console.error('バックグラウンド同期の登録に失敗しました:', error);
    }
  } else {
    console.log('このブラウザはバックグラウンド同期をサポートしていません');
  }
};

/**
 * オフラインモードの状態を監視するフック用オブジェクトを作成
 * React Contextとともに使用することを想定
 */
export const createOfflineManager = () => {
  let listeners: Array<(isOffline: boolean) => void> = [];
  let isCurrentlyOffline = !navigator.onLine;
  
  // オフライン状態の変化を監視
  window.addEventListener('offline', () => {
    isCurrentlyOffline = true;
    notifyListeners();
  });
  
  window.addEventListener('online', () => {
    isCurrentlyOffline = false;
    notifyListeners();
    
    // オンラインに戻ったらキューを処理
    processOfflineQueue()
      .then(results => {
        console.log('オフラインキューの処理結果:', results);
      })
      .catch(error => {
        console.error('オフラインキューの処理中にエラーが発生しました:', error);
      });
  });
  
  // リスナーに通知
  const notifyListeners = () => {
    listeners.forEach(listener => listener(isCurrentlyOffline));
  };
  
  return {
    /**
     * 現在のオフライン状態を取得
     */
    isOffline: () => isCurrentlyOffline,
    
    /**
     * オフライン状態変化のリスナーを追加
     * @param listener オフライン状態が変化した時に呼び出されるコールバック関数
     * @returns リスナーを削除する関数
     */
    addListener: (listener: (isOffline: boolean) => void) => {
      listeners.push(listener);
      
      // 最初の呼び出し
      listener(isCurrentlyOffline);
      
      // クリーンアップ関数を返す
      return () => {
        listeners = listeners.filter(l => l !== listener);
      };
    }
  };
};

// オフラインマネージャーのシングルトンインスタンス
export const offlineManager = createOfflineManager();