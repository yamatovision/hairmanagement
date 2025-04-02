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

// サブスクリプションプランタイプ
export enum PlanType {
  STANDARD = 'standard',   // 標準プラン：運勢生成にSonnet、AI対話にHaiku
  PREMIUM = 'premium'      // プレミアムプラン：運勢生成とAI対話の両方にSonnet
}

// AIモデルタイプ
export enum AiModelType {
  HAIKU = 'haiku',     // 基本的なモデル（高速、低コスト）
  SONNET = 'sonnet'    // 高度なモデル（高品質、高コスト）
}

// サブスクリプション使用タイプ
export enum UsageType {
  FORTUNE_GENERATION = 'fortune_generation',  // 運勢生成
  AI_CONVERSATION = 'ai_conversation'         // AI対話
}

// サブスクリプションステータス
export enum SubscriptionStatus {
  ACTIVE = 'active',       // アクティブなサブスクリプション
  INACTIVE = 'inactive',   // 無効なサブスクリプション
  EXPIRED = 'expired'      // 期限切れのサブスクリプション
}

// サブスクリプションプラン情報
export interface PlanInfo {
  type: PlanType;                      // プランタイプ
  name: string;                        // プラン名
  description: string;                 // プラン説明
  fortuneGenModel: AiModelType;        // 運勢生成に使用するモデル
  aiConversationModel: AiModelType;    // AI対話に使用するモデル
  features: string[];                  // プラン特典リスト
}

// サブスクリプションインターフェース
export interface ISubscription {
  id: string;                          // サブスクリプションID
  teamId: string;                      // チームID
  planType: PlanType;                  // プランタイプ
  planInfo: PlanInfo;                  // プラン情報
  status: SubscriptionStatus;          // サブスクリプションステータス
  startDate: Date | string;            // 開始日時
  renewalDate: Date | string;          // 更新日時
  usageStats?: {                       // API使用量統計
    fortuneGenerationCount: number;    // 運勢生成回数
    aiConversationCount: number;       // AI対話回数
    lastUsedAt: Date | string;         // 最終使用日時
  };
  createdAt: string | Date;
  updatedAt: string | Date;
}

// 四柱情報の型定義
export interface IPillar {
  stem?: string;
  branch?: string;
  fullStemBranch?: string;
  hiddenStems?: string[];
}

export interface ISajuProfile {
  fourPillars?: {
    yearPillar?: IPillar;
    monthPillar?: IPillar;
    dayPillar?: IPillar;
    hourPillar?: IPillar;
  };
  mainElement?: string;
  secondaryElement?: string;
  yinYang?: string;
  tenGods?: Record<string, string>;
  branchTenGods?: Record<string, string>;
}

// ユーザー基本情報
export interface IUser {
  id: string;
  email: string;
  password?: string;
  name: string;
  birthDate: string;
  birthHour?: number;
  birthLocation?: string;
  role: 'employee' | 'manager' | 'admin' | 'superadmin';
  profilePicture?: string;
  elementalType?: ElementalType;
  elementalProfile?: ElementalType; // バックエンドとの互換性のため
  sajuProfile?: ISajuProfile;
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
  // エラーハンドリング用の追加フィールド
  error?: boolean;
  message?: string;
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