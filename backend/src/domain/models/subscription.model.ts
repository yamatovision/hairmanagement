import mongoose, { Schema, Document } from 'mongoose';
import { PlanType, SubscriptionStatus, AiModelType } from '../entities/Subscription';

/**
 * サブスクリプションドキュメントインターフェース
 * MongoDBに保存されるサブスクリプション情報の型定義
 */
export interface ISubscriptionDocument extends Document {
  teamId?: string;
  userId?: string;
  planType: PlanType;
  planInfo: {
    type: PlanType;
    name: string;
    description: string;
    fortuneGenModel: AiModelType;
    aiConversationModel: AiModelType;
    features: string[];
  };
  status: SubscriptionStatus;
  startDate: Date;
  renewalDate: Date;
  usageStats?: {
    fortuneGenerationCount: number;
    aiConversationCount: number;
    lastUsedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * サブスクリプションスキーマ
 * MongoDBに保存するサブスクリプション情報のスキーマ定義
 */
const SubscriptionSchema = new Schema({
  // チームID（チーム単位のサブスクリプション）
  teamId: {
    type: String,
    sparse: true,
    index: true
  },
  
  // ユーザーID（個人単位のサブスクリプション）
  userId: {
    type: String,
    sparse: true,
    index: true
  },
  
  // プランタイプ
  planType: {
    type: String,
    enum: Object.values(PlanType),
    required: true,
    default: PlanType.STANDARD
  },
  
  // プラン情報
  planInfo: {
    type: {
      type: String,
      enum: Object.values(PlanType),
      required: true
    },
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    fortuneGenModel: {
      type: String,
      enum: Object.values(AiModelType),
      required: true
    },
    aiConversationModel: {
      type: String,
      enum: Object.values(AiModelType),
      required: true
    },
    features: [{
      type: String
    }]
  },
  
  // ステータス
  status: {
    type: String,
    enum: Object.values(SubscriptionStatus),
    required: true,
    default: SubscriptionStatus.ACTIVE
  },
  
  // 開始日
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  // 更新日
  renewalDate: {
    type: Date,
    required: true
  },
  
  // 使用状況
  usageStats: {
    fortuneGenerationCount: {
      type: Number,
      default: 0
    },
    aiConversationCount: {
      type: Number,
      default: 0
    },
    lastUsedAt: {
      type: Date,
      default: Date.now
    }
  }
}, 
{
  timestamps: true // createdAtとupdatedAtを自動的に追加
});

// インデックス設定
SubscriptionSchema.index({ teamId: 1 }, { unique: true, sparse: true });
SubscriptionSchema.index({ userId: 1 }, { unique: true, sparse: true });
SubscriptionSchema.index({ status: 1 });
SubscriptionSchema.index({ renewalDate: 1 });

// teamIdとuserIdの両方がnullにならないようにバリデーション
SubscriptionSchema.pre('validate', function(next) {
  const subscription = this as any;
  
  if (!subscription.teamId && !subscription.userId) {
    const error = new Error('teamIdまたはuserIdのいずれかが必要です');
    return next(error);
  }
  
  next();
});

// モデル名が存在していない場合のみ作成
const SubscriptionModel = mongoose.models.Subscription || 
  mongoose.model<ISubscriptionDocument>('Subscription', SubscriptionSchema);

export default SubscriptionModel;