import { Router } from 'express';
import { conversationController } from '../controllers/conversation.controller';
import { container } from 'tsyringe';
import { AuthMiddleware } from '../middlewares/auth.middleware';

const conversationRouter = Router();
const authMiddleware = container.resolve(AuthMiddleware);

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
  conversationRouter.post(
    '/message',
    authMiddleware.handle(),
    conversationController.sendMessage
  );
  
  /**
   * @route GET /api/v1/conversation
   * @desc ユーザーの全会話履歴を取得
   * @access Private
   */
  conversationRouter.get(
    '/',
    authMiddleware.handle(),
    conversationController.getAllConversations
  );
  
  /**
   * @route GET /api/v1/conversation/:id
   * @desc 特定の会話の詳細を取得
   * @access Private
   */
  conversationRouter.get(
    '/:id',
    authMiddleware.handle(),
    conversationController.getConversationById
  );
  
  /**
   * @route POST /api/v1/conversation/generate-prompt
   * @desc 運勢に基づく呼び水質問を生成
   * @access Private
   */
  conversationRouter.post(
    '/generate-prompt',
    authMiddleware.handle(),
    conversationController.generatePromptQuestion
  );
  
  /**
   * @route PUT /api/v1/conversation/:id/archive
   * @desc 会話をアーカイブ
   * @access Private
   */
  conversationRouter.put(
    '/:id/archive',
    authMiddleware.handle(),
    conversationController.archiveConversation
  );
  
  /**
   * @route PUT /api/v1/conversation/:id/favorite
   * @desc 会話内のメッセージをお気に入り登録
   * @access Private
   */
  conversationRouter.put(
    '/:id/favorite',
    authMiddleware.handle(),
    conversationController.toggleFavoriteMessage
  );
  
  // メインルーターに会話ルートを登録
  router.use(baseUrl, conversationRouter);
};