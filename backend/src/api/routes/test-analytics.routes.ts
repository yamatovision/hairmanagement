import { Router } from 'express';
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
