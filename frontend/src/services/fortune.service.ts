/**
 * フォーチュンサービス
 * 運勢関連APIリクエストを処理する
 * 
 * 変更履歴:
 * - 2025/03/26: 初期実装 (AppGenius)
 * - 2025/03/26: オフラインモード対応 (AppGenius)
 */

import { apiRequest } from '../utils/api.utils';
// 共有型定義のインポート
import { FORTUNE, IFortune } from '../types';

// FortuneQueryRequest型定義
type FortuneQueryRequest = {
  startDate?: string;
  endDate?: string;
  userId?: string;
};

/**
 * フォーチュンサービスクラス
 * 運勢関連の全APIリクエストを処理
 */
class FortuneService {
  /**
   * 本日の運勢を取得（オフラインモード対応）
   * @returns 本日の運勢データ
   */
  async getDailyFortune(): Promise<IFortune> {
    try {
      // オフラインモード対応のAPIリクエスト（キャッシュあり）
      return await apiRequest<IFortune>(FORTUNE.GET_DAILY, {
        method: 'GET',
        offlineTtl: 24 * 60 * 60 * 1000 // 24時間キャッシュ
      });
    } catch (error) {
      console.error('デイリー運勢取得エラー:', error);
      throw error;
    }
  }

  /**
   * 指定された日付の運勢を取得（オフラインモード対応）
   * @param date YYYY-MM-DD形式の日付
   * @returns 指定日の運勢データ
   */
  async getFortuneByDate(date: string): Promise<IFortune> {
    try {
      // オフラインモード対応のAPIリクエスト（キャッシュあり）
      return await apiRequest<IFortune>(FORTUNE.GET_BY_DATE(date), {
        method: 'GET',
        offlineTtl: 7 * 24 * 60 * 60 * 1000 // 7日間キャッシュ
      });
    } catch (error) {
      console.error(`${date}の運勢取得エラー:`, error);
      throw error;
    }
  }

  /**
   * 指定された日付範囲の運勢を取得（オフラインモード対応）
   * @param query 取得条件（開始日・終了日）
   * @returns 期間内の運勢データリスト
   */
  async getFortuneRange(query: FortuneQueryRequest): Promise<IFortune[]> {
    try {
      // オフラインモード対応のAPIリクエスト（キャッシュあり）
      return await apiRequest<IFortune[]>(FORTUNE.GET_RANGE, {
        method: 'GET',
        params: query,
        offlineTtl: 7 * 24 * 60 * 60 * 1000 // 7日間キャッシュ
      });
    } catch (error) {
      console.error('運勢範囲データ取得エラー:', error);
      throw error;
    }
  }

  /**
   * 週間運勢を取得（デフォルトで今日から7日間）
   * @param startDate 開始日（省略時は今日）
   * @returns 週間運勢データリスト
   */
  async getWeeklyFortunes(startDate?: string): Promise<IFortune[]> {
    try {
      // 開始日が指定されていなければ今日の日付を使用
      const start = startDate || new Date().toISOString().split('T')[0];
      
      // 終了日を計算（開始日から7日後）
      const end = new Date(start);
      end.setDate(end.getDate() + 6); // 7日間（当日を含む）
      const endDate = end.toISOString().split('T')[0];
      
      // 日付範囲の運勢を取得
      return this.getFortuneRange({
        startDate: start,
        endDate: endDate
      });
    } catch (error) {
      console.error('週間運勢取得エラー:', error);
      throw error;
    }
  }

  /**
   * 運勢を閲覧済みとしてマーク（オフラインモード対応）
   * @param fortuneId 運勢ID
   * @returns 更新された運勢データ
   */
  async markAsViewed(fortuneId: string): Promise<IFortune> {
    try {
      // オフラインモード対応のAPIリクエスト（オフライン時はキューに追加）
      return await apiRequest<IFortune>(FORTUNE.MARK_AS_VIEWED(fortuneId), {
        method: 'POST'
      });
    } catch (error) {
      console.error('運勢の閲覧状態更新エラー:', error);
      throw error;
    }
  }

  /**
   * チームメンバー間の相性を取得（オフラインモード対応）
   * @returns チーム相性データ
   */
  async getTeamCompatibility() {
    try {
      // オフラインモード対応のAPIリクエスト（キャッシュあり）
      return await apiRequest(FORTUNE.GET_TEAM_COMPATIBILITY, {
        method: 'GET',
        offlineTtl: 24 * 60 * 60 * 1000 // 24時間キャッシュ
      });
    } catch (error) {
      console.error('チーム相性取得エラー:', error);
      throw error;
    }
  }
}

export default new FortuneService();