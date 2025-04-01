/**
 * 四柱推命計算機のメインクラス
 * 日付と時間から四柱推命の情報を計算します
 * 
 * 変更履歴:
 * - 2025/03/31: 初期実装 (AppGenius)
 * - 2025/03/31: 韓国式計算法の統合
 */

import { ElementType, YinYangType } from '@shared';
import { calculateFourPillars, FourPillars, stemToElement, isStemYin } from './fourPillars';
import { calculateTenGods, TenGodType } from './tenGods';
import { calculateKoreanFourPillars } from './koreanSaju';
import { calculateKoreanSaju, determineKoreanTenGodRelation } from './koreanSajuCalculator';

// 四柱推命計算結果の型
export interface SajuResult {
  fourPillars: FourPillars;
  tenGods: Record<string, TenGodType>;
  elementProfile: {
    mainElement: ElementType;
    secondaryElement: ElementType;
    yinYang: YinYangType;
  };
  // 追加計算結果はここに定義
}

/**
 * 四柱推命計算機クラス
 */
export class SajuCalculator {
  /**
   * 生年月日時から四柱推命情報を計算する
   * @param birthDate - 生年月日
   * @param birthHour - 生まれた時間（0-23）
   * @param gender - 性別（'M'=男性, 'F'=女性）
   * @param useKoreanMethod - 韓国式計算法を使用するか
   * @returns 四柱推命計算結果
   */
  static async calculate(
    birthDate: Date, 
    birthHour: number, 
    gender?: 'M' | 'F',
    useKoreanMethod: boolean = false
  ): Promise<SajuResult> {
    // 四柱を計算（韓国式または通常の方法で）
    let fourPillars: FourPillars;
    
    if (useKoreanMethod) {
      try {
        // 韓国式（サンプルデータから抽出したアルゴリズム）の計算
        fourPillars = calculateKoreanSaju(birthDate, birthHour, { 
          gender, 
          useLocalTime: true,
          location: { 
            longitude: 139.7671, // 東京のデフォルト座標
            latitude: 35.6812
          }
        });
      } catch (error) {
        console.warn('韓国式計算失敗、通常計算にフォールバック:', error);
        fourPillars = calculateFourPillars(birthDate, birthHour);
      }
    } else {
      // 通常の計算方法
      fourPillars = calculateFourPillars(birthDate, birthHour);
    }
    
    // 十神関係を計算
    const tenGods = useKoreanMethod
      ? this.calculateKoreanTenGods(fourPillars)
      : calculateTenGods(fourPillars);
    
    // 五行属性プロファイルを計算
    const elementProfile = this.calculateElementalProfile(fourPillars);
    
    return {
      fourPillars,
      tenGods,
      elementProfile
    };
  }
  
  /**
   * 四柱から五行プロファイルを導出
   * @param fourPillars - 四柱
   * @returns 五行プロファイル
   */
  private static calculateElementalProfile(fourPillars: FourPillars): {
    mainElement: ElementType;
    secondaryElement: ElementType;
    yinYang: YinYangType;
  } {
    // 日柱から主要な五行属性を取得
    const mainElement = stemToElement(fourPillars.dayPillar.stem) as ElementType;
    
    // 月柱から副次的な五行属性を取得
    const secondaryElement = stemToElement(fourPillars.monthPillar.fullStemBranch.charAt(0)) as ElementType;
    
    // 日主の陰陽を取得
    const yinYang = isStemYin(fourPillars.dayPillar.stem) ? '陰' : '陽' as YinYangType;
    
    return {
      mainElement,
      secondaryElement,
      yinYang
    };
  }
  
  /**
   * 韓国式十神関係を計算
   * @param fourPillars - 四柱
   * @returns 十神関係のマップ
   */
  private static calculateKoreanTenGods(fourPillars: FourPillars): Record<string, TenGodType> {
    const dayStem = fourPillars.dayPillar.stem;
    
    // 各柱の天干に対する十神関係
    const tenGods = {
      year: determineKoreanTenGodRelation(dayStem, fourPillars.yearPillar.stem) as TenGodType,
      month: determineKoreanTenGodRelation(dayStem, fourPillars.monthPillar.fullStemBranch.charAt(0)) as TenGodType,
      hour: determineKoreanTenGodRelation(dayStem, fourPillars.hourPillar.stem) as TenGodType
    };
    
    return tenGods;
  }
  
  /**
   * 現在の日の四柱情報を取得
   * @param useKoreanMethod - 韓国式計算法を使用するか
   * @returns 今日の四柱情報
   */
  static async getTodayFourPillars(useKoreanMethod: boolean = false): Promise<FourPillars> {
    const now = new Date();
    const hour = now.getHours();
    
    if (useKoreanMethod) {
      try {
        return calculateKoreanSaju(now, hour, { 
          useLocalTime: true,
          location: { 
            longitude: 139.7671, // 東京のデフォルト座標
            latitude: 35.6812
          }
        });
      } catch (error) {
        console.warn('韓国式計算失敗、通常計算にフォールバック:', error);
        return calculateFourPillars(now, hour);
      }
    }
    
    return calculateFourPillars(now, hour);
  }
  
  /**
   * 指定された日の四柱情報を取得
   * @param date - 日付
   * @param useKoreanMethod - 韓国式計算法を使用するか
   * @returns その日の四柱情報
   */
  static async getDayFourPillars(date: Date, useKoreanMethod: boolean = false): Promise<FourPillars> {
    const hour = 12; // 正午を基準とする
    
    if (useKoreanMethod) {
      try {
        return calculateKoreanSaju(date, hour, { 
          useLocalTime: true,
          location: { 
            longitude: 139.7671, // 東京のデフォルト座標
            latitude: 35.6812
          }
        });
      } catch (error) {
        console.warn('韓国式計算失敗、通常計算にフォールバック:', error);
        return calculateFourPillars(date, hour);
      }
    }
    
    return calculateFourPillars(date, hour);
  }
}