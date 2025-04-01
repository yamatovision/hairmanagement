/**
 * 旧暦API連携モジュール
 * 外部の暦APIを使用して旧暦変換と暦情報取得を行います
 * 
 * 変更履歴:
 * - 2025/03/31: 初期実装
 */

import axios from 'axios';

// APIレスポンスの型定義
export interface LunarCalendarResponse {
  datelist: {
    [dateKey: string]: LunarCalendarItem;
  };
  err?: string;
  mes?: string;
}

export interface LunarCalendarItem {
  week: string;             // 曜日（漢字一文字）
  inreki: string;           // 旧暦月名
  gengo: string;            // 元号
  wareki: number;           // 和暦年
  zyusi: string;            // 十干（天干）
  zyunisi: string;          // 十二支（地支）
  eto: string;              // 干支（十二支、十二支動物）
  sekki: string;            // 節気
  kyurekiy: number;         // 旧暦年
  kyurekim: number;         // 旧暦月
  kyurekid: number;         // 旧暦日
  rokuyou: string;          // 六曜
  holiday: string;          // 祝日
  hitotubuflg: boolean;     // 一粒万倍日
  tensyabiflg: boolean;     // 天赦日
  daimyoubiflg: boolean;    // 大明日
}

// APIエンドポイント
const API_BASE_URL = 'https://koyomi.zingsystem.com/api/';

/**
 * 単一日付の暦情報を取得
 * @param date 取得したい日付（新暦）
 * @returns 暦情報
 */
export async function fetchLunarCalendarDay(date: Date): Promise<LunarCalendarItem | null> {
  try {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    const params = {
      mode: 'd',
      cnt: '1',
      targetyyyy: year.toString(),
      targetmm: month,
      targetdd: day
    };
    
    const response = await axios.get<LunarCalendarResponse>(API_BASE_URL, { params });
    
    // 応答形式を確認して適切に処理
    if (response.data && response.data.datelist) {
      const dateKey = `${year}-${month}-${day}`;
      const item = response.data.datelist[dateKey];
      
      if (item) {
        return item;
      }
    }
    
    console.error('暦API取得エラー:', response.data);
    return null;
  } catch (error) {
    console.error('暦API呼び出しエラー:', error);
    return null;
  }
}

/**
 * 月単位の暦情報を取得（注：このAPIでは現在機能しない - 日単位で取得後に集約する）
 * @param year 年
 * @param month 月
 * @returns 暦情報の配列
 */
export async function fetchLunarCalendarMonth(year: number, month: number): Promise<LunarCalendarItem[]> {
  try {
    // 月単位取得は現在のAPIでは機能しないため、日単位で取得して集約する方法をとる
    const daysInMonth = new Date(year, month, 0).getDate(); // その月の日数を取得
    const result: LunarCalendarItem[] = [];
    
    // 月の各日を取得
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const item = await fetchLunarCalendarDay(date);
      if (item) {
        result.push(item);
      }
    }
    
    return result;
  } catch (error) {
    console.error('暦API呼び出しエラー:', error);
    return [];
  }
}

/**
 * 複数日の暦情報を取得
 * @param startDate 開始日
 * @param days 取得日数（最大365）
 * @returns 暦情報の配列
 */
export async function fetchLunarCalendarRange(startDate: Date, days: number): Promise<LunarCalendarItem[]> {
  try {
    // 日数の制限を確認
    const limitedDays = Math.min(days, 31); // APIの制限や実用性を考慮して日数を制限
    
    const result: LunarCalendarItem[] = [];
    
    // 日付ごとに順次取得
    for (let i = 0; i < limitedDays; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const item = await fetchLunarCalendarDay(date);
      if (item) {
        result.push(item);
      }
    }
    
    return result;
  } catch (error) {
    console.error('暦API呼び出しエラー:', error);
    return [];
  }
}

/**
 * キャッシュされた暦情報を管理するクラス
 * APIへの過剰なリクエストを防ぐため
 */
export class LunarCalendarCache {
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24時間（ミリ秒）
  private static cache: Record<string, { data: LunarCalendarItem, timestamp: number }> = {};
  
  /**
   * 日付データをキャッシュから取得、なければAPIから取得してキャッシュ
   * @param date 取得したい日付
   * @returns 暦情報
   */
  static async getDay(date: Date): Promise<LunarCalendarItem | null> {
    const key = this.formatDateKey(date);
    const now = Date.now();
    
    // キャッシュを確認
    if (this.cache[key] && (now - this.cache[key].timestamp < this.CACHE_DURATION)) {
      return this.cache[key].data;
    }
    
    // APIから取得
    const data = await fetchLunarCalendarDay(date);
    
    if (data) {
      // キャッシュに保存
      this.cache[key] = {
        data,
        timestamp: now
      };
    }
    
    return data;
  }
  
  /**
   * 日付をキャッシュキーに変換
   * @param date 日付
   * @returns キャッシュキー
   */
  private static formatDateKey(date: Date): string {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  }
  
  /**
   * キャッシュをクリア
   */
  static clearCache(): void {
    this.cache = {};
  }
}

/**
 * 暦情報から四柱推命の基本情報を抽出
 * @param item 暦APIから取得した情報
 * @returns 四柱推命計算用の基本情報
 */
export function extractSajuBaseInfo(item: LunarCalendarItem): { 
  stem: string; 
  branch: string; 
  lunarMonth: number; 
  lunarDay: number;
  solarTerm: string | null;
} {
  return {
    stem: item.zyusi,           // 天干
    branch: item.zyunisi,       // 地支
    lunarMonth: item.kyurekim,
    lunarDay: item.kyurekid,
    solarTerm: item.sekki || null
  };
}

/**
 * 六曜情報を取得
 * @param date 日付
 * @returns 六曜名
 */
export async function getSixWeekday(date: Date): Promise<string | null> {
  const item = await LunarCalendarCache.getDay(date);
  return item ? item.rokuyou : null;
}

/**
 * 旧暦情報を取得
 * @param date 新暦日付
 * @returns 旧暦情報
 */
export async function getLunarDate(date: Date): Promise<{ 
  year: number; 
  month: number; 
  day: number; 
  inreki: string;
} | null> {
  const item = await LunarCalendarCache.getDay(date);
  
  if (!item) return null;
  
  return {
    year: item.kyurekiy,
    month: item.kyurekim,
    day: item.kyurekid,
    inreki: item.inreki
  };
}

/**
 * 地方時を考慮した日付時刻に調整する
 * @param date 元の日付時刻
 * @param longitude 経度（東経を正、西経を負）
 * @returns 調整後の日付時刻
 */
export function adjustLocalTime(date: Date, longitude: number): Date {
  // 標準時の経度（日本は東経135度）
  const standardMeridian = 135;
  
  // 経度に基づく時差（分単位）: 経度1度につき4分
  const timeDiffMinutes = (longitude - standardMeridian) * 4;
  
  // 新しい日付オブジェクトを作成して時差分を調整
  const adjustedDate = new Date(date.getTime() + timeDiffMinutes * 60 * 1000);
  
  return adjustedDate;
}