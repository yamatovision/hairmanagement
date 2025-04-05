/**
 * 日次カレンダー情報リポジトリのインターフェース
 * 
 * 作成日: 2025/04/05
 * 作成者: Claude
 */

import { IRepository } from './IRepository';
import { IDailyCalendarInfoDocument } from '../models/daily-calendar-info.model';
import { Result } from '../../utils/result.util';

/**
 * 日次カレンダー情報のリポジトリインターフェース
 */
export interface IDailyCalendarInfoRepository extends IRepository<IDailyCalendarInfoDocument, string> {
  /**
   * 指定された日付の日次カレンダー情報を取得
   * @param date 日付（YYYY-MM-DD形式）
   * @returns 日次カレンダー情報
   */
  findByDate(date: string): Promise<Result<IDailyCalendarInfoDocument | null, Error>>;
  
  /**
   * 指定された日付の範囲内の日次カレンダー情報を取得
   * @param startDate 開始日（YYYY-MM-DD形式）
   * @param endDate 終了日（YYYY-MM-DD形式）
   * @returns 日次カレンダー情報の配列
   */
  findByDateRange(startDate: string, endDate: string): Promise<Result<IDailyCalendarInfoDocument[], Error>>;
  
  /**
   * 指定された日付の日次カレンダー情報を作成または更新
   * @param data 日次カレンダー情報
   * @returns 作成または更新された日次カレンダー情報
   */
  createOrUpdateByDate(data: Partial<IDailyCalendarInfoDocument>): Promise<Result<IDailyCalendarInfoDocument, Error>>;
}