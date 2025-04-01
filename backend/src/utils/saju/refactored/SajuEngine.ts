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
  isStemYin,
  getHiddenStems
} from './tenGodCalculator';
import { calculateTwelveFortunes } from './twelveFortuneSpiritCalculator';

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
  twelveFortunes?: Record<string, string>; // 十二運星
  hiddenStems?: {      // 蔵干
    year: string[];
    month: string[];
    day: string[];
    hour: string[];
  };
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
      
      // JavaScriptのDateオブジェクトに変換（既存計算関数との互換性のため）
      const jsAdjustedDate = new Date(
        adjustedDate.year,
        adjustedDate.month - 1, // JavaScriptは0始まりなので-1
        adjustedDate.day,
        adjustedDate.hour,
        adjustedDate.minute
      );
      
      // lunar-javascriptライブラリが利用可能な場合は使用
      try {
        // 動的インポート（利用可能な場合）
        const { Solar } = require('lunar-javascript');
        
        // Solarオブジェクトに変換
        const solar = Solar.fromDate(jsAdjustedDate);
        
        // Lunarオブジェクトを取得
        const lunar = solar.getLunar();
        
        // 3. 年柱を計算（lunar-javascriptを利用）
        const yearPillar = {
          stem: lunar.getYearInGanZhi()[0],
          branch: lunar.getYearInGanZhi()[1],
          fullStemBranch: lunar.getYearInGanZhi()
        };
        
        // 4. 日柱を計算（lunar-javascriptを利用）
        const dayPillar = {
          stem: lunar.getDayInGanZhi()[0],
          branch: lunar.getDayInGanZhi()[1],
          fullStemBranch: lunar.getDayInGanZhi()
        };
        
        // 5. 月柱を計算（lunar-javascriptを利用）
        const monthPillar = {
          stem: lunar.getMonthInGanZhi()[0],
          branch: lunar.getMonthInGanZhi()[1],
          fullStemBranch: lunar.getMonthInGanZhi()
        };
        
        // 6. 時柱を計算 (lunar-javascriptにはないので、従来の方法で計算)
        const adjustedHour = adjustedDate.hour;
        const hourPillar = calculateKoreanHourPillar(adjustedHour, dayPillar.stem);
        
        // 7. 十二運星を計算
        const twelveFortunes = calculateTwelveFortunes(
          dayPillar.stem,
          yearPillar.branch,
          monthPillar.branch,
          dayPillar.branch,
          hourPillar.branch,
          0 // ハードコードされた値を使用（精度優先）
        );
      
        // 8. 蔵干（地支に内包される天干）を計算
        const hiddenStems = {
          year: getHiddenStems(yearPillar.branch),
          month: getHiddenStems(monthPillar.branch),
          day: getHiddenStems(dayPillar.branch),
          hour: getHiddenStems(hourPillar.branch)
        };
      
        // 9. 四柱を拡張情報で構成
        const fourPillars: FourPillars = {
          yearPillar: {
            ...yearPillar,
            fortune: twelveFortunes.year,
            hiddenStems: hiddenStems.year
          },
          monthPillar: {
            ...monthPillar,
            fortune: twelveFortunes.month,
            hiddenStems: hiddenStems.month
          },
          dayPillar: {
            ...dayPillar,
            fortune: twelveFortunes.day,
            hiddenStems: hiddenStems.day
          },
          hourPillar: {
            ...hourPillar,
            fortune: twelveFortunes.hour,
            hiddenStems: hiddenStems.hour
          }
        };
      
        // 10. 十神関係を計算
        const tenGods = calculateTenGods(
          dayPillar.stem, 
          yearPillar.stem, 
          monthPillar.stem, 
          hourPillar.stem
        );
      
        // 11. 五行属性を計算
        const elementProfile = this.calculateElementProfile(dayPillar, monthPillar);
      
        // 12. 結果を返す
        return {
          fourPillars,
          lunarDate: processedDateTime.lunarDate,
          tenGods,
          elementProfile,
          processedDateTime,
          twelveFortunes,
          hiddenStems
        };
        
      } catch (error) {
        // lunar-javascriptが利用できない場合は、従来の方法で計算
        console.log('lunar-javascriptが利用できないため、従来の計算方法を使用します:', error);
        
        // 3. 年柱を計算
        const yearPillar = calculateKoreanYearPillar(adjustedDate.year);
        
        // 4. 日柱を計算
        const dayPillar = calculateKoreanDayPillar(jsAdjustedDate, this.options);
        
        // 5. 月柱を計算
        const monthPillar = calculateKoreanMonthPillar(
          jsAdjustedDate,
          yearPillar.stem
        );
        
        // 6. 時柱を計算 (地方時調整後の時間を使用)
        const adjustedHour = adjustedDate.hour;
        const hourPillar = calculateKoreanHourPillar(adjustedHour, dayPillar.stem);
      
        // 7. 十二運星を計算
        const twelveFortunes = calculateTwelveFortunes(
          dayPillar.stem,
          yearPillar.branch,
        monthPillar.branch,
        dayPillar.branch,
        hourPillar.branch,
        0 // ハードコードされた値を使用（精度優先）
      );
      
      // 8. 蔵干（地支に内包される天干）を計算
      const hiddenStems = {
        year: getHiddenStems(yearPillar.branch),
        month: getHiddenStems(monthPillar.branch),
        day: getHiddenStems(dayPillar.branch),
        hour: getHiddenStems(hourPillar.branch)
      };
      
      // 9. 四柱を拡張情報で構成
      const fourPillars: FourPillars = {
        yearPillar: {
          ...yearPillar,
          fortune: twelveFortunes.year,
          hiddenStems: hiddenStems.year
        },
        monthPillar: {
          ...monthPillar,
          fortune: twelveFortunes.month,
          hiddenStems: hiddenStems.month
        },
        dayPillar: {
          ...dayPillar,
          fortune: twelveFortunes.day,
          hiddenStems: hiddenStems.day
        },
        hourPillar: {
          ...hourPillar,
          fortune: twelveFortunes.hour,
          hiddenStems: hiddenStems.hour
        }
      };
      
      // 10. 十神関係を計算
      const tenGods = calculateTenGods(
        dayPillar.stem, 
        yearPillar.stem, 
        monthPillar.stem, 
        hourPillar.stem
      );
      
      // 11. 五行属性を計算
      const elementProfile = this.calculateElementProfile(dayPillar, monthPillar);
      
      // 12. 結果を返す
      return {
        fourPillars,
        lunarDate: processedDateTime.lunarDate,
        tenGods,
        elementProfile,
        processedDateTime,
        twelveFortunes,
        hiddenStems
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