/**
 * 運勢データモデル
 * 陰陽五行に基づく運勢データの保存・取得を扱う
 * 
 * 変更履歴:
 * - 2025/03/26: 初期実装 (AppGenius)
 * - 2025/03/27: TypeScript型互換性修正 (AI-2)
 */

import mongoose, { Schema } from 'mongoose';
import { ElementType, YinYangType, IFortune } from '@shared';
import { MongooseDocument, MongooseModel, FortuneDocumentToInterface } from '../types/mongoose-extensions';

// Fortune ドキュメントのインターフェース
export interface IFortuneDocument extends MongooseDocument<IFortune>, FortuneDocumentToInterface {
  // Mongooseドキュメント特有のプロパティ（これらはOverrideしている）
  _id: any; 
  userId: mongoose.Types.ObjectId | string;
  date: string;
  dailyElement: ElementType;
  yinYang: YinYangType;
  viewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // ドキュメントメソッド
  markAsViewed(): Promise<IFortuneDocument>;
  toInterface(): IFortune;
}

// Fortune スキーマ定義
const FortuneSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    date: {
      type: String,
      required: true,
      index: true,
      validate: {
        validator: function(v: string) {
          return /^\d{4}-\d{2}-\d{2}$/.test(v); // YYYY-MM-DD 形式
        },
        message: props => `${props.value} は有効な日付形式ではありません。YYYY-MM-DD形式である必要があります。`
      }
    },
    dailyElement: {
      type: String,
      enum: ['木', '火', '土', '金', '水'],
      required: true
    },
    yinYang: {
      type: String,
      enum: ['陰', '陽'],
      required: true
    },
    overallLuck: {
      type: Number,
      required: true,
      min: 1,
      max: 100
    },
    careerLuck: {
      type: Number,
      required: true,
      min: 1,
      max: 100
    },
    relationshipLuck: {
      type: Number,
      required: true,
      min: 1,
      max: 100
    },
    creativeEnergyLuck: {
      type: Number,
      required: true,
      min: 1,
      max: 100
    },
    healthLuck: {
      type: Number,
      required: true,
      min: 1,
      max: 100
    },
    wealthLuck: {
      type: Number,
      required: true,
      min: 1,
      max: 100
    },
    description: {
      type: String,
      required: true
    },
    advice: {
      type: String,
      required: true
    },
    luckyColors: [{
      type: String
    }],
    luckyDirections: [{
      type: String
    }],
    compatibleElements: [{
      type: String,
      enum: ['木', '火', '土', '金', '水']
    }],
    incompatibleElements: [{
      type: String,
      enum: ['木', '火', '土', '金', '水']
    }],
    viewedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// 複合インデックス: ユーザーごとの日付検索を最適化
FortuneSchema.index({ userId: 1, date: 1 }, { unique: true });

// メソッド: 表示日時を更新
FortuneSchema.methods.markAsViewed = function(): Promise<IFortuneDocument> {
  this.viewedAt = new Date();
  return this.save();
};

// 静的メソッド: ユーザーの指定日の運勢を取得
FortuneSchema.statics.findByUserAndDate = function(
  userId: mongoose.Types.ObjectId | string,
  date: string
): Promise<IFortuneDocument | null> {
  return this.findOne({ userId, date }).exec();
};

// 静的メソッド: ユーザーの日付範囲の運勢を取得
FortuneSchema.statics.findByUserAndDateRange = function(
  userId: mongoose.Types.ObjectId | string,
  startDate: string,
  endDate: string
): Promise<IFortuneDocument[]> {
  return this.find({
    userId,
    date: { $gte: startDate, $lte: endDate }
  })
    .sort({ date: 1 })
    .exec();
};

// 静的メソッド: ユーザーの最新の運勢を取得
FortuneSchema.statics.findLatestByUser = function(
  userId: mongoose.Types.ObjectId | string,
  limit: number = 7
): Promise<IFortuneDocument[]> {
  return this.find({ userId })
    .sort({ date: -1 })
    .limit(limit)
    .exec();
};

// FortuneModel の型定義
export interface IFortuneModel extends MongooseModel<IFortune> {
  findByUserAndDate(
    userId: mongoose.Types.ObjectId | string,
    date: string
  ): Promise<IFortuneDocument | null>;
  
  findByUserAndDateRange(
    userId: mongoose.Types.ObjectId | string,
    startDate: string,
    endDate: string
  ): Promise<IFortuneDocument[]>;
  
  findLatestByUser(
    userId: mongoose.Types.ObjectId | string,
    limit?: number
  ): Promise<IFortuneDocument[]>;
}

// トランスフォーム設定
FortuneSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// インターフェース変換メソッド
FortuneSchema.methods.toInterface = function(): IFortune {
  const json = this.toJSON();
  return json as IFortune;
};

// モデル作成とエクスポート
const Fortune = mongoose.model<IFortuneDocument, IFortuneModel>('Fortune', FortuneSchema);

export default Fortune;