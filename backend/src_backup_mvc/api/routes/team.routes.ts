/**
 * チームルーター
 * チーム関連のAPIルートを定義
 * 
 * 変更履歴:
 * - 2025/03/26: 初期実装 (AppGenius)
 */

import express from 'express';
import { TeamController } from '../controllers/team.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';

const router = express.Router();

/**
 * @route GET /api/v1/team/contributions
 * @description チーム貢献の一覧を取得
 * @access Private
 */
router.get(
  '/contributions',
  authMiddleware.authenticate,
  TeamController.getTeamContributions
);

/**
 * @route POST /api/v1/team/contributions
 * @description 新しいチーム貢献を追加
 * @access Private
 */
router.post(
  '/contributions',
  authMiddleware.authenticate,
  TeamController.addContribution
);

/**
 * @route GET /api/v1/team/contributions/:id
 * @description 特定のチーム貢献を取得
 * @access Private
 */
router.get(
  '/contributions/:id',
  authMiddleware.authenticate,
  TeamController.getContributionById
);

/**
 * @route GET /api/v1/team/contributions/user/:userId
 * @description ユーザーのチーム貢献一覧を取得
 * @access Private
 */
router.get(
  '/contributions/user/:userId',
  authMiddleware.authenticate,
  TeamController.getUserContributions
);

/**
 * @route PUT /api/v1/team/contributions/:id
 * @description チーム貢献を更新
 * @access Private
 */
router.put(
  '/contributions/:id',
  authMiddleware.authenticate,
  TeamController.updateContribution
);

/**
 * @route DELETE /api/v1/team/contributions/:id
 * @description チーム貢献を削除
 * @access Private
 */
router.delete(
  '/contributions/:id',
  authMiddleware.authenticate,
  TeamController.deleteContribution
);

/**
 * @route GET /api/v1/team/mentorships
 * @description メンターシップの一覧を取得
 * @access Private
 */
router.get(
  '/mentorships',
  authMiddleware.authenticate,
  TeamController.getMentorships
);

/**
 * @route POST /api/v1/team/mentorships
 * @description 新しいメンターシップを作成
 * @access Private
 */
router.post(
  '/mentorships',
  authMiddleware.authenticate,
  TeamController.createMentorship
);

/**
 * @route GET /api/v1/team/mentorships/:id
 * @description 特定のメンターシップを取得
 * @access Private
 */
router.get(
  '/mentorships/:id',
  authMiddleware.authenticate,
  TeamController.getMentorshipById
);

/**
 * @route GET /api/v1/team/mentorships/user/:userId
 * @description ユーザーのメンターシップ一覧を取得
 * @access Private
 */
router.get(
  '/mentorships/user/:userId',
  authMiddleware.authenticate,
  TeamController.getUserMentorships
);

/**
 * @route PUT /api/v1/team/mentorships/:id
 * @description メンターシップを更新
 * @access Private
 */
router.put(
  '/mentorships/:id',
  authMiddleware.authenticate,
  TeamController.updateMentorship
);

/**
 * @route POST /api/v1/team/mentorships/:id/sessions
 * @description メンターシップにセッションを追加
 * @access Private
 */
router.post(
  '/mentorships/:id/sessions',
  authMiddleware.authenticate,
  TeamController.addMentorshipSession
);

/**
 * @route GET /api/v1/team/compatibility
 * @description チーム内の陰陽五行相性を取得
 * @access Private
 */
router.get(
  '/compatibility',
  authMiddleware.authenticate,
  TeamController.getTeamCompatibility
);

export default router;