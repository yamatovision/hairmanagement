import { injectable, inject } from 'tsyringe';
import { SajuProfile } from '../../domain/user/value-objects/saju-profile';
import { BirthLocationService } from './birth-location.service';
import { SajuEngine, SajuResult } from '../../utils/saju/refactored/SajuEngine';

/**
 * 四柱推命計算サービス
 * 生年月日時と出生地から四柱推命情報を計算する
 */
@injectable()
export class SajuCalculatorService {
  private sajuEngine: SajuEngine;

  constructor(
    @inject('BirthLocationService') private readonly birthLocationService?: BirthLocationService
  ) {
    // SajuEngineのインスタンスを初期化
    this.sajuEngine = new SajuEngine({
      useLocalTime: true,
      useKoreanMethod: true
    });
  }

  /**
   * 四柱推命プロファイルを計算する
   * @param birthDate 生年月日
   * @param birthHour 出生時間（0-23の時間、省略可）
   * @param birthLocation 出生地（省略可）
   * @param useKoreanMethod 韓国式計算を使用するかどうか
   * @returns 四柱推命プロファイル
   */
  async calculateSajuProfile(
    birthDate: Date, 
    birthHour?: number, 
    birthLocation?: string,
    useKoreanMethod?: boolean
  ): Promise<SajuProfile> {
    // パラメータのログ記録
    console.log(`SajuCalculatorService: Calculating profile`);
    console.log(`- date: ${birthDate.toISOString()}`);
    console.log(`- hour: ${birthHour !== undefined ? birthHour : 'unspecified'}`);
    console.log(`- location: ${birthLocation || 'unspecified'}`);
    console.log(`- useKoreanMethod: ${useKoreanMethod}`);
    
    try {
      // 地理的情報の処理（birthLocationの処理）
      let locationInfo = null;
      if (birthLocation && this.birthLocationService) {
        try {
          locationInfo = await this.birthLocationService.getLocationCoordinates(birthLocation);
          console.log(`- Location coordinates: ${JSON.stringify(locationInfo)}`);
        } catch (error) {
          console.error(`- Failed to get location info: ${error.message}`);
        }
      }
      
      // 出生時間がない場合は正午(12時)を使用
      const hour = birthHour !== undefined ? birthHour : 12;
      
      // SajuEngineを使用して四柱推命情報を計算
      let sajuResult: SajuResult;
      
      if (locationInfo) {
        // 位置情報がある場合は設定して計算
        sajuResult = this.sajuEngine.calculate(
          birthDate,
          hour,
          undefined, // 性別は省略
          { longitude: locationInfo.longitude, latitude: locationInfo.latitude }
        );
      } else {
        // 位置情報がない場合はシンプルに計算
        sajuResult = this.sajuEngine.calculate(
          birthDate,
          hour
        );
      }
      
      // 計算結果をSajuProfileに変換
      const { fourPillars, tenGods, elementProfile, twelveFortunes, hiddenStems } = sajuResult;
      
      // SajuProfile値オブジェクトを作成して返す
      return new SajuProfile(
        fourPillars, 
        elementProfile.mainElement,
        elementProfile.yinYang,
        tenGods,
        elementProfile.secondaryElement,
        twelveFortunes,
        hiddenStems
      );
    } catch (error) {
      console.error('四柱推命計算エラー:', error);
      
      // エラー時はデフォルト値を返す
      const defaultFourPillars = {
        yearPillar: { 
          stem: '甲', 
          branch: '寅', 
          fullStemBranch: '甲寅',
          hiddenStems: ['甲', '丙', '戊'],
          fortune: '長生'
        },
        monthPillar: { 
          stem: '乙', 
          branch: '卯', 
          fullStemBranch: '乙卯',
          hiddenStems: ['乙'],
          fortune: '帝旺'
        },
        dayPillar: { 
          stem: '丙', 
          branch: '辰', 
          fullStemBranch: '丙辰',
          hiddenStems: ['戊', '乙', '癸'],
          fortune: '衰'
        },
        hourPillar: { 
          stem: '丁', 
          branch: '巳', 
          fullStemBranch: '丁巳',
          hiddenStems: ['丙', '庚', '戊'],
          fortune: '病'
        }
      };
      
      return new SajuProfile(
        defaultFourPillars,
        '木',
        '陽',
        { year: '比肩', month: '劫財', day: '日元', hour: '食神' },
        '火',
        {
          year: '長生',
          month: '帝旺',
          day: '衰',
          hour: '病'
        },
        {
          year: ['甲', '丙', '戊'],
          month: ['乙'],
          day: ['戊', '乙', '癸'],
          hour: ['丙', '庚', '戊']
        }
      );
    }
  }

  /**
   * 運勢情報を四柱情報で強化する
   * @param fortune 運勢情報
   * @param birthDate 生年月日
   * @param birthHour 出生時間（省略可）
   * @returns 強化された運勢情報
   */
  enhanceFortuneWithSaju(fortune: any, birthDate: Date, birthHour?: number): any {
    try {
      // 出生時間がない場合は正午(12時)を使用
      const hour = birthHour !== undefined ? birthHour : 12;
      
      // SajuEngineを使用して四柱推命情報を計算
      const sajuResult = this.sajuEngine.calculate(birthDate, hour);
      
      // 運勢情報に四柱推命データを追加
      return {
        ...fortune,
        sajuData: {
          mainElement: sajuResult.elementProfile.mainElement,
          yinYang: sajuResult.elementProfile.yinYang,
          compatibility: this.calculateCompatibility(sajuResult)
        }
      };
    } catch (error) {
      console.error('四柱推命による運勢強化エラー:', error);
      
      // エラー時は簡易的なプロファイルを生成
      const simpleSajuProfile = {
        mainElement: '木',
        yinYang: '陽',
        compatibility: 80
      };
      
      return {
        ...fortune,
        sajuData: simpleSajuProfile
      };
    }
  }

  /**
   * 今日の四柱を計算
   * @param date 日付文字列（省略時は今日）
   * @param useKoreanMethod 韓国式計算を使用するかどうか
   * @returns 四柱情報
   */
  calculateDayFourPillars(date?: Date | string, useKoreanMethod?: boolean): any {
    try {
      console.log(`Calculate day four pillars for date: ${date || 'today'}, useKoreanMethod: ${useKoreanMethod}`);
      
      // 日付を解析
      const targetDate = date ? new Date(date) : new Date();
      
      // 計算オプションを更新
      this.sajuEngine.updateOptions({
        useKoreanMethod: useKoreanMethod !== undefined ? useKoreanMethod : true
      });
      
      // 現在時刻で四柱推命情報を計算
      const sajuResult = this.sajuEngine.calculate(
        targetDate,
        targetDate.getHours()
      );
      
      // 四柱情報のみを返す
      return sajuResult.fourPillars;
    } catch (error) {
      console.error('今日の四柱計算エラー:', error);
      
      // エラー時はデフォルト値を返す
      return {
        yearPillar: { stem: '癸', branch: '卯', fullStemBranch: '癸卯' },
        monthPillar: { stem: '甲', branch: '辰', fullStemBranch: '甲辰' },
        dayPillar: { stem: '丙', branch: '午', fullStemBranch: '丙午' },
        hourPillar: { stem: '丁', branch: '未', fullStemBranch: '丁未' }
      };
    }
  }

  /**
   * 互換性スコアを計算する
   * @param sajuResult 四柱推命計算結果
   * @returns 0-100の互換性スコア
   */
  private calculateCompatibility(sajuResult: SajuResult): number {
    // 実際のアプリケーションでは、より複雑な互換性計算を実装
    // 現在は簡易的な計算として、運星の良さに基づいて計算
    const fortuneScores: { [key: string]: number } = {
      '長生': 90,
      '沐浴': 70,
      '冠帯': 80,
      '臨官': 85,
      '帝旺': 100,
      '衰': 60,
      '病': 50,
      '死': 30,
      '墓': 40,
      '絶': 20,
      '胎': 65,
      '養': 75
    };
    
    let totalScore = 0;
    let count = 0;
    
    // 四柱の運星を評価
    if (sajuResult.twelveFortunes) {
      const fortunes = sajuResult.twelveFortunes;
      
      for (const pillar of ['year', 'month', 'day', 'hour'] as const) {
        if (fortunes[pillar] && fortuneScores[fortunes[pillar]]) {
          totalScore += fortuneScores[fortunes[pillar]];
          count++;
        }
      }
    }
    
    // 平均スコアを計算し、範囲を0-100に調整
    const avgScore = count > 0 ? Math.round(totalScore / count) : 70;
    return Math.max(0, Math.min(100, avgScore));
  }
}