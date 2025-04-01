import { Model, Document, Connection } from 'mongoose';
import { IRepository } from '../../../domain/shared/repositories/repository.interface';
// 抽象クラスにデコレーターを適用する問題を回避するためにデコレーターを使わない

/**
 * MongoDB基本リポジトリ抽象クラス
 * Mongooseモデルに基づいたリポジトリの基本実装
 */
export abstract class MongoRepositoryBase<T, ID> implements IRepository<T, ID> {
  /**
   * コンストラクタ
   * @param connection MongoDBコネクション
   */
  constructor(protected readonly connection: Connection) {}
  
  /**
   * このリポジトリが使用するモデル名を取得する
   * サブクラスで実装される必要がある
   * @returns モデル名
   */
  protected abstract getModelName(): string;
  
  /**
   * Mongooseドキュメントからドメインエンティティへのマッピング
   * サブクラスで実装される必要がある
   * @param document MongooseドキュメントデータS
   * @returns ドメインエンティティ
   */
  protected abstract toEntity(document: Document): T;
  
  /**
   * ドメインエンティティからMongooseドキュメントへのマッピング
   * サブクラスで実装される必要がある
   * @param entity ドメインエンティティ
   * @returns ドキュメントデータ
   */
  protected abstract toDocument(entity: T): any;
  
  /**
   * このリポジトリが使用するMongooseモデルを取得する
   * @returns Mongooseモデル
   */
  protected getModel(): Model<any> {
    return this.connection.model(this.getModelName());
  }
  
  /**
   * 新しいエンティティを作成する
   * @param entity 作成するエンティティ
   * @returns 作成されたエンティティ
   */
  async create(entity: T): Promise<T> {
    const model = this.getModel();
    const data = this.toDocument(entity);
    const created = await model.create(data);
    return this.toEntity(created);
  }
  
  /**
   * IDによってエンティティを検索する
   * @param id エンティティのID
   * @returns 見つかったエンティティまたはnull
   */
  async findById(id: ID): Promise<T | null> {
    const model = this.getModel();
    const document = await model.findById(id).exec();
    
    if (!document) {
      return null;
    }
    
    return this.toEntity(document);
  }
  
  /**
   * すべてのエンティティを取得する
   * @returns エンティティの配列
   */
  async findAll(): Promise<T[]> {
    const model = this.getModel();
    const documents = await model.find().exec();
    return documents.map(doc => this.toEntity(doc));
  }
  
  /**
   * 条件に合致するエンティティを検索する
   * @param filter 検索条件
   * @returns 条件に合致するエンティティの配列
   */
  async findByFilter(filter: object): Promise<T[]> {
    const model = this.getModel();
    const documents = await model.find(filter).exec();
    return documents.map(doc => this.toEntity(doc));
  }
  
  /**
   * エンティティを更新する
   * @param id 更新するエンティティのID
   * @param entity 更新データを含むエンティティ
   * @returns 更新されたエンティティ
   */
  async update(id: ID, entity: Partial<T>): Promise<T | null> {
    const model = this.getModel();
    const data = this.toDocument(entity as T);
    
    // IDやその他のメタデータフィールドを削除
    delete data._id;
    delete data.id;
    delete data.createdAt;
    
    const updated = await model.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    ).exec();
    
    if (!updated) {
      return null;
    }
    
    return this.toEntity(updated);
  }
  
  /**
   * エンティティを削除する
   * @param id 削除するエンティティのID
   * @returns 削除操作の結果
   */
  async delete(id: ID): Promise<boolean> {
    const model = this.getModel();
    const result = await model.findByIdAndDelete(id).exec();
    return result !== null;
  }
  
  /**
   * IDによってエンティティが存在するか確認する
   * @param id エンティティのID
   * @returns 存在すればtrue
   */
  async exists(id: ID): Promise<boolean> {
    const model = this.getModel();
    const exists = await model.exists({ _id: id }).exec();
    return exists !== null;
  }
}