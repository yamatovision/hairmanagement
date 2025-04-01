import { Router } from 'express';
import { container } from 'tsyringe';
import { SubscriptionController } from '../controllers/subscription.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';

/**
 * サブスクリプションルート登録
 * サブスクリプション関連のルートを登録する
 * @param router Expressルーター
 */
export const registerSubscriptionRoutes = (router: Router): void => {
  // サブスクリプションコントローラーのインスタンスを取得
  const subscriptionController = container.resolve(SubscriptionController);

  // APIエンドポイントのベースパス
  const basePath = '/subscriptions';

  /**
   * @route GET /api/v1/subscriptions
   * @description 全てのサブスクリプションを取得する
   * @access Protected - AdminまたはManagerロール
   */
  const authMiddlewareInstance = container.resolve(AuthMiddleware);
  router.get(
    basePath,
    authMiddlewareInstance.handle(['admin']),
    (req, res, next) => subscriptionController.getAllSubscriptions(req, res, next)
  );

  /**
   * @route GET /api/v1/subscriptions/:id
   * @description サブスクリプションの詳細を取得する
   * @access Protected - Adminロール
   */
  router.get(
    `${basePath}/:id`,
    authMiddlewareInstance.handle(['admin']),
    (req, res, next) => subscriptionController.getSubscription(req, res, next)
  );

  /**
   * @route GET /api/v1/subscriptions/team/:teamId
   * @description チームのサブスクリプション情報を取得する
   * @access Protected - AdminまたはManagerロール
   */
  router.get(
    `${basePath}/team/:teamId`,
    authMiddlewareInstance.handle(['admin', 'manager']),
    (req, res, next) => subscriptionController.getTeamSubscription(req, res, next)
  );

  /**
   * @route GET /api/v1/subscriptions/user/:userId
   * @description ユーザーのサブスクリプション情報を取得する
   * @access Protected - 認証済みユーザー
   */
  router.get(
    `${basePath}/user/:userId`,
    authMiddlewareInstance.handle(),
    (req, res, next) => subscriptionController.getUserSubscription(req, res, next)
  );

  /**
   * @route GET /api/v1/subscriptions/user/:userId/ai-model
   * @description サブスクリプションに基づくAIモデルを取得する
   * @access Protected - 認証済みユーザー
   */
  router.get(
    `${basePath}/user/:userId/ai-model`,
    authMiddlewareInstance.handle(),
    (req, res, next) => subscriptionController.getAiModel(req, res, next)
  );

  /**
   * @route POST /api/v1/subscriptions
   * @description 新しいチームサブスクリプションを作成する
   * @access Protected - Adminロールのみ
   */
  router.post(
    basePath,
    authMiddlewareInstance.handle(['admin']),
    (req, res, next) => subscriptionController.createSubscription(req, res, next)
  );

  /**
   * @route POST /api/v1/subscriptions/user
   * @description 新しいユーザーサブスクリプションを作成する
   * @access Protected - Adminロールのみ
   */
  router.post(
    `${basePath}/user`,
    authMiddlewareInstance.handle(['admin']),
    (req, res, next) => subscriptionController.createUserSubscription(req, res, next)
  );

  /**
   * @route PATCH /api/v1/subscriptions/:id/plan
   * @description サブスクリプションプランを変更する
   * @access Protected - Adminロールのみ
   */
  router.patch(
    `${basePath}/:id/plan`,
    authMiddlewareInstance.handle(['admin']),
    (req, res, next) => subscriptionController.changePlan(req, res, next)
  );

  /**
   * @route PATCH /api/v1/subscriptions/:id/status
   * @description サブスクリプションステータスを更新する
   * @access Protected - Adminロールのみ
   */
  router.patch(
    `${basePath}/:id/status`,
    authMiddlewareInstance.handle(['admin']),
    (req, res, next) => subscriptionController.updateStatus(req, res, next)
  );

  /**
   * @route DELETE /api/v1/subscriptions/:id
   * @description サブスクリプションを削除する
   * @access Protected - Adminロールのみ
   */
  router.delete(
    `${basePath}/:id`,
    authMiddlewareInstance.handle(['admin']),
    (req, res, next) => subscriptionController.deleteSubscription(req, res, next)
  );
};