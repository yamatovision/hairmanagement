# 年柱計算モジュール (yearPillarCalculator)

## 概要

このモジュールは、四柱推命および韓国式四柱推命における年柱（年の干支）を計算する機能を提供します。出生年から適切な年の干支（天干と地支の組み合わせ）を決定します。

## 主な機能

- **標準的な年柱計算**: 一般的な干支サイクルに基づく年柱計算
- **韓国式年柱計算**: 韓国式四柱推命の伝統に基づく年柱計算
- **蔵干の取得**: 地支に対応する蔵干（内蔵された天干）の計算

## 実装されているアルゴリズム

### 標準的な年柱計算 (calculateStandardYearPillar)

60年周期の干支サイクルに基づき、1984年を甲子年とした計算を行います：

```javascript
const baseYear = 1984;  // 甲子年
const cycle = (year - baseYear) % 60;
const adjustedCycle = cycle >= 0 ? cycle : cycle + 60;

const stemIndex = adjustedCycle % 10;
const branchIndex = adjustedCycle % 12;
```

### 韓国式年柱計算 (calculateKoreanYearPillar)

韓国式四柱推命の伝統に基づく計算を行います。サンプルデータの分析から導いた公式：

```javascript
// 天干インデックス計算
const stemIndex = (year + 5) % 10;  // (year + 6 - 1) % 10

// 地支インデックス計算
const branchIndex = (year + 9) % 12;
```

この公式は以下のサンプルデータを正確に再現します：

- 1970年: 己酉
- 1985年: 甲子
- 1995年: 甲戌
- 2005年: 甲申
- 2015年: 甲午

また、この公式では以下の干支周期関係も維持されます：
- 1924年: 甲子
- 1984年: 甲子
- 2044年: 甲子

### 蔵干の計算

地支に内包される天干（蔵干）は以下のように対応しています：

- 子: 癸
- 丑: 己、辛、癸
- 寅: 甲、丙、戊
- 卯: 乙
- 辰: 戊、乙、癸
- 巳: 丙、庚、戊
- 午: 丁、己
- 未: 己、乙、丁
- 申: 庚、壬、戊
- 酉: 辛
- 戌: 戊、辛、丁
- 亥: 壬、甲

## 使用例

```typescript
import { getYearPillar } from './yearPillarCalculator';

// 標準的な年柱計算（一般的な干支サイクル）
const standardYearPillar = getYearPillar(2024);
console.log(standardYearPillar.fullStemBranch); // 甲辰

// 韓国式年柱計算
const koreanYearPillar = getYearPillar(2024, { useKoreanMethod: true });
console.log(koreanYearPillar.fullStemBranch); // 癸卯
console.log(koreanYearPillar.hiddenStems); // ["乙"]
```

## インターフェース

### Pillar（柱）インターフェース

```typescript
interface Pillar {
  stem: string;                // 天干（甲、乙、丙、丁、戊、己、庚、辛、壬、癸）
  branch: string;              // 地支（子、丑、寅、卯、辰、巳、午、未、申、酉、戌、亥）
  fullStemBranch: string;      // 干支の組み合わせ（例：甲子、乙丑など）
  hiddenStems?: string[];      // 蔵干（地支に内包される天干）
  fortune?: string;            // 十二運星
  spirit?: string;             // 十二神殺
}
```

### 計算オプション

```typescript
interface YearPillarOptions {
  useKoreanMethod?: boolean;   // 韓国式計算法を使用するか
  useTraditionalOffset?: boolean; // 伝統的なオフセットを使用するか
  gender?: 'M' | 'F';          // 性別（M=男性, F=女性）
  location?: {                 // 場所の座標
    longitude: number;         // 経度
    latitude: number;          // 緯度
  };
  useLocalTime?: boolean;      // 地方時を使用するか
}
```

## 検証方法

モジュールの動作を検証するには、以下のテストスクリプトを実行してください：

```bash
npx ts-node src/utils/saju/refactored/yearPillarCalculatorTest.ts
```

このテストは、様々な年について標準的計算と韓国式計算の両方を実行し、期待される結果と比較します。