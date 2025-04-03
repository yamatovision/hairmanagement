import { inject, injectable } from 'tsyringe';
import { Model } from 'mongoose';
import { BaseRepository } from './base/BaseRepository';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/user/entities/user.entity';
import UserModel, { IUserDocument } from '../../domain/models/user.model';
import { UserRole } from '../../domain/user/value-objects/user-role';
import { UserStatus } from '../../domain/user/value-objects/user-status';
import { ElementalProfile } from '../../domain/user/value-objects/elemental-profile';
import { Password } from '../../domain/user/value-objects/password';
import { ElementType, YinYangType } from '../../shared';

/**
 * MongoDBを使用したユーザーリポジトリの実装
 */
@injectable()
export class MongoUserRepository extends BaseRepository<User, string> implements IUserRepository {
  /**
   * コンストラクタ
   * @param userModel UserモデルのMongooseインスタンス
   */
  constructor(
    @inject('UserModel') private userModel: any
  ) {
    super(userModel);
  }

  /**
   * Mongooseドキュメントからドメインエンティティへの変換
   * @param doc MongooseのUserドキュメント
   * @returns ドメインエンティティのUser
   */
  protected toDomainEntity(doc: IUserDocument): User {
    // パスワードのインスタンス化
    const passwordObj = doc.password ? Password.fromHash(doc.password) : Password.fromHash('dummy_hash');
    
    // 日付の処理
    const birthDate = doc.birthDate ? new Date(doc.birthDate) : new Date();
    
    // 五行プロファイルの作成
    const elementalProfile = new ElementalProfile(
      (doc.elementalType?.mainElement || '木') as ElementType,
      (doc.elementalType?.yinYang || '陽') as YinYangType,
      doc.elementalType?.secondaryElement as ElementType
    );
    
    // Userインスタンスを作成
    return new User(
      doc._id.toString(),
      doc.email,
      doc.name,
      passwordObj,
      birthDate,
      this.mapRoleToUserRole(doc.role),
      this.determineUserStatus(doc.isActive),
      elementalProfile,
      undefined, // sajuProfile
      doc.birthHour,
      doc.birthLocation,
      doc.profilePicture,
      doc.lastLoginAt,
      undefined, // personalGoal
      doc.createdAt,
      doc.updatedAt
    );
  }

  /**
   * ドメインエンティティからMongooseモデルデータへの変換
   * @param entity ドメインエンティティのUser
   * @returns MongooseモデルデータとしてのUser
   */
  protected toModelData(entity: User): any {
    return {
      email: entity.email,
      name: entity.name,
      password: entity.getPasswordHash(), // Use the getter method instead of direct access
      role: this.mapUserRoleToModel(entity.role),
      isActive: entity.status === 'active',
      elementalType: {
        mainElement: entity.elementalProfile?.mainElement || null,
        secondaryElement: entity.elementalProfile?.secondaryElement || null,
        yinYang: entity.elementalProfile?.yinYang || '陽'
      },
      profilePicture: entity.profileImage,
      ...(entity.id && { _id: entity.id })
    };
  }

  /**
   * メールアドレスでユーザーを検索する
   * @param email ユーザーのメールアドレス
   * @returns 見つかったユーザーまたはnull
   */
  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userModel.findByEmail(email);
    if (!user) {
      return null;
    }
    return this.toDomainEntity(user);
  }

  /**
   * ロールでユーザーを検索する
   * @param role ユーザーロール
   * @returns 該当するロールを持つユーザーの配列
   */
  async findByRole(role: UserRole): Promise<User[]> {
    const modelRole = this.mapUserRoleToModel(role);
    const users = await this.userModel.find({ role: modelRole }).exec();
    return users.map(user => this.toDomainEntity(user));
  }

  /**
   * 属性によるユーザー検索
   * @param element 陰陽五行の属性（木、火、土、金、水）
   * @returns 該当する属性を持つユーザーの配列
   */
  async findByElementalAttribute(element: ElementType): Promise<User[]> {
    const users = await this.userModel.find({
      $or: [
        { 'elementalType.mainElement': element },
        { 'elementalType.secondaryElement': element }
      ]
    }).exec();
    return users.map(user => this.toDomainEntity(user));
  }

  /**
   * パスワードの更新
   * @param userId ユーザーID
   * @param hashedPassword ハッシュ化されたパスワード
   * @returns 更新操作の結果
   */
  async updatePassword(userId: string, hashedPassword: string): Promise<boolean> {
    const result = await this.userModel.findByIdAndUpdate(
      userId,
      { password: hashedPassword }
    ).exec();
    return result !== null;
  }

  /**
   * モデルのロール値をドメインエンティティのUserRoleに変換
   * @param modelRole モデルのロール値
   * @returns ドメインエンティティのUserRole
   */
  private mapRoleToUserRole(modelRole: string): UserRole {
    switch (modelRole) {
      case 'employee': return UserRole.EMPLOYEE;
      case 'manager': return UserRole.MANAGER;
      case 'admin': return UserRole.ADMIN;
      case 'superadmin': return UserRole.SUPER_ADMIN;
      default: return UserRole.EMPLOYEE;
    }
  }

  /**
   * ドメインエンティティのUserRoleをモデルのロール値に変換
   * @param userRole ドメインエンティティのUserRole
   * @returns モデルのロール値
   */
  private mapUserRoleToModel(userRole: UserRole): string {
    switch (userRole) {
      case UserRole.EMPLOYEE: return 'employee';
      case UserRole.MANAGER: return 'manager';
      case UserRole.ADMIN: return 'admin';
      case UserRole.SUPER_ADMIN: return 'superadmin';
      default: return 'employee';
    }
  }

  /**
   * ユーザーの有効状態からステータスを決定
   * @param isActive ユーザーが有効かどうか
   * @returns ユーザーステータス
   */
  private determineUserStatus(isActive: boolean): UserStatus {
    return isActive ? UserStatus.ACTIVE : UserStatus.INACTIVE;
  }
}