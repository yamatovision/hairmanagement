/**
 * 日次カレンダー情報サービス
 * 日付に対応する干支情報を計算・管理する
 * 
 * 作成日: 2025/04/06
 * 作成者: Claude
 * 
 * 変更履歴:
 * - 2025/04/05: データフロー強化（フェーズ2）対応 (Claude)
 *   - SajuDataTransformerとの連携を追加
 *   - 互換性スコア計算を改善
 */
import { inject, injectable } from 'tsyringe';
import { SajuCalculatorService } from './saju-calculator.service';
import { SajuDataTransformer } from './saju-data-transformer.service';
import mongoose from 'mongoose';
import { IDailyCalendarInfoRepository } from '../../domain/repositories/IDailyCalendarInfoRepository';
import { ElementType, YinYangType } from '../../shared';
import { IDailyCalendarInfoDocument } from '../../domain/models/daily-calendar-info.model';

/**
 * 日次カレンダー情報サービス
 * 日付に対応する干支情報を計算・管理する
 */
@injectable()
export class DailyCalendarInfoService {
  constructor(
    @inject('IDailyCalendarInfoRepository') private dailyCalendarInfoRepository: IDailyCalendarInfoRepository,
    @inject(SajuCalculatorService) private sajuCalculatorService: SajuCalculatorService,
    @inject('SajuDataTransformer') private sajuDataTransformer: SajuDataTransformer
  ) {}

  /**
   * 日付に対応する日次カレンダー情報を取得または作成
   * @param date 日付
   * @returns 日次カレンダー情報
   */
  async getOrCreateCalendarInfo(date: Date | string): Promise<any> {
    // 日付を文字列形式に変換
    const dateStr = typeof date === 'string' 
      ? date 
      : date.toISOString().split('T')[0]; // YYYY-MM-DD形式
    
    // クラス名とメソッド名をログに記録（使い方の追跡用）
    console.log(`[DailyCalendarInfoService] getOrCreateCalendarInfo: date=${dateStr}`);
    
    // 既存の情報を検索
    const existingInfoResult = await this.dailyCalendarInfoRepository.findByDate(dateStr);
    if (existingInfoResult.isSuccess && existingInfoResult.getValue()) {
      const existingInfo = existingInfoResult.getValue();
      if (existingInfo) {
        console.log(`[DailyCalendarInfoService] 既存の日次カレンダー情報が見つかりました: id=${existingInfo.id}`);
        return existingInfo;
      }
    }
    
    console.log(`[DailyCalendarInfoService] 既存の日次カレンダー情報が見つかりません。新規計算します。`);
    
    // 存在しない場合は新規計算
    return this.calculateAndSaveCalendarInfo(dateStr);
  }

  /**
   * 今日の日次カレンダー情報を取得または作成
   * @returns 今日の日次カレンダー情報
   */
  async getTodayCalendarInfo(): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    
    console.log(`[DailyCalendarInfoService] getTodayCalendarInfo: today=${todayStr}`);
    
    return this.getOrCreateCalendarInfo(todayStr);
  }

  /**
   * 日次カレンダー情報を計算して保存
   * @param dateStr 日付文字列 (YYYY-MM-DD形式)
   * @returns 計算・保存された日次カレンダー情報
   */
  private async calculateAndSaveCalendarInfo(dateStr: string): Promise<any> {
    console.log(`[DailyCalendarInfoService] calculateAndSaveCalendarInfo: date=${dateStr}`);
    
    try {
      const date = new Date(dateStr);
      
      // 四柱計算
      // IMPORTANT: このメソッドはSajuCalculatorServiceから呼び出される
      console.log(`[DailyCalendarInfoService] 四柱計算を実行します: date=${dateStr}`);
      const fourPillars = this.sajuCalculatorService.calculateDayFourPillars(date);
      
      // 天干から五行と陰陽を判定
      console.log(`[DailyCalendarInfoService] 天干(${fourPillars.dayPillar.stem})から五行と陰陽を判定`);
      const { mainElement, yinYang } = this.determineElementAndYinYang(fourPillars.dayPillar.stem);
      
      // 旧暦情報の計算
      console.log(`[DailyCalendarInfoService] 旧暦情報の計算`);
      const lunarDate = await this.calculateLunarDate(date);
      
      // 節気情報の取得
      console.log(`[DailyCalendarInfoService] 節気情報の計算`);
      const solarTerms = await this.calculateSolarTerms(date);
      
      // 日次カレンダー情報を構築
      const calendarInfo = {
        date: dateStr,
        yearPillar: fourPillars.yearPillar,
        monthPillar: fourPillars.monthPillar,
        dayPillar: fourPillars.dayPillar,
        hourPillar: fourPillars.hourPillar,
        mainElement,
        dayYinYang: yinYang,
        lunarDate,
        solarTerms
      };
      
      console.log(`[DailyCalendarInfoService] 日次カレンダー情報を保存します`);
      
      // 情報を保存して返す
      const resultCreateOrUpdate = await this.dailyCalendarInfoRepository.createOrUpdateByDate(calendarInfo);
      if (resultCreateOrUpdate.isSuccess) {
        const savedInfo = resultCreateOrUpdate.getValue();
        console.log(`[DailyCalendarInfoService] 日次カレンダー情報の保存が完了しました: id=${savedInfo.id}`);
        return savedInfo;
      } else {
        const error = resultCreateOrUpdate.getError();
        console.error(`[DailyCalendarInfoService] 日次カレンダー情報の保存に失敗しました: ${error.message}`);
        throw error;
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`[DailyCalendarInfoService] 日次カレンダー情報の計算・保存に失敗しました: ${error.message}`, error);
        throw error;
      }
      // unknownエラーの場合は汎用エラーに変換
      const genericError = new Error(`日次カレンダー情報の計算・保存に失敗しました: ${String(error)}`);
      console.error(`[DailyCalendarInfoService] ${genericError.message}`);
      throw genericError;
    }
  }

  /**
   * 天干から五行と陰陽を判定
   */
  private determineElementAndYinYang(stem: string): { mainElement: ElementType, yinYang: YinYangType } {
    const stemToElement: Record<string, [ElementType, YinYangType]> = {
      '甲': ['木', '陽'], '乙': ['木', '陰'],
      '丙': ['火', '陽'], '丁': ['火', '陰'],
      '戊': ['土', '陽'], '己': ['土', '陰'],
      '庚': ['金', '陽'], '辛': ['金', '陰'],
      '壬': ['水', '陽'], '癸': ['水', '陰']
    };
    
    const [mainElement, yinYang] = stemToElement[stem] || ['木' as ElementType, '陽' as YinYangType];
    return { mainElement, yinYang };
  }

  /**
   * 旧暦情報の計算
   */
  private async calculateLunarDate(date: Date): Promise<any> {
    try {
      // SajuEngineを通じて旧暦情報を取得
      const engine = this.sajuCalculatorService['sajuEngine'] as any;
      if (engine && typeof engine.getLunarDate === 'function') {
        const lunarDate = await engine.getLunarDate(date);
        return {
          year: lunarDate.lunarYear || date.getFullYear(),
          month: lunarDate.lunarMonth || date.getMonth() + 1,
          day: lunarDate.lunarDay || date.getDate(),
          isLeapMonth: lunarDate.isLeapMonth || false
        };
      }
      
      // エンジンがない場合はデフォルト値
      return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        isLeapMonth: false
      };
    } catch (error) {
      if (error instanceof Error) {
        console.error(`[DailyCalendarInfoService] 旧暦情報の計算に失敗しました: ${error.message}`);
      } else {
        console.error(`[DailyCalendarInfoService] 旧暦情報の計算に失敗しました: ${String(error)}`);
      }
      
      // エラー時はデフォルト値
      return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        isLeapMonth: false
      };
    }
  }

  /**
   * 節気情報の計算
   */
  private async calculateSolarTerms(date: Date): Promise<any> {
    try {
      // SajuEngineを通じて節気情報を取得
      const engine = this.sajuCalculatorService['sajuEngine'] as any;
      if (engine && typeof engine.getSolarTerms === 'function') {
        const solarTerms = await engine.getSolarTerms(date);
        return {
          current: solarTerms.current || { name: '未定義', date: new Date(date) },
          previous: solarTerms.previous || { name: '未定義', date: new Date(date.getTime() - 15 * 24 * 60 * 60 * 1000) },
          next: solarTerms.next || { name: '未定義', date: new Date(date.getTime() + 15 * 24 * 60 * 60 * 1000) }
        };
      }
      
      // エンジンがない場合はデフォルト値
      return {
        current: { name: '未定義', date: new Date(date) },
        previous: { name: '未定義', date: new Date(date.getTime() - 15 * 24 * 60 * 60 * 1000) },
        next: { name: '未定義', date: new Date(date.getTime() + 15 * 24 * 60 * 60 * 1000) }
      };
    } catch (error) {
      if (error instanceof Error) {
        console.error(`[DailyCalendarInfoService] 節気情報の計算に失敗しました: ${error.message}`);
      } else {
        console.error(`[DailyCalendarInfoService] 節気情報の計算に失敗しました: ${String(error)}`);
      }
      
      // エラー時はデフォルト値
      return {
        current: { name: '未定義', date: new Date(date) },
        previous: { name: '未定義', date: new Date(date.getTime() - 15 * 24 * 60 * 60 * 1000) },
        next: { name: '未定義', date: new Date(date.getTime() + 15 * 24 * 60 * 60 * 1000) }
      };
    }
  }

  /**
   * 日付範囲の日次カレンダー情報を取得
   * @param startDate 開始日
   * @param endDate 終了日
   * @returns 日次カレンダー情報の配列
   */
  async getCalendarInfoRange(startDate: Date | string, endDate: Date | string): Promise<any[]> {
    // 日付を文字列形式に変換
    const startDateStr = typeof startDate === 'string' 
      ? startDate 
      : startDate.toISOString().split('T')[0];
    
    const endDateStr = typeof endDate === 'string' 
      ? endDate 
      : endDate.toISOString().split('T')[0];
    
    console.log(`[DailyCalendarInfoService] getCalendarInfoRange: startDate=${startDateStr}, endDate=${endDateStr}`);
    
    // リポジトリから日付範囲のデータを取得
    const existingInfosResult = await this.dailyCalendarInfoRepository.findByDateRange(startDateStr, endDateStr);
    
    let existingInfos: IDailyCalendarInfoDocument[] = [];
    if (existingInfosResult.isSuccess) {
      existingInfos = existingInfosResult.getValue();
    } else {
      console.error(`[DailyCalendarInfoService] 既存データ取得エラー: ${existingInfosResult.getError().message}`);
      // エラーの場合は空配列で続行
    }
    
    console.log(`[DailyCalendarInfoService] 既存データ数: ${existingInfos.length}`);
    
    // 存在しない日付を特定
    const existingDates = new Set(existingInfos.map(info => info.date));
    
    // 日付範囲内の全ての日付を生成
    const allDates = this.generateDateRange(new Date(startDateStr), new Date(endDateStr));
    console.log(`[DailyCalendarInfoService] 日付範囲内の全日数: ${allDates.length}`);
    
    // 存在しない日付のデータを作成
    const missingDates = allDates.filter(dateStr => !existingDates.has(dateStr));
    console.log(`[DailyCalendarInfoService] 不足している日付数: ${missingDates.length}`);
    
    const newInfoPromises = missingDates.map(dateStr => this.calculateAndSaveCalendarInfo(dateStr));
    const newInfos = await Promise.all(newInfoPromises);
    
    // 既存と新規のデータを結合して日付順にソート
    const result = [...existingInfos, ...newInfos].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    console.log(`[DailyCalendarInfoService] 返却する総データ数: ${result.length}`);
    return result;
  }

  /**
   * 日付範囲内の全ての日付を生成
   * @param startDate 開始日
   * @param endDate 終了日
   * @returns 日付文字列の配列 (YYYY-MM-DD形式)
   */
  private generateDateRange(startDate: Date, endDate: Date): string[] {
    const dates: string[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  }
  
  /**
   * 日次カレンダー情報と四柱推命情報を組み合わせた拡張データを生成
   * @param calendarInfo 日次カレンダー情報
   * @param sajuProfile 四柱推命プロファイル（オプション）
   * @returns 拡張された日次カレンダー情報
   */
  async enrichWithSajuData(calendarInfo: any, sajuProfile?: any): Promise<any> {
    console.log(`[DailyCalendarInfoService] enrichWithSajuData: calendarInfoId=${calendarInfo.id}`);
    
    if (!sajuProfile) {
      return calendarInfo;
    }
    
    try {
      // フェーズ2: SajuDataTransformerを利用したデータ変換
      console.log(`[DailyCalendarInfoService] SajuDataTransformerを利用したデータ変換を実行`);
      
      // 日柱天干（ユーザーの日主）を取得
      const dayMaster = sajuProfile.fourPillars.dayPillar.stem;
      
      // 主要五行を取得
      const { mainElement } = this.sajuDataTransformer.extractElementalInfo(sajuProfile.fourPillars);
      
      // 地支十神関係を取得
      const branchTenGods = sajuProfile.branchTenGods || {};
      
      // SajuDataTransformerを使用して互換性データを生成
      const sajuDataResult = this.sajuDataTransformer.createFortuneCompatibilityData(
        calendarInfo,
        dayMaster,
        mainElement,
        branchTenGods
      );
      
      if (!sajuDataResult.isSuccess) {
        throw new Error(`SajuDataTransformer処理に失敗: ${sajuDataResult.getError().message}`);
      }
      
      const sajuData = sajuDataResult.getValue();
      
      // 拡張情報を追加
      const enrichedData = {
        ...calendarInfo,
        sajuData
      };
      
      console.log(`[DailyCalendarInfoService] SajuDataTransformer連携完了: 互換性スコア=${sajuData.compatibility || 'なし'}`);
      return enrichedData;
    } catch (error) {
      if (error instanceof Error) {
        console.error(`[DailyCalendarInfoService] SajuData拡張処理でエラーが発生しました: ${error.message}`, error);
      } else {
        console.error(`[DailyCalendarInfoService] SajuData拡張処理でエラーが発生しました: ${String(error)}`);
      }
      
      // エラー時は元のデータを返す
      console.log(`[DailyCalendarInfoService] 従来の方法でSajuDataを計算`);
      
      try {
        // 日干（ユーザーの日柱天干）
        const dayMaster = sajuProfile.fourPillars.dayPillar.stem;
        
        // 今日の日柱天干
        const todayStem = calendarInfo.dayPillar.stem;
        
        // 十神関係の計算
        const tenGod = this.calculateTenGodRelation(dayMaster, todayStem);
        
        // 地支の十神関係の計算
        const branchTenGod = sajuProfile.branchTenGods 
          ? sajuProfile.branchTenGods.day || '未定義'
          : '未定義';
        
        // 四柱の互換性スコア計算
        const compatibility = this.calculateCompatibilityScore(
          sajuProfile.fourPillars, 
          {
            yearPillar: calendarInfo.yearPillar,
            monthPillar: calendarInfo.monthPillar,
            dayPillar: calendarInfo.dayPillar,
            hourPillar: calendarInfo.hourPillar
          }
        );
        
        // 拡張情報を追加
        return {
          ...calendarInfo,
          sajuData: {
            dayMaster,
            dayElement: this.getStemElement(todayStem),
            tenGod,
            branchTenGod,
            compatibility
          }
        };
      } catch (fallbackError) {
        if (fallbackError instanceof Error) {
          console.error(`[DailyCalendarInfoService] フォールバック処理でもエラー: ${fallbackError.message}`);
        } else {
          console.error(`[DailyCalendarInfoService] フォールバック処理でも不明なエラーが発生しました: ${String(fallbackError)}`);
        }
        return calendarInfo;
      }
    }
  }
  
  /**
   * 日主と天干の十神関係を計算
   * @param dayMaster 日主（ユーザーの日柱天干）
   * @param stem 天干
   * @returns 十神関係
   */
  private calculateTenGodRelation(dayMaster: string, stem: string): string {
    // 十神関係のマッピング
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
    
    return tenGodMap[dayMaster]?.[stem] || '未定義';
  }
  
  /**
   * 天干から五行属性を取得
   * @param stem 天干
   * @returns 五行属性
   */
  private getStemElement(stem: string): ElementType {
    const stemToElement: Record<string, ElementType> = {
      '甲': '木', '乙': '木',
      '丙': '火', '丁': '火',
      '戊': '土', '己': '土',
      '庚': '金', '辛': '金',
      '壬': '水', '癸': '水'
    };
    
    return stemToElement[stem] || '木';
  }
  
  /**
   * 互換性スコアを計算
   * @param userFourPillars ユーザーの四柱
   * @param todayFourPillars 当日の四柱
   * @returns 互換性スコア（0-100）
   */
  private calculateCompatibilityScore(userFourPillars: any, todayFourPillars: any): number {
    // 簡易的な互換性スコア計算
    // 実際のアプリケーションではより複雑なロジックが必要
    
    // 同じ天干・地支があれば加点
    let score = 50; // 基本スコア
    
    // 日柱の天干が同じ場合
    if (userFourPillars.dayPillar.stem === todayFourPillars.dayPillar.stem) {
      score += 20;
    }
    
    // 日柱の地支が同じ場合
    if (userFourPillars.dayPillar.branch === todayFourPillars.dayPillar.branch) {
      score += 15;
    }
    
    // 年柱が同じ場合
    if (userFourPillars.yearPillar.stem === todayFourPillars.yearPillar.stem) {
      score += 5;
    }
    if (userFourPillars.yearPillar.branch === todayFourPillars.yearPillar.branch) {
      score += 5;
    }
    
    // 月柱が同じ場合
    if (userFourPillars.monthPillar.stem === todayFourPillars.monthPillar.stem) {
      score += 5;
    }
    if (userFourPillars.monthPillar.branch === todayFourPillars.monthPillar.branch) {
      score += 5;
    }
    
    // 相生関係の考慮
    const dayMasterElement = this.getStemElement(userFourPillars.dayPillar.stem);
    const todayElement = this.getStemElement(todayFourPillars.dayPillar.stem);
    
    if (this.isGeneratingRelation(dayMasterElement, todayElement)) {
      score += 10;
    } else if (this.isGeneratingRelation(todayElement, dayMasterElement)) {
      score += 5;
    }
    
    // スコアを0-100の範囲に収める
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * 相生関係（element1がelement2を生む関係）をチェック
   * @param element1 五行1
   * @param element2 五行2
   * @returns 相生関係かどうか
   */
  private isGeneratingRelation(element1: ElementType, element2: ElementType): boolean {
    const generatingRelations: Record<ElementType, ElementType> = {
      '木': '火',
      '火': '土',
      '土': '金',
      '金': '水',
      '水': '木'
    };
    
    return generatingRelations[element1] === element2;
  }
}