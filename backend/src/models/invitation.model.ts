/**
 * 招待モデル
 * チームへの招待とその状態を管理するスキーマとメソッドを定義
 * 
 * 変更履歴:
 * - 2025/03/27: 初期実装 (Claude)
 */

import mongoose, { Schema } from 'mongoose';
import crypto from 'crypto';
import { InvitationStatus, InvitationRole } from '@shared';
import { MongooseDocument, MongooseModel } from '../types/mongoose-extensions';

// 招待ドキュメントのインターフェース
export interface IInvitationDocument extends MongooseDocument<any> {
  email: string;
  teamId: mongoose.Types.ObjectId;
  inviterId: mongoose.Types.ObjectId;
  invitationToken: string;
  status: InvitationStatus;
  role: InvitationRole;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // メソッド
  isExpired(): boolean;
  updateStatus(status: InvitationStatus): Promise<void>;
}

// 招待モデルのインターフェース（静的メソッド用）
export interface IInvitationModel extends MongooseModel<any> {
  findByEmail(email: string, teamId: string): Promise<IInvitationDocument[]>;
  findByToken(token: string): Promise<IInvitationDocument | null>;
  findActiveByTeam(teamId: string): Promise<IInvitationDocument[]>;
  generateToken(): string;
}

// 招待スキーマ定義
const invitationSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true
    },
    inviterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    invitationToken: {
      type: String,
      required: true,
      unique: true
    },
    status: {
      type: String,
      enum: Object.values(InvitationStatus),
      default: InvitationStatus.PENDING
    },
    role: {
      type: String,
      enum: Object.values(InvitationRole),
      default: InvitationRole.EMPLOYEE
    },
    expiresAt: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// トークン生成
invitationSchema.statics.generateToken = function(): string {
  return crypto.randomBytes(32).toString('hex');
};

// トークンによる招待検索
invitationSchema.statics.findByToken = function(token: string): Promise<IInvitationDocument | null> {
  return this.findOne({ invitationToken: token }).exec();
};

// メールアドレスとチームによる招待検索
invitationSchema.statics.findByEmail = function(email: string, teamId: string): Promise<IInvitationDocument[]> {
  return this.find({ 
    email: email.toLowerCase(),
    teamId,
    status: InvitationStatus.PENDING
  }).exec();
};

// チームIDによるアクティブな招待検索
invitationSchema.statics.findActiveByTeam = function(teamId: string): Promise<IInvitationDocument[]> {
  return this.find({ 
    teamId,
    status: InvitationStatus.PENDING,
    expiresAt: { $gt: new Date() }
  }).exec();
};

// 招待が期限切れかチェック
invitationSchema.methods.isExpired = function(): boolean {
  return this.expiresAt < new Date() || this.status === InvitationStatus.EXPIRED;
};

// 招待ステータス更新
invitationSchema.methods.updateStatus = async function(status: InvitationStatus): Promise<void> {
  this.status = status;
  await this.save();
};

// トランスフォーム設定でidとして_idを提供
invitationSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// モデル作成とエクスポート
const InvitationModel = mongoose.model<IInvitationDocument, IInvitationModel>('Invitation', invitationSchema);
export default InvitationModel;