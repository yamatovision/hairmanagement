/**
 * 会話データモデル
 * ユーザーとAI間の会話データを保存・取得する
 * 
 * 変更履歴:
 * - 2025/03/26: 初期実装 (AppGenius)
 * - 2025/03/27: TypeScript型互換性修正 (AI-2)
 */

import mongoose, { Schema } from 'mongoose';
import { IConversation, IMessage } from '@shared';
import { MongooseDocument, MongooseModel, ConversationDocumentToInterface } from '../types/mongoose-extensions';

// メッセージスキーマ
const MessageSchema = new Schema<IMessage>({
  id: {
    type: String,
    required: true
  },
  sender: {
    type: String,
    enum: ['user', 'ai'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: String,
    required: true
  },
  isPromptQuestion: {
    type: Boolean,
    default: false
  },
  promptCategory: {
    type: String,
    enum: ['growth', 'team', 'career', 'organization'],
  }
});

// 会話スキーマ
const ConversationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messages: {
    type: [MessageSchema],
    default: []
  },
  context: {
    fortuneId: {
      type: Schema.Types.ObjectId,
      ref: 'Fortune'
    },
    relatedGoalId: {
      type: Schema.Types.ObjectId,
      ref: 'Goal'
    },
    teamRelated: {
      type: Boolean,
      default: false
    },
    sentimentScore: {
      type: Number,
      min: -1.0,
      max: 1.0
    }
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true,
  toJSON: { 
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

// インデックス作成
ConversationSchema.index({ userId: 1 });
ConversationSchema.index({ 'context.fortuneId': 1 });
ConversationSchema.index({ isArchived: 1 });
ConversationSchema.index({ createdAt: -1 });

// 型拡張でMongooseドキュメントをIConversationと互換性を持たせる
export interface ConversationDocument extends MongooseDocument<IConversation>, ConversationDocumentToInterface {
  _id: any;
  userId: mongoose.Types.ObjectId | string;
  messages: IMessage[];
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// モデル型定義
export interface ConversationModel extends MongooseModel<IConversation> {
  findByUserId(userId: string): Promise<ConversationDocument[]>;
}

// インターフェース変換メソッドを追加
ConversationSchema.methods.toInterface = function(): IConversation {
  const json = this.toJSON();
  return json as IConversation;
};

// 静的メソッド
ConversationSchema.statics.findByUserId = function(userId: string): Promise<ConversationDocument[]> {
  return this.find({ userId }).sort({ createdAt: -1 }).exec();
};

// モデル作成とエクスポート
export const Conversation = mongoose.model<ConversationDocument, ConversationModel>('Conversation', ConversationSchema);

// 後方互換性のためにConversationModelとしても公開
export { Conversation as ConversationModel };