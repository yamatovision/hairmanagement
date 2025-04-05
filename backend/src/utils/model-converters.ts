/**
 * Mongooseドキュメントを共有インターフェースに変換するユーティリティ関数
 * 
 * 変更履歴:
 * - 2025/03/26: 初期実装 (AppGenius)
 * - 2025/03/27: TypeScript型互換性修正 (AI-2)
 * - 2025/03/27: エラー修正と非ドキュメント対応 (Claude)
 */
import { Document } from 'mongoose';
import { IUser, IFortune, IEngagementAnalytics, ITeamAnalytics } from '@shared';
import { DocumentToInterface } from '../types/mongoose-extensions';

/**
 * ドキュメントをインターフェースに変換する共通関数
 * ドキュメント以外の値も受け付けるように機能強化
 */
export function documentToInterface<T>(doc: Document | null | any): T | null {
  if (!doc) return null;

  // プリミティブ値や非ドキュメントオブジェクトの場合はそのまま返す
  if (typeof doc !== 'object' || doc === null) {
    return doc as unknown as T;
  }
  
  // toInterfaceメソッドがある場合はそれを使用（最も高精度）
  if (typeof (doc as unknown as DocumentToInterface).toInterface === 'function') {
    return (doc as unknown as DocumentToInterface).toInterface<T>();
  }
  
  // toJSONメソッドがある場合はそれを使用
  if (typeof doc.toJSON === 'function') {
    const obj = doc.toJSON();
    return obj as T;
  }
  
  // 手動変換
  const obj = doc.toObject ? doc.toObject() : JSON.parse(JSON.stringify(doc));
  
  // _idが存在する場合だけid変換を行う
  const result = {
    ...obj,
    ...(obj._id ? { id: obj._id.toString() } : {})
  };
  
  if (obj._id) {
    delete result._id;
  }
  if ('__v' in result) {
    delete result.__v;
  }
  
  return result as T;
}

/**
 * ドキュメント配列をインターフェース配列に変換
 */
export function documentsToInterfaces<T>(docs: Document[] | null | any[]): T[] {
  if (!docs) return [];
  // nullの可能性があるアイテムをフィルタリングして確実にT型の配列を返す
  return docs.map(doc => documentToInterface<T>(doc)).filter((item): item is T => item !== null);
}

// 型別変換関数
export function userDocumentToInterface(doc: Document | null): IUser | null {
  return documentToInterface<IUser>(doc);
}

export function fortuneDocumentToInterface(doc: Document | null): IFortune | null {
  return documentToInterface<IFortune>(doc);
}

// 分析データ変換関数
export function engagementAnalyticsDocumentToInterface(doc: Document | null): IEngagementAnalytics | null {
  return documentToInterface<IEngagementAnalytics>(doc);
}

export function teamAnalyticsDocumentToInterface(doc: Document | null): ITeamAnalytics | null {
  return documentToInterface<ITeamAnalytics>(doc);
}