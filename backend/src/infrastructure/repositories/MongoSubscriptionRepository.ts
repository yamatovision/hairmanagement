import { injectable, inject } from 'tsyringe';
import mongoose from 'mongoose';
import ISubscriptionRepository from '../../domain/repositories/ISubscriptionRepository';
import { Subscription, PlanType, SubscriptionStatus, PlanInfo, AiModelType } from '../../domain/entities/Subscription';
import SubscriptionModel, { ISubscriptionDocument } from '../../domain/models/subscription.model';
import { BaseRepository } from './base/BaseRepository';

/**
 * MongoDBを使用したサブスクリプションリポジトリ実装
 * サブスクリプションデータをMongoDBに永続化する
 */
@injectable()
class MongoSubscriptionRepository extends BaseRepository<Subscription, string> implements ISubscriptionRepository {
  constructor(
    @inject('DatabaseConnection') connection: mongoose.Connection
  ) {
    super(SubscriptionModel);
  }

  /**
   * ドキュメントからエンティティへの変換
   * @param doc MongoDBドキュメント
   * @returns サブスクリプションエンティティ
   */
  protected toEntity(doc: ISubscriptionDocument): Subscription {
    return {
      id: doc._id.toString(),
      teamId: doc.teamId || '',  // teamIdがない場合は空文字列
      planType: doc.planType as PlanType,
      planInfo: {
        type: doc.planInfo.type as PlanType,
        name: doc.planInfo.name,
        description: doc.planInfo.description,
        fortuneGenModel: doc.planInfo.fortuneGenModel as AiModelType,
        aiConversationModel: doc.planInfo.aiConversationModel as AiModelType,
        features: doc.planInfo.features
      },
      status: doc.status as SubscriptionStatus,
      startDate: doc.startDate,
      renewalDate: doc.renewalDate,
      usageStats: doc.usageStats ? {
        fortuneGenerationCount: doc.usageStats.fortuneGenerationCount,
        aiConversationCount: doc.usageStats.aiConversationCount,
        lastUsedAt: doc.usageStats.lastUsedAt
      } : undefined
    };
  }

  /**
   * エンティティからドキュメントへの変換（作成用）
   * @param entity サブスクリプションエンティティ
   * @returns MongoDBドキュメント
   */
  protected toDocument(entity: Subscription): Partial<ISubscriptionDocument> {
    return {
      teamId: entity.teamId,
      planType: entity.planType,
      planInfo: {
        type: entity.planInfo.type,
        name: entity.planInfo.name,
        description: entity.planInfo.description,
        fortuneGenModel: entity.planInfo.fortuneGenModel,
        aiConversationModel: entity.planInfo.aiConversationModel,
        features: entity.planInfo.features
      },
      status: entity.status,
      startDate: entity.startDate,
      renewalDate: entity.renewalDate,
      usageStats: entity.usageStats ? {
        fortuneGenerationCount: entity.usageStats.fortuneGenerationCount,
        aiConversationCount: entity.usageStats.aiConversationCount,
        lastUsedAt: entity.usageStats.lastUsedAt
      } : undefined
    };
  }

  /**
   * チームIDによるサブスクリプション検索
   * @param teamId チームID
   * @returns サブスクリプションまたはnull
   */
  async findByTeamId(teamId: string): Promise<Subscription | null> {
    const doc = await this.model.findOne({ teamId });
    return doc ? this.toEntity(doc) : null;
  }

  /**
   * ユーザーIDによるサブスクリプション検索
   * @param userId ユーザーID
   * @returns サブスクリプションまたはnull
   */
  async findByUserId(userId: string): Promise<Subscription | null> {
    const doc = await this.model.findOne({ userId });
    return doc ? this.toEntity(doc) : null;
  }

  /**
   * プランタイプの更新
   * @param id サブスクリプションID
   * @param planType 新しいプランタイプ
   * @returns 更新されたサブスクリプションまたはnull
   */
  async updatePlanType(id: string, planType: PlanType): Promise<Subscription | null> {
    // まず既存のサブスクリプションを取得
    const subscription = await this.findById(id);
    if (!subscription) {
      return null;
    }

    // プラン情報を作成
    let planInfo: PlanInfo;

    switch (planType) {
      case PlanType.PREMIUM:
        planInfo = {
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
        break;
      case PlanType.STANDARD:
      default:
        planInfo = {
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

    // 更新するドキュメントを作成
    const updatedDoc = await this.model.findByIdAndUpdate(
      id,
      {
        $set: {
          planType,
          planInfo
        }
      },
      { new: true }
    );

    return updatedDoc ? this.toEntity(updatedDoc) : null;
  }

  /**
   * 使用量カウンターをインクリメント
   * @param id サブスクリプションID
   * @param countType カウンタータイプ
   * @returns 操作の成功・失敗
   */
  async incrementUsageCount(
    id: string,
    countType: 'fortuneGenerationCount' | 'aiConversationCount'
  ): Promise<boolean> {
    // $incオペレータを使用してカウンターをインクリメント
    const updateQuery: any = {
      $inc: {},
      $set: { 'usageStats.lastUsedAt': new Date() }
    };
    
    updateQuery.$inc[`usageStats.${countType}`] = 1;

    const result = await this.model.updateOne(
      { _id: id },
      updateQuery
    );

    return result.modifiedCount > 0;
  }
}

export default MongoSubscriptionRepository;