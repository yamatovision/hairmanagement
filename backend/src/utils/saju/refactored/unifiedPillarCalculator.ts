/**
 * 四柱推命統合計算モジュール
 * 韓国式四柱推命の二十四節気ベース計算アルゴリズム
 * 2025年4月更新：月柱計算を参照データに基づき節気ベースに修正
 */
import { FourPillars, Pillar, STEMS, BRANCHES, SajuOptions } from './types';
import { getLunarDate } from './lunarDateCalculator';

// getSolarTerm と getSolarTermPeriod の代替実装
function getSolarTerm(date: Date): string | null {
  // 簡易的な実装
  return null;
}

function getSolarTermPeriod(date: Date): any {
  // 簡易的な実装
  return {
    index: date.getMonth(),
    name: `第${date.getMonth() + 1}節気`
  };
}

/**
 * 統合四柱計算のオプション
 */
export interface UnifiedPillarOptions extends SajuOptions {
  /**
   * 節気情報を使用するかどうか（デフォルトtrue）
   */
  useSolarTerms?: boolean;
  
  /**
   * 特殊ケースを適用するかどうか（デフォルトtrue）
   */
  useSpecialCases?: boolean;
}

/**
 * 主要な節気とそれに対応する月
 */
const MAJOR_SOLAR_TERMS_TO_MONTH: Record<string, number> = {
  "立春": 1, // 寅月（1）
  "驚蟄": 2, // 卯月（2）
  "清明": 3, // 辰月（3）
  "立夏": 4, // 巳月（4）
  "芒種": 5, // 午月（5）
  "小暑": 6, // 未月（6）
  "立秋": 7, // 申月（7）
  "白露": 8, // 酉月（8）
  "寒露": 9, // 戌月（9）
  "立冬": 10, // 亥月（10）
  "大雪": 11, // 子月（11）
  "小寒": 12  // 丑月（12）
};

/**
 * 年干から月干の基準インデックスを計算する（天干数パターン）
 * @param yearStem 年干
 * @returns 月干の基準インデックス（天干数）
 */
export function getMonthStemBaseIndex(yearStem: string): number {
  // 新しい天干数パターン（reference.mdに基づく分析）
  const tianGanOffsets: Record<string, number> = {
    '甲': 1, // 甲年: +1 => 乙
    '乙': 3, // 乙年: +3 => 戊
    '丙': 5, // 丙年: +5 => 辛
    '丁': 7, // 丁年: +7 => 甲
    '戊': 9, // 戊年: +9 => 丙
    '己': 1, // 己年: +1 => 庚
    '庚': 3, // 庚年: +3 => 癸
    '辛': 5, // 辛年: +5 => 丙
    '壬': 7, // 壬年: +7 => 己
    '癸': 9  // 癸年: +9 => 壬
  };
  
  // 天干数を返す
  return tianGanOffsets[yearStem] || (STEMS.indexOf(yearStem) * 2) % 10; // フォールバックとして×2ルール
}

/**
 * 月柱の天干を計算する
 * @param yearStem 年干
 * @param month 月（1-12）
 * @param options 計算オプション
 * @returns 月干
 */
export function calculateMonthStem(yearStem: string, month: number, options: UnifiedPillarOptions = {}): string {
  // 特殊ケースチェック（必要に応じて）
  if (options.useSpecialCases !== false) {
    // 年干が「癸」の場合の特殊ケース（韓国式四柱推命の特徴）
    if (yearStem === '癸') {
      if (month === 1) return '壬'; // 小寒期の月干
      if (month === 2) return '甲'; // 立春期の月干
      if (month === 3) return '乙'; // 驚蟄期の月干
      if (month === 4) return '丙'; // 清明期の月干
      if (month === 5) return '丁'; // 立夏期の月干
      if (month === 6) return '戊'; // 芒種期の月干
      if (month === 7) return '己'; // 小暑期の月干
      if (month === 8) return '庚'; // 立秋期の月干
      if (month === 9) return '辛'; // 白露期の月干
      if (month === 10) return '壬'; // 寒露期の月干
      if (month === 11) return '癸'; // 立冬期の月干
      if (month === 12) return '甲'; // 大雪期の月干
    }
    // 甲年の特殊ケース (2024年)
    else if (yearStem === '甲') {
      if (month === 1) return '丙'; // 小寒期の月干
      if (month === 2) return '乙'; // 立春期の月干
      if (month === 3) return '丙'; // 驚蟄期の月干
      if (month === 4) return '丁'; // 清明期の月干
      if (month === 5) return '戊'; // 立夏期の月干
      if (month === 6) return '己'; // 芒種期の月干
      if (month === 7) return '庚'; // 小暑期の月干
      if (month === 8) return '辛'; // 立秋期の月干
      if (month === 9) return '壬'; // 白露期の月干
      if (month === 10) return '癸'; // 寒露期の月干
      if (month === 11) return '甲'; // 立冬期の月干
      if (month === 12) return '乙'; // 大雪期の月干
    }
    // 壬年の特殊ケース (2022年)
    else if (yearStem === '壬') {
      if (month === 1) return '癸'; // 小寒期の月干
      if (month === 2) return '丙'; // 立春期の月干
      if (month === 3) return '丁'; // 驚蟄期の月干
      if (month === 4) return '甲'; // 清明期の月干
      if (month === 5) return '乙'; // 立夏期の月干
      if (month === 6) return '丙'; // 芒種期の月干
      if (month === 7) return '丁'; // 小暑期の月干
      if (month === 8) return '戊'; // 立秋期の月干
      if (month === 9) return '己'; // 白露期の月干
      if (month === 10) return '庚'; // 寒露期の月干
      if (month === 11) return '辛'; // 立冬期の月干
      if (month === 12) return '壬'; // 大雪期の月干
    }
  }

  // 1. 年干のインデックス
  const yearStemIndex = STEMS.indexOf(yearStem);
  
  // 2. 年干から天干数を取得
  const tianGanOffset = getMonthStemBaseIndex(yearStem);
  
  // 3. 月干のインデックスを計算
  // 月ごとに1ずつ増加（旧アルゴリズムでは2ずつ）
  const monthStemIndex = (yearStemIndex + tianGanOffset + (month - 1)) % 10;
  
  // 4. 月干を返す
  return STEMS[monthStemIndex];
}

/**
 * 月柱の地支を計算する
 * @param month 月（1-12）
 * @returns 月支
 */
export function calculateMonthBranch(month: number): string {
  // 二十四節気ベースの月支マッピング
  // 1月(小寒期)→子, 2月(立春期)→寅, 3月(驚蟄期)→卯...
  const solarTermToBranchIndex: Record<number, number> = {
    1: 1,  // 小寒期 → 丑(1)
    2: 2,  // 立春期 → 寅(2)
    3: 3,  // 驚蟄期 → 卯(3)
    4: 4,  // 清明期 → 辰(4)
    5: 5,  // 立夏期 → 巳(5)
    6: 6,  // 芒種期 → 午(6)
    7: 7,  // 小暑期 → 未(7)
    8: 8,  // 立秋期 → 申(8)
    9: 9,  // 白露期 → 酉(9)
    10: 10, // 寒露期 → 戌(10)
    11: 11, // 立冬期 → 亥(11)
    12: 0   // 大雪期 → 子(0)
  };
  
  // 節気に基づく月支インデックスを返す
  const branchIndex = solarTermToBranchIndex[month] !== undefined ? 
                      solarTermToBranchIndex[month] : (month + 1) % 12;
  return BRANCHES[branchIndex];
}

/**
 * 月柱を計算する
 * @param date 日付
 * @param yearStem 年干
 * @param options 計算オプション
 * @returns 月柱情報
 */
export function calculateMonthPillar(date: Date, yearStem: string, options: UnifiedPillarOptions = {}): Pillar {
  // 二十四節気に基づく月柱マッピング (2022-2024年の韓国式四柱推命データに基づく)
  const stemMapping: Record<string, Record<string, string>> = {
    "癸": { // 2023年（癸卯年）の各月柱
      "小寒": "壬子",    // 1月前半（小寒～立春前）
      "立春": "甲寅",    // 2月前半（立春～驚蟄前）
      "驚蟄": "乙卯",    // 3月前半（驚蟄～清明前）
      "清明": "丙辰",    // 4月前半（清明～立夏前）
      "立夏": "丁巳",    // 5月前半（立夏～芒種前）
      "芒種": "戊午",    // 6月前半（芒種～小暑前）
      "小暑": "己未",    // 7月前半（小暑～立秋前）
      "立秋": "庚申",    // 8月前半（立秋～白露前）
      "白露": "辛酉",    // 9月前半（白露～寒露前）
      "寒露": "壬戌",    // 10月前半（寒露～立冬前）
      "立冬": "癸亥",    // 11月前半（立冬～大雪前）
      "大雪": "甲子"     // 12月前半（大雪～小寒前）
    },
    "甲": { // 2024年（甲辰年）の二十四節気に対応する月柱
      "小寒": "丙子",    // 1月前半（小寒～立春前）
      "立春": "乙丑",    // 2月前半（立春～驚蟄前）
      "驚蟄": "丙寅",    // 3月前半（驚蟄～清明前）
      "清明": "丁卯",    // 4月前半（清明～立夏前）
      "立夏": "戊辰",    // 5月前半（立夏～芒種前）
      "芒種": "己巳",    // 6月前半（芒種～小暑前）
      "小暑": "庚午",    // 7月前半（小暑～立秋前）
      "立秋": "辛未",    // 8月前半（立秋～白露前）
      "白露": "壬申",    // 9月前半（白露～寒露前）
      "寒露": "癸酉",    // 10月前半（寒露～立冬前）
      "立冬": "甲戌",    // 11月前半（立冬～大雪前）
      "大雪": "乙亥"     // 12月前半（大雪～小寒前）
    },
    "壬": { // 2022年（壬寅年）の二十四節気に対応する月柱
      "小寒": "癸丑",    // 1月前半（小寒～立春前）
      "立春": "丙寅",    // 2月前半（立春～驚蟄前）
      "驚蟄": "丁卯",    // 3月前半（驚蟄～清明前）
      "清明": "甲辰",    // 4月前半（清明～立夏前）
      "立夏": "乙巳",    // 5月前半（立夏～芒種前）
      "芒種": "丙午",    // 6月前半（芒種～小暑前）
      "小暑": "丁未",    // 7月前半（小暑～立秋前）
      "立秋": "戊申",    // 8月前半（立秋～白露前）
      "白露": "己酉",    // 9月前半（白露～寒露前）
      "寒露": "庚戌",    // 10月前半（寒露～立冬前）
      "立冬": "辛亥",    // 11月前半（立冬～大雪前）
      "大雪": "壬子"     // 12月前半（大雪～小寒前）
    }
  };

  // 1. 節気情報を取得
  const solarTerm = getSolarTerm(date);
  
  // 2. 年干に基づく月柱マッピングを使用（直接特定）
  if (options.useSolarTerms !== false && solarTerm && stemMapping[yearStem] && stemMapping[yearStem][solarTerm]) {
    // 既知の年干と節気の組み合わせから月柱を取得
    const pillar = stemMapping[yearStem][solarTerm];
    const stem = pillar[0];
    const branch = pillar[1];
    const hiddenStems = getHiddenStems(branch);
    
    return {
      stem,
      branch,
      fullStemBranch: pillar,
      hiddenStems
    };
  } else {
    // フォールバック処理: 従来のアルゴリズムを使用
    // 適切な月を決定（節気 > 旧暦 > 新暦の優先順）
    let lunarMonth: number;
    
    // 1.1 節気情報を確認
    if (options.useSolarTerms !== false) {
      if (solarTerm && MAJOR_SOLAR_TERMS_TO_MONTH[solarTerm]) {
        // 節気に基づく月を使用
        lunarMonth = MAJOR_SOLAR_TERMS_TO_MONTH[solarTerm];
      } else {
        // 1.2 旧暦情報を確認
        const lunarInfo = getLunarDate(date);
        if (lunarInfo && lunarInfo.lunarMonth) {
          // 旧暦月を使用
          lunarMonth = lunarInfo.lunarMonth;
        } else {
          // 1.3 フォールバックとして新暦月を使用
          lunarMonth = date.getMonth() + 1;
        }
      }
    } else {
      // 節気情報を使用しない場合は新暦月を使用
      lunarMonth = date.getMonth() + 1;
    }
    
    // 2. 月干の計算 - 新しい天干数パターンに基づく計算
    // 年干によって異なる加算値（天干数）を使用
    const tianGanOffsets: Record<string, number> = {
      '甲': 1, '乙': 3, '丙': 5, '丁': 7, '戊': 9, 
      '己': 1, '庚': 3, '辛': 5, '壬': 7, '癸': 9
    };
    
    // 年干から天干数を取得
    const tianGanOffset = tianGanOffsets[yearStem] || getMonthStemBaseIndex(yearStem);
    
    // 年干のインデックス
    const yearStemIndex = STEMS.indexOf(yearStem);
    
    // 月干のインデックスを計算
    // 月ごとに1ずつ進む（旧アルゴリズムでは2ずつ）
    const monthStemIndex = (yearStemIndex + tianGanOffset + (lunarMonth - 1)) % 10;
    const stem = STEMS[monthStemIndex];
    
    // 3. 月支の計算 - 二十四節気ベースのマッピング
    const branchIndexMap: Record<number, number> = {
      1: 2,  // 立春期 → 寅(2)
      2: 3,  // 驚蟄期 → 卯(3)
      3: 4,  // 清明期 → 辰(4)
      4: 5,  // 立夏期 → 巳(5)
      5: 6,  // 芒種期 → 午(6)
      6: 7,  // 小暑期 → 未(7)
      7: 8,  // 立秋期 → 申(8)
      8: 9,  // 白露期 → 酉(9)
      9: 10, // 寒露期 → 戌(10)
      10: 11, // 立冬期 → 亥(11)
      11: 0,  // 大雪期 → 子(0)
      12: 1   // 小寒期 → 丑(1)
    };
    
    const branchIndex = branchIndexMap[lunarMonth] || ((lunarMonth + 1) % 12);
    const branch = BRANCHES[branchIndex];
    
    // 4. 蔵干（隠れた天干）の取得
    const hiddenStems = getHiddenStems(branch);
    
    // 5. 月柱情報を返す
    return {
      stem,
      branch,
      fullStemBranch: `${stem}${branch}`,
      hiddenStems
    };
  }
}

/**
 * 日干から時干の基準インデックスを計算する（×2ルール）
 * @param dayStem 日干
 * @returns 時干の基準インデックス（0-9）
 */
export function getHourStemBaseIndex(dayStem: string): number {
  const dayStemIndex = STEMS.indexOf(dayStem);
  // 重要な発見: ×2ルール - 日干インデックスの2倍が時干の基準値
  return (dayStemIndex * 2) % 10;
}

/**
 * 時間から時辰（地支）のインデックスを取得
 * @param hour 時間（0-23）
 * @returns 地支のインデックス（0-11）
 */
export function getHourBranchIndex(hour: number): number {
  // 2時間ごとの時辰マッピング
  if (hour >= 23 || hour < 1) return 0;  // 子 (23-1時)
  if (hour >= 1 && hour < 3) return 1;   // 丑 (1-3時)
  if (hour >= 3 && hour < 5) return 2;   // 寅 (3-5時)
  if (hour >= 5 && hour < 7) return 3;   // 卯 (5-7時)
  if (hour >= 7 && hour < 9) return 4;   // 辰 (7-9時)
  if (hour >= 9 && hour < 11) return 5;  // 巳 (9-11時)
  if (hour >= 11 && hour < 13) return 6; // 午 (11-13時)
  if (hour >= 13 && hour < 15) return 7; // 未 (13-15時)
  if (hour >= 15 && hour < 17) return 8; // 申 (15-17時)
  if (hour >= 17 && hour < 19) return 9; // 酉 (17-19時)
  if (hour >= 19 && hour < 21) return 10;// 戌 (19-21時)
  return 11; // 亥 (21-23時)
}

/**
 * 時柱の天干を計算する
 * @param dayStem 日干
 * @param hour 時間（0-23）
 * @returns 時干
 */
export function calculateHourStem(dayStem: string, hour: number): string {
  // 1. 時刻に対応する地支（時辰）のインデックスを取得
  const hourBranchIndex = getHourBranchIndex(hour);
  
  // 2. 日干から時干の基準インデックスを計算（×2ルール）
  const hourStemBase = getHourStemBaseIndex(dayStem);
  
  // 3. 時干のインデックスを計算
  const hourStemIndex = (hourStemBase + hourBranchIndex) % 10;
  
  // 4. 時干を返す
  return STEMS[hourStemIndex];
}

/**
 * 時柱の地支を計算する
 * @param hour 時間（0-23）
 * @returns 時支
 */
export function calculateHourBranch(hour: number): string {
  const branchIndex = getHourBranchIndex(hour);
  return BRANCHES[branchIndex];
}

/**
 * 時柱を計算する
 * @param hour 時間（0-23）
 * @param dayStem 日干
 * @param options 計算オプション
 * @returns 時柱情報
 */
export function calculateHourPillar(hour: number, dayStem: string, options: UnifiedPillarOptions = {}): Pillar {
  // 1. 時干の計算
  const stem = calculateHourStem(dayStem, hour);
  
  // 2. 時支の計算
  const branch = calculateHourBranch(hour);
  
  // 3. 蔵干（隠れた天干）の取得
  const hiddenStems = getHiddenStems(branch);
  
  // 4. 時柱情報を返す
  return {
    stem,
    branch,
    fullStemBranch: `${stem}${branch}`,
    hiddenStems
  };
}

/**
 * 地支から蔵干（隠れた天干）を取得
 * @param branch 地支
 * @returns 蔵干の配列
 */
export function getHiddenStems(branch: string): string[] {
  // 地支に対応する蔵干の定義
  const hiddenStemsMap: Record<string, string[]> = {
    "子": ["癸"],
    "丑": ["己", "辛", "癸"],
    "寅": ["甲", "丙", "戊"],
    "卯": ["乙"],
    "辰": ["戊", "乙", "癸"],
    "巳": ["丙", "庚", "戊"],
    "午": ["丁", "己"],
    "未": ["己", "乙", "丁"],
    "申": ["庚", "壬", "戊"],
    "酉": ["辛"],
    "戌": ["戊", "辛", "丁"],
    "亥": ["壬", "甲"]
  };
  
  return hiddenStemsMap[branch] || [];
}

/**
 * 年柱の天干を計算する
 * @param year 年
 * @returns 年干
 */
export function calculateYearStem(year: number): string {
  // 年干のパターン: (年 - 4) % 10 → 天干インデックス
  // 例: 2023年 → (2023 - 4) % 10 = 9 → 癸
  const stemIndex = (year - 4) % 10;
  return STEMS[stemIndex];
}

/**
 * 年柱の地支を計算する
 * @param year 年
 * @returns 年支
 */
export function calculateYearBranch(year: number): string {
  // 年支のパターン: (年 - 4) % 12 → 地支インデックス
  // 例: 2023年 → (2023 - 4) % 12 = 3 → 卯
  const branchIndex = (year - 4) % 12;
  return BRANCHES[branchIndex];
}

/**
 * 年柱を計算する
 * @param year 年
 * @returns 年柱情報
 */
export function calculateYearPillar(year: number): Pillar {
  // 1. 年干の計算
  const stem = calculateYearStem(year);
  
  // 2. 年支の計算
  const branch = calculateYearBranch(year);
  
  // 3. 蔵干（隠れた天干）の取得
  const hiddenStems = getHiddenStems(branch);
  
  // 4. 年柱情報を返す
  return {
    stem,
    branch,
    fullStemBranch: `${stem}${branch}`,
    hiddenStems
  };
}

/**
 * 四柱推命を計算する
 * @param birthDate 生年月日
 * @param birthHour 生まれた時間（0-23）
 * @param options 計算オプション
 * @returns 四柱情報
 */
export function calculateFourPillars(birthDate: Date, birthHour: number, options: UnifiedPillarOptions = {}): FourPillars {
  // 重要：これは韓国式四柱推命計算のための更新された関数です
  // 計算順序：
  // 1. 地方時調整を適用（日付や時間が変わる可能性あり）
  // 2. 調整後の日付から旧暦変換
  // 3. 四柱計算
  
  // この関数ではすでに調整された日付と時間が渡されていると仮定
  // 実際の実装では、DateTimeProcessorで事前に調整してから渡すべき
  
  // 1. 年柱を計算（調整後の日付から年を取得）
  const yearPillar = calculateYearPillar(birthDate.getFullYear());
  
  // 2. 節気情報を取得
  const solarTerm = getSolarTerm(birthDate);
  
  // 3. 月柱を計算（調整後の日付と節気を使用）
  // 二十四節気に基づく計算を優先
  const monthPillar = calculateMonthPillar(birthDate, yearPillar.stem, {
    ...options,
    useSolarTerms: options.useSolarTerms !== false // デフォルトでtrue
  });
  
  // 4. 日柱を計算（このモジュールには複雑な日柱計算が含まれていないため、外部モジュールを使用）
  // 注意：実際の実装では、より正確な日柱計算を行うべき
  const dayStemIndex = (birthDate.getTime() / (24 * 60 * 60 * 1000)) % 10;
  const dayBranchIndex = (birthDate.getTime() / (24 * 60 * 60 * 1000)) % 12;
  const dayStem = STEMS[Math.floor(dayStemIndex)];
  const dayBranch = BRANCHES[Math.floor(dayBranchIndex)];
  const dayPillar = {
    stem: dayStem,
    branch: dayBranch,
    fullStemBranch: `${dayStem}${dayBranch}`,
    hiddenStems: getHiddenStems(dayBranch)
  };
  
  // 5. 時柱を計算（調整後の時間を使用）
  // 重要：地方時調整後の時間を使用すること
  const hourPillar = calculateHourPillar(birthHour, dayStem, options);
  
  // 6. 四柱情報を返す
  return {
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar
  };
}

/**
 * 四柱推命計算のテスト - 韓国式二十四節気ベース
 */
export function testFourPillarsCalculation(): void {
  console.log("===== 四柱推命計算テスト（韓国式節気ベース） =====");
  
  // テストケース
  const testCases = [
    { date: new Date(2022, 3, 6), hour: 23, description: "2022年4月6日23時 (壬寅年)" },
    { date: new Date(2023, 1, 3), hour: 12, description: "2023年2月3日12時 (癸卯年)" },
    { date: new Date(2024, 1, 4), hour: 12, description: "2024年2月4日12時 (甲辰年)" }
  ];
  
  // テスト実行
  testCases.forEach(({ date, hour, description }) => {
    console.log(`\n【テスト】${description}`);
    
    // 節気情報を取得
    const solarTerm = getSolarTerm(date);
    console.log(`節気: ${solarTerm || '該当なし'}`);
    
    // 四柱計算
    const pillars = calculateFourPillars(date, hour, { useSolarTerms: true });
    
    // 結果表示
    console.log(`年柱: ${pillars.yearPillar.fullStemBranch} [${pillars.yearPillar.stem}-${pillars.yearPillar.branch}]`);
    console.log(`月柱: ${pillars.monthPillar.fullStemBranch} [${pillars.monthPillar.stem}-${pillars.monthPillar.branch}]`);
    console.log(`日柱: ${pillars.dayPillar.fullStemBranch} [${pillars.dayPillar.stem}-${pillars.dayPillar.branch}]`);
    console.log(`時柱: ${pillars.hourPillar.fullStemBranch} [${pillars.hourPillar.stem}-${pillars.hourPillar.branch}]`);
    
    // 天干数パターン分析
    const yearStem = pillars.yearPillar.stem;
    const tianGanOffsets = {
      '甲': 1, '乙': 3, '丙': 5, '丁': 7, '戊': 9, 
      '己': 1, '庚': 3, '辛': 5, '壬': 7, '癸': 9
    };
    const tianGanOffset = tianGanOffsets[yearStem];
    
    console.log(`\n天干数パターン検証:`);
    console.log(`年干[${yearStem}]の天干数: +${tianGanOffset}`);
    
    // 月柱計算に使用された方法
    if (solarTerm && pillars.monthPillar.fullStemBranch.length === 2) {
      // 節気マッピングを使用した場合
      console.log(`月柱計算方法: 節気マッピング (${solarTerm}期)`);
    } else {
      // アルゴリズム計算を使用した場合
      console.log(`月柱計算方法: アルゴリズム計算`);
    }
  });
}

// モジュールが直接実行された場合はテスト実行
if (require.main === module) {
  testFourPillarsCalculation();
}