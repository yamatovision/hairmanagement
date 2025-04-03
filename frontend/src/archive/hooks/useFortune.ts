/**
 * アーカイブ用のダミーフック
 * TypeScriptのコンパイルエラーを防止するためのファイル
 */

import { ElementalType } from '../types/models';

// ダミーインターフェース
interface IFortune {
  id: string;
  [key: string]: any;
}

export const useFortune = () => {
  return {
    dailyFortune: null as IFortune | null,
    weeklyFortunes: [] as IFortune[],
    selectedFortune: null as IFortune | null,
    fetchDailyFortune: async () => {},
    fetchWeeklyFortunes: async (_startDate?: string) => {},
    fetchFortuneByDate: async (_date: string) => {},
    markFortuneAsViewed: async (_fortuneId: string) => {},
    selectFortune: (_fortune: IFortune) => {},
    loading: false,
    error: null as string | null,
    
    // 拡張機能
    getElementColor: (_element: string) => '#000000',
    getElementTextColor: (_element: string) => '#FFFFFF',
    getElementKeywords: (_element: string) => [] as string[],
    getLuckLevel: (_score: number) => 'average' as 'excellent' | 'good' | 'average' | 'challenging' | 'difficult',
    getCompatibleUsers: (_elementType: ElementalType) => [] as string[],
    formatDate: (_dateString: string) => '',
    isToday: (_dateString: string) => false,
    isValidBirthDate: (_dateString?: string) => false,
  };
};