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

2. **四柱計算モジュール（8つの分離モジュール）**
   - `yearStemCalculator.ts` - 年柱の天干計算
   - `yearBranchCalculator.ts` - 年柱の地支計算
   - `monthStemCalculator.ts` - 月柱の天干計算
   - `monthBranchCalculator.ts` - 月柱の地支計算
   - `dayStemCalculator.ts` - 日柱の天干計算
   - `dayBranchCalculator.ts` - 日柱の地支計算
   - `hourStemCalculator.ts` - 時柱の天干計算
   - `hourBranchCalculator.ts` - 時柱の地支計算
  
3. **支援モジュール**
   - `lunarDateCalculator.ts` - 旧暦変換
   - `lunarConverter.ts` - 旧暦変換補助
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
```

## 個別の天干地支計算

各柱の天干・地支を個別に計算する例（新しい8つのモジュール）：

```typescript
import { calculateYearStem } from './yearStemCalculator';
import { calculateYearBranch } from './yearBranchCalculator';
import { calculateMonthStem } from './monthStemCalculator';
import { calculateMonthBranch } from './monthBranchCalculator';
import { calculateDayStem } from './dayStemCalculator';
import { calculateDayBranch } from './dayBranchCalculator';
import { calculateHourStem } from './hourStemCalculator';
import { calculateHourBranch } from './hourBranchCalculator';

// 計算対象の日時
const birthDate = new Date(1986, 11, 20); // 1986年12月20日
const birthHour = 3; // 午前3時

// 年柱の計算
const yearStem = calculateYearStem(birthDate.getFullYear());
const yearBranch = calculateYearBranch(birthDate.getFullYear());

// 月柱の計算
const monthStem = calculateMonthStem(birthDate, yearStem);
const monthBranch = calculateMonthBranch(birthDate);

// 日柱の計算（地方時調整あり）
const options = {
  useLocalTime: true,
  location: { longitude: 126.9779, latitude: 37.5665 } // ソウルの座標
};
const dayStem = calculateDayStem(birthDate, options);
const dayBranch = calculateDayBranch(birthDate, options);

// 時柱の計算
const hourStem = calculateHourStem(birthHour, dayStem);
const hourBranch = calculateHourBranch(birthHour);

// 結果表示
console.log(`年柱: ${yearStem}${yearBranch}`);
console.log(`月柱: ${monthStem}${monthBranch}`);
console.log(`日柱: ${dayStem}${dayBranch}`);
console.log(`時柱: ${hourStem}${hourBranch}`);
```

## 旧暦変換の使用例

```typescript
// 新暦から旧暦への変換
import { getLunarDate } from './lunarDateCalculator';

// 新暦日付
const solarDate = new Date(1986, 11, 20); // 1986年12月20日

// 旧暦情報を取得
const lunarDate = getLunarDate(solarDate);
if (lunarDate) {
  console.log(`旧暦: ${lunarDate.lunarYear}年${lunarDate.lunarMonth}月${lunarDate.lunarDay}日 ${lunarDate.isLeapMonth ? '(閏月)' : ''}`);
}

// lunar-javascriptライブラリを使用した直接変換
// より精度の高い結果を得られます
import * as fs from 'fs';
import * as path from 'path';

// 該当するスクリプトを実行
const scriptPath = path.join(__dirname, 'lunarcalc.js');
const result = require('child_process').execSync(`node ${scriptPath}`).toString();
console.log(result);
```

## テスト実行方法

個々のモジュールのテスト実行方法：

```bash
# 年干の計算テスト
node yearStemCalculator.js

# 年支の計算テスト
node yearBranchCalculator.js

# 月干の計算テスト
node monthStemCalculator.js

# 月支の計算テスト
node monthBranchCalculator.js

# 日干の計算テスト
node dayStemCalculator.js

# 日支の計算テスト
node dayBranchCalculator.js

# 時干の計算テスト
node hourStemCalculator.js

# 時支の計算テスト
node hourBranchCalculator.js
```

特定の日付の旧暦変換のテスト：

```bash
# 旧暦変換テスト
node lunarcalc.js
```

## 参考資料

このシステムは下記の資料を参考に、サンプルデータから計算アルゴリズムを抽出して実装しています：

1. 「calendar.md」のサンプルデータ
2. 韓国の伝統的四柱推命の手法（サジュ）
3. 十干十二支の関係性と五行属性に関する参考文献

## 注意事項

このシステムは、サンプルデータに基づいて実装されています。実際の韓国式四柱推命と完全に一致しない場合があります。専門的な占術目的ではなく、学習および参考用としてご利用ください。