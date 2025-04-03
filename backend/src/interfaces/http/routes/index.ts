import { Router } from 'express';
import { container } from 'tsyringe';
import { registerAuthRoutes } from './auth.routes';
import { registerUserRoutes } from './user.routes';
import { registerFortuneRoutes } from './fortune.routes';
import { registerConversationRoutes } from './conversation.routes';
import { registerSubscriptionRoutes } from './subscription.routes';
import { registerTeamRoutes } from './team.routes';
import { registerSimpleConversationRoutes } from './simple-conversation.routes';

/**
 * APIルート登録
 * すべてのAPIルートを登録する
 * @param router Expressルーター
 */
export const registerRoutes = (router: Router): void => {
  // APIエンドポイントのベースパス
  const apiBasePath = '/api/v1';
  
  console.log('============ ルート登録を開始 ============');
  
  // 各ドメインのルートを登録
  console.log('認証ルート登録中...');
  registerAuthRoutes(router);
  
  console.log('ユーザールート登録中...');
  registerUserRoutes(router);
  
  console.log('運勢ルート登録中...');
  registerFortuneRoutes(router);
  
  console.log('会話ルート登録中...');
  registerConversationRoutes(router);
  
  console.log('サブスクリプションルート登録中...');
  registerSubscriptionRoutes(router);
  
  console.log('チームルート登録中...');
  registerTeamRoutes(router);
  
  // 直接会話ルートを登録（新：クリーンアーキテクチャに従った実装）
  console.log('直接会話/シンプルチャットルート登録中...');
  registerSimpleConversationRoutes(router);
  
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

