import express from 'express';
import { userController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validation.middleware';

const router = express.Router();

/**
 * @route GET /api/v1/users/me
 * @desc ログイン中のユーザーのプロフィール情報を取得
 * @access Private
 */
router.get('/me', authMiddleware.authenticate, userController.getCurrentUser);

/**
 * @route PUT /api/v1/users/me
 * @desc ログイン中のユーザーのプロフィール情報を更新
 * @access Private
 */
router.put('/me', authMiddleware.authenticate, userController.updateCurrentUser);

/**
 * @route PUT /api/v1/users/me/password
 * @desc ログイン中のユーザーのパスワードを更新
 * @access Private
 */
router.put(
  '/me/password',
  authMiddleware.authenticate,
  validateRequest.changePassword,
  userController.updatePassword
);

/**
 * @route PUT /api/v1/users/me/notification-settings
 * @desc ログイン中のユーザーの通知設定を更新
 * @access Private
 */
router.put(
  '/me/notification-settings',
  authMiddleware.authenticate,
  userController.updateNotificationSettings
);

/**
 * @route GET /api/v1/users/:id
 * @desc 特定のユーザーのプロフィール情報を取得（管理者用）
 * @access Private (Admin only)
 */
router.get(
  '/:id',
  authMiddleware.authenticate,
  roleMiddleware.requireAdmin,
  userController.getUserById
);

/**
 * @route GET /api/v1/users
 * @desc 全ユーザーのリストを取得（管理者用）
 * @access Private (Admin only)
 */
router.get(
  '/',
  authMiddleware.authenticate,
  roleMiddleware.requireAdmin,
  userController.getAllUsers
);

/**
 * @route PUT /api/v1/users/:id
 * @desc 特定のユーザーのプロフィール情報を更新（管理者用）
 * @access Private (Admin only)
 */
router.put(
  '/:id',
  authMiddleware.authenticate,
  roleMiddleware.requireAdmin,
  userController.updateUserById
);

/**
 * @route DELETE /api/v1/users/:id
 * @desc 特定のユーザーを削除（管理者用）
 * @access Private (Admin only)
 */
router.delete(
  '/:id',
  authMiddleware.authenticate,
  roleMiddleware.requireAdmin,
  userController.deleteUserById
);

export const userRoutes = router;