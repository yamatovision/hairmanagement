# 日柱計算モジュール (dayPillarCalculator)

## 概要

このモジュールは、四柱推命および韓国式四柱推命における日柱（日の干支）を計算する機能を提供します。日付から適切な日の干支（天干と地支の組み合わせ）を決定します。タイムゾーンに依存しない堅牢な実装となっています。

## 主な機能

- **タイムゾーン非依存**: 世界中どこからでも同じ結果が得られる堅牢な実装
- **日付変更モード**: 標準化された午前0時の日付変更に対応（天文学的、伝統的、韓国式の全てが同様の動作）
- **韓国式日柱計算**: 韓国式四柱推命の伝統に基づく日柱計算
- **地方時調整**: 経度に基づく地方時の調整機能
- **蔵干の取得**: 地支に対応する蔵干（内蔵された天干）の計算
- **オフセット計算**: 基準日からの日数差による計算
- **範囲計算**: 期間内の全日の日柱を一括計算

## 実装されているアルゴリズム

### 韓国式日柱計算 (calculateKoreanDayPillar)

日柱計算は、基準日からの日数差と、干支の周期性に基づく計算です：

```javascript
// 基準日として、インデックスが既知の2023年10月2日を使用（日干支: 癸巳）
const refDate = new Date(2023, 9, 2);
const refStemIndex = 9; // 癸のインデックス
const refBranchIndex = 5; // 巳のインデックス

// 基準日からの日数を計算
const diffDays = Math.floor((adjustedDate.getTime() - refDate.getTime()) / (24 * 60 * 60 * 1000));

// 干支の周期で計算
const stemIndex = (refStemIndex + diffDays) % 10;
const branchIndex = (refBranchIndex + diffDays) % 12;

// 負の値の場合に調整（過去の日付の場合）
const adjustedStemIndex = stemIndex >= 0 ? stemIndex : stemIndex + 10;
const adjustedBranchIndex = branchIndex >= 0 ? branchIndex : branchIndex + 12;
```

この計算方法では、天干が10日周期、地支が12日周期で循環し、全体としては60日周期で同じ干支が繰り返されます。

### 地方時調整 (getLocalTimeAdjustedDate)

地域の経度に基づいて地方時を調整する機能:

```javascript
// 東経135度を標準時として時差を調整（日本標準時）
const standardMeridian = 135;
const timeDiffMinutes = (options.location.longitude - standardMeridian) * 4;

// 時差を分単位で調整
const adjustedDate = new Date(date.getTime() + timeDiffMinutes * 60 * 1000);
```

1度の経度差は4分の時差に相当します。地方時を考慮することで、より正確な日柱計算が可能になります。

## 検証データと周期性

このモジュールは、calender.mdから抽出した以下のサンプルデータで検証されています：

```
2023-10-01: 壬辰
2023-10-02: 癸巳
2023-10-03: 甲午
2023-10-04: 乙未
2023-10-05: 丙申
2023-10-06: 丁酉
2023-10-07: 戊戌
2023-10-15: 丙午
1986-05-26: 庚午
```

また、60日周期での繰り返しも検証済みです：
- 2023-10-01 (壬辰)
- 2023-11-30 (壬辰) - 60日後
- 2024-01-29 (壬辰) - 120日後

## 使用例

```typescript
import { getDayPillar, getDayPillarWithOffset, getDayPillarRange } from './dayPillarCalculator';

// 基本的な日柱計算
const date = new Date(2023, 9, 15); // 2023年10月15日
const dayPillar = getDayPillar(date);
console.log(`日柱: ${dayPillar.fullStemBranch}`); // 丙午

// 日付変更モードを使用（韓国式）
const earlyMorning = new Date(2023, 9, 2, 3, 0); // 2023年10月2日午前3時
const koreanModePillar = getDayPillar(earlyMorning, { dateChangeMode: 'korean' });
console.log(`韓国式日付変更モード: ${koreanModePillar.fullStemBranch}`); // 壬辰（前日扱い）

// 地方時を考慮した計算（東京の場合）
const tokyoOptions = {
  useLocalTime: true,
  location: {
    longitude: 139.7, // 東京の経度
    latitude: 35.7    // 東京の緯度
  }
};
const tokyoDayPillar = getDayPillar(date, tokyoOptions);
console.log(`地方時考慮の日柱: ${tokyoDayPillar.fullStemBranch}`);

// オフセット計算（10日後の日柱）
const futurePillar = getDayPillarWithOffset(date, 10);
console.log(`10日後の日柱: ${futurePillar.fullStemBranch}`);

// 範囲計算（10月1日〜10月5日の日柱）
const startDate = new Date(2023, 9, 1);
const endDate = new Date(2023, 9, 5);
const rangeResult = getDayPillarRange(startDate, endDate);

console.log('日柱範囲計算:');
for (const [dateStr, pillar] of rangeResult.entries()) {
  console.log(`${dateStr}: ${pillar.fullStemBranch}`);
}

// 蔵干の確認
console.log(`蔵干: ${dayPillar.hiddenStems.join(', ')}`); // 丁, 己
```

## インターフェース

### Pillar（柱）インターフェース

```typescript
interface Pillar {
  stem: string;                // 天干（甲、乙、丙、丁、戊、己、庚、辛、壬、癸）
  branch: string;              // 地支（子、丑、寅、卯、辰、巳、午、未、申、酉、戌、亥）
  fullStemBranch: string;      // 干支の組み合わせ（例：甲子、乙丑など）
  hiddenStems?: string[];      // 蔵干（地支に内包される天干）
}
```

### 計算オプション

```typescript
interface DayPillarOptions {
  dateChangeMode?: 'astronomical' | 'traditional' | 'korean'; // 日付変更モード
  referenceDate?: Date;        // 基準日のカスタマイズ
  referenceStemIndex?: number; // 基準日の天干インデックス
  referenceBranchIndex?: number; // 基準日の地支インデックス
  useLocalTime?: boolean;      // 地方時を使用するか
  location?: {                 // 場所の座標（地方時計算に使用）
    longitude: number;         // 経度
    latitude: number;          // 緯度
  };
  gender?: 'M' | 'F';          // 性別（M=男性, F=女性）
}
```

## 検証方法

モジュールの動作を検証するには、以下のテストスクリプトを実行してください：

```bash
# 基本的なテスト
npx ts-node src/utils/saju/refactored/dayPillarCalculatorTest.ts

# 堅牢性と日付変更モードのテスト
node src/utils/saju/refactored/test-comprehensive-fixed.js

# タイムゾーン処理のテスト
node src/utils/saju/refactored/test-timezone.js
```

これらのテストは以下の項目を検証します：

1. **基本計算テスト**: 既知のサンプルデータと結果を比較
2. **タイムゾーン処理テスト**: 異なるタイムゾーン表現での一貫性検証
3. **日付変更モードテスト**: 各日付変更モードの正確な動作確認
4. **オフセット計算テスト**: 日数オフセットの正確な計算
5. **範囲計算テスト**: 期間内の全日の計算の一貫性
6. **エラー処理テスト**: 無効な入力に対する適切な対応
7. **60日周期テスト**: 干支の周期性の検証

全てのテストが正常に通過することで、このモジュールが様々な状況で正確に動作することを確認できます。