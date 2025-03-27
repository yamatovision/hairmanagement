import { v4 as uuidv4 } from 'uuid';
import { ConversationModel, ConversationDocument } from '../models/conversation.model';
import { CustomError } from '../utils/error.util';
import { claudeService } from './claude.service';
import { IMessage, IConversation, SendMessageRequest, GeneratePromptQuestionRequest } from '@shared';
import { logger } from '../utils/logger.util';
import mongoose from 'mongoose';
import { documentToInterface } from '../utils/model-converters';
import { promptTemplates } from '../utils/prompt-templates';

/**
 * 会話サービス
 * AI対話関連のビジネスロジックを提供
 */
export const conversationService = {
  /**
   * メッセージ送信・AIレスポンス取得
   */
  sendMessage: async (userId: string, messageData: SendMessageRequest) => {
    try {
      const { conversationId, content, context } = messageData;
      const timestamp = new Date().toISOString();
      
      // 新規メッセージオブジェクト
      const userMessage: IMessage = {
        id: uuidv4(),
        sender: 'user',
        content,
        timestamp
      };
      
      // 既存の会話を更新するか、新しい会話を作成
      let conversation;
      
      if (conversationId) {
        // 既存の会話を取得
        conversation = await ConversationModel.findOne({
          _id: conversationId,
          userId
        });
        
        if (!conversation) {
          throw new CustomError('会話が見つかりません', 404);
        }
        
        // メッセージを追加
        conversation.messages.push(userMessage);
      } else {
        // 新しい会話を作成
        conversation = new ConversationModel({
          userId,
          messages: [userMessage],
          context: context || {}
        });
      }
      
      // 会話の保存
      await conversation.save();
      logger.debug(`ユーザーメッセージ保存: conversationId=${conversation._id}`);
      
      // ClaudeAPIを使用してAI応答を生成
      const conversationHistory = conversation.messages;
      const aiResponse = await claudeService.generateResponse(userId, content, conversationHistory, context);
      
      // AIレスポンスを保存
      const aiMessage: IMessage = {
        id: uuidv4(),
        sender: 'ai',
        content: aiResponse.content,
        timestamp: new Date().toISOString()
      };
      
      conversation.messages.push(aiMessage);
      
      // 感情分析スコアを更新（仮実装、本番環境では実際の分析結果を使用）
      // 陰陽五行属性や会話からユーザーの感情を推測
      if (conversation.context) {
        conversation.context.sentimentScore = aiResponse.sentimentScore || 0.2; // 仮実装
      }
      
      await conversation.save();
      logger.debug(`AIレスポンス保存: conversationId=${conversation._id}`);
      
      // documentToInterfaceを使用してMongooseドキュメントをTypeScriptインターフェースに変換
      const convertedConversation = documentToInterface<IConversation>(conversation);
      
      return {
        conversation: convertedConversation,
        lastMessage: aiMessage
      };
    } catch (error) {
      logger.error('メッセージ送信エラー:', error);
      throw error;
    }
  },

  /**
   * ユーザーの全会話履歴を取得
   */
  getAllConversationsByUserId: async (userId: string, options: any) => {
    try {
      const { limit = 10, page = 1, isArchived } = options;
      const skip = (page - 1) * limit;
      
      // クエリ構築
      const query: any = { userId };
      
      // アーカイブ状態でフィルタリング（指定がある場合）
      if (isArchived !== undefined) {
        query.isArchived = isArchived;
      }
      
      // 会話と総件数の取得
      const [conversations, total] = await Promise.all([
        ConversationModel.find(query)
          .sort({ updatedAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        ConversationModel.countDocuments(query)
      ]);
      
      // 会話履歴の最適化（各会話の最初と最後のメッセージのみを含める）
      const optimizedConversations = conversations.map(conversation => {
        const messages = conversation.messages || [];
        let optimizedMessages = [];
        
        if (messages.length > 0) {
          // 最初のメッセージ
          optimizedMessages.push(messages[0]);
          
          // 最後のメッセージ（最初と異なる場合）
          if (messages.length > 1) {
            optimizedMessages.push(messages[messages.length - 1]);
          }
        }
        
        // documentToInterface を使用して各会話をインターフェース形式に変換
        const convertedConversation = documentToInterface<IConversation>({
          ...conversation,
          messages: optimizedMessages,
          messageCount: messages.length
        });
        
        return convertedConversation;
      });
      
      return {
        conversations: optimizedConversations,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('会話履歴取得エラー:', error);
      throw error;
    }
  },

  /**
   * 特定の会話の詳細を取得
   */
  getConversationById: async (conversationId: string, userId: string) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        throw new CustomError('無効な会話IDです', 400);
      }
      
      const conversation = await ConversationModel.findOne({
        _id: conversationId,
        userId
      }).lean();
      
      if (!conversation) {
        throw new CustomError('会話が見つかりません', 404);
      }
      
      // MongooseDocumentをTypeScriptインターフェースに変換
      return documentToInterface<IConversation>(conversation);
    } catch (error) {
      logger.error('会話取得エラー:', error);
      throw error;
    }
  },

  /**
   * 運勢に基づく呼び水質問を生成
   */
  generatePromptQuestion: async (requestData: GeneratePromptQuestionRequest) => {
    try {
      const { userId, fortuneId, category } = requestData;
      
      // 属性や運勢情報を取得（本番環境では実際のデータベースクエリを使用）
      const userElementalType = await claudeService.getUserElementalType(userId);
      const fortuneData = fortuneId ? await claudeService.getFortuneById(fortuneId) : null;
      
      // プロンプトテンプレートを取得
      let templateKey = 'default';
      if (category) {
        templateKey = category;
      } else if (fortuneData?.dailyElement) {
        // 運勢の属性に基づいてテンプレートを選択
        const elementMap: Record<string, string> = {
          '木': 'growth',
          '火': 'career',
          '土': 'organization',
          '金': 'team',
          '水': 'growth'
        };
        templateKey = elementMap[fortuneData.dailyElement] || 'default';
      }
      
      const template = promptTemplates.getPromptQuestionTemplate(templateKey);
      
      // Claude APIで呼び水質問を生成
      const promptQuestion = await claudeService.generatePromptQuestion(userId, template, {
        userElement: userElementalType,
        dailyElement: fortuneData?.dailyElement,
        dailyYinYang: fortuneData?.yinYang,
        overallLuck: fortuneData?.overallLuck
      });
      
      // 結果を返却
      return {
        questionId: uuidv4(),
        content: promptQuestion,
        category: category || templateKey,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('呼び水質問生成エラー:', error);
      throw error;
    }
  },

  /**
   * 会話をアーカイブ
   */
  archiveConversation: async (conversationId: string, userId: string) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        throw new CustomError('無効な会話IDです', 400);
      }
      
      const conversation = await ConversationModel.findOne({
        _id: conversationId,
        userId
      });
      
      if (!conversation) {
        throw new CustomError('会話が見つかりません', 404);
      }
      
      // アーカイブ状態を更新
      conversation.isArchived = true;
      await conversation.save();
      
      // MongooseDocumentをTypeScriptインターフェースに変換
      return documentToInterface<IConversation>(conversation);
    } catch (error) {
      logger.error('会話アーカイブエラー:', error);
      throw error;
    }
  },

  /**
   * 会話内のメッセージをお気に入り登録
   */
  toggleFavoriteMessage: async (conversationId: string, messageId: string, userId: string) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        throw new CustomError('無効な会話IDです', 400);
      }
      
      const conversation = await ConversationModel.findOne({
        _id: conversationId,
        userId
      });
      
      if (!conversation) {
        throw new CustomError('会話が見つかりません', 404);
      }
      
      // メッセージを検索
      const messageIndex = conversation.messages.findIndex(message => message.id === messageId);
      
      if (messageIndex === -1) {
        throw new CustomError('メッセージが見つかりません', 404);
      }
      
      // お気に入りプロパティを切り替え（なければ追加、あれば削除）
      const message = conversation.messages[messageIndex];
      const currentValue = 'isFavorite' in message ? !!message.isFavorite : false;
      
      // TypeScriptの型対応のためにanyとして扱う
      const messageAny = message as any;
      messageAny.isFavorite = !currentValue;
      
      await conversation.save();
      
      // 変換されたメッセージ情報を返す
      const convertedConversation = documentToInterface<IConversation>(conversation);
      const updatedMessage = convertedConversation.messages.find(m => m.id === messageId);
      
      return {
        messageId,
        isFavorite: !currentValue,
        message: updatedMessage
      };
    } catch (error) {
      logger.error('お気に入り登録エラー:', error);
      throw error;
    }
  }
};