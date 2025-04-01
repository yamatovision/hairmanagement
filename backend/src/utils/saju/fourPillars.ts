/**
 * 四柱推命の計算ロジックを提供するモジュール
 * 年柱、月柱、日柱、時柱の計算を行います
 * 
 * 変更履歴:
 * - 2025/03/31: 初期実装 (AppGenius)
 */

import { calculateDayPillar, calculateMonthPillar, STEMS, BRANCHES } from './calendar';

// 四柱の型定義
export interface Pillar {
  stem: string;
  branch: string;
  fullStemBranch: string;
}

export interface FourPillars {
  yearPillar: Pillar;
  monthPillar: {
    term: string | null;
    fullStemBranch: string;
  };
  dayPillar: Pillar;
  hourPillar: Pillar;
}

/**
 * 年柱を計算する関数
 * @param year - 年（数値）
 * @returns 年柱情報
 */
export function calculateYearPillar(year: number): Pillar {
  // 60年周期で干支を計算
  const stemIndex = (year - 4) % 10;
  const branchIndex = (year - 4) % 12;
  
  return {
    stem: STEMS[stemIndex],
    branch: BRANCHES[branchIndex],
    fullStemBranch: STEMS[stemIndex] + BRANCHES[branchIndex]
  };
}

/**
 * 時柱を計算する関数
 * @param dayStem - 日柱の天干
 * @param hour - 時間（0-23）
 * @returns 時柱情報
 */
export function calculateHourPillar(dayStem: string, hour: number): Pillar {
  // 時の地支
  const branchIndex = Math.floor((hour + 1) / 2) % 12;
  
  // 日の天干から時の天干を導出
  const dayStemIndex = STEMS.indexOf(dayStem);
  const hourStemBase = (dayStemIndex * 2) % 10;
  const hourStemIndex = (hourStemBase + Math.floor(hour / 2)) % 10;
  
  return {
    stem: STEMS[hourStemIndex],
    branch: BRANCHES[branchIndex],
    fullStemBranch: STEMS[hourStemIndex] + BRANCHES[branchIndex]
  };
}

/**
 * 四柱（年柱、月柱、日柱、時柱）を計算する
 * @param date - 生年月日
 * @param hour - 生まれた時間（0-23）
 * @return 四柱情報
 */
export function calculateFourPillars(date: Date, hour: number): FourPillars {
  // 年柱の計算
  const yearPillar = calculateYearPillar(date.getFullYear());
  
  // 月柱の計算
  const monthPillar = calculateMonthPillar(date);
  
  // 日柱の計算
  const dayPillar = calculateDayPillar(date);
  
  // 時柱の計算
  const hourPillar = calculateHourPillar(dayPillar.stem, hour);
  
  return {
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar
  };
}

/**
 * 干支から五行属性に変換する
 * @param stem - 天干
 * @returns 五行属性
 */
export function stemToElement(stem: string): string {
  const stemElementMap = {
    '甲': '木', '乙': '木',
    '丙': '火', '丁': '火',
    '戊': '土', '己': '土',
    '庚': '金', '辛': '金',
    '壬': '水', '癸': '水'
  };
  
  return stemElementMap[stem] || '不明';
}

/**
 * 地支から蔵干（内包する天干）を取得する
 * @param branch - 地支
 * @returns 蔵干配列
 */
export function getHiddenStems(branch: string): string[] {
  const hiddenStemsMap = {
    '子': ['癸'],
    '丑': ['己', '癸', '辛'],
    '寅': ['甲', '丙', '戊'],
    '卯': ['乙'],
    '辰': ['戊', '乙', '癸'],
    '巳': ['丙', '庚', '戊'],
    '午': ['丁', '己'],
    '未': ['己', '丁', '乙'],
    '申': ['庚', '壬', '戊'],
    '酉': ['辛'],
    '戌': ['戊', '辛', '丁'],
    '亥': ['壬', '甲']
  };
  
  return hiddenStemsMap[branch] || [];
}

/**
 * 天干が陰かどうかを判定する
 * @param stem - 天干
 * @returns 陰ならtrue、陽ならfalse
 */
export function isStemYin(stem: string): boolean {
  const yinStems = ['乙', '丁', '己', '辛', '癸'];
  return yinStems.includes(stem);
}

/**
 * 地支が陰かどうかを判定する
 * @param branch - 地支
 * @returns 陰ならtrue、陽ならfalse
 */
export function isBranchYin(branch: string): boolean {
  const yinBranches = ['丑', '卯', '巳', '未', '酉', '亥'];
  return yinBranches.includes(branch);
}