# SajuEngine 改善計画

## 1. 現状分析

SajuEngineの現在の実装では、テストケースに対して約58%の成功率となっています。基本的な四柱計算と派生する十神関係計算の両方に精度向上の余地があります。

### 1.1 テスト結果の概要

**基本四柱の計算精度：**
- テスト対象: 3つのテストケース × 4柱（年・月・日・時）= 12ポイント
- 成功: 7ポイント (58%)
- 失敗: 5ポイント (42%)

**十神関係の計算精度：**
- 地支の十神関係: 約49%の成功率
- 蔵干の十神関係: 約57%の成功率

### 1.2 代表的な不一致例

| テストケース | lunar-javascript結果 | 期待値 | 不一致の柱 |
|------------|---------------------|-------|------------|
| 2023年2月4日 0時 (立春日) | 年柱[癸卯] 月柱[甲寅] 日柱[癸巳] 時柱[癸子] | 年柱[壬寅] 月柱[癸丑] 日柱[癸巳] 時柱[壬子] | 年柱・月柱・時柱 |
| 2023年10月15日 1時 (子の刻) | 年柱[癸卯] 月柱[壬戌] 日柱[丙午] 時柱[丙子] | 年柱[癸卯] 月柱[壬戌] 日柱[丙午] 時柱[戊子] | 時柱のみ |
| 1985年1月1日 0時 | 年柱[甲子] 月柱[丙子] 日柱[庚子] 時柱[庚子] | 年柱[甲子] 月柱[丙子] 日柱[庚子] 時柱[丙子] | 時柱のみ |

## 2. 体系的テスト計画

現在の限定的なテストケースから得られた洞察は貴重ですが、より体系的なアプローチでパターンを特定する必要があります。

### 2.1 包括的テスト戦略

1. **sample.mdとsample2.mdの全テストケースを実行**
   - 約100件のテストケースを抽出して実行
   - 年柱・月柱・日柱の各柱ごとに一致/不一致を記録
   - テストケースの属性（年月日、時間、性別、場所）ごとにグループ化して分析

2. **各柱ごとの不一致パターン分析**
   - 年柱の不一致が発生する条件パターンの特定
   - 月柱の不一致が発生する条件パターンの特定
   - 日柱の不一致が発生する条件パターンの特定
   - 時柱の不一致が発生する条件パターンの特定（優先度低）

3. **データ分析に基づく仮説検証**
   - 特定したパターンに基づく仮説の構築
   - 追加テストケースによる仮説の検証
   - 確認された条件に基づく修正案の精緻化

### 2.2 テスト実装計画

```javascript
// テスト実行関数
function runComprehensiveTests() {
  const allTestResults = [];
  const sampleTestCases = extractTestCasesFromSampleFiles();
  
  for (const testCase of sampleTestCases) {
    // SajuEngineで計算
    const result = calculateWithSajuEngine(testCase);
    
    // 期待値と比較
    const comparison = compareWithExpected(result, testCase.expected);
    
    // メタデータを含めて記録
    allTestResults.push({
      testCase,
      result,
      comparison,
      metadata: extractMetadata(testCase) // 節気、時間帯、性別、場所などの属性
    });
  }
  
  // 結果の分析
  const analysis = analyzeTestResults(allTestResults);
  
  // 詳細レポートの生成
  generateDetailedReport(analysis);
  
  return analysis;
}

// 分析関数
function analyzeTestResults(results) {
  // 各柱ごとの不一致の分析
  const yearPillarAnalysis = analyzePillarDiscrepancies(results, 'year');
  const monthPillarAnalysis = analyzePillarDiscrepancies(results, 'month');
  const dayPillarAnalysis = analyzePillarDiscrepancies(results, 'day');
  const hourPillarAnalysis = analyzePillarDiscrepancies(results, 'hour');
  
  // 属性ごとの相関分析
  const correlationAnalysis = analyzeCorrelations(results);
  
  return {
    yearPillarAnalysis,
    monthPillarAnalysis,
    dayPillarAnalysis,
    hourPillarAnalysis,
    correlationAnalysis,
    overallStats: calculateOverallStats(results)
  };
}
```

## 3. 原因分析（予備的）

現在のデータから推測される主な不一致の原因は以下の通りです。これらは包括的テスト後に更新されます。

### 3.1 節気境界の処理

韓国式四柱推命では、二十四節気（特に立春など）が年と月の変わり目として重要です。lunar-javascriptではこの処理が異なります。

```javascript
// 立春日の例：2023年2月4日
// lunar-javascript: 年柱[癸卯]（2023年の干支）
// 期待値: 年柱[壬寅]（2022年の干支、立春前として処理）
```

### 3.2 時柱計算の規則

韓国式の時柱計算には独自の規則があり、日柱の天干に応じたパターンがあります。

```javascript
// 日柱が「丙」の場合の時柱天干（子の刻）
// lunar-javascript: 丙（独自の計算方式）
// 期待値: 戊（韓国式計算方式）
```

### 3.3 地方時調整の精度

地方時調整が日付や時刻の変化に影響を与え、特に境界時間帯で計算結果に違いをもたらしています。

```javascript
// ソウルの地方時調整: -32分（経度126.98度に基づく）
// 東京の地方時調整: +18分（経度139.77度に基づく）
```

## 4. 改善計画（包括的テスト後に更新予定）

現在の知見に基づく予備的な改善計画を以下に示します。包括的テスト後に具体的なパターンに基づいて更新されます。

### 4.1 節気境界処理の改良

```javascript
// 節気判定と特殊処理の実装
function handleSolarTerms(date, hour, processedDateTime) {
  // 二十四節気情報の取得
  const solarTerm = getSolarTerm(date);
  
  // 立春の特殊処理
  if (solarTerm.name === '立春') {
    const liChunTime = solarTerm.exactTime;
    const currentTime = new Date(date);
    currentTime.setHours(hour);
    
    // 立春の時刻前であれば、前年の年柱を使用
    if (currentTime < liChunTime) {
      return {
        yearAdjustment: {
          usePreviousYear: true
        }
      };
    }
  }
  
  // その他の節気境界の処理...
  
  return { yearAdjustment: null };
}
```

### 4.2 韓国式時柱計算の実装

```javascript
/**
 * 韓国式時柱計算
 * 日柱天干と時間帯から時柱天干を決定
 */
function calculateKoreanHourStem(dayStem, hourBranch) {
  // 韓国式時柱計算表
  const hourStemTable = {
    '甲': ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙'],
    '乙': ['丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁'],
    '丙': ['戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己'],
    '丁': ['庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛'],
    '戊': ['壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'],
    '己': ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙'],
    '庚': ['丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁'],
    '辛': ['戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己'],
    '壬': ['庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛'],
    '癸': ['壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
  };
  
  // 時間帯を地支に変換
  const hourToHourBranch = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const branchIndex = hourToHourBranch.indexOf(hourBranch);
  
  if (branchIndex === -1 || !hourStemTable[dayStem]) {
    return null; // 無効な入力
  }
  
  return hourStemTable[dayStem][branchIndex];
}
```

### 4.3 地方時調整の精密化

```javascript
/**
 * 地方時調整関数
 * 正確な地方時への変換と日付変更を処理
 */
function adjustToLocalTime(date, longitude) {
  // 標準時の子午線（東経135度が日本標準時、東経120度が韓国標準時）
  const standardMeridian = 135; // または120（地域による）
  
  // 経度に基づく時差（分）
  const timeDifference = (longitude - standardMeridian) * 4; // 1度 = 4分
  
  // 地方時に調整
  const localTimeMinutes = date.getHours() * 60 + date.getMinutes() + timeDifference;
  
  // 日付を跨ぐ可能性を考慮
  const adjustedDate = new Date(date);
  const daysDifference = Math.floor(localTimeMinutes / (24 * 60));
  
  if (daysDifference !== 0) {
    adjustedDate.setDate(adjustedDate.getDate() + daysDifference);
  }
  
  // 時間と分を設定
  const adjustedHours = Math.floor((localTimeMinutes % (24 * 60)) / 60);
  const adjustedMinutes = Math.floor(localTimeMinutes % 60);
  
  adjustedDate.setHours(adjustedHours);
  adjustedDate.setMinutes(adjustedMinutes);
  
  return {
    adjustedDate,
    timeDifference,
    crossedDateBoundary: daysDifference !== 0
  };
}
```

## 5. 包括的テスト実装

### 5.1 テストケース抽出ツール

sample.mdとsample2.mdから全てのテストケースを抽出するツールを実装します。

```javascript
// テストケース抽出ツールの実装
function extractTestCasesFromSampleFiles() {
  const sampleMdContent = readFileContent('sample.md');
  const sample2MdContent = readFileContent('sample2.md');
  
  const sampleTestCases = parseTestCasesFromContent(sampleMdContent);
  const sample2TestCases = parseTestCasesFromContent(sample2MdContent);
  
  return [...sampleTestCases, ...sample2TestCases];
}

// 文書からテストケースを抽出する関数
function parseTestCasesFromContent(content) {
  const testCases = [];
  
  // テストケースを識別するパターン
  const testCasePattern = /### サンプル\d+: (.+)[\s\S]+?```([\s\S]+?)```/g;
  
  let match;
  while ((match = testCasePattern.exec(content)) !== null) {
    const description = match[1].trim();
    const testCaseContent = match[2].trim();
    
    // テストケースからデータを抽出
    const testCase = parseTestCaseData(description, testCaseContent);
    if (testCase) {
      testCases.push(testCase);
    }
  }
  
  return testCases;
}

// テストケースデータを解析する関数
function parseTestCaseData(description, content) {
  // 日付、時間、性別、場所を抽出
  const dateTimeMatch = description.match(/(\d{4})年(\d{1,2})月(\d{1,2})日 (\d{1,2})時/);
  const genderMatch = description.match(/(男性|女性)/);
  const locationMatch = description.match(/(東京|ソウル)/);
  
  if (!dateTimeMatch) return null;
  
  const year = parseInt(dateTimeMatch[1]);
  const month = parseInt(dateTimeMatch[2]) - 1; // JavaScriptの月は0始まり
  const day = parseInt(dateTimeMatch[3]);
  const hour = parseInt(dateTimeMatch[4]);
  
  const gender = genderMatch ? (genderMatch[1] === '男性' ? 'M' : 'F') : 'M';
  const location = locationMatch ? locationMatch[1] : 'ソウル';
  
  // 四柱の期待値を抽出
  const yearPillarMatch = content.match(/年柱\[([^\]]+)\]/);
  const monthPillarMatch = content.match(/月柱\[([^\]]+)\]/);
  const dayPillarMatch = content.match(/日柱\[([^\]]+)\]/);
  const hourPillarMatch = content.match(/時柱\[([^\]]+)\]/);
  
  return {
    description,
    date: new Date(year, month, day),
    hour,
    gender,
    location,
    expected: {
      year: yearPillarMatch ? yearPillarMatch[1] : null,
      month: monthPillarMatch ? monthPillarMatch[1] : null,
      day: dayPillarMatch ? dayPillarMatch[1] : null,
      hour: hourPillarMatch ? hourPillarMatch[1] : null
    }
  };
}
```

### 5.2 包括的テスト実行関数

```javascript
// 包括的テスト実行関数
async function runComprehensiveTests() {
  const testCases = extractTestCasesFromSampleFiles();
  const results = [];
  
  console.log(`全テストケース: ${testCases.length}件`);
  
  for (const testCase of testCases) {
    // SajuEngineで計算
    const engine = new SajuEngine();
    const result = engine.calculate(
      testCase.date,
      testCase.hour,
      testCase.gender,
      testCase.location
    );
    
    // 期待値と比較
    const comparison = compareWithExpected(result, testCase.expected);
    
    // メタデータを追加
    const metadata = {
      month: testCase.date.getMonth() + 1,
      day: testCase.date.getDate(),
      hour: testCase.hour,
      gender: testCase.gender,
      location: testCase.location,
      isSolarTerm: checkIfSolarTerm(testCase.date),
      solarTermName: getSolarTermName(testCase.date),
      timeCategory: categorizeTime(testCase.hour)
    };
    
    results.push({
      testCase,
      result,
      comparison,
      metadata
    });
    
    // 進捗表示
    console.log(`テスト: ${testCase.description} - 結果: ${comparison.matches}/${comparison.total}`);
  }
  
  // 結果の分析
  const analysis = analyzeTestResults(results);
  
  return {
    results,
    analysis
  };
}
```

### 5.3 分析関数

```javascript
// テスト結果の分析関数
function analyzeTestResults(results) {
  // 全体の統計
  const totalTests = results.length;
  const totalPillars = totalTests * 4; // 年月日時の4柱
  let matchedPillars = 0;
  
  // 各柱ごとの統計
  const yearPillarStats = { matched: 0, total: 0 };
  const monthPillarStats = { matched: 0, total: 0 };
  const dayPillarStats = { matched: 0, total: 0 };
  const hourPillarStats = { matched: 0, total: 0 };
  
  // 不一致のパターン分析用
  const yearPillarDiscrepancies = [];
  const monthPillarDiscrepancies = [];
  const dayPillarDiscrepancies = [];
  const hourPillarDiscrepancies = [];
  
  // 各テスト結果を集計
  for (const { testCase, result, comparison, metadata } of results) {
    // 全体の一致数を集計
    matchedPillars += comparison.matches;
    
    // 各柱ごとの統計を更新
    if (comparison.details.year.calculated === comparison.details.year.expected) {
      yearPillarStats.matched++;
    } else if (comparison.details.year.expected) {
      yearPillarDiscrepancies.push({ testCase, result, metadata });
    }
    
    if (comparison.details.month.calculated === comparison.details.month.expected) {
      monthPillarStats.matched++;
    } else if (comparison.details.month.expected) {
      monthPillarDiscrepancies.push({ testCase, result, metadata });
    }
    
    if (comparison.details.day.calculated === comparison.details.day.expected) {
      dayPillarStats.matched++;
    } else if (comparison.details.day.expected) {
      dayPillarDiscrepancies.push({ testCase, result, metadata });
    }
    
    if (comparison.details.hour.calculated === comparison.details.hour.expected) {
      hourPillarStats.matched++;
    } else if (comparison.details.hour.expected) {
      hourPillarDiscrepancies.push({ testCase, result, metadata });
    }
    
    // 各柱の合計数を更新
    if (comparison.details.year.expected) yearPillarStats.total++;
    if (comparison.details.month.expected) monthPillarStats.total++;
    if (comparison.details.day.expected) dayPillarStats.total++;
    if (comparison.details.hour.expected) hourPillarStats.total++;
  }
  
  // 属性ごとの相関分析
  const correlationAnalysis = {
    byMonth: analyzeByAttribute(results, 'month'),
    bySolarTerm: analyzeByAttribute(results, 'solarTermName'),
    byTimeCategory: analyzeByAttribute(results, 'timeCategory'),
    byLocation: analyzeByAttribute(results, 'location')
  };
  
  // 不一致パターンの分析
  const yearPillarPatterns = analyzePillarDiscrepancies(yearPillarDiscrepancies);
  const monthPillarPatterns = analyzePillarDiscrepancies(monthPillarDiscrepancies);
  const dayPillarPatterns = analyzePillarDiscrepancies(dayPillarDiscrepancies);
  const hourPillarPatterns = analyzePillarDiscrepancies(hourPillarDiscrepancies);
  
  return {
    overallStats: {
      totalTests,
      totalPillars,
      matchedPillars,
      successRate: (matchedPillars / totalPillars) * 100
    },
    pillarStats: {
      year: {
        matched: yearPillarStats.matched,
        total: yearPillarStats.total,
        successRate: yearPillarStats.total > 0 ? (yearPillarStats.matched / yearPillarStats.total) * 100 : 0
      },
      month: {
        matched: monthPillarStats.matched,
        total: monthPillarStats.total,
        successRate: monthPillarStats.total > 0 ? (monthPillarStats.matched / monthPillarStats.total) * 100 : 0
      },
      day: {
        matched: dayPillarStats.matched,
        total: dayPillarStats.total,
        successRate: dayPillarStats.total > 0 ? (dayPillarStats.matched / dayPillarStats.total) * 100 : 0
      },
      hour: {
        matched: hourPillarStats.matched,
        total: hourPillarStats.total,
        successRate: hourPillarStats.total > 0 ? (hourPillarStats.matched / hourPillarStats.total) * 100 : 0
      }
    },
    discrepancyPatterns: {
      year: yearPillarPatterns,
      month: monthPillarPatterns,
      day: dayPillarPatterns,
      hour: hourPillarPatterns
    },
    correlationAnalysis
  };
}
```

## 6. 最終改善実装計画（テスト結果後に確定）

包括的テスト結果に基づいて、以下の実装計画を確定します。このセクションはテスト結果を踏まえて更新されます。

### 6.1 節気境界処理の実装

韓国式四柱推命の節気境界ルールに基づき、特に立春などの重要な節気での処理を正確に実装します。

### 6.2 時柱計算の韓国式対応

韓国式の時柱計算規則を実装し、日干に基づいた時干の決定プロセスを正確に再現します。

### 6.3 地方時調整の精密化

正確な地方時調整処理を実装し、日付変更や季節による変動を考慮します。

### 6.4 十神関係計算の改善

正確な四柱計算をベースに、地支と蔵干の十神関係計算の精度を向上させます。

## 7. 期待される成果

この改善計画を実施することで、以下の成果が期待されます：

1. 四柱基本計算の精度：現在の58%から95%以上へ
2. 地支の十神関係計算の精度：現在の49%から90%以上へ
3. 蔵干の十神関係計算の精度：現在の57%から90%以上へ

より重要なのは、包括的テストによって特定された具体的なパターンに基づいて修正することで、見落とされがちな特殊ケースにも対応できるようになることです。

## 8. まとめ

SajuEngineの精度向上には、まず包括的なテストを実施して不一致のパターンを特定し、その結果に基づいて修正を行うという体系的なアプローチが必要です。このアプローチにより、韓国式四柱推命の複雑な規則に正確に対応したエンジンを実現できます。

### 次のステップ

1. 全てのサンプルテストケースを抽出して実行
2. 結果を詳細に分析してパターンを特定
3. 特定されたパターンに基づいて具体的な修正計画を策定
4. 優先順位に従って修正を実装
5. 定期的な再テストで改善を検証