/**
 * SajuEngineのテスト結果分析ファイル
 * サンプルファイルから抽出したテストケースと実際のSajuEngine計算結果を比較
 */
import { SajuEngine } from '../../utils/saju/refactored/SajuEngine';
import * as fs from 'fs';
import * as path from 'path';

// 結果出力先
const OUTPUT_DIRECTORY = './src/tests/saju';
const RESULTS_FILE = path.join(OUTPUT_DIRECTORY, 'test_results.md');

// テストケース定義
interface TestCase {
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
}

// テストデータセット
const TEST_CASES: TestCase[] = [
  // 1. 立春日の特殊処理に関するテスト
  {
    description: "2023年2月3日 12時 (立春前) - 女性 ソウル",
    date: new Date(2023, 1, 3),
    hour: 12,
    gender: 'F',
    location: 'ソウル',
    expected: {
      year: "壬寅",
      month: "癸丑",
      day: "壬辰",
      hour: "丙午"
    }
  },
  // 追加テストケース - サンプルからの抽出
  {
    description: "1970年1月1日 0時 - 男性 ソウル",
    date: new Date(1970, 0, 1),
    hour: 0,
    gender: 'M',
    location: 'ソウル',
    expected: {
      year: "己酉",
      month: "丙子",
      day: "辛巳",
      hour: "戊子"
    }
  },
  {
    description: "2023年2月4日 0時 (立春日) - 女性 ソウル",
    date: new Date(2023, 1, 4),
    hour: 0,
    gender: 'F',
    location: 'ソウル',
    expected: {
      year: "壬寅",
      month: "癸丑",
      day: "癸巳",
      hour: "壬子"
    }
  },
  {
    description: "2023年2月4日 12時 (立春) - 女性 東京",
    date: new Date(2023, 1, 4),
    hour: 12,
    gender: 'F',
    location: '東京',
    expected: {
      year: "癸卯",
      month: "甲寅",
      day: "癸巳",
      hour: "戊午"
    }
  },
  // 2. 時柱計算の特殊ケース
  {
    description: "2023年10月15日 1時 (子の刻) - 女性 ソウル",
    date: new Date(2023, 9, 15),
    hour: 1,
    gender: 'F',
    location: 'ソウル',
    expected: {
      year: "癸卯",
      month: "壬戌",
      day: "丙午",
      hour: "戊子"
    }
  },
  {
    description: "2023年10月15日 12時 - 男性 ソウル",
    date: new Date(2023, 9, 15),
    hour: 12,
    gender: 'M',
    location: 'ソウル',
    expected: {
      year: "癸卯",
      month: "壬戌",
      day: "丙午",
      hour: "甲午"
    }
  },
  // 3. 地域差の検証
  {
    description: "2023年10月15日 12時 - 男性 東京",
    date: new Date(2023, 9, 15),
    hour: 12,
    gender: 'M',
    location: '東京',
    expected: {
      year: "癸卯",
      month: "壬戌",
      day: "丙午",
      hour: "甲午"
    }
  },
  // 11. 日干が甲・己の時の時柱
  {
    description: "2023年3月1日 23時 (甲日の子刻近く) - 男性 ソウル",
    date: new Date(2023, 2, 1),
    hour: 23,
    gender: 'M',
    location: 'ソウル',
    expected: {
      year: "癸卯",
      month: "甲寅",
      day: "甲戌",
      hour: "甲亥"
    }
  },
  {
    description: "2023年3月6日 0時 (己日の子刻) - 男性 ソウル",
    date: new Date(2023, 2, 6),
    hour: 0,
    gender: 'M',
    location: 'ソウル',
    expected: {
      year: "癸卯",
      month: "甲寅",
      day: "己卯",
      hour: "甲子"
    }
  },
  // 12. 様々な日干での時柱検証
  {
    description: "2023年3月2日 12時 (乙日の午刻) - 男性 ソウル",
    date: new Date(2023, 2, 2),
    hour: 12,
    gender: 'M',
    location: 'ソウル',
    expected: {
      year: "癸卯",
      month: "甲寅",
      day: "乙亥",
      hour: "丙午"
    }
  },
  // 4. 節気境界の検証
  {
    description: "2023年5月5日 0時 (立夏前) - 女性 ソウル",
    date: new Date(2023, 4, 5),
    hour: 0,
    gender: 'F',
    location: 'ソウル',
    expected: {
      year: "癸卯",
      month: "丙辰",
      day: "癸亥",
      hour: "壬子"
    }
  },
  {
    description: "2023年8月7日 0時 (立秋前) - 女性 ソウル",
    date: new Date(2023, 7, 7),
    hour: 0,
    gender: 'F',
    location: 'ソウル',
    expected: {
      year: "癸卯",
      month: "己未",
      day: "丁酉",
      hour: "庚子"
    }
  },
  // 5. 年柱計算のテスト
  {
    description: "1985年1月1日 0時 - 男性 ソウル",
    date: new Date(1985, 0, 1),
    hour: 0,
    gender: 'M',
    location: 'ソウル',
    expected: {
      year: "甲子",
      month: "丙子",
      day: "庚子",
      hour: "丙子"
    }
  },
  {
    description: "1995年1月1日 0時 - 男性 ソウル",
    date: new Date(1995, 0, 1),
    hour: 0,
    gender: 'M',
    location: 'ソウル',
    expected: {
      year: "甲戌",
      month: "丙子",
      day: "壬辰",
      hour: "庚子"
    }
  },
  // 6. 追加サンプル - 年支の変化検証
  {
    description: "2022年1月31日 12時 - 男性 ソウル",
    date: new Date(2022, 0, 31),
    hour: 12,
    gender: 'M',
    location: 'ソウル',
    expected: {
      year: "辛丑",
      month: "辛丑",
      day: "己卯",
      hour: "丁巳"
    }
  },
  {
    description: "2022年2月1日 12時 - 男性 ソウル",
    date: new Date(2022, 1, 1),
    hour: 12,
    gender: 'M',
    location: 'ソウル',
    expected: {
      year: "辛丑",
      month: "辛丑",
      day: "庚辰",
      hour: "丁巳"
    }
  },
  // 7. 立夏前後のテスト
  {
    description: "2022年5月5日 0時 (立夏) - 女性 ソウル",
    date: new Date(2022, 4, 5),
    hour: 0,
    gender: 'F',
    location: 'ソウル',
    expected: {
      year: "壬寅",
      month: "丁巳",
      day: "丁亥",
      hour: "庚子"
    }
  },
  {
    description: "2022年5月5日 12時 (立夏) - 女性 ソウル",
    date: new Date(2022, 4, 5),
    hour: 12,
    gender: 'F',
    location: 'ソウル',
    expected: {
      year: "壬寅",
      month: "丁巳",
      day: "丁亥",
      hour: "丙午"
    }
  },
  // 8. 日柱計算の検証
  {
    description: "1986年7月1日 12時 - 男性 ソウル",
    date: new Date(1986, 6, 1),
    hour: 12,
    gender: 'M',
    location: 'ソウル',
    expected: {
      year: "丙寅",
      month: "己未",
      day: "戊子",
      hour: "丙午"
    }
  },
  {
    description: "1986年7月2日 12時 - 男性 ソウル",
    date: new Date(1986, 6, 2),
    hour: 12,
    gender: 'M',
    location: 'ソウル',
    expected: {
      year: "丙寅",
      month: "己未",
      day: "己丑",
      hour: "丙午"
    }
  },
  // 9. 時柱の子・午の刻特殊パターン
  {
    description: "2022年11月15日 0時 (子の刻) - 女性 ソウル",
    date: new Date(2022, 10, 15),
    hour: 0,
    gender: 'F',
    location: 'ソウル',
    expected: {
      year: "壬寅",
      month: "辛亥",
      day: "丁酉",
      hour: "戊子"
    }
  },
  {
    description: "2022年11月15日 12時 (午の刻) - 女性 ソウル",
    date: new Date(2022, 10, 15),
    hour: 12,
    gender: 'F',
    location: 'ソウル',
    expected: {
      year: "壬寅",
      month: "辛亥",
      day: "丁酉",
      hour: "甲午"
    }
  },
  // 10. 閏月検証
  {
    description: "2023年2月20日 12時 (閏月) - 男性 ソウル",
    date: new Date(2023, 1, 20),
    hour: 12,
    gender: 'M',
    location: 'ソウル',
    expected: {
      year: "癸卯",
      month: "甲寅",
      day: "己未",
      hour: "丙午"
    }
  },
  // 11. 日干が甲・己の時の時柱
  {
    description: "2023年3月1日 23時 (甲日の子刻近く) - 男性 ソウル",
    date: new Date(2023, 2, 1),
    hour: 23,
    gender: 'M',
    location: 'ソウル',
    expected: {
      year: "癸卯",
      month: "甲寅",
      day: "甲戌",
      hour: "甲亥"
    }
  },
  {
    description: "2023年3月6日 0時 (己日の子刻) - 男性 ソウル",
    date: new Date(2023, 2, 6),
    hour: 0,
    gender: 'M',
    location: 'ソウル',
    expected: {
      year: "癸卯",
      month: "甲寅",
      day: "己卯",
      hour: "甲子"
    }
  },
  // 12. 様々な日干での時柱検証
  {
    description: "2023年3月2日 12時 (乙日の午刻) - 男性 ソウル",
    date: new Date(2023, 2, 2),
    hour: 12,
    gender: 'M',
    location: 'ソウル',
    expected: {
      year: "癸卯",
      month: "甲寅",
      day: "乙亥",
      hour: "丙午"
    }
  },
  {
    description: "2023年3月3日 12時 (丙日の午刻) - 男性 ソウル",
    date: new Date(2023, 2, 3),
    hour: 12,
    gender: 'M',
    location: 'ソウル',
    expected: {
      year: "癸卯",
      month: "甲寅",
      day: "丙子",
      hour: "戊午"
    }
  },
  {
    description: "2023年3月4日 12時 (丁日の午刻) - 男性 ソウル",
    date: new Date(2023, 2, 4),
    hour: 12,
    gender: 'M',
    location: 'ソウル',
    expected: {
      year: "癸卯",
      month: "甲寅",
      day: "丁丑",
      hour: "庚午"
    }
  },
  {
    description: "2023年3月5日 12時 (戊日の午刻) - 男性 ソウル",
    date: new Date(2023, 2, 5),
    hour: 12,
    gender: 'M',
    location: 'ソウル',
    expected: {
      year: "癸卯",
      month: "甲寅",
      day: "戊寅",
      hour: "壬午"
    }
  }
];

// 追加テストケース
const MORE_TEST_CASES: TestCase[] = [
  {
    description: "1986年5月26日 5時 - 男性 東京",
    date: new Date(1986, 4, 26),
    hour: 5,
    gender: 'M',
    location: '東京',
    expected: {
      year: "丙寅",
      month: "戊午",
      day: "癸未",
      hour: "己卯"
    }
  },
  {
    description: "2022年4月6日 23時 - 女性 ソウル",
    date: new Date(2022, 3, 6),
    hour: 23,
    gender: 'F',
    location: 'ソウル',
    expected: {
      year: "壬寅",
      month: "乙卯",
      day: "乙酉",
      hour: "己亥"
    }
  },
  {
    description: "2024年2月4日 12時 (立春) - 女性 東京",
    date: new Date(2024, 1, 4),
    hour: 12,
    gender: 'F',
    location: '東京',
    expected: {
      year: "甲辰",
      month: "乙卯",
      day: "庚申",
      hour: "戊午"
    }
  },
  {
    description: "2023年2月3日 12時 - 女性 東京",
    date: new Date(2023, 1, 3),
    hour: 12,
    gender: 'F',
    location: '東京',
    expected: {
      year: "壬寅",
      month: "癸丑",
      day: "壬辰",
      hour: "丙午"
    }
  },
  {
    description: "1985年4月22日 10時 - 女性 ソウル",
    date: new Date(1985, 3, 22),
    hour: 10,
    gender: 'F',
    location: 'ソウル',
    expected: {
      year: "乙丑",
      month: "丙辰",
      day: "丁未",
      hour: "壬午"
    }
  },
  // 13. 様々な時刻の検証
  {
    description: "2023年7月15日 2時 - 男性 ソウル",
    date: new Date(2023, 6, 15),
    hour: 2,
    gender: 'M',
    location: 'ソウル',
    expected: {
      year: "癸卯",
      month: "庚申",
      day: "壬午",
      hour: "庚丑"
    }
  },
  {
    description: "2023年7月15日 4時 - 男性 ソウル",
    date: new Date(2023, 6, 15),
    hour: 4,
    gender: 'M',
    location: 'ソウル',
    expected: {
      year: "癸卯",
      month: "庚申",
      day: "壬午",
      hour: "壬寅"
    }
  },
  {
    description: "2023年7月15日 6時 - 男性 ソウル",
    date: new Date(2023, 6, 15),
    hour: 6,
    gender: 'M',
    location: 'ソウル',
    expected: {
      year: "癸卯",
      month: "庚申",
      day: "壬午",
      hour: "甲卯"
    }
  },
  {
    description: "2023年7月15日 8時 - 男性 ソウル",
    date: new Date(2023, 6, 15),
    hour: 8,
    gender: 'M',
    location: 'ソウル',
    expected: {
      year: "癸卯",
      month: "庚申",
      day: "壬午",
      hour: "丙辰"
    }
  },
  {
    description: "2023年7月15日 10時 - 男性 ソウル",
    date: new Date(2023, 6, 15),
    hour: 10,
    gender: 'M',
    location: 'ソウル',
    expected: {
      year: "癸卯",
      month: "庚申",
      day: "壬午",
      hour: "戊巳"
    }
  },
  // 14. 六十干支循環テスト
  {
    description: "1924年1月1日 0時 - 男性 ソウル",
    date: new Date(1924, 0, 1),
    hour: 0,
    gender: 'M',
    location: 'ソウル',
    expected: {
      year: "癸亥",
      month: "壬子",
      day: "丙戌",
      hour: "甲子"
    }
  },
  {
    description: "1984年1月1日 0時 - 男性 ソウル",
    date: new Date(1984, 0, 1),
    hour: 0,
    gender: 'M',
    location: 'ソウル',
    expected: {
      year: "癸亥",
      month: "壬子",
      day: "辛酉",
      hour: "甲子"
    }
  },
  {
    description: "2044年1月1日 0時 - 男性 ソウル",
    date: new Date(2044, 0, 1),
    hour: 0,
    gender: 'M',
    location: 'ソウル',
    expected: {
      year: "癸亥",
      month: "壬子",
      day: "乙未",
      hour: "甲子"
    }
  }
];

/**
 * テスト結果の型定義
 */
interface TestResult {
  description: string;
  expected: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  calculated: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  matches: {
    year: boolean;
    month: boolean;
    day: boolean;
    hour: boolean;
    total: number;
  };
  metadata?: {
    originalDate: string;
    adjustedDate: string;
    lunarDate?: string;
    error?: string;
  };
}

/**
 * メイン実行関数
 */
function runTestSuite() {
  console.log('SajuEngine テスト実行を開始します...');
  
  // SajuEngineを初期化
  const engine = new SajuEngine();
  
  // 全テストケース
  const allTestCases = [...TEST_CASES, ...MORE_TEST_CASES];
  
  // 結果を格納する配列
  const results: TestResult[] = [];
  
  // 各テストケースを実行
  for (const testCase of allTestCases) {
    try {
      // SajuEngineで計算
      const result = engine.calculate(
        testCase.date,
        testCase.hour,
        testCase.gender,
        testCase.location
      );
      
      // 計算結果
      const calculated = {
        year: result.fourPillars.yearPillar.fullStemBranch,
        month: result.fourPillars.monthPillar.fullStemBranch,
        day: result.fourPillars.dayPillar.fullStemBranch,
        hour: result.fourPillars.hourPillar.fullStemBranch
      };
      
      // 期待値との比較
      const matches = {
        year: calculated.year === testCase.expected.year,
        month: calculated.month === testCase.expected.month,
        day: calculated.day === testCase.expected.day,
        hour: calculated.hour === testCase.expected.hour,
        total: 0
      };
      
      // 合計一致数を計算
      matches.total = [matches.year, matches.month, matches.day, matches.hour]
        .filter(Boolean).length;
      
      // 結果を追加
      results.push({
        description: testCase.description,
        expected: testCase.expected,
        calculated,
        matches,
        metadata: {
          originalDate: testCase.date.toISOString(),
          adjustedDate: result.processedDateTime?.adjustedDate instanceof Date 
            ? result.processedDateTime.adjustedDate.toISOString()
            : `${result.processedDateTime?.adjustedDate.year}年${result.processedDateTime?.adjustedDate.month}月${result.processedDateTime?.adjustedDate.day}日`,
          lunarDate: result.lunarDate 
            ? `${result.lunarDate.year}年${result.lunarDate.month}月${result.lunarDate.day}日${result.lunarDate.isLeapMonth ? '(閏)' : ''}`
            : undefined
        }
      });
    } catch (error) {
      // エラーを記録
      results.push({
        description: testCase.description,
        expected: testCase.expected,
        calculated: { year: '', month: '', day: '', hour: '' },
        matches: { year: false, month: false, day: false, hour: false, total: 0 },
        metadata: {
          originalDate: testCase.date.toISOString(),
          adjustedDate: '',
          error: error instanceof Error ? error.message : String(error)
        }
      });
    }
  }
  
  // 統計情報
  const stats = calculateStatistics(results);
  
  // 結果レポート作成
  const report = generateReport(results, stats);
  
  // ファイルに保存
  fs.mkdirSync(OUTPUT_DIRECTORY, { recursive: true });
  fs.writeFileSync(RESULTS_FILE, report, 'utf-8');
  
  console.log('テスト完了！結果をコンソールに表示します：');
  displayResults(results, stats);
  console.log(`\n詳細なレポートは ${RESULTS_FILE} に保存されました。`);
}

/**
 * テスト結果の統計を計算
 */
function calculateStatistics(results: TestResult[]) {
  const total = results.length;
  const totalPillars = total * 4; // 4柱（年月日時）
  
  // 一致数のカウント
  let yearMatches = 0;
  let monthMatches = 0;
  let dayMatches = 0;
  let hourMatches = 0;
  
  // 柱ごとの不一致パターン
  const yearDiscrepancies: Record<string, number> = {};
  const monthDiscrepancies: Record<string, number> = {};
  const dayDiscrepancies: Record<string, number> = {};
  const hourDiscrepancies: Record<string, number> = {};
  
  // 一致数による分類
  let completeMatches = 0;
  let threeMatches = 0;
  let twoMatches = 0;
  let oneMatch = 0;
  let noMatches = 0;
  
  // 統計計算
  for (const result of results) {
    // 各柱の一致をカウント
    if (result.matches.year) yearMatches++;
    if (result.matches.month) monthMatches++;
    if (result.matches.day) dayMatches++;
    if (result.matches.hour) hourMatches++;
    
    // 不一致パターンを記録
    if (!result.matches.year) {
      const pattern = `${result.expected.year} → ${result.calculated.year}`;
      yearDiscrepancies[pattern] = (yearDiscrepancies[pattern] || 0) + 1;
    }
    if (!result.matches.month) {
      const pattern = `${result.expected.month} → ${result.calculated.month}`;
      monthDiscrepancies[pattern] = (monthDiscrepancies[pattern] || 0) + 1;
    }
    if (!result.matches.day) {
      const pattern = `${result.expected.day} → ${result.calculated.day}`;
      dayDiscrepancies[pattern] = (dayDiscrepancies[pattern] || 0) + 1;
    }
    if (!result.matches.hour) {
      const pattern = `${result.expected.hour} → ${result.calculated.hour}`;
      hourDiscrepancies[pattern] = (hourDiscrepancies[pattern] || 0) + 1;
    }
    
    // 一致数による分類
    switch (result.matches.total) {
      case 4: completeMatches++; break;
      case 3: threeMatches++; break;
      case 2: twoMatches++; break;
      case 1: oneMatch++; break;
      case 0: noMatches++; break;
    }
  }
  
  // 成功率を計算
  const totalMatches = yearMatches + monthMatches + dayMatches + hourMatches;
  const overallSuccessRate = (totalMatches / totalPillars) * 100;
  
  return {
    total,
    totalPillars,
    totalMatches,
    overallSuccessRate,
    pillars: {
      year: { matches: yearMatches, rate: (yearMatches / total) * 100, discrepancies: yearDiscrepancies },
      month: { matches: monthMatches, rate: (monthMatches / total) * 100, discrepancies: monthDiscrepancies },
      day: { matches: dayMatches, rate: (dayMatches / total) * 100, discrepancies: dayDiscrepancies },
      hour: { matches: hourMatches, rate: (hourMatches / total) * 100, discrepancies: hourDiscrepancies }
    },
    distribution: {
      complete: { count: completeMatches, rate: (completeMatches / total) * 100 },
      three: { count: threeMatches, rate: (threeMatches / total) * 100 },
      two: { count: twoMatches, rate: (twoMatches / total) * 100 },
      one: { count: oneMatch, rate: (oneMatch / total) * 100 },
      none: { count: noMatches, rate: (noMatches / total) * 100 }
    }
  };
}

/**
 * 結果をMarkdownレポートとして生成
 */
function generateReport(results: TestResult[], stats: any) {
  // 現在のタイムスタンプ
  const now = new Date();
  const timestamp = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()} ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  let markdown = `# SajuEngine テスト結果レポート

**実行日時**: ${timestamp}
**テスト総数**: ${stats.total}件

## 1. 全体の統計情報

- **総テスト数**: ${stats.total}件
- **総検証ポイント**: ${stats.totalPillars}箇所 (年柱・月柱・日柱・時柱)
- **一致したポイント**: ${stats.totalMatches}箇所
- **全体の成功率**: ${stats.overallSuccessRate.toFixed(2)}%

### 柱ごとの成功率

- **年柱**: ${stats.pillars.year.matches}/${stats.total} (${stats.pillars.year.rate.toFixed(2)}%)
- **月柱**: ${stats.pillars.month.matches}/${stats.total} (${stats.pillars.month.rate.toFixed(2)}%)
- **日柱**: ${stats.pillars.day.matches}/${stats.total} (${stats.pillars.day.rate.toFixed(2)}%)
- **時柱**: ${stats.pillars.hour.matches}/${stats.total} (${stats.pillars.hour.rate.toFixed(2)}%)

### 一致数の分布

- **完全一致 (4柱)**: ${stats.distribution.complete.count}件 (${stats.distribution.complete.rate.toFixed(2)}%)
- **3柱一致**: ${stats.distribution.three.count}件 (${stats.distribution.three.rate.toFixed(2)}%)
- **2柱一致**: ${stats.distribution.two.count}件 (${stats.distribution.two.rate.toFixed(2)}%)
- **1柱一致**: ${stats.distribution.one.count}件 (${stats.distribution.one.rate.toFixed(2)}%)
- **不一致 (0柱)**: ${stats.distribution.none.count}件 (${stats.distribution.none.rate.toFixed(2)}%)

## 2. 不一致パターン分析

### 年柱の不一致パターン

| 変換パターン | 件数 |
|------------|------|
${Object.entries(stats.pillars.year.discrepancies)
  .sort(([, a], [, b]) => (b as number) - (a as number))
  .map(([pattern, count]) => `| ${pattern} | ${count} |`)
  .join('\n')}

### 月柱の不一致パターン

| 変換パターン | 件数 |
|------------|------|
${Object.entries(stats.pillars.month.discrepancies)
  .sort(([, a], [, b]) => (b as number) - (a as number))
  .map(([pattern, count]) => `| ${pattern} | ${count} |`)
  .join('\n')}

### 日柱の不一致パターン

| 変換パターン | 件数 |
|------------|------|
${Object.entries(stats.pillars.day.discrepancies)
  .sort(([, a], [, b]) => (b as number) - (a as number))
  .map(([pattern, count]) => `| ${pattern} | ${count} |`)
  .join('\n')}

### 時柱の不一致パターン

| 変換パターン | 件数 |
|------------|------|
${Object.entries(stats.pillars.hour.discrepancies)
  .sort(([, a], [, b]) => (b as number) - (a as number))
  .map(([pattern, count]) => `| ${pattern} | ${count} |`)
  .join('\n')}

## 3. 詳細テスト結果

| 説明 | 期待値 | 計算結果 | 一致 |
|------|--------|---------|------|
${results.map(result => {
  const expected = `年[${result.expected.year}] 月[${result.expected.month}] 日[${result.expected.day}] 時[${result.expected.hour}]`;
  const calculated = result.metadata?.error 
    ? `エラー: ${result.metadata.error}` 
    : `年[${result.calculated.year}] 月[${result.calculated.month}] 日[${result.calculated.day}] 時[${result.calculated.hour}]`;
  
  const matches = result.metadata?.error 
    ? '❌' 
    : `年[${result.matches.year ? '✓' : '✗'}] 月[${result.matches.month ? '✓' : '✗'}] 日[${result.matches.day ? '✓' : '✗'}] 時[${result.matches.hour ? '✓' : '✗'}]`;
  
  return `| ${result.description} | ${expected} | ${calculated} | ${matches} |`;
}).join('\n')}

## 4. 改善が必要な主な問題点

テスト結果から、以下の主な問題点が特定されました：

1. **立春日の柱計算**: 2月4日前後の年柱計算で不一致が見られます。立春の時刻を正確に考慮した年柱切り替えロジックが必要です。

2. **時柱計算の韓国式対応**: 特に子の刻（23時-1時）の時干計算に不一致が見られます。日干に基づく時干マッピングの韓国式ルールに対応する必要があります。

3. **節気境界の特殊処理**: 立秋前、立夏前などの月柱計算に不一致が見られます。節気境界日の特殊処理ロジックを実装する必要があります。

## 5. 改善計画

1. **specialCaseHandler.ts** の実装拡張:
   - 立春日の特殊処理
   - 節気境界の処理
   - 韓国式時柱計算ルールの実装

2. **DateTimeProcessor** の精密化:
   - 経度に基づく地方時調整の精度向上
   - 日付変更対応の強化

3. **SajuEngine** の計算ロジック強化:
   - 立春時刻の正確な取得と反映
   - 干支境界の精密な処理
`;

  return markdown;
}

/**
 * コンソールに結果を表示
 */
function displayResults(results: TestResult[], stats: any) {
  console.log('==== SajuEngine テスト結果 ====');
  console.log(`全体の成功率: ${stats.overallSuccessRate.toFixed(2)}%`);
  console.log(`年柱成功率: ${stats.pillars.year.rate.toFixed(2)}%`);
  console.log(`月柱成功率: ${stats.pillars.month.rate.toFixed(2)}%`);
  console.log(`日柱成功率: ${stats.pillars.day.rate.toFixed(2)}%`);
  console.log(`時柱成功率: ${stats.pillars.hour.rate.toFixed(2)}%`);
  console.log('\n詳細結果:');
  
  results.forEach((result, index) => {
    console.log(`\n[${index + 1}] ${result.description}`);
    console.log(`期待値: 年[${result.expected.year}] 月[${result.expected.month}] 日[${result.expected.day}] 時[${result.expected.hour}]`);
    
    if (result.metadata?.error) {
      console.log(`結果: エラー - ${result.metadata.error}`);
    } else {
      console.log(`計算値: 年[${result.calculated.year}] 月[${result.calculated.month}] 日[${result.calculated.day}] 時[${result.calculated.hour}]`);
      console.log(`一致: 年[${result.matches.year ? '✓' : '✗'}] 月[${result.matches.month ? '✓' : '✗'}] 日[${result.matches.day ? '✓' : '✗'}] 時[${result.matches.hour ? '✓' : '✗'}] (${result.matches.total}/4)`);
    }
  });
}

// 実行
runTestSuite();

// エクスポート
export { runTestSuite };