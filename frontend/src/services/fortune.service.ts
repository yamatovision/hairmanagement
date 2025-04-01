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
  birthDate?: string;
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
      // クエリパラメータのチェック
      if (!query.startDate || !query.endDate) {
        console.error('日付範囲のパラメータが不足しています', query);
        return []; // パラメータ不足時は空配列を返す
      }

      // birthDateが設定されていない場合、ユーザーに通知
      if (!query.birthDate) {
        console.error('生年月日(birthDate)が設定されていません。プロフィールで生年月日を登録してください。');
        // エラー情報を含むダミーオブジェクトを返す（UI側でエラー表示に使用可能）
        return [{
          id: 'error-missing-birthdate',
          date: new Date().toISOString().split('T')[0],
          error: true,
          message: '生年月日が設定されていません。プロフィール設定画面で生年月日を登録してください。'
        }] as any;
      }

      // APIエンドポイントとサーバーが正しく設定されているか確認
      const apiUrl = process.env.REACT_APP_API_URL || '';
      if (!apiUrl) {
        console.error('API URLが設定されていません。環境変数REACT_APP_API_URLを確認してください。');
        return []; // API URL未設定時は空配列を返す
      }

      // オフラインモード対応のAPIリクエスト（キャッシュあり）
      try {
        const result = await apiRequest<IFortune[]>(FORTUNE.GET_RANGE, {
          method: 'GET',
          params: query,
          offlineTtl: 7 * 24 * 60 * 60 * 1000 // 7日間キャッシュ
        });
        
        // 結果が配列でない場合のフォールバック
        if (!Array.isArray(result)) {
          console.error('運勢範囲データが配列形式ではありません:', result);
          return [];
        }
        
        return result;
      } catch (apiError) {
        console.error('運勢範囲データAPI呼び出しエラー:', apiError);
        // エラー時は仮のデータまたは空配列を返す
        return [];
      }
    } catch (error) {
      console.error('運勢範囲データ取得エラー:', error);
      // 外部エラーハンドリングのために例外をスローせず、空配列を返す
      return [];
    }
  }

  /**
   * 週間運勢を取得（デフォルトで今日から7日間）
   * @param startDate 開始日（省略時は今日）
   * @param birthDate 生年月日（YYYY-MM-DD形式、省略時はユーザープロファイルから取得）
   * @returns 週間運勢データリスト
   */
  async getWeeklyFortunes(startDate?: string, birthDate?: string): Promise<IFortune[]> {
    try {
      // 開始日が指定されていなければ今日の日付を使用
      let start: string;
      try {
        start = startDate || new Date().toISOString().split('T')[0];
      } catch (e) {
        console.error('日付取得エラー:', e);
        // フォールバック: 直接文字列化
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        start = `${year}-${month}-${day}`;
      }
      
      // 終了日を計算（開始日から7日後）
      try {
        const end = new Date(start);
        end.setDate(end.getDate() + 6); // 7日間（当日を含む）
        const endDate = end.toISOString().split('T')[0];
        
        // 日付範囲の運勢を取得（生年月日を渡す）
        return await this.getFortuneRange({
          startDate: start,
          endDate: endDate,
          birthDate: birthDate
        });
      } catch (e) {
        console.error('日付範囲計算エラー:', e);
        return []; // エラー時は空配列を返す
      }
    } catch (error) {
      console.error('週間運勢取得エラー:', error);
      // エラーをスローせず、空配列を返す
      return [];
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