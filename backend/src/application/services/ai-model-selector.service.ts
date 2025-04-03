import { inject, injectable } from 'tsyringe';
import { AiModelType, UsageType } from '../../domain/entities/Subscription';
import { SubscriptionService } from './subscription.service';
import { logger } from '../../utils/logger.util';

/**
 * AIモデルセレクターサービス
 * サブスクリプションタイプに基づいて適切なAIモデルを選択する
 */
@injectable()
export class AiModelSelectorService {
  constructor(
    @inject(SubscriptionService) private subscriptionService: SubscriptionService
  ) {}
  
  /**
   * ユーザーIDに基づいて適切なAIモデルを選択する
   * @param userId ユーザーID
   * @param usageType 使用タイプ
   * @returns モデルタイプ
   */
  async selectModelForUser(userId: string, usageType: UsageType): Promise<AiModelType> {
    try {
      // ユーザーのサブスクリプションを取得
      const subscription = await this.subscriptionService.getUserSubscription(userId);
      
      // サブスクリプションが存在しない、または無効な場合はデフォルトモデルを返す
      if (!subscription || subscription.status !== 'active') {
        logger.info(`ユーザー ${userId} のアクティブなサブスクリプションが見つかりません。デフォルトモデルを使用します。`);
        return this.getDefaultModel(usageType);
      }
      
      // 使用状況を記録
      await this.subscriptionService.recordUsage(userId, 
        usageType === UsageType.FORTUNE_GENERATION ? 'fortuneGenerationCount' : 'aiConversationCount'
      );
      
      // 使用タイプに応じて適切なモデルを選択
      if (usageType === UsageType.FORTUNE_GENERATION) {
        return subscription.planInfo.fortuneGenModel;
      } else {
        return subscription.planInfo.aiConversationModel;
      }
    } catch (error) {
      logger.error(`AIモデル選択エラー: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return this.getDefaultModel(usageType);
    }
  }
  
  /**
   * チームIDに基づいて適切なAIモデルを選択する
   * @param teamId チームID
   * @param usageType 使用タイプ
   * @returns モデルタイプ
   */
  async selectModelForTeam(teamId: string, usageType: UsageType): Promise<AiModelType> {
    try {
      // チームのサブスクリプションを取得
      const subscription = await this.subscriptionService.getTeamSubscription(teamId);
      
      // サブスクリプションが存在しない、または無効な場合はデフォルトモデルを返す
      if (!subscription || subscription.status !== 'active') {
        logger.info(`チーム ${teamId} のアクティブなサブスクリプションが見つかりません。デフォルトモデルを使用します。`);
        return this.getDefaultModel(usageType);
      }
      
      // 使用状況を記録
      await this.subscriptionService.recordUsage(teamId, 
        usageType === UsageType.FORTUNE_GENERATION ? 'fortuneGenerationCount' : 'aiConversationCount'
      );
      
      // 使用タイプに応じて適切なモデルを選択
      if (usageType === UsageType.FORTUNE_GENERATION) {
        return subscription.planInfo.fortuneGenModel;
      } else {
        return subscription.planInfo.aiConversationModel;
      }
    } catch (error) {
      logger.error(`AIモデル選択エラー: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return this.getDefaultModel(usageType);
    }
  }
  
  /**
   * 運勢生成用のAIモデルを選択する
   * サブスクリプションタイプに依存せずに最適なモデルを返す
   * @returns モデルタイプ
   */
  async selectModelForFortune(): Promise<AiModelType> {
    // 運勢生成には常に高品質なモデルを使用
    return AiModelType.SONNET;
  }
  
  /**
   * 使用タイプに基づくデフォルトモデルを返す
   * @param usageType 使用タイプ
   * @returns モデルタイプ
   */
  private getDefaultModel(usageType: UsageType): AiModelType {
    // デフォルトモデル: 運勢生成には高品質なモデル、AI会話には基本モデル
    return usageType === UsageType.FORTUNE_GENERATION ? 
      AiModelType.SONNET : AiModelType.HAIKU;
  }
}