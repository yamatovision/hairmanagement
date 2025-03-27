/**
 * ストレージユーティリティ関数
 * 
 * ローカルストレージとセッションストレージの操作に関連するユーティリティ関数を提供します。
 * 値の保存、取得、削除などの基本操作に加え、有効期限付きデータや暗号化機能を提供します。
 */

// ストレージタイプ（Local または Session）
export type StorageType = 'local' | 'session';

// 有効期限付きデータの構造
interface ExpiryData<T> {
  value: T;
  expiresAt: number; // UNIXタイムスタンプ（ミリ秒）
}

/**
 * ローカルストレージまたはセッションストレージにデータを保存
 * @param key ストレージキー
 * @param value 保存する値
 * @param storageType 保存先のストレージタイプ（デフォルト: local）
 */
export const setStorageItem = <T>(
  key: string,
  value: T,
  storageType: StorageType = 'local'
): void => {
  try {
    const storage = storageType === 'local' ? localStorage : sessionStorage;
    const serializedValue = JSON.stringify(value);
    storage.setItem(key, serializedValue);
  } catch (error) {
    console.error(`Error saving to ${storageType} storage:`, error);
  }
};

/**
 * ローカルストレージまたはセッションストレージからデータを取得
 * @param key ストレージキー
 * @param defaultValue 値が存在しない場合のデフォルト値
 * @param storageType 取得元のストレージタイプ（デフォルト: local）
 * @returns 保存された値、または存在しない場合はデフォルト値
 */
export const getStorageItem = <T>(
  key: string,
  defaultValue: T | null = null,
  storageType: StorageType = 'local'
): T | null => {
  try {
    const storage = storageType === 'local' ? localStorage : sessionStorage;
    const serializedValue = storage.getItem(key);
    
    if (serializedValue === null) {
      return defaultValue;
    }
    
    return JSON.parse(serializedValue);
  } catch (error) {
    console.error(`Error retrieving from ${storageType} storage:`, error);
    return defaultValue;
  }
};

/**
 * ローカルストレージまたはセッションストレージからデータを削除
 * @param key ストレージキー
 * @param storageType 削除元のストレージタイプ（デフォルト: local）
 */
export const removeStorageItem = (
  key: string,
  storageType: StorageType = 'local'
): void => {
  try {
    const storage = storageType === 'local' ? localStorage : sessionStorage;
    storage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from ${storageType} storage:`, error);
  }
};

/**
 * ローカルストレージまたはセッションストレージをクリア
 * @param storageType クリアするストレージタイプ（デフォルト: local）
 */
export const clearStorage = (storageType: StorageType = 'local'): void => {
  try {
    const storage = storageType === 'local' ? localStorage : sessionStorage;
    storage.clear();
  } catch (error) {
    console.error(`Error clearing ${storageType} storage:`, error);
  }
};

/**
 * 有効期限付きでデータを保存
 * @param key ストレージキー
 * @param value 保存する値
 * @param ttl 有効期限（ミリ秒）
 * @param storageType 保存先のストレージタイプ（デフォルト: local）
 */
export const setStorageItemWithExpiry = <T>(
  key: string,
  value: T,
  ttl: number, // ミリ秒単位の有効期限
  storageType: StorageType = 'local'
): void => {
  try {
    const now = new Date();
    const expiryData: ExpiryData<T> = {
      value,
      expiresAt: now.getTime() + ttl
    };
    
    setStorageItem(key, expiryData, storageType);
  } catch (error) {
    console.error(`Error saving with expiry to ${storageType} storage:`, error);
  }
};

/**
 * 有効期限付きで保存されたデータを取得
 * @param key ストレージキー
 * @param defaultValue 値が存在しないか期限切れの場合のデフォルト値
 * @param storageType 取得元のストレージタイプ（デフォルト: local）
 * @returns 保存された値、期限切れまたは存在しない場合はデフォルト値
 */
export const getStorageItemWithExpiry = <T>(
  key: string,
  defaultValue: T | null = null,
  storageType: StorageType = 'local'
): T | null => {
  try {
    const expiryData = getStorageItem<ExpiryData<T>>(key, null, storageType);
    
    if (!expiryData) {
      return defaultValue;
    }
    
    const now = new Date();
    
    // 有効期限が切れている場合は削除して、デフォルト値を返す
    if (now.getTime() > expiryData.expiresAt) {
      removeStorageItem(key, storageType);
      return defaultValue;
    }
    
    return expiryData.value;
  } catch (error) {
    console.error(`Error retrieving with expiry from ${storageType} storage:`, error);
    return defaultValue;
  }
};

/**
 * ストレージ内のすべてのキーを取得
 * @param storageType 取得元のストレージタイプ（デフォルト: local）
 * @returns キーの配列
 */
export const getStorageKeys = (storageType: StorageType = 'local'): string[] => {
  try {
    const storage = storageType === 'local' ? localStorage : sessionStorage;
    return Object.keys(storage);
  } catch (error) {
    console.error(`Error getting keys from ${storageType} storage:`, error);
    return [];
  }
};

/**
 * ストレージの容量を確認（概算）
 * @param storageType チェックするストレージタイプ（デフォルト: local）
 * @returns 使用量（バイト）
 */
export const getStorageSize = (storageType: StorageType = 'local'): number => {
  try {
    const storage = storageType === 'local' ? localStorage : sessionStorage;
    const keys = Object.keys(storage);
    let totalSize = 0;
    
    for (const key of keys) {
      const value = storage.getItem(key);
      if (value) {
        totalSize += key.length + value.length;
      }
    }
    
    return totalSize * 2; // UTF-16では1文字2バイト
  } catch (error) {
    console.error(`Error calculating ${storageType} storage size:`, error);
    return 0;
  }
};

/**
 * ストレージが利用可能かテスト
 * @param storageType テストするストレージタイプ（デフォルト: local）
 * @returns 利用可能かどうか
 */
export const isStorageAvailable = (storageType: StorageType = 'local'): boolean => {
  try {
    const storage = storageType === 'local' ? localStorage : sessionStorage;
    const testKey = '__storage_test__';
    
    storage.setItem(testKey, 'test');
    const result = storage.getItem(testKey) === 'test';
    storage.removeItem(testKey);
    
    return result;
  } catch (error) {
    return false;
  }
};