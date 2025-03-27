/**
 * Mongooseとの型定義互換性を向上させるためのインターフェースと型定義
 * 
 * バックエンドのMongooseモデルとフロントエンド/sharedの型定義の互換性を確保するための
 * ヘルパー型とインターフェースを提供
 * 
 * 変更履歴:
 * - 2025/3/27: 初期作成 (Claude)
 * - 2025/3/27: 型互換性の強化とエラー修正 (Claude)
 */

import { Document, Model } from 'mongoose';
import { IMongooseDocument, IUser, IFortune, IConversation, IGoal, IMentorship, ITeamContribution, BaseModelType } from '@shared';

/**
 * Mongooseドキュメント拡張インターフェース
 * Tは基本モデル型 (IUser, IFortune など)
 */
export interface MongooseDocument<T extends BaseModelType> extends Document {
  _id: any;
  id?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // 一般的なデータモデル共通フィールド（具体的なタイプに応じて存在する可能性のあるフィールド）
  password?: string;
  email?: string;
  name?: string;
  role?: string;
  birthDate?: string;
  isActive?: boolean;
  lastLoginAt?: Date;
  elementalType?: any;
  messages?: any[];
  viewedAt?: Date;
  isArchived?: boolean;
  date?: string;
}

/**
 * インターフェースへの変換能力を持つインターフェース
 * toInterfaceメソッドは特定のモデル型を返す
 */
export interface DocumentToInterface {
  toInterface<T = any>(): T;
}

/**
 * 特定のモデル型を返すインターフェース変換インターフェース
 */
export interface UserDocumentToInterface {
  toInterface(): IUser;
}

export interface FortuneDocumentToInterface {
  toInterface(): IFortune;
}

export interface ConversationDocumentToInterface {
  toInterface(): IConversation;
}

export interface GoalDocumentToInterface {
  toInterface(): IGoal;
}

export interface MentorshipDocumentToInterface {
  toInterface(): IMentorship;
}

export interface TeamContributionDocumentToInterface {
  toInterface(): ITeamContribution;
}

/**
 * モデルの静的メソッドを含む拡張モデル型
 * T: 基本モデル型、TMethods: 静的メソッド
 */
export type MongooseModel<T extends BaseModelType, TMethods = {}> = Model<any> & TMethods;