/**
 * 共有型定義インデックス
 * 
 * 作成日: 2025/04/05
 * 更新日: 2025/04/05 - クリーンアーキテクチャに合わせて整理（Claude）
 */

// 基本型定義のエクスポート
export * from './core';

// 四柱推命関連型定義のエクスポート
export * from './saju';

// モデル関連型定義のエクスポート
export * from './models';

// 互換性のために utils/result.util のエクスポートも含める
// 注: タイプセーフなResult型はエラーハンドリングに重要
export * from '../utils/result.util';