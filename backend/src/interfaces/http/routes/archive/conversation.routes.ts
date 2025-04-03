import { Router } from 'express';
import { container } from 'tsyringe';

// 遅延ロードを実装して依存性解決の問題を回避
const conversationRouter = Router();

/**
 * 会話ルート定義 - シンプルなAPI設計
 * 
 * デバッグ用直接ルートの追加:
 * - POST /api/v1/direct-conversations: 直接会話を開始するシンプルエンドポイント
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
    
    /**
     * @route POST /api/v1/conversations
     * @desc 会話を開始または継続する
     * @access Private
     */
    conversationRouter.post(
      '/',
      authMiddleware.handle.bind(authMiddleware),
      (req, res, next) => conversationController.startOrContinueConversation(req, res, next)
    );
    console.log('会話ルート: POST / が登録されました');
    
    /**
     * @route POST /api/v1/conversations/:id/messages
     * @desc 会話にメッセージを送信する
     * @access Private
     */
    conversationRouter.post(
      '/:id/messages',
      authMiddleware.handle.bind(authMiddleware),
      (req, res, next) => conversationController.sendMessage(req, res, next)
    );
    console.log('会話ルート: POST /:id/messages が登録されました');
    
    /**
     * @route GET /api/v1/conversations/:id
     * @desc 会話の詳細を取得する
     * @access Private
     */
    conversationRouter.get(
      '/:id',
      authMiddleware.handle.bind(authMiddleware),
      (req, res, next) => conversationController.getConversationById(req, res, next)
    );
    console.log('会話ルート: GET /:id が登録されました');
    
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
  
  // シンプルなデバッグ用ルートを追加（直接AIレスポンスを返す）
  router.post('/direct-conversations', async (req, res) => {
    try {
      const userId = req.user?.id || 'unknown-user';
      const { type, contextId, message } = req.body;
      
      console.log('直接会話ルート呼び出し:', { userId, type, contextId, message });
      
      // AIサービスを取得
      const aiService = container.resolve('IAIService');
      
      // AIサービスを使用して応答を生成
      const aiResponse = await aiService.sendMessage(message || '何かお手伝いできることはありますか？', {
        model: process.env.CLAUDE_MODEL || 'claude-3-7-sonnet-20250219', 
        maxTokens: 1000
      });
      
      // レスポンスを構築
      const conversation = {
        id: `conv_${Date.now()}`,
        type: type || 'general',
        messages: [
          {
            id: `msg_user_${Date.now()}`,
            sender: 'user',
            content: message || '初めまして',
            timestamp: new Date().toISOString()
          },
          {
            id: `msg_ai_${Date.now() + 1}`,
            sender: 'assistant',
            content: typeof aiResponse === 'string' ? aiResponse : 
                    (aiResponse.content ? aiResponse.content : 'レスポンスを取得できませんでした'),
            timestamp: new Date().toISOString()
          }
        ],
        createdAt: new Date().toISOString()
      };
      
      res.status(200).json({
        success: true,
        data: conversation
      });
    } catch (error) {
      console.error('直接会話エラー:', error);
      res.status(500).json({
        success: false,
        message: '会話生成中にエラーが発生しました',
        error: error instanceof Error ? error.message : '不明なエラー'
      });
    }
  });
  console.log('直接会話ルート POST /api/v1/direct-conversations が登録されました');
  
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