/**
 * ユーザーモデル
 * ユーザーに関するスキーマとメソッドを定義
 * 
 * 変更履歴:
 * - 2025/03/26: 初期実装 (AppGenius)
 * - 2025/03/27: TypeScript型互換性修正 (AI-2)
 * - 2025/03/31: クリーンアーキテクチャに移行 (Claude)
 * - 2025/04/03: todayFortune、サブスクリプション情報追加 (Claude)
 */

import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import { UserRole } from '../user/value-objects/user-role';
import { UserStatus } from '../user/value-objects/user-status';

// サブスクリプションプラン
export enum SubscriptionPlan {
  FREE = 'free',        // 無料プラン
  STANDARD = 'standard', // 標準プラン (Haiku)
  PREMIUM = 'premium'   // プレミアムプラン (Sonnet)
}

// 今日の運勢フィールド用インターフェース
export interface TodayFortune {
  date: string;              // 日付 YYYY-MM-DD
  mainElement: string;       // 主要五行属性
  yinYang: string;           // 陰陽
  overallScore: number;      // 総合運勢スコア
  advice: string;            // アドバイス
  aiGeneratedAdvice?: {      // AI生成アドバイス
    advice: string;          // マークダウン形式アドバイス
    luckyPoints?: {          // ラッキーポイント
      color: string;
      items: string[];
      number: number;
      action: string;
    }
  };
}

// ユーザードキュメントのインターフェース
export interface IUserDocument extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  password: string;
  email: string;
  name: string;
  birthDate: string;
  birthHour?: number;
  birthLocation?: string;
  role: string;  // UserRoleの文字列表現
  teamIds?: mongoose.Types.ObjectId[];  // 所属チームのID配列
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  status: string;  // UserStatusの文字列表現
  isActive: boolean; // 後方互換性のため
  profilePicture?: string; // プロフィール画像URL
  personalGoal?: string;   // 個人目標
  
  // サブスクリプション情報
  plan?: string;           // サブスクリプションプラン
  planExpiresAt?: Date;    // プラン有効期限
  
  // 今日の運勢情報（毎日更新される消耗品）
  todayFortune?: TodayFortune;
  
  // メソッド
  comparePassword(candidatePassword: string): Promise<boolean>;
  
  // エレメンタルプロフィール
  elementalType?: {
    mainElement?: string;
    secondaryElement?: string;
    yinYang?: string;
  };
  
  // 四柱推命プロファイル
  sajuProfile?: {
    fourPillars?: {
      yearPillar?: {
        stem?: string;
        branch?: string;
        fullStemBranch?: string;
        hiddenStems?: string[];
      };
      monthPillar?: {
        stem?: string;
        branch?: string;
        fullStemBranch?: string;
        hiddenStems?: string[];
      };
      dayPillar?: {
        stem?: string;
        branch?: string;
        fullStemBranch?: string;
        hiddenStems?: string[];
      };
      hourPillar?: {
        stem?: string;
        branch?: string;
        fullStemBranch?: string;
        hiddenStems?: string[];
      };
    };
    mainElement?: string;
    secondaryElement?: string;
    yinYang?: string;
    tenGods?: Map<string, string>;
    branchTenGods?: Map<string, string>; // 地支十神関係を追加
  };
  
  // 通知設定
  notificationSettings?: {
    dailyFortune?: boolean;
    promptQuestions?: boolean;
    teamEvents?: boolean;
    goalReminders?: boolean;
    systemUpdates?: boolean;
  };
}

// ユーザーモデルのインターフェース（静的メソッド用）
export interface IUserModel extends mongoose.Model<IUserDocument> {
  findByEmail(email: string): Promise<IUserDocument | null>;
}

// ラッキーポイントスキーマ（todayFortune用）
const luckyPointsSchema = new Schema({
  color: String,
  items: [String],
  number: Number,
  action: String
}, { _id: false });

// AIアドバイススキーマ
const aiGeneratedAdviceSchema = new Schema({
  advice: String,
  luckyPoints: luckyPointsSchema
}, { _id: false });

// 今日の運勢スキーマ
const todayFortuneSchema = new Schema({
  date: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        return /^\d{4}-\d{2}-\d{2}$/.test(v); // YYYY-MM-DD形式
      },
      message: (props: { value: string }) => `${props.value}は有効な日付形式ではありません。YYYY-MM-DD形式で入力してください。`
    }
  },
  mainElement: {
    type: String,
    enum: ['木', '火', '土', '金', '水'],
    required: true
  },
  yinYang: {
    type: String,
    enum: ['陰', '陽'],
    required: true
  },
  overallScore: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  advice: {
    type: String,
    required: true
  },
  aiGeneratedAdvice: aiGeneratedAdviceSchema
}, { _id: false });

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
    birthHour: {
      type: Number,
      min: 0,
      max: 23
    },
    birthLocation: {
      type: String,
      trim: true
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.EMPLOYEE
    },
    teamIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team'
    }],
    profilePicture: {
      type: String
    },
    personalGoal: {
      type: String,
      trim: true
    },
    // サブスクリプション情報
    plan: {
      type: String,
      enum: Object.values(SubscriptionPlan),
      default: SubscriptionPlan.FREE
    },
    planExpiresAt: {
      type: Date
    },
    // 今日の運勢情報
    todayFortune: todayFortuneSchema,
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
    sajuProfile: {
      fourPillars: {
        yearPillar: {
          stem: String,
          branch: String,
          fullStemBranch: String,
          hiddenStems: [String]
        },
        monthPillar: {
          stem: String,
          branch: String,
          fullStemBranch: String,
          hiddenStems: [String]
        },
        dayPillar: {
          stem: String,
          branch: String,
          fullStemBranch: String,
          hiddenStems: [String]
        },
        hourPillar: {
          stem: String,
          branch: String,
          fullStemBranch: String,
          hiddenStems: [String]
        }
      },
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
        enum: ['陰', '陽']
      },
      tenGods: {
        type: Map,
        of: String
      },
      branchTenGods: {
        type: Map,
        of: String
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
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE
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

// モデル作成とエクスポート
const UserModel = mongoose.model<IUserDocument, IUserModel>('User', userSchema);
export default UserModel;