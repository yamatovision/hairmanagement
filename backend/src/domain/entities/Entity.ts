/**
 * 基本エンティティインターフェース
 * すべてのドメインエンティティが継承する基本インターフェース
 */
export interface Entity<T> {
  /**
   * エンティティのID
   */
  id: T;
  
  /**
   * 作成日時
   */
  createdAt?: Date;
  
  /**
   * 更新日時
   */
  updatedAt?: Date;
}