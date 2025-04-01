import { Router } from 'express';
import { container } from 'tsyringe';
import { AuthController } from '../controllers/auth.controller';

/**
 * 認証関連のルーティング
 * @param router Expressルーター
 */
export const registerAuthRoutes = (router: Router): void => {
  const authController = container.resolve(AuthController);
  
  // ログイン
  router.post('/auth/login', (req, res) => 
    authController.login(req, res)
  );
  
  // ユーザー登録
  router.post('/auth/register', (req, res) => 
    authController.register(req, res)
  );
  
  // トークン更新
  router.post('/auth/refresh-token', (req, res) => 
    authController.refreshToken(req, res)
  );
  
  // ログアウト
  router.post('/auth/logout', (req, res) => 
    authController.logout(req, res)
  );
};