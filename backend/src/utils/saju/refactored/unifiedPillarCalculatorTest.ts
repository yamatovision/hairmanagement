/**
 * 統合四柱推命計算モジュールのテスト
 * 数学的パターン発見に基づく実装の検証
 */
import { 
  calculateYearPillar,
  calculateMonthPillar,
  calculateHourPillar,
  getMonthStemBaseIndex,
  getHourStemBaseIndex
} from './unifiedPillarCalculator';
import { STEMS, BRANCHES } from './types';

/**
 * テストケース一覧
 */
const TEST_CASES = [
  {
    description: "2023年10月15日12時",
    date: new Date(2023, 9, 15),
    hour: 12,
    expected: {
      yearPillar: "癸卯",
      monthPillar: "辛酉",
      dayStem: "丙", // 日干（テスト用に手動設定）
      dayBranch: "午", // 日支（テスト用に手動設定）
      hourPillar: "甲午"
    }
  },
  {
    description: "1986年5月26日5時",
    date: new Date(1986, 4, 26),
    hour: 5,
    expected: {
      yearPillar: "丙寅",
      monthPillar: "癸巳",
      dayStem: "庚", // 日干（テスト用に手動設定）
      dayBranch: "午", // 日支（テスト用に手動設定）
      hourPillar: "丙寅"
    }
  }
];

/**
 * 数学的パターン（×2ルール）の検証
 */
function testMathematicalPatterns() {
  console.log("===== 四柱推命の数学的パターン検証 =====");
  
  // 1. 年干から月干への基準値計算（×2ルール）の検証
  console.log("\n年干から月干への基準値計算（×2ルール）:");
  
  let allCorrect = true;
  
  STEMS.forEach(stem => {
    const stemIndex = STEMS.indexOf(stem);
    const expected = (stemIndex * 2) % 10;
    const actual = getMonthStemBaseIndex(stem);
    const isCorrect = expected === actual;
    
    if (!isCorrect) allCorrect = false;
    
    console.log(`  ${stem}(${stemIndex}) → 基準値: ${actual} [期待値: ${expected}] - ${isCorrect ? '✓' : '✗'}`);
  });
  
  console.log(`\n検証結果: ${allCorrect ? '成功' : '失敗'}`);
  
  // 2. 日干から時干への基準値計算（×2ルール）の検証
  console.log("\n日干から時干への基準値計算（×2ルール）:");
  
  allCorrect = true;
  
  STEMS.forEach(stem => {
    const stemIndex = STEMS.indexOf(stem);
    const expected = (stemIndex * 2) % 10;
    const actual = getHourStemBaseIndex(stem);
    const isCorrect = expected === actual;
    
    if (!isCorrect) allCorrect = false;
    
    console.log(`  ${stem}(${stemIndex}) → 基準値: ${actual} [期待値: ${expected}] - ${isCorrect ? '✓' : '✗'}`);
  });
  
  console.log(`\n検証結果: ${allCorrect ? '成功' : '失敗'}`);
}

/**
 * 実際のサンプルデータとの比較テスト
 */
function testSampleDataAccuracy() {
  console.log("\n===== サンプルデータとの比較テスト =====");
  
  for (const testCase of TEST_CASES) {
    console.log(`\n【テスト】${testCase.description}`);
    
    // 1. 年柱のテスト
    const yearPillar = calculateYearPillar(testCase.date.getFullYear());
    const isYearCorrect = yearPillar.fullStemBranch === testCase.expected.yearPillar;
    console.log(`  年柱: ${yearPillar.fullStemBranch} [期待値: ${testCase.expected.yearPillar}] - ${isYearCorrect ? '✓' : '✗'}`);
    
    // 2. 月柱のテスト
    const yearStem = yearPillar.stem;
    const monthPillar = calculateMonthPillar(testCase.date, yearStem, { useSolarTerms: true });
    const isMonthCorrect = monthPillar.fullStemBranch === testCase.expected.monthPillar;
    console.log(`  月柱: ${monthPillar.fullStemBranch} [期待値: ${testCase.expected.monthPillar}] - ${isMonthCorrect ? '✓' : '✗'}`);
    
    // 3. 時柱のテスト
    const dayStem = testCase.expected.dayStem; // テスト用に手動設定
    const hourPillar = calculateHourPillar(testCase.hour, dayStem);
    const isHourCorrect = hourPillar.fullStemBranch === testCase.expected.hourPillar;
    console.log(`  時柱: ${hourPillar.fullStemBranch} [期待値: ${testCase.expected.hourPillar}] - ${isHourCorrect ? '✓' : '✗'}`);
    
    // 4. 総合判定
    const isAllCorrect = isYearCorrect && isMonthCorrect && isHourCorrect;
    console.log(`\n  総合判定: ${isAllCorrect ? '成功' : '失敗'}`);
    
    // 5. パターン分析
    console.log("\n  【×2ルール検証】");
    
    // 年干→月干の関係
    const yearStemIndex = STEMS.indexOf(yearStem);
    const monthStemBase = getMonthStemBaseIndex(yearStem);
    console.log(`  • 年干(${yearStem}) → 月干基準値: ${STEMS[monthStemBase]} [${yearStemIndex} × 2 = ${yearStemIndex * 2} % 10 = ${monthStemBase}]`);
    
    // 日干→時干の関係
    const dayStemIndex = STEMS.indexOf(dayStem);
    const hourStemBase = getHourStemBaseIndex(dayStem);
    console.log(`  • 日干(${dayStem}) → 時干基準値: ${STEMS[hourStemBase]} [${dayStemIndex} × 2 = ${dayStemIndex * 2} % 10 = ${hourStemBase}]`);
  }
}

/**
 * 特殊ケースと通常計算の比較テスト
 */
function testSpecialCasesVsAlgorithm() {
  console.log("\n===== 特殊ケースと純粋なアルゴリズムの比較 =====");
  
  const specialCaseDates = [
    { date: new Date(2023, 9, 15), description: "2023年10月15日 (癸年)" },
    { date: new Date(1986, 4, 26), description: "1986年5月26日 (丙年)" }
  ];
  
  for (const { date, description } of specialCaseDates) {
    console.log(`\n【テスト】${description}`);
    
    // 年柱計算
    const yearPillar = calculateYearPillar(date.getFullYear());
    console.log(`  年柱: ${yearPillar.fullStemBranch}`);
    
    // 特殊ケースあり計算
    const monthPillarWithSpecial = calculateMonthPillar(date, yearPillar.stem, { 
      useSolarTerms: true,
      useSpecialCases: true
    });
    
    // 純粋アルゴリズム計算
    const monthPillarAlgorithm = calculateMonthPillar(date, yearPillar.stem, {
      useSolarTerms: true,
      useSpecialCases: false
    });
    
    console.log(`  月柱（特殊ケースあり）: ${monthPillarWithSpecial.fullStemBranch}`);
    console.log(`  月柱（純粋アルゴリズム）: ${monthPillarAlgorithm.fullStemBranch}`);
    console.log(`  一致: ${monthPillarWithSpecial.fullStemBranch === monthPillarAlgorithm.fullStemBranch ? '✓' : '✗'}`);
    
    if (monthPillarWithSpecial.fullStemBranch !== monthPillarAlgorithm.fullStemBranch) {
      console.log(`  ※この日付は特殊ケース処理が必要`);
    }
  }
}

/**
 * 主要なテスト実行
 */
export function runUnifiedPillarTests() {
  console.log("===== 統合四柱推命計算モジュールのテスト =====");
  
  // 1. 数学的パターン（×2ルール）の検証
  testMathematicalPatterns();
  
  // 2. サンプルデータとの比較テスト
  testSampleDataAccuracy();
  
  // 3. 特殊ケースと通常計算の比較テスト
  testSpecialCasesVsAlgorithm();
}

// モジュールが直接実行された場合はテスト実行
if (require.main === module) {
  runUnifiedPillarTests();
}