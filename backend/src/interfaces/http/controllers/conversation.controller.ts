import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { logger } from '../../../utils/logger.util';
import { ConversationService } from '../../../application/services/conversation.service';
import { ConversationType } from '../../../domain/entities/Conversation';

/**
 * 会話コントローラー
 * AI対話システム関連のエンドポイントを処理する
 */
@injectable()
export class ConversationController {
  constructor(
    @inject('ConversationService') private conversationService: ConversationService
  ) {}

  /**
   * メッセージ送信・新規会話開始
   */
  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '認証されていません'
        });
      }
      
      const { content, conversationId, type, metadata } = req.body;
      
      logger.debug(`${userId}からのメッセージ送信: ${content}`);
      
      let result;
      
      // 新規会話か既存会話の続きか判定
      if (conversationId) {
        // 既存会話の続き
        result = await this.conversationService.sendMessage(
          conversationId,
          userId,
          content
        );
      } else {
        // 新規会話
        result = await this.conversationService.createOrContinueConversation(
          userId,
          type || ConversationType.GENERAL,
          content,
          metadata || {}
        );
      }
      
      // Get the last message (AI response)
      const lastMessage = result.messages.length > 0 
        ? result.messages[result.messages.length - 1] 
        : null;
      
      // Format the response
      const formattedResult = {
        conversation: {
          id: result.id,
          userId,
          messages: result.messages.map(msg => ({
            id: msg.id,
            sender: msg.role,
            content: msg.content,
            metadata: msg.metadata,
            timestamp: msg.createdAt.toISOString()
          })),
          isArchived: result.isArchived,
          createdAt: result.createdAt.toISOString(),
          type: result.type
        },
        lastMessage: lastMessage ? {
          id: lastMessage.id,
          sender: lastMessage.role,
          content: lastMessage.content,
          metadata: lastMessage.metadata,
          timestamp: lastMessage.createdAt.toISOString()
        } : null
      };
      
      res.status(200).json({
        success: true,
        data: formattedResult
      });
    } catch (error) {
      logger.error('メッセージ送信エラー:', error);
      next(error);
    }
  }

  /**
   * ユーザーの全会話履歴を取得
   */
  async getAllConversations(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '認証されていません'
        });
      }
      
      // クエリパラメータ取得
      const { limit = 20, archived = false } = req.query;
      
      logger.debug(`${userId}の会話履歴取得: limit=${limit}, archived=${archived}`);
      
      // 会話履歴の取得
      const conversationList = await this.conversationService.getConversations(
        userId,
        parseInt(limit as string, 10),
        archived === 'true'
      );
      
      // レスポンスフォーマット
      const formattedConversations = conversationList.map(conv => ({
        id: conv.id,
        userId,
        type: conv.type,
        messages: conv.messages.map(msg => ({
          id: msg.id,
          sender: msg.role,
          content: msg.content,
          metadata: msg.metadata,
          timestamp: msg.createdAt.toISOString()
        })),
        isArchived: conv.isArchived,
        createdAt: conv.createdAt.toISOString()
      }));
      
      res.status(200).json({
        success: true,
        data: {
          conversations: formattedConversations,
          pagination: {
            total: formattedConversations.length,
            limit: parseInt(limit as string, 10)
          }
        }
      });
    } catch (error) {
      logger.error('会話履歴取得エラー:', error);
      next(error);
    }
  }

  /**
   * 特定の会話の詳細を取得
   */
  async getConversationById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const conversationId = req.params.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '認証されていません'
        });
      }
      
      logger.debug(`会話取得: ${conversationId} by ${userId}`);
      
      // 会話の取得
      const conversation = await this.conversationService.getConversationById(
        conversationId,
        userId
      );
      
      // レスポンスフォーマット
      const formattedConversation = {
        id: conversation.id,
        userId,
        type: conversation.type,
        messages: conversation.messages.map(msg => ({
          id: msg.id,
          sender: msg.role,
          content: msg.content,
          metadata: msg.metadata,
          timestamp: msg.createdAt.toISOString()
        })),
        isArchived: conversation.isArchived,
        createdAt: conversation.createdAt.toISOString()
      };
      
      res.status(200).json({
        success: true,
        data: formattedConversation
      });
    } catch (error) {
      logger.error('会話取得エラー:', error);
      
      if (error.message === 'Conversation not found' || error.message === 'Unauthorized access to conversation') {
        return res.status(404).json({
          success: false,
          message: '会話が見つかりません'
        });
      }
      
      next(error);
    }
  }

  /**
   * 運勢に基づく呼び水質問を生成
   */
  async generatePromptQuestion(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '認証されていません'
        });
      }
      
      const { fortuneId } = req.body;
      logger.debug(`呼び水質問生成: userId=${userId}, fortuneId=${fortuneId}`);
      
      // 呼び水質問の生成
      const questionContent = await this.conversationService.generatePromptQuestion(userId, fortuneId);
      
      // レスポンス組み立て
      const promptQuestion = {
        questionId: `prompt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        content: questionContent,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json({
        success: true,
        data: promptQuestion
      });
    } catch (error) {
      logger.error('呼び水質問生成エラー:', error);
      next(error);
    }
  }

  /**
   * 会話をアーカイブ
   */
  async archiveConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const conversationId = req.params.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '認証されていません'
        });
      }
      
      logger.debug(`会話アーカイブ: ${conversationId} by ${userId}`);
      
      // 会話のアーカイブ
      const success = await this.conversationService.archiveConversation(
        conversationId,
        userId
      );
      
      if (success) {
        res.status(200).json({
          success: true,
          message: '会話が正常にアーカイブされました',
          data: { isArchived: true }
        });
      } else {
        res.status(400).json({
          success: false,
          message: '会話のアーカイブに失敗しました'
        });
      }
    } catch (error) {
      logger.error('会話アーカイブエラー:', error);
      
      if (error.message === 'Conversation not found' || error.message === 'Unauthorized access to conversation') {
        return res.status(404).json({
          success: false,
          message: '会話が見つかりません'
        });
      }
      
      next(error);
    }
  }

  /**
   * 会話内のメッセージをお気に入り登録
   */
  async toggleFavoriteMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { messageId } = req.body;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '認証されていません'
        });
      }
      
      logger.debug(`メッセージのお気に入りトグル: messageId=${messageId}`);
      
      // お気に入りのトグル
      const isFavorite = await this.conversationService.toggleFavoriteMessage(
        messageId,
        userId
      );
      
      const result = {
        messageId,
        isFavorite
      };
      
      res.status(200).json({
        success: true,
        message: isFavorite ? 'メッセージをお気に入りに追加しました' : 'メッセージのお気に入りを解除しました',
        data: result
      });
    } catch (error) {
      logger.error('お気に入り登録エラー:', error);
      
      if (error.message === 'Message not found' || error.message === 'Unauthorized access to message') {
        return res.status(404).json({
          success: false,
          message: 'メッセージが見つかりません'
        });
      }
      
      next(error);
    }
  }

  /**
   * 新規チームメンバー相性チャットを開始
   */
  async startTeamMemberChat(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { targetMemberId } = req.body;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '認証されていません'
        });
      }
      
      if (!targetMemberId) {
        return res.status(400).json({
          success: false,
          message: 'チームメンバーIDが必要です'
        });
      }
      
      logger.debug(`チームメンバー相性チャット開始: userId=${userId}, targetMemberId=${targetMemberId}`);
      
      // チームメンバー相性チャットの開始
      const conversation = await this.conversationService.startTeamMemberChat(
        userId,
        targetMemberId
      );
      
      // レスポンスフォーマット
      const formattedConversation = {
        id: conversation.id,
        userId,
        type: conversation.type,
        messages: conversation.messages.map(msg => ({
          id: msg.id,
          sender: msg.role,
          content: msg.content,
          metadata: msg.metadata,
          timestamp: msg.createdAt.toISOString()
        })),
        isArchived: conversation.isArchived,
        createdAt: conversation.createdAt.toISOString()
      };
      
      res.status(200).json({
        success: true,
        data: formattedConversation
      });
    } catch (error) {
      logger.error('チームメンバー相性チャット開始エラー:', error);
      
      if (error.message === 'Target member not found' || error.message === 'Team not found') {
        return res.status(404).json({
          success: false,
          message: 'メンバーまたはチームが見つかりません'
        });
      }
      
      next(error);
    }
  }

  /**
   * 新規デイリーフォーチュンチャットを開始
   */
  async startFortuneChat(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { fortuneId } = req.body;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '認証されていません'
        });
      }
      
      if (!fortuneId) {
        return res.status(400).json({
          success: false,
          message: 'フォーチュンIDが必要です'
        });
      }
      
      logger.debug(`デイリーフォーチュンチャット開始: userId=${userId}, fortuneId=${fortuneId}`);
      
      // フォーチュン情報の取得
      // TODO: FortuneServiceから実際のフォーチュン情報を取得する
      const fortune = {
        id: fortuneId,
        userId,
        date: new Date(),
        rating: 'good',
        overallScore: 75,
        advice: '今日は新しいことに挑戦するのに良い日です。'
      };
      
      // デイリーフォーチュンチャットの開始
      const conversation = await this.conversationService.startFortuneChat(
        userId,
        fortune
      );
      
      // レスポンスフォーマット
      const formattedConversation = {
        id: conversation.id,
        userId,
        type: conversation.type,
        messages: conversation.messages.map(msg => ({
          id: msg.id,
          sender: msg.role,
          content: msg.content,
          metadata: msg.metadata,
          timestamp: msg.createdAt.toISOString()
        })),
        isArchived: conversation.isArchived,
        createdAt: conversation.createdAt.toISOString()
      };
      
      res.status(200).json({
        success: true,
        data: formattedConversation
      });
    } catch (error) {
      logger.error('デイリーフォーチュンチャット開始エラー:', error);
      next(error);
    }
  }
}