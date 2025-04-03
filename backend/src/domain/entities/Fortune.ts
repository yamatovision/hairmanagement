import { Entity } from './Entity';

/**
 * 運勢スコアの評価
 */
export enum FortuneRating {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  NEUTRAL = 'neutral',
  CAUTION = 'caution',
  POOR = 'poor'
}

/**
 * 五行の要素タイプ
 */
export type ElementType = '木' | '火' | '土' | '金' | '水';

/**
 * 陰陽の種類
 */
export type YinYangType = '陰' | '陽';

/**
 * 運勢エンティティ
 * ユーザーの日次運勢予測を表すドメインエンティティ
 */
export interface Fortune extends Entity<string> {
  /**
   * 関連するユーザーID
   */
  userId: string;
  
  /**
   * 運勢の日付
   */
  date: Date;
  
  /**
   * 総合運勢スコア (0-100)
   */
  overallScore: number;
  
  /**
   * 運勢の評価 (excellent, good, neutral, caution, poor)
   */
  rating: FortuneRating;
  
  /**
   * 運勢の詳細カテゴリ（削除済み 2025/4/3）
   * @deprecated 分野別カテゴリースコアは削除されました
   */
  categories?: {
    work?: number;
    teamwork?: number;
    health?: number;
    communication?: number;
  };
  
  /**
   * 今日のラッキーアイテム
   */
  luckyItems?: string[];
  
  /**
   * 陰陽バランス
   */
  yinYangBalance?: {
    yin: number;
    yang: number;
  };
  
  /**
   * アドバイスメッセージ
   * 文字列またはオブジェクト形式
   */
  advice: string | Record<string, any>;
  
  /**
   * AI生成運勢アドバイス
   * 構造化された運勢情報
   */
  aiGeneratedAdvice?: {
    summary: string;
    personalAdvice: string;
    teamAdvice: string;
    luckyPoints?: {
      color: string;
      items: string[];
      number: number;
      action: string;
    }
  };
  
  /**
   * MongoDBスキーマとの互換性のための追加フィールド
   */
  
  /**
   * 日の五行属性
   */
  dailyElement?: ElementType;
  
  /**
   * 陰陽属性
   */
  yinYang?: YinYangType;
  
  /**
   * キャリア運 (1-100)
   */
  careerLuck?: number;
  
  /**
   * 人間関係運 (1-100)
   */
  relationshipLuck?: number;
  
  /**
   * 創造性エネルギー運 (1-100)
   */
  creativeEnergyLuck?: number;
  
  /**
   * 健康運 (1-100)
   */
  healthLuck?: number;
  
  /**
   * 財運 (1-100)
   */
  wealthLuck?: number;
  
  /**
   * 運勢の説明文
   */
  description?: string;
  
  /**
   * ラッキーカラー
   */
  luckyColors?: string[];
  
  /**
   * ラッキー方角
   */
  luckyDirections?: string[];
  
  /**
   * 相性の良い五行
   */
  compatibleElements?: ElementType[];
  
  /**
   * 相性の悪い五行
   */
  incompatibleElements?: ElementType[];
}