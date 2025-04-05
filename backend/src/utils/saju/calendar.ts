/**
 * 四柱推命計算に使用する暦のデータと基本計算関数を提供します
 * 
 * 変更履歴:
 * - 2025/03/31: 初期実装 (AppGenius)
 */

// 十干（天干）
export const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];

// 十二支（地支）
export const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

// 基準日の設定（2025年3月1日が己巳）
export const REFERENCE_DATE = new Date(2025, 2, 1);
export const REFERENCE_STEM_INDEX = 5;  // 己は5番目（0始まり）
export const REFERENCE_BRANCH_INDEX = 5; // 巳は5番目（0始まり）

// 二十四節気データ（2025年春）
export const SOLAR_TERMS_2025 = {
  "立春": new Date(2025, 1, 3, 22, 46), // 2月3日22時46分
  "雨水": new Date(2025, 1, 18, 22, 13), // 2月18日22時13分
  "啓蟄": new Date(2025, 2, 5, 17, 8),  // 3月5日17時8分（己卯月の始まり）
  "春分": new Date(2025, 2, 20, 18, 1),  // 3月20日18時1分
  "清明": new Date(2025, 3, 4, 23, 2),   // 4月4日23時2分
  "穀雨": new Date(2025, 3, 20, 9, 55)    // 4月20日9時55分
};

// 節気と月の干支の対応表
export const TERM_TO_STEM_BRANCH: Record<string, string> = {
  "立春": "甲寅", // 正月
  "雨水": "甲寅",
  "啓蟄": "己卯", // 二月
  "春分": "己卯",
  "清明": "戊辰", // 三月
  "穀雨": "戊辰"
};

// 2025年3月の暦データ
export const CALENDAR_DATA_2025_MARCH: Record<string, { stemBranch: string, lunarDate: string }> = {
  "2025-03-01": { stemBranch: "己巳", lunarDate: "2/2" },
  "2025-03-02": { stemBranch: "庚午", lunarDate: "2/3" },
  "2025-03-03": { stemBranch: "辛未", lunarDate: "2/4" },
  "2025-03-04": { stemBranch: "壬申", lunarDate: "2/5" },
  "2025-03-05": { stemBranch: "癸酉", lunarDate: "2/6" },
  "2025-03-06": { stemBranch: "甲戌", lunarDate: "2/7" },
  "2025-03-07": { stemBranch: "乙亥", lunarDate: "2/8" },
  "2025-03-08": { stemBranch: "丙子", lunarDate: "2/9" },
  "2025-03-09": { stemBranch: "丁丑", lunarDate: "2/10" },
  "2025-03-10": { stemBranch: "戊寅", lunarDate: "2/11" },
  "2025-03-11": { stemBranch: "己卯", lunarDate: "2/12" },
  "2025-03-12": { stemBranch: "庚辰", lunarDate: "2/13" },
  "2025-03-13": { stemBranch: "辛巳", lunarDate: "2/14" },
  "2025-03-14": { stemBranch: "壬午", lunarDate: "2/15" },
  "2025-03-15": { stemBranch: "癸未", lunarDate: "2/16" },
  "2025-03-16": { stemBranch: "甲申", lunarDate: "2/17" },
  "2025-03-17": { stemBranch: "乙酉", lunarDate: "2/18" },
  "2025-03-18": { stemBranch: "丙戌", lunarDate: "2/19" },
  "2025-03-19": { stemBranch: "丁亥", lunarDate: "2/20" },
  "2025-03-20": { stemBranch: "戊子", lunarDate: "2/21" },
  "2025-03-21": { stemBranch: "己丑", lunarDate: "2/22" },
  "2025-03-22": { stemBranch: "庚寅", lunarDate: "2/23" },
  "2025-03-23": { stemBranch: "辛卯", lunarDate: "2/24" },
  "2025-03-24": { stemBranch: "壬辰", lunarDate: "2/25" },
  "2025-03-25": { stemBranch: "癸巳", lunarDate: "2/26" },
  "2025-03-26": { stemBranch: "甲午", lunarDate: "2/27" },
  "2025-03-27": { stemBranch: "乙未", lunarDate: "2/28" },
  "2025-03-28": { stemBranch: "丙申", lunarDate: "2/29" },
  "2025-03-29": { stemBranch: "丁酉", lunarDate: "2/30" },
  "2025-03-30": { stemBranch: "戊戌", lunarDate: "3/1" },
  "2025-03-31": { stemBranch: "己亥", lunarDate: "3/2" }
};

/**
 * 日付から干支（日柱）を計算する
 * @param date - 日付
 * @return 干支情報
 */
export function calculateDayPillar(date: Date) {
  // 基準日からの経過日数を計算
  const diffDays = Math.floor((date.getTime() - REFERENCE_DATE.getTime()) / (24 * 60 * 60 * 1000));
  
  // 天干と地支のインデックスを計算（60日周期）
  const stemIndex = (REFERENCE_STEM_INDEX + diffDays) % 10;
  const branchIndex = (REFERENCE_BRANCH_INDEX + diffDays) % 12;
  
  return {
    stem: STEMS[stemIndex],
    branch: BRANCHES[branchIndex],
    fullStemBranch: STEMS[stemIndex] + BRANCHES[branchIndex]
  };
}

/**
 * 日付から月柱を計算する（節気に基づく）
 * @param date - 日付
 * @return 月柱情報
 */
export function calculateMonthPillar(date: Date) {
  // 対応する節気を見つける
  let currentTerm: string = '';
  let currentTermDate: Date | null = null;
  
  for (const [term, termDate] of Object.entries(SOLAR_TERMS_2025)) {
    if (date >= termDate && (currentTermDate === null || termDate > currentTermDate)) {
      currentTerm = term;
      currentTermDate = termDate;
    }
  }
  
  return {
    term: currentTerm,
    fullStemBranch: currentTerm ? TERM_TO_STEM_BRANCH[currentTerm] || "不明" : "不明"
  };
}

/**
 * 新暦から旧暦を取得する
 * @param date - 新暦日付
 * @return 旧暦日付（例：2/15）
 */
export function solarToLunar(date: Date): string | null {
  const dateString = date.toISOString().split('T')[0];
  if (dateString in CALENDAR_DATA_2025_MARCH) {
    return CALENDAR_DATA_2025_MARCH[dateString].lunarDate;
  }
  return null; // データがない場合
}

/**
 * 日付の干支情報を取得する
 * @param date - 日付
 * @return 干支情報
 */
export function getStemBranchForDate(date: Date): string | null {
  const dateString = date.toISOString().split('T')[0];
  if (dateString in CALENDAR_DATA_2025_MARCH) {
    return CALENDAR_DATA_2025_MARCH[dateString].stemBranch;
  }
  return null; // データがない場合
}