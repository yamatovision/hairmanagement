/**
 * 運勢関連の型定義
 * 
 * 作成日: 2025/04/05
 */

import { ElementType, YinYangType, TenGodType } from './core';
import { Pillar } from './pillars';

/**
 * 四柱推命データ型（運勢計算結果）
 */
export interface SajuData {
  // 基本情報
  dayMaster: string; // 日主（日柱の天干）
  dayElement: ElementType; // 日の五行
  
  // 十神関係
  tenGod: TenGodType;
  branchTenGod: TenGodType;
  
  // 運勢評価
  compatibility: number; // 相性スコア（0-100）
  
  // 拡張情報（オプション）
  mainElement?: ElementType;
  yinYang?: YinYangType;
  rating?: string; // 評価（「非常に良好」「良好」「中立」「要注意」「困難」など）
  
  // 運勢アドバイス（オプション）
  advice?: string;
  aiGeneratedAdvice?: FortuneAdvice;
  
  // 日次カレンダー情報との関連（オプション）
  calendarInfoId?: string;
  dayPillar?: Pillar;
  
  // その他のメタデータ（オプション）
  date?: Date;
  userId?: string;
}

/**
 * AIによる運勢アドバイス
 */
export interface FortuneAdvice {
  advice: string;
  luckySectors?: string[];
  unluckySectors?: string[];
  suggestions?: string[];
}

/**
 * 相性計算結果
 */
export interface CompatibilityResult {
  compatibility: number;
  tenGodRelation: TenGodType;
  branchTenGodRelation?: TenGodType;
  description?: string;
}

/**
 * 日次運勢情報
 */
export interface DailyFortune {
  date: Date;
  userId: string;
  overallScore: number;
  rating: string;
  mainElement: ElementType;
  yinYang: YinYangType;
  luck: {
    career: number;
    health: number;
    relationships: number;
    finance: number;
  };
  advice: string;
  aiGeneratedAdvice?: FortuneAdvice;
  sajuData?: SajuData;
  dailyCalendarInfoId?: string;
}

/**
 * 日次カレンダー情報
 */
export interface DailyCalendarInfo {
  date: string;
  dayPillar: Pillar;
  mainElement: ElementType;
  yinYang: YinYangType;
  solarTerm?: string;
  lunarDate?: {
    year: number;
    month: number;
    day: number;
  };
}