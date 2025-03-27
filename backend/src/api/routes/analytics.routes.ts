import { Router } from 'express';
import AnalyticsController from '../controllers/analytics.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';

const router = Router();

/**
 * 分析データAPI用ルーティング設定
 * 経営者ダッシュボード用のデータを取得するエンドポイントを定義
 * すべてのルートは認証が必要で、ほとんどのルートはmanagerまたはadmin権限が必要
 */

// ユーザーエンゲージメントの取得 (管理者/経営者のみ)
router.get(
  '/users/:userId/engagement',
  authMiddleware.authenticate,
  roleMiddleware.checkRole(['manager', 'admin']),
  AnalyticsController.getUserEngagement
);

// チーム全体の分析データ取得 (管理者/経営者のみ)
router.get(
  '/team',
  authMiddleware.authenticate,
  roleMiddleware.checkRole(['manager', 'admin']),
  AnalyticsController.getTeamAnalytics
);

// フォローアップ推奨リスト取得 (管理者/経営者のみ)
router.get(
  '/follow-up-recommendations',
  authMiddleware.authenticate,
  roleMiddleware.checkRole(['manager', 'admin']),
  AnalyticsController.getFollowUpRecommendations
);

// 感情分析トレンド取得 (管理者/経営者のみ)
router.get(
  '/sentiment-trend',
  authMiddleware.authenticate,
  roleMiddleware.checkRole(['manager', 'admin']),
  AnalyticsController.getSentimentTrend
);

// 目標達成率取得 (管理者/経営者のみ)
router.get(
  '/goal-completion-rate',
  authMiddleware.authenticate,
  roleMiddleware.checkRole(['manager', 'admin']),
  AnalyticsController.getGoalCompletionRate
);

export default router;