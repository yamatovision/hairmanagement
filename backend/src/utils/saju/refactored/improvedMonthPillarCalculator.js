/**
 * 韓国式四柱推命 - 改良版月柱計算モジュール
 * 参照テーブルと階層的アルゴリズムを組み合わせた高精度実装
 */

// 必要なモジュールのインポート
const { STEMS, BRANCHES } = require('./types');
const { getLunarDate, getSolarTerm } = require('./lunarDateCalculator');
const { 
  MONTH_PILLAR_REFERENCE,
  MAJOR_SOLAR_TERMS,
  YEAR_STEM_TO_MONTH_STEM_BASE,
  YEAR_STEM_SPECIAL_PATTERNS,
  calculateBasicMonthPillar,
  calculateAccurateMonthPillar,
  formatDateKey
} = require('./monthPillarRefTable');

/**
 * 韓国式月柱計算 - 階層的アプローチ
 * @param {Date} date - 日付
 * @param {string} yearStem - 年干
 * @param {object} options - 計算オプション
 * @returns {object} - 月柱情報
 */
function calculateKoreanMonthPillar(date, yearStem, options = {}) {
  // 1. 旧暦情報と節気情報を取得
  const lunarInfo = getLunarDate(date);
  const solarTerm = getSolarTerm(date);
  
  // 2. 階層的アプローチによる計算
  return calculateAccurateMonthPillar(date, yearStem, lunarInfo, solarTerm, options);
}

/**
 * 特定の日付の月柱計算を詳細に検証 (参照テーブルなしバージョン)
 * @param {Date} date - 日付
 * @param {string} yearStem - 年干
 * @returns {object} - 検証結果
 */
function verifyMonthPillar(date, yearStem) {
  const dateStr = formatDateKey(date);
  console.log(`===== ${dateStr} (${yearStem}年) の月柱検証 =====`);
  
  // 参照テーブルから期待値を取得 (参考情報としてのみ使用)
  const expected = MONTH_PILLAR_REFERENCE[dateStr];
  
  // 旧暦情報と節気を取得
  const lunarInfo = getLunarDate(date);
  const solarTerm = getSolarTerm(date);
  
  console.log(`旧暦: ${lunarInfo ? `${lunarInfo.lunarYear}年${lunarInfo.lunarMonth}月${lunarInfo.lunarDay}日${lunarInfo.isLeapMonth ? '(閏月)' : ''}` : '情報なし'}`);
  console.log(`節気: ${solarTerm || '該当なし'}`);
  
  // 1. 基本アルゴリズムを使用
  const basicResult = calculateBasicMonthPillar(date);
  console.log(`基本アルゴリズム: ${basicResult.fullStemBranch} (${expected ? (basicResult.fullStemBranch === expected ? '✓' : '✗') : '検証不可'})`);
  
  // 2. 階層的アプローチを使用（参照テーブルなし）
  const hierarchicalResult = calculateKoreanMonthPillar(date, yearStem, { ignoreReference: true });
  console.log(`階層的アプローチ（参照テーブルなし）: ${hierarchicalResult.fullStemBranch} (${expected ? (hierarchicalResult.fullStemBranch === expected ? '✓' : '✗') : '検証不可'}) via ${hierarchicalResult.method}`);
  
  // 3. アルゴリズム間の比較
  const algorithmsMatch = basicResult.fullStemBranch === hierarchicalResult.fullStemBranch;
  console.log(`アルゴリズム間の一致: ${algorithmsMatch ? '✓' : '✗'}`);
  
  return {
    dateStr,
    yearStem,
    expected,
    lunarInfo,
    solarTerm,
    results: {
      basic: basicResult,
      hierarchical: hierarchicalResult
    },
    algorithmsMatch
  };
}

/**
 * 韓国式月柱計算アルゴリズム（参照テーブルなし）の精度を検証
 */
function testKoreanMonthPillarAccuracy() {
  console.log('===== 韓国式月柱計算精度検証（参照テーブルなし）=====');
  
  // テスト用のサンプル日付（参照テーブルの値はあくまで比較のために使用）
  const testCases = Object.entries(MONTH_PILLAR_REFERENCE).map(([dateStr, expected]) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    // 年干を計算（西暦から年干を推定）
    const yearStemIndex = (year + 6) % 10; // 1984年が甲子年のため、+6のオフセット
    const yearStem = STEMS[yearStemIndex];
    
    return { date, dateStr, expected, yearStem };
  });
  
  // 1. 基本アルゴリズムの精度検証
  console.log('\n【基本アルゴリズムの精度】');
  let basicCorrect = 0;
  
  testCases.forEach(({ date, dateStr, expected, yearStem }) => {
    const result = calculateBasicMonthPillar(date);
    const isCorrect = result.fullStemBranch === expected;
    if (isCorrect) basicCorrect++;
    
    const mark = isCorrect ? '✓' : '✗';
    console.log(`${mark} ${dateStr} (${yearStem}年): ${result.fullStemBranch} (期待値: ${expected})`);
  });
  
  const basicAccuracy = (basicCorrect / testCases.length) * 100;
  console.log(`\n基本アルゴリズム精度: ${basicCorrect}/${testCases.length} = ${basicAccuracy.toFixed(2)}%`);
  
  // 2. 階層的アプローチの精度検証（参照テーブルなし）
  console.log('\n【階層的アプローチの精度（参照テーブルなし）】');
  let hierarchicalCorrect = 0;
  const methodStats = {};
  
  testCases.forEach(({ date, dateStr, expected, yearStem }) => {
    const result = calculateKoreanMonthPillar(date, yearStem, { ignoreReference: true });
    const isCorrect = result.fullStemBranch === expected;
    if (isCorrect) hierarchicalCorrect++;
    
    // 使用された方法の統計
    methodStats[result.method] = (methodStats[result.method] || 0) + 1;
    
    const mark = isCorrect ? '✓' : '✗';
    console.log(`${mark} ${dateStr} (${yearStem}年): ${result.fullStemBranch} via ${result.method} (期待値: ${expected})`);
  });
  
  const hierarchicalAccuracy = (hierarchicalCorrect / testCases.length) * 100;
  console.log(`\n階層的アプローチ精度: ${hierarchicalCorrect}/${testCases.length} = ${hierarchicalAccuracy.toFixed(2)}%`);
  
  // 使用された方法の統計表示
  console.log('\n【使用された計算方法の統計】');
  for (const method in methodStats) {
    const percentage = (methodStats[method] / testCases.length) * 100;
    console.log(`${method}: ${methodStats[method]}件 (${percentage.toFixed(1)}%)`);
  }
  
  // 3. アルゴリズム間の一致率
  console.log('\n【アルゴリズム間の一致率】');
  let matchCount = 0;
  
  testCases.forEach(({ date, dateStr, yearStem }) => {
    const basicResult = calculateBasicMonthPillar(date);
    const hierarchicalResult = calculateKoreanMonthPillar(date, yearStem, { ignoreReference: true });
    const match = basicResult.fullStemBranch === hierarchicalResult.fullStemBranch;
    if (match) matchCount++;
    
    const mark = match ? '✓' : '✗';
    console.log(`${mark} ${dateStr} (${yearStem}年): basic[${basicResult.fullStemBranch}] vs hierarchical[${hierarchicalResult.fullStemBranch}]`);
  });
  
  const matchRate = (matchCount / testCases.length) * 100;
  console.log(`\nアルゴリズム間の一致率: ${matchCount}/${testCases.length} = ${matchRate.toFixed(2)}%`);
  
  // 4. アルゴリズム説明
  console.log('\n【韓国式月柱計算アルゴリズム概要（参照テーブルなし）】');
  console.log('1. 節気層 - 節気に基づく特殊規則と一般規則');
  console.log('2. 年干と月のパターン層 - 年干ごとの月別特殊ルール');
  console.log('3. 旧暦月標準計算層 - 旧暦月に基づく標準計算');
  console.log('4. 基本アルゴリズム層 - 陽暦日付のみに基づく基本計算');
  console.log('\n優先順位: 節気特殊ルール > 年干月ルール > 旧暦標準計算 > 基本アルゴリズム');
  
  // 5. 現時点での課題と改善方向
  console.log('\n【課題と改善方向】');
  console.log('- 節気の影響をより詳細に分析する必要がある');
  console.log('- 年干ごとの特殊パターンをより多くのサンプルから特定する');
  console.log('- 旧暦月から月柱への変換規則をより正確に定式化する');
  console.log('- 基本アルゴリズムと階層的アプローチの差異を分析し、統合する');
  
  return {
    basicAccuracy,
    hierarchicalAccuracy,
    matchRate,
    methodStats
  };
}

/**
 * 重要な特定の日付を詳細にテスト（参照テーブルなし）
 */
function testKeyDates() {
  console.log('\n===== 重要な日付の詳細検証（参照テーブルなし）=====');
  
  // 特に重要な日付を検証
  const keyDates = [
    { date: new Date(2023, 9, 15), yearStem: "癸" },  // 2023-10-15
    { date: new Date(1986, 4, 26), yearStem: "丙" },  // 1986-05-26
    { date: new Date(2023, 1, 4), yearStem: "癸" },   // 2023-02-04 (立春)
    { date: new Date(2023, 11, 21), yearStem: "癸" }, // 2023-12-21 (冬至)
    { date: new Date(2024, 1, 4), yearStem: "甲" },   // 2024-02-04 (立春)
    { date: new Date(2023, 4, 5), yearStem: "癸" },   // 2023-05-05 (立夏)
    { date: new Date(2023, 7, 7), yearStem: "癸" },   // 2023-08-07 (立秋)
    { date: new Date(2023, 10, 7), yearStem: "癸" }   // 2023-11-07 (立冬)
  ];
  
  keyDates.forEach(({ date, yearStem }) => {
    verifyMonthPillar(date, yearStem);
    console.log('');
  });
  
  // 異なる年干での比較
  console.log('\n【異なる年干での月柱計算比較】');
  const testMonth = 1; // 2月
  const testDay = 4;   // 4日 (立春)
  const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029];
  
  years.forEach(year => {
    const date = new Date(year, testMonth, testDay);
    const yearStemIndex = (year + 6) % 10;
    const yearStem = STEMS[yearStemIndex];
    
    const basicResult = calculateBasicMonthPillar(date);
    const hierarchicalResult = calculateKoreanMonthPillar(date, yearStem, { ignoreReference: true });
    
    console.log(`${year}-02-04 (${yearStem}年):`);
    console.log(`  基本アルゴリズム: ${basicResult.fullStemBranch}`);
    console.log(`  階層的アプローチ: ${hierarchicalResult.fullStemBranch} via ${hierarchicalResult.method}`);
    console.log(`  一致: ${basicResult.fullStemBranch === hierarchicalResult.fullStemBranch ? '✓' : '✗'}`);
  });
}

// モジュールエクスポート
module.exports = {
  calculateKoreanMonthPillar,
  verifyMonthPillar,
  testKoreanMonthPillarAccuracy,
  testKeyDates
};

// このモジュールが直接実行された場合のみテストを実行
if (require.main === module) {
  // 精度テスト
  testKoreanMonthPillarAccuracy();
  
  // 特定の重要な日付の検証
  testKeyDates();
}