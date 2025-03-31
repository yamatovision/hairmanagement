# 韓国式四柱推命計算システム

サンプルデータに基づいて抽出した一般アルゴリズムによる韓国式四柱推命計算システムです。

## システム概要

このシステムは、生年月日時に基づいて四柱推命（韓国式）の干支を計算します。四柱推命は東アジアの伝統的な占術で、生年月日時から導き出される四つの柱（年柱・月柱・日柱・時柱）に基づいて運勢を判断するものです。

## 機能一覧

- 四柱（年柱・月柱・日柱・時柱）の計算
- 旧暦（陰暦）と新暦（陽暦）の変換
- 節気（二十四節気）の判定
- 蔵干（地支に内包される天干）の算出
- 十神関係の計算
- 五行属性プロファイルの生成
- 十二運星・十二神殺の計算

## モジュール構成

システムは以下のモジュールで構成されています：

1. **基本モジュール**
   - `types.ts` - 共通の型定義
   - `sajuCalculator.ts` - メインの計算クラス
   - `index.ts` - 外部向けAPIの定義

2. **四柱計算モジュール**
   - `koreanYearPillarCalculator.ts` - 年柱計算
   - `koreanMonthPillarCalculator.ts` - 月柱計算
   - `dayPillarCalculator.ts` - 日柱計算
   - `hourPillarCalculator.ts` - 時柱計算
  
3. **支援モジュール**
   - `lunarDateCalculator.ts` - 旧暦変換
   - `tenGodCalculator.ts` - 十神計算
   - `twelveFortuneSpiritCalculator.ts` - 十二運星・十二神殺計算

## 使用方法

基本的な使用例：

```typescript
import { SajuCalculator } from './utils/saju/refactored';

// 生年月日時を指定（例：1986年5月26日5時）
const birthDate = new Date(1986, 4, 26); // 月は0起点
const birthHour = 5;
const gender = 'M'; // 'M'=男性, 'F'=女性

// 四柱推命計算
const result = SajuCalculator.calculate(birthDate, birthHour, gender);

// 結果表示
console.log('四柱：', 
  `年柱[${result.fourPillars.yearPillar.fullStemBranch}] ` +
  `月柱[${result.fourPillars.monthPillar.fullStemBranch}] ` +
  `日柱[${result.fourPillars.dayPillar.fullStemBranch}] ` +
  `時柱[${result.fourPillars.hourPillar.fullStemBranch}]`);

// 五行属性
console.log('五行属性：', 
  `${result.elementProfile.yinYang}${result.elementProfile.mainElement}(主)`,
  `/ ${result.elementProfile.secondaryElement}(副)`);

// 十神関係
console.log('十神関係：');
Object.entries(result.tenGods).forEach(([pillar, god]) => {
  console.log(`  ${pillar}: ${god}`);
});
```

より高度な使用例：

```typescript
// 特定のオプションを指定
const options = {
  useLocalTime: true, // 地方時を使用
  location: { longitude: 126.9779, latitude: 37.5665 } // ソウルの座標
};

// 四柱推命計算（オプション指定）
const result = SajuCalculator.calculate(birthDate, birthHour, gender, options);
```

## アルゴリズム

各モジュールの詳細なアルゴリズムは以下のファイルに記載されています：

- 年柱計算：`README_YEAR_PILLAR.md`
- 月柱計算：`README_MONTH_PILLAR.md`
- 日柱計算：`README_DAY_PILLAR.md`
- 時柱計算：`README_HOUR_PILLAR.md`（このファイルは未作成）

## テスト実行方法

統合テストの実行方法：

```bash
# TypeScriptコンパイル
npx tsc

# テスト実行
node -e "require('./index').runAllTests()"
```

または、個別のテストスクリプトを使用：

```bash
# テストスクリプト実行
./test-runner.sh
```

## 参考資料

このシステムは下記の資料を参考に、サンプルデータから計算アルゴリズムを抽出して実装しています：

1. 「calendar.md」のサンプルデータ
2. 韓国の伝統的四柱推命の手法（サジュ）
3. 十干十二支の関係性と五行属性に関する参考文献

## 注意事項

このシステムは、サンプルデータに基づいて実装されています。実際の韓国式四柱推命と完全に一致しない場合があります。専門的な占術目的ではなく、学習および参考用としてご利用ください。