/**
 * モデル変換ヘルパーユーティリティ
 * 型変換の一貫性を確保し、コード重複を削減するためのユーティリティ関数
 * 
 * 変更履歴:
 * - 2025/03/27: 初期実装 (Claude)
 */

import { BaseModelType } from '../index';

/**
 * MongooseスタイルのドキュメントからTypeScriptインターフェースに変換する
 * MongoDB固有の _id をTypeScriptのidフィールドに、その他のフィールドを適切に変換
 * 
 * @param doc MongooseドキュメントまたはJSONオブジェクト
 * @returns TypeScriptインターフェース表現
 */
export function documentToInterface<T extends BaseModelType>(doc: any): T | null {
  if (!doc) return null;
  
  // クローンを作成して元のオブジェクトを変更しないようにする
  const result: any = { ...doc };
  
  // _id処理: MongoDBの_idをTypeScriptのidとして設定
  if (result._id) {
    result.id = result._id.toString();
    delete result._id;
  }
  
  // __vを削除（Mongooseのバージョニングフィールドはクライアントに不要）
  if ('__v' in result) {
    delete result.__v;
  }
  
  // 日付フィールドをISOStringに変換
  ['createdAt', 'updatedAt', 'lastLoginAt', 'viewedAt', 'completedAt'].forEach(dateField => {
    if (result[dateField] instanceof Date) {
      result[dateField] = result[dateField].toISOString();
    }
  });
  
  // birthDateなどの日付のみのフィールドはYYYY-MM-DD形式に変換
  if (result.birthDate instanceof Date) {
    result.birthDate = result.birthDate.toISOString().split('T')[0];
  }
  
  if (result.date instanceof Date) {
    result.date = result.date.toISOString().split('T')[0];
  }
  
  return result as T;
}

/**
 * ドキュメントの配列をインターフェースの配列に変換
 * 
 * @param docs MongooseドキュメントまたはJSONオブジェクトの配列
 * @returns TypeScriptインターフェースの配列
 */
export function documentsToInterfaces<T extends BaseModelType>(docs: any[]): T[] {
  if (!docs || !Array.isArray(docs)) return [];
  return docs.map(doc => documentToInterface<T>(doc)).filter(Boolean) as T[];
}

/**
 * TypeScriptインターフェースをMongooseドキュメント用のオブジェクトに変換
 * 
 * @param data TypeScriptインターフェース
 * @returns Mongoose用オブジェクト
 */
export function interfaceToDocument<T extends BaseModelType>(data: Partial<T>): any {
  if (!data) return null;
  
  // クローンを作成して元のオブジェクトを変更しないようにする
  const result: any = { ...data };
  
  // idフィールドを_idに変換
  if (result.id && !result._id) {
    result._id = result.id;
  }
  
  // 保存用にidを削除
  if ('id' in result) {
    delete result.id;
  }
  
  return result;
}

/**
 * 一括して複数のドキュメントに型変換を適用する
 * サービス層で複数のMongooseクエリ結果を処理する際に便利
 * 
 * @param documents 様々なタイプのドキュメントを含むオブジェクト
 * @param conversionMap 各フィールドの型情報
 * @returns 変換されたオブジェクト
 */
export function convertAllDocuments<T extends Record<string, any>>(
  documents: Record<string, any>,
  conversionMap: Record<string, { type: string, isArray: boolean }>
): T {
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(documents)) {
    if (!value) {
      result[key] = value;
      continue;
    }
    
    const mappingInfo = conversionMap[key];
    
    if (!mappingInfo) {
      // マッピング情報がない場合はそのまま使用
      result[key] = value;
      continue;
    }
    
    if (mappingInfo.isArray) {
      // 配列の場合は各要素を変換
      result[key] = Array.isArray(value) 
        ? documentsToInterfaces(value)
        : [];
    } else {
      // 単一オブジェクトの場合
      result[key] = documentToInterface(value);
    }
  }
  
  return result as T;
}

/**
 * 日付文字列を一貫した形式に変換
 * 
 * @param dateStr 日付文字列またはDateオブジェクト
 * @param format 出力形式（isoが標準）
 * @returns 変換された日付文字列
 */
export function formatDate(
  dateStr: string | Date | undefined | null,
  format: 'iso' | 'date-only' | 'time-only' = 'iso'
): string | null {
  if (!dateStr) return null;
  
  let date: Date;
  try {
    date = dateStr instanceof Date ? dateStr : new Date(dateStr);
    if (isNaN(date.getTime())) return null;
  } catch (e) {
    return null;
  }
  
  switch (format) {
    case 'date-only':
      return date.toISOString().split('T')[0]; // YYYY-MM-DD
    case 'time-only':
      return date.toISOString().split('T')[1].split('.')[0]; // HH:MM:SS
    case 'iso':
    default:
      return date.toISOString();
  }
}