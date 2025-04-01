import { Model, Document } from 'mongoose';
import { IRepository } from '../../../domain/repositories/IRepository';

/**
 * 基本リポジトリ抽象クラス
 * Mongooseモデルに基づいたリポジトリの基本実装
 */
export abstract class BaseRepository<T, ID> implements IRepository<T, ID> {
  /**
   * コンストラクタ
   * @param model このリポジトリが使用するMongooseモデル
   */
  constructor(protected readonly model: Model<Document>) {}

  /**
   * エンティティモデルからドメインエンティティへの変換
   * サブクラスで実装される必要がある
   * @param model データベースから取得したモデル
   * @returns ドメインエンティティ
   */
  protected abstract toDomainEntity(model: any): T;

  /**
   * ドメインエンティティからモデルデータへの変換
   * サブクラスで実装される必要がある
   * @param entity ドメインエンティティ
   * @returns モデルデータ
   */
  protected abstract toModelData(entity: T): any;

  /**
   * 新しいエンティティを作成する
   * @param entity 作成するエンティティ
   * @returns 作成されたエンティティ
   */
  async create(entity: T): Promise<T> {
    const modelData = this.toModelData(entity);
    const created = await this.model.create(modelData);
    return this.toDomainEntity(created);
  }

  /**
   * IDによってエンティティを検索する
   * @param id エンティティのID
   * @returns 見つかったエンティティまたはnull
   */
  async findById(id: ID): Promise<T | null> {
    const found = await this.model.findById(id).exec();
    if (!found) {
      return null;
    }
    return this.toDomainEntity(found);
  }

  /**
   * すべてのエンティティを取得する
   * @returns エンティティの配列
   */
  async findAll(): Promise<T[]> {
    const all = await this.model.find().exec();
    return all.map(item => this.toDomainEntity(item));
  }

  /**
   * 条件に合致するエンティティを検索する
   * @param filter 検索条件
   * @returns 条件に合致するエンティティの配列
   */
  async findByFilter(filter: object): Promise<T[]> {
    const found = await this.model.find(filter).exec();
    return found.map(item => this.toDomainEntity(item));
  }

  /**
   * エンティティを更新する
   * @param id 更新するエンティティのID
   * @param entity 更新データを含むエンティティ
   * @returns 更新されたエンティティ
   */
  async update(id: ID, entity: Partial<T>): Promise<T | null> {
    const modelData = this.toModelData(entity as T);
    
    // IDやその他のメタデータフィールドを削除
    delete modelData._id;
    delete modelData.id;
    delete modelData.createdAt;
    
    const updated = await this.model.findByIdAndUpdate(
      id,
      { $set: modelData },
      { new: true }
    ).exec();
    
    if (!updated) {
      return null;
    }
    
    return this.toDomainEntity(updated);
  }

  /**
   * エンティティを削除する
   * @param id 削除するエンティティのID
   * @returns 削除操作の結果
   */
  async delete(id: ID): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return result !== null;
  }
}