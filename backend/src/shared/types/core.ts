/**
 * 基本型定義
 * アプリケーション全体で使用される基本的な型定義
 * 
 * 作成日: 2025/04/05
 */

/**
 * 共通基本型定義
 * MongooseとTypeScriptの互換性を確保するための基本型
 */
export type BaseModelType = {
  id: string;            // TypeScript側でのID (クライアント側表示用)
  _id?: string;          // Mongoose側のID (_idをそのまま渡される場合用)
  createdAt: string | Date; // 互換性のために文字列・日付両方を許容
  updatedAt: string | Date; // 互換性のために文字列・日付両方を許容
};

/**
 * Mongooseドキュメント表現のための基本インターフェース
 * 実際のMongooseモデル定義には拡張された独自インターフェースを使用する
 */
export interface IMongooseDocument {
  _id: string | any;     // MongooseのID (ObjectId型)
  createdAt?: Date;      // 作成日時
  updatedAt?: Date;      // 更新日時
  id?: string;          // 仮想プロパティとしてのid
}

/**
 * エンティティインターフェース
 * すべてのドメインエンティティの基本となるインターフェース
 */
export interface IEntity<T> {
  id: T;              // エンティティのID
  createdAt: Date;     // 作成日時
  updatedAt: Date;     // 更新日時
  
  // 2つのエンティティが同一かどうかを比較する
  equals(other?: IEntity<T>): boolean;
}

/**
 * 値オブジェクトインターフェース
 * すべての値オブジェクトの基本となるインターフェース
 */
export interface IValueObject {
  // プレーンなオブジェクトに変換
  toPlain(): Record<string, any>;
}

/**
 * APIレスポンス型
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * ページネーション型
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * ページネーション結果型
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * 検索パラメータ型
 */
export interface SearchParams {
  query?: string;
  filters?: Record<string, any>;
  pagination?: PaginationParams;
}

/**
 * エラーレスポンス型
 */
export type ErrorResponseType = {
  message: string;
  code?: string;
  details?: any;
};