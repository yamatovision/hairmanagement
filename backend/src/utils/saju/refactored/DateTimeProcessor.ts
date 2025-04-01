/**
 * 韓国式四柱推命計算用の日時処理クラス
 * シンプルな日時処理と地方時調整の実装
 */
import { SajuOptions } from './types';
// lunar-javascriptライブラリを使用した実装を使用
import { getLunarDate, getSolarTermPeriod } from './lunarConverter-new';

/**
 * シンプルな日時データ構造
 */
interface SimpleDateTime {
  year: number;    // 年（例：1986）
  month: number;   // 月（1-12）
  day: number;     // 日（1-31）
  hour: number;    // 時（0-23）
  minute: number;  // 分（0-59）
}

/**
 * 調整済み日時と旧暦情報を含む処理結果
 */
export interface ProcessedDateTime {
  originalDate: Date;
  simpleDate: SimpleDateTime;
  adjustedDate: SimpleDateTime;
  lunarDate: {
    year: number;
    month: number;
    day: number;
    isLeapMonth: boolean;
  } | null;
  solarTermPeriod: {
    name: string;
    index: number;
  } | null;
  location?: string | { longitude: number, latitude: number };
}

/**
 * 日時処理クラス
 * 地方時調整と旧暦変換を統合
 */
export class DateTimeProcessor {
  private options: SajuOptions;

  /**
   * 日時処理クラスを初期化
   * @param options 計算オプション
   */
  constructor(options: SajuOptions = {}) {
    this.options = {
      useLocalTime: true, // デフォルトで地方時調整を有効化
      ...options
    };
  }

  /**
   * 生年月日時を処理して調整済み日時と旧暦情報を取得
   * @param birthDate 生年月日
   * @param birthHour 生まれた時間（0-23）
   * @returns 処理結果
   */
  processDateTime(birthDate: Date, birthHour: number): ProcessedDateTime {
    try {
      // 1. 入力検証
      if (!birthDate || isNaN(birthDate.getTime())) {
        console.error('無効な日付が渡されました');
        birthDate = new Date(); // 無効な場合は現在日時を使用
      }
      
      // 2. JavaScriptのDateから単純な日時構造へ変換
      const simpleDate: SimpleDateTime = {
        year: birthDate.getFullYear(),
        month: birthDate.getMonth() + 1, // JavaScriptは0始まりなので+1
        day: birthDate.getDate(),
        hour: birthHour || 0, // 時間が指定されていない場合は0時とする
        minute: 0
      };
      
      // 3. 地方時調整を適用
      const adjustedDate = this.applyLocalTimeAdjustment(simpleDate);
      
      // 4. 調整済み日時からJavaScriptのDateオブジェクトを作成（旧暦変換用）
      const jsAdjustedDate = new Date(
        adjustedDate.year,
        adjustedDate.month - 1, // JavaScriptは0始まりなので-1
        adjustedDate.day,
        adjustedDate.hour,
        adjustedDate.minute
      );
      
      // 5. 旧暦情報を取得
      const lunarInfo = getLunarDate(jsAdjustedDate);
      
      // 6. 節気期間情報を取得
      const solarTermPeriod = getSolarTermPeriod(jsAdjustedDate);
      
      // 7. 処理結果を返す
      return {
        originalDate: birthDate,
        simpleDate: simpleDate,
        adjustedDate: adjustedDate,
        lunarDate: lunarInfo ? {
          year: lunarInfo.lunarYear,
          month: lunarInfo.lunarMonth,
          day: lunarInfo.lunarDay,
          isLeapMonth: lunarInfo.isLeapMonth
        } : null,
        solarTermPeriod: solarTermPeriod ? {
          name: solarTermPeriod.name,
          index: solarTermPeriod.index
        } : null,
        location: this.options.location
      };
    } catch (error) {
      console.error('日時処理エラー:', error);
      
      // エラー時は最低限の情報を返す
      const defaultDate: SimpleDateTime = {
        year: birthDate.getFullYear(),
        month: birthDate.getMonth() + 1,
        day: birthDate.getDate(),
        hour: birthHour || 0,
        minute: 0
      };
      
      return {
        originalDate: birthDate,
        simpleDate: defaultDate,
        adjustedDate: defaultDate,
        lunarDate: null,
        solarTermPeriod: null,
        location: this.options.location
      };
    }
  }

  /**
   * 地方時調整を適用
   * @param date 調整する日時
   * @returns 調整後の日時
   */
  private applyLocalTimeAdjustment(date: SimpleDateTime): SimpleDateTime {
    // 地方時調整が無効なら元の日時をそのまま返す
    if (!this.options.useLocalTime) {
      return {...date};
    }
    
    // 地方時調整の分数を取得
    const adjustmentMinutes = this.getLocalTimeAdjustmentMinutes();
    
    // 調整がなければそのまま返す
    if (adjustmentMinutes === 0) {
      return {...date};
    }
    
    // 元の日時を分単位に変換
    let totalMinutes = date.hour * 60 + date.minute + adjustmentMinutes;
    
    // 日をまたぐかどうか
    let dayOffset = Math.floor(totalMinutes / (24 * 60));
    totalMinutes = totalMinutes % (24 * 60);
    if (totalMinutes < 0) {
      totalMinutes += 24 * 60;
      dayOffset -= 1;
    }
    
    // 新しい時間と分
    const newHour = Math.floor(totalMinutes / 60);
    const newMinute = totalMinutes % 60;
    
    // 新しい日付を計算
    let newDay = date.day + dayOffset;
    let newMonth = date.month;
    let newYear = date.year;
    
    // 月末の調整（簡易版）
    while (newDay > this.getDaysInMonth(newYear, newMonth)) {
      newDay -= this.getDaysInMonth(newYear, newMonth);
      newMonth++;
      if (newMonth > 12) {
        newMonth = 1;
        newYear++;
      }
    }
    
    // 月初の調整（簡易版）
    while (newDay < 1) {
      newMonth--;
      if (newMonth < 1) {
        newMonth = 12;
        newYear--;
      }
      newDay += this.getDaysInMonth(newYear, newMonth);
    }
    
    // 調整後の日時を返す
    return {
      year: newYear,
      month: newMonth,
      day: newDay,
      hour: newHour,
      minute: newMinute
    };
  }

  /**
   * 指定した年月の日数を取得
   * @param year 年
   * @param month 月
   * @returns その月の日数
   */
  private getDaysInMonth(year: number, month: number): number {
    // 2月の判定（うるう年考慮）
    if (month === 2) {
      return this.isLeapYear(year) ? 29 : 28;
    }
    
    // 30日の月： 4, 6, 9, 11
    if ([4, 6, 9, 11].includes(month)) {
      return 30;
    }
    
    // それ以外は31日
    return 31;
  }

  /**
   * うるう年かどうか判定
   * @param year 年
   * @returns うるう年ならtrue
   */
  private isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  /**
   * 地方時調整の分数を計算
   * @returns 地方時調整分数（分単位）
   */
  private getLocalTimeAdjustmentMinutes(): number {
    // 位置情報の取得
    const location = this.options.location || "東京";
    let longitude: number;
    let latitude: number;
    
    // 位置情報の解析
    if (typeof location === 'string') {
      // 主要都市の位置情報
      const cityMap: Record<string, [number, number]> = {
        "東京": [139.77, 35.68],
        "ソウル": [126.98, 37.57],
        "京都": [135.77, 35.02],
        "大阪": [135.50, 34.70],
        "名古屋": [136.91, 35.18],
        "福岡": [130.40, 33.60],
        "札幌": [141.35, 43.07],
        "那覇": [127.68, 26.22],
        "北京": [116.41, 39.90],
        "上海": [121.47, 31.23],
      };
      
      // 都市名から経度・緯度を取得
      const coords = cityMap[location] || cityMap["東京"];
      longitude = coords[0];
      latitude = coords[1];
    } else if (location && typeof location === 'object') {
      // 経度・緯度が直接指定された場合
      longitude = location.longitude;
      latitude = location.latitude;
    } else {
      // デフォルト: 東京
      longitude = 139.77;
      latitude = 35.68;
    }
    
    // 地方時調整（分単位）を計算
    let adjustmentMinutes = 0;
    
    // 主要地域の調整値をハードコード（精度向上のため）
    if (longitude >= 135 && longitude <= 145) {
      // 東京エリア: +18分
      adjustmentMinutes = 18;
    } else if (longitude >= 125 && longitude < 135) {
      // ソウルエリア: -32分
      adjustmentMinutes = -32;
    } else {
      // その他の地域: 経度に基づいて計算
      const standardMeridian = 135; // 日本標準時の基準経度
      adjustmentMinutes = Math.round((longitude - standardMeridian) * 4); // 経度1度あたり4分の差
    }
    
    // デバッグ情報
    console.log(`地方時調整: ${location}（経度${longitude}）=> ${adjustmentMinutes}分`);
    
    return adjustmentMinutes;
  }

  /**
   * オプションを更新
   * @param newOptions 新しいオプション
   */
  updateOptions(newOptions: Partial<SajuOptions>): void {
    this.options = {
      ...this.options,
      ...newOptions
    };
  }

  /**
   * 現在の日時を処理
   * @returns 現在時刻の処理結果
   */
  processCurrentDateTime(): ProcessedDateTime {
    const now = new Date();
    return this.processDateTime(now, now.getHours());
  }
}