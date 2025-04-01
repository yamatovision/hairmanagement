/**
 * 型変換ヘルパーユーティリティ
 * Mongooseドキュメントと共有インターフェース間の変換を支援
 */

import { BaseModelType } from '../index';

/**
 * MongooseドキュメントからTypeScriptインターフェースに変換する
 * MongooseのドキュメントID (_id) をTypeScriptインターフェースのid形式に変換
 * 
 * @param doc Mongooseドキュメント
 * @returns インターフェース形式のオブジェクト
 */
export function documentToInterface<T extends BaseModelType>(doc: any): T {
  if (!doc) return null;

  // Document.toJSON()が呼ばれた後のオブジェクトか、通常のオブジェクトとして処理
  const objDoc = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  
  // _idを処理
  let result: any = {
    ...objDoc,
    id: objDoc._id?.toString() || objDoc.id,
  };

  // 日付の処理
  if (result.createdAt instanceof Date) {
    result.createdAt = result.createdAt.toISOString();
  }

  if (result.updatedAt instanceof Date) {
    result.updatedAt = result.updatedAt.toISOString();
  }

  // 特定のフィールドで日付変換が必要な場合は、ここで追加の処理を行う
  // 例: birthDateやその他の日付フィールド
  if (result.birthDate instanceof Date) {
    result.birthDate = result.birthDate.toISOString().split('T')[0]; // YYYY-MM-DD形式
  }

  return result as T;
}

/**
 * TypeScriptインターフェースからMongooseドキュメント用のオブジェクトに変換する
 * 
 * @param data インターフェース形式のオブジェクト
 * @returns Mongoose保存用オブジェクト
 */
export function interfaceToDocument<T extends BaseModelType>(data: Partial<T>): any {
  if (!data) return null;

  // クローンを作成して元のオブジェクトを変更しないようにする
  const result: any = { ...data };

  // idを_idに変換 (Mongooseは_idを期待する)
  if (result.id && !result._id) {
    result._id = result.id;
  }

  // 不要なIDフィールドを削除 (Mongooseが管理する)
  if (result.id) {
    delete result.id;
  }

  return result;
}

/**
 * MongooseドキュメントのコレクションからTypeScriptインターフェースの配列に変換する
 * 
 * @param docs Mongooseドキュメントの配列
 * @returns インターフェース形式のオブジェクト配列
 */
export function documentsToInterfaces<T extends BaseModelType>(docs: any[]): T[] {
  if (!docs || !Array.isArray(docs)) return [];
  return docs.map(doc => documentToInterface<T>(doc));
}

/**
 * 日付文字列を標準形式に変換する
 * 
 * @param dateValue 日付文字列または日付オブジェクト
 * @param format 出力形式 ('iso'|'date-only'|'time-only')
 * @returns 標準化された日付文字列
 */
export function formatDate(dateValue: string | Date, format: 'iso' | 'date-only' | 'time-only' = 'iso'): string {
  if (!dateValue) return null;
  
  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  
  // 無効な日付の場合
  if (isNaN(date.getTime())) return null;
  
  switch (format) {
    case 'date-only':
      return date.toISOString().split('T')[0]; // YYYY-MM-DD
    case 'time-only':
      return date.toISOString().split('T')[1].slice(0, 8); // HH:MM:SS
    case 'iso':
    default:
      return date.toISOString();
  }
}

/**
 * オブジェクト内の日付フィールドを一括で標準形式に変換する
 * 
 * @param obj 処理対象オブジェクト
 * @param dateFields 日付フィールド名の配列
 * @param format 日付フォーマット
 * @returns 処理後のオブジェクト
 */
export function formatObjectDates<T extends object>(obj: T, dateFields: (keyof T)[], format: 'iso' | 'date-only' | 'time-only' = 'iso'): T {
  if (!obj) return obj;
  
  const result = { ...obj };
  
  dateFields.forEach(field => {
    if (result[field]) {
      (result[field] as any) = formatDate(result[field] as unknown as string | Date, format);
    }
  });
  
  return result;
}