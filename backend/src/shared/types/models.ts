/**
 * モデル関連の型定義
 * アプリケーションのデータモデルに関する型定義
 * 
 * 作成日: 2025/04/05
 */

import { ElementType, YinYangType } from './saju/core';
import { BaseModelType } from './core';

// ユーザー関連型定義
export interface IUser extends BaseModelType {
  email: string;
  password?: string; // APIレスポンスには含まれない
  name: string;
  birthDate: string; // YYYY-MM-DD形式
  role: 'employee' | 'manager' | 'admin';
  profilePicture?: string;
  elementalType?: ElementalType;
  notificationSettings?: NotificationSettingsType;
  isActive: boolean;
  lastLoginAt?: string | Date; // mongooseとの互換性のため両方サポート
}

export type ElementalType = {
  mainElement: ElementType;
  secondaryElement?: ElementType;
  yinYang: YinYangType; // 「陰」または「陽」
};

export type NotificationSettingsType = {
  dailyFortune: boolean;
  promptQuestions: boolean;
  teamEvents: boolean;
  goalReminders: boolean;
  systemUpdates: boolean;
};

export type UserRegistrationRequest = {
  email: string;
  password: string;
  name: string;
  birthDate: string;
  role?: 'employee' | 'manager' | 'admin';
};

export type UserLoginRequest = {
  email: string;
  password: string;
};

export type UserLoginResponse = {
  user: Omit<IUser, 'password'>;
  token: string;
  refreshToken: string;
};

export type UserUpdateRequest = Partial<Omit<IUser, 'id' | 'createdAt' | 'updatedAt' | 'password'>>;

// 運勢関連型定義
export interface IFortune extends BaseModelType {
  userId: string;
  date: string; // YYYY-MM-DD形式
  dailyElement: ElementType;
  yinYang: YinYangType;
  overallLuck: number; // 1-100のスケール
  careerLuck: number;
  relationshipLuck: number;
  creativeEnergyLuck: number;
  healthLuck: number;
  wealthLuck: number;
  description: string;
  advice: string;
  // AIで生成されたアドバイス
  aiGeneratedAdvice?: {
    advice: string;
    luckyPoints?: {
      color: string;
      items: string[];
      number: number;
      action: string;
    }
  };
  // 四柱推命との連携データ
  sajuData?: {
    dayMaster: string;
    dayElement: ElementType;
    tenGod: string;
    branchTenGod: string;
    compatibility: number;
  };
  luckyColors?: string[];
  luckyDirections?: string[];
  compatibleElements?: ElementType[];
  incompatibleElements?: ElementType[];
  viewedAt?: string | Date;
}

export type FortuneQueryRequest = {
  startDate?: string;
  endDate?: string;
  userId?: string;
};

// 会話関連型定義
export interface IConversation extends BaseModelType {
  userId: string;
  messages: IMessage[];
  context?: {
    fortuneId?: string;
    relatedGoalId?: string;
    teamRelated?: boolean;
    sentimentScore?: number; // -1.0〜1.0のスケール
  };
  isArchived: boolean;
}

export interface IMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: string | Date;
  isPromptQuestion?: boolean;
  promptCategory?: 'growth' | 'team' | 'career' | 'organization';
}

export type SendMessageRequest = {
  conversationId?: string; // 新規対話の場合は空
  content: string;
  context?: {
    fortuneId?: string;
    relatedGoalId?: string;
  };
};

export type GeneratePromptQuestionRequest = {
  userId: string;
  fortuneId?: string;
  category?: 'growth' | 'team' | 'career' | 'organization';
};

// 目標関連型定義
export interface IGoal extends BaseModelType {
  userId: string;
  title: string;
  description?: string;
  targetDate?: string | Date;
  category: 'skill' | 'career' | 'personal' | 'team';
  priority: 'low' | 'medium' | 'high';
  status: 'not_started' | 'in_progress' | 'completed' | 'canceled';
  progress: number; // 0-100のパーセンテージ
  milestones?: IMilestone[];
  relatedElement?: ElementType;
  notes?: string;
}

export interface IMilestone {
  id: string;
  title: string;
  dueDate?: string | Date;
  isCompleted: boolean;
  completedAt?: string | Date;
}

export type GoalCreateRequest = Omit<IGoal, 'id' | 'createdAt' | 'updatedAt' | '_id'>;
export type GoalUpdateRequest = Partial<Omit<IGoal, 'id' | '_id' | 'userId' | 'createdAt' | 'updatedAt'>>;

// チーム関連型定義
export interface ITeam extends BaseModelType {
  name: string;
  description?: string;
  ownerId: string;
  admins: string[];
  members: string[];
  isActive: boolean;
}

export interface ITeamContribution extends BaseModelType {
  userId: string;
  title: string;
  description: string;
  date: string | Date;
  category: 'event' | 'project' | 'mentorship' | 'innovation' | 'support';
  impact: 'low' | 'medium' | 'high';
  recognizedBy?: string[]; // ユーザーID配列
  attachments?: string[]; // 添付ファイルURL
}

// 招待ステータス
export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired'
}

// 招待ロール
export enum InvitationRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  EMPLOYEE = 'employee'
}

export interface IMentorship extends BaseModelType {
  mentorId: string;
  menteeId: string;
  startDate: string | Date;
  endDate?: string | Date;
  focus: string;
  status: 'active' | 'completed' | 'paused';
  sessions?: {
    date: string | Date;
    notes?: string;
    rating?: number; // 1-5のスケール
  }[];
  goals?: string[]; // 目標ID配列
}

// 分析関連型定義
export interface IEngagementAnalytics extends BaseModelType {
  userId: string;
  period: {
    startDate: string | Date;
    endDate: string | Date;
  };
  metrics: {
    appUsage: {
      dailyFortuneViews: number;
      conversationCount: number;
      averageConversationLength: number;
      responseRate: number; // 0-1のスケール
    };
    sentiment: {
      average: number; // -1.0〜1.0のスケール
      trend: 'improving' | 'stable' | 'declining' | 'fluctuating';
      topPositiveTopics?: string[];
      topNegativeTopics?: string[];
    };
    goals: {
      active: number;
      completed: number;
      progressRate: number; // 0-1のスケール
    };
    teamEngagement?: {
      contributionCount: number;
      mentorshipActivity: number;
      peerRecognition: number;
    };
  };
}

export interface ITeamAnalytics extends BaseModelType {
  period: {
    startDate: string | Date;
    endDate: string | Date;
  };
  overallEngagement: number; // 0-100のスケール
  responseRate: number; // 0-100のパーセンテージ
  sentimentDistribution: {
    positive: number; // パーセンテージ
    neutral: number;
    negative: number;
  };
  topConcerns: Array<{
    topic: string;
    frequency: number;
    averageSentiment: number;
  }>;
  topStrengths: Array<{
    topic: string;
    frequency: number;
    averageSentiment: number;
  }>;
  followUpRecommendations: Array<{
    userId: string;
    urgency: 'low' | 'medium' | 'high';
    reason: string;
    suggestedApproach?: string;
  }>;
}