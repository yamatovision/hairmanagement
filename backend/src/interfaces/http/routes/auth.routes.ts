import { Router } from 'express';
import { container } from 'tsyringe';
import { AuthController } from '../controllers/auth.controller';
import jwt from 'jsonwebtoken';

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
  
  // フロントエンドからのリクエスト形式に合わせたエイリアスエンドポイント - /api/v1 プレフィックス
  // 同じコントローラメソッドを指す別のルートパス
  router.post('/api/v1/auth/login', (req, res) => 
    authController.login(req, res)
  );
  
  router.post('/api/v1/auth/register', (req, res) => 
    authController.register(req, res)
  );
  
  router.post('/api/v1/auth/refresh-token', (req, res) => 
    authController.refreshToken(req, res)
  );
  
  router.post('/api/v1/auth/logout', (req, res) => 
    authController.logout(req, res)
  );
  
  // デバッグ用のトークン検証エンドポイント
  router.get('/auth/verify-token', (req, res) => {
    try {
      // 認証ヘッダーの確認
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: '認証トークンが必要です',
          code: 'MISSING_TOKEN'
        });
      }
      
      // トークンの抽出
      const token = authHeader.split(' ')[1];
      
      // トークンをデコード（検証なし）
      const decoded = jwt.decode(token, { complete: true });
      
      // 環境変数の情報
      const envInfo = {
        NODE_ENV: process.env.NODE_ENV || 'undefined',
        JWT_SECRET_PREFIX: process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 5) + '***' : 'undefined',
        JWT_ACCESS_EXPIRATION: process.env.JWT_ACCESS_EXPIRATION || 'デフォルト'
      };
      
      res.status(200).json({
        success: true,
        message: 'トークン情報',
        decoded: decoded,
        environment: envInfo
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'トークン検証エラー',
        error: error.message
      });
    }
  });
};