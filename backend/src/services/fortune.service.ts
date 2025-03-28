/**
 * 運勢サービス
 * 陰陽五行運勢の計算、保存、取得を行う
 * 
 * 変更履歴:
 * - 2025/03/26: 初期実装 (AppGenius)
 */

import mongoose from 'mongoose';
import { documentToInterface, documentsToInterfaces } from '../utils/model-converters';
import Fortune, { IFortuneDocument } from '../models/fortune.model';
import { IFortune } from '@shared';
import { ElementalCalculator } from '../utils/elemental/calculator';
import { ElementalCompatibility } from '../utils/elemental/compatibility';
import { ElementalForecast } from '../utils/elemental/forecast';
import { ElementType, YinYangType } from '@shared';
// モンゴDBモックをインポート
// MongoDB接続は実際の接続を使用

export class FortuneService {
  /**
   * ユーザーの当日の運勢を取得
   * 存在しない場合は新規に生成して保存
   * 
   * @param userId ユーザーID
   * @param birthDate 生年月日 (YYYY-MM-DD形式)
   * @returns 運勢データ
   */
  static async getDailyFortune(
    userId: string, 
    birthDate: string
  ): Promise<IFortuneDocument> {
    // 今日の日付をYYYY-MM-DD形式で取得
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // 本番環境では実際のデータベースを使用
    
    try {
      // データベースからユーザーの今日の運勢を検索
      let fortune = await Fortune.findByUserAndDate(userId, todayStr);
      
      // 存在しない場合は新規生成して保存
      if (!fortune) {
        const generatedFortune = ElementalForecast.generateDailyFortune(birthDate, todayStr);
        
        const newFortune = new Fortune({
          userId: new mongoose.Types.ObjectId(userId),
          date: todayStr,
          dailyElement: generatedFortune.dailyElement,
          yinYang: generatedFortune.yinYang,
          overallLuck: generatedFortune.overallLuck,
          careerLuck: generatedFortune.careerLuck,
          relationshipLuck: generatedFortune.relationshipLuck,
          creativeEnergyLuck: generatedFortune.creativityLuck,
          healthLuck: generatedFortune.healthLuck,
          wealthLuck: generatedFortune.wealthLuck,
          description: generatedFortune.description,
          advice: generatedFortune.advice,
          luckyColors: generatedFortune.luckyColors,
          luckyDirections: generatedFortune.luckyDirections,
          compatibleElements: generatedFortune.compatibleElements,
          incompatibleElements: generatedFortune.incompatibleElements
        });
        
        const savedFortune = await newFortune.save();
        return savedFortune as unknown as IFortuneDocument;
      }
      
      return fortune as unknown as IFortuneDocument;
    } catch (error) {
      console.error('運勢データの取得/生成中にエラーが発生しました:', error);
      throw error;
    }
  }
  
  /**
   * ユーザーの指定日の運勢を取得
   * 存在しない場合は新規に生成して保存
   * 
   * @param userId ユーザーID
   * @param birthDate 生年月日
   * @param targetDate 対象日
   * @returns 運勢データ
   */
  static async getFortuneByDate(
    userId: string, 
    birthDate: string, 
    targetDate: string
  ): Promise<IFortuneDocument> {
    // 本番環境では実際のデータベースを使用
    
    try {
      // データベースからユーザーの指定日の運勢を検索
      let fortune = await Fortune.findByUserAndDate(userId, targetDate);
      
      // 存在しない場合は新規生成して保存
      if (!fortune) {
        const generatedFortune = ElementalForecast.generateDailyFortune(birthDate, targetDate);
        
        const newFortune = new Fortune({
          userId: new mongoose.Types.ObjectId(userId),
          date: targetDate,
          dailyElement: generatedFortune.dailyElement,
          yinYang: generatedFortune.yinYang,
          overallLuck: generatedFortune.overallLuck,
          careerLuck: generatedFortune.careerLuck,
          relationshipLuck: generatedFortune.relationshipLuck,
          creativeEnergyLuck: generatedFortune.creativityLuck,
          healthLuck: generatedFortune.healthLuck,
          wealthLuck: generatedFortune.wealthLuck,
          description: generatedFortune.description,
          advice: generatedFortune.advice,
          luckyColors: generatedFortune.luckyColors,
          luckyDirections: generatedFortune.luckyDirections,
          compatibleElements: generatedFortune.compatibleElements,
          incompatibleElements: generatedFortune.incompatibleElements
        });
        
        const savedFortune = await newFortune.save();
        return savedFortune as unknown as IFortuneDocument;
      }
      
      return fortune as unknown as IFortuneDocument;
    } catch (error) {
      console.error(`${targetDate}の運勢データの取得/生成中にエラーが発生しました:`, error);
      throw error;
    }
  }
  
  /**
   * ユーザーの日付範囲の運勢を取得
   * 
   * @param userId ユーザーID
   * @param birthDate 生年月日
   * @param startDate 開始日
   * @param endDate 終了日
   * @returns 運勢データの配列
   */
  static async getFortuneRange(
    userId: string, 
    birthDate: string, 
    startDate: string, 
    endDate: string
  ): Promise<IFortuneDocument[]> {
    // 本番環境では実際のデータベースを使用
    
    try {
      // 既存のデータを取得
      const existingFortunes = await Fortune.findByUserAndDateRange(
        userId,
        startDate,
        endDate
      );
      
      // 取得した日付を記録
      const existingDates = new Set(existingFortunes.map(fortune => fortune.date));
      
      // 開始日から終了日までの日付配列を生成
      const allDates: string[] = [];
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      for (
        let date = new Date(start); 
        date <= end; 
        date.setDate(date.getDate() + 1)
      ) {
        const dateStr = date.toISOString().split('T')[0];
        allDates.push(dateStr);
      }
      
      // 存在しない日付の運勢を生成
      const missingDates = allDates.filter(date => !existingDates.has(date));
      const newFortunes: IFortuneDocument[] = [];
      
      for (const date of missingDates) {
        const generatedFortune = ElementalForecast.generateDailyFortune(birthDate, date);
        
        const fortune = new Fortune({
          userId: new mongoose.Types.ObjectId(userId),
          date: date,
          dailyElement: generatedFortune.dailyElement,
          yinYang: generatedFortune.yinYang,
          overallLuck: generatedFortune.overallLuck,
          careerLuck: generatedFortune.careerLuck,
          relationshipLuck: generatedFortune.relationshipLuck,
          creativeEnergyLuck: generatedFortune.creativityLuck,
          healthLuck: generatedFortune.healthLuck,
          wealthLuck: generatedFortune.wealthLuck,
          description: generatedFortune.description,
          advice: generatedFortune.advice,
          luckyColors: generatedFortune.luckyColors,
          luckyDirections: generatedFortune.luckyDirections,
          compatibleElements: generatedFortune.compatibleElements,
          incompatibleElements: generatedFortune.incompatibleElements
        });
        
        const savedFortune = await fortune.save();
        newFortunes.push(savedFortune as unknown as IFortuneDocument);
      }
      
      // 既存のデータと新しく生成したデータを結合し、日付順にソート
      return [...existingFortunes, ...newFortunes].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    } catch (error) {
      console.error('運勢範囲データの取得/生成中にエラーが発生しました:', error);
      throw error;
    }
  }
  
  /**
   * 運勢を閲覧済みとしてマーク
   * 
   * @param fortuneId 運勢ID
   * @returns 更新された運勢データ
   */
  static async markFortuneAsViewed(fortuneId: string): Promise<IFortuneDocument | null> {
    try {
      const fortune = await Fortune.findById(fortuneId);
      
      if (!fortune) {
        return null;
      }
      
      // 直接更新する方法で統一
      fortune.viewedAt = new Date();
      const savedFortune = await fortune.save();
      
      // IFortuneDocumentとしてキャスト（モンゴースのドキュメントから変換）
      return savedFortune as unknown as IFortuneDocument;
    } catch (error) {
      console.error('運勢の閲覧状態更新中にエラーが発生しました:', error);
      throw error;
    }
  }
  
  /**
   * ユーザー間の陰陽五行相性を計算
   * 
   * @param userElement1 ユーザー1の五行情報
   * @param userElement2 ユーザー2の五行情報
   * @returns 相性分析
   */
  static calculateUserCompatibility(
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
   * 
   * @param teamMembers チームメンバーの五行情報
   * @returns チーム分析結果
   */
  static analyzeTeamDynamics(
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
   * 
   * @returns 今日の五行と陰陽
   */
  static getTodayElement(): {
    element: ElementType;
    yinYang: YinYangType;
  } {
    return ElementalCalculator.getTodayElement();
  }
  
  /**
   * 週間運勢予報を取得
   * 
   * @param userId ユーザーID
   * @param birthDate 生年月日
   * @param startDate 開始日 (デフォルト: 今日)
   * @param days 日数 (デフォルト: 7)
   * @returns 週間運勢データ
   */
  static async getWeeklyForecast(
    userId: string,
    birthDate: string,
    startDate?: string,
    days: number = 7
  ): Promise<IFortuneDocument[]> {
    // 開始日が指定されていない場合は今日を使用
    const actualStartDate = startDate || new Date().toISOString().split('T')[0];
    
    // 終了日を計算
    const start = new Date(actualStartDate);
    const end = new Date(start);
    end.setDate(start.getDate() + days - 1);
    const endDate = end.toISOString().split('T')[0];
    
    // 日付範囲の運勢を取得
    return this.getFortuneRange(userId, birthDate, actualStartDate, endDate);
  }
}