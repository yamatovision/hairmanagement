/**
 * 四柱推命計算用のカレンダーデータ
 * 旧暦・干支・節気情報を提供
 */

/**
 * カレンダーデータの型定義
 */
export interface CalendarDay {
  solarDate: string;     // 新暦日付（YYYY-MM-DD）
  lunarDate: string;     // 旧暦日付（例: 3/4）
  stemBranch: string;    // 干支（例: 庚子）
  lunarMonth: number;    // 旧暦月
  lunarDay: number;      // 旧暦日
  solarTerm?: string;    // 節気（該当する場合のみ）
}

/**
 * カレンダーデータのマップ
 * キー: YYYY-MM-DD形式の新暦日付
 * 値: カレンダー情報
 */
export const CALENDAR_DATA: Record<string, CalendarDay> = {
  // 2025年4月のデータ（画像から抽出）
  "2025-04-01": { solarDate: "2025-04-01", lunarDate: "3/4", stemBranch: "庚子", lunarMonth: 3, lunarDay: 4 },
  "2025-04-02": { solarDate: "2025-04-02", lunarDate: "3/5", stemBranch: "辛丑", lunarMonth: 3, lunarDay: 5 },
  "2025-04-03": { solarDate: "2025-04-03", lunarDate: "3/6", stemBranch: "壬寅", lunarMonth: 3, lunarDay: 6 },
  "2025-04-04": { solarDate: "2025-04-04", lunarDate: "3/7", stemBranch: "癸卯", lunarMonth: 3, lunarDay: 7 },
  "2025-04-05": { solarDate: "2025-04-05", lunarDate: "3/8", stemBranch: "甲辰", lunarMonth: 3, lunarDay: 8 },
  "2025-04-06": { solarDate: "2025-04-06", lunarDate: "3/9", stemBranch: "乙巳", lunarMonth: 3, lunarDay: 9 },
  "2025-04-07": { solarDate: "2025-04-07", lunarDate: "3/10", stemBranch: "丙午", lunarMonth: 3, lunarDay: 10 },
  "2025-04-08": { solarDate: "2025-04-08", lunarDate: "3/11", stemBranch: "丁未", lunarMonth: 3, lunarDay: 11 },
  "2025-04-09": { solarDate: "2025-04-09", lunarDate: "3/12", stemBranch: "戊申", lunarMonth: 3, lunarDay: 12 },
  "2025-04-10": { solarDate: "2025-04-10", lunarDate: "3/13", stemBranch: "己酉", lunarMonth: 3, lunarDay: 13 },
  "2025-04-11": { solarDate: "2025-04-11", lunarDate: "3/14", stemBranch: "庚戌", lunarMonth: 3, lunarDay: 14 },
  "2025-04-12": { solarDate: "2025-04-12", lunarDate: "3/15", stemBranch: "辛亥", lunarMonth: 3, lunarDay: 15 },
  "2025-04-13": { solarDate: "2025-04-13", lunarDate: "3/16", stemBranch: "壬子", lunarMonth: 3, lunarDay: 16 },
  "2025-04-14": { solarDate: "2025-04-14", lunarDate: "3/17", stemBranch: "癸丑", lunarMonth: 3, lunarDay: 17 },
  "2025-04-15": { solarDate: "2025-04-15", lunarDate: "3/18", stemBranch: "甲寅", lunarMonth: 3, lunarDay: 18 },
  "2025-04-16": { solarDate: "2025-04-16", lunarDate: "3/19", stemBranch: "乙卯", lunarMonth: 3, lunarDay: 19 },
  "2025-04-17": { solarDate: "2025-04-17", lunarDate: "3/20", stemBranch: "丙辰", lunarMonth: 3, lunarDay: 20 },
  "2025-04-18": { solarDate: "2025-04-18", lunarDate: "3/21", stemBranch: "丁巳", lunarMonth: 3, lunarDay: 21 },
  "2025-04-19": { solarDate: "2025-04-19", lunarDate: "3/22", stemBranch: "戊午", lunarMonth: 3, lunarDay: 22 },
  
  // 2019年6月のデータ（サンプル用に追加）
  "2019-06-18": { solarDate: "2019-06-18", lunarDate: "5/16", stemBranch: "丙辰", lunarMonth: 5, lunarDay: 16 },
  "2019-06-19": { solarDate: "2019-06-19", lunarDate: "5/17", stemBranch: "丁亥", lunarMonth: 5, lunarDay: 17 },
  "2019-06-20": { solarDate: "2019-06-20", lunarDate: "5/18", stemBranch: "戊子", lunarMonth: 5, lunarDay: 18 },
  
  // 1986年5月のデータ（サンプル用に追加）
  "1986-05-24": { solarDate: "1986-05-24", lunarDate: "4/16", stemBranch: "戊寅", lunarMonth: 4, lunarDay: 16 },
  "1986-05-25": { solarDate: "1986-05-25", lunarDate: "4/17", stemBranch: "己卯", lunarMonth: 4, lunarDay: 17 },
  "1986-05-26": { solarDate: "1986-05-26", lunarDate: "4/18", stemBranch: "庚午", lunarMonth: 4, lunarDay: 18 },
  "1986-05-27": { solarDate: "1986-05-27", lunarDate: "4/19", stemBranch: "辛未", lunarMonth: 4, lunarDay: 19 },
};

/**
 * 年柱計算用のマッピング（韓国式）
 * 西暦年から年柱の干支を計算するためのオフセット
 */
export const YEAR_STEM_OFFSET = 6;  // 西暦 + 6 を 10 で割った余りが天干のインデックス
export const YEAR_BRANCH_OFFSET = 8;  // 西暦 + 8 を 12 で割った余りが地支のインデックス

/**
 * 月干（月柱の天干）計算用のベースインデックス
 * 年干から月干の基準値を求めるためのマッピング
 * 甲己年は甲から、乙庚年は丙から、丙辛年は戊から、丁壬年は庚から、戊癸年は壬から
 */
export const MONTH_STEM_BASE = [0, 2, 4, 6, 8];  // 甲己年→甲,乙庚年→丙,丙辛年→戊,丁壬年→庚,戊癸年→壬

/**
 * 時干（時柱の天干）計算用のベースインデックス
 * 日干から時干の基準値を求めるためのマッピング
 * 甲己日は甲から、乙庚日は丙から、丙辛日は戊から、丁壬日は庚から、戊癸日は壬から
 */
export const HOUR_STEM_BASE = [0, 2, 4, 6, 8];  // 甲己日→甲,乙庚日→丙,丙辛日→戊,丁壬日→庚,戊癸日→壬

/**
 * 新暦日付から旧暦情報を取得する
 * @param date 新暦日付
 * @returns カレンダー情報（ない場合はnull）
 */
export function getLunarCalendarDay(date: Date): CalendarDay | null {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const dateKey = `${year}-${month}-${day}`;
  
  return CALENDAR_DATA[dateKey] || null;
}

/**
 * 日付の干支情報を生成する（カレンダーデータにない場合の代替）
 * @param date 日付
 * @returns 干支情報
 */
export function generateStemBranchForDate(date: Date): string {
  // 基準日: 2025年4月1日は庚子
  const baseDate = new Date(2025, 3, 1);
  const diffDays = Math.floor((date.getTime() - baseDate.getTime()) / (24 * 60 * 60 * 1000));
  
  // 天干と地支のインデックスを計算（60日周期）
  const stemIndex = (diffDays % 10 + 10) % 10;
  const branchIndex = (diffDays % 12 + 12) % 12;
  
  // 天干と地支の配列
  const stems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
  const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  
  return stems[stemIndex] + branches[branchIndex];
}