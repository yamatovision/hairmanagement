/**
 * lunar-javascriptライブラリを使用した旧暦変換モジュール
 * 旧暦計算と節気計算を実装
 */
import { Solar, Lunar } from 'lunar-javascript';

/**
 * 日付キー文字列を生成（YYYY-MM-DD形式）
 * @param date 日付
 * @returns 日付キー文字列
 */
export function formatDateKey(date: Date): string {
  // 無効な日付オブジェクトをチェック
  if (isNaN(date.getTime())) {
    console.error('無効な日付オブジェクト:', date);
    return 'invalid-date';
  }
  
  // ロケールに依存しない日付フォーマット
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * 新暦から旧暦情報を取得
 * @param date 新暦日付
 * @returns 旧暦情報（ない場合はnull）
 */
export function getLunarDate(date: Date): {
  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  isLeapMonth: boolean;
  stemBranch?: string;
} | null {
  // 無効な日付オブジェクトをチェック
  if (isNaN(date.getTime())) {
    console.error('getLunarDate: 無効な日付オブジェクト:', date);
    return null;
  }
  
  try {
    // lunar-javascriptライブラリを使用して旧暦変換
    const solar = Solar.fromDate(date);
    const lunar = solar.getLunar();
    
    return {
      lunarYear: lunar.getYear(),
      lunarMonth: lunar.getMonth(),
      lunarDay: lunar.getDay(),
      isLeapMonth: Boolean(lunar.isLeap && lunar.isLeap()),
      stemBranch: lunar.getDayInGanZhi()  // 日の干支
    };
  } catch (error) {
    console.error('旧暦変換エラー:', error);
    return null;
  }
}

/**
 * APIを使用して旧暦情報を取得（将来的な拡張用）
 * @param date 新暦日付
 * @returns 旧暦情報
 */
export async function fetchLunarDate(date: Date): Promise<{
  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  isLeapMonth: boolean;
  stemBranch?: string;
} | null> {
  try {
    // ここでは直接ライブラリの計算結果を返す
    return getLunarDate(date);
  } catch (error) {
    console.error('旧暦変換エラー:', error);
    return null;
  }
}

/**
 * 特定の日付の干支を取得
 * @param date 新暦日付
 * @returns 干支情報
 */
export function getStemBranch(date: Date): string | null {
  try {
    const solar = Solar.fromDate(date);
    const lunar = solar.getLunar();
    return lunar.getDayInGanZhi();
  } catch (error) {
    console.error('干支取得エラー:', error);
    return null;
  }
}

/**
 * 日付が閏月かどうかを判断
 * @param date 新暦日付
 * @returns 閏月ならtrue
 */
export function isLeapMonth(date: Date): boolean {
  try {
    const solar = Solar.fromDate(date);
    const lunar = solar.getLunar();
    return Boolean(lunar.isLeap && lunar.isLeap());
  } catch (error) {
    console.error('閏月判定エラー:', error);
    return false;
  }
}

/**
 * 節気データ（二十四節気の基本情報）
 */
const SOLAR_TERMS = [
  { name: "小寒", month: 1, day: 5, isMonthChanging: true },   // 1月上旬 - 丑月開始
  { name: "大寒", month: 1, day: 20, isMonthChanging: false }, // 1月下旬
  { name: "立春", month: 2, day: 4, isMonthChanging: true },   // 2月上旬 - 寅月開始
  { name: "雨水", month: 2, day: 19, isMonthChanging: false }, // 2月下旬
  { name: "驚蟄", month: 3, day: 6, isMonthChanging: true },   // 3月上旬 - 卯月開始
  { name: "春分", month: 3, day: 21, isMonthChanging: false }, // 3月下旬
  { name: "清明", month: 4, day: 5, isMonthChanging: true },   // 4月上旬 - 辰月開始
  { name: "穀雨", month: 4, day: 20, isMonthChanging: false }, // 4月下旬
  { name: "立夏", month: 5, day: 6, isMonthChanging: true },   // 5月上旬 - 巳月開始
  { name: "小満", month: 5, day: 21, isMonthChanging: false }, // 5月下旬
  { name: "芒種", month: 6, day: 6, isMonthChanging: true },   // 6月上旬 - 午月開始
  { name: "夏至", month: 6, day: 21, isMonthChanging: false }, // 6月下旬
  { name: "小暑", month: 7, day: 7, isMonthChanging: true },   // 7月上旬 - 未月開始
  { name: "大暑", month: 7, day: 23, isMonthChanging: false }, // 7月下旬
  { name: "立秋", month: 8, day: 8, isMonthChanging: true },   // 8月上旬 - 申月開始
  { name: "処暑", month: 8, day: 23, isMonthChanging: false }, // 8月下旬
  { name: "白露", month: 9, day: 8, isMonthChanging: true },   // 9月上旬 - 酉月開始
  { name: "秋分", month: 9, day: 23, isMonthChanging: false }, // 9月下旬
  { name: "寒露", month: 10, day: 8, isMonthChanging: true },  // 10月上旬 - 戌月開始
  { name: "霜降", month: 10, day: 24, isMonthChanging: false },// 10月下旬
  { name: "立冬", month: 11, day: 7, isMonthChanging: true },  // 11月上旬 - 亥月開始
  { name: "小雪", month: 11, day: 22, isMonthChanging: false },// 11月下旬
  { name: "大雪", month: 12, day: 7, isMonthChanging: true },  // 12月上旬 - 子月開始
  { name: "冬至", month: 12, day: 22, isMonthChanging: false } // 12月下旬
];

/**
 * 日付の節気情報を取得
 * @param date 新暦日付
 * @returns 節気情報（ない場合はnull）
 */
export function getSolarTerm(date: Date): string | null {
  try {
    const solar = Solar.fromDate(date);
    // lunar-javascriptでの節気情報の取得方法を確認
    // 現在のバージョンでは直接的なメソッドがない可能性があるため、
    // 下記は仮実装です
    const jieQi = solar.getJieQi ? solar.getJieQi() : null;
    
    // ライブラリが対応していない場合は近似値を返す
    if (!jieQi) {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      
      // 簡易的な節気判定（実際には正確な天文計算が必要）
      for (const term of SOLAR_TERMS) {
        if (term.month === month && Math.abs(term.day - day) <= 1) {
          return term.name;
        }
      }
    }
    
    return jieQi || null;
  } catch (error) {
    console.error('節気取得エラー:', error);
    return null;
  }
}

/**
 * 指定された日付の節気期間を特定する
 * @param date 日付
 * @returns 節気期間情報 {name, index, startDate, endDate, isMonthChanging}
 */
export function getSolarTermPeriod(date: Date): {
  name: string;
  index: number;
  startDate: Date | null;
  endDate: Date | null;
  isMonthChanging: boolean;
  isError?: boolean;
} {
  // 無効な日付オブジェクトをチェック
  if (!date || isNaN(date.getTime())) {
    console.error('getSolarTermPeriod: 無効な日付オブジェクト:', date);
    return { 
      name: "無効な日付", 
      index: 0, 
      startDate: null, 
      endDate: null,
      isMonthChanging: false,
      isError: true 
    };
  }
  
  try {
    // 1. 現在の月と日を取得
    const month = date.getMonth() + 1; // 1-12
    const day = date.getDate();
    
    // 2. 対応する節気を特定
    let currentTermIndex = -1;
    let nextTermIndex = -1;
    
    for (let i = 0; i < SOLAR_TERMS.length; i++) {
      const term = SOLAR_TERMS[i];
      if (term.month === month) {
        // 日付が節気日より前か後か
        if (day < term.day) {
          // 節気日より前の場合、前の節気期間
          nextTermIndex = i;
          currentTermIndex = i - 1;
          if (currentTermIndex < 0) currentTermIndex = SOLAR_TERMS.length - 1; // 年末から年始への切替
          break;
        } else if (day >= term.day) {
          // 節気日以降の場合
          if (i === SOLAR_TERMS.length - 1 || day < SOLAR_TERMS[i + 1].day || SOLAR_TERMS[i + 1].month > month) {
            // 次の節気がない、または次の節気より前
            currentTermIndex = i;
            nextTermIndex = (i + 1) % SOLAR_TERMS.length; // 年末から年始への切替
            break;
          }
        }
      }
    }
    
    // 3. 節気情報が見つからなかった場合のフォールバック
    if (currentTermIndex === -1) {
      // 月から推定
      currentTermIndex = (month - 1) * 2;
      nextTermIndex = (currentTermIndex + 1) % SOLAR_TERMS.length;
    }
    
    // 4. 現在の節気情報を構築
    const currentTerm = SOLAR_TERMS[currentTermIndex];
    const nextTerm = SOLAR_TERMS[nextTermIndex];
    
    // 5. 開始日と終了日を計算
    let startDate: Date | null = null;
    let endDate: Date | null = null;
    
    if (currentTerm.month === month) {
      // 同じ月内の節気
      startDate = new Date(date.getFullYear(), month - 1, currentTerm.day);
    } else {
      // 前月の節気
      let startMonth = month - 1;
      let startYear = date.getFullYear();
      if (startMonth < 1) {
        startMonth = 12;
        startYear -= 1;
      }
      startDate = new Date(startYear, startMonth - 1, currentTerm.day);
    }
    
    if (nextTerm.month === month) {
      // 同じ月内の次の節気
      endDate = new Date(date.getFullYear(), month - 1, nextTerm.day);
    } else {
      // 翌月の節気
      let endMonth = month + 1;
      let endYear = date.getFullYear();
      if (endMonth > 12) {
        endMonth = 1;
        endYear += 1;
      }
      endDate = new Date(endYear, endMonth - 1, nextTerm.day);
    }
    
    // 6. 24節気マッピング（ハードコード）
    const solarTermToMonthIndex: { [key: string]: number } = {
      "小寒": 11, // 子月 (11)
      "大寒": 11, // 子月 (11)
      "立春": 0,  // 寅月 (0)
      "雨水": 0,  // 寅月 (0)
      "驚蟄": 1,  // 卯月 (1)
      "春分": 1,  // 卯月 (1)
      "清明": 2,  // 辰月 (2)
      "穀雨": 2,  // 辰月 (2)
      "立夏": 3,  // 巳月 (3)
      "小満": 3,  // 巳月 (3)
      "芒種": 4,  // 午月 (4)
      "夏至": 4,  // 午月 (4)
      "小暑": 5,  // 未月 (5)
      "大暑": 5,  // 未月 (5)
      "立秋": 6,  // 申月 (6)
      "処暑": 6,  // 申月 (6)
      "白露": 7,  // 酉月 (7)
      "秋分": 7,  // 酉月 (7)
      "寒露": 8,  // 戌月 (8)
      "霜降": 8,  // 戌月 (8)
      "立冬": 9,  // 亥月 (9)
      "小雪": 9,  // 亥月 (9)
      "大雪": 10, // 子月 (10)
      "冬至": 10  // 子月 (10)
    };
    
    // 7. 結果を返す
    return {
      name: currentTerm.name,
      index: solarTermToMonthIndex[currentTerm.name] !== undefined 
        ? solarTermToMonthIndex[currentTerm.name] 
        : currentTermIndex,
      startDate,
      endDate,
      isMonthChanging: currentTerm.isMonthChanging
    };
  } catch (error) {
    console.error("節気期間計算エラー:", error);
    
    // 最低限の情報を返す
    return { 
      name: "エラー", 
      index: 0, 
      startDate: null, 
      endDate: null,
      isMonthChanging: false,
      isError: true
    };
  }
}

// 主要都市のデータベース
export const MAJOR_CITIES: { [key: string]: { longitude: number, latitude: number } } = {
  "東京": { longitude: 139.77, latitude: 35.68 },
  "ソウル": { longitude: 126.98, latitude: 37.57 },
  "京都": { longitude: 135.77, latitude: 35.02 },
  "大阪": { longitude: 135.50, latitude: 34.70 },
  "名古屋": { longitude: 136.91, latitude: 35.18 },
  "福岡": { longitude: 130.40, latitude: 33.60 },
  "札幌": { longitude: 141.35, latitude: 43.07 },
  "那覇": { longitude: 127.68, latitude: 26.22 },
  "北京": { longitude: 116.41, latitude: 39.90 },
  "上海": { longitude: 121.47, latitude: 31.23 },
  "台北": { longitude: 121.56, latitude: 25.03 },
  "香港": { longitude: 114.17, latitude: 22.28 },
  "釜山": { longitude: 129.04, latitude: 35.18 },
  "光州": { longitude: 126.85, latitude: 35.15 },
  "平壌": { longitude: 125.75, latitude: 39.03 }
};

/**
 * 都市名または座標から位置情報を取得する関数
 */
export function getLocationCoordinates(location?: string | { longitude: number, latitude: number }): { longitude: number, latitude: number } {
  if (typeof location === 'string') {
    // 都市名から座標を取得
    const cityLocation = MAJOR_CITIES[location];
    if (cityLocation) {
      return cityLocation;
    }
    // デフォルト値（東京）を返す
    return MAJOR_CITIES["東京"];
  } else if (location && typeof location === 'object' && 'longitude' in location && 'latitude' in location) {
    // 座標が直接入力された場合はそのまま返す
    return location;
  }
  // デフォルト値（東京）を返す
  return MAJOR_CITIES["東京"];
}