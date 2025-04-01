import { IRepository } from './IRepository';
import { User } from '../entities/User';

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
  findByRole(role: string): Promise<User[]>;
  
  /**
   * 属性によるユーザー検索
   * @param element 陰陽五行の属性（木、火、土、金、水）
   * @returns 該当する属性を持つユーザーの配列
   */
  findByElementalAttribute(element: string): Promise<User[]>;
  
  /**
   * パスワードの更新
   * @param userId ユーザーID
   * @param hashedPassword ハッシュ化されたパスワード
   * @returns 更新操作の結果
   */
  updatePassword(userId: string, hashedPassword: string): Promise<boolean>;
}