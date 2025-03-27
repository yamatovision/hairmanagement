/**
 * テスト用のモックAPIエンドポイントを追加するスクリプト
 * 認証なしでアクセス可能な分析データエンドポイントを提供します
 * 
 * 使用方法:
 * node scripts/create-test-endpoints.js
 */

const fs = require('fs');
const path = require('path');

// テスト用ルートファイルのパス
const testRouteFilePath = path.join(__dirname, '../backend/src/api/routes/test-analytics.routes.ts');

// テスト用コントローラーファイルのパス
const testControllerFilePath = path.join(__dirname, '../backend/src/api/controllers/test-analytics.controller.ts');

// テスト用ルートの内容
const testRouteContent = `import { Router } from 'express';
import TestAnalyticsController from '../controllers/test-analytics.controller';

const router = Router();

/**
 * テスト用分析データAPI
 * 認証なしでアクセス可能なエンドポイントを提供します
 * 注意: 本番環境では無効化してください
 */

// ユーザーエンゲージメントの取得 (認証なし)
router.get(
  '/users/:userId/engagement',
  TestAnalyticsController.getUserEngagement
);

// チーム全体の分析データ取得 (認証なし)
router.get(
  '/team',
  TestAnalyticsController.getTeamAnalytics
);

// フォローアップ推奨リスト取得 (認証なし)
router.get(
  '/follow-up-recommendations',
  TestAnalyticsController.getFollowUpRecommendations
);

// 感情分析トレンド取得 (認証なし)
router.get(
  '/sentiment-trend',
  TestAnalyticsController.getSentimentTrend
);

// 目標達成率取得 (認証なし)
router.get(
  '/goal-completion-rate',
  TestAnalyticsController.getGoalCompletionRate
);

export default router;
`;

// テスト用コントローラーの内容
const testControllerContent = `import { Request, Response } from 'express';
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
`;

// ファイルを作成する関数
function createFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content);
    console.log(`ファイルを作成しました: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`ファイル作成中にエラーが発生しました: ${filePath}`, error);
    return false;
  }
}

// メイン処理
async function main() {
  console.log('テスト用エンドポイント作成を開始します...');
  
  // テスト用コントローラーを作成
  const controllerCreated = createFile(testControllerFilePath, testControllerContent);
  
  // テスト用ルートを作成
  const routeCreated = createFile(testRouteFilePath, testRouteContent);
  
  if (controllerCreated && routeCreated) {
    console.log('テスト用エンドポイントの作成が完了しました。');
    console.log('');
    console.log('次に行うこと:');
    console.log('1. バックエンドサーバーを再起動する');
    console.log('2. テストスクリプトを更新して、テスト用エンドポイントを使用するようにする (/api/v1/test/* に変更)');
    console.log('3. テストスクリプトを再実行する');
  } else {
    console.log('エラーが発生したため、テスト用エンドポイントの作成に失敗しました。');
  }
}

// スクリプト実行
main().catch(error => {
  console.error('予期しないエラーが発生しました:', error);
});