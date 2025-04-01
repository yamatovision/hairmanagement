/**
 * 韓国式四柱推命（사주팔자）計算モジュール
 * 旧暦に基づき、より正確な四柱推命の計算を行います
 * 
 * 変更履歴:
 * - 2025/03/31: 初期実装
 */

import { LunarCalendarCache, adjustLocalTime } from './lunarCalendarAPI';
import { Pillar, FourPillars } from './fourPillars';
import { STEMS, BRANCHES } from './calendar';

/**
 * 韓国式四柱計算のオプション
 */
export interface KoreanSajuOptions {
  gender?: 'M' | 'F';        // 性別
  location?: {               // 出生地の座標
    longitude: number;       // 経度（東経は正、西経は負）
    latitude: number;        // 緯度（北緯は正、南緯は負）
  };
  useLocalTime?: boolean;    // 地方時を使用するか
}

/**
 * 韓国式四柱推命計算
 * 旧暦と地方時を考慮したより正確な計算
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
  try {
    // 1. 地方時を考慮した時間調整（オプション）
    let adjustedDate = new Date(birthDate);
    
    if (options.useLocalTime && options.location) {
      adjustedDate = adjustLocalTime(birthDate, options.location.longitude);
      console.log('地方時調整:', 
        `${birthDate.toISOString()} → ${adjustedDate.toISOString()}`);
    }
    
    // 2. 旧暦情報を取得
    const calendarInfo = await LunarCalendarCache.getDay(adjustedDate);
    
    if (!calendarInfo) {
      throw new Error('暦情報を取得できませんでした');
    }
    
    // 3. 年柱を計算
    const yearPillar = {
      stem: calendarInfo.zyusi,
      branch: calendarInfo.eto,
      fullStemBranch: `${calendarInfo.zyusi}${calendarInfo.eto}`
    };
    
    // 4. 月柱を計算（基本的に旧暦から取得、節気に注意）
    // 注：実際には節気に基づいて月柱が変わる場合があります
    const monthPillar = {
      term: calendarInfo.sekki || null,
      fullStemBranch: calculateMonthStemBranch(calendarInfo.kyurekim, yearPillar.stem)
    };
    
    // 5. 日柱を計算
    const dayPillar = {
      stem: calendarInfo.zyusi,
      branch: calendarInfo.zyunisi,
      fullStemBranch: `${calendarInfo.zyusi}${calendarInfo.zyunisi}`
    };
    
    // 6. 時柱を計算
    const hourPillar = calculateHourPillar(dayPillar.stem, birthHour);
    
    return {
      yearPillar,
      monthPillar,
      dayPillar,
      hourPillar
    };
  } catch (error) {
    console.error('韓国式四柱推命計算エラー:', error);
    throw error;
  }
}

/**
 * 旧暦月と年干から月干支を計算
 * @param lunarMonth 旧暦月
 * @param yearStem 年柱の天干
 * @returns 月干支（天干地支）
 */
function calculateMonthStemBranch(lunarMonth: number, yearStem: string): string {
  // 月の地支を決定（1月→寅、2月→卯、...）
  const monthBranchIndex = (lunarMonth + 1) % 12; // 1月は寅(2)に対応
  const monthBranch = BRANCHES[monthBranchIndex];
  
  // 年の天干から月の天干を計算
  const yearStemIndex = STEMS.indexOf(yearStem);
  const baseMonthStemIndex = (yearStemIndex % 5) * 2; // 甲己→甲, 乙庚→丙, 丙辛→戊, 丁壬→庚, 戊癸→壬
  
  // 月ごとの天干の調整
  const monthStemIndex = (baseMonthStemIndex + ((lunarMonth - 1) % 10)) % 10;
  const monthStem = STEMS[monthStemIndex];
  
  return `${monthStem}${monthBranch}`;
}

/**
 * 時柱を計算する
 * @param dayStem 日柱の天干
 * @param hour 時間（0-23）
 * @returns 時柱情報
 */
function calculateHourPillar(dayStem: string, hour: number): Pillar {
  // 1. 時刻から地支を決定
  // 子(23:00-00:59), 丑(01:00-02:59), 寅(03:00-04:59), ...
  const branchIndex = Math.floor((hour + 1) / 2) % 12;
  const branch = BRANCHES[branchIndex];
  
  // 2. 日干から時干を決定
  const dayStemIndex = STEMS.indexOf(dayStem);
  const stemMap = [
    [0, 2, 4, 6, 8], // 甲己→甲乙丙丁戊
    [2, 4, 6, 8, 0], // 乙庚→丙丁戊己庚
    [4, 6, 8, 0, 2], // 丙辛→戊己庚辛壬
    [6, 8, 0, 2, 4], // 丁壬→庚辛壬癸甲
    [8, 0, 2, 4, 6]  // 戊癸→壬癸甲乙丙
  ];
  
  const stemBase = stemMap[dayStemIndex % 5][Math.floor(hour / 2) % 5];
  const stem = STEMS[stemBase];
  
  return {
    stem,
    branch,
    fullStemBranch: `${stem}${branch}`
  };
}

/**
 * 韓国式四柱推命の運勢を解釈する
 * @param fourPillars 四柱
 * @param gender 性別
 * @returns 解釈テキスト
 */
export function interpretKoreanSaju(fourPillars: FourPillars, gender?: 'M' | 'F'): string {
  // 解釈ロジックは複雑なため、基本的な情報のみ出力
  const dayMaster = fourPillars.dayPillar.stem;
  
  let interpretation = `日主(日柱の天干): ${dayMaster}\n`;
  interpretation += `陰陽: ${isStemYin(dayMaster) ? '陰' : '陽'}\n`;
  interpretation += `五行: ${stemToElement(dayMaster)}\n\n`;
  
  // 各柱の情報
  interpretation += `年柱: ${fourPillars.yearPillar.fullStemBranch}\n`;
  interpretation += `月柱: ${fourPillars.monthPillar.fullStemBranch}\n`;
  interpretation += `日柱: ${fourPillars.dayPillar.fullStemBranch}\n`;
  interpretation += `時柱: ${fourPillars.hourPillar.fullStemBranch}\n\n`;
  
  // 実際の命理解釈では、十神関係、蔵干、五行バランス、大運などを詳細に分析します
  
  return interpretation;
}

/**
 * 天干が陰かどうかを判定する
 * @param stem 天干
 * @returns 陰かどうか
 */
export function isStemYin(stem: string): boolean {
  return ['乙', '丁', '己', '辛', '癸'].includes(stem);
}

/**
 * 天干から五行を取得
 * @param stem 天干
 * @returns 五行
 */
export function stemToElement(stem: string): string {
  const elementMap: Record<string, string> = {
    '甲': '木', '乙': '木',
    '丙': '火', '丁': '火',
    '戊': '土', '己': '土',
    '庚': '金', '辛': '金',
    '壬': '水', '癸': '水'
  };
  
  return elementMap[stem] || '不明';
}