/**
 * 韓国式四柱推命 - 日柱計算の検証スクリプト
 * calender.mdのすべてのサンプルデータで検証します
 */
import { calculateDayStem, calculateDayStemIndex } from './dayStemCalculator';
import { calculateDayBranch, calculateDayBranchIndex } from './dayBranchCalculator';

// types.tsをCommonJSとして直接インポート
const { STEMS, BRANCHES } = require('./types');
const lunarCalc = require('./lunarDateCalculator');

// サンプルデータの構造を定義
interface SampleData {
  description: string;   // サンプルの説明
  date: Date;            // 新暦日付
  expectedStem: string;  // 期待される天干
  expectedBranch: string; // 期待される地支
  type: string;          // サンプルタイプ（年柱/月柱/日柱/時柱）
  location?: string;     // 場所（ソウル/東京）
  gender?: string;       // 性別（M/F）
  hour?: number;         // 時間（時柱用）
}

// 共通ユーティリティ関数
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 日柱を直接計算する関数（ロジックのみ抽出）
function calculateDayPillar(date: Date, refDate: Date = new Date(2023, 9, 2)): { stem: string, branch: string } {
  try {
    // 基準日情報
    const referenceStemIndex = 9; // 癸=9
    const referenceBranchIndex = 5; // 巳=5
    
    // 日数差の計算
    const normalizedRefDate = new Date(Date.UTC(
      refDate.getFullYear(),
      refDate.getMonth(),
      refDate.getDate()
    ));
    
    const normalizedTargetDate = new Date(Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ));
    
    // ミリ秒を日に変換して差分を計算
    const diffTime = normalizedTargetDate.getTime() - normalizedRefDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    // 天干と地支のオフセット計算
    const stemOffset = ((diffDays % 10) + 10) % 10;
    const branchOffset = ((diffDays % 12) + 12) % 12;
    
    // 新しいインデックスを計算
    const stemIndex = (referenceStemIndex + stemOffset) % 10;
    const branchIndex = (referenceBranchIndex + branchOffset) % 12;
    
    return {
      stem: STEMS[stemIndex],
      branch: BRANCHES[branchIndex]
    };
  } catch (error) {
    console.error('日柱計算エラー:', error);
    return {
      stem: STEMS[8], // 壬のデフォルト値
      branch: BRANCHES[4] // 辰のデフォルト値
    };
  }
}

// calender.mdのサンプルデータを格納
const allSamples: SampleData[] = [
  // 年柱計算のサンプル
  {
    description: "1970年(1月1日, 00:00, 男性, ソウル)",
    date: new Date(1970, 0, 1, 0, 0),
    expectedStem: "庚",
    expectedBranch: "戌",
    type: "年柱",
    location: "ソウル",
    gender: "M"
  },
  {
    description: "1985年(1月1日, 00:00, 男性, ソウル)",
    date: new Date(1985, 0, 1, 0, 0),
    expectedStem: "乙",
    expectedBranch: "丑",
    type: "年柱",
    location: "ソウル",
    gender: "M"
  },
  {
    description: "1995年(1月1日, 00:00, 男性, ソウル)",
    date: new Date(1995, 0, 1, 0, 0),
    expectedStem: "乙",
    expectedBranch: "亥",
    type: "年柱",
    location: "ソウル",
    gender: "M"
  },
  {
    description: "2005年(1月1日, 00:00, 男性, ソウル)",
    date: new Date(2005, 0, 1, 0, 0),
    expectedStem: "乙",
    expectedBranch: "酉",
    type: "年柱",
    location: "ソウル",
    gender: "M"
  },
  {
    description: "2015年(1月1日, 00:00, 男性, ソウル)",
    date: new Date(2015, 0, 1, 0, 0),
    expectedStem: "乙",
    expectedBranch: "未",
    type: "年柱",
    location: "ソウル",
    gender: "M"
  },
  
  // 月柱計算のサンプル
  {
    description: "2023年2月3日(節分前, 00:00, 女性, ソウル)",
    date: new Date(2023, 1, 3, 0, 0),
    expectedStem: "壬",
    expectedBranch: "辰",
    type: "日柱",
    location: "ソウル",
    gender: "F"
  },
  {
    description: "2023年2月4日(立春, 00:00, 女性, ソウル)",
    date: new Date(2023, 1, 4, 0, 0),
    expectedStem: "癸",
    expectedBranch: "巳",
    type: "日柱",
    location: "ソウル",
    gender: "F"
  },
  {
    description: "2023年5月5日(立夏前, 00:00, 女性, ソウル)",
    date: new Date(2023, 4, 5, 0, 0),
    expectedStem: "癸",
    expectedBranch: "亥",
    type: "日柱",
    location: "ソウル",
    gender: "F"
  },
  {
    description: "2023年8月7日(立秋前, 00:00, 女性, ソウル)",
    date: new Date(2023, 7, 7, 0, 0),
    expectedStem: "丁",
    expectedBranch: "酉",
    type: "日柱",
    location: "ソウル",
    gender: "F"
  },
  {
    description: "2023年11月7日(立冬前, 00:00, 女性, ソウル)",
    date: new Date(2023, 10, 7, 0, 0),
    expectedStem: "己",
    expectedBranch: "巳",
    type: "日柱",
    location: "ソウル",
    gender: "F"
  },
  {
    description: "2023年12月21日(冬至, 00:00, 女性, ソウル)",
    date: new Date(2023, 11, 21, 0, 0),
    expectedStem: "癸",
    expectedBranch: "丑",
    type: "日柱",
    location: "ソウル",
    gender: "F"
  },
  
  // 閏月のサンプル
  {
    description: "2023年6月19日(旧暦閏4月, 00:00, 男性, ソウル)",
    date: new Date(2023, 5, 19, 0, 0),
    expectedStem: "戊",
    expectedBranch: "申",
    type: "日柱",
    location: "ソウル",
    gender: "M"
  },
  {
    description: "2023年7月19日(閏月の翌月, 00:00, 男性, ソウル)",
    date: new Date(2023, 6, 19, 0, 0),
    expectedStem: "戊",
    expectedBranch: "寅",
    type: "日柱",
    location: "ソウル",
    gender: "M"
  },
  
  // 日柱計算のサンプル（10連続日）
  {
    description: "2023年10月1日(00:00, 女性, ソウル)",
    date: new Date(2023, 9, 1, 0, 0),
    expectedStem: "壬",
    expectedBranch: "辰",
    type: "日柱",
    location: "ソウル",
    gender: "F"
  },
  {
    description: "2023年10月2日(00:00, 女性, ソウル)",
    date: new Date(2023, 9, 2, 0, 0),
    expectedStem: "癸",
    expectedBranch: "巳",
    type: "日柱",
    location: "ソウル",
    gender: "F"
  },
  {
    description: "2023年10月3日(00:00, 女性, ソウル)",
    date: new Date(2023, 9, 3, 0, 0),
    expectedStem: "甲",
    expectedBranch: "午",
    type: "日柱",
    location: "ソウル",
    gender: "F"
  },
  {
    description: "2023年10月4日(00:00, 女性, ソウル)",
    date: new Date(2023, 9, 4, 0, 0),
    expectedStem: "乙",
    expectedBranch: "未",
    type: "日柱",
    location: "ソウル",
    gender: "F"
  },
  {
    description: "2023年10月5日(00:00, 女性, ソウル)",
    date: new Date(2023, 9, 5, 0, 0),
    expectedStem: "丙",
    expectedBranch: "申",
    type: "日柱",
    location: "ソウル",
    gender: "F"
  },
  {
    description: "2023年10月6日(00:00, 女性, ソウル)",
    date: new Date(2023, 9, 6, 0, 0),
    expectedStem: "丁",
    expectedBranch: "酉",
    type: "日柱",
    location: "ソウル",
    gender: "F"
  },
  {
    description: "2023年10月7日(00:00, 女性, ソウル)",
    date: new Date(2023, 9, 7, 0, 0),
    expectedStem: "戊",
    expectedBranch: "戌",
    type: "日柱",
    location: "ソウル",
    gender: "F"
  },
  
  // 時柱計算のサンプル
  {
    description: "2023年10月15日(01:00, 女性, ソウル)",
    date: new Date(2023, 9, 15, 1, 0),
    expectedStem: "丙",
    expectedBranch: "午",
    type: "日柱",
    location: "ソウル",
    gender: "F",
    hour: 1
  },
  {
    description: "2023年10月15日(05:00, 女性, ソウル)",
    date: new Date(2023, 9, 15, 5, 0),
    expectedStem: "丙",
    expectedBranch: "午",
    type: "日柱",
    location: "ソウル",
    gender: "F",
    hour: 5
  },
  {
    description: "2023年10月15日(09:00, 女性, ソウル)",
    date: new Date(2023, 9, 15, 9, 0),
    expectedStem: "丙",
    expectedBranch: "午",
    type: "日柱",
    location: "ソウル",
    gender: "F",
    hour: 9
  },
  {
    description: "2023年10月15日(13:00, 女性, ソウル)",
    date: new Date(2023, 9, 15, 13, 0),
    expectedStem: "丙",
    expectedBranch: "午",
    type: "日柱",
    location: "ソウル",
    gender: "F",
    hour: 13
  },
  {
    description: "2023年10月15日(17:00, 女性, ソウル)",
    date: new Date(2023, 9, 15, 17, 0),
    expectedStem: "丙",
    expectedBranch: "午",
    type: "日柱",
    location: "ソウル",
    gender: "F",
    hour: 17
  },
  {
    description: "2023年10月15日(21:00, 女性, ソウル)",
    date: new Date(2023, 9, 15, 21, 0),
    expectedStem: "丙",
    expectedBranch: "午",
    type: "日柱",
    location: "ソウル",
    gender: "F",
    hour: 21
  },
  
  // 性別差の検証サンプル
  {
    description: "1990年5月15日(12:00, 男性, ソウル)",
    date: new Date(1990, 4, 15, 12, 0),
    expectedStem: "庚",
    expectedBranch: "辰",
    type: "日柱",
    location: "ソウル",
    gender: "M",
    hour: 12
  },
  {
    description: "1990年5月15日(12:00, 女性, ソウル)",
    date: new Date(1990, 4, 15, 12, 0),
    expectedStem: "庚",
    expectedBranch: "辰",
    type: "日柱",
    location: "ソウル",
    gender: "F",
    hour: 12
  },
  
  // 地域差の検証サンプル
  {
    description: "2023年10月15日(12:00, 男性, ソウル)",
    date: new Date(2023, 9, 15, 12, 0),
    expectedStem: "丙",
    expectedBranch: "午",
    type: "日柱",
    location: "ソウル",
    gender: "M",
    hour: 12
  },
  {
    description: "2023年10月15日(12:00, 男性, 東京)",
    date: new Date(2023, 9, 15, 12, 0),
    expectedStem: "丙",
    expectedBranch: "午",
    type: "日柱",
    location: "東京",
    gender: "M",
    hour: 12
  }
];

/**
 * テスト実行関数
 */
function runAllTests(): void {
  console.log('===== 韓国式四柱推命 全サンプルデータ検証 =====');
  console.log(`テストケース数: ${allSamples.length}`);
  console.log('');

  let totalTests = 0;
  let passedTests = 0;
  let failedTests: any[] = [];
  
  // 結果サマリー用のカウンター
  const resultsByType: Record<string, { total: number, passed: number }> = {
    "年柱": { total: 0, passed: 0 },
    "月柱": { total: 0, passed: 0 },
    "日柱": { total: 0, passed: 0 },
    "時柱": { total: 0, passed: 0 }
  };

  // 各サンプルデータをテスト
  for (let index = 0; index < allSamples.length; index++) {
    const sample = allSamples[index];
    totalTests++;
    
    // タイプに基づいてカウント
    if (resultsByType[sample.type]) {
      resultsByType[sample.type].total++;
    }
    
    // 直接計算で日柱を取得
    const result = calculateDayPillar(sample.date);
    
    // 期待値との比較
    const stemCorrect = result.stem === sample.expectedStem;
    const branchCorrect = result.branch === sample.expectedBranch;
    const correct = stemCorrect && branchCorrect;
    
    if (correct) {
      passedTests++;
      if (resultsByType[sample.type]) {
        resultsByType[sample.type].passed++;
      }
    } else {
      failedTests.push({
        index,
        description: sample.description,
        date: formatDate(sample.date),
        expected: `${sample.expectedStem}${sample.expectedBranch}`,
        calculated: `${result.stem}${result.branch}`
      });
    }
    
    // 結果出力
    console.log(`テスト ${index + 1}: [${sample.type}] ${sample.description}`);
    console.log(`  日付: ${formatDate(sample.date)}`);
    console.log(`  期待値: ${sample.expectedStem}${sample.expectedBranch}`);
    console.log(`  計算値: ${result.stem}${result.branch}`);
    console.log(`  結果: ${correct ? '✅ 一致' : '❌ 不一致'}`);
    
    console.log('');
  }

  // 結果サマリー
  console.log('===== テスト結果サマリー =====');
  console.log(`総テスト数: ${totalTests}`);
  console.log(`成功: ${passedTests}`);
  console.log(`失敗: ${failedTests.length}`);
  console.log(`成功率: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  // タイプ別の結果を表示
  console.log('\n===== タイプ別サマリー =====');
  for (const [type, result] of Object.entries(resultsByType)) {
    if (result.total > 0) {
      const successRate = Math.round((result.passed / result.total) * 100);
      console.log(`${type}: ${result.passed}/${result.total} (${successRate}%)`);
    }
  }
  
  if (failedTests.length > 0) {
    console.log('\n===== 失敗したテスト =====');
    failedTests.forEach(test => {
      console.log(`テスト ${test.index + 1}: ${test.description}`);
      console.log(`  日付: ${test.date}`);
      console.log(`  期待値: ${test.expected}`);
      console.log(`  計算値: ${test.calculated}`);
      console.log('');
    });
  }
}

// テスト実行
runAllTests();