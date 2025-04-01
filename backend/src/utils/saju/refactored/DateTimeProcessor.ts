/**
 * 韓国式四柱推命計算用の日時処理クラス
 * 地方時調整と旧暦変換を一元管理
 */
import { SajuOptions } from './types';
import { getLunarDate, getLocalTimeAdjustedDate, getSolarTermPeriod } from './lunarDateCalculator';

/**
 * 調整済み日時と旧暦情報を含む処理結果
 */
export interface ProcessedDateTime {
  originalDate: Date;
  adjustedDate: Date;
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
      
      // 2. 時間を含む完全な日時を作成
      const fullDateTime = new Date(
        birthDate.getFullYear(),
        birthDate.getMonth(),
        birthDate.getDate(),
        birthHour || 0, // 時間が指定されていない場合は0時とする
        0, 0, 0
      );
      
      // 3. 地方時調整を適用（重要：旧暦変換前に適用）
      const adjustedDate = getLocalTimeAdjustedDate(fullDateTime, this.options);
      
      // 4. 地方時調整後の日付から旧暦情報を取得
      const lunarInfo = getLunarDate(adjustedDate);
      
      // 5. 節気期間情報を取得（地方時調整後の日付から）
      const solarTermPeriod = getSolarTermPeriod(adjustedDate);
      
      // 6. 処理結果を返す
      return {
        originalDate: birthDate,
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
      return {
        originalDate: birthDate,
        adjustedDate: new Date(birthDate),
        lunarDate: null,
        solarTermPeriod: null,
        location: this.options.location
      };
    }
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