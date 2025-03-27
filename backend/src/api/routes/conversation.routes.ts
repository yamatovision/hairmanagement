import express from 'express';
import { conversationController } from '../controllers/conversation.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';

const router = express.Router();

/**
 * @route POST /api/v1/conversation/message
 * @desc メッセージ送信・新規会話開始
 * @access Private
 */
router.post(
  '/message',
  authMiddleware.authenticate,
  validateRequest.sendMessage,
  conversationController.sendMessage
);

/**
 * @route GET /api/v1/conversation
 * @desc ユーザーの全会話履歴を取得
 * @access Private
 */
router.get(
  '/',
  authMiddleware.authenticate,
  conversationController.getAllConversations
);

/**
 * @route GET /api/v1/conversation/:id
 * @desc 特定の会話の詳細を取得
 * @access Private
 */
router.get(
  '/:id',
  authMiddleware.authenticate,
  conversationController.getConversationById
);

/**
 * @route POST /api/v1/conversation/generate-prompt
 * @desc 運勢に基づく呼び水質問を生成
 * @access Private
 */
router.post(
  '/generate-prompt',
  authMiddleware.authenticate,
  validateRequest.generatePrompt,
  conversationController.generatePromptQuestion
);

/**
 * @route PUT /api/v1/conversation/:id/archive
 * @desc 会話をアーカイブ
 * @access Private
 */
router.put(
  '/:id/archive',
  authMiddleware.authenticate,
  conversationController.archiveConversation
);

/**
 * @route PUT /api/v1/conversation/:id/favorite
 * @desc 会話内のメッセージをお気に入り登録
 * @access Private
 */
router.put(
  '/:id/favorite',
  authMiddleware.authenticate,
  validateRequest.favoriteMessage,
  conversationController.toggleFavoriteMessage
);

export default router;