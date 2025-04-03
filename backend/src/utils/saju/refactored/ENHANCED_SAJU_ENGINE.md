# SajuEngine強化実装計画

## 1. テスト結果分析

現在のSajuEngineテストでは、期待値と比較した場合に77%の精度（40/52）が出ていますが、主に以下の問題が明らかになりました：

1. **立春日の柱計算**: 特に2023年2月4日の立春日のテストでは年柱が「壬寅」であるべきが「癸卯」となっていて不一致
2. **年初の日柱・時柱計算**: 1985年1月1日、1995年1月1日などの年初の日では特に時柱の計算に誤差
3. **節気境界での月柱計算**: 立夏前、立秋前など節気境界付近の月柱計算に不一致

## 2. 強化すべき箇所

### 2.1 立春日の特殊処理

立春日では、その年の干支がまだ前年のままか、新年の干支に切り替わるかの判定が必要です。現在は単に日付で判断していますが、実際には「立春の時刻」を考慮する必要があります。

```typescript
// lunarConverter-new.ts に立春時刻の特殊処理を追加
function isBeforeLiChun(date: Date, year: number): boolean {
  // 立春の正確な時刻を取得（lunar-javascriptライブラリ使用）
  const liChunSolarTerm = getLiChunExactTime(year);
  
  // 与えられた日時が立春時刻より前かどうかを判定
  return date.getTime() < liChunSolarTerm.getTime();
}

// 実際の使用例
if (isBeforeLiChun(dateObj, dateObj.getFullYear())) {
  // 前年の干支を使用
  yearStem = getPreviousYearStem(dateObj.getFullYear());
  yearBranch = getPreviousYearBranch();
} else {
  // 新年の干支を使用
  yearStem = getCurrentYearStem(dateObj.getFullYear());
  yearBranch = getCurrentYearBranch();
}
```

### 2.2 時柱計算の韓国式対応の強化

現在の時柱計算は`hourBranchCalculator.ts`と`hourPillarCalculator.ts`で実装されていますが、韓国式の計算方法をより正確に実装する必要があります：

```typescript
// hourPillarCalculator.ts の韓国式計算を強化
export function calculateKoreanHourPillar(hour: number, dayStem: string): Pillar {
  // 1. 地支の計算（現在の実装を維持）
  const branchIndex = getHourBranchIndex(hour);
  const branch = BRANCHES[branchIndex];
  
  // 2. 日干に基づく時干の基準インデックスを取得（修正が必要な箇所）
  const hourStemBase = KOREAN_DAY_STEM_TO_HOUR_STEM_BASE[dayStem];
  
  // 3. 韓国式の時干計算（特に子刻、午刻などでの特殊ルール）
  const stemIndex = calculateKoreanHourStemIndex(hourStemBase, branchIndex, dayStem);
  const stem = STEMS[stemIndex];
  
  return {
    stem,
    branch,
    fullStemBranch: `${stem}${branch}`
  };
}

// 韓国式の時干インデックス計算（新規追加）
function calculateKoreanHourStemIndex(baseIndex: number, branchIndex: number, dayStem: string): number {
  // 子の刻と午の刻の特殊処理
  if (branchIndex === 0) { // 子の刻（23:00-01:00）
    // 特殊ルールに基づく処理
  } else if (branchIndex === 6) { // 午の刻（11:00-13:00）
    // 特殊ルールに基づく処理
  }
  
  // 標準的な時干計算
  return (baseIndex + Math.floor(branchIndex / 2)) % 10;
}
```

### 2.3 地方時調整の精密化

現在の地方時調整は経度に基づく単純な計算ですが、より精密に実装する必要があります：

```typescript
// DateTimeProcessor.ts の地方時調整を精密化
private applyLocalTimeAdjustment(date: SimpleDateTime): SimpleDateTime {
  // 地方時調整が無効なら元の日時をそのまま返す
  if (!this.options.useLocalTime) {
    return {...date};
  }
  
  // 経度に基づく地方時調整（より精密な計算）
  const longitude = this.getLongitude();
  
  // 標準時の子午線（日本は東経135度、韓国は東経127.5度）
  const standardMeridian = this.getStandardMeridian();
  
  // 経度に基づく時差（分）- より精密な計算
  const timeDifference = (longitude - standardMeridian) * 4;
  
  // 地方時調整をミリ秒単位で計算
  const adjustmentMs = timeDifference * 60 * 1000;
  
  // 日付をまたぐ可能性を考慮した調整
  const originalDate = new Date(date.year, date.month - 1, date.day, date.hour, date.minute);
  const adjustedTime = originalDate.getTime() + adjustmentMs;
  const adjustedDate = new Date(adjustedTime);
  
  // 調整後の日時を返す
  return {
    year: adjustedDate.getFullYear(),
    month: adjustedDate.getMonth() + 1,
    day: adjustedDate.getDate(),
    hour: adjustedDate.getHours(),
    minute: adjustedDate.getMinutes()
  };
}
```

### 2.4 特殊ケース対応の実装

テストケースで明らかになった特殊ケースに対応するために、専用のハンドラを実装します：

```typescript
// 新規作成: specialCaseHandler.ts
export function handleSpecialCase(date: Date, hour: number, location: string): boolean {
  // 1. 立春日の特殊処理
  if (isLiChunDay(date)) {
    // 立春時刻前後の処理
    return true;
  }
  
  // 2. 年初の特殊処理
  if (isNewYearDay(date)) {
    // 年初（1月1日）の特殊処理
    return true;
  }
  
  // 3. 子の刻・午の刻の特殊処理
  if ((hour >= 23 || hour <= 1) || (hour >= 11 && hour <= 13)) {
    // 子の刻（23:00-01:00）・午の刻（11:00-13:00）の特殊処理
    return true;
  }
  
  // 4. 節気境界の特殊処理
  if (isSolarTermBoundary(date)) {
    // 節気境界日の特殊処理
    return true;
  }
  
  return false;
}
```

## 3. 実装優先順位

1. **立春日の特殊処理の実装** - 精度向上に最も効果的
2. **韓国式時柱計算の強化** - 特に子の刻と午の刻での時干計算
3. **地方時調整の精密化** - 境界時間での計算精度向上
4. **特殊ケースハンドラの実装** - 残りの不一致ケースに対応

## 4. 実装ステップ

1. **新規ファイル作成**
   - `specialCaseHandler.ts` - 特殊ケース対応
   - `koreanHourCalculator.ts` - 韓国式時柱計算

2. **既存ファイル修正**
   - `lunarConverter-new.ts` - 立春時刻の精密計算を追加
   - `DateTimeProcessor.ts` - 地方時調整の精密化
   - `SajuEngine.ts` - 特殊ケースハンドラの統合

3. **テスト強化**
   - 特殊日付・時間のテストケースを追加
   - 期待値と実際の値の一致率を向上

## 5. 目標精度

現在の精度77%（40/52）から、95%以上の精度を目指します。残りの5%未満の誤差は、干支計算の文化的・地域的な解釈の違いによるものと考えられるため、完全な一致は目指しません。

## 6. 実装スケジュール

1. **立春日処理の強化** - 1日目
2. **韓国式時柱計算の実装** - 1日目
3. **地方時調整の精密化** - 2日目
4. **特殊ケースの実装** - 2日目
5. **テストと検証** - 3日目

## 7. テスト計画

1. すべての不一致テストケースに対する詳細なロギング
2. 四柱情報（年柱・月柱・日柱・時柱）の個別検証
3. 地域差（ソウル・東京）と時間帯の影響テスト
4. 節気境界や年初など特殊日付のエッジケーステスト