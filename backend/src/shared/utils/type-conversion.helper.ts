/**
 * 型変換ヘルパー関数
 * 
 * 作成日: 2025/04/05
 */

import { IValueObject } from '../types/core';

/**
 * 任意のオブジェクトをプレーンなオブジェクトに変換する
 * 値オブジェクトの場合はtoPlain()メソッドを使用
 * 
 * @param obj 変換対象のオブジェクト
 * @returns プレーンなオブジェクト
 */
export function toPlainObject<T>(obj: T): Record<string, any> {
  if (!obj) return {};

  // toPlain() メソッドがあれば使用
  if (typeof (obj as any).toPlain === 'function') {
    return (obj as unknown as IValueObject).toPlain();
  }
  
  // JSONシリアライズによる深いコピー
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    console.error('オブジェクトのシリアライズに失敗しました:', error);
    return {};
  }
}

/**
 * プレーンなオブジェクトから特定の型のインスタンスを生成する
 * 
 * @param Type 生成するクラスのコンストラクタ
 * @param plain プレーンなオブジェクト
 * @returns 指定した型のインスタンス
 */
export function fromPlainObject<T>(Type: new (...args: any[]) => T, plain: any): T | null {
  if (!plain) return null;
  
  try {
    return new Type(plain);
  } catch (error) {
    console.error(`${Type.name}への変換に失敗しました:`, error);
    return null;
  }
}

/**
 * オブジェクトの配列をプレーンなオブジェクトの配列に変換
 * 
 * @param array 変換対象の配列
 * @returns プレーンなオブジェクトの配列
 */
export function toPlainArray<T>(array: T[]): Record<string, any>[] {
  if (!Array.isArray(array)) return [];
  return array.map(item => toPlainObject(item));
}

/**
 * プレーンなオブジェクトの配列から特定の型のインスタンスの配列を生成
 * 
 * @param Type 生成するクラスのコンストラクタ
 * @param plainArray プレーンなオブジェクトの配列
 * @returns 指定した型のインスタンスの配列
 */
export function fromPlainArray<T>(Type: new (...args: any[]) => T, plainArray: any[]): T[] {
  if (!Array.isArray(plainArray)) return [];
  
  return plainArray
    .map(item => fromPlainObject(Type, item))
    .filter((item): item is T => item !== null);
}