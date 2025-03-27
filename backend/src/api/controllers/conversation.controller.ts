import { Request, Response, NextFunction } from 'express';
import { conversationService } from '../../services/conversation.service';
import { CustomError } from '../../utils/error.util';
import { logger } from '../../utils/logger.util';

/**
 * 会話コントローラー
 * AI対話システム関連のエンドポイントを処理する
 */
export const conversationController = {
  /**
   * メッセージ送信・新規会話開始
   */
  sendMessage: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id.toString();
      
      if (!userId) {
        throw new CustomError('認証されていません', 401);
      }
      
      const messageData = req.body;
      logger.debug(`${userId}からのメッセージ送信: ${JSON.stringify(messageData)}`);
      
      const result = await conversationService.sendMessage(userId, messageData);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('メッセージ送信エラー:', error);
      next(error);
    }
  },

  /**
   * ユーザーの全会話履歴を取得
   */
  getAllConversations: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id.toString();
      
      if (!userId) {
        throw new CustomError('認証されていません', 401);
      }
      
      // クエリパラメータ取得
      const { limit = 10, page = 1, archived } = req.query;
      const options = {
        limit: parseInt(limit as string, 10),
        page: parseInt(page as string, 10),
        isArchived: archived === 'true' ? true : archived === 'false' ? false : undefined
      };
      
      logger.debug(`${userId}の会話履歴取得: ${JSON.stringify(options)}`);
      
      const conversations = await conversationService.getAllConversationsByUserId(userId, options);
      
      res.status(200).json({
        success: true,
        data: conversations
      });
    } catch (error) {
      logger.error('会話履歴取得エラー:', error);
      next(error);
    }
  },

  /**
   * 特定の会話の詳細を取得
   */
  getConversationById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id.toString();
      const conversationId = req.params.id;
      
      if (!userId) {
        throw new CustomError('認証されていません', 401);
      }
      
      logger.debug(`会話取得: ${conversationId} by ${userId}`);
      
      const conversation = await conversationService.getConversationById(conversationId, userId);
      
      res.status(200).json({
        success: true,
        data: conversation
      });
    } catch (error) {
      logger.error('会話取得エラー:', error);
      next(error);
    }
  },

  /**
   * 運勢に基づく呼び水質問を生成
   */
  generatePromptQuestion: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id.toString();
      
      if (!userId) {
        throw new CustomError('認証されていません', 401);
      }
      
      const { fortuneId, category } = req.body;
      logger.debug(`呼び水質問生成: userId=${userId}, fortuneId=${fortuneId}, category=${category}`);
      
      const promptQuestion = await conversationService.generatePromptQuestion({
        userId,
        fortuneId,
        category
      });
      
      res.status(200).json({
        success: true,
        data: promptQuestion
      });
    } catch (error) {
      logger.error('呼び水質問生成エラー:', error);
      next(error);
    }
  },

  /**
   * 会話をアーカイブ
   */
  archiveConversation: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id.toString();
      const conversationId = req.params.id;
      
      if (!userId) {
        throw new CustomError('認証されていません', 401);
      }
      
      logger.debug(`会話アーカイブ: ${conversationId} by ${userId}`);
      
      const updatedConversation = await conversationService.archiveConversation(conversationId, userId);
      
      res.status(200).json({
        success: true,
        message: '会話が正常にアーカイブされました',
        data: updatedConversation
      });
    } catch (error) {
      logger.error('会話アーカイブエラー:', error);
      next(error);
    }
  },

  /**
   * 会話内のメッセージをお気に入り登録
   */
  toggleFavoriteMessage: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id.toString();
      const conversationId = req.params.id;
      const { messageId } = req.body;
      
      if (!userId) {
        throw new CustomError('認証されていません', 401);
      }
      
      logger.debug(`メッセージのお気に入りトグル: conversationId=${conversationId}, messageId=${messageId}`);
      
      const result = await conversationService.toggleFavoriteMessage(conversationId, messageId, userId);
      
      res.status(200).json({
        success: true,
        message: result.isFavorite ? 'メッセージをお気に入りに追加しました' : 'メッセージのお気に入りを解除しました',
        data: result
      });
    } catch (error) {
      logger.error('お気に入り登録エラー:', error);
      next(error);
    }
  }
};