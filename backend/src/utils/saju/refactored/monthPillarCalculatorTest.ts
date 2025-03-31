/**
 * 月柱計算モジュールのテスト
 * 
 * calender.mdからのデータと比較して検証します。
 */
import { 
  getMonthPillar, 
  calculateMonthPillar, 
  calculateKoreanMonthPillar,
  getSolarTerm
} from './monthPillarCalculator';
import { getYearPillar } from './yearPillarCalculator';
import { Pillar } from './types';

/**
 * 簡易テスト関数
 */
function assertEqual(actual: any, expected: any, message: string) {
  const isEqual = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${message}: ${isEqual ? '✅ 成功' : '❌ 失敗'}`);
  if (!isEqual) {
    console.log('  期待値:', expected);
    console.log('  実際値:', actual);
  }
  return isEqual;
}

/**
 * テスト実行
 */
async function runTests() {
  console.log('===== 月柱計算モジュール テスト開始 =====');

  // calender.mdからのサンプルデータ
  const testData = [
    { 
      date: new Date(2023, 1, 3), // 2023-02-03（節分前）
      yearStem: "癸", 
      expected: "癸丑" 
    },
    { 
      date: new Date(2023, 1, 4), // 2023-02-04（立春）
      yearStem: "癸", 
      expected: "甲寅" 
    },
    { 
      date: new Date(2023, 4, 5), // 2023-05-05（立夏前後）
      yearStem: "癸", 
      expected: "丙辰" 
    },
    { 
      date: new Date(2023, 7, 7), // 2023-08-07（立秋前後）
      yearStem: "癸", 
      expected: "己未" 
    },
    { 
      date: new Date(2023, 10, 7), // 2023-11-07（立冬前後）
      yearStem: "癸", 
      expected: "壬戌" 
    },
    { 
      date: new Date(2023, 11, 21), // 2023-12-21（冬至）
      yearStem: "癸", 
      expected: "甲子" 
    }
  ];

  // 韓国式計算のテスト
  console.log('\n----- 韓国式計算のテスト -----');
  let successCount = 0;
  let failCount = 0;
  
  for (const test of testData) {
    const result = calculateKoreanMonthPillar(test.date, test.yearStem);
    const success = assertEqual(result.fullStemBranch, test.expected, 
      `${test.date.toISOString().split('T')[0]}の月柱`);
    if (success) successCount++; else failCount++;
  }
  
  console.log(`\n韓国式計算: ${successCount}成功, ${failCount}失敗`);

  // 閏月のテスト
  console.log('\n----- 閏月のテスト -----');
  
  const leapMonthTests = [
    { 
      date: new Date(2023, 5, 19), // 2023-06-19（旧暦閏4月）
      yearStem: "癸", 
      expected: "戊午" 
    },
    { 
      date: new Date(2023, 6, 19), // 2023-07-19（閏月の翌月）
      yearStem: "癸", 
      expected: "己未" 
    }
  ];
  
  for (const test of leapMonthTests) {
    const result = calculateKoreanMonthPillar(test.date, test.yearStem);
    assertEqual(result.fullStemBranch, test.expected, 
      `${test.date.toISOString().split('T')[0]}の月柱（閏月関連）`);
  }

  // 節気検出のテスト
  console.log('\n----- 節気検出のテスト -----');
  
  const solarTermTests = [
    { date: new Date(2023, 1, 3), expected: null }, // 節気なし
    { date: new Date(2023, 1, 4), expected: "立春" }, // 立春
    { date: new Date(2023, 11, 21), expected: "冬至" } // 冬至
  ];
  
  for (const test of solarTermTests) {
    const result = getSolarTerm(test.date);
    assertEqual(result, test.expected, 
      `${test.date.toISOString().split('T')[0]}の節気`);
  }

  // 年柱と月柱の組み合わせテスト
  console.log('\n----- 年柱と月柱の組み合わせテスト -----');
  
  const combinedTests = [
    { 
      date: new Date(2023, 9, 15), // 2023-10-15
      expected: { 
        yearPillar: "癸卯", 
        monthPillar: "壬戌" 
      }
    },
    { 
      date: new Date(1986, 4, 26), // 1986-05-26
      expected: { 
        yearPillar: "丙寅", 
        monthPillar: "癸巳" 
      }
    }
  ];
  
  for (const test of combinedTests) {
    const yearPillar = getYearPillar(test.date.getFullYear(), { useKoreanMethod: true });
    const monthPillar = getMonthPillar(test.date, yearPillar.stem, { useKoreanMethod: true });
    
    console.log(`${test.date.toISOString().split('T')[0]}の四柱（年月）:`);
    console.log(`年柱: ${yearPillar.fullStemBranch} (期待値: ${test.expected.yearPillar})`);
    console.log(`月柱: ${monthPillar.fullStemBranch} (期待値: ${test.expected.monthPillar})`);
    
    const yearMatch = yearPillar.fullStemBranch === test.expected.yearPillar;
    const monthMatch = monthPillar.fullStemBranch === test.expected.monthPillar;
    
    console.log(`一致: ${yearMatch && monthMatch ? '✅' : '❌'}`);
  }

  console.log('\n===== テスト完了 =====');
  
  return {
    successRate: successCount / testData.length
  };
}

// テスト実行
runTests()
  .then(result => {
    console.log('\n韓国式四柱推命の月柱計算について：');
    
    console.log(`
月柱計算の特徴：

1. 月柱は節気によって変わる（例：立春で寅月に変わる）
2. 月干の計算には年干が影響する（年干グループによって基準値が異なる）
3. 閏月も考慮する必要がある

計算アルゴリズム：
- 年干グループ（甲己=0, 乙庚=1, 丙辛=2, 丁壬=3, 戊癸=4）を特定
- 該当する月干基準値を使用: [0, 2, 4, 6, 8]
- 月ごとに2ずつ増加
- 節気を考慮（立春で寅月に変わる）

節気の検出が正確であれば、月柱計算の精度も向上します。
    `);
  })
  .catch(err => console.error('テスト実行エラー:', err));