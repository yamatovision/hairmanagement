/**
 * UserEventHandlers
 * ユーザーイベントハンドラー
 * 
 * 変更履歴:
 * - 2025/3/30: 初期実装 (Claude)
 */

import { injectable, inject } from 'tsyringe';
import { IEventBus } from '../EventBus';
import { logger } from '../../../utils/logger.util';
import {
  UserCreatedEvent,
  UserUpdatedEvent,
  ProfileUpdatedEvent,
  RoleChangedEvent,
  UserLoggedInEvent
} from '../../../domain/events/user/UserEvents';

/**
 * ユーザーイベントハンドラー
 */
@injectable()
export class UserEventHandlers {
  /**
   * コンストラクタ
   */
  constructor(
    @inject('IEventBus') private eventBus: IEventBus
  ) {
    this.registerHandlers();
  }

  /**
   * ハンドラーの登録
   */
  private registerHandlers(): void {
    this.eventBus.subscribe('user.created', this.handleUserCreated.bind(this));
    this.eventBus.subscribe('user.updated', this.handleUserUpdated.bind(this));
    this.eventBus.subscribe('user.profile.updated', this.handleProfileUpdated.bind(this));
    this.eventBus.subscribe('user.role.changed', this.handleRoleChanged.bind(this));
    this.eventBus.subscribe('user.logged_in', this.handleUserLoggedIn.bind(this));
    
    logger.info('ユーザーイベントハンドラーが登録されました');
  }

  /**
   * ユーザー作成イベントの処理
   */
  private async handleUserCreated(event: UserCreatedEvent): Promise<void> {
    try {
      logger.info(`ユーザー作成イベントを処理: ${event.userId}`);
      
      // ここにユーザー作成後の処理を実装
      // 例: 運勢プロファイルの生成、初期データの設定など
      
      // 実際の実装では必要に応じてサービスを呼び出す
      // this.fortuneService.createInitialProfile(event.userId, event.birthDate);
      // this.analyticsService.initializeUserMetrics(event.userId);
      
    } catch (error) {
      logger.error(`ユーザー作成イベントの処理中にエラーが発生しました: ${event.userId}`, error);
    }
  }

  /**
   * ユーザー更新イベントの処理
   */
  private async handleUserUpdated(event: UserUpdatedEvent): Promise<void> {
    try {
      logger.info(`ユーザー更新イベントを処理: ${event.userId}`);
      logger.debug(`更新されたフィールド: ${event.changedFields.join(', ')}`);
      
      // ここにユーザー情報更新後の処理を実装
      
    } catch (error) {
      logger.error(`ユーザー更新イベントの処理中にエラーが発生しました: ${event.userId}`, error);
    }
  }

  /**
   * プロファイル更新イベントの処理
   */
  private async handleProfileUpdated(event: ProfileUpdatedEvent): Promise<void> {
    try {
      logger.info(`プロファイル更新イベントを処理: ${event.userId}`);
      logger.debug(`五行プロファイル更新: ${JSON.stringify(event.elementalProfile)}`);
      
      // ここに五行プロファイル更新後の処理を実装
      // 例: チーム相性の再計算など
      
      // 実際の実装では必要に応じてサービスを呼び出す
      // this.teamService.recalculateTeamCompatibilities(event.userId);
      // this.fortuneService.updateUserFortuneProfiles(event.userId);
      
    } catch (error) {
      logger.error(`プロファイル更新イベントの処理中にエラーが発生しました: ${event.userId}`, error);
    }
  }

  /**
   * ロール変更イベントの処理
   */
  private async handleRoleChanged(event: RoleChangedEvent): Promise<void> {
    try {
      logger.info(`ロール変更イベントを処理: ${event.userId} (${event.oldRole} -> ${event.newRole})`);
      
      // ここにロール変更後の処理を実装
      // 例: 権限の更新、特定ロール向けの通知など
      
    } catch (error) {
      logger.error(`ロール変更イベントの処理中にエラーが発生しました: ${event.userId}`, error);
    }
  }

  /**
   * ユーザーログインイベントの処理
   */
  private async handleUserLoggedIn(event: UserLoggedInEvent): Promise<void> {
    try {
      logger.info(`ユーザーログインイベントを処理: ${event.userId}`);
      
      // ここにログイン後の処理を実装
      // 例: ログイン履歴の記録、オンラインステータスの更新など
      
      // 日次運勢の生成が必要か確認
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD形式
      
      // 実際の実装では必要に応じてサービスを呼び出す
      // const dailyFortune = await this.fortuneService.getDailyFortune(event.userId);
      // if (!dailyFortune || dailyFortune.date !== today) {
      //   await this.fortuneService.generateDailyFortune(event.userId);
      // }
      
      // アクティビティログへの記録
      // await this.analyticsService.recordUserLogin(event.userId, event.ipAddress);
      
    } catch (error) {
      logger.error(`ユーザーログインイベントの処理中にエラーが発生しました: ${event.userId}`, error);
    }
  }
}
