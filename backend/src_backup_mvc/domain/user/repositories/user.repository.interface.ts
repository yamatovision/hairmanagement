import { IRepository } from '../../shared/repositories/repository.interface';
import { User } from '../entities/user.entity';
import { UserRole } from '../value-objects/user-role';
import { ElementType } from '@shared';

/**
 * ユーザーリポジトリインターフェース
 * ユーザードメインエンティティに特化したリポジトリ操作を定義
 */
export interface IUserRepository extends IRepository<User, string> {
  /**
   * メールアドレスでユーザーを検索する
   * @param email ユーザーのメールアドレス
   * @returns 見つかったユーザーまたはnull
   */
  findByEmail(email: string): Promise<User | null>;
  
  /**
   * ロールでユーザーを検索する
   * @param role ユーザーロール
   * @returns 該当するロールを持つユーザーの配列
   */
  findByRole(role: UserRole): Promise<User[]>;
  
  /**
   * 属性によるユーザー検索
   * @param element 陰陽五行の属性（木、火、土、金、水）
   * @returns 該当する属性を持つユーザーの配列
   */
  findByElementalAttribute(element: ElementType): Promise<User[]>;
  
  /**
   * パスワードの更新
   * @param userId ユーザーID
   * @param hashedPassword ハッシュ化されたパスワード
   * @returns 更新操作の結果
   */
  updatePassword(userId: string, hashedPassword: string): Promise<boolean>;
  
  /**
   * ユーザーを有効または無効にする
   * @param userId ユーザーID
   * @param isActive 有効化するならtrue、無効化するならfalse
   * @returns 更新操作の結果
   */
  setActive(userId: string, isActive: boolean): Promise<boolean>;
  
  /**
   * 最終ログイン日時を更新する
   * @param userId ユーザーID
   * @param loginTime ログイン日時
   * @returns 更新操作の結果
   */
  updateLastLogin(userId: string, loginTime: Date): Promise<boolean>;
}