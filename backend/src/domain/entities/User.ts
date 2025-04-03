import { Entity } from './Entity';

// ユーザーロールとステータスは値オブジェクトとして定義
import { UserRole } from '../user/value-objects/user-role';
import { UserStatus } from '../user/value-objects/user-status';
import { ElementalProfile } from '../user/value-objects/elemental-profile';
import { SajuProfile } from '../user/value-objects/saju-profile';

/**
 * ユーザーエンティティ
 * システムのユーザーを表すドメインエンティティ
 */
export interface User extends Entity<string> {
  /**
   * ユーザーのメールアドレス
   */
  email: string;
  
  /**
   * ユーザーの氏名
   */
  name: string;
  
  /**
   * ユーザーの役割
   */
  role: UserRole;
  
  /**
   * ユーザーのステータス
   */
  status: UserStatus;
  
  /**
   * ユーザーの陰陽五行プロファイル
   */
  elementalProfile: ElementalProfile;
  
  /**
   * ユーザーの四柱推命プロファイル
   */
  sajuProfile?: SajuProfile;

  /**
   * ユーザーの生年月日
   */
  birthDate: Date;

  /**
   * ユーザーの出生時間（0-23の時間）
   */
  birthHour?: number;

  /**
   * ユーザーの出生地
   */
  birthLocation?: string;
  
  /**
   * ユーザープロフィール画像のURL
   */
  profileImage?: string;

  /**
   * 最終ログイン日時
   */
  lastLoginAt?: Date;
  
  /**
   * パスワードハッシュ
   * ドメインエンティティに含めるべきではないが、
   * 現在の実装との互換性のために含めている
   */
  password?: string;

  /**
   * 個人目標
   * ユーザーが設定した個人的な目標
   */
  personalGoal?: string;

  /**
   * パスワードを検証する
   * @param plainPassword 平文パスワード
   * @returns 一致する場合はtrue
   */
  verifyPassword(plainPassword: string): Promise<boolean>;

  /**
   * パスワードハッシュを取得する
   * @returns パスワードハッシュ
   */
  getPasswordHash(): string;

  /**
   * ユーザーがアクティブかどうかを確認する
   * @returns アクティブならtrue
   */
  isActive(): boolean;

  /**
   * ユーザーが管理者権限を持っているかを確認する
   * @returns 管理者権限を持っていればtrue
   */
  isAdmin(): boolean;

  /**
   * ユーザーが管理職かどうかを確認する
   * @returns 管理職ならtrue
   */
  isManager(): boolean;

  /**
   * 四柱推命プロファイルを更新した新しいユーザーエンティティを作成する
   * @param sajuProfile 新しい四柱推命プロファイル
   * @returns 更新されたユーザーエンティティ
   */
  withUpdatedSajuProfile(sajuProfile: SajuProfile): User;

  /**
   * JSONオブジェクトに変換する
   * @returns JSONオブジェクト
   */
  toJSON(): Record<string, any>;
}