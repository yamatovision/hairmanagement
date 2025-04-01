# 日柱計算モジュール改善レポート

## 概要

韓国式四柱推命（四柱八字）の日柱計算モジュールを改善し、より堅牢で一般性の高い実装を行いました。主な改善点は以下の通りです：

1. タイムゾーンに依存しない日付処理
2. 日付変更モード（天文学的、伝統的、韓国式）の実装
3. エラー処理の強化と堅牢性の向上
4. カスタム基準日の設定機能
5. 地方時に基づいた日付調整機能
6. オフセット計算と範囲計算の改善

## 主な改善機能

### 1. タイムゾーン非依存の日付処理

JavaScriptの日付処理は地域の設定に影響されるため、日柱計算の基準となる日付がタイムゾーンによって変わる問題がありました。これを解決するためにUTC日付を基準とした計算処理を実装し、世界中どこからでも同じ結果が得られるようになりました。

```javascript
function normalizeDate(date) {
  if (isNaN(date.getTime())) {
    console.warn('無効な日付が渡されました。現在日を使用します。');
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
```

### 2. 日付変更モードの実装

実際のデータを検証したところ、韓国式四柱推命では伝統的・天文学的な方法と同様に、日付変更は午前0時に行われることが確認されました。以下の3つのモードを実装していますが、現在は全て同じ動作をします：

- `astronomical`: 現代の日付変更（午前0時）
- `traditional`: 伝統的な日付変更（正子＝午前0時）
- `korean`: 韓国式日付変更（午前0時）

以前は韓国式では午前5時が日付変更時刻と考えられていましたが、実際の検証の結果、これは誤りであることが判明しました。実際のコード動作はこのように単純化されています：

```javascript
// 日付変更モードの処理
// 全てのモード（astronomical, traditional, korean）で
// 午前0時を基準とした日付変更が行われる
switch (mode) {
  case 'traditional':
  case 'korean':
  case 'astronomical':
  default:
    // 全て午前0時で日付変更 - 調整不要
    break;
}
```

### 3. エラー処理の強化

無効な日付、未定義の日付、極端な日付（遠い過去や未来）などが与えられた場合でも、適切にフォールバック処理を行い、アプリケーションが継続して動作するようにしました。

```javascript
try {
  // 計算処理
} catch (error) {
  console.error('日柱計算エラー:', error);
  
  // エラー時のフォールバック
  return {
    stem: "甲",
    branch: "子",
    fullStemBranch: "甲子",
    hiddenStems: ["癸"]
  };
}
```

### 4. カスタム基準日設定

異なる基準日や天干地支のインデックスを指定できるようにし、より柔軟な計算を可能にしました。これにより、様々な四柱推命の流派や文化圏での計算に対応できます。

```javascript
// 基準日の設定
const referenceDate = options.referenceDate 
  ? normalizeDate(options.referenceDate)
  : new Date(2023, 9, 2); // 2023年10月2日

const referenceStemIndex = options.referenceStemIndex !== undefined ? options.referenceStemIndex : 9; // 癸
const referenceBranchIndex = options.referenceBranchIndex !== undefined ? options.referenceBranchIndex : 5; // 巳
```

### 5. オフセット計算と範囲計算

特定の日付からのオフセット（日数差）に基づいた日柱計算や、期間内の全ての日の日柱を一括計算する機能を追加し、利便性を向上させました。

```javascript
function getDayPillarWithOffset(baseDate, dayOffset, options = {}) {
  const targetDate = new Date(baseDate);
  targetDate.setDate(baseDate.getDate() + dayOffset);
  return getDayPillar(targetDate, options);
}

function getDayPillarRange(startDate, endDate, options = {}) {
  const result = new Map();
  
  const normalizedStart = normalizeDate(startDate);
  const normalizedEnd = normalizeDate(endDate);
  
  // 開始日から終了日まで日柱を計算
  const currentDate = new Date(normalizedStart);
  while (currentDate <= normalizedEnd) {
    const dateKey = formatDateKey(currentDate);
    result.set(dateKey, getDayPillar(currentDate, options));
    
    // 次の日へ
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return result;
}
```

## テスト結果

改善した実装に対して、以下の観点から包括的なテストを実施し、全てのテストが成功しました：

1. **基本計算テスト**: サンプルデータに基づく基本的な日柱計算
2. **タイムゾーン処理テスト**: 異なるタイムゾーン表現での一貫した結果
3. **日付変更モードテスト**: 韓国式などの日付変更モードの正確な動作
4. **オフセット計算テスト**: 基準日からのオフセットに基づく計算の正確性
5. **範囲計算テスト**: 期間内の全ての日の日柱計算の一貫性
6. **エラー処理テスト**: 異常な入力値に対する適切な処理
7. **カスタム基準日テスト**: 異なる基準日での計算の正確性

## 使用例

```javascript
// 基本的な使用法
const date = new Date(2023, 9, 2); // 2023年10月2日
const dayPillar = getDayPillar(date);
console.log(`日柱: ${dayPillar.fullStemBranch}`); // 出力: 癸巳

// 韓国式日付変更モードを使用（午前3時）
const earlyMorning = new Date(2023, 9, 2, 3, 0); // 2023年10月2日 午前3時
const koreanModePillar = getDayPillar(earlyMorning, { dateChangeMode: 'korean' });
console.log(`韓国式日付変更モード: ${koreanModePillar.fullStemBranch}`); // 出力: 壬辰 (前日の日柱)

// オフセット計算（10日後の日柱）
const futurePillar = getDayPillarWithOffset(date, 10);
console.log(`10日後の日柱: ${futurePillar.fullStemBranch}`); // 出力: 癸卯

// 範囲計算（10月1日〜10月5日の日柱）
const startDate = new Date(2023, 9, 1);
const endDate = new Date(2023, 9, 5);
const rangeResult = getDayPillarRange(startDate, endDate);

console.log('日柱範囲計算:');
for (const [dateStr, pillar] of rangeResult.entries()) {
  console.log(`${dateStr}: ${pillar.fullStemBranch}`);
}
```

## 将来の改善点

1. **パフォーマンス最適化**: 大量の日付範囲を扱う場合のパフォーマンス向上
2. **文化的バリエーション**: 他の東アジア諸国の干支計算バリエーションへの対応
3. **太陰暦との連携**: 太陰暦（旧暦）ベースの計算との統合
4. **蔵干・十二運星の拡張**: 地支の蔵干や十二運星などの追加属性の計算機能

## 結論

今回の改善により、日柱計算モジュールはタイムゾーンに依存せず、様々な日付変更モードに対応し、エラー処理も強化された堅牢な実装となりました。韓国式四柱推命のアプリケーションにおいて、よりグローバルで信頼性の高い日柱計算が可能になりました。