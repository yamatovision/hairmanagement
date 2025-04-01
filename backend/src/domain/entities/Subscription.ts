import { Entity } from './Entity';

/**
 * サブスクリプションプランタイプ
 * 利用可能なサブスクリプションプランの種類
 */
export enum PlanType {
  STANDARD = 'standard',   // 標準プラン：運勢生成にSonnet、AI対話にHaiku
  PREMIUM = 'premium'      // プレミアムプラン：運勢生成とAI対話の両方にSonnet
}

/**
 * AIモデルタイプ
 * 使用可能なClaudeモデルの種類
 */
export enum AiModelType {
  HAIKU = 'haiku',     // 基本的なモデル（高速、低コスト）
  SONNET = 'sonnet'    // 高度なモデル（高品質、高コスト）
}

/**
 * サブスクリプション使用タイプ
 * AIモデルの使用目的を表す
 */
export enum UsageType {
  FORTUNE_GENERATION = 'fortune_generation',  // 運勢生成
  AI_CONVERSATION = 'ai_conversation'         // AI対話
}

/**
 * サブスクリプションステータス
 * サブスクリプションの現在の状態
 */
export enum SubscriptionStatus {
  ACTIVE = 'active',       // アクティブなサブスクリプション
  INACTIVE = 'inactive',   // 無効なサブスクリプション
  EXPIRED = 'expired'      // 期限切れのサブスクリプション
}

/**
 * サブスクリプションプラン情報
 * プランに関する詳細情報
 */
export interface PlanInfo {
  type: PlanType;                      // プランタイプ
  name: string;                        // プラン名
  description: string;                 // プラン説明
  fortuneGenModel: AiModelType;        // 運勢生成に使用するモデル
  aiConversationModel: AiModelType;    // AI対話に使用するモデル
  features: string[];                  // プラン特典リスト
}

/**
 * サブスクリプションエンティティ
 * チームまたはユーザーのサブスクリプション情報を表すドメインエンティティ
 */
export interface Subscription extends Entity<string> {
  /**
   * サブスクリプションを所有するチームのID
   * チームサブスクリプションの場合に設定、ユーザーサブスクリプションの場合は空文字列
   */
  teamId: string;
  
  /**
   * サブスクリプションを所有するユーザーのID
   * ユーザーサブスクリプションの場合に設定、チームサブスクリプションの場合は未定義
   */
  userId?: string;
  
  /**
   * サブスクリプションプランタイプ
   */
  planType: PlanType;
  
  /**
   * サブスクリプションの詳細情報
   */
  planInfo: PlanInfo;
  
  /**
   * サブスクリプションの現在のステータス
   */
  status: SubscriptionStatus;
  
  /**
   * サブスクリプションの開始日
   */
  startDate: Date;
  
  /**
   * サブスクリプションの更新日
   */
  renewalDate: Date;
  
  /**
   * API使用量統計
   */
  usageStats?: {
    fortuneGenerationCount: number;   // 運勢生成回数
    aiConversationCount: number;      // AI対話回数
    lastUsedAt: Date;                 // 最終使用日時
  };
}