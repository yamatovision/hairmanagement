import { Document, Model } from 'mongoose';

/**
 * Mongooseとの型定義互換性を向上させるためのヘルパー型
 * _idとidの互換性を解決するためのヘルパー型
 */
export type WithId<T> = Omit<T, 'id'> & { _id: string };

/**
 * ドキュメント型のヘルパー
 * MongooseドキュメントをT型と互換性を持たせる
 */
export type MongooseDocument<T> = Omit<Document, '_id'> & WithId<T>;

/**
 * モデル型のヘルパー
 * TMethods: モデルに追加するスタティックメソッド
 */
export type MongooseModel<T, TMethods = {}> = Model<MongooseDocument<T>> & TMethods;

/**
 * ドキュメントをインターフェース型に変換するためのヘルパーインターフェース
 */
export interface DocumentToInterface {
  toInterface<T>(): T;
}