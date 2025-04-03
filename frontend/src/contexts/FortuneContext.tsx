/**
 * フォーチュンコンテキスト
 * デイリーフォーチュンと運勢データの状態管理を行う
 * 
 * 変更履歴:
 * - 2025/03/26: 初期実装 (AppGenius)
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { IFortune } from '../types/models';
import { useAuth } from './AuthContext';
import fortuneService from '../services/fortune.service';

// エラーハンドリング用の拡張FortuneType
type FortuneWithErrorType = IFortune & {
  error?: boolean;
  message?: string;
};

interface FortuneContextType {
  dailyFortune: IFortune | null;
  weeklyFortunes: FortuneWithErrorType[];
  selectedFortune: IFortune | null;
  fetchDailyFortune: () => Promise<void>;
  fetchWeeklyFortunes: (startDate?: string) => Promise<void>;
  fetchFortuneByDate: (date: string) => Promise<void>;
  markFortuneAsViewed: (fortuneId: string) => Promise<void>;
  selectFortune: (fortune: IFortune) => void;
  loading: boolean;
  error: string | null;
}

const FortuneContext = createContext<FortuneContextType | undefined>(undefined);

export const FortuneProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [dailyFortune, setDailyFortune] = useState<IFortune | null>(null);
  const [weeklyFortunes, setWeeklyFortunes] = useState<FortuneWithErrorType[]>([]);
  const [selectedFortune, setSelectedFortune] = useState<IFortune | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 日付フォーマットヘルパー関数
  const formatDate = useCallback((date: Date): string => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD形式に変換
  }, []);

  // デイリーフォーチュンを取得
  const fetchDailyFortune = useCallback(async (): Promise<void> => {
    if (!isAuthenticated || !user) return;

    setLoading(true);
    setError(null);
    
    try {
      const fortune = await fortuneService.getDailyFortune();
      setDailyFortune(fortune);
      // 選択されたフォーチュンがない場合のみ、デイリーフォーチュンを選択状態にする
      if (fortune) {
        // selectedFortuneを直接参照せず、常に最新の取得結果を使用
        setSelectedFortune(fortune);
      }
    } catch (err) {
      setError('デイリー運勢の取得に失敗しました');
      console.error('デイリー運勢取得エラー:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // 週間フォーチュンを取得
  const fetchWeeklyFortunes = useCallback(async (startDate?: string): Promise<void> => {
    if (!isAuthenticated || !user) return;

    setLoading(true);
    setError(null);
    
    try {
      // ユーザーの生年月日を取得（バックエンドがデフォルト値を提供するためオプショナル）
      let birthDate = null;
      
      // APIレスポンスから直接データを取得
      if (user && user.birthDate) {
        birthDate = user.birthDate;
      } else {
        // ローカルストレージからの取得も試みる
        birthDate = localStorage.getItem('userBirthDate');
      }
      
      // デバッグ出力
      console.debug('ユーザー生年月日:', birthDate || 'バックエンドがデフォルト値を使用');
      
      // サービスが例外をスローしない実装になっているが、念のためtry-catchで囲む
      const fortunes = await fortuneService.getWeeklyFortunes(startDate, birthDate || undefined);
      
      // 受け取ったデータが有効か確認
      if (Array.isArray(fortunes)) {
        // エラーメッセージが含まれている場合
        if (fortunes.length === 1 && fortunes[0]?.error === true) {
          console.warn('週間運勢の取得でエラーが返されました:', fortunes[0]?.message);
          setWeeklyFortunes(fortunes);
          setError(fortunes[0]?.message || '週間運勢の取得でエラーが発生しました');
        } else {
          setWeeklyFortunes(fortunes);
          setError(null);
        }
      } else {
        // データが無効な場合は空の配列を設定
        console.warn('週間運勢の取得結果が配列ではありません:', fortunes);
        setWeeklyFortunes([]);
        setError('週間運勢データの形式が不正です');
      }
    } catch (err) {
      setError('週間運勢の取得に失敗しました');
      console.error('週間運勢取得エラー:', err);
      // エラー時も空の配列を設定して状態を更新
      setWeeklyFortunes([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // 指定日の運勢を取得
  const fetchFortuneByDate = useCallback(async (date: string): Promise<void> => {
    if (!isAuthenticated || !user) return;

    setLoading(true);
    setError(null);
    
    try {
      const fortune = await fortuneService.getFortuneByDate(date);
      // 今日の運勢の場合はデイリーフォーチュンも更新
      const today = formatDate(new Date());
      if (date === today) {
        setDailyFortune(fortune);
      }
      setSelectedFortune(fortune);
    } catch (err) {
      setError(`${date}の運勢取得に失敗しました`);
      console.error('特定日の運勢取得エラー:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, formatDate]);

  // 運勢を閲覧済みとしてマーク (クライアントサイドのみの実装)
  const markFortuneAsViewed = useCallback(async (fortuneId: string): Promise<void> => {
    if (!isAuthenticated || !user) return;

    // サーバーへのリクエストなしでクライアントサイドの状態のみ更新
    
    // データを更新
    if (dailyFortune && dailyFortune.id === fortuneId) {
      setDailyFortune({
        ...dailyFortune,
        viewedAt: new Date().toISOString()
      });
    }
    
    if (selectedFortune && selectedFortune.id === fortuneId) {
      setSelectedFortune({
        ...selectedFortune,
        viewedAt: new Date().toISOString()
      });
    }
    
    // 週間運勢も更新
    setWeeklyFortunes(prevFortunes => 
      prevFortunes.map(fortune => 
        fortune.id === fortuneId 
          ? { ...fortune, viewedAt: new Date().toISOString() } 
          : fortune
      )
    );
  }, [isAuthenticated, user, dailyFortune, selectedFortune]);

  // 選択された運勢を設定
  const selectFortune = useCallback((fortune: IFortune): void => {
    setSelectedFortune(fortune);
  }, []);

  // ユーザー認証状態が変わった際に一度だけデイリー運勢を取得
  useEffect(() => {
    let isMounted = true;
    
    const loadInitialData = async () => {
      if (isAuthenticated && user && isMounted) {
        // 既にデータが読み込まれている場合は再取得しない
        if (!dailyFortune) {
          await fetchDailyFortune();
        }
        if (weeklyFortunes.length === 0) {
          await fetchWeeklyFortunes();
        }
      } else if (!isAuthenticated && isMounted) {
        // 未認証の場合はデータをクリア
        setDailyFortune(null);
        setWeeklyFortunes([]);
        setSelectedFortune(null);
      }
    };
    
    loadInitialData();
    
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  return (
    <FortuneContext.Provider
      value={{
        dailyFortune,
        weeklyFortunes,
        selectedFortune,
        fetchDailyFortune,
        fetchWeeklyFortunes,
        fetchFortuneByDate,
        markFortuneAsViewed,
        selectFortune,
        loading,
        error
      }}
    >
      {children}
    </FortuneContext.Provider>
  );
};

// カスタムフック
export const useFortune = (): FortuneContextType => {
  const context = useContext(FortuneContext);
  if (context === undefined) {
    throw new Error('useFortuneは、FortuneProviderの中で使用する必要があります');
  }
  return context;
};