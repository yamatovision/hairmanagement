import mongoose, { Document, Schema } from 'mongoose';

// トークンのインターフェース
export interface IToken {
  userId: string;
  token: string;
  type: 'refresh' | 'reset' | 'verify';
  expiresAt: Date;
  isRevoked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Mongooseドキュメントインターフェース
export interface TokenDocument extends IToken, Document {}

// トークンスキーマ定義
const TokenSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['refresh', 'reset', 'verify'],
    default: 'refresh',
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  isRevoked: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true 
});

// 複合インデックスの作成 (ユーザーIDとトークンタイプで素早く検索)
TokenSchema.index({ userId: 1, type: 1 });

// 有効期限切れトークンの自動削除（TTLインデックス）
TokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// 有効なトークンかどうか確認するメソッド
TokenSchema.methods.isValid = function(): boolean {
  return !this.isRevoked && this.expiresAt > new Date();
};

// トークンを無効化するメソッド
TokenSchema.methods.revoke = async function(): Promise<void> {
  this.isRevoked = true;
  await this.save();
};

// 全てのトークンの内部関数を含むインターフェース
export interface TokenDocument extends Document, IToken {
  isValid(): boolean;
  revoke(): Promise<void>;
}

// ユーザーの全リフレッシュトークンを無効化する静的メソッド
TokenSchema.statics.revokeAllUserTokens = async function(userId: string, type: string = 'refresh'): Promise<void> {
  await this.updateMany(
    { userId, type, isRevoked: false },
    { isRevoked: true }
  );
};

// TokenModelインターフェース（スタティックメソッドを含む）
export interface TokenModelInterface extends mongoose.Model<TokenDocument> {
  revokeAllUserTokens(userId: string, type?: string): Promise<void>;
}

// モデルのエクスポート
export const TokenModel = mongoose.model<TokenDocument, TokenModelInterface>('Token', TokenSchema);