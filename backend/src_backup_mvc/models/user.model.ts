/**
 * ユーザーモデル
 * ユーザーに関するスキーマとメソッドを定義
 * 
 * 変更履歴:
 * - 2025/03/26: 初期実装 (AppGenius)
 * - 2025/03/27: TypeScript型互換性修正 (AI-2)
 */

import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import { IUser } from '@shared';
import { MongooseDocument, MongooseModel, UserDocumentToInterface } from '../types/mongoose-extensions';

// ユーザードキュメントのインターフェース
export interface IUserDocument extends MongooseDocument<IUser>, UserDocumentToInterface {
  // MongooseドキュメントのDateオブジェクト（オーバーライド）
  _id: any;
  password: string;
  email: string;
  name: string;
  birthDate: string;
  role: 'employee' | 'manager' | 'admin' | 'superadmin';
  teamIds?: mongoose.Types.ObjectId[];  // 所属チームのID配列
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  
  // メソッド
  comparePassword(candidatePassword: string): Promise<boolean>;
  toInterface(): IUser;
}

// ユーザーモデルのインターフェース（静的メソッド用）
export interface IUserModel extends MongooseModel<IUser> {
  findByEmail(email: string): Promise<IUserDocument | null>;
}

// ユーザースキーマ定義
const userSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    birthDate: {
      type: String,
      required: true,
      validate: {
        validator: function(v: string) {
          return /^\d{4}-\d{2}-\d{2}$/.test(v); // YYYY-MM-DD形式
        },
        message: (props: { value: string }) => `${props.value}は有効な日付形式ではありません。YYYY-MM-DD形式で入力してください。`
      }
    },
    role: {
      type: String,
      enum: ['employee', 'manager', 'admin', 'superadmin'],
      default: 'employee'
    },
    teamIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team'
    }],
    profilePicture: {
      type: String
    },
    elementalType: {
      mainElement: {
        type: String,
        enum: ['木', '火', '土', '金', '水']
      },
      secondaryElement: {
        type: String,
        enum: ['木', '火', '土', '金', '水']
      },
      yinYang: {
        type: String,
        enum: ['陰', '陽'],
        default: '陰'
      }
    },
    notificationSettings: {
      dailyFortune: {
        type: Boolean,
        default: true
      },
      promptQuestions: {
        type: Boolean,
        default: true
      },
      teamEvents: {
        type: Boolean,
        default: true
      },
      goalReminders: {
        type: Boolean,
        default: true
      },
      systemUpdates: {
        type: Boolean,
        default: true
      }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLoginAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// パスワードハッシュ化のミドルウェア
userSchema.pre<IUserDocument>('save', async function(next) {
  // パスワードが変更されていない場合はスキップ
  if (!this.isModified('password')) return next();
  
  try {
    // パスワードをハッシュ化
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// パスワード比較メソッド
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

// メールアドレスによるユーザー検索
userSchema.statics.findByEmail = function(email: string): Promise<IUserDocument | null> {
  return this.findOne({ email: email.toLowerCase() }).exec();
};

// トランスフォーム設定でidとして_idを提供
userSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// インターフェース変換メソッド
userSchema.methods.toInterface = function(): IUser {
  const json = this.toJSON();
  return json as IUser;
};

// モデル作成とエクスポート
const UserModel = mongoose.model<IUserDocument, IUserModel>('User', userSchema);
export default UserModel;