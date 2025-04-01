import { Subscription, PlanType } from '../entities/Subscription';
import { IRepository } from './IRepository';

/**
 * サブスクリプションリポジトリインターフェース
 * サブスクリプションデータの永続化操作を定義する
 */
interface ISubscriptionRepository extends IRepository<Subscription, string> {
  /**
   * チームIDによってサブスクリプションを検索する
   * @param teamId チームID
   * @returns サブスクリプションまたはnull
   */
  findByTeamId(teamId: string): Promise<Subscription | null>;
  
  /**
   * ユーザーIDによってサブスクリプションを検索する
   * @param userId ユーザーID
   * @returns サブスクリプションまたはnull
   */
  findByUserId(userId: string): Promise<Subscription | null>;
  
  /**
   * サブスクリプションのプランタイプを更新する
   * @param id サブスクリプションID
   * @param planType 新しいプランタイプ
   * @returns 更新されたサブスクリプションまたはnull
   */
  updatePlanType(id: string, planType: PlanType): Promise<Subscription | null>;
  
  /**
   * 使用量カウンターをインクリメントする
   * @param id サブスクリプションID
   * @param countType カウンタータイプ
   * @returns 操作の成功・失敗
   */
  incrementUsageCount(
    id: string, 
    countType: 'fortuneGenerationCount' | 'aiConversationCount'
  ): Promise<boolean>;
}

export { ISubscriptionRepository };