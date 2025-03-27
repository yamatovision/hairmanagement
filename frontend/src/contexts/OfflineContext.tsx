import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { offlineManager, isOfflineModeAvailable } from '../utils/offline.utils';

// コンテキストの型定義
interface OfflineContextType {
  isOffline: boolean;
  isOfflineSupported: boolean;
  lastOnlineAt: Date | null;
  pendingOperations: number;
}

// デフォルト値
const defaultContextValue: OfflineContextType = {
  isOffline: !navigator.onLine,
  isOfflineSupported: isOfflineModeAvailable(),
  lastOnlineAt: navigator.onLine ? new Date() : null,
  pendingOperations: 0
};

// コンテキストの作成
const OfflineContext = createContext<OfflineContextType>(defaultContextValue);

// Providerコンポーネントのprops型
interface OfflineProviderProps {
  children: ReactNode;
}

/**
 * オフラインモード状態を管理し、アプリケーション全体で共有するProvider
 */
export const OfflineProvider: React.FC<OfflineProviderProps> = ({ children }) => {
  // オフライン状態
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  // オフラインモードのサポート状態
  const [isOfflineSupported, setIsOfflineSupported] = useState(isOfflineModeAvailable());
  // 最後にオンラインだった時刻
  const [lastOnlineAt, setLastOnlineAt] = useState<Date | null>(navigator.onLine ? new Date() : null);
  // 保留中の操作数
  const [pendingOperations, setPendingOperations] = useState(0);

  // サービスワーカーの状態が変化したら、オフラインサポート状態を更新
  useEffect(() => {
    const checkServiceWorker = () => {
      setIsOfflineSupported(isOfflineModeAvailable());
    };
    
    // ナビゲーションプリロードの状態変化を監視
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', checkServiceWorker);
    }
    
    // 定期的にサービスワーカーの状態を確認
    const interval = setInterval(checkServiceWorker, 5000);
    
    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', checkServiceWorker);
      }
      clearInterval(interval);
    };
  }, []);

  // オフライン状態の変化を監視
  useEffect(() => {
    const removeListener = offlineManager.addListener((offline) => {
      setIsOffline(offline);
      
      if (!offline) {
        // オンラインに戻った時
        setLastOnlineAt(new Date());
      }
    });
    
    return removeListener;
  }, []);

  // 保留中の操作数を監視（IndexedDBまたはローカルストレージから）
  useEffect(() => {
    // ここでIndexedDBまたはローカルストレージから保留中の操作を取得
    // 実装例：ローカルストレージからオフラインキューを取得して数をカウント
    const checkPendingOperations = () => {
      try {
        const offlineQueue = localStorage.getItem('offline_request_queue');
        if (offlineQueue) {
          const queue = JSON.parse(offlineQueue);
          if (Array.isArray(queue)) {
            setPendingOperations(queue.length);
            return;
          }
        }
        setPendingOperations(0);
      } catch (error) {
        console.error('保留中の操作の確認中にエラーが発生しました:', error);
        setPendingOperations(0);
      }
    };
    
    // 初回チェックと定期的な更新
    checkPendingOperations();
    const interval = setInterval(checkPendingOperations, 10000); // 10秒ごとに確認
    
    // ストレージイベントを監視して変更をリアルタイムに反映
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'offline_request_queue') {
        checkPendingOperations();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // コンテキスト値の構築
  const contextValue: OfflineContextType = {
    isOffline,
    isOfflineSupported,
    lastOnlineAt,
    pendingOperations
  };

  return (
    <OfflineContext.Provider value={contextValue}>
      {children}
    </OfflineContext.Provider>
  );
};

/**
 * オフラインモードの状態にアクセスするためのカスタムフック
 */
export const useOffline = () => useContext(OfflineContext);

export default OfflineContext;