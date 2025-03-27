/**
 * フロントエンド用の型定義ファイル
 */

// 招待ロール型定義
export type InvitationRole = 'admin' | 'member';

// 招待ステータス型定義
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';

// 五行の基本要素
export type ElementType = '木' | '火' | '土' | '金' | '水';

// 陰陽
export type YinYangType = '陰' | '陽';

// 陰陽五行の属性情報
export type ElementalType = {
  mainElement: ElementType;
  secondaryElement?: ElementType;
  yinYang: YinYangType;
};

// 通知設定
export type NotificationSettingsType = {
  dailyFortune: boolean;
  promptQuestions: boolean;
  teamEvents: boolean;
  goalReminders: boolean;
  systemUpdates: boolean;
};

// ユーザー基本情報
export interface IUser {
  id: string;
  email: string;
  password?: string;
  name: string;
  birthDate: string;
  role: 'employee' | 'manager' | 'admin' | 'superadmin';
  profilePicture?: string;
  elementalType?: ElementalType;
  notificationSettings?: NotificationSettingsType;
  isActive: boolean;
  lastLoginAt?: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// 運勢情報
export interface IFortune {
  id: string;
  userId: string;
  date: string;
  dailyElement: ElementType;
  yinYang: YinYangType;
  overallLuck: number;
  careerLuck: number;
  relationshipLuck: number;
  creativeEnergyLuck: number;
  healthLuck: number;
  wealthLuck: number;
  description: string;
  advice: string;
  luckyColors?: string[];
  luckyDirections?: string[];
  compatibleElements?: ElementType[];
  incompatibleElements?: ElementType[];
  viewedAt?: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// 相性レベル
export enum CompatibilityLevel {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  NEUTRAL = 'neutral',
  CHALLENGING = 'challenging',
  DIFFICULT = 'difficult'
}

// APIパス定義
export const API_BASE_PATH = '/api/v1';

// レスポンス型定義
export type ApiResponse<T> = {
  status: number;
  data: T;
  message?: string;
};