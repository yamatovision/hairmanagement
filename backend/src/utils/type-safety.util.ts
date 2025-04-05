/**
 * 型安全性を向上させるためのユーティリティ関数
 * 
 * TypeScriptの型エラー、特にインデックスアクセスエラーを軽減するためのヘルパー関数を提供します。
 * 
 * 作成日: 2025/04/05
 * 作成者: TypeScript型安全性強化チーム
 */

/**
 * オブジェクトのプロパティに安全にアクセスする関数
 * 
 * @param obj アクセス対象のオブジェクト
 * @param key アクセスするキー
 * @param defaultValue キーが存在しない場合のデフォルト値
 * @returns オブジェクトのプロパティ値またはデフォルト値
 */
export function safeObjectAccess<T extends object, K extends PropertyKey>(
  obj: T,
  key: K,
  defaultValue: any = undefined
): any {
  if (!obj) return defaultValue;
  
  if (Object.prototype.hasOwnProperty.call(obj, key)) {
    return obj[key as unknown as keyof T];
  }
  
  return defaultValue;
}

/**
 * 型アサーションを行う前に値の検証を行う関数
 * 
 * @param value 検証する値
 * @param validValues 有効な値の配列
 * @param defaultValue 無効な場合のデフォルト値
 * @returns 検証済みの値またはデフォルト値
 */
export function validateBeforeAssertion<T>(
  value: unknown,
  validValues: T[],
  defaultValue: T
): T {
  if (
    value !== undefined &&
    value !== null &&
    typeof value === 'string' &&
    validValues.includes(value as T)
  ) {
    return value as T;
  }
  
  return defaultValue;
}

/**
 * レコードに安全にキーを追加する関数
 * 既存のレコードを変更せず、新しいレコードを返します。
 * 
 * @param record 元のレコード
 * @param key 追加するキー
 * @param value 追加する値
 * @returns 新しいレコード
 */
export function safeAddToRecord<K extends PropertyKey, V>(
  record: Record<K, V>,
  key: K,
  value: V
): Record<K, V> {
  return {
    ...record,
    [key]: value
  };
}

/**
 * オブジェクトに対して型安全な変換を適用する関数
 * 
 * @param obj 変換対象のオブジェクト
 * @param transformer キーと値のペアに対する変換関数
 * @returns 変換後の新しいオブジェクト
 */
export function transformObjectSafely<T extends object, R extends object>(
  obj: T,
  transformer: (key: keyof T, value: T[keyof T]) => [keyof R, R[keyof R]]
): R {
  const result = {} as R;
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const [newKey, newValue] = transformer(key as keyof T, obj[key as keyof T]);
      result[newKey] = newValue;
    }
  }
  
  return result;
}

/**
 * マップ（レコード）のキーを安全に取得する関数
 * 
 * @param map マップオブジェクト
 * @returns キーの配列
 */
export function safeGetKeys<K extends PropertyKey, V>(map: Record<K, V>): K[] {
  return Object.keys(map) as K[];
}

/**
 * マップ（レコード）の値を安全に取得する関数
 * 
 * @param map マップオブジェクト
 * @returns 値の配列
 */
export function safeGetValues<K extends PropertyKey, V>(map: Record<K, V>): V[] {
  return Object.values(map);
}

/**
 * マップ（レコード）のエントリーを安全に取得する関数
 * 
 * @param map マップオブジェクト
 * @returns [キー, 値]のペアの配列
 */
export function safeGetEntries<K extends PropertyKey, V>(map: Record<K, V>): [K, V][] {
  return Object.entries(map) as [K, V][];
}