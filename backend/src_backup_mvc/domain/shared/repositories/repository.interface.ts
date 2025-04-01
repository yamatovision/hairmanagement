/**
 * 基本リポジトリインターフェース
 * すべてのドメインリポジトリの基本となるインターフェース
 */
export interface IRepository<T, ID> {
  /**
   * 新しいエンティティを保存する
   * @param entity 保存するエンティティ
   * @returns 保存されたエンティティ
   */
  create(entity: T): Promise<T>;

  /**
   * IDによってエンティティを検索する
   * @param id エンティティのID
   * @returns 見つかったエンティティまたはnull
   */
  findById(id: ID): Promise<T | null>;

  /**
   * すべてのエンティティを取得する
   * @returns エンティティの配列
   */
  findAll(): Promise<T[]>;

  /**
   * 条件に合致するエンティティを検索する
   * @param filter 検索条件
   * @returns 条件に合致するエンティティの配列
   */
  findByFilter(filter: object): Promise<T[]>;

  /**
   * エンティティを更新する
   * @param id 更新するエンティティのID
   * @param entity 更新データを含むエンティティ
   * @returns 更新されたエンティティ
   */
  update(id: ID, entity: Partial<T>): Promise<T | null>;

  /**
   * エンティティを削除する
   * @param id 削除するエンティティのID
   * @returns 削除操作の結果
   */
  delete(id: ID): Promise<boolean>;
  
  /**
   * IDによってエンティティが存在するか確認する
   * @param id エンティティのID
   * @returns 存在すればtrue
   */
  exists(id: ID): Promise<boolean>;
}