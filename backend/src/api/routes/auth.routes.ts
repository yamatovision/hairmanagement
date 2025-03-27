import express from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validation.middleware';

const router = express.Router();

/**
 * @route POST /api/v1/auth/register
 * @desc ユーザー登録（管理者のみ可能）
 * @access Private/Admin
 */
router.post(
  '/register', 
  authMiddleware.authenticate,
  roleMiddleware.checkRole('admin'),
  validateRequest.register, 
  authController.register
);

/**
 * @route POST /api/v1/auth/login
 * @desc ユーザーログイン
 * @access Public
 */
router.post(
  '/login', 
  validateRequest.login, 
  authController.login
);

/**
 * @route POST /api/v1/auth/refresh-token
 * @desc アクセストークンのリフレッシュ
 * @access Public
 */
router.post(
  '/refresh-token', 
  authController.refreshToken
);

/**
 * @route POST /api/v1/auth/logout
 * @desc ユーザーログアウト（トークン無効化）
 * @access Private
 */
router.post(
  '/logout', 
  authMiddleware.authenticate, 
  authController.logout
);

/**
 * @route POST /api/v1/auth/forgot-password
 * @desc パスワードリセットメール送信
 * @access Public
 */
router.post(
  '/forgot-password', 
  validateRequest.email, 
  authController.forgotPassword
);

/**
 * @route POST /api/v1/auth/reset-password
 * @desc パスワードリセット
 * @access Public
 */
router.post(
  '/reset-password', 
  validateRequest.resetPassword, 
  authController.resetPassword
);

/**
 * @route GET /api/v1/auth/verify-email/:token
 * @desc メール検証
 * @access Public
 */
router.get(
  '/verify-email/:token', 
  authController.verifyEmail
);

/**
 * @route GET /api/v1/auth/me
 * @desc 現在のユーザー情報取得
 * @access Private
 */
router.get(
  '/me', 
  authMiddleware.authenticate, 
  authController.getCurrentUser
);

/**
 * @route PUT /api/v1/auth/me/password
 * @desc パスワード変更
 * @access Private
 */
router.put(
  '/me/password', 
  authMiddleware.authenticate, 
  validateRequest.changePassword, 
  authController.changePassword
);

export default router;