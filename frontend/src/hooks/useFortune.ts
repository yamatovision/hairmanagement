/**
 * フォーチュンカスタムフック
 * 運勢関連の各コンポーネントで使用する共通ロジックを提供
 * 
 * 変更履歴:
 * - 2025/03/26: 初期実装 (AppGenius)
 */

import { useCallback } from 'react';
import { useFortune as useFortuneContext } from '../contexts/FortuneContext';
import { ElementalType, IFortune } from '../types/models';

interface FortuneHookReturn {
  // FortuneContextから提供される基本機能
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

  // 拡張機能: フォーチュンデータの処理と表示用ヘルパー
  getElementColor: (element: string) => string;
  getElementTextColor: (element: string) => string;
  getElementKeywords: (element: string) => string[];
  getLuckLevel: (score: number) => 'excellent' | 'good' | 'average' | 'challenging' | 'difficult';
  getCompatibleUsers: (elementType: ElementalType) => string[];
  formatDate: (dateString: string) => string;
  isToday: (dateString: string) => boolean;
  isValidBirthDate: (dateString?: string) => boolean;
}

export const useFortune = (): FortuneHookReturn => {
  // 基本コンテキストから機能を取得
  const fortuneContext = useFortuneContext();

  // 五行の色を取得するヘルパー関数
  const getElementColor = useCallback((element: string): string => {
    const colorMap: Record<string, string> = {
      '木': '#a5d6a7', // 緑
      '火': '#ffab91', // 赤
      '土': '#d7ccc8', // 黄土色
      '金': '#e0e0e0', // 銀/白
      '水': '#81d4fa'  // 青
    };
    return colorMap[element] || '#e0e0e0';
  }, []);

  // 五行のテキスト色を取得するヘルパー関数
  const getElementTextColor = useCallback((element: string): string => {
    const textColorMap: Record<string, string> = {
      '木': '#1b5e20', // 深緑
      '火': '#bf360c', // 深赤
      '土': '#4e342e', // 茶色
      '金': '#424242', // 灰色
      '水': '#01579b'  // 紺色
    };
    return textColorMap[element] || '#000000';
  }, []);

  // 五行のキーワードを取得するヘルパー関数
  const getElementKeywords = useCallback((element: string): string[] => {
    const keywordsMap: Record<string, string[]> = {
      '木': ['成長', '発展', '柔軟性', '創造性', '決断力'],
      '火': ['情熱', '変化', '行動力', '表現力', '拡大'],
      '土': ['安定', '中心', '思考力', '調和', '信頼'],
      '金': ['収穫', '確実性', '正確さ', '決断力', '潔癖'],
      '水': ['知恵', '柔軟性', '持久力', '深み', '静けさ']
    };
    return keywordsMap[element] || [];
  }, []);

  // 運勢スコアからレベルを取得するヘルパー関数
  const getLuckLevel = useCallback((score: number): 'excellent' | 'good' | 'average' | 'challenging' | 'difficult' => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    if (score >= 20) return 'challenging';
    return 'difficult';
  }, []);

  // 相性の良いユーザー（仮データ）を取得するヘルパー関数
  const getCompatibleUsers = useCallback((elementType: ElementalType): string[] => {
    // Note: この関数は実際のAPIから相性の良いユーザーを取得するように拡張する予定
    return ['山田太郎', '鈴木花子', '佐藤次郎']; // 仮のデータ
  }, []);

  // 日付フォーマットヘルパー関数
  const formatDate = useCallback((dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  }, []);

  // 指定された日付が今日かどうかをチェックするヘルパー関数
  const isToday = useCallback((dateString: string): boolean => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    return dateString === todayStr;
  }, []);
  
  // 誕生日の書式が正しいか確認するヘルパー関数
  const isValidBirthDate = useCallback((dateString?: string): boolean => {
    if (!dateString) return false;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) return false;
    
    // 日付としての妥当性確認
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && date < new Date();
  }, []);

  return {
    ...fortuneContext,
    getElementColor,
    getElementTextColor,
    getElementKeywords,
    getLuckLevel,
    getCompatibleUsers,
    formatDate,
    isToday,
    isValidBirthDate
  };
};