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
   * 運勢の詳細カテゴリ
   */
  categories: {
    /**
     * 仕事運 (0-100)
     */
    work: number;
    
    /**
     * チームワーク運 (0-100)
     */
    teamwork: number;
    
    /**
     * 健康運 (0-100)
     */
    health: number;
    
    /**
     * コミュニケーション運 (0-100)
     */
    communication: number;
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
   */
  advice: string;
}