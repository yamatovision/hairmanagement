/**
 * 統合会話ルート設定
 * 
 * 会話関連のAPIエンドポイントを統合して提供します。
 * - direct-conversationsエンドポイントの実装
 * - 従来のconversationsエンドポイントへの互換性サポート
 * - ストリーミングAPIのサポート
 * 
 * 作成日: 2025/04/05
 */
import { Router } from 'express';
import { container } from 'tsyringe';
import { logger } from '../../../utils/logger.util';

// ルーター作成
const unifiedConversationRouter = Router();

/**
 * 統合会話ルート登録
 * @param router メインルーター
 */
export const registerUnifiedConversationRoutes = (router: Router): void => {
  // 会話用エンドポイントのパス
  const baseUrl = '/direct-conversations';
  
  try {
    // DIコンテナからミドルウェアとコントローラーを取得
    logger.info('統合会話ルート: コンテナからサービスを解決中...');
    const authMiddleware = container.resolve<any>('AuthMiddleware');
    const unifiedConversationController = container.resolve<any>('UnifiedConversationController');
    
    logger.info('統合会話ルート: AuthMiddleware と UnifiedConversationController が正常に解決されました');
    
    // ヘルスチェックエンドポイント
    unifiedConversationRouter.get(
      '/health',
      (req, res) => {
        res.status(200).json({
          success: true,
          message: '会話サービスが正常に動作しています',
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        });
      }
    );
    logger.debug('統合会話ルート: GET /health が登録されました');
    
    // 認証ミドルウェアの適用
    const auth = authMiddleware.handle();
    
    // 会話初期化/継続エンドポイント
    unifiedConversationRouter.post(
      '/',
      auth,
      unifiedConversationController.initializeConversation.bind(unifiedConversationController)
    );
    logger.debug('統合会話ルート: POST / が登録されました');
    
    // メッセージ送信エンドポイント
    unifiedConversationRouter.post(
      '/messages',
      auth,
      unifiedConversationController.sendMessage.bind(unifiedConversationController)
    );
    logger.debug('統合会話ルート: POST /messages が登録されました');
    
    // 会話取得エンドポイント
    unifiedConversationRouter.get(
      '/:id',
      auth,
      unifiedConversationController.getConversation.bind(unifiedConversationController)
    );
    logger.debug('統合会話ルート: GET /:id が登録されました');
    
    // 会話一覧取得エンドポイント
    unifiedConversationRouter.get(
      '/',
      auth,
      unifiedConversationController.getConversations.bind(unifiedConversationController)
    );
    logger.debug('統合会話ルート: GET / が登録されました');
    
    // 会話削除エンドポイント
    unifiedConversationRouter.delete(
      '/:id',
      auth,
      unifiedConversationController.deleteConversation.bind(unifiedConversationController)
    );
    logger.debug('統合会話ルート: DELETE /:id が登録されました');
    
    // エラーハンドリング用のミドルウェア
    unifiedConversationRouter.use((err, req, res, next) => {
      logger.error('統合会話APIエラー:', err);
      
      return res.status(err.status || 500).json({
        success: false,
        message: err.message || 'サーバーでエラーが発生しました',
        code: err.code || 'UNKNOWN_ERROR'
      });
    });
    
  } catch (error) {
    logger.error('統合会話ルートの設定エラー:', error);
    
    // フォールバックルート - すべてのリクエストに対してエラーを返す
    unifiedConversationRouter.all('*', (req, res) => {
      res.status(500).json({
        success: false,
        message: '会話サービスが利用できません',
        code: 'SERVICE_UNAVAILABLE'
      });
    });
    logger.debug('統合会話ルート: フォールバックルートが登録されました');
  }
  
  // メインルーターに会話ルートを登録
  router.use(baseUrl, unifiedConversationRouter);
  logger.info(`統合会話ルート: メインルーターに正常に登録されました (パス: ${baseUrl})`);
  
  // デバッグ用のヘルスチェックエンドポイント（直接アクセス用）
  router.get('/api/v1/direct-conversations/health', (req, res) => {
    res.status(200).json({
      success: true,
      message: '会話サービスが正常に動作しています',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  });
  logger.debug('統合会話ルート: 直接アクセス用ヘルスチェックエンドポイントが登録されました');
};

/**
 * レガシーコントローラーからの互換性サポート
 * conversationエンドポイントのリクエストをunifiedConversationに転送
 * @param router メインルーター
 */
export const registerLegacyConversationRoutes = (router: Router): void => {
  const legacyBaseUrl = '/conversations';
  
  try {
    // DIコンテナからミドルウェアとコントローラーを取得
    logger.info('レガシー会話ルート: コンテナからサービスを解決中...');
    const authMiddleware = container.resolve<any>('AuthMiddleware');
    const unifiedConversationController = container.resolve<any>('UnifiedConversationController');
    
    // レガシーコントローラーの存在を確認
    const legacyControllerExists = container.isRegistered('ConversationController');
    logger.info(`レガシーコントローラーの登録状態: ${legacyControllerExists ? '登録済み' : '未登録'}`);
    
    // 認証ミドルウェアの適用
    const auth = authMiddleware.handle();
    
    // すべてのリクエストを統合コントローラーに転送
    router.all(
      `/api/v1${legacyBaseUrl}*`,
      auth,
      (req, res, next) => {
        logger.debug(`レガシーエンドポイントへのリクエストを統合エンドポイントに転送: ${req.method} ${req.path}`);
        
        // 警告ヘッダーを追加
        res.setHeader('X-Deprecation-Warning', 'This endpoint is deprecated. Please use /api/v1/direct-conversations instead.');
        
        // 統合コントローラーで処理
        unifiedConversationController.handleLegacyRequest(req, res, next);
      }
    );
    
    logger.info(`レガシー会話ルート: 転送ルールが正常に登録されました (パス: ${legacyBaseUrl})`);
    
  } catch (error) {
    logger.error('レガシー会話ルートの設定エラー:', error);
    
    // フォールバックルート - 警告レスポンスを返す
    router.all(`/api/v1${legacyBaseUrl}*`, (req, res) => {
      res.status(410).json({
        success: false,
        message: '旧APIは廃止されました。新APIエンドポイント/api/v1/direct-conversationsをご利用ください。',
        code: 'API_DEPRECATED'
      });
    });
    
    logger.debug('レガシー会話ルート: 警告フォールバックルートが登録されました');
  }
};