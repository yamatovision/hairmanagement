import { injectable, inject } from 'tsyringe';
import { SajuProfile } from '../../domain/user/value-objects/saju-profile';
import { BirthLocationService } from './birth-location.service';

/**
 * モック: 四柱推命計算サービス
 * 生年月日時と出生地から四柱推命情報を計算する
 */
@injectable()
export class SajuCalculatorService {
  constructor(
    @inject('BirthLocationService') private readonly birthLocationService?: BirthLocationService
  ) {}

  /**
   * 四柱推命プロファイルを計算する
   * @param userId ユーザーID
   * @param birthDate 生年月日
   * @param birthHour 出生時間（0-23の時間、省略可）
   * @param birthLocation 出生地（省略可）
   * @returns 四柱推命プロファイル
   */
  async calculateSajuProfile(
    userId: string, 
    birthDate: Date, 
    birthHour?: number, 
    birthLocation?: string
  ): Promise<any> {
    // モックの四柱情報を返す
    console.log(`SajuCalculatorService: Calculating profile for ${userId}, date: ${birthDate}`);
    
    // 簡易モックデータを返す
    return {
      fourPillars: {
        yearPillar: { stem: '甲', branch: '寅', fullStemBranch: '甲寅' },
        monthPillar: { stem: '乙', branch: '卯', fullStemBranch: '乙卯' },
        dayPillar: { stem: '丙', branch: '辰', fullStemBranch: '丙辰' },
        hourPillar: { stem: '丁', branch: '巳', fullStemBranch: '丁巳' }
      },
      mainElement: '木',
      yinYang: '陽',
      tenGods: { year: '比肩', month: '劫財', day: '日元', hour: '食神' },
      secondaryElement: '火'
    };
  }

  /**
   * 運勢情報を四柱情報で強化する
   */
  enhanceFortuneWithSaju(fortune: any, userSajuProfile: any): any {
    return {
      ...fortune,
      sajuData: {
        mainElement: userSajuProfile.mainElement || '木',
        yinYang: userSajuProfile.yinYang || '陽',
        compatibility: 80
      }
    };
  }

  /**
   * 今日の四柱を計算
   */
  calculateDayFourPillars(): any {
    return {
      yearPillar: { stem: '癸', branch: '卯', fullStemBranch: '癸卯' },
      monthPillar: { stem: '甲', branch: '辰', fullStemBranch: '甲辰' },
      dayPillar: { stem: '丙', branch: '午', fullStemBranch: '丙午' },
      hourPillar: { stem: '丁', branch: '未', fullStemBranch: '丁未' }
    };
  }
}