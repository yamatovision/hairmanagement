import { injectable, inject } from 'tsyringe';
import mongoose, { Schema, Document, Model } from 'mongoose';
import { Conversation } from '../../domain/entities/Conversation';
import { BaseRepository } from './base/BaseRepository';

interface ConversationDocument extends Document {
  userId: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * MongoDBを使用した会話リポジトリの実装
 */
@injectable()
export class MongoConversationRepository extends BaseRepository<Conversation, string> {
  constructor(
    @inject('ConversationModel') model: mongoose.Model<ConversationDocument>
  ) {
    super(model as unknown as Model<mongoose.Document>);
  }

  /**
   * ユーザーIDに基づいて会話を検索
   * @param userId ユーザーID
   * @returns ユーザーの会話リスト
   */
  async findByUserId(userId: string): Promise<Conversation[]> {
    const conversations = await this.model.find({ userId }).sort({ updatedAt: -1 }).lean().exec();
    return conversations.map(conv => this.toDomainEntity(conv));
  }

  /**
   * ドキュメントをドメインエンティティに変換
   * @param doc MongoDBドキュメント
   * @returns 会話エンティティ
   */
  protected toDomainEntity(doc: any): Conversation {
    if (!doc) {
      throw new Error('Document is null or undefined');
    }
    
    const conversation: Conversation = {
      id: doc._id.toString(),
      userId: doc.userId,
      type: doc.type || 'general', // デフォルトはgeneralタイプ
      messages: doc.messages || [],
      isArchived: doc.isArchived || false,
      createdAt: doc.createdAt || new Date(),
      updatedAt: doc.updatedAt || new Date()
    };
    
    return conversation;
  }

  /**
   * ドメインエンティティをドキュメントに変換
   * @param entity 会話エンティティ
   * @returns ドキュメントデータ
   */
  protected toModelData(entity: Conversation): any {
    return {
      userId: entity.userId,
      type: entity.type,
      messages: entity.messages || [],
      isArchived: entity.isArchived || false,
      createdAt: entity.createdAt,
      updatedAt: new Date() // 更新時は常に現在の日時
    };
  }
}