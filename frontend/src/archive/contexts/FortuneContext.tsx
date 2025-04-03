/**
 * アーカイブ用のダミーコンテキスト
 * TypeScriptのコンパイルエラーを防止するためのファイル
 */

import React, { createContext, useContext } from 'react';

// ダミーインターフェース
interface IFortune {
  id: string;
  [key: string]: any;
}

interface FortuneContextType {
  dailyFortune: IFortune | null;
  weeklyFortunes: IFortune[];
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
  // ダミー実装
  const dummyValue: FortuneContextType = {
    dailyFortune: null,
    weeklyFortunes: [],
    selectedFortune: null,
    fetchDailyFortune: async () => {},
    fetchWeeklyFortunes: async () => {},
    fetchFortuneByDate: async () => {},
    markFortuneAsViewed: async () => {},
    selectFortune: () => {},
    loading: false,
    error: null
  };

  return (
    <FortuneContext.Provider value={dummyValue}>
      {children}
    </FortuneContext.Provider>
  );
};

export const useFortune = (): FortuneContextType => {
  const context = useContext(FortuneContext);
  if (context === undefined) {
    throw new Error('useFortuneは、FortuneProviderの中で使用する必要があります');
  }
  return context;
};