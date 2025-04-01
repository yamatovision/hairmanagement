/**
 * TeamEventHandlers
 * チームイベントハンドラー
 * 
 * 変更履歴:
 * - 2025/3/30: 初期実装 (Claude)
 */

import { injectable, inject } from 'tsyringe';
import { IEventBus } from '../EventBus';
import { logger } from '../../../utils/logger.util';
import {
  TeamCreatedEvent,
  TeamUpdatedEvent,
  MemberAddedEvent,
  MemberRemovedEvent,
  MemberRoleChangedEvent,
  InvitationSentEvent,
  InvitationAcceptedEvent,
  InvitationDeclinedEvent,
  TeamCompatibilityChangedEvent
} from '../../../domain/events/team/TeamEvents';

/**
 * チームイベントハンドラー
 */
@injectable()
export class TeamEventHandlers {
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
    this.eventBus.subscribe('team.created', this.handleTeamCreated.bind(this));
    this.eventBus.subscribe('team.updated', this.handleTeamUpdated.bind(this));
    this.eventBus.subscribe('team.member.added', this.handleMemberAdded.bind(this));
    this.eventBus.subscribe('team.member.removed', this.handleMemberRemoved.bind(this));
    this.eventBus.subscribe('team.member.role_changed', this.handleMemberRoleChanged.bind(this));
    this.eventBus.subscribe('team.invitation.sent', this.handleInvitationSent.bind(this));
    this.eventBus.subscribe('team.invitation.accepted', this.handleInvitationAccepted.bind(this));
    this.eventBus.subscribe('team.invitation.declined', this.handleInvitationDeclined.bind(this));
    this.eventBus.subscribe('team.compatibility.changed', this.handleTeamCompatibilityChanged.bind(this));
    
    logger.info('チームイベントハンドラーが登録されました');
  }

  /**
   * チーム作成イベントの処理
   */
  private async handleTeamCreated(event: TeamCreatedEvent): Promise<void> {
    try {
      logger.info(`チーム作成イベントを処理: ${event.teamId} (作成者: ${event.createdBy})`);
      
      // ここにチーム作成後の処理を実装
      // 例: チームパフォーマンス記録の作成、初期化処理など
      
      // 実際の実装では必要に応じてサービスを呼び出す
      // await this.analyticsService.initializeTeamMetrics(event.teamId, event.name);
      
    } catch (error) {
      logger.error(`チーム作成イベントの処理中にエラーが発生しました: ${event.teamId}`, error);
    }
  }

  /**
   * チーム更新イベントの処理
   */
  private async handleTeamUpdated(event: TeamUpdatedEvent): Promise<void> {
    try {
      logger.info(`チーム更新イベントを処理: ${event.teamId}`);
      logger.debug(`更新されたフィールド: ${event.changedFields.join(', ')}`);
      
      // ここにチーム情報更新後の処理を実装
      
    } catch (error) {
      logger.error(`チーム更新イベントの処理中にエラーが発生しました: ${event.teamId}`, error);
    }
  }

  /**
   * メンバー追加イベントの処理
   */
  private async handleMemberAdded(event: MemberAddedEvent): Promise<void> {
    try {
      logger.info(`メンバー追加イベントを処理: チーム ${event.teamId} にユーザー ${event.userId} が追加されました`);
      
      // ここにメンバー追加後の処理を実装
      // 例: 相性計算、通知送信など
      
      // チーム相性の再計算
      logger.debug(`チーム相性の再計算を開始: チーム ${event.teamId}`);
      
      // 実際の実装では必要に応じてサービスを呼び出す
      // const newCompatibilityScore = await this.teamService.recalculateTeamCompatibility(event.teamId);
      // 
      // // チーム相性イベントの発行
      // const teamCompatibilityEvent = new TeamCompatibilityChangedEvent(
      //   event.teamId,
      //   oldScore, // 以前のスコア
      //   newCompatibilityScore, // 新しいスコア
      //   {
      //     action: 'member_added',
      //     userId: event.userId
      //   }
      // );
      // 
      // await this.eventBus.publish(teamCompatibilityEvent);
      
    } catch (error) {
      logger.error(`メンバー追加イベントの処理中にエラーが発生しました: チーム ${event.teamId}, ユーザー ${event.userId}`, error);
    }
  }

  /**
   * メンバー除去イベントの処理
   */
  private async handleMemberRemoved(event: MemberRemovedEvent): Promise<void> {
    try {
      logger.info(`メンバー除去イベントを処理: チーム ${event.teamId} からユーザー ${event.userId} が除去されました`);
      
      if (event.reason) {
        logger.debug(`除去理由: ${event.reason}`);
      }
      
      // ここにメンバー除去後の処理を実装
      // 例: 相性再計算、権限調整など
      
      // チーム相性の再計算
      logger.debug(`チーム相性の再計算を開始: チーム ${event.teamId}`);
      
      // 実際の実装では必要に応じてサービスを呼び出す
      // const newCompatibilityScore = await this.teamService.recalculateTeamCompatibility(event.teamId);
      
    } catch (error) {
      logger.error(`メンバー除去イベントの処理中にエラーが発生しました: チーム ${event.teamId}, ユーザー ${event.userId}`, error);
    }
  }

  /**
   * メンバーロール変更イベントの処理
   */
  private async handleMemberRoleChanged(event: MemberRoleChangedEvent): Promise<void> {
    try {
      logger.info(`メンバーロール変更イベントを処理: チーム ${event.teamId} のユーザー ${event.userId} のロールが変更されました`);
      logger.debug(`ロール変更: ${event.oldRole} -> ${event.newRole}`);
      
      // ここにメンバーロール変更後の処理を実装
      // 例: 権限設定の更新、チーム内通知など
      
    } catch (error) {
      logger.error(`メンバーロール変更イベントの処理中にエラーが発生しました: チーム ${event.teamId}, ユーザー ${event.userId}`, error);
    }
  }

  /**
   * 招待送信イベントの処理
   */
  private async handleInvitationSent(event: InvitationSentEvent): Promise<void> {
    try {
      logger.info(`招待送信イベントを処理: チーム ${event.teamId} から ${event.invitedEmail} に招待が送信されました`);
      
      // ここに招待送信後の処理を実装
      // 例: メール送信、通知生成など
      
      // 実際の実装では必要に応じてサービスを呼び出す
      // await this.emailService.sendTeamInvitation(event.invitedEmail, {
      //   teamId: event.teamId,
      //   invitationId: event.invitationId,
      //   role: event.role,
      //   expiresAt: event.expiresAt
      // });
      
    } catch (error) {
      logger.error(`招待送信イベントの処理中にエラーが発生しました: チーム ${event.teamId}, メール ${event.invitedEmail}`, error);
    }
  }

  /**
   * 招待受諾イベントの処理
   */
  private async handleInvitationAccepted(event: InvitationAcceptedEvent): Promise<void> {
    try {
      logger.info(`招待受諾イベントを処理: ユーザー ${event.userId} がチーム ${event.teamId} の招待を受諾しました`);
      
      // ここに招待受諾後の処理を実装
      // 例: チームメンバー追加処理、通知など
      
      // 実際の実装ではチームメンバー追加処理はこのイベントの前に行われているはず
      // 通知・アナリティクス処理などを実装
      
      // await this.analyticsService.recordTeamGrowth(event.teamId);
      // await this.notificationService.notifyTeamAdmins(event.teamId, `ユーザー ${event.userId} がチームに参加しました`);
      
    } catch (error) {
      logger.error(`招待受諾イベントの処理中にエラーが発生しました: チーム ${event.teamId}, ユーザー ${event.userId}`, error);
    }
  }

  /**
   * 招待拒否イベントの処理
   */
  private async handleInvitationDeclined(event: InvitationDeclinedEvent): Promise<void> {
    try {
      logger.info(`招待拒否イベントを処理: ユーザー ${event.userId} がチーム ${event.teamId} の招待を拒否しました`);
      
      if (event.reason) {
        logger.debug(`拒否理由: ${event.reason}`);
      }
      
      // ここに招待拒否後の処理を実装
      // 例: チーム管理者への通知など
      
      // 実際の実装では必要に応じてサービスを呼び出す
      // await this.analyticsService.recordInvitationDeclined(event.teamId, event.invitationId, event.reason);
      // await this.notificationService.notifyTeamAdmin(event.teamId, `ユーザーがチーム参加招待を拒否しました`);
      
    } catch (error) {
      logger.error(`招待拒否イベントの処理中にエラーが発生しました: チーム ${event.teamId}, ユーザー ${event.userId}`, error);
    }
  }

  /**
   * チーム相性変更イベントの処理
   */
  private async handleTeamCompatibilityChanged(event: TeamCompatibilityChangedEvent): Promise<void> {
    try {
      logger.info(`チーム相性変更イベントを処理: チーム ${event.teamId}`);
      logger.debug(`相性スコア変更: ${event.oldScore} -> ${event.newScore} (変化: ${event.newScore - event.oldScore})`);
      
      // ここにチーム相性変更後の処理を実装
      // 例: 分析レポート生成、通知出力など
      
      // 相性スコアの変化が大きい場合、通知出力などを考慮
      const scoreDelta = Math.abs(event.newScore - event.oldScore);
      if (scoreDelta > 15) {
        logger.debug(`大きな相性変化を検出: 変化量 ${scoreDelta}`);
        
        // 実際の実装では必要に応じてサービスを呼び出す
        // await this.notificationService.notifyTeamManager(event.teamId, {
        //   title: 'チーム相性に大きな変化がありました',
        //   message: `チームの相性スコアが${scoreDelta}ポイント変化しました`,
        //   data: {
        //     oldScore: event.oldScore,
        //     newScore: event.newScore,
        //     action: event.changedBy.action
        //   }
        // });
        // 
        // // 分析レポートの生成
        // await this.analyticsService.generateTeamCompatibilityReport(event.teamId);
      }
      
      // 分析データの更新
      // await this.analyticsService.updateTeamCompatibilityHistory(event.teamId, {
      //   timestamp: event.occurredAt,
      //   oldScore: event.oldScore,
      //   newScore: event.newScore,
      //   action: event.changedBy.action,
      //   triggerUserId: event.changedBy.userId
      // });
      
    } catch (error) {
      logger.error(`チーム相性変更イベントの処理中にエラーが発生しました: チーム ${event.teamId}`, error);
    }
  }
}