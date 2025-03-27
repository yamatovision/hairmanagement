/**
 * Mongooseモックユーティリティ
 * テスト環境用のMongooseモデルのモック化をサポート
 */

import { ElementType, YinYangType } from '@shared';

/**
 * MongoDB関連エラーの重複を避けるためのヘルパークラス
 */
export class MongoMock {
  /**
   * 今日の日付をYYYY-MM-DD形式で取得
   */
  static getTodayString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  /**
   * 運勢モックデータ生成
   */
  static generateMockFortune(userId: string, date: string): any {
    return {
      _id: `mock-fortune-${date}`,
      id: `mock-fortune-${date}`,
      userId,
      date,
      dailyElement: '木' as ElementType,
      yinYang: '陽' as YinYangType,
      overallLuck: 75,
      careerLuck: 80,
      relationshipLuck: 70,
      creativeEnergyLuck: 85,
      healthLuck: 65,
      wealthLuck: 60,
      description: `テスト用の運勢データです。日付: ${date}`,
      advice: 'これはテスト用のアドバイスです。実際の運用では本番データが使用されます。',
      luckyColors: ['緑', '青', '水色'],
      luckyDirections: ['東', '南'],
      compatibleElements: ['火', '木'] as ElementType[],
      incompatibleElements: ['金', '土'] as ElementType[],
      viewedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      save: () => Promise.resolve(this),
      toJSON: () => {
        return {
          id: `mock-fortune-${date}`,
          userId,
          date,
          dailyElement: '木',
          yinYang: '陽',
          overallLuck: 75,
          careerLuck: 80,
          relationshipLuck: 70,
          creativeEnergyLuck: 85,
          healthLuck: 65,
          wealthLuck: 60,
          description: `テスト用の運勢データです。日付: ${date}`,
          advice: 'これはテスト用のアドバイスです。実際の運用では本番データが使用されます。',
          luckyColors: ['緑', '青', '水色'],
          luckyDirections: ['東', '南'],
          compatibleElements: ['火', '木'],
          incompatibleElements: ['金', '土'],
          viewedAt: null,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }
    };
  }
  
  /**
   * 運勢モックデータ配列生成
   */
  static generateMockFortuneRange(userId: string, startDate: string, endDate: string): any[] {
    const fortunes = [];
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // 日付範囲内の運勢データを生成
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      fortunes.push(this.generateMockFortune(userId, dateStr));
    }
    
    return fortunes;
  }
}