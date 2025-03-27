import { Request, Response } from 'express';
import analyticsService from '../../services/analytics.service';

/**
 * テスト用分析データコントローラー
 * 認証なしでアクセス可能なエンドポイント用
 */
class TestAnalyticsController {
  /**
   * 特定ユーザーのエンゲージメント分析を取得
   */
  async getUserEngagement(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const { startDate, endDate } = req.query;
      
      // クエリパラメータの日付を処理
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      
      const analytics = await analyticsService.getUserEngagement(userId, start, end);
      
      res.status(200).json(analytics);
    } catch (error: any) {
      console.error('テスト: ユーザーエンゲージメント取得エラー:', error);
      res.status(500).json({ message: error.message || 'ユーザーエンゲージメントの取得中にエラーが発生しました' });
    }
  }

  /**
   * チーム全体の分析データを取得
   */
  async getTeamAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;
      
      // クエリパラメータの日付を処理
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      
      const teamAnalytics = await analyticsService.getTeamAnalytics(start, end);
      
      res.status(200).json(teamAnalytics);
    } catch (error: any) {
      console.error('テスト: チーム分析取得エラー:', error);
      res.status(500).json({ message: error.message || 'チーム分析の取得中にエラーが発生しました' });
    }
  }

  /**
   * フォローアップが必要なスタッフの推奨リストを取得
   */
  async getFollowUpRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const recommendations = await analyticsService.getFollowUpRecommendations();
      
      res.status(200).json(recommendations);
    } catch (error: any) {
      console.error('テスト: フォローアップ推奨取得エラー:', error);
      res.status(500).json({ message: error.message || 'フォローアップ推奨の取得中にエラーが発生しました' });
    }
  }

  /**
   * 感情分析のトレンドデータを取得
   */
  async getSentimentTrend(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate, userId } = req.query;
      
      const query = {
        startDate: startDate as string,
        endDate: endDate as string,
        userId: userId as string,
      };
      
      const trendData = await analyticsService.getSentimentTrend(query);
      
      res.status(200).json(trendData);
    } catch (error: any) {
      console.error('テスト: 感情分析トレンド取得エラー:', error);
      res.status(500).json({ message: error.message || '感情分析トレンドの取得中にエラーが発生しました' });
    }
  }

  /**
   * 目標達成率データを取得
   */
  async getGoalCompletionRate(req: Request, res: Response): Promise<void> {
    try {
      const goalData = await analyticsService.getGoalCompletionRate();
      
      res.status(200).json(goalData);
    } catch (error: any) {
      console.error('テスト: 目標達成率取得エラー:', error);
      res.status(500).json({ message: error.message || '目標達成率の取得中にエラーが発生しました' });
    }
  }
}

export default new TestAnalyticsController();
