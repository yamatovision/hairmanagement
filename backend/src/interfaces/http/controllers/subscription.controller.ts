import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'tsyringe';
import { SubscriptionService } from '../../../application/services/subscription.service';
import { AiModelSelectorService } from '../../../application/services/ai-model-selector.service';
import { PlanType, SubscriptionStatus, UsageType } from '../../../domain/entities/Subscription';

/**
 * サブスクリプションコントローラー
 * サブスクリプション関連のHTTPリクエストを処理するコントローラー
 */
@injectable()
export class SubscriptionController {
  constructor(
    @inject(SubscriptionService) private subscriptionService: SubscriptionService,
    @inject(AiModelSelectorService) private aiModelSelectorService: AiModelSelectorService
  ) {}

  /**
   * チームのサブスクリプション情報を取得する
   * @param req リクエスト
   * @param res レスポンス
   * @param next 次のミドルウェア
   */
  async getTeamSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teamId = req.params.teamId;
      
      // チームIDの有効性チェック
      if (!teamId) {
        res.status(400).json({ message: 'チームIDが必要です' });
        return;
      }

      // サブスクリプション情報を取得
      const subscription = await this.subscriptionService.getTeamSubscription(teamId);
      
      if (!subscription) {
        res.status(404).json({ message: `チームID: ${teamId} のサブスクリプションが見つかりません` });
        return;
      }

      res.status(200).json(subscription);
    } catch (error) {
      next(error);
    }
  }

  /**
   * 新しいサブスクリプションを作成する
   * @param req リクエスト
   * @param res レスポンス
   * @param next 次のミドルウェア
   */
  async createSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { teamId, planType } = req.body;
      
      // 必須パラメータのチェック
      if (!teamId) {
        res.status(400).json({ message: 'チームIDが必要です' });
        return;
      }

      // プランタイプのバリデーション
      const validPlanType = this.validatePlanType(planType);
      
      // サブスクリプション作成
      const subscription = await this.subscriptionService.createSubscription(teamId, validPlanType);
      
      res.status(201).json(subscription);
    } catch (error) {
      if (error instanceof Error && error.message.includes('既存のサブスクリプション')) {
        res.status(409).json({ message: error.message });
        return;
      }
      next(error);
    }
  }

  /**
   * サブスクリプションプランを変更する
   * @param req リクエスト
   * @param res レスポンス
   * @param next 次のミドルウェア
   */
  async changePlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teamId = req.params.teamId;
      const { planType } = req.body;
      
      // パラメータのチェック
      if (!teamId || !planType) {
        res.status(400).json({ message: 'チームIDとプランタイプが必要です' });
        return;
      }

      // プランタイプのバリデーション
      const validPlanType = this.validatePlanType(planType);
      
      // プラン変更
      const subscription = await this.subscriptionService.changePlan(teamId, validPlanType);
      
      res.status(200).json(subscription);
    } catch (error) {
      if (error instanceof Error && error.message.includes('が見つかりません')) {
        res.status(404).json({ message: error.message });
        return;
      }
      next(error);
    }
  }

  /**
   * サブスクリプションステータスを更新する
   * @param req リクエスト
   * @param res レスポンス
   * @param next 次のミドルウェア
   */
  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teamId = req.params.teamId;
      const { status } = req.body;
      
      // パラメータのチェック
      if (!teamId || !status) {
        res.status(400).json({ message: 'チームIDとステータスが必要です' });
        return;
      }

      // ステータスのバリデーション
      const validStatus = this.validateStatus(status);
      
      // ステータス更新
      const subscription = await this.subscriptionService.updateStatus(teamId, validStatus);
      
      res.status(200).json(subscription);
    } catch (error) {
      if (error instanceof Error && error.message.includes('が見つかりません')) {
        res.status(404).json({ message: error.message });
        return;
      }
      next(error);
    }
  }

  /**
   * プランタイプのバリデーション
   * @param planType プランタイプ
   * @returns 有効なプランタイプ
   */
  private validatePlanType(planType: string): PlanType {
    if (Object.values(PlanType).includes(planType as PlanType)) {
      return planType as PlanType;
    }
    return PlanType.STANDARD; // デフォルト値
  }

  /**
   * ステータスのバリデーション
   * @param status ステータス
   * @returns 有効なステータス
   */
  private validateStatus(status: string): SubscriptionStatus {
    if (Object.values(SubscriptionStatus).includes(status as SubscriptionStatus)) {
      return status as SubscriptionStatus;
    }
    return SubscriptionStatus.ACTIVE; // デフォルト値
  }
  
  /**
   * 全てのサブスクリプションを取得する
   * @param req リクエスト
   * @param res レスポンス
   * @param next 次のミドルウェア
   */
  async getAllSubscriptions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const subscriptions = await this.subscriptionService.findAll();
      res.status(200).json(subscriptions);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * サブスクリプションIDで詳細を取得する
   * @param req リクエスト
   * @param res レスポンス
   * @param next 次のミドルウェア
   */
  async getSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id;
      
      if (!id) {
        res.status(400).json({ message: 'サブスクリプションIDが必要です' });
        return;
      }

      const subscription = await this.subscriptionService.findById(id);
      
      if (!subscription) {
        res.status(404).json({ message: `サブスクリプションID: ${id} が見つかりません` });
        return;
      }

      res.status(200).json(subscription);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * サブスクリプションを削除する
   * @param req リクエスト
   * @param res レスポンス
   * @param next 次のミドルウェア
   */
  async deleteSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id;
      
      if (!id) {
        res.status(400).json({ message: 'サブスクリプションIDが必要です' });
        return;
      }

      const result = await this.subscriptionService.delete(id);
      
      if (!result) {
        res.status(404).json({ message: `サブスクリプションID: ${id} が見つかりません` });
        return;
      }

      res.status(200).json({ message: 'サブスクリプションが正常に削除されました' });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * ユーザーのサブスクリプション情報を取得する
   * @param req リクエスト
   * @param res レスポンス
   * @param next 次のミドルウェア
   */
  async getUserSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId;
      
      // ユーザーIDの有効性チェック
      if (!userId) {
        res.status(400).json({ message: 'ユーザーIDが必要です' });
        return;
      }

      // サブスクリプション情報を取得
      const subscription = await this.subscriptionService.getUserSubscription(userId);
      
      if (!subscription) {
        res.status(404).json({ message: `ユーザーID: ${userId} のサブスクリプションが見つかりません` });
        return;
      }

      res.status(200).json(subscription);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * ユーザーのサブスクリプションを作成する
   * @param req リクエスト
   * @param res レスポンス
   * @param next 次のミドルウェア
   */
  async createUserSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, planType } = req.body;
      
      // 必須パラメータのチェック
      if (!userId) {
        res.status(400).json({ message: 'ユーザーIDが必要です' });
        return;
      }

      // プランタイプのバリデーション
      const validPlanType = this.validatePlanType(planType);
      
      // サブスクリプション作成
      const subscription = await this.subscriptionService.createUserSubscription(userId, validPlanType);
      
      res.status(201).json(subscription);
    } catch (error) {
      if (error instanceof Error && error.message.includes('既存のサブスクリプション')) {
        res.status(409).json({ message: error.message });
        return;
      }
      next(error);
    }
  }
  
  /**
   * AIモデルの選択情報を取得する
   * @param req リクエスト
   * @param res レスポンス
   * @param next 次のミドルウェア
   */
  async getAiModel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId;
      const context = req.query.context as string || 'ai_conversation';
      
      // ユーザーIDの有効性チェック
      if (!userId) {
        res.status(400).json({ message: 'ユーザーIDが必要です' });
        return;
      }

      // コンテキストのバリデーション
      const usageType = context === 'fortune_generation' ? 
        UsageType.FORTUNE_GENERATION : UsageType.AI_CONVERSATION;
      
      // AIモデルを選択
      const aiModel = await this.aiModelSelectorService.selectModelForUser(userId, usageType);
      
      res.status(200).json({ 
        model: aiModel,
        usageType,
        context
      });
    } catch (error) {
      next(error);
    }
  }
}