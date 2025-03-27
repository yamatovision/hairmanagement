/**
 * 分析データモデル
 * ユーザーエンゲージメントとチーム分析のデータを扱う
 * 
 * 変更履歴:
 * - 2025/03/26: 初期実装 (AppGenius)
 * - 2025/03/27: TypeScript型互換性修正 (AI-2)
 */

import mongoose, { Schema } from 'mongoose';
import { IEngagementAnalytics, ITeamAnalytics } from '@shared';
import { MongooseDocument, MongooseModel, DocumentToInterface } from '../types/mongoose-extensions';

/**
 * ユーザーエンゲージメント分析のMongooseスキーマ
 * shared/index.tsのIEngagementAnalytics型に基づく
 */
const EngagementAnalyticsSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    period: {
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
    },
    metrics: {
      appUsage: {
        dailyFortuneViews: {
          type: Number,
          default: 0,
        },
        conversationCount: {
          type: Number,
          default: 0,
        },
        averageConversationLength: {
          type: Number,
          default: 0,
        },
        responseRate: {
          type: Number,
          default: 0,
          min: 0,
          max: 1,
        },
      },
      sentiment: {
        average: {
          type: Number,
          default: 0,
          min: -1,
          max: 1,
        },
        trend: {
          type: String,
          enum: ['improving', 'stable', 'declining', 'fluctuating'],
          default: 'stable',
        },
        topPositiveTopics: [String],
        topNegativeTopics: [String],
      },
      goals: {
        active: {
          type: Number,
          default: 0,
        },
        completed: {
          type: Number,
          default: 0,
        },
        progressRate: {
          type: Number,
          default: 0,
          min: 0,
          max: 1,
        },
      },
      teamEngagement: {
        contributionCount: {
          type: Number,
          default: 0,
        },
        mentorshipActivity: {
          type: Number,
          default: 0,
        },
        peerRecognition: {
          type: Number,
          default: 0,
        },
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

/**
 * チーム分析のMongooseスキーマ
 * shared/index.tsのITeamAnalytics型に基づく
 */
const TeamAnalyticsSchema = new Schema(
  {
    period: {
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
    },
    overallEngagement: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    responseRate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    sentimentDistribution: {
      positive: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
      neutral: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
      negative: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
    },
    topConcerns: [
      {
        topic: {
          type: String,
          required: true,
        },
        frequency: {
          type: Number,
          required: true,
        },
        averageSentiment: {
          type: Number,
          required: true,
          min: -1,
          max: 1,
        },
      },
    ],
    topStrengths: [
      {
        topic: {
          type: String,
          required: true,
        },
        frequency: {
          type: Number,
          required: true,
        },
        averageSentiment: {
          type: Number,
          required: true,
          min: -1,
          max: 1,
        },
      },
    ],
    followUpRecommendations: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        urgency: {
          type: String,
          enum: ['low', 'medium', 'high'],
          required: true,
        },
        reason: {
          type: String,
          required: true,
        },
        suggestedApproach: String,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// インターフェース定義（ドキュメント型）
export interface EngagementAnalyticsDocument extends MongooseDocument<IEngagementAnalytics>, DocumentToInterface {
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamAnalyticsDocument extends MongooseDocument<ITeamAnalytics>, DocumentToInterface {
  createdAt: Date;
  updatedAt: Date;
}

// モデル型定義
export interface EngagementAnalyticsModel extends MongooseModel<IEngagementAnalytics> {}
export interface TeamAnalyticsModel extends MongooseModel<ITeamAnalytics> {}

// インターフェース変換メソッドを追加
EngagementAnalyticsSchema.methods.toInterface = function(): IEngagementAnalytics {
  const json = this.toJSON();
  return json as IEngagementAnalytics;
};

TeamAnalyticsSchema.methods.toInterface = function(): ITeamAnalytics {
  const json = this.toJSON();
  return json as ITeamAnalytics;
};

// モデル作成
export const EngagementAnalytics = mongoose.model<
  EngagementAnalyticsDocument, 
  EngagementAnalyticsModel
>('EngagementAnalytics', EngagementAnalyticsSchema);

export const TeamAnalytics = mongoose.model<
  TeamAnalyticsDocument, 
  TeamAnalyticsModel
>('TeamAnalytics', TeamAnalyticsSchema);

export default {
  EngagementAnalytics,
  TeamAnalytics,
};