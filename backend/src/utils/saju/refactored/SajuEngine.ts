/**
 * 韓国式四柱推命計算エンジンクラス
 * リファクタリング計画に基づいた統合実装
 */
import { Pillar, FourPillars, SajuOptions } from './types';
import { DateTimeProcessor, ProcessedDateTime } from './DateTimeProcessor';
import { calculateKoreanYearPillar } from './koreanYearPillarCalculator';
import { calculateKoreanMonthPillar } from './koreanMonthPillarCalculator';
import { calculateKoreanDayPillar } from './dayPillarCalculator';
import { calculateKoreanHourPillar } from './hourPillarCalculator';
import { 
  calculateTenGods, 
  getElementFromStem, 
  isStemYin 
} from './tenGodCalculator';

/**
 * 四柱推命計算結果の型
 */
export interface SajuResult {
  fourPillars: FourPillars;
  lunarDate?: {
    year: number;
    month: number;
    day: number;
    isLeapMonth: boolean;
  };
  tenGods: Record<string, string>;
  elementProfile: {
    mainElement: string;
    secondaryElement: string;
    yinYang: string;
  };
  processedDateTime: ProcessedDateTime;
}

/**
 * 四柱推命計算エンジンクラス
 */
export class SajuEngine {
  private dateProcessor: DateTimeProcessor;
  private options: SajuOptions;

  /**
   * 四柱推命計算エンジンを初期化
   * @param options 計算オプション
   */
  constructor(options: SajuOptions = {}) {
    this.options = {
      useLocalTime: true, // デフォルトで地方時調整を有効化
      ...options
    };
    this.dateProcessor = new DateTimeProcessor(this.options);
  }

  /**
   * 生年月日時から四柱推命情報を計算する
   * @param birthDate 生年月日
   * @param birthHour 生まれた時間（0-23）
   * @param gender 性別（'M'=男性, 'F'=女性）
   * @param location 位置情報（都市名または経度・緯度）
   * @returns 四柱推命計算結果
   */
  calculate(
    birthDate: Date, 
    birthHour: number, 
    gender?: 'M' | 'F',
    location?: string | { longitude: number, latitude: number }
  ): SajuResult {
    try {
      // 1. オプションを更新（位置情報など）
      if (location) {
        this.dateProcessor.updateOptions({ location });
      }
      if (gender) {
        this.dateProcessor.updateOptions({ gender });
      }
      
      // 2. 日時を前処理（地方時調整と旧暦変換）
      const processedDateTime = this.dateProcessor.processDateTime(birthDate, birthHour);
      const { adjustedDate } = processedDateTime;
      
      // 3. 年柱を計算
      const yearPillar = calculateKoreanYearPillar(adjustedDate.getFullYear());
      
      // 4. 日柱を計算
      const dayPillar = calculateKoreanDayPillar(adjustedDate, this.options);
      
      // 5. 月柱を計算
      const monthPillar = calculateKoreanMonthPillar(
        adjustedDate,
        yearPillar.stem
      );
      
      // 6. 時柱を計算 (地方時調整後の時間を使用)
      const adjustedHour = adjustedDate.getHours();
      const hourPillar = calculateKoreanHourPillar(adjustedHour, dayPillar.stem);
      
      // 7. 四柱を構成
      const fourPillars: FourPillars = {
        yearPillar,
        monthPillar,
        dayPillar,
        hourPillar
      };
      
      // 8. 十神関係を計算
      const tenGods = calculateTenGods(
        dayPillar.stem, 
        yearPillar.stem, 
        monthPillar.stem, 
        hourPillar.stem
      );
      
      // 9. 五行属性を計算
      const elementProfile = this.calculateElementProfile(dayPillar, monthPillar);
      
      // 10. 結果を返す
      return {
        fourPillars,
        lunarDate: processedDateTime.lunarDate,
        tenGods,
        elementProfile,
        processedDateTime
      };
    } catch (error) {
      console.error('SajuEngine計算エラー:', error);
      
      // エラー時は最低限の結果を返す
      const defaultPillar: Pillar = { 
        stem: '甲', 
        branch: '子', 
        fullStemBranch: '甲子' 
      };
      
      const fourPillars: FourPillars = {
        yearPillar: defaultPillar,
        monthPillar: defaultPillar,
        dayPillar: defaultPillar,
        hourPillar: defaultPillar
      };
      
      return {
        fourPillars,
        tenGods: {
          year: '不明',
          month: '不明',
          day: '比肩',
          hour: '食神'
        },
        elementProfile: {
          mainElement: '木',
          secondaryElement: '木',
          yinYang: '陽'
        },
        processedDateTime: this.dateProcessor.processDateTime(birthDate, birthHour)
      };
    }
  }
  
  /**
   * 四柱から五行プロファイルを導出
   * @param dayPillar 日柱
   * @param monthPillar 月柱
   * @returns 五行プロファイル
   */
  private calculateElementProfile(dayPillar: Pillar, monthPillar: Pillar): {
    mainElement: string;
    secondaryElement: string;
    yinYang: string;
  } {
    // 日柱から主要な五行属性を取得
    const mainElement = getElementFromStem(dayPillar.stem);
    
    // 月柱から副次的な五行属性を取得
    const secondaryElement = getElementFromStem(monthPillar.stem);
    
    // 日主の陰陽を取得
    const yinYang = isStemYin(dayPillar.stem) ? '陰' : '陽';
    
    return {
      mainElement,
      secondaryElement,
      yinYang
    };
  }

  /**
   * 現在の日時の四柱推命情報を取得
   * @returns 現在時刻の四柱推命計算結果
   */
  getCurrentSaju(): SajuResult {
    const now = new Date();
    return this.calculate(now, now.getHours());
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
    this.dateProcessor.updateOptions(newOptions);
  }
}