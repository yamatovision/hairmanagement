/**
 * TeamEvents
 * チーム関連のドメインイベント
 * 
 * 変更履歴:
 * - 2025/3/30: 初期実装 (Claude)
 */

import { DomainEvent } from '../shared/DomainEvent';

/**
 * チーム作成イベント
 */
export class TeamCreatedEvent extends DomainEvent {
  /**
   * コンストラクタ
   * @param teamId チームID
   * @param name チーム名
   * @param description チーム説明
   * @param createdBy 作成者ID
   */
  constructor(
    public readonly teamId: string,
    public readonly name: string,
    public readonly description: string,
    public readonly createdBy: string
  ) {
    super('team.created', {
      source: {
        entityType: 'Team',
        entityId: teamId,
        userId: createdBy
      }
    });
  }

  /**
   * イベントのペイロードを取得
   */
  getPayload(): any {
    return {
      teamId: this.teamId,
      name: this.name,
      description: this.description,
      createdBy: this.createdBy
    };
  }
}

/**
 * チーム更新イベント
 */
export class TeamUpdatedEvent extends DomainEvent {
  /**
   * コンストラクタ
   * @param teamId チームID
   * @param changedFields 変更されたフィールド
   * @param updatedBy 更新者ID
   */
  constructor(
    public readonly teamId: string,
    public readonly changedFields: string[],
    public readonly updatedBy: string
  ) {
    super('team.updated', {
      source: {
        entityType: 'Team',
        entityId: teamId,
        userId: updatedBy
      }
    });
  }

  /**
   * イベントのペイロードを取得
   */
  getPayload(): any {
    return {
      teamId: this.teamId,
      changedFields: this.changedFields,
      updatedBy: this.updatedBy
    };
  }
}

/**
 * メンバー追加イベント
 */
export class MemberAddedEvent extends DomainEvent {
  /**
   * コンストラクタ
   * @param teamId チームID
   * @param userId 追加されたユーザーID
   * @param addedBy 追加したユーザーID
   * @param role メンバーの役割
   */
  constructor(
    public readonly teamId: string,
    public readonly userId: string,
    public readonly addedBy: string,
    public readonly role: string
  ) {
    super('team.member.added', {
      source: {
        entityType: 'Team',
        entityId: teamId,
        userId: addedBy
      }
    });
  }

  /**
   * イベントのペイロードを取得
   */
  getPayload(): any {
    return {
      teamId: this.teamId,
      userId: this.userId,
      addedBy: this.addedBy,
      role: this.role
    };
  }
}

/**
 * メンバー除去イベント
 */
export class MemberRemovedEvent extends DomainEvent {
  /**
   * コンストラクタ
   * @param teamId チームID
   * @param userId 除去されたユーザーID
   * @param removedBy 除去したユーザーID
   * @param reason 除去理由
   */
  constructor(
    public readonly teamId: string,
    public readonly userId: string,
    public readonly removedBy: string,
    public readonly reason?: string
  ) {
    super('team.member.removed', {
      source: {
        entityType: 'Team',
        entityId: teamId,
        userId: removedBy
      }
    });
  }

  /**
   * イベントのペイロードを取得
   */
  getPayload(): any {
    return {
      teamId: this.teamId,
      userId: this.userId,
      removedBy: this.removedBy,
      reason: this.reason
    };
  }
}

/**
 * チームメンバーシップロール変更イベント
 */
export class MemberRoleChangedEvent extends DomainEvent {
  /**
   * コンストラクタ
   * @param teamId チームID
   * @param userId メンバーID
   * @param oldRole 古いロール
   * @param newRole 新しいロール
   * @param changedBy 変更者ID
   */
  constructor(
    public readonly teamId: string,
    public readonly userId: string,
    public readonly oldRole: string,
    public readonly newRole: string,
    public readonly changedBy: string
  ) {
    super('team.member.role_changed', {
      source: {
        entityType: 'Team',
        entityId: teamId,
        userId: changedBy
      }
    });
  }

  /**
   * イベントのペイロードを取得
   */
  getPayload(): any {
    return {
      teamId: this.teamId,
      userId: this.userId,
      oldRole: this.oldRole,
      newRole: this.newRole,
      changedBy: this.changedBy
    };
  }
}

/**
 * 招待送信イベント
 */
export class InvitationSentEvent extends DomainEvent {
  /**
   * コンストラクタ
   * @param invitationId 招待ID
   * @param teamId チームID
   * @param invitedEmail 招待されたメールアドレス
   * @param invitedBy 招待者ID
   * @param role 招待されたロール
   * @param expiresAt 招待の有効期限
   */
  constructor(
    public readonly invitationId: string,
    public readonly teamId: string,
    public readonly invitedEmail: string,
    public readonly invitedBy: string,
    public readonly role: string,
    public readonly expiresAt: Date
  ) {
    super('team.invitation.sent', {
      source: {
        entityType: 'Team',
        entityId: teamId,
        userId: invitedBy
      }
    });
  }

  /**
   * イベントのペイロードを取得
   */
  getPayload(): any {
    return {
      invitationId: this.invitationId,
      teamId: this.teamId,
      invitedEmail: this.invitedEmail,
      invitedBy: this.invitedBy,
      role: this.role,
      expiresAt: this.expiresAt.toISOString()
    };
  }
}

/**
 * 招待受諾イベント
 */
export class InvitationAcceptedEvent extends DomainEvent {
  /**
   * コンストラクタ
   * @param invitationId 招待ID
   * @param teamId チームID
   * @param userId 受諾したユーザーID
   * @param acceptedAt 受諾日時
   */
  constructor(
    public readonly invitationId: string,
    public readonly teamId: string,
    public readonly userId: string,
    public readonly acceptedAt: Date = new Date()
  ) {
    super('team.invitation.accepted', {
      source: {
        entityType: 'Team',
        entityId: teamId,
        userId: userId
      }
    });
  }

  /**
   * イベントのペイロードを取得
   */
  getPayload(): any {
    return {
      invitationId: this.invitationId,
      teamId: this.teamId,
      userId: this.userId,
      acceptedAt: this.acceptedAt.toISOString()
    };
  }
}

/**
 * 招待拒否イベント
 */
export class InvitationDeclinedEvent extends DomainEvent {
  /**
   * コンストラクタ
   * @param invitationId 招待ID
   * @param teamId チームID
   * @param userId 拒否したユーザーID
   * @param reason 拒否理由
   */
  constructor(
    public readonly invitationId: string,
    public readonly teamId: string,
    public readonly userId: string,
    public readonly reason?: string
  ) {
    super('team.invitation.declined', {
      source: {
        entityType: 'Team',
        entityId: teamId,
        userId: userId
      }
    });
  }

  /**
   * イベントのペイロードを取得
   */
  getPayload(): any {
    return {
      invitationId: this.invitationId,
      teamId: this.teamId,
      userId: this.userId,
      reason: this.reason
    };
  }
}

/**
 * チーム相性変更イベント
 */
export class TeamCompatibilityChangedEvent extends DomainEvent {
  /**
   * コンストラクタ
   * @param teamId チームID
   * @param oldScore 古い相性スコア
   * @param newScore 新しい相性スコア
   * @param changedBy 変更トリガー情報
   */
  constructor(
    public readonly teamId: string,
    public readonly oldScore: number,
    public readonly newScore: number,
    public readonly changedBy: {
      action: 'member_added' | 'member_removed' | 'profile_updated' | 'rebalanced';
      userId?: string;
    }
  ) {
    super('team.compatibility.changed', {
      source: {
        entityType: 'Team',
        entityId: teamId,
        userId: changedBy.userId
      }
    });
  }

  /**
   * イベントのペイロードを取得
   */
  getPayload(): any {
    return {
      teamId: this.teamId,
      oldScore: this.oldScore,
      newScore: this.newScore,
      delta: this.newScore - this.oldScore,
      changedBy: this.changedBy
    };
  }
}