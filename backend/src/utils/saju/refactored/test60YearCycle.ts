/**
 * 60年周期パターンの検証テスト
 * 庚年と甲年の特殊パターンを検証する
 */
import { calculateMonthStem, getMonthStemBaseIndex } from './monthStemCalculator';

// Define STEMS directly for testing purposes
const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];

/**
 * 年干を取得する（簡易版）
 * @param year 西暦年
 * @returns 年干
 */
function getYearStem(year: number): string {
  // 年干インデックス = (年 + 6) % 10
  const stemIndex = (year + 6) % 10;
  return STEMS[stemIndex];
}

/**
 * 庚年の60年周期パターンを検証
 */
function testGengYearPattern() {
  console.log('===== 庚年（庚）の60年周期パターン検証 =====');
  
  // 庚年のサンプル年（1900-2020の庚年）
  const gengYears = [
    1900, 1910, 1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020
  ];
  
  // 各庚年の1月の月干をテスト
  gengYears.forEach(year => {
    const testDate = new Date(year, 0, 15); // 1月15日
    const yearStem = getYearStem(year);
    
    if (yearStem !== "庚") {
      console.log(`${year}年は庚年ではありません（${yearStem}年）`);
      return;
    }
    
    // 直接基準値のみをテスト
    const baseIdx = getMonthStemBaseIndex(yearStem, testDate);
    const monthStem = STEMS[baseIdx];
    const remainder = (year - 1900) % 60;
    const cycleGroup = Math.floor(remainder / 20) + 1;
    
    // 期待される月干（60年周期の理論値）
    let expectedStem = "丙"; // デフォルト
    if (year === 1900) {
      expectedStem = "丁"; // 1900年は特殊例外
    } else if (remainder >= 0 && remainder < 20) {
      expectedStem = "丙"; // 1900-1919, 1960-1979, 2020-2039
    } else if (remainder >= 20 && remainder < 40) {
      expectedStem = "辛"; // 1920-1939, 1980-1999, 2040-2059
    } else {
      expectedStem = "丙"; // 1940-1959, 2000-2019
    }
    
    // 検証結果
    const match = monthStem === expectedStem;
    console.log(`${year}年 (庚年・周期グループ${cycleGroup}): 月干=${monthStem}, 期待値=${expectedStem} - ${match ? '✓' : '✗'}`);
  });
}

/**
 * 甲年の特殊パターンを検証
 */
function testJiaYearPattern() {
  console.log('\n===== 甲年（甲）の特殊パターン検証 =====');
  
  // 甲年のサンプル年（1900-2024の甲年）
  const jiaYears = [
    1904, 1914, 1924, 1934, 1944, 1954, 1964, 1974, 1984, 1994, 2004, 2014, 2024
  ];
  
  // 各甲年の1月の月干をテスト
  jiaYears.forEach(year => {
    const testDate = new Date(year, 0, 15); // 1月15日
    const yearStem = getYearStem(year);
    
    if (yearStem !== "甲") {
      console.log(`${year}年は甲年ではありません（${yearStem}年）`);
      return;
    }
    
    // 直接基準値のみをテスト
    const baseIdx = getMonthStemBaseIndex(yearStem, testDate);
    const monthStem = STEMS[baseIdx];
    const remainder = year % 60;
    
    // 期待される月干（甲年の特殊パターン）
    let expectedStem = "壬"; // デフォルト
    if ((remainder >= 4 && remainder < 24) || (remainder >= 44 && remainder < 54)) {
      expectedStem = "己"; // 1924-1943, 1964-1973, ...
    }
    
    // 検証結果
    const match = monthStem === expectedStem;
    console.log(`${year}年 (甲年・余り${remainder}): 月干=${monthStem}, 期待値=${expectedStem} - ${match ? '✓' : '✗'}`);
  });
}

/**
 * 各年干の1月の月干パターンを広範囲でテスト
 */
function testAllStemsOver100Years() {
  console.log('\n===== 全ての年干の1月の月干パターン検証（1900-2024）=====');
  
  // 最近の約125年をテスト
  const years = Array.from({length: 125}, (_, i) => 1900 + i);
  
  // 各年干ごとの検証結果を集計
  const results: Record<string, {total: number, correct: number}> = {};
  STEMS.forEach(stem => {
    results[stem] = {total: 0, correct: 0};
  });
  
  // 全体の正確性
  let totalTests = 0;
  let correctTests = 0;
  
  years.forEach(year => {
    const yearStem = getYearStem(year);
    const testDate = new Date(year, 0, 15); // 1月15日
    // 直接基準値のみをテスト
    const baseIdx = getMonthStemBaseIndex(yearStem, testDate);
    const monthStem = STEMS[baseIdx];
    
    // 期待値の計算（アルゴリズムを再実装）
    let expectedStem: string;
    
    // 特殊ケース処理
    if (yearStem === "庚") {
      if (year === 1900) {
        expectedStem = "丁";
      } else {
        const remainder = (year - 1900) % 60;
        if (remainder >= 0 && remainder < 20) {
          expectedStem = "丙";
        } else if (remainder >= 20 && remainder < 40) {
          expectedStem = "辛";
        } else {
          expectedStem = "丙";
        }
      }
    } else if (yearStem === "甲") {
      const remainder = year % 60;
      if ((remainder >= 4 && remainder < 24) || (remainder >= 44 && remainder < 54)) {
        expectedStem = "己";
      } else {
        expectedStem = "壬";
      }
    } else {
      // 標準的な陰陽パターン
      const yearStemIdx = STEMS.indexOf(yearStem);
      const isYang = yearStemIdx % 2 === 0;
      
      if (isYang) {
        // 陽干年（丙、戊、壬）の場合
        const idx = (10 - (yearStemIdx * 2) % 10) % 10;
        expectedStem = STEMS[idx];
      } else {
        // 陰干年（乙、丁、己、辛、癸）の場合
        const idx = (6 + yearStemIdx) % 10;
        expectedStem = STEMS[idx];
      }
    }
    
    // 検証
    const match = monthStem === expectedStem;
    if (match) {
      correctTests++;
      results[yearStem].correct++;
    }
    totalTests++;
    results[yearStem].total++;
    
    // 10年ごとの区切りでのみ結果を出力（画面を占有しないため）
    if (year % 10 === 0 || !match) {
      console.log(`${year}年 (${yearStem}年): 月干=${monthStem}, 期待値=${expectedStem} - ${match ? '✓' : '✗'}`);
    }
  });
  
  // 結果サマリー
  console.log('\n===== 検証結果サマリー =====');
  console.log(`全体精度: ${(correctTests / totalTests * 100).toFixed(2)}% (${correctTests}/${totalTests})`);
  
  console.log('\n年干別精度:');
  STEMS.forEach(stem => {
    const { total, correct } = results[stem];
    if (total > 0) {
      console.log(`${stem}年: ${(correct / total * 100).toFixed(2)}% (${correct}/${total})`);
    }
  });
}

/**
 * 特定の年代範囲で全ての年干をテスト
 */
function testSpecificYearRange(startYear: number, endYear: number) {
  console.log(`\n===== ${startYear}年-${endYear}年の月干検証 =====`);
  
  const years = Array.from({length: endYear - startYear + 1}, (_, i) => startYear + i);
  
  years.forEach(year => {
    const yearStem = getYearStem(year);
    const testDate = new Date(year, 0, 15); // 1月15日
    const baseIdx = getMonthStemBaseIndex(yearStem, testDate);
    const monthStem = STEMS[baseIdx];
    
    console.log(`${year}年 (${yearStem}年): 1月の月干=${monthStem}`);
  });
}

// テスト実行
console.log('===== 60年周期パターン検証テスト開始 =====');

// 庚年の60年周期パターンテスト
testGengYearPattern();

// 甲年の特殊パターンテスト
testJiaYearPattern();

// 全ての年干を広範囲でテスト
testAllStemsOver100Years();

// 1800年代の特定年代をテスト
testSpecificYearRange(1880, 1900);

console.log('\n===== テスト完了 =====');