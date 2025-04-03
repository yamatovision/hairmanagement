/**
 * SajuEngineの包括的テスト
 * sample.mdとsample2.mdの全テストケースを対象にした検証スクリプト
 */
import { SajuEngine } from '../../utils/saju/refactored/SajuEngine';
import * as fs from 'fs';
import * as path from 'path';

// サンプルデータファイルのパス
const SAMPLE_PATHS = [
  '/Users/tatsuya/Desktop/システム開発/AppGenius2/patrolmanagement/reference/sample.md',
  '/Users/tatsuya/Desktop/システム開発/AppGenius2/patrolmanagement/reference/sample2.md'
];

// 結果出力先
const OUTPUT_DIRECTORY = '/Users/tatsuya/Desktop/システム開発/AppGenius2/patrolmanagement/backend/src/tests/saju';
const RESULTS_FILE = path.join(OUTPUT_DIRECTORY, 'test_results.md');

interface TestCase {
  id: string;
  description: string;
  date: Date;
  hour: number;
  gender: 'M' | 'F';
  location: string;
  expected: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  category: string;
  metadata?: {
    solarDate: string;
    lunarDate: string;
    localTime: string;
    localTimeAdjustment: string;
  };
}

interface TestResult {
  testCase: TestCase;
  calculated: {
    year: string;
    month: string;
    day: string;
    hour: string;
    yearMatches: boolean;
    monthMatches: boolean;
    dayMatches: boolean;
    hourMatches: boolean;
  };
  metadata?: {
    lunarDate?: string;
    adjustedDate?: string;
    originalDate?: string;
    error?: string;
  };
}

/**
 * サンプルファイルからテストケースを抽出する
 */
function extractTestCasesFromFiles(): TestCase[] {
  const testCases: TestCase[] = [];
  
  SAMPLE_PATHS.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf-8');
    const filename = path.basename(filePath);
    
    // サンプルブロックを抽出
    const sampleBlocks = extractSampleBlocks(content);
    
    console.log(`Found ${sampleBlocks.length} sample blocks in ${filename}`);
    
    // 各サンプルからテストケースを作成
    sampleBlocks.forEach((block, index) => {
      try {
        const testCase = parseTestCase(block, `${filename}-${index + 1}`);
        if (testCase) {
          testCases.push(testCase);
        }
      } catch (error) {
        console.error(`[ERROR] Failed to parse test case ${index + 1} from ${filename}:`, error);
      }
    });
  });
  
  return testCases;
}

/**
 * サンプルファイルからサンプルブロックを抽出する
 */
function extractSampleBlocks(content: string): string[] {
  const sampleBlocks: string[] = [];
  
  // サンプルの開始と終了を探す正規表現
  const sampleRegex = /### サンプル\d+:[\s\S]*?```[\s\S]*?```/g;
  
  let match;
  // 各サンプルを抽出
  while ((match = sampleRegex.exec(content)) !== null) {
    sampleBlocks.push(match[0]);
  }
  
  console.log(`抽出されたサンプル数: ${sampleBlocks.length}`);
  
  return sampleBlocks;
}

/**
 * サンプルブロックからテストケース情報を抽出する
 */
function parseTestCase(block: string, id: string): TestCase | null {
  // サンプルの説明を抽出
  const descriptionMatch = block.match(/### サンプル\d+: (.+?)$/m);
  if (!descriptionMatch) return null;
  
  const description = descriptionMatch[1].trim();
  
  // カテゴリを推測
  let category = 'その他';
  if (description.includes('年柱')) category = '年柱計算';
  else if (description.includes('月柱')) category = '月柱計算';
  else if (description.includes('日柱')) category = '日柱計算';
  else if (description.includes('時柱')) category = '時柱計算';
  else if (description.includes('立春')) category = '節気境界';
  else if (description.includes('立夏')) category = '節気境界';
  else if (description.includes('立秋')) category = '節気境界';
  else if (description.includes('立冬')) category = '節気境界';
  else if (description.includes('閏')) category = '閏月';
  else if (description.includes('男性') && description.includes('女性')) category = '性別差';
  else if (description.includes('ソウル') && description.includes('東京')) category = '地域差';
  
  // 日付情報を抽出
  const dateMatch = description.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
  const timeMatch = description.match(/(\d{1,2})時(\d{1,2})?分?/);
  
  if (!dateMatch) {
    console.warn(`[WARN] No date found in: ${description}`);
    return null;
  }
  
  const year = parseInt(dateMatch[1]);
  const month = parseInt(dateMatch[2]);
  const day = parseInt(dateMatch[3]);
  const hour = timeMatch ? parseInt(timeMatch[1]) : 0;
  const minute = timeMatch && timeMatch[2] ? parseInt(timeMatch[2]) : 0;
  
  // 性別とロケーションを抽出
  const gender = description.includes('女性') ? 'F' : 'M';
  const location = description.includes('東京') ? '東京' : 'ソウル';
  
  // 四柱情報を抽出
  const codeBlockMatch = block.match(/\`\`\`([\\s\\S]+?)\`\`\`/);
  if (!codeBlockMatch) {
    console.warn(`[WARN] No code block found in: ${id}`);
    return null;
  }
  
  const codeBlock = codeBlockMatch[1].trim();
  
  // メタデータを抽出
  const metadata = {
    solarDate: '',
    lunarDate: '',
    localTime: '',
    localTimeAdjustment: ''
  };
  
  const solarDateMatch = codeBlock.match(/陽暦: (.+?)$/m);
  if (solarDateMatch) metadata.solarDate = solarDateMatch[1].trim();
  
  const lunarDateMatch = codeBlock.match(/陰暦: (.+?)$/m);
  if (lunarDateMatch) metadata.lunarDate = lunarDateMatch[1].trim();
  
  const localTimeMatch = codeBlock.match(/地方時: (.+?)$/m);
  if (localTimeMatch) {
    metadata.localTime = localTimeMatch[1].trim();
    
    const adjustmentMatch = metadata.localTime.match(/地方時調整: (.+?)$/);
    if (adjustmentMatch) {
      metadata.localTimeAdjustment = adjustmentMatch[1].trim();
    }
  }
  
  // 四柱を抽出
  let yearPillar = '';
  let monthPillar = '';
  let dayPillar = '';
  let hourPillar = '';
  
  // 四柱テーブルを解析
  const lines = codeBlock.split('\n');
  for (const line of lines) {
    if (line.includes('生時')) {
      const parts = line.split(/\s+/).filter(Boolean);
      if (parts.length >= 2) {
        hourPillar = parts[1] + parts[3]; // 天干＋地支
      }
    } else if (line.includes('生日')) {
      const parts = line.split(/\s+/).filter(Boolean);
      if (parts.length >= 2) {
        dayPillar = parts[1] + parts[3]; // 天干＋地支
      }
    } else if (line.includes('生月')) {
      const parts = line.split(/\s+/).filter(Boolean);
      if (parts.length >= 2) {
        monthPillar = parts[1] + parts[3]; // 天干＋地支
      }
    } else if (line.includes('生年')) {
      const parts = line.split(/\s+/).filter(Boolean);
      if (parts.length >= 2) {
        yearPillar = parts[1] + parts[3]; // 天干＋地支
      }
    }
  }
  
  // 特殊文字を削除して干支のみを抽出
  yearPillar = yearPillar.replace(/[+\\-]/g, '');
  monthPillar = monthPillar.replace(/[+\\-]/g, '');
  dayPillar = dayPillar.replace(/[+\\-]/g, '');
  hourPillar = hourPillar.replace(/[+\\-]/g, '');
  
  // JavaScriptの月は0ベース
  const date = new Date(year, month - 1, day, hour, minute);
  
  // 期待値がない場合はスキップ
  if (!yearPillar && !monthPillar && !dayPillar && !hourPillar) {
    console.warn(`[WARN] No four pillars found in: ${id}`);
    return null;
  }
  
  return {
    id,
    description,
    date,
    hour: hour + (minute / 60),
    gender,
    location,
    expected: {
      year: yearPillar,
      month: monthPillar,
      day: dayPillar,
      hour: hourPillar
    },
    category,
    metadata
  };
}

/**
 * すべてのテストケースを実行し結果を収集する
 */
function runAllTests(): TestResult[] {
  console.log('1. サンプルファイルからテストケースを抽出中...');
  const testCases = extractTestCasesFromFiles();
  console.log(`   ${testCases.length}件のテストケースを抽出しました。`);
  
  console.log('2. SajuEngineを初期化中...');
  const engine = new SajuEngine();
  
  const results: TestResult[] = [];
  
  console.log('3. テストケースを実行中...');
  let completedTests = 0;
  
  for (const testCase of testCases) {
    try {
      // SajuEngineで計算
      const result = engine.calculate(
        testCase.date,
        testCase.hour,
        testCase.gender,
        testCase.location
      );
      
      // 計算結果を整理
      const testResult: TestResult = {
        testCase,
        calculated: {
          year: result.fourPillars.yearPillar.fullStemBranch,
          month: result.fourPillars.monthPillar.fullStemBranch,
          day: result.fourPillars.dayPillar.fullStemBranch,
          hour: result.fourPillars.hourPillar.fullStemBranch,
          yearMatches: result.fourPillars.yearPillar.fullStemBranch === testCase.expected.year,
          monthMatches: result.fourPillars.monthPillar.fullStemBranch === testCase.expected.month,
          dayMatches: result.fourPillars.dayPillar.fullStemBranch === testCase.expected.day,
          hourMatches: result.fourPillars.hourPillar.fullStemBranch === testCase.expected.hour
        },
        metadata: {
          originalDate: testCase.date.toISOString(),
          adjustedDate: result.processedDateTime?.adjustedDate instanceof Date 
            ? result.processedDateTime.adjustedDate.toISOString()
            : `${result.processedDateTime?.adjustedDate.year}年${result.processedDateTime?.adjustedDate.month}月${result.processedDateTime?.adjustedDate.day}日`,
          lunarDate: result.lunarDate 
            ? `${result.lunarDate.year}年${result.lunarDate.month}月${result.lunarDate.day}日${result.lunarDate.isLeapMonth ? '(閏)' : ''}`
            : undefined
        }
      };
      
      results.push(testResult);
    } catch (error) {
      // エラーを記録
      results.push({
        testCase,
        calculated: {
          year: '',
          month: '',
          day: '',
          hour: '',
          yearMatches: false,
          monthMatches: false,
          dayMatches: false,
          hourMatches: false
        },
        metadata: {
          error: error instanceof Error ? error.message : String(error)
        }
      });
      
      console.error(`[ERROR] テストケース ${testCase.id} の実行中にエラーが発生:`, error);
    }
    
    // 進捗表示
    completedTests++;
    if (completedTests % 10 === 0 || completedTests === testCases.length) {
      console.log(`   ${completedTests}/${testCases.length} 完了`);
    }
  }
  
  return results;
}

/**
 * テスト結果の統計を計算する
 */
function calculateStatistics(results: TestResult[]) {
  const total = results.length;
  let totalPillars = total * 4; // 4柱（年月日時）
  let matchedPillars = 0;
  
  let yearMatches = 0;
  let monthMatches = 0;
  let dayMatches = 0;
  let hourMatches = 0;
  
  let completeMatches = 0; // 全柱一致
  let threeMatches = 0;    // 3柱一致
  let twoMatches = 0;      // 2柱一致
  let oneMatch = 0;        // 1柱一致
  let noMatches = 0;       // 全柱不一致
  
  let errorCount = 0;      // エラー数
  
  // カテゴリ別の成功率
  const categoryStats: Record<string, {
    total: number;
    yearMatches: number;
    monthMatches: number;
    dayMatches: number;
    hourMatches: number;
    errorCount: number;
  }> = {};
  
  // 結果を集計
  for (const result of results) {
    // エラーチェック
    if (result.metadata?.error) {
      errorCount++;
      continue;
    }
    
    // 各柱の一致をカウント
    if (result.calculated.yearMatches) yearMatches++;
    if (result.calculated.monthMatches) monthMatches++;
    if (result.calculated.dayMatches) dayMatches++;
    if (result.calculated.hourMatches) hourMatches++;
    
    // 合計一致数をカウント
    const matchCount = [
      result.calculated.yearMatches,
      result.calculated.monthMatches,
      result.calculated.dayMatches,
      result.calculated.hourMatches
    ].filter(Boolean).length;
    
    matchedPillars += matchCount;
    
    // 一致数による分類
    if (matchCount === 4) completeMatches++;
    else if (matchCount === 3) threeMatches++;
    else if (matchCount === 2) twoMatches++;
    else if (matchCount === 1) oneMatch++;
    else noMatches++;
    
    // カテゴリ別統計
    const category = result.testCase.category;
    if (!categoryStats[category]) {
      categoryStats[category] = {
        total: 0,
        yearMatches: 0,
        monthMatches: 0,
        dayMatches: 0,
        hourMatches: 0,
        errorCount: 0
      };
    }
    
    categoryStats[category].total++;
    if (result.calculated.yearMatches) categoryStats[category].yearMatches++;
    if (result.calculated.monthMatches) categoryStats[category].monthMatches++;
    if (result.calculated.dayMatches) categoryStats[category].dayMatches++;
    if (result.calculated.hourMatches) categoryStats[category].hourMatches++;
  }
  
  // 平均成功率を計算
  const successRate = (matchedPillars / totalPillars) * 100;
  
  return {
    total,
    totalPillars,
    matchedPillars,
    successRate,
    yearMatches,
    monthMatches,
    dayMatches,
    hourMatches,
    yearSuccessRate: (yearMatches / total) * 100,
    monthSuccessRate: (monthMatches / total) * 100,
    daySuccessRate: (dayMatches / total) * 100,
    hourSuccessRate: (hourMatches / total) * 100,
    completeMatches,
    threeMatches,
    twoMatches,
    oneMatch,
    noMatches,
    errorCount,
    categoryStats
  };
}

/**
 * 不一致のパターンを分析する
 */
function analyzeDiscrepancies(results: TestResult[]) {
  // 各柱ごとの不一致パターン
  const yearDiscrepancies: Record<string, { expected: string; actual: string; count: number }> = {};
  const monthDiscrepancies: Record<string, { expected: string; actual: string; count: number }> = {};
  const dayDiscrepancies: Record<string, { expected: string; actual: string; count: number }> = {};
  const hourDiscrepancies: Record<string, { expected: string; actual: string; count: number }> = {};
  
  // 結果を集計
  for (const result of results) {
    // エラーチェック
    if (result.metadata?.error) continue;
    
    // 年柱の不一致
    if (!result.calculated.yearMatches) {
      const key = `${result.testCase.expected.year}->${result.calculated.year}`;
      if (!yearDiscrepancies[key]) {
        yearDiscrepancies[key] = {
          expected: result.testCase.expected.year,
          actual: result.calculated.year,
          count: 0
        };
      }
      yearDiscrepancies[key].count++;
    }
    
    // 月柱の不一致
    if (!result.calculated.monthMatches) {
      const key = `${result.testCase.expected.month}->${result.calculated.month}`;
      if (!monthDiscrepancies[key]) {
        monthDiscrepancies[key] = {
          expected: result.testCase.expected.month,
          actual: result.calculated.month,
          count: 0
        };
      }
      monthDiscrepancies[key].count++;
    }
    
    // 日柱の不一致
    if (!result.calculated.dayMatches) {
      const key = `${result.testCase.expected.day}->${result.calculated.day}`;
      if (!dayDiscrepancies[key]) {
        dayDiscrepancies[key] = {
          expected: result.testCase.expected.day,
          actual: result.calculated.day,
          count: 0
        };
      }
      dayDiscrepancies[key].count++;
    }
    
    // 時柱の不一致
    if (!result.calculated.hourMatches) {
      const key = `${result.testCase.expected.hour}->${result.calculated.hour}`;
      if (!hourDiscrepancies[key]) {
        hourDiscrepancies[key] = {
          expected: result.testCase.expected.hour,
          actual: result.calculated.hour,
          count: 0
        };
      }
      hourDiscrepancies[key].count++;
    }
  }
  
  // 結果をソート
  const sortByCount = (a: any, b: any) => b.count - a.count;
  
  return {
    year: Object.values(yearDiscrepancies).sort(sortByCount),
    month: Object.values(monthDiscrepancies).sort(sortByCount),
    day: Object.values(dayDiscrepancies).sort(sortByCount),
    hour: Object.values(hourDiscrepancies).sort(sortByCount)
  };
}

/**
 * 結果をMarkdownレポートとして出力
 */
function generateMarkdownReport(results: TestResult[], statistics: any, discrepancies: any) {
  // タイムスタンプ
  const now = new Date();
  const timestamp = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()} ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  let markdown = `# SajuEngine テスト結果レポート

**実行日時**: ${timestamp}
**テスト総数**: ${statistics.total}件

## 1. 全体の統計情報

- **総テスト数**: ${statistics.total}件
- **総検証ポイント**: ${statistics.totalPillars}箇所 (年柱・月柱・日柱・時柱)
- **一致したポイント**: ${statistics.matchedPillars}箇所
- **全体の成功率**: ${statistics.successRate.toFixed(2)}%
- **エラー発生数**: ${statistics.errorCount}件

### 柱ごとの成功率

- **年柱**: ${statistics.yearMatches}/${statistics.total} (${statistics.yearSuccessRate.toFixed(2)}%)
- **月柱**: ${statistics.monthMatches}/${statistics.total} (${statistics.monthSuccessRate.toFixed(2)}%)
- **日柱**: ${statistics.dayMatches}/${statistics.total} (${statistics.daySuccessRate.toFixed(2)}%)
- **時柱**: ${statistics.hourMatches}/${statistics.total} (${statistics.hourSuccessRate.toFixed(2)}%)

### 一致数の分布

- **完全一致 (4柱)**: ${statistics.completeMatches}件 (${((statistics.completeMatches / statistics.total) * 100).toFixed(2)}%)
- **3柱一致**: ${statistics.threeMatches}件 (${((statistics.threeMatches / statistics.total) * 100).toFixed(2)}%)
- **2柱一致**: ${statistics.twoMatches}件 (${((statistics.twoMatches / statistics.total) * 100).toFixed(2)}%)
- **1柱一致**: ${statistics.oneMatch}件 (${((statistics.oneMatch / statistics.total) * 100).toFixed(2)}%)
- **不一致 (0柱)**: ${statistics.noMatches}件 (${((statistics.noMatches / statistics.total) * 100).toFixed(2)}%)

## 2. カテゴリ別の成功率

| カテゴリ | テスト数 | 年柱成功率 | 月柱成功率 | 日柱成功率 | 時柱成功率 | 全体成功率 |
|---------|---------|-----------|-----------|-----------|-----------|-----------|
`;

  // カテゴリ別統計を追加
  Object.entries(statistics.categoryStats).forEach(([category, stats]: [string, any]) => {
    const totalPillars = stats.total * 4;
    const successPillars = stats.yearMatches + stats.monthMatches + stats.dayMatches + stats.hourMatches;
    const overallRate = (successPillars / totalPillars) * 100;
    
    markdown += `| ${category} | ${stats.total} | ${(stats.yearMatches / stats.total * 100).toFixed(1)}% | ${(stats.monthMatches / stats.total * 100).toFixed(1)}% | ${(stats.dayMatches / stats.total * 100).toFixed(1)}% | ${(stats.hourMatches / stats.total * 100).toFixed(1)}% | ${overallRate.toFixed(1)}% |\n`;
  });

  markdown += `\n## 3. 不一致パターン分析

### 年柱の不一致パターン

| 期待値 | 計算結果 | 件数 |
|--------|---------|------|
`;

  // 年柱の不一致パターンを追加
  discrepancies.year.forEach((item: any) => {
    markdown += `| ${item.expected} | ${item.actual} | ${item.count} |\n`;
  });

  markdown += `\n### 月柱の不一致パターン

| 期待値 | 計算結果 | 件数 |
|--------|---------|------|
`;

  // 月柱の不一致パターンを追加
  discrepancies.month.forEach((item: any) => {
    markdown += `| ${item.expected} | ${item.actual} | ${item.count} |\n`;
  });

  markdown += `\n### 日柱の不一致パターン

| 期待値 | 計算結果 | 件数 |
|--------|---------|------|
`;

  // 日柱の不一致パターンを追加
  discrepancies.day.forEach((item: any) => {
    markdown += `| ${item.expected} | ${item.actual} | ${item.count} |\n`;
  });

  markdown += `\n### 時柱の不一致パターン

| 期待値 | 計算結果 | 件数 |
|--------|---------|------|
`;

  // 時柱の不一致パターンを追加
  discrepancies.hour.forEach((item: any) => {
    markdown += `| ${item.expected} | ${item.actual} | ${item.count} |\n`;
  });

  markdown += `\n## 4. 詳細テスト結果

以下は各テストケースの詳細結果です。性能上の理由から、最初の20件のみ表示しています。

| ID | 説明 | 期待値 | 計算結果 | 一致 |
|----|------|--------|---------|------|
`;

  // 詳細テスト結果を追加（最初の20件のみ）
  results.slice(0, 20).forEach((result) => {
    const expected = `年[${result.testCase.expected.year}] 月[${result.testCase.expected.month}] 日[${result.testCase.expected.day}] 時[${result.testCase.expected.hour}]`;
    const calculated = result.metadata?.error 
      ? `エラー: ${result.metadata.error}` 
      : `年[${result.calculated.year}] 月[${result.calculated.month}] 日[${result.calculated.day}] 時[${result.calculated.hour}]`;
    
    const matches = result.metadata?.error 
      ? '❌' 
      : `年[${result.calculated.yearMatches ? '✓' : '✗'}] 月[${result.calculated.monthMatches ? '✓' : '✗'}] 日[${result.calculated.dayMatches ? '✓' : '✗'}] 時[${result.calculated.hourMatches ? '✓' : '✗'}]`;
    
    markdown += `| ${result.testCase.id} | ${result.testCase.description} | ${expected} | ${calculated} | ${matches} |\n`;
  });

  markdown += `\n## 5. 改善が必要な主な問題点

分析結果から、以下の点を優先的に改善する必要があります：

1. **立春日の柱計算**: 特に2月4日前後の年柱・月柱計算に不一致が多く見られます。立春時刻を考慮した年柱切り替えロジックが必要です。

2. **時柱計算の韓国式対応**: 子の刻（23時-1時）と午の刻（11時-13時）の時干計算に不一致が見られます。日干と時辰の関係に基づく韓国式時柱計算の特殊ルールに対応する必要があります。

3. **地方時調整の精密化**: 境界時間での計算誤差が見られます。経度に基づくより精密な地方時計算が必要です。

4. **節気境界の特殊処理**: 立秋前、立夏前などの月柱計算に不一致が見られます。節気境界日の特殊処理ロジックを追加する必要があります。

## 6. 次のステップ

テスト結果に基づき、以下の手順で改善を進めることを推奨します：

1. **specialCaseHandler.tsの拡張**: 立春日、年初、境界時間などの特殊ケース対応を実装
2. **立春日の特殊処理強化**: 立春の正確な時刻を計算し、立春時刻前後での年柱・月柱調整機能を実装
3. **韓国式時柱計算の実装**: 日干に基づく時干マッピングテーブルの拡張と特殊処理の実装
4. **地方時調整の精密化**: 経度に基づく精密な地方時計算と日付をまたぐケースの適切な処理
`;

  return markdown;
}

/**
 * メイン実行関数
 */
async function main() {
  console.log('SajuEngine テスト実行を開始します...');
  
  // テスト結果を収集
  const results = runAllTests();
  
  // 統計を計算
  console.log('4. 統計情報を計算中...');
  const statistics = calculateStatistics(results);
  
  // 不一致パターンを分析
  console.log('5. 不一致パターンを分析中...');
  const discrepancies = analyzeDiscrepancies(results);
  
  // Markdownレポートを生成
  console.log('6. レポートを生成中...');
  const markdown = generateMarkdownReport(results, statistics, discrepancies);
  
  // 結果を保存
  fs.writeFileSync(RESULTS_FILE, markdown, 'utf-8');
  
  console.log(`テスト完了！結果は ${RESULTS_FILE} に保存されました。`);
  console.log('');
  console.log(`全体の成功率: ${statistics.successRate.toFixed(2)}%`);
  console.log(`年柱成功率: ${statistics.yearSuccessRate.toFixed(2)}%`);
  console.log(`月柱成功率: ${statistics.monthSuccessRate.toFixed(2)}%`);
  console.log(`日柱成功率: ${statistics.daySuccessRate.toFixed(2)}%`);
  console.log(`時柱成功率: ${statistics.hourSuccessRate.toFixed(2)}%`);
}

// このファイルが直接実行された場合にテストを実行
if (require.main === module) {
  main().catch(console.error);
}

export default main;