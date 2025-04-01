import { inject, injectable } from 'tsyringe';
import { Model } from 'mongoose';
import { BaseRepository } from './base/BaseRepository';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import UserModel, { IUserDocument } from '../../domain/models/user.model';
import { UserRole } from '../../domain/user/value-objects/user-role';
import { UserStatus } from '../../domain/user/value-objects/user-status';

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
    return {
      id: doc._id.toString(),
      email: doc.email,
      name: doc.name,
      password: doc.password,
      role: this.mapRoleToUserRole(doc.role),
      status: this.determineUserStatus(doc.isActive),
      elementalAttributes: {
        primaryElement: doc.elementalType?.mainElement,
        secondaryElement: doc.elementalType?.secondaryElement,
        yin: doc.elementalType?.yinYang === '陰' ? 1 : 0,
        yang: doc.elementalType?.yinYang === '陽' ? 1 : 0
      },
      profileImage: doc.profilePicture,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
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
      password: entity.password,
      role: this.mapUserRoleToModel(entity.role),
      isActive: entity.status === 'active',
      elementalType: {
        mainElement: entity.elementalAttributes?.primaryElement || null,
        secondaryElement: entity.elementalAttributes?.secondaryElement || null,
        yinYang: entity.elementalAttributes?.yin && entity.elementalAttributes.yin > 0 ? '陰' : '陽'
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
  async findByRole(role: string): Promise<User[]> {
    const modelRole = this.mapUserRoleToModel({ [role]: role } as any);
    const users = await this.userModel.find({ role: modelRole }).exec();
    return users.map(user => this.toDomainEntity(user));
  }

  /**
   * 属性によるユーザー検索
   * @param element 陰陽五行の属性（木、火、土、金、水）
   * @returns 該当する属性を持つユーザーの配列
   */
  async findByElementalAttribute(element: string): Promise<User[]> {
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