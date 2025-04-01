import { Router } from 'express';
import { registerAuthRoutes } from './auth.routes';
import { registerUserRoutes } from './user.routes';
import { registerFortuneRoutes } from './fortune.routes';
import { registerConversationRoutes } from './conversation.routes';
import { registerSubscriptionRoutes } from './subscription.routes';

/**
 * APIルート登録
 * すべてのAPIルートを登録する
 * @param router Expressルーター
 */
export const registerRoutes = (router: Router): void => {
  // APIエンドポイントのベースパス
  const apiBasePath = '/api/v1';
  
  // 各ドメインのルートを登録
  registerAuthRoutes(router);
  registerUserRoutes(router);
  registerFortuneRoutes(router);
  registerConversationRoutes(router);
  registerSubscriptionRoutes(router);
  
  // ヘルスチェックエンドポイント
  router.get('/health', (_, res) => {
    res.status(200).json({
      status: 'ok',
      time: new Date().toISOString()
    });
  });
  
  // APIドキュメントエンドポイント（将来的に実装予定）
  router.get('/api-docs', (_, res) => {
    res.status(200).json({
      message: 'API Documentation will be available here'
    });
  });
};

