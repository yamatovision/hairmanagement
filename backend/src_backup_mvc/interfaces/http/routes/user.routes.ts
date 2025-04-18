import { Router } from 'express';
import { container } from 'tsyringe';
import { UserController } from '../controllers/user.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';

/**
 * ユーザー関連のルーティング
 * @param router Expressルーター
 */
export const registerUserRoutes = (router: Router): void => {
  const userController = container.resolve(UserController);
  const authMiddleware = container.resolve(AuthMiddleware);
  
  // ミドルウェアを取得
  const auth = authMiddleware.handle();
  
  // 現在のユーザープロフィール取得
  router.get('/users/me', auth, (req, res) => 
    userController.getCurrentUserProfile(req, res)
  );
  
  // ユーザープロフィール更新
  router.put('/users/me', auth, (req, res) => 
    userController.updateUserProfile(req, res)
  );
  
  // ユーザーパスワード更新
  router.put('/users/me/password', auth, (req, res) => 
    userController.updateUserPassword(req, res)
  );
  
  // 特定ユーザーのプロフィール取得
  router.get('/users/:userId', auth, (req, res) => 
    userController.getUserProfile(req, res)
  );
};