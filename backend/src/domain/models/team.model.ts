/**
 * チームモデル
 * 組織・チーム構造を管理するMongooseスキーマとメソッドを定義
 * 
 * 変更履歴:
 * - 2025/04/02: 初期実装 (Claude)
 */

import mongoose, { Schema } from 'mongoose';

// チームメンバースキーマ
const teamMemberSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    required: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

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
      trim: true,
      default: ''
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
    members: [teamMemberSchema],
    isActive: {
      type: Boolean,
      default: true
    },
    goal: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// オーナーIDによるチーム検索
teamSchema.statics.findByOwner = function(ownerId: string) {
  return this.find({ ownerId }).exec();
};

// 管理者IDによるチーム検索
teamSchema.statics.findByAdmin = function(adminId: string) {
  return this.find({ admins: adminId }).exec();
};

// メンバーIDによるチーム検索
teamSchema.statics.findByMember = function(memberId: string) {
  return this.find({
    $or: [
      { ownerId: memberId },
      { admins: memberId },
      { 'members.userId': memberId }
    ]
  }).exec();
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
export interface ITeamDocument extends mongoose.Document {
  name: string;
  description: string;
  ownerId: mongoose.Types.ObjectId;
  admins: mongoose.Types.ObjectId[];
  members: {
    userId: mongoose.Types.ObjectId;
    role: string;
    joinedAt: Date;
  }[];
  isActive: boolean;
  goal: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITeamModel extends mongoose.Model<ITeamDocument> {
  findByOwner(ownerId: string): Promise<ITeamDocument[]>;
  findByAdmin(adminId: string): Promise<ITeamDocument[]>;
  findByMember(memberId: string): Promise<ITeamDocument[]>;
}

const TeamModel = mongoose.model<ITeamDocument, ITeamModel>('Team', teamSchema);
export default TeamModel;