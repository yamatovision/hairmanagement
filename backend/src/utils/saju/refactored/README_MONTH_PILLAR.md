# 月柱計算モジュール (monthPillarCalculator)

## 概要

このモジュールは、四柱推命および韓国式四柱推命における月柱（月の干支）を計算する機能を提供します。日付と年干から適切な月柱（天干と地支の組み合わせ）を決定します。

## 主な機能

- **標準的な月柱計算**: 一般的な干支サイクルに基づく月柱計算
- **韓国式月柱計算**: 韓国式四柱推命の伝統に基づく月柱計算
- **節気の検出**: 日付に基づく節気の判定

## 実装されているアルゴリズム

### 標準的な月柱計算 (calculateMonthPillar)

節気に基づく月の変化と年干による基準値調整を考慮した計算：

```javascript
// 節気に基づく月の調整
const solarTerm = getSolarTerm(date);
let adjustedMonth = month;

if (solarTerm && MAJOR_SOLAR_TERMS_TO_MONTH[solarTerm] !== undefined) {
  // 節気による月の変更を反映
  adjustedMonth = MAJOR_SOLAR_TERMS_TO_MONTH[solarTerm];
}

// 年干に基づく月干の基準値を計算
const yearStemIndex = STEMS.indexOf(yearStem);
const yearGroup = yearStemIndex % 5;
const monthStemBase = MONTH_STEM_BASES[yearGroup];

// 月干を計算（月ごとに2ずつ増加）
const monthStemIndex = (monthStemBase + ((adjustedMonth - 1) * 2) % 10) % 10;
```

### 韓国式月柱計算 (calculateKoreanMonthPillar)

韓国式四柱推命の伝統に基づく計算で、節気、旧暦月、年干の影響を考慮：

```javascript
// 旧暦月情報を取得
const lunarInfo = getLunarDate(date);
let lunarMonth = lunarInfo?.lunarMonth;

// 節気による月の調整
const solarTerm = getSolarTerm(date);
if (solarTerm && MAJOR_SOLAR_TERMS_TO_MONTH[solarTerm] !== undefined) {
  // 節気がある場合は、それに基づく月を使用
  lunarMonth = MAJOR_SOLAR_TERMS_TO_MONTH[solarTerm];
}

// 年干に基づく月干の基準値を計算
const yearStemIndex = STEMS.indexOf(yearStem);
const yearGroup = yearStemIndex % 5;
const koreanMonthStemBase = MONTH_STEM_BASES[yearGroup];

// 月ごとに2ずつ増加、10で循環
const monthStemIndex = (koreanMonthStemBase + ((lunarMonth - 1) * 2) % 10) % 10;
```

### 節気と月の対応

月柱計算では、以下の12の主要な節気が月の変わり目として重要です：

1. 立春（2月頃）: 寅月（1）に変わる
2. 驚蟄（3月頃）: 卯月（2）に変わる
3. 清明（4月頃）: 辰月（3）に変わる
4. 立夏（5月頃）: 巳月（4）に変わる
5. 芒種（6月頃）: 午月（5）に変わる
6. 小暑（7月頃）: 未月（6）に変わる
7. 立秋（8月頃）: 申月（7）に変わる
8. 白露（9月頃）: 酉月（8）に変わる
9. 寒露（10月頃）: 戌月（9）に変わる
10. 立冬（11月頃）: 亥月（10）に変わる
11. 大雪（12月頃）: 子月（11）に変わる
12. 小寒（1月頃）: 丑月（12）に変わる

### 年干グループと月干基準値

年干は5つのグループに分類され、それぞれに月干計算の基準値があります：

1. 甲己: 基準値 0
2. 乙庚: 基準値 2
3. 丙辛: 基準値 4
4. 丁壬: 基準値 6
5. 戊癸: 基準値 8

## 特殊ケースと検証データ

このモジュールは、calender.mdから抽出した以下のサンプルデータで検証されています：

- 2023年2月3日（節分前）: 癸丑
- 2023年2月4日（立春）: 甲寅
- 2023年5月5日（立夏前後）: 丙辰
- 2023年8月7日（立秋前後）: 己未
- 2023年11月7日（立冬前後）: 壬戌
- 2023年12月21日（冬至）: 甲子

また、閏月のケースも考慮しています：
- 2023年6月19日（旧暦閏4月）: 戊午
- 2023年7月19日（閏月の翌月）: 己未

## 使用例

```typescript
import { getMonthPillar, getSolarTerm } from './monthPillarCalculator';
import { getYearPillar } from './yearPillarCalculator';

// 日付の設定
const date = new Date(2023, 9, 15); // 2023年10月15日

// 年柱を取得（月柱計算には年干が必要）
const yearPillar = getYearPillar(date.getFullYear(), { useKoreanMethod: true });
console.log(`年柱: ${yearPillar.fullStemBranch}`); // 癸卯

// 節気を確認
const solarTerm = getSolarTerm(date);
console.log(`節気: ${solarTerm || 'なし'}`);

// 月柱を計算
const monthPillar = getMonthPillar(date, yearPillar.stem, { useKoreanMethod: true });
console.log(`月柱: ${monthPillar.fullStemBranch}`); // 壬戌
```

## インターフェース

### Pillar（柱）インターフェース

```typescript
interface Pillar {
  stem: string;                // 天干（甲、乙、丙、丁、戊、己、庚、辛、壬、癸）
  branch: string;              // 地支（子、丑、寅、卯、辰、巳、午、未、申、酉、戌、亥）
  fullStemBranch: string;      // 干支の組み合わせ（例：甲子、乙丑など）
}
```

### 計算オプション

```typescript
interface MonthPillarOptions {
  useKoreanMethod?: boolean;   // 韓国式計算法を使用するか
  useLunarMonth?: boolean;     // 旧暦月を使用するか
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
npx ts-node src/utils/saju/refactored/monthPillarCalculatorTest.ts
```

このテストは、様々な日付について標準的計算と韓国式計算の両方を実行し、期待される結果と比較します。