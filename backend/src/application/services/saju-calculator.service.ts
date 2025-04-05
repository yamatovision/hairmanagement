import { injectable, inject } from 'tsyringe';
import { SajuProfile } from '../../domain/user/value-objects/saju-profile';
import { BirthLocationService } from './birth-location.service';
import { SajuEngine, SajuResult } from '../../utils/saju/refactored/SajuEngine';
import { ElementType, YinYangType, TenGodType, PillarType } from '../../shared/types/saju/core';

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
      let locationInfo: { longitude: number; latitude: number } | null = null;
      if (birthLocation && this.birthLocationService) {
        try {
          locationInfo = await this.birthLocationService.getLocationCoordinates(birthLocation);
          console.log(`- Location coordinates: ${JSON.stringify(locationInfo)}`);
        } catch (error) {
          const err = error as Error;
          console.error(`- Failed to get location info: ${err.message}`);
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
      const { fourPillars, tenGods, elementProfile, twelveFortunes, hiddenStems, twelveSpiritKillers } = sajuResult;
      
      // SajuProfile値オブジェクトを作成して返す
      const branchTenGods = {}; // 地支十神の初期化（使用可能ならここで設定）
      
      return new SajuProfile(
        fourPillars, 
        elementProfile.mainElement as ElementType,
        elementProfile.yinYang as YinYangType,
        tenGods as Record<PillarType, TenGodType>,
        branchTenGods as Record<PillarType, TenGodType>,
        elementProfile.secondaryElement as ElementType,
        twelveFortunes,
        hiddenStems,
        twelveSpiritKillers
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
      
      const defaultBranchTenGods = {
          year: '比肩' as TenGodType,
          month: '劫財' as TenGodType,
          day: '比肩' as TenGodType,
          hour: '食神' as TenGodType
        };
    
      return new SajuProfile(
        defaultFourPillars,
        '木' as ElementType,
        '陽' as YinYangType,
        { 
          year: '比肩' as TenGodType, 
          month: '劫財' as TenGodType, 
          day: '比肩' as TenGodType, 
          hour: '食神' as TenGodType 
        } as Record<PillarType, TenGodType>,
        defaultBranchTenGods as Record<PillarType, TenGodType>,
        '火' as ElementType,
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
        },
        {
          year: '年殺',
          month: '月殺',
          day: '日殺',
          hour: '劫殺'
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
      
      // 日付を解析（運勢の日付）
      const targetDate = fortune.date ? new Date(fortune.date) : new Date();
      
      // 当日の四柱を計算
      const todayFourPillars = this.sajuEngine.calculate(targetDate, 12).fourPillars;
      
      // 日干（ユーザーの日柱天干）
      const dayMaster = sajuResult.fourPillars.dayPillar.stem;
      
      // 今日の日柱の天干と地支
      const todayStem = todayFourPillars.dayPillar.stem;
      const todayBranch = todayFourPillars.dayPillar.branch;
      
      // 天干から五行要素を取得
      const stemToElement: Record<string, string> = {
        '甲': '木', '乙': '木',
        '丙': '火', '丁': '火',
        '戊': '土', '己': '土',
        '庚': '金', '辛': '金',
        '壬': '水', '癸': '水'
      };
      
      // 地支から五行要素を取得
      const branchToElement: Record<string, string> = {
        '子': '水', '丑': '土',
        '寅': '木', '卯': '木',
        '辰': '土', '巳': '火',
        '午': '火', '未': '土',
        '申': '金', '酉': '金',
        '戌': '土', '亥': '水'
      };
      
      // 十神関係を取得
      const tenGodMap: Record<string, Record<string, string>> = {
        '甲': { '甲': '比肩', '乙': '劫財', '丙': '食神', '丁': '傷官', '戊': '偏財', '己': '正財', '庚': '偏官', '辛': '正官', '壬': '偏印', '癸': '正印' },
        '乙': { '甲': '劫財', '乙': '比肩', '丙': '傷官', '丁': '食神', '戊': '正財', '己': '偏財', '庚': '正官', '辛': '偏官', '壬': '正印', '癸': '偏印' },
        '丙': { '甲': '偏印', '乙': '正印', '丙': '比肩', '丁': '劫財', '戊': '食神', '己': '傷官', '庚': '偏財', '辛': '正財', '壬': '偏官', '癸': '正官' },
        '丁': { '甲': '正印', '乙': '偏印', '丙': '劫財', '丁': '比肩', '戊': '傷官', '己': '食神', '庚': '正財', '辛': '偏財', '壬': '正官', '癸': '偏官' },
        '戊': { '甲': '偏官', '乙': '正官', '丙': '偏印', '丁': '正印', '戊': '比肩', '己': '劫財', '庚': '食神', '辛': '傷官', '壬': '偏財', '癸': '正財' },
        '己': { '甲': '正官', '乙': '偏官', '丙': '正印', '丁': '偏印', '戊': '劫財', '己': '比肩', '庚': '傷官', '辛': '食神', '壬': '正財', '癸': '偏財' },
        '庚': { '甲': '偏財', '乙': '正財', '丙': '偏官', '丁': '正官', '戊': '偏印', '己': '正印', '庚': '比肩', '辛': '劫財', '壬': '食神', '癸': '傷官' },
        '辛': { '甲': '正財', '乙': '偏財', '丙': '正官', '丁': '偏官', '戊': '正印', '己': '偏印', '庚': '劫財', '辛': '比肩', '壬': '傷官', '癸': '食神' },
        '壬': { '甲': '食神', '乙': '傷官', '丙': '偏財', '丁': '正財', '戊': '偏官', '己': '正官', '庚': '偏印', '辛': '正印', '壬': '比肩', '癸': '劫財' },
        '癸': { '甲': '傷官', '乙': '食神', '丙': '正財', '丁': '偏財', '戊': '正官', '己': '偏官', '庚': '正印', '辛': '偏印', '壬': '劫財', '癸': '比肩' }
      };
      
      // 十神関係を計算
      const tenGod = tenGodMap[dayMaster]?.[todayStem] || '不明';
      
      // 今日の日柱と地支の五行を取得
      const dayElement = stemToElement[todayStem] || '木';
      const branchElement = branchToElement[todayBranch] || '木';
      
      // 四柱を文字列形式に変換
      const formatPillar = (pillar: any) => 
        `${pillar.stem}${pillar.branch}`;
      
      const todayPillars = 
        `年柱:${formatPillar(todayFourPillars.yearPillar)}, ` +
        `月柱:${formatPillar(todayFourPillars.monthPillar)}, ` +
        `日柱:${formatPillar(todayFourPillars.dayPillar)}, ` +
        `時柱:${formatPillar(todayFourPillars.hourPillar)}`;
      
      // 運勢情報に四柱推命データを追加
      return {
        ...fortune,
        sajuData: {
          mainElement: sajuResult.elementProfile.mainElement,
          yinYang: sajuResult.elementProfile.yinYang,
          compatibility: this.calculateCompatibility(sajuResult),
          dayMaster,
          tenGod,
          earthBranch: todayBranch,
          todayPillars,
          dayElement // 天干に基づく五行要素を追加
        }
      };
    } catch (error) {
      console.error('四柱推命による運勢強化エラー:', error);
      
      // エラー時は簡易的なプロファイルを生成
      const simpleSajuProfile = {
        mainElement: '木',
        yinYang: '陽',
        compatibility: 80,
        dayMaster: '甲',
        tenGod: '比肩',
        earthBranch: '寅',
        todayPillars: '年柱:癸卯, 月柱:甲辰, 日柱:丙午, 時柱:丁未',
        dayElement: '火' // デフォルトの五行
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