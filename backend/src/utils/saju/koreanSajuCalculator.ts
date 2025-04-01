/**
 * 韓国式四柱推命計算モジュール
 * 実際のサンプルデータから抽出したアルゴリズムに基づく実装
 * 
 * データソース: 韓国の四柱推命サイトから収集した複数のサンプル
 */

import { FourPillars, Pillar } from './fourPillars';

// 天干（十干）
export const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];

// 地支（十二支）
export const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

// 十二支の漢字に対応する動物
export const BRANCH_ANIMALS = ["鼠", "牛", "虎", "兎", "龍", "蛇", "馬", "羊", "猿", "鶏", "犬", "猪"];

// 天干の五行属性
export const STEM_ELEMENTS = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水'
};

// 地支の五行属性
export const BRANCH_ELEMENTS = {
  '子': '水', '丑': '土',
  '寅': '木', '卯': '木',
  '辰': '土', '巳': '火',
  '午': '火', '未': '土',
  '申': '金', '酉': '金',
  '戌': '土', '亥': '水'
};

// 天干の陰陽
export const STEM_YIN_YANG = {
  '甲': '陽', '乙': '陰',
  '丙': '陽', '丁': '陰',
  '戊': '陽', '己': '陰',
  '庚': '陽', '辛': '陰',
  '壬': '陽', '癸': '陰'
};

// 五行相生関係（生む）
export const ELEMENT_GENERATES = {
  '木': '火',
  '火': '土',
  '土': '金',
  '金': '水',
  '水': '木'
};

// 五行相克関係（克す）
export const ELEMENT_CONTROLS = {
  '木': '土',
  '土': '水',
  '水': '火',
  '火': '金',
  '金': '木'
};

/**
 * 韓国式四柱推命計算のオプション
 */
export interface KoreanSajuOptions {
  gender?: 'M' | 'F';   // 性別（M=男性, F=女性）
  location?: {          // 場所の座標
    longitude: number;  // 経度
    latitude: number;   // 緯度
  };
  useLocalTime?: boolean; // 地方時を使用するか
}

/**
 * 韓国式四柱推命の計算
 * 実際のサンプルデータから抽出したアルゴリズム
 * 
 * @param birthDate 生年月日
 * @param birthHour 生まれた時間（0-23）
 * @param options 計算オプション
 * @returns 四柱情報
 */
export function calculateKoreanSaju(
  birthDate: Date, 
  birthHour: number = 12,
  options: KoreanSajuOptions = {}
): FourPillars {
  // 1. 地方時の調整
  let adjustedDate = new Date(birthDate);
  
  if (options.useLocalTime && options.location) {
    // 東経135度を標準時として時差を調整（日本標準時）
    const standardMeridian = 135;
    const timeDiffMinutes = (options.location.longitude - standardMeridian) * 4;
    adjustedDate = new Date(birthDate.getTime() + timeDiffMinutes * 60 * 1000);
    
    // デバッグ情報
    console.log('地方時調整:', `${birthDate.toISOString()} → ${adjustedDate.toISOString()}`);
  }
  
  // 2. 年柱計算（サンプルから抽出した韓国式計算式）
  const yearPillar = calculateKoreanYearPillar(adjustedDate.getFullYear());
  
  // 3. 月柱計算（年干に基づく月干の派生＋月の地支）
  const monthPillar = calculateKoreanMonthPillar(adjustedDate, yearPillar.stem);
  
  // 4. 日柱計算（旧暦日基準で60日周期）
  const dayPillar = calculateKoreanDayPillar(adjustedDate);
  
  // 5. 時柱計算（日干から派生する時干＋時刻の地支）
  const hourPillar = calculateKoreanHourPillar(dayPillar.stem, birthHour);
  
  return {
    yearPillar,
    monthPillar: {
      term: null,
      fullStemBranch: monthPillar.fullStemBranch
    },
    dayPillar,
    hourPillar
  };
}

/**
 * 韓国式年柱計算
 * @param year 西暦年
 * @returns 年柱情報
 */
export function calculateKoreanYearPillar(year: number): Pillar {
  // サンプルから抽出した計算式
  // 年干(天干): (年 + 6) % 10
  // 年支(地支): (年 + 0) % 12
  const stemIndex = (year + 6) % 10;
  const branchIndex = year % 12;
  
  return {
    stem: STEMS[stemIndex],
    branch: BRANCHES[branchIndex],
    fullStemBranch: `${STEMS[stemIndex]}${BRANCHES[branchIndex]}`
  };
}

/**
 * 韓国式月柱計算
 * @param date 日付
 * @param yearStem 年干
 * @returns 月柱情報
 */
export function calculateKoreanMonthPillar(date: Date, yearStem: string): Pillar {
  const month = date.getMonth() + 1; // 0-indexed to 1-indexed
  
  // 月支は月+1の剰余、ただし立春などの節気で変わる可能性あり
  const branchIndex = (month + 1) % 12;
  
  // 年干から基準となる月干を決定（サンプルから抽出したルール）
  // 甲己年は甲月、乙庚年は丙月、丙辛年は戊月、丁壬年は庚月、戊癸年は壬月から始まる
  const yearStemIndex = STEMS.indexOf(yearStem);
  const baseMonthStemIndex = [0, 2, 4, 6, 8][yearStemIndex % 5];
  
  // 月ごとに2ずつ増加（サンプルから）
  const monthStemIndex = (baseMonthStemIndex + ((month - 1) * 2) % 10) % 10;
  
  return {
    stem: STEMS[monthStemIndex],
    branch: BRANCHES[branchIndex],
    fullStemBranch: `${STEMS[monthStemIndex]}${BRANCHES[branchIndex]}`
  };
}

/**
 * 韓国式日柱計算
 * @param date 日付
 * @returns 日柱情報
 */
export function calculateKoreanDayPillar(date: Date): Pillar {
  // 基準日: 2024年1月1日は辛丑日とする
  const baseDate = new Date(2024, 0, 1);
  const baseStemIndex = 7; // 辛は7番目（0始まり）
  const baseBranchIndex = 1; // 丑は1番目（0始まり）
  
  // 基準日からの日数
  const diffDays = Math.floor((date.getTime() - baseDate.getTime()) / (24 * 60 * 60 * 1000));
  
  // 干支の周期で計算
  const stemIndex = (baseStemIndex + diffDays) % 10;
  const branchIndex = (baseBranchIndex + diffDays) % 12;
  
  return {
    stem: STEMS[stemIndex >= 0 ? stemIndex : stemIndex + 10],
    branch: BRANCHES[branchIndex >= 0 ? branchIndex : branchIndex + 12],
    fullStemBranch: `${STEMS[stemIndex >= 0 ? stemIndex : stemIndex + 10]}${BRANCHES[branchIndex >= 0 ? branchIndex : branchIndex + 12]}`
  };
}

/**
 * 韓国式時柱計算
 * @param dayStem 日干
 * @param hour 時間（0-23）
 * @returns 時柱情報
 */
export function calculateKoreanHourPillar(dayStem: string, hour: number): Pillar {
  // 時刻から地支を決定（子時: 23:00-00:59, 丑時: 01:00-02:59, ...）
  const branchIndex = Math.floor((hour + 1) / 2) % 12;
  
  // 日干から時干の基準値を取得（サンプルから抽出したルール）
  // 日干が甲己→時干は甲乙丙丁戊...
  // 日干が乙庚→時干は丙丁戊己庚...
  // 日干が丙辛→時干は戊己庚辛壬...
  // 日干が丁壬→時干は庚辛壬癸甲...
  // 日干が戊癸→時干は壬癸甲乙丙...
  const dayStemIndex = STEMS.indexOf(dayStem);
  const baseTimeTable = [
    [0, 2, 4, 6, 8], // 甲己
    [2, 4, 6, 8, 0], // 乙庚
    [4, 6, 8, 0, 2], // 丙辛
    [6, 8, 0, 2, 4], // 丁壬
    [8, 0, 2, 4, 6]  // 戊癸
  ];
  
  const baseTimeStemIndex = baseTimeTable[dayStemIndex % 5][0];
  const hourStemIndex = (baseTimeStemIndex + Math.floor(hour / 2)) % 10;
  
  return {
    stem: STEMS[hourStemIndex],
    branch: BRANCHES[branchIndex],
    fullStemBranch: `${STEMS[hourStemIndex]}${BRANCHES[branchIndex]}`
  };
}

/**
 * 韓国式十神関係の判定
 * @param dayStem 日干（日柱の天干）
 * @param targetStem 対象の天干
 * @returns 十神関係
 */
export function determineKoreanTenGodRelation(dayStem: string, targetStem: string): string {
  // 日主(日干)と対象の陰陽
  const dayYin = ['乙', '丁', '己', '辛', '癸'].includes(dayStem);
  const targetYin = ['乙', '丁', '己', '辛', '癸'].includes(targetStem);
  const sameSex = dayYin === targetYin;
  
  // 日主と対象の五行
  const dayElement = STEM_ELEMENTS[dayStem];
  const targetElement = STEM_ELEMENTS[targetStem];
  
  // 1. 同じ五行の場合
  if (dayElement === targetElement) {
    return sameSex ? '比肩' : '劫財';
  }
  
  // 2. 対象が日主を生む関係
  if (ELEMENT_GENERATES[targetElement] === dayElement) {
    return sameSex ? '偏印' : '正印';
  }
  
  // 3. 対象が日主を克する関係
  if (ELEMENT_CONTROLS[targetElement] === dayElement) {
    return sameSex ? '偏官' : '正官';
  }
  
  // 4. 日主が対象を生む関係
  if (ELEMENT_GENERATES[dayElement] === targetElement) {
    return sameSex ? '食神' : '傷官';
  }
  
  // 5. 日主が対象を克する関係
  if (ELEMENT_CONTROLS[dayElement] === targetElement) {
    return sameSex ? '偏財' : '正財';
  }
  
  return '不明';
}

/**
 * 干支から五行属性を取得
 * @param stem 天干
 * @returns 五行属性
 */
export function getElementFromStem(stem: string): string {
  return STEM_ELEMENTS[stem] || '不明';
}

/**
 * 天干が陰性かどうか
 * @param stem 天干
 * @returns 陰性ならtrue
 */
export function isStemYin(stem: string): boolean {
  return ['乙', '丁', '己', '辛', '癸'].includes(stem);
}

/**
 * 地支の蔵干（地支に内包される天干）を取得
 * @param branch 地支
 * @returns 蔵干の配列
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