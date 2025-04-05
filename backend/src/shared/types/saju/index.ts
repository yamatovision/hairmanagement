/**
 * 四柱推命型定義インデックス
 * 
 * 作成日: 2025/04/05
 * 更新日: 2025/04/05 - FortuneMap型を追加（Claude AI-C）
 */

// 基本型定義のエクスポート
export * from './core';

// 柱関連型定義のエクスポート
export * from './pillars';

// 運勢関連型定義のエクスポート
export * from './fortune';

// 四柱推命情報のマッピング型
import { TenGodType } from './core';

// 四柱推命基準情報用の型定義
export interface FortuneMap {
  year: TenGodType;
  month: TenGodType;
  day: TenGodType;
  hour: TenGodType;
}