/**
 * モック運勢データ
 * テスト実行時に使用する運勢データのモックを提供
 */

import { ElementType, YinYangType } from '@shared';
import { IFortuneDocument } from './fortune.model';

/**
 * 運勢データのモック生成
 */
export class MockFortuneGenerator {
  /**
   * 単一の運勢データを生成
   */
  static generateMockFortune(userId: string, date: string): IFortuneDocument {
    const mockFortune = {
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
      markAsViewed: function() { 
        this.viewedAt = new Date();
        return Promise.resolve(this);
      },
      toInterface: function() {
        return {
          id: this.id,
          userId: this.userId,
          date: this.date,
          dailyElement: this.dailyElement,
          yinYang: this.yinYang,
          overallLuck: this.overallLuck,
          careerLuck: this.careerLuck,
          relationshipLuck: this.relationshipLuck,
          creativeEnergyLuck: this.creativeEnergyLuck,
          healthLuck: this.healthLuck,
          wealthLuck: this.wealthLuck,
          description: this.description,
          advice: this.advice,
          luckyColors: this.luckyColors,
          luckyDirections: this.luckyDirections,
          compatibleElements: this.compatibleElements,
          incompatibleElements: this.incompatibleElements,
          viewedAt: this.viewedAt,
          createdAt: this.createdAt,
          updatedAt: this.updatedAt
        };
      }
    } as unknown as IFortuneDocument;
    
    return mockFortune;
  }
  
  /**
   * 運勢データの配列を生成
   */
  static generateMockFortuneRange(userId: string, startDate: string, endDate: string): IFortuneDocument[] {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const fortunes: IFortuneDocument[] = [];
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      fortunes.push(this.generateMockFortune(userId, dateStr));
    }
    
    return fortunes;
  }
}