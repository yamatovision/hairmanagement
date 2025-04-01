/**
 * UserEvents
 * ユーザー関連のドメインイベント
 * 
 * 変更履歴:
 * - 2025/3/30: 初期実装 (Claude)
 */

import { DomainEvent } from '../shared/DomainEvent';

/**
 * ユーザー作成イベント
 */
export class UserCreatedEvent extends DomainEvent {
  /**
   * コンストラクタ
   * @param userId ユーザーID
   * @param email メールアドレス
   * @param name ユーザー名
   * @param role ロール
   * @param birthDate 誕生日
   * @param elementalProfile 五行属性情報（オプション）
   */
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string,
    public readonly role: string,
    public readonly birthDate: Date,
    public readonly elementalProfile?: {
      element?: string;
      yinYang?: 'yin' | 'yang';
      intensity?: number;
    }
  ) {
    super('user.created', {
      source: {
        entityType: 'User',
        entityId: userId,
        userId: userId
      }
    });
  }

  /**
   * イベントのペイロードを取得
   */
  getPayload(): any {
    return {
      userId: this.userId,
      email: this.email,
      name: this.name,
      role: this.role,
      birthDate: this.birthDate.toISOString(),
      elementalProfile: this.elementalProfile
    };
  }
}

/**
 * ユーザー更新イベント
 */
export class UserUpdatedEvent extends DomainEvent {
  /**
   * コンストラクタ
   * @param userId ユーザーID
   * @param changedFields 変更されたフィールド名の配列
   * @param updatedBy 更新を行ったユーザーID
   */
  constructor(
    public readonly userId: string,
    public readonly changedFields: string[],
    public readonly updatedBy?: string
  ) {
    super('user.updated', {
      source: {
        entityType: 'User',
        entityId: userId,
        userId: updatedBy || userId
      }
    });
  }

  /**
   * イベントのペイロードを取得
   */
  getPayload(): any {
    return {
      userId: this.userId,
      changedFields: this.changedFields,
      updatedBy: this.updatedBy
    };
  }
}

/**
 * プロファイル更新イベント
 */
export class ProfileUpdatedEvent extends DomainEvent {
  /**
   * コンストラクタ
   * @param userId ユーザーID
   * @param elementalProfile 五行属性プロファイル
   */
  constructor(
    public readonly userId: string,
    public readonly elementalProfile: {
      element: string;
      yinYang: 'yin' | 'yang';
      intensity: number;
    }
  ) {
    super('user.profile.updated', {
      source: {
        entityType: 'User',
        entityId: userId,
        userId: userId
      }
    });
  }

  /**
   * イベントのペイロードを取得
   */
  getPayload(): any {
    return {
      userId: this.userId,
      elementalProfile: this.elementalProfile
    };
  }
}

/**
 * ロール変更イベント
 */
export class RoleChangedEvent extends DomainEvent {
  /**
   * コンストラクタ
   * @param userId ユーザーID
   * @param oldRole 古いロール
   * @param newRole 新しいロール
   * @param changedBy 変更を行ったユーザーID
   */
  constructor(
    public readonly userId: string,
    public readonly oldRole: string,
    public readonly newRole: string,
    public readonly changedBy?: string
  ) {
    super('user.role.changed', {
      source: {
        entityType: 'User',
        entityId: userId,
        userId: changedBy || userId
      }
    });
  }

  /**
   * イベントのペイロードを取得
   */
  getPayload(): any {
    return {
      userId: this.userId,
      oldRole: this.oldRole,
      newRole: this.newRole,
      changedBy: this.changedBy
    };
  }
}

/**
 * ログインイベント
 */
export class UserLoggedInEvent extends DomainEvent {
  /**
   * コンストラクタ
   * @param userId ユーザーID
   * @param ipAddress IPアドレス
   * @param userAgent ユーザーエージェント
   */
  constructor(
    public readonly userId: string,
    public readonly ipAddress?: string,
    public readonly userAgent?: string
  ) {
    super('user.logged_in', {
      source: {
        entityType: 'User',
        entityId: userId,
        userId: userId
      }
    });
  }

  /**
   * イベントのペイロードを取得
   */
  getPayload(): any {
    return {
      userId: this.userId,
      ipAddress: this.ipAddress,
      userAgent: this.userAgent,
      timestamp: this.occurredAt
    };
  }
}

/**
 * パスワードリセットイベント
 */
export class PasswordResetRequestedEvent extends DomainEvent {
  /**
   * コンストラクタ
   * @param userId ユーザーID
   * @param email メールアドレス
   * @param resetToken リセットトークン
   * @param expiresAt 期限日時
   */
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly resetToken: string,
    public readonly expiresAt: Date
  ) {
    super('user.password.reset_requested', {
      source: {
        entityType: 'User',
        entityId: userId,
        userId: userId
      }
    });
  }

  /**
   * イベントのペイロードを取得
   */
  getPayload(): any {
    return {
      userId: this.userId,
      email: this.email,
      resetToken: this.resetToken,
      expiresAt: this.expiresAt.toISOString()
    };
  }
}