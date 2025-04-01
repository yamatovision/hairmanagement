/**
 * 運勢ルーター
 * 陰陽五行運勢に関するAPIルートを定義
 * 
 * 変更履歴:
 * - 2025/03/26: 初期実装 (AppGenius)
 */

import express from 'express';
import { FortuneController } from '../controllers/fortune.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';

const router = express.Router();

/**
 * @route GET /api/v1/fortune/daily
 * @description 現在のユーザーの当日の運勢を取得
 * @access Private
 */
router.get(
  '/daily',
  authMiddleware.authenticate,
  FortuneController.getDailyFortune
);

/**
 * @route GET /api/v1/fortune/range
 * @description 日付範囲内の運勢を取得
 * @access Private
 */
router.get(
  '/range',
  authMiddleware.authenticate,
  FortuneController.getFortuneRange
);

/**
 * @route GET /api/v1/fortune/date/:date
 * @description 指定日の運勢を取得
 * @access Private
 */
router.get(
  '/date/:date',
  authMiddleware.authenticate,
  FortuneController.getFortuneByDate
);

/**
 * @route GET /api/v1/fortune/users/:userId/daily
 * @description 特定ユーザーの当日の運勢を取得
 * @access Admin
 */
router.get(
  '/users/:userId/daily',
  authMiddleware.authenticate,
  roleMiddleware.checkRole(['admin', 'manager']), // 管理者と店長のみアクセス可能
  FortuneController.getUserDailyFortune
);

/**
 * @route GET /api/v1/fortune/users/:userId/date/:date
 * @description 特定ユーザーの指定日の運勢を取得
 * @access Admin
 */
router.get(
  '/users/:userId/date/:date',
  authMiddleware.authenticate,
  roleMiddleware.checkRole(['admin', 'manager']), // 管理者と店長のみアクセス可能
  FortuneController.getUserFortuneByDate
);

/**
 * @route POST /api/v1/fortune/:fortuneId/viewed
 * @description 運勢を閲覧済みとしてマーク
 * @access Private
 */
router.post(
  '/:fortuneId/viewed',
  authMiddleware.authenticate,
  FortuneController.markFortuneAsViewed
);

/**
 * @route GET /api/v1/fortune/team-compatibility
 * @description チーム内の陰陽五行相性を取得
 * @access Private
 */
router.get(
  '/team-compatibility',
  authMiddleware.authenticate,
  FortuneController.getTeamCompatibility
);

/**
 * @route GET /api/v1/fortune/weekly
 * @description 週間運勢予報を取得
 * @access Private
 */
router.get(
  '/weekly',
  authMiddleware.authenticate,
  FortuneController.getWeeklyForecast
);

/**
 * @route GET /api/v1/fortune/today-element
 * @description 今日の五行属性と陰陽を取得
 * @access Public
 */
router.get(
  '/today-element',
  FortuneController.getTodayElement
);

export default router;