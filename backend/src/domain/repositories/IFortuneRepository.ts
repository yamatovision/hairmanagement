import { IRepository } from './IRepository';
import { Fortune } from '../entities/Fortune';

/**
 * 運勢リポジトリインターフェース
 * 運勢ドメインエンティティに特化したリポジトリ操作を定義
 */
export interface IFortuneRepository extends IRepository<Fortune, string> {
  /**
   * ユーザーIDと日付で運勢を検索する
   * @param userId ユーザーID
   * @param date 日付
   * @returns 見つかった運勢またはnull
   */
  findByUserIdAndDate(userId: string, date: Date): Promise<Fortune | null>;
  
  /**
   * ユーザーIDに基づいて運勢履歴を取得する
   * @param userId ユーザーID
   * @param limit 取得する最大件数（オプション）
   * @returns ユーザーの運勢履歴
   */
  findHistoryByUserId(userId: string, limit?: number): Promise<Fortune[]>;
  
  /**
   * 特定の日付の全ユーザーの運勢を取得する
   * @param date 日付
   * @returns 指定日付の全ユーザーの運勢
   */
  findAllByDate(date: Date): Promise<Fortune[]>;
  
  /**
   * 特定のスコア範囲内の運勢を検索する
   * @param minScore 最小スコア
   * @param maxScore 最大スコア
   * @param date 特定の日付（オプション）
   * @returns スコア範囲内の運勢リスト
   */
  findByScoreRange(minScore: number, maxScore: number, date?: Date): Promise<Fortune[]>;
  
  /**
   * 運勢を閲覧済みとしてマークする
   * @param fortuneId 運勢ID
   * @returns 操作が成功したかどうか
   */
  markAsViewed(fortuneId: string): Promise<boolean>;
}