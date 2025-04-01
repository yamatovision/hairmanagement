import { inject, injectable } from 'tsyringe';
import { Document, Connection } from 'mongoose';
import { MongoRepositoryBase } from './base/mongo-repository.base';
import { IUserRepository } from '../../domain/user/repositories/user.repository.interface';
import { User } from '../../domain/user/entities/user.entity';
import { UserRole } from '../../domain/user/value-objects/user-role';
import { UserStatus } from '../../domain/user/value-objects/user-status';
import { Password } from '../../domain/user/value-objects/password';
import { ElementalProfile } from '../../domain/user/value-objects/elemental-profile';
import { ElementType, YinYangType } from '@shared';

/**
 * MongoDBを使用したユーザーリポジトリの実装
 */
@injectable()
export class MongoUserRepository extends MongoRepositoryBase<User, string> implements IUserRepository {
  /**
   * コンストラクタ
   * @param connection MongoDBコネクション
   */
  constructor(
    @inject('DatabaseConnection') connection: Connection
  ) {
    super(connection);
  }

  /**
   * このリポジトリが使用するモデル名を取得する
   * @returns モデル名
   */
  protected getModelName(): string {
    return 'User';
  }

  /**
   * Mongooseドキュメントからドメインエンティティへのマッピング
   * @param document Mongooseユーザードキュメント
   * @returns ユーザードメインエンティティ
   */
  protected toEntity(document: Document): User {
    const doc = document.toObject();
    
    // ドメイン値オブジェクトの生成
    const password = Password.fromHash(doc.password);
    
    const elementalProfile = new ElementalProfile(
      doc.elementalType?.mainElement,
      doc.elementalType?.yinYang,
      doc.elementalType?.secondaryElement
    );
    
    return new User(
      doc._id.toString(),
      doc.email,
      doc.name,
      password,
      new Date(doc.birthDate),
      this.mapRoleFromModel(doc.role),
      this.mapStatusFromModel(doc.isActive),
      elementalProfile,
      doc.sajuProfile, // サジュプロファイル
      doc.birthHour, // 出生時間
      doc.birthLocation, // 出生地
      doc.profilePicture, // プロフィール画像
      doc.lastLoginAt ? new Date(doc.lastLoginAt) : undefined, // 最終ログイン日時
      doc.createdAt ? new Date(doc.createdAt) : undefined, // 作成日時
      doc.updatedAt ? new Date(doc.updatedAt) : undefined // 更新日時
    );
  }

  /**
   * ドメインエンティティからMongooseドキュメントへのマッピング
   * @param entity ユーザードメインエンティティ
   * @returns Mongooseドキュメントデータ
   */
  protected toDocument(entity: User): any {
    const elementalProfile = entity.elementalProfile?.toPlain() || { mainElement: null, secondaryElement: null, yinYang: null };
    
    return {
      email: entity.email,
      name: entity.name,
      password: entity.getPasswordHash(),
      birthDate: entity.birthDate.toISOString().split('T')[0], // YYYY-MM-DD形式
      role: this.mapRoleToModel(entity.role),
      isActive: entity.status === UserStatus.ACTIVE,
      elementalType: {
        mainElement: elementalProfile.mainElement,
        secondaryElement: elementalProfile.secondaryElement,
        yinYang: elementalProfile.yinYang
      },
      sajuProfile: entity.sajuProfile, // サジュプロファイル
      birthHour: entity.birthHour, // 出生時間
      birthLocation: entity.birthLocation, // 出生地
      profilePicture: entity.profileImage, // プロフィール画像
      lastLoginAt: entity.lastLoginAt, // 最終ログイン日時
      ...(entity.id && { _id: entity.id })
    };
  }

  /**
   * メールアドレスでユーザーを検索する
   * @param email ユーザーのメールアドレス
   * @returns 見つかったユーザーまたはnull
   */
  async findByEmail(email: string): Promise<User | null> {
    const model = this.getModel();
    const document = await model.findOne({ email: email.toLowerCase() }).exec();
    
    if (!document) {
      return null;
    }
    
    return this.toEntity(document);
  }

  /**
   * ロールでユーザーを検索する
   * @param role ユーザーロール
   * @returns 該当するロールを持つユーザーの配列
   */
  async findByRole(role: UserRole): Promise<User[]> {
    const modelRole = this.mapRoleToModel(role);
    const documents = await this.getModel().find({ role: modelRole }).exec();
    return documents.map(doc => this.toEntity(doc));
  }

  /**
   * 属性によるユーザー検索
   * @param element 陰陽五行の属性（木、火、土、金、水）
   * @returns 該当する属性を持つユーザーの配列
   */
  async findByElementalAttribute(element: ElementType): Promise<User[]> {
    const documents = await this.getModel().find({
      $or: [
        { 'elementalType.mainElement': element },
        { 'elementalType.secondaryElement': element }
      ]
    }).exec();
    
    return documents.map(doc => this.toEntity(doc));
  }

  /**
   * パスワードの更新
   * @param userId ユーザーID
   * @param hashedPassword ハッシュ化されたパスワード
   * @returns 更新操作の結果
   */
  async updatePassword(userId: string, hashedPassword: string): Promise<boolean> {
    const result = await this.getModel().findByIdAndUpdate(
      userId,
      { password: hashedPassword }
    ).exec();
    
    return result !== null;
  }

  /**
   * ユーザーを有効または無効にする
   * @param userId ユーザーID
   * @param isActive 有効化するならtrue、無効化するならfalse
   * @returns 更新操作の結果
   */
  async setActive(userId: string, isActive: boolean): Promise<boolean> {
    const result = await this.getModel().findByIdAndUpdate(
      userId,
      { isActive }
    ).exec();
    
    return result !== null;
  }

  /**
   * 最終ログイン日時を更新する
   * @param userId ユーザーID
   * @param loginTime ログイン日時
   * @returns 更新操作の結果
   */
  async updateLastLogin(userId: string, loginTime: Date): Promise<boolean> {
    const result = await this.getModel().findByIdAndUpdate(
      userId,
      { lastLoginAt: loginTime.toISOString() }
    ).exec();
    
    return result !== null;
  }

  /**
   * ドメインのユーザーロールをモデルのロール値にマッピングする
   * @param role ドメインのユーザーロール
   * @returns モデルのロール値
   */
  private mapRoleToModel(role: UserRole): string {
    switch (role) {
      case UserRole.EMPLOYEE:
        return 'employee';
      case UserRole.MANAGER:
        return 'manager';
      case UserRole.ADMIN:
        return 'admin';
      case UserRole.SUPER_ADMIN:
        return 'superadmin';
      default:
        return 'employee';
    }
  }

  /**
   * モデルのロール値をドメインのユーザーロールにマッピングする
   * @param modelRole モデルのロール値
   * @returns ドメインのユーザーロール
   */
  private mapRoleFromModel(modelRole: string): UserRole {
    switch (modelRole) {
      case 'employee':
        return UserRole.EMPLOYEE;
      case 'manager':
        return UserRole.MANAGER;
      case 'admin':
        return UserRole.ADMIN;
      case 'superadmin':
        return UserRole.SUPER_ADMIN;
      default:
        return UserRole.EMPLOYEE;
    }
  }

  /**
   * モデルのアクティブ状態をドメインのユーザーステータスにマッピングする
   * @param isActive モデルのアクティブ状態
   * @returns ドメインのユーザーステータス
   */
  private mapStatusFromModel(isActive: boolean): UserStatus {
    return isActive ? UserStatus.ACTIVE : UserStatus.INACTIVE;
  }
}