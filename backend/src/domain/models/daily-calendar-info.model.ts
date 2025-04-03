/**
 * 日次カレンダー情報モデル
 * 日付ごとの干支情報を保存するためのモデル
 * 
 * 変更履歴:
 * - 2025/04/03: 初期実装 (Claude)
 */

import mongoose, { Schema } from 'mongoose';

// 四柱情報の柱（Pillar）スキーマ
const pillarSchema = new Schema({
  stem: {
    type: String,
    required: true
  },
  branch: {
    type: String,
    required: true
  },
  element: {
    type: String,
    enum: ['木', '火', '土', '金', '水'],
    required: true
  },
  fullStemBranch: String,
  hiddenStems: [String]
}, { _id: false });

// 日次カレンダー情報スキーマ
const dailyCalendarInfoSchema: Schema = new Schema(
  {
    date: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function(v: string) {
          return /^\d{4}-\d{2}-\d{2}$/.test(v); // YYYY-MM-DD形式
        },
        message: (props: { value: string }) => `${props.value}は有効な日付形式ではありません。YYYY-MM-DD形式で入力してください。`
      }
    },
    // 四柱情報
    yearPillar: {
      type: pillarSchema,
      required: true
    },
    monthPillar: {
      type: pillarSchema,
      required: true
    },
    dayPillar: {
      type: pillarSchema,
      required: true
    },
    hourPillar: {
      type: pillarSchema
    },
    // その日の五行属性
    mainElement: {
      type: String,
      enum: ['木', '火', '土', '金', '水'],
      required: true
    },
    dayYinYang: {
      type: String,
      enum: ['陰', '陽'],
      required: true
    }
  },
  {
    timestamps: true
  }
);

// 日次カレンダー情報ドキュメントのインターフェース
export interface IDailyCalendarInfoDocument extends mongoose.Document {
  date: string;
  // 四柱情報
  yearPillar: {
    stem: string;
    branch: string;
    element: string;
    fullStemBranch?: string;
    hiddenStems?: string[];
  };
  monthPillar: {
    stem: string;
    branch: string;
    element: string;
    fullStemBranch?: string;
    hiddenStems?: string[];
  };
  dayPillar: {
    stem: string;
    branch: string;
    element: string;
    fullStemBranch?: string;
    hiddenStems?: string[];
  };
  hourPillar?: {
    stem: string;
    branch: string;
    element: string;
    fullStemBranch?: string;
    hiddenStems?: string[];
  };
  mainElement: string;  // その日の主要五行属性
  dayYinYang: string;   // その日の陰陽
  createdAt: Date;
  updatedAt: Date;
}

// 日次カレンダー情報モデルのインターフェース（静的メソッド用）
export interface IDailyCalendarInfoModel extends mongoose.Model<IDailyCalendarInfoDocument> {
  findByDate(date: string): Promise<IDailyCalendarInfoDocument | null>;
  findByDateRange(startDate: string, endDate: string): Promise<IDailyCalendarInfoDocument[]>;
}

// 日付による検索メソッド
dailyCalendarInfoSchema.statics.findByDate = function(date: string): Promise<IDailyCalendarInfoDocument | null> {
  return this.findOne({ date }).exec();
};

// 日付範囲による検索メソッド
dailyCalendarInfoSchema.statics.findByDateRange = function(
  startDate: string,
  endDate: string
): Promise<IDailyCalendarInfoDocument[]> {
  return this.find({
    date: { $gte: startDate, $lte: endDate }
  })
    .sort({ date: 1 })
    .exec();
};

// トランスフォーム設定でidとして_idを提供
dailyCalendarInfoSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// モデル作成とエクスポート
const DailyCalendarInfoModel = mongoose.model<IDailyCalendarInfoDocument, IDailyCalendarInfoModel>(
  'DailyCalendarInfo',
  dailyCalendarInfoSchema
);

export default DailyCalendarInfoModel;