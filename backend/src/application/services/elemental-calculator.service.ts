/**
 * 陰陽五行の計算を行うアプリケーションサービス
 * ドメインサービス層に位置し、運勢計算の中核機能を提供する
 * 
 * 変更履歴:
 * - 2025/03/26: 初期実装 (AppGenius)
 * - 2025/03/31: クリーンアーキテクチャに移植
 */

import { inject, injectable } from 'tsyringe';
import { IFortuneRepository } from '../../domain/repositories/IFortuneRepository';
import { ElementalCalculator } from '../../utils/elemental/calculator';
import { ElementalForecast } from '../../utils/elemental/forecast';
import { ElementalCompatibility } from '../../utils/elemental/compatibility';
import { Fortune, FortuneRating } from '../../domain/entities/Fortune';
import { ElementType, YinYangType } from '@shared';
import { ElementalProfile } from '../../domain/user/value-objects/elemental-profile';

/**
 * 陰陽五行運勢計算サービス
 * 運勢の生成、計算、分析を担当するアプリケーションサービス
 */
@injectable()
export class ElementalCalculatorService {
  /**
   * 五行要素の配列（木、火、土、金、水）
   */
  private readonly elements: ElementType[] = ['木', '火', '土', '金', '水'];
  
  /**
   * 陰陽の配列
   */
  private readonly yinYang: YinYangType[] = ['陰', '陽'];

  /**
   * コンストラクタ
   * @param fortuneRepository 運勢リポジトリ
   */
  constructor(
    @inject('IFortuneRepository') private fortuneRepository: IFortuneRepository
  ) {}

  /**
   * ユーザーの当日の運勢を取得（存在しない場合は生成して保存）
   * @param userId ユーザーID
   * @param birthDate 生年月日 (YYYY-MM-DD形式)
   * @returns 運勢エンティティ
   */
  async getDailyFortune(userId: string, birthDate: string): Promise<Fortune> {
    // 今日の日付をYYYY-MM-DD形式で取得
    const today = new Date();
    
    try {
      console.log(`[運勢フローログ] ElementalCalculatorService.getDailyFortune 開始 - ユーザー: ${userId}, 生年月日: ${birthDate}`);
      
      // データベースからユーザーの今日の運勢を検索
      console.log(`[運勢フローログ] MongoFortuneRepository.findByUserIdAndDate を呼び出し - 日付: ${today.toISOString()}`);
      let fortune = await this.fortuneRepository.findByUserIdAndDate(userId, today);
      console.log(`[運勢フローログ] findByUserIdAndDate の結果: ${fortune ? '運勢が見つかりました' : '運勢が見つかりませんでした'}`);
      
      // 存在しない場合は新規生成して保存
      if (!fortune) {
        console.log(`[運勢フローログ] 新しい運勢の生成を開始します`);
        const generatedFortune = await this.generateFortuneEntity(userId, birthDate, today);
        console.log(`[運勢フローログ] 生成された運勢: `, {
          userId: generatedFortune.userId,
          date: generatedFortune.date,
          overallScore: generatedFortune.overallScore,
          advice: typeof generatedFortune.advice === 'string' ? 
            `${generatedFortune.advice.substring(0, 30)}...` : 'オブジェクト型'
        });
        
        console.log(`[運勢フローログ] MongoFortuneRepository.create を呼び出し`);
        const savedFortune = await this.fortuneRepository.create(generatedFortune);
        console.log(`[運勢フローログ] 保存された運勢ID: ${savedFortune.id}`);
        return savedFortune;
      }
      
      console.log(`[運勢フローログ] ElementalCalculatorService.getDailyFortune 完了 - 運勢ID: ${fortune.id}`);
      return fortune;
    } catch (error) {
      console.error('[運勢フローログ] 運勢データの取得/生成中にエラーが発生しました:', error);
      if (error instanceof Error) {
        console.error('[運勢フローログ] エラー詳細:', error.message);
        console.error('[運勢フローログ] スタックトレース:', error.stack);
      }
      throw error;
    }
  }

  /**
   * ユーザーの指定日の運勢を取得（存在しない場合は生成して保存）
   * @param userId ユーザーID
   * @param birthDate 生年月日 (YYYY-MM-DD形式)
   * @param targetDate 対象日
   * @returns 運勢エンティティ
   */
  async getFortuneByDate(userId: string, birthDate: string, targetDate: Date): Promise<Fortune> {
    try {
      // データベースからユーザーの指定日の運勢を検索
      let fortune = await this.fortuneRepository.findByUserIdAndDate(userId, targetDate);
      
      // 存在しない場合は新規生成して保存
      if (!fortune) {
        const generatedFortune = await this.generateFortuneEntity(userId, birthDate, targetDate);
        const savedFortune = await this.fortuneRepository.create(generatedFortune);
        return savedFortune;
      }
      
      return fortune;
    } catch (error) {
      console.error(`${targetDate}の運勢データの取得/生成中にエラーが発生しました:`, error);
      throw error;
    }
  }

  /**
   * ユーザーの日付範囲の運勢を取得
   * @param userId ユーザーID
   * @param birthDate 生年月日 (YYYY-MM-DD形式)
   * @param startDate 開始日
   * @param endDate 終了日
   * @returns 運勢エンティティの配列
   */
  async getFortuneRange(userId: string, birthDate: string, startDate: Date, endDate: Date): Promise<Fortune[]> {
    try {
      // 既存のデータを取得
      const existingFortunes: Fortune[] = [];
      
      // 開始日から終了日までの日付を処理
      const allDates: Date[] = [];
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      for (
        let date = new Date(start); 
        date <= end; 
        date.setDate(date.getDate() + 1)
      ) {
        allDates.push(new Date(date));
      }
      
      // 各日付ごとの運勢を取得または生成
      const result: Fortune[] = [];
      
      for (const date of allDates) {
        let fortune = await this.fortuneRepository.findByUserIdAndDate(userId, date);
        
        if (!fortune) {
          // 生成して保存
          const generatedFortune = await this.generateFortuneEntity(userId, birthDate, date);
          fortune = await this.fortuneRepository.create(generatedFortune);
        }
        
        result.push(fortune);
      }
      
      // 日付順にソート
      return result.sort(
        (a, b) => a.date.getTime() - b.date.getTime()
      );
    } catch (error) {
      console.error('運勢範囲データの取得/生成中にエラーが発生しました:', error);
      throw error;
    }
  }

  /**
   * 週間運勢予報を取得
   * @param userId ユーザーID
   * @param birthDate 生年月日 (YYYY-MM-DD形式)
   * @param startDate 開始日 (デフォルト: 今日)
   * @param days 日数 (デフォルト: 7)
   * @returns 週間運勢エンティティの配列
   */
  async getWeeklyForecast(
    userId: string,
    birthDate: string,
    startDate?: Date,
    days: number = 7
  ): Promise<Fortune[]> {
    // 開始日が指定されていない場合は今日を使用
    const actualStartDate = startDate || new Date();
    
    // 終了日を計算
    const end = new Date(actualStartDate);
    end.setDate(actualStartDate.getDate() + days - 1);
    
    // 日付範囲の運勢を取得
    return this.getFortuneRange(userId, birthDate, actualStartDate, end);
  }

  /**
   * 運勢エンティティを生成する
   * @param userId ユーザーID
   * @param birthDate 生年月日 (YYYY-MM-DD形式)
   * @param targetDate 対象日
   * @returns 運勢エンティティ
   */
  private async generateFortuneEntity(userId: string, birthDate: string, targetDate: Date): Promise<Fortune> {
    // 日付をYYYY-MM-DD形式に変換
    const dateStr = targetDate.toISOString().split('T')[0];
    
    // ElementalForecastを使用して運勢データを生成
    const generatedFortune = ElementalForecast.generateDailyFortune(birthDate, dateStr);
    
    // 値が1未満の場合は最小値1に調整
    const ensureMinValue = (value: number): number => Math.max(1, value);
    
    // Fortuneエンティティに変換
    const fortune: Fortune = {
      id: '', // リポジトリで割り当て
      userId: userId,
      date: targetDate,
      overallScore: ensureMinValue(generatedFortune.overallLuck),
      rating: this.mapScoreToRating(generatedFortune.overallLuck),
      categories: {
        work: ensureMinValue(generatedFortune.careerLuck),
        teamwork: ensureMinValue(generatedFortune.relationshipLuck),
        health: ensureMinValue(generatedFortune.healthLuck),
        communication: ensureMinValue(generatedFortune.creativityLuck)
      },
      luckyItems: generatedFortune.luckyColors,  // 簡略化のため色をラッキーアイテムとして使用
      yinYangBalance: {
        yin: generatedFortune.yinYang === '陰' ? 70 : 30,
        yang: generatedFortune.yinYang === '陽' ? 70 : 30
      },
      advice: generatedFortune.advice,
      createdAt: new Date(),
      updatedAt: new Date(),
      // MongoDBスキーマに合わせて追加のフィールドを設定
      dailyElement: generatedFortune.dailyElement,
      yinYang: generatedFortune.yinYang,
      careerLuck: ensureMinValue(generatedFortune.careerLuck),
      relationshipLuck: ensureMinValue(generatedFortune.relationshipLuck),
      creativeEnergyLuck: ensureMinValue(generatedFortune.creativityLuck), // フィールド名をMySQLスキーマに合わせる
      healthLuck: ensureMinValue(generatedFortune.healthLuck),
      wealthLuck: ensureMinValue(generatedFortune.wealthLuck),
      description: generatedFortune.description,
      luckyColors: generatedFortune.luckyColors,
      luckyDirections: generatedFortune.luckyDirections,
      compatibleElements: generatedFortune.compatibleElements,
      incompatibleElements: generatedFortune.incompatibleElements
    };
    
    return fortune;
  }

  /**
   * ユーザー間の陰陽五行相性を計算
   * @param userElement1 ユーザー1の五行情報
   * @param userElement2 ユーザー2の五行情報
   * @returns 相性分析
   */
  calculateUserCompatibility(
    userElement1: {
      mainElement: ElementType;
      secondaryElement?: ElementType;
      yinYang: YinYangType;
    },
    userElement2: {
      mainElement: ElementType;
      secondaryElement?: ElementType;
      yinYang: YinYangType;
    }
  ) {
    return ElementalCompatibility.calculatePersonalCompatibility(
      userElement1,
      userElement2
    );
  }

  /**
   * チーム内の陰陽五行バランスと相性を分析
   * @param teamMembers チームメンバーの五行情報
   * @returns チーム分析結果
   */
  analyzeTeamDynamics(
    teamMembers: Array<{
      id: string;
      name: string;
      mainElement: ElementType;
      secondaryElement?: ElementType;
      yinYang: YinYangType;
    }>
  ) {
    return ElementalCompatibility.analyzeTeamDynamics(teamMembers);
  }

  /**
   * 今日の五行属性と陰陽を取得
   * @returns 今日の五行と陰陽
   */
  getTodayElement(): {
    element: ElementType;
    yinYang: YinYangType;
  } {
    return ElementalCalculator.getTodayElement();
  }

  /**
   * 運勢スコアからレーティングへの変換
   * @param score 運勢スコア（1-100）
   * @returns 運勢レーティング
   */
  private mapScoreToRating(score: number): FortuneRating {
    if (score >= 80) return FortuneRating.EXCELLENT;
    if (score >= 60) return FortuneRating.GOOD;
    if (score >= 40) return FortuneRating.NEUTRAL;
    if (score >= 20) return FortuneRating.CAUTION;
    return FortuneRating.POOR;
  }
  
  /**
   * 生年月日から陰陽五行プロファイルを計算する
   * @param birthDate 生年月日
   * @returns 陰陽五行プロファイル
   */
  calculateElementalProfileFromBirthDate(birthDate: Date): ElementalProfile {
    const year = birthDate.getFullYear();
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();
    
    // 主属性の計算（年と月の合計を5で割った余り）
    const mainElementIndex = (year + month) % 5;
    const mainElement = this.elements[mainElementIndex];
    
    // 副属性の計算（月と日の合計を5で割った余り）
    const secondaryElementIndex = (month + day) % 5;
    const secondaryElement = this.elements[secondaryElementIndex];
    
    // 陰陽の計算（年が奇数なら陽、偶数なら陰）
    const yinYang: YinYangType = year % 2 !== 0 ? '陽' : '陰';
    
    return new ElementalProfile(mainElement, yinYang, secondaryElement);
  }
  
  /**
   * デイリー運勢用の日付から元素を計算する
   * @param date 日付
   * @returns 陰陽五行プロファイル
   */
  calculateDailyElementalProfile(date: Date): ElementalProfile {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // 日の元素（日付を5で割った余り）
    const dayElementIndex = day % 5;
    const mainElement = this.elements[dayElementIndex];
    
    // 月の元素（月を5で割った余り）
    const monthElementIndex = month % 5;
    const secondaryElement = this.elements[monthElementIndex];
    
    // 日の陰陽（日が奇数なら陽、偶数なら陰）
    const yinYang: YinYangType = day % 2 !== 0 ? '陽' : '陰';
    
    return new ElementalProfile(mainElement, yinYang, secondaryElement);
  }
}