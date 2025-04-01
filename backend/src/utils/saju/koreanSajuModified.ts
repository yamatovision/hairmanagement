/**
 * 韓国式四柱推命計算モジュール - 理論に基づいた実装
 */

import { FourPillars, Pillar } from './fourPillars';
import { STEMS, BRANCHES } from './calendar';
import { adjustLocalTime } from './lunarCalendarAPI';

/**
 * 韓国式四柱推命計算のオプション
 */
export interface KoreanSajuOptions {
  gender?: 'M' | 'F';
  location?: {
    longitude: number;
    latitude: number;
  };
  useLocalTime?: boolean;
}

/**
 * 韓国式四柱推命計算 - 理論に基づいた実装
 * @param birthDate 生年月日
 * @param birthHour 生まれた時間（0-23）
 * @param options オプション設定
 * @returns 四柱情報
 */
export async function calculateKoreanFourPillars(
  birthDate: Date, 
  birthHour: number = 12,
  options: KoreanSajuOptions = {}
): Promise<FourPillars> {
  // 1. 地方時の調整
  let adjustedDate = new Date(birthDate);
  
  if (options.useLocalTime && options.location) {
    adjustedDate = adjustLocalTime(birthDate, options.location.longitude);
    console.log('地方時調整:', `${birthDate.toISOString()} → ${adjustedDate.toISOString()}`);
  }
  
  // 2. 年柱を計算（韓国式計算）
  const year = adjustedDate.getFullYear();
  const yearStem = STEMS[(year + 4) % 10]; // 韓国式の計算式: 2019年 -> 丁
  const yearBranch = BRANCHES[(year + 8) % 12]; // 韓国式の計算式: 2019年 -> 亥
  
  const yearPillar: Pillar = {
    stem: yearStem,
    branch: yearBranch,
    fullStemBranch: `${yearStem}${yearBranch}`
  };

  // 3. 月柱を計算
  // 月の地支を決定（正月→寅、2月→卯、...）
  const solarMonth = adjustedDate.getMonth() + 1;
  // 月の地支インデックス: 1月は寅(2)に対応
  const monthBranchIndex = (solarMonth + 1) % 12;
  
  // 年の天干から月の天干を計算
  const yearStemIndex = STEMS.indexOf(yearStem);
  // 甲己年→甲寅月, 乙庚年→丙寅月, 丙辛年→戊寅月, 丁壬年→庚寅月, 戊癸年→壬寅月
  const baseMonthStemIndex = [0, 2, 4, 6, 8][yearStemIndex % 5];
  
  // 月ごとの天干の計算
  const monthStemOffset = (solarMonth - 1) % 10;
  const monthStemIndex = (baseMonthStemIndex + monthStemOffset) % 10;
  
  const monthStem = STEMS[monthStemIndex];
  const monthBranch = BRANCHES[monthBranchIndex];
  const monthStemBranch = `${monthStem}${monthBranch}`;
  
  // 4. 日柱を計算
  // 基準日（1900年1月1日は甲子）からの日数で計算
  const baseDate = new Date(1900, 0, 1);
  const diffDays = Math.floor((adjustedDate.getTime() - baseDate.getTime()) / (24 * 60 * 60 * 1000));
  
  const dayStemIndex = (diffDays + 10) % 10; // 甲=0, 乙=1, ...
  const dayBranchIndex = (diffDays + 12) % 12; // 子=0, 丑=1, ...
  
  const dayStem = STEMS[dayStemIndex];
  const dayBranch = BRANCHES[dayBranchIndex];
  
  const dayPillar: Pillar = {
    stem: dayStem,
    branch: dayBranch,
    fullStemBranch: `${dayStem}${dayBranch}`
  };
  
  // 5. 時柱を計算
  // 子時(23:00-00:59)から始まる
  const branchIndex = Math.floor((birthHour + 1) / 2) % 12;
  const branch = BRANCHES[branchIndex];
  
  // 日干から時干を決定
  const dayStemIdx = STEMS.indexOf(dayStem);
  // 韓国式時干算出
  const stemBaseIdx = [0, 2, 4, 6, 8][dayStemIdx % 5]; // 干支の五行による変換
  const hourStemIdx = (stemBaseIdx + Math.floor(birthHour / 2)) % 10;
  const hourStem = STEMS[hourStemIdx];
  
  const hourPillar: Pillar = {
    stem: hourStem,
    branch,
    fullStemBranch: `${hourStem}${branch}`
  };
  
  return {
    yearPillar,
    monthPillar: {
      term: null, // 節気情報は現在サポートなし
      fullStemBranch: monthStemBranch
    },
    dayPillar,
    hourPillar
  };
}

/**
 * 十神関係を判定する - 理論に基づいた実装
 * @param dayStem 日主（日柱の天干）
 * @param targetStem 比較対象の天干
 * @returns 十神関係
 */
export function determineTenGodRelation(dayStem: string, targetStem: string): string {
  // 五行の定義
  const stemToElement = {
    '甲': '木', '乙': '木',
    '丙': '火', '丁': '火',
    '戊': '土', '己': '土',
    '庚': '金', '辛': '金',
    '壬': '水', '癸': '水'
  };
  
  // 陰陽の定義
  const stemYin = ['乙', '丁', '己', '辛', '癸'].includes(dayStem);
  const targetYin = ['乙', '丁', '己', '辛', '癸'].includes(targetStem);
  
  // 日主と対象の五行
  const dayElement = stemToElement[dayStem];
  const targetElement = stemToElement[targetStem];
  
  // 相生関係（生む関係）
  const generates = {
    '木': '火',
    '火': '土',
    '土': '金',
    '金': '水',
    '水': '木'
  };
  
  // 相剋関係（克す関係）
  const controls = {
    '木': '土',
    '土': '水',
    '水': '火',
    '火': '金',
    '金': '木'
  };
  
  // 十神判定ロジック
  if (dayElement === targetElement) {
    // 同じ五行の場合
    if (stemYin === targetYin) {
      return '比肩'; // 同気同性
    } else {
      return '劫財'; // 同気異性
    }
  } else if (generates[targetElement] === dayElement) {
    // 対象が日主を生む関係
    if (stemYin === targetYin) {
      return '偏印'; // 生我同性
    } else {
      return '正印'; // 生我異性
    }
  } else if (controls[targetElement] === dayElement) {
    // 対象が日主を克する関係
    if (stemYin === targetYin) {
      return '偏官'; // 克我同性
    } else {
      return '正官'; // 克我異性
    }
  } else if (generates[dayElement] === targetElement) {
    // 日主が対象を生む関係
    if (stemYin === targetYin) {
      return '食神'; // 我生同性
    } else {
      return '傷官'; // 我生異性
    }
  } else if (controls[dayElement] === targetElement) {
    // 日主が対象を克する関係
    if (stemYin === targetYin) {
      return '偏財'; // 我克同性
    } else {
      return '正財'; // 我克異性
    }
  }
  
  // デフォルト（ここには来ないはず）
  return '不明';
}