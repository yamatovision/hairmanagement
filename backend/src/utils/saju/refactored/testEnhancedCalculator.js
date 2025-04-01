/**
 * 改良版韓国式月柱計算アルゴリズムのテスト
 */
const { STEMS } = require('./types');
const {
  calculateBasicMonthPillar,
  calculateEnhancedMonthPillar,
  REFERENCE_TABLE
} = require('./enhancedMonthPillarCalculator');

/**
 * 年干を計算
 * @param {number} year - 西暦年
 * @returns {string} - 年干
 */
function calculateYearStem(year) {
  const stemIndex = (year + 6) % 10;
  return STEMS[stemIndex];
}

/**
 * 重要な日付をテスト
 */
function testImportantDates() {
  console.log('===== 重要な日付のテスト =====');
  
  const testCases = [
    { dateStr: '2023-10-15', expected: '壬戌' },
    { dateStr: '1986-05-26', expected: '癸巳' }
  ];
  
  testCases.forEach(({ dateStr, expected }) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const yearStem = calculateYearStem(year);
    
    console.log(`\n日付: ${dateStr} (${yearStem}年), 期待値: ${expected}`);
    
    // 基本アルゴリズム
    const basicResult = calculateBasicMonthPillar(date);
    const basicMatch = basicResult.fullStemBranch === expected;
    console.log(`基本アルゴリズム: ${basicResult.fullStemBranch} (${basicMatch ? '✓' : '✗'})`);
    
    // 強化アルゴリズム（参照テーブルなし）
    const enhancedResult = calculateEnhancedMonthPillar(date, yearStem, { ignoreReference: true });
    const enhancedMatch = enhancedResult.fullStemBranch === expected;
    console.log(`強化アルゴリズム（参照テーブルなし）: ${enhancedResult.fullStemBranch} (${enhancedMatch ? '✓' : '✗'}) via ${enhancedResult.method}`);
    
    // 完全実装（参照テーブル含む）
    const fullResult = calculateEnhancedMonthPillar(date, yearStem);
    const fullMatch = fullResult.fullStemBranch === expected;
    console.log(`完全実装: ${fullResult.fullStemBranch} (${fullMatch ? '✓' : '✗'}) via ${fullResult.method}`);
  });
}

/**
 * 参照テーブルの全エントリをテスト
 */
function testAllReferenceEntries() {
  console.log('\n===== 参照テーブルのすべてのエントリをテスト =====');
  
  const testCases = Object.entries(REFERENCE_TABLE).map(([dateStr, expected]) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return { dateStr, date: new Date(year, month - 1, day), expected, year };
  });
  
  // 各アルゴリズムの結果を追跡
  const results = {
    basic: { correct: 0, total: testCases.length },
    enhanced: { correct: 0, total: testCases.length },
    full: { correct: 0, total: testCases.length }
  };
  
  testCases.forEach(({ dateStr, date, expected, year }) => {
    const yearStem = calculateYearStem(year);
    
    // 基本アルゴリズム
    const basicResult = calculateBasicMonthPillar(date);
    const basicMatch = basicResult.fullStemBranch === expected;
    if (basicMatch) results.basic.correct++;
    
    // 強化アルゴリズム（参照テーブルなし）
    const enhancedResult = calculateEnhancedMonthPillar(date, yearStem, { ignoreReference: true });
    const enhancedMatch = enhancedResult.fullStemBranch === expected;
    if (enhancedMatch) results.enhanced.correct++;
    
    // 完全実装（参照テーブル含む）
    const fullResult = calculateEnhancedMonthPillar(date, yearStem);
    const fullMatch = fullResult.fullStemBranch === expected;
    if (fullMatch) results.full.correct++;
    
    // 結果出力
    console.log(`${dateStr} (${yearStem}年): ${expected} | 基本: ${basicMatch ? '✓' : '✗'} | 強化: ${enhancedMatch ? '✓' : '✗'} (${enhancedResult.method}) | 完全: ${fullMatch ? '✓' : '✗'} (${fullResult.method})`);
  });
  
  // 精度サマリー
  console.log('\n===== 精度サマリー =====');
  console.log(`基本アルゴリズム: ${results.basic.correct}/${results.basic.total} = ${(results.basic.correct / results.basic.total * 100).toFixed(2)}%`);
  console.log(`強化アルゴリズム（参照テーブルなし）: ${results.enhanced.correct}/${results.enhanced.total} = ${(results.enhanced.correct / results.enhanced.total * 100).toFixed(2)}%`);
  console.log(`完全実装（参照テーブル含む）: ${results.full.correct}/${results.full.total} = ${(results.full.correct / results.full.total * 100).toFixed(2)}%`);
}

// テスト実行
console.log('===== 韓国式月柱計算精度検証 =====');
testImportantDates();
testAllReferenceEntries();