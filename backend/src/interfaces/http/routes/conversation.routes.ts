import { Router } from 'express';
import { container } from 'tsyringe';

// 遅延ロードを実装して依存性解決の問題を回避
const conversationRouter = Router();

/**
 * 会話ルート定義
 */
export const registerConversationRoutes = (router: Router): void => {
  const baseUrl = '/api/v1/conversation';
  
  /**
   * @route POST /api/v1/conversation/message
   * @desc メッセージ送信・新規会話開始
   * @access Private
   */
  // 依存性を遅延解決
  try {
    const authMiddleware = container.resolve<any>('AuthMiddleware');
    const conversationController = container.resolve<any>('ConversationController');
    
    conversationRouter.post(
      '/message',
      authMiddleware.handle.bind(authMiddleware),
      (req, res, next) => conversationController.sendMessage(req, res, next)
    );
  } catch (error) {
    console.error('会話ルートの設定エラー:', error);
    // フォールバックルート - エラーメッセージを返す
    conversationRouter.post('/message', (req, res) => {
      res.status(500).json({ 
        error: '会話サービスが利用できません',
        code: 'SERVICE_UNAVAILABLE' 
      });
    });
  }
  
  /**
   * @route GET /api/v1/conversation
   * @desc ユーザーの全会話履歴を取得
   * @access Private
   */
  // 依存性を避遣解決
  try {
    const authMiddleware = container.resolve<any>('AuthMiddleware');
    const conversationController = container.resolve<any>('ConversationController');
    
    conversationRouter.get(
      '/',
      authMiddleware.handle.bind(authMiddleware),
      (req, res, next) => conversationController.getAllConversations(req, res, next)
    );
  } catch (error) {
    console.error('会話履歴取得ルートの設定エラー:', error);
    // フォールバックルート
    conversationRouter.get('/', (req, res) => {
      res.status(500).json({ 
        error: '会話履歴サービスが利用できません',
        code: 'SERVICE_UNAVAILABLE' 
      });
    });
  }
  
  /**
   * @route GET /api/v1/conversation/:id
   * @desc 特定の会話の詳細を取得
   * @access Private
   */
  // 依存性を避遣解決
  try {
    const authMiddleware = container.resolve<any>('AuthMiddleware');
    const conversationController = container.resolve<any>('ConversationController');
    
    conversationRouter.get(
      '/:id',
      authMiddleware.handle.bind(authMiddleware),
      (req, res, next) => conversationController.getConversationById(req, res, next)
    );
  } catch (error) {
    console.error('会話詳細取得ルートの設定エラー:', error);
    // フォールバックルート
    conversationRouter.get('/:id', (req, res) => {
      res.status(500).json({ 
        error: '会話詳細サービスが利用できません',
        code: 'SERVICE_UNAVAILABLE' 
      });
    });
  }
  
  /**
   * @route POST /api/v1/conversation/generate-prompt
   * @desc 運勢に基づく呼び水質問を生成
   * @access Private
   */
  // 依存性を避遣解決
  try {
    const authMiddleware = container.resolve<any>('AuthMiddleware');
    const conversationController = container.resolve<any>('ConversationController');
    
    conversationRouter.post(
      '/generate-prompt',
      authMiddleware.handle.bind(authMiddleware),
      (req, res, next) => conversationController.generatePromptQuestion(req, res, next)
    );
  } catch (error) {
    console.error('プロンプト生成ルートの設定エラー:', error);
    // フォールバックルート
    conversationRouter.post('/generate-prompt', (req, res) => {
      res.status(500).json({ 
        error: 'プロンプト生成サービスが利用できません',
        code: 'SERVICE_UNAVAILABLE' 
      });
    });
  }
  
  /**
   * @route PUT /api/v1/conversation/:id/archive
   * @desc 会話をアーカイブ
   * @access Private
   */
  // 依存性を避遣解決
  try {
    const authMiddleware = container.resolve<any>('AuthMiddleware');
    const conversationController = container.resolve<any>('ConversationController');
    
    conversationRouter.put(
      '/:id/archive',
      authMiddleware.handle.bind(authMiddleware),
      (req, res, next) => conversationController.archiveConversation(req, res, next)
    );
  } catch (error) {
    console.error('アーカイブルートの設定エラー:', error);
    // フォールバックルート
    conversationRouter.put('/:id/archive', (req, res) => {
      res.status(500).json({ 
        error: 'アーカイブサービスが利用できません',
        code: 'SERVICE_UNAVAILABLE' 
      });
    });
  }
  
  /**
   * @route PUT /api/v1/conversation/:id/favorite
   * @desc 会話内のメッセージをお気に入り登録
   * @access Private
   */
  // 依存性を避遣解決
  try {
    const authMiddleware = container.resolve<any>('AuthMiddleware');
    const conversationController = container.resolve<any>('ConversationController');
    
    conversationRouter.put(
      '/:id/favorite',
      authMiddleware.handle.bind(authMiddleware),
      (req, res, next) => conversationController.toggleFavoriteMessage(req, res, next)
    );
  } catch (error) {
    console.error('お気に入り登録ルートの設定エラー:', error);
    // フォールバックルート
    conversationRouter.put('/:id/favorite', (req, res) => {
      res.status(500).json({ 
        error: 'お気に入り登録サービスが利用できません',
        code: 'SERVICE_UNAVAILABLE' 
      });
    });
  }
  
  /**
   * @route POST /api/v1/conversation/team-member-chat
   * @desc 新規チームメンバー相性チャットを開始
   * @access Private
   */
  // 依存性を避遣解決
  try {
    const authMiddleware = container.resolve<any>('AuthMiddleware');
    const conversationController = container.resolve<any>('ConversationController');
    
    conversationRouter.post(
      '/team-member-chat',
      authMiddleware.handle.bind(authMiddleware),
      (req, res, next) => conversationController.startTeamMemberChat(req, res, next)
    );
  } catch (error) {
    console.error('チームメンバーチャットルートの設定エラー:', error);
    // フォールバックルート
    conversationRouter.post('/team-member-chat', (req, res) => {
      res.status(500).json({ 
        error: 'チームメンバーチャットサービスが利用できません',
        code: 'SERVICE_UNAVAILABLE' 
      });
    });
  }
  
  /**
   * @route POST /api/v1/conversation/fortune-chat
   * @desc 新規デイリーフォーチュンチャットを開始
   * @access Private
   */
  // 依存性を避遣解決
  try {
    const authMiddleware = container.resolve<any>('AuthMiddleware');
    const conversationController = container.resolve<any>('ConversationController');
    
    conversationRouter.post(
      '/fortune-chat',
      authMiddleware.handle.bind(authMiddleware),
      (req, res, next) => conversationController.startFortuneChat(req, res, next)
    );
  } catch (error) {
    console.error('フォーチュンチャットルートの設定エラー:', error);
    // フォールバックルート
    conversationRouter.post('/fortune-chat', (req, res) => {
      res.status(500).json({ 
        error: 'フォーチュンチャットサービスが利用できません',
        code: 'SERVICE_UNAVAILABLE' 
      });
    });
  }
  
  // メインルーターに会話ルートを登録
  router.use(baseUrl, conversationRouter);
};