/**
 * チームモデル
 * 組織・チーム構造を管理するスキーマとメソッドを定義
 * 
 * 変更履歴:
 * - 2025/03/27: 初期実装 (Claude)
 */

import mongoose, { Schema } from 'mongoose';
import { IMongooseDocument } from '@shared';

// ITeam インターフェースを移植
export interface ITeam {
  id: string;
  _id?: string;
  name: string;
  description?: string;
  ownerId: string;
  admins: string[];
  members: string[];
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}
import { MongooseDocument, MongooseModel } from '../types/mongoose-extensions';

// チームドキュメントのインターフェース
export interface ITeamDocument extends MongooseDocument<ITeam> {
  name: string;
  description?: string;
  ownerId: mongoose.Types.ObjectId;  // SuperAdmin または 作成したAdmin
  admins: mongoose.Types.ObjectId[];  // Adminユーザーの配列
  members: mongoose.Types.ObjectId[];  // チームメンバーの配列
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// チームモデルのインターフェース（静的メソッド用）
export interface ITeamModel extends MongooseModel<ITeam> {
  findByOwner(ownerId: string): Promise<ITeamDocument[]>;
  findByAdmin(adminId: string): Promise<ITeamDocument[]>;
  findByMember(memberId: string): Promise<ITeamDocument[]>;
}

// チームスキーマ定義
const teamSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    admins: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    members: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// オーナーIDによるチーム検索
teamSchema.statics.findByOwner = function(ownerId: string): Promise<ITeamDocument[]> {
  return this.find({ ownerId }).exec();
};

// 管理者IDによるチーム検索
teamSchema.statics.findByAdmin = function(adminId: string): Promise<ITeamDocument[]> {
  return this.find({ admins: adminId }).exec();
};

// メンバーIDによるチーム検索
teamSchema.statics.findByMember = function(memberId: string): Promise<ITeamDocument[]> {
  return this.find({ members: memberId }).exec();
};

// トランスフォーム設定でidとして_idを提供
teamSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// モデル作成とエクスポート
const TeamModel = mongoose.model<ITeamDocument, ITeamModel>('Team', teamSchema);
export default TeamModel;