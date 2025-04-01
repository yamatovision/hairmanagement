import { Entity } from '../../shared/entities/entity.base';
import { UserRole } from '../value-objects/user-role';
import { UserStatus } from '../value-objects/user-status';
import { Password } from '../value-objects/password';
import { ElementalProfile } from '../value-objects/elemental-profile';
import { SajuProfile } from '../value-objects/saju-profile';

/**
 * ユーザーエンティティ
 * システムのユーザーを表すドメインエンティティ
 */
export class User extends Entity<string> {
  /**
   * コンストラクタ
   * @param id ユーザーID
   * @param email メールアドレス
   * @param name 氏名
   * @param password パスワード値オブジェクト
   * @param birthDate 生年月日
   * @param role ロール値オブジェクト
   * @param status ステータス値オブジェクト
   * @param elementalProfile 陰陽五行プロファイル値オブジェクト
   * @param profileImage プロフィール画像URL（オプション）
   * @param lastLoginAt 最終ログイン日時（オプション）
   * @param createdAt 作成日時（オプション）
   * @param updatedAt 更新日時（オプション）
   */
  constructor(
    id: string,
    public readonly email: string,
    public readonly name: string,
    private readonly password: Password,
    public readonly birthDate: Date,
    public readonly role: UserRole,
    public readonly status: UserStatus,
    public readonly elementalProfile: ElementalProfile,
    public readonly sajuProfile?: SajuProfile,
    public readonly birthHour?: number,
    public readonly birthLocation?: string,
    public readonly profileImage?: string,
    public readonly lastLoginAt?: Date,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    super(id, createdAt, updatedAt);
  }
  
  /**
   * パスワードを検証する
   * @param plainPassword 平文パスワード
   * @returns 一致する場合はtrue
   */
  async verifyPassword(plainPassword: string): Promise<boolean> {
    return this.password.verify(plainPassword);
  }
  
  /**
   * パスワードハッシュを取得する
   * @returns パスワードハッシュ
   */
  getPasswordHash(): string {
    return this.password.hash;
  }
  
  /**
   * ユーザーがアクティブかどうかを確認する
   * @returns アクティブならtrue
   */
  isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }
  
  /**
   * ユーザーが管理者権限を持っているかを確認する
   * @returns 管理者権限を持っていればtrue
   */
  isAdmin(): boolean {
    return this.role === UserRole.ADMIN || this.role === UserRole.SUPER_ADMIN;
  }
  
  /**
   * ユーザーが管理職かどうかを確認する
   * @returns 管理職ならtrue
   */
  isManager(): boolean {
    return this.role === UserRole.MANAGER || this.isAdmin();
  }
  
  /**
   * 名前を更新した新しいユーザーエンティティを作成する
   * エンティティは不変なので、新しいインスタンスを作成する
   * @param name 新しい名前
   * @returns 更新されたユーザーエンティティ
   */
  withUpdatedName(name: string): User {
    return new User(
      this.id,
      this.email,
      name,
      this.password,
      this.birthDate,
      this.role,
      this.status,
      this.elementalProfile,
      this.sajuProfile,
      this.birthHour,
      this.birthLocation,
      this.profileImage,
      this.lastLoginAt,
      this.createdAt,
      new Date()
    );
  }
  
  /**
   * プロフィール画像を更新した新しいユーザーエンティティを作成する
   * @param profileImage 新しいプロフィール画像URL
   * @returns 更新されたユーザーエンティティ
   */
  withUpdatedProfileImage(profileImage: string): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.password,
      this.birthDate,
      this.role,
      this.status,
      this.elementalProfile,
      this.sajuProfile,
      this.birthHour,
      this.birthLocation,
      profileImage,
      this.lastLoginAt,
      this.createdAt,
      new Date()
    );
  }
  
  /**
   * ロールを更新した新しいユーザーエンティティを作成する
   * @param role 新しいロール
   * @returns 更新されたユーザーエンティティ
   */
  withUpdatedRole(role: UserRole): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.password,
      this.birthDate,
      role,
      this.status,
      this.elementalProfile,
      this.sajuProfile,
      this.birthHour,
      this.birthLocation,
      this.profileImage,
      this.lastLoginAt,
      this.createdAt,
      new Date()
    );
  }
  
  /**
   * ステータスを更新した新しいユーザーエンティティを作成する
   * @param status 新しいステータス
   * @returns 更新されたユーザーエンティティ
   */
  withUpdatedStatus(status: UserStatus): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.password,
      this.birthDate,
      this.role,
      status,
      this.elementalProfile,
      this.sajuProfile,
      this.birthHour,
      this.birthLocation,
      this.profileImage,
      this.lastLoginAt,
      this.createdAt,
      new Date()
    );
  }
  
  /**
   * 最終ログイン日時を更新した新しいユーザーエンティティを作成する
   * @param lastLoginAt 新しい最終ログイン日時
   * @returns 更新されたユーザーエンティティ
   */
  withUpdatedLastLogin(lastLoginAt: Date): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.password,
      this.birthDate,
      this.role,
      this.status,
      this.elementalProfile,
      this.sajuProfile,
      this.birthHour,
      this.birthLocation,
      this.profileImage,
      lastLoginAt,
      this.createdAt,
      new Date()
    );
  }

  /**
   * 生年月日を更新した新しいユーザーエンティティを作成する
   * @param birthDate 新しい生年月日
   * @returns 更新されたユーザーエンティティ
   */
  withUpdatedBirthDate(birthDate: Date): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.password,
      birthDate,
      this.role,
      this.status,
      this.elementalProfile,
      this.sajuProfile,
      this.birthHour,
      this.birthLocation,
      this.profileImage,
      this.lastLoginAt,
      this.createdAt,
      new Date()
    );
  }

  /**
   * 陰陽五行プロファイルを更新した新しいユーザーエンティティを作成する
   * @param elementalProfile 新しい陰陽五行プロファイル
   * @returns 更新されたユーザーエンティティ
   */
  withUpdatedElementalProfile(elementalProfile: ElementalProfile): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.password,
      this.birthDate,
      this.role,
      this.status,
      elementalProfile,
      this.sajuProfile,
      this.birthHour,
      this.birthLocation,
      this.profileImage,
      this.lastLoginAt,
      this.createdAt,
      new Date()
    );
  }
  
  /**
   * 四柱推命プロファイルを更新した新しいユーザーエンティティを作成する
   * @param sajuProfile 新しい四柱推命プロファイル
   * @returns 更新されたユーザーエンティティ
   */
  withUpdatedSajuProfile(sajuProfile: SajuProfile): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.password,
      this.birthDate,
      this.role,
      this.status,
      this.elementalProfile,
      sajuProfile,
      this.birthHour,
      this.birthLocation,
      this.profileImage,
      this.lastLoginAt,
      this.createdAt,
      new Date()
    );
  }
  
  /**
   * 出生時間を更新した新しいユーザーエンティティを作成する
   * @param birthHour 新しい出生時間（0-23の時間）
   * @returns 更新されたユーザーエンティティ
   */
  withUpdatedBirthHour(birthHour: number): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.password,
      this.birthDate,
      this.role,
      this.status,
      this.elementalProfile,
      this.sajuProfile,
      birthHour,
      this.birthLocation,
      this.profileImage,
      this.lastLoginAt,
      this.createdAt,
      new Date()
    );
  }
  
  /**
   * 出生地を更新した新しいユーザーエンティティを作成する
   * @param birthLocation 新しい出生地
   * @returns 更新されたユーザーエンティティ
   */
  withUpdatedBirthLocation(birthLocation: string): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.password,
      this.birthDate,
      this.role,
      this.status,
      this.elementalProfile,
      this.sajuProfile,
      this.birthHour,
      birthLocation,
      this.profileImage,
      this.lastLoginAt,
      this.createdAt,
      new Date()
    );
  }
}