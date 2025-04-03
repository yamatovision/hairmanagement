/**
 * 簡素化されたフォーチュンサービス
 */

import { apiRequest } from '../utils/api.utils';
import { FORTUNE, IFortune } from '../types';

/**
 * フォーチュンサービスクラス
 */
class FortuneService {
  /**
   * 本日の運勢を取得
   */
  async getDailyFortune(): Promise<IFortune> {
    try {
      const response = await apiRequest<IFortune>(FORTUNE.GET_DAILY, {
        method: 'GET',
        offlineTtl: 24 * 60 * 60 * 1000
      });
      
      return response;
    } catch (error) {
      console.error('運勢取得エラー:', error);
      throw error;
    }
  }

  /**
   * 指定日の運勢を取得
   */
  async getFortuneByDate(date: string): Promise<IFortune> {
    try {
      const response = await apiRequest<IFortune>(FORTUNE.GET_BY_DATE(date), {
        method: 'GET',
        offlineTtl: 24 * 60 * 60 * 1000
      });
      
      return response;
    } catch (error) {
      console.error(`${date}の運勢取得エラー:`, error);
      throw error;
    }
  }

  /**
   * 週間の運勢を取得
   */
  async getWeeklyFortunes(startDate?: string, birthDate?: string): Promise<IFortune[]> {
    try {
      // 必須パラメータの設定
      const params: any = {
        startDate: startDate || new Date().toISOString().split('T')[0],
        endDate: this.getEndDate(startDate),
        birthDate: birthDate || '1990-01-01' // デフォルト値
      };

      return await apiRequest<IFortune[]>(FORTUNE.GET_RANGE, {
        method: 'GET',
        params,
        offlineTtl: 24 * 60 * 60 * 1000
      });
    } catch (error) {
      console.error('週間運勢取得エラー:', error);
      // エラー時は空の配列を返すように変更
      return [];
    }
  }

  /**
   * 開始日から7日後の終了日を計算
   */
  private getEndDate(startDate?: string): string {
    const start = startDate ? new Date(startDate) : new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return end.toISOString().split('T')[0];
  }

  /**
   * 運勢を閲覧済みとしてマーク (機能削除済み)
   * クライアントサイドでのみ状態を更新するシンプルなスタブ関数
   */
  async markAsViewed(fortuneId: string): Promise<IFortune> {
    console.log(`クライアントサイドでのみ閲覧済み状態を更新: fortuneId=${fortuneId}`);
    
    // クライアントサイドで状態を更新するためのダミーレスポンス
    return {
      id: fortuneId,
      userId: '', 
      date: '',
      overallScore: 0,
      starRating: 0,
      rating: 'neutral' as 'excellent' | 'good' | 'neutral' | 'caution' | 'poor',
      categories: {
        work: 0,
        teamwork: 0,
        health: 0,
        communication: 0
      },
      advice: '',
      personalGoal: '',
      teamGoal: '',
      sajuData: {
        mainElement: '',
        yinYang: '',
        compatibility: 0
      },
      viewedAt: new Date().toISOString(), // このフィールドは更新される
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * 四柱推命プロファイルを取得
   */
  async getSajuProfile(birthDate?: string, birthHour: number = 12) {
    try {
      const params: any = { birthHour };
      if (birthDate) {
        params.birthDate = birthDate;
      }

      return await apiRequest(FORTUNE.GET_SAJU_PROFILE, {
        method: 'GET',
        params,
        offlineTtl: 7 * 24 * 60 * 60 * 1000
      });
    } catch (error) {
      console.error('四柱推命情報取得エラー:', error);
      throw error;
    }
  }
}

// インスタンスを変数に代入してからエクスポート
const fortuneServiceInstance = new FortuneService();
export default fortuneServiceInstance;