/**
 * 会話モデル
 * AIとの会話履歴を保存するためのモデル
 * 
 * 変更履歴:
 * - 2025/04/02: 初期実装
 */

import mongoose, { Schema } from 'mongoose';

// 会話ドキュメントのインターフェース
export interface IConversationDocument extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId; // 所有者ユーザーID
  messages: Array<{
    id?: string; // メッセージの一意識別子
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  title?: string; // 会話のタイトル（自動生成または手動設定）
  tags?: string[]; // 会話のタグ（カテゴリ分け用）
  createdAt: Date;
  updatedAt: Date;
}

// 会話モデルのインターフェース（静的メソッド用）
export interface IConversationModel extends mongoose.Model<IConversationDocument> {
  findByUserId(userId: mongoose.Types.ObjectId): Promise<IConversationDocument[]>;
}

// 会話スキーマ定義
const conversationSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    messages: [{
      id: {
        type: String,
        required: true
      },
      role: {
        type: String,
        enum: ['user', 'assistant'],
        required: true
      },
      content: {
        type: String,
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }],
    title: {
      type: String,
      trim: true
    },
    tags: [{
      type: String,
      trim: true
    }]
  },
  {
    timestamps: true
  }
);

// メソッド: ユーザーIDで会話を検索
conversationSchema.statics.findByUserId = function(userId: mongoose.Types.ObjectId): Promise<IConversationDocument[]> {
  return this.find({ userId }).sort({ updatedAt: -1 }).exec();
};

// トランスフォーム設定でidとして_idを提供
conversationSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// モデル作成とエクスポート
const ConversationModel = mongoose.model<IConversationDocument, IConversationModel>('Conversation', conversationSchema);
export default ConversationModel;