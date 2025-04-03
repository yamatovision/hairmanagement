import { Router } from 'express';
import { container } from 'tsyringe';

// 遅延ロードを実装して依存性解決の問題を回避
const conversationRouter = Router();

/**
 * 会話ルート定義 - シンプルなAPI設計
 * - 注意: 直接会話エンドポイントはdirect-chat.tsで実装されています
 */
export const registerConversationRoutes = (router: Router): void => {
  // 会話用エンドポイントのパス
  // index.tsでapiBasePath='/api/v1'と設定され、router.useでマウントされるため、
  // ここでは '/conversations' のみを使用する
  const baseUrl = '/conversations';
  
  try {
    // DIコンテナからミドルウェアとコントローラーを取得
    console.log('会話ルート: コンテナからサービスを解決中...');
    const authMiddleware = container.resolve<any>('AuthMiddleware');
    const conversationController = container.resolve<any>('ConversationController');
    
    console.log('会話ルート: AuthMiddleware と ConversationController が正常に解決されました');
    
    // デバッグ用 - リクエスト確認ルート
    conversationRouter.get(
      '/debug',
      (req, res) => {
        res.status(200).json({
          success: true,
          message: '会話デバッグエンドポイントが正常に動作しています',
          timestamp: new Date().toISOString()
        });
      }
    );
    console.log('会話ルート: GET /debug が登録されました');
    
  } catch (error) {
    console.error('会話ルートの設定エラー:', error);
    if (error instanceof Error) {
      console.error('スタックトレース:', error.stack);
    }
    
    // フォールバックルート
    conversationRouter.all('*', (req, res) => {
      res.status(500).json({ 
        success: false,
        message: '会話サービスが利用できません',
        code: 'SERVICE_UNAVAILABLE' 
      });
    });
    console.log('会話ルート: フォールバックルートが登録されました');
  }
  
  // メインルーターに会話ルートを登録
  router.use(baseUrl, conversationRouter);
  console.log(`会話ルート: メインルーターに正常に登録されました (パス: ${baseUrl})`);
  
  // デバッグ用の直接GETルート登録
  router.get('/api/v1/conversations/direct-debug', (req, res) => {
    res.status(200).json({
      success: true,
      message: '会話デバッグ直接エンドポイントが正常に動作しています',
      timestamp: new Date().toISOString()
    });
  });
  console.log('会話ルート: 直接デバッグエンドポイントが登録されました');
};