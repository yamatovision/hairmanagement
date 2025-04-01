import { inject, injectable } from 'tsyringe';
import ISubscriptionRepository from '../../domain/repositories/ISubscriptionRepository';
import { Subscription, PlanType, SubscriptionStatus, PlanInfo, AiModelType } from '../../domain/entities/Subscription';

/**
 * サブスクリプションサービス
 * サブスクリプションの管理と操作を行うサービスクラス
 */
@injectable()
export class SubscriptionService {
  constructor(
    @inject('ISubscriptionRepository') private subscriptionRepository: ISubscriptionRepository
  ) {}
  
  /**
   * すべてのサブスクリプションを取得
   * @returns サブスクリプションの配列
   */
  async findAll(): Promise<Subscription[]> {
    return this.subscriptionRepository.findAll();
  }
  
  /**
   * IDでサブスクリプションを検索
   * @param id サブスクリプションID
   * @returns サブスクリプションまたはnull
   */
  async findById(id: string): Promise<Subscription | null> {
    return this.subscriptionRepository.findById(id);
  }
  
  /**
   * サブスクリプションを削除
   * @param id サブスクリプションID
   * @returns 削除の成功・失敗
   */
  async delete(id: string): Promise<boolean> {
    return this.subscriptionRepository.delete(id);
  }

  /**
   * 新しいサブスクリプションを作成する
   * @param teamId チームID
   * @param planType プランタイプ
   * @returns 作成されたサブスクリプション
   */
  async createSubscription(teamId: string, planType: PlanType = PlanType.STANDARD): Promise<Subscription> {
    // 既存のサブスクリプションをチェック
    const existingSubscription = await this.subscriptionRepository.findByTeamId(teamId);
    if (existingSubscription) {
      throw new Error(`チームID: ${teamId} には既存のサブスクリプションがあります`);
    }

    // プラン情報を作成
    const planInfo = this.createPlanInfo(planType);

    // 更新日を計算（30日後）
    const startDate = new Date();
    const renewalDate = new Date(startDate);
    renewalDate.setDate(renewalDate.getDate() + 30);

    // 新しいサブスクリプションエンティティを作成
    const newSubscription: Subscription = {
      id: '', // リポジトリで自動生成される
      teamId,
      planType,
      planInfo,
      status: SubscriptionStatus.ACTIVE,
      startDate,
      renewalDate,
      usageStats: {
        fortuneGenerationCount: 0,
        aiConversationCount: 0,
        lastUsedAt: new Date()
      }
    };

    // リポジトリに保存
    return this.subscriptionRepository.create(newSubscription);
  }

  /**
   * チームのサブスクリプションを取得する
   * @param teamId チームID
   * @returns サブスクリプションまたはnull
   */
  async getTeamSubscription(teamId: string): Promise<Subscription | null> {
    return this.subscriptionRepository.findByTeamId(teamId);
  }
  
  /**
   * ユーザーのサブスクリプションを取得する
   * @param userId ユーザーID
   * @returns サブスクリプションまたはnull
   */
  async getUserSubscription(userId: string): Promise<Subscription | null> {
    return this.subscriptionRepository.findByUserId(userId);
  }
  
  /**
   * ユーザーのサブスクリプションを作成する
   * @param userId ユーザーID
   * @param planType プランタイプ
   * @returns 作成されたサブスクリプション
   */
  async createUserSubscription(userId: string, planType: PlanType = PlanType.STANDARD): Promise<Subscription> {
    // 既存のサブスクリプションをチェック
    const existingSubscription = await this.subscriptionRepository.findByUserId(userId);
    if (existingSubscription) {
      throw new Error(`ユーザーID: ${userId} には既存のサブスクリプションがあります`);
    }

    // プラン情報を作成
    const planInfo = this.createPlanInfo(planType);

    // 更新日を計算（30日後）
    const startDate = new Date();
    const renewalDate = new Date(startDate);
    renewalDate.setDate(renewalDate.getDate() + 30);

    // 新しいサブスクリプションエンティティを作成
    const newSubscription: Subscription = {
      id: '', // リポジトリで自動生成される
      teamId: '', // ユーザーサブスクリプションの場合は空
      userId: userId, // ユーザーIDを追加
      planType,
      planInfo,
      status: SubscriptionStatus.ACTIVE,
      startDate,
      renewalDate,
      usageStats: {
        fortuneGenerationCount: 0,
        aiConversationCount: 0,
        lastUsedAt: new Date()
      }
    };

    // リポジトリに保存
    return this.subscriptionRepository.create(newSubscription);
  }

  /**
   * サブスクリプションプランを変更する
   * @param teamId チームID
   * @param newPlanType 新しいプランタイプ
   * @returns 更新されたサブスクリプション
   */
  async changePlan(teamId: string, newPlanType: PlanType): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findByTeamId(teamId);
    if (!subscription) {
      throw new Error(`チームID: ${teamId} のサブスクリプションが見つかりません`);
    }

    // 既に同じプランの場合はそのまま返す
    if (subscription.planType === newPlanType) {
      return subscription;
    }

    // プランを変更
    const updatedSubscription = await this.subscriptionRepository.updatePlanType(subscription.id, newPlanType);
    if (!updatedSubscription) {
      throw new Error(`サブスクリプションの更新に失敗しました: ${subscription.id}`);
    }

    return updatedSubscription;
  }

  /**
   * サブスクリプションのステータスを更新する
   * @param teamId チームID
   * @param newStatus 新しいステータス
   * @returns 更新されたサブスクリプション
   */
  async updateStatus(teamId: string, newStatus: SubscriptionStatus): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findByTeamId(teamId);
    if (!subscription) {
      throw new Error(`チームID: ${teamId} のサブスクリプションが見つかりません`);
    }

    // 既に同じステータスの場合はそのまま返す
    if (subscription.status === newStatus) {
      return subscription;
    }

    // ステータスを変更
    const updatedSubscription = await this.subscriptionRepository.update(subscription.id, {
      ...subscription,
      status: newStatus
    });

    if (!updatedSubscription) {
      throw new Error(`サブスクリプションステータスの更新に失敗しました: ${subscription.id}`);
    }

    return updatedSubscription;
  }

  /**
   * API使用量を記録する
   * @param teamId チームID
   * @param usageType 使用タイプ
   * @returns 更新操作の成功失敗
   */
  async recordUsage(teamId: string, usageType: 'fortuneGenerationCount' | 'aiConversationCount'): Promise<boolean> {
    const subscription = await this.subscriptionRepository.findByTeamId(teamId);
    if (!subscription) {
      throw new Error(`チームID: ${teamId} のサブスクリプションが見つかりません`);
    }

    // ステータスがアクティブでない場合はエラー
    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new Error(`チームID: ${teamId} のサブスクリプションはアクティブではありません`);
    }

    // 使用量をインクリメント
    return this.subscriptionRepository.incrementUsageCount(subscription.id, usageType);
  }

  /**
   * プランタイプからプラン情報を作成する
   * @param planType プランタイプ
   * @returns プラン情報
   */
  private createPlanInfo(planType: PlanType): PlanInfo {
    switch (planType) {
      case PlanType.PREMIUM:
        return {
          type: PlanType.PREMIUM,
          name: 'プレミアムプラン',
          description: '高品質な運勢生成とAI対話を提供するプレミアムプラン',
          fortuneGenModel: AiModelType.SONNET,
          aiConversationModel: AiModelType.SONNET,
          features: [
            '運勢生成にSonnetモデルを使用',
            'AI対話にSonnetモデルを使用',
            '高品質な運勢分析とアドバイス',
            '詳細な五行相性分析',
            '優先サポート'
          ]
        };
      case PlanType.STANDARD:
      default:
        return {
          type: PlanType.STANDARD,
          name: 'スタンダードプラン',
          description: '運勢生成と基本的なAI対話を提供する標準プラン',
          fortuneGenModel: AiModelType.SONNET,
          aiConversationModel: AiModelType.HAIKU,
          features: [
            '運勢生成にSonnetモデルを使用',
            'AI対話にHaikuモデルを使用',
            '基本的な運勢分析とアドバイス',
            'チームメンバーの基本相性情報'
          ]
        };
    }
  }
}
