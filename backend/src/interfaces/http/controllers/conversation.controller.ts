import { Request, Response, NextFunction } from 'express';
import { logger } from '../../../utils/logger.util';

/**
 * 会話コントローラー
 * AI対話システム関連のエンドポイントを処理する
 */
export class ConversationController {
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
      
      const messageData = req.body;
      logger.debug(`${userId}からのメッセージ送信: ${JSON.stringify(messageData)}`);
      
      // ダミーデータを返す
      const result = {
        conversation: {
          id: 'dummy-conversation-id',
          userId,
          messages: [
            {
              id: 'dummy-user-msg',
              sender: 'user',
              content: messageData.content,
              timestamp: new Date().toISOString()
            },
            {
              id: 'dummy-ai-msg',
              sender: 'ai',
              content: 'こんにちは！どのようにお手伝いできますか？',
              timestamp: new Date().toISOString()
            }
          ],
          isArchived: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        lastMessage: {
          id: 'dummy-ai-msg',
          sender: 'ai',
          content: 'こんにちは！どのようにお手伝いできますか？',
          timestamp: new Date().toISOString()
        }
      };
      
      res.status(200).json({
        success: true,
        data: result
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
      const { limit = 10, page = 1, archived } = req.query;
      const options = {
        limit: parseInt(limit as string, 10),
        page: parseInt(page as string, 10),
        isArchived: archived === 'true' ? true : archived === 'false' ? false : undefined
      };
      
      logger.debug(`${userId}の会話履歴取得: ${JSON.stringify(options)}`);
      
      // ダミーデータを返す
      const conversations = {
        conversations: [
          {
            id: 'dummy-conversation-1',
            userId,
            messages: [
              {
                id: 'dummy-msg-1',
                sender: 'user',
                content: '今日の運勢はどうですか？',
                timestamp: new Date().toISOString()
              },
              {
                id: 'dummy-msg-2',
                sender: 'ai',
                content: '今日はとても良い日になりそうです！',
                timestamp: new Date().toISOString()
              }
            ],
            isArchived: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        pagination: {
          total: 1,
          page: parseInt(page as string, 10),
          limit: parseInt(limit as string, 10),
          totalPages: 1
        }
      };
      
      res.status(200).json({
        success: true,
        data: conversations
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
      
      // ダミーデータを返す
      const conversation = {
        id: conversationId,
        userId,
        messages: [
          {
            id: 'dummy-msg-1',
            sender: 'user',
            content: '今日の運勢はどうですか？',
            timestamp: new Date().toISOString()
          },
          {
            id: 'dummy-msg-2',
            sender: 'ai',
            content: '今日はとても良い日になりそうです！',
            timestamp: new Date().toISOString()
          }
        ],
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      res.status(200).json({
        success: true,
        data: conversation
      });
    } catch (error) {
      logger.error('会話取得エラー:', error);
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
      
      const { fortuneId, category } = req.body;
      logger.debug(`呼び水質問生成: userId=${userId}, fortuneId=${fortuneId}, category=${category}`);
      
      // カテゴリに基づいた質問セット
      const questions = {
        growth: [
          '最近、どのような自己成長を感じていますか？',
          '今後半年で伸ばしたいスキルはありますか？',
          '以前の自分と比べて、どのような変化がありましたか？'
        ],
        team: [
          'チームでの役割で満足していることは何ですか？',
          'チームでの協力関係を改善するアイデアはありますか？',
          'チームメンバーとの関係で悩んでいることはありますか？'
        ],
        career: [
          'キャリアの次のステップとして考えていることは何ですか？',
          'この仕事を通じて最も学んだことは何ですか？',
          '理想のキャリアパスを描くとしたら、どのようなものですか？'
        ],
        organization: [
          '組織の価値観で最も共感できるものは何ですか？',
          '組織の中で改善すべきだと思う点はありますか？',
          '組織全体に貢献するために、どのような役割を果たしたいですか？'
        ]
      };
      
      // カテゴリがない場合は全カテゴリからランダムに選択
      const selectedCategory = category || ['growth', 'team', 'career', 'organization'][Math.floor(Math.random() * 4)];
      
      // 質問セットからランダムに選択
      const questionPool = questions[selectedCategory];
      const randomQuestion = questionPool[Math.floor(Math.random() * questionPool.length)];
      
      // レスポンス組み立て
      const promptQuestion = {
        questionId: `prompt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        content: randomQuestion,
        category: selectedCategory,
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
      
      // ダミーデータを返す
      const updatedConversation = {
        id: conversationId,
        userId,
        messages: [
          {
            id: 'dummy-msg-1',
            sender: 'user',
            content: '今日の運勢はどうですか？',
            timestamp: new Date().toISOString()
          },
          {
            id: 'dummy-msg-2',
            sender: 'ai',
            content: '今日はとても良い日になりそうです！',
            timestamp: new Date().toISOString()
          }
        ],
        isArchived: true, // アーカイブ済みに更新
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      res.status(200).json({
        success: true,
        message: '会話が正常にアーカイブされました',
        data: updatedConversation
      });
    } catch (error) {
      logger.error('会話アーカイブエラー:', error);
      next(error);
    }
  }

  /**
   * 会話内のメッセージをお気に入り登録
   */
  async toggleFavoriteMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const conversationId = req.params.id;
      const { messageId } = req.body;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '認証されていません'
        });
      }
      
      logger.debug(`メッセージのお気に入りトグル: conversationId=${conversationId}, messageId=${messageId}`);
      
      // ダミーデータを返す (トグル処理をシミュレート)
      const isFavorite = Math.random() > 0.5; // ランダムに状態を設定
      
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
      next(error);
    }
  }
}

export const conversationController = new ConversationController();