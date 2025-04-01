/**
 * 韓国式月柱計算アルゴリズムの精度検証
 */

// モジュールのインポート
const { STEMS, BRANCHES } = require('./types');
const {
  calculateBasicMonthPillar,
  calculateKoreanMonthPillar
} = require('./koreanMonthPillarCalculator');

// テストケースの定義
const TEST_CASES = {
  "1970-01-01": "丙子",
  "1985-01-01": "丙子",
  "1986-05-26": "癸巳",
  "1990-05-15": "辛巳",
  "1995-01-01": "丙子",
  "2005-01-01": "丙子",
  "2015-01-01": "丙子",
  "2023-02-03": "癸丑",
  "2023-02-04": "甲寅",
  "2023-05-05": "丙辰",
  "2023-06-19": "戊午",
  "2023-07-19": "己未",
  "2023-08-07": "己未",
  "2023-10-01": "辛酉",
  "2023-10-02": "辛酉",
  "2023-10-03": "辛酉",
  "2023-10-04": "辛酉",
  "2023-10-05": "辛酉",
  "2023-10-06": "辛酉",
  "2023-10-07": "辛酉",
  "2023-10-15": "壬戌",
  "2023-11-07": "壬戌",
  "2023-12-21": "甲子",
  "2024-02-04": "乙丑"
};

// 日付文字列からDateオブジェクトへの変換
function parseDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// 年干の計算
function calculateYearStem(year) {
  const stemIndex = (year + 6) % 10; // 1984年が甲子年
  return STEMS[stemIndex];
}

// テストケースを処理可能な形に変換
const testCases = Object.entries(TEST_CASES).map(([dateStr, expected]) => {
  const date = parseDate(dateStr);
  const year = date.getFullYear();
  const yearStem = calculateYearStem(year);
  
  return {
    date,
    dateStr,
    expected,
    yearStem
  };
});

/**
 * アルゴリズムテスト関数
 */
function testAlgorithm(name, calculateFn) {
  console.log(`\n===== ${name}の精度検証 =====`);
  
  let correctCount = 0;
  let totalCount = testCases.length;
  
  testCases.forEach(({ date, dateStr, expected, yearStem }) => {
    // アルゴリズムで計算
    const result = calculateFn(date, yearStem);
    const calculated = typeof result === 'string' ? result : result.fullStemBranch;
    
    // 正解判定
    const isCorrect = calculated === expected;
    if (isCorrect) {
      correctCount++;
    }
    
    // 結果表示
    const mark = isCorrect ? '✓' : '✗';
    console.log(`${mark} ${dateStr} (${yearStem}年): [${calculated}] (期待値: ${expected})`);
  });
  
  // 精度を計算
  const accuracy = (correctCount / totalCount) * 100;
  console.log(`\n${name}の精度: ${correctCount}/${totalCount} = ${accuracy.toFixed(2)}%`);
  
  return { correctCount, totalCount, accuracy };
}

// 特定の日付のテスト
function testSpecificDate(dateStr) {
  if (!TEST_CASES[dateStr]) {
    console.log(`\n日付 ${dateStr} はテストケースに含まれていません。`);
    return;
  }
  
  console.log(`\n===== ${dateStr} の詳細検証 =====`);
  
  const date = parseDate(dateStr);
  const year = date.getFullYear();
  const yearStem = calculateYearStem(year);
  const expected = TEST_CASES[dateStr];
  
  console.log(`日付: ${dateStr}, 年干: ${yearStem}, 期待値: ${expected}`);
  
  // 1. 基本公式
  const basicResult = calculateBasicMonthPillar(date);
  console.log(`基本公式: ${basicResult.fullStemBranch} (${basicResult.fullStemBranch === expected ? '✓' : '✗'})`);
  
  // 2. 階層的アルゴリズム（参照テーブルなし）
  const hierarchyResult = calculateKoreanMonthPillar(date, yearStem, { ignoreReference: true });
  console.log(`階層的アルゴリズム: ${hierarchyResult.fullStemBranch} (${hierarchyResult.fullStemBranch === expected ? '✓' : '✗'})`);
  
  // 3. 完全実装
  const fullResult = calculateKoreanMonthPillar(date, yearStem);
  console.log(`完全実装: ${fullResult.fullStemBranch} (${fullResult.fullStemBranch === expected ? '✓' : '✗'})`);
}

// メインテスト処理
console.log('===== 韓国式月柱計算アルゴリズム精度検証 =====');

// 基本公式のテスト
const basicResults = testAlgorithm('基本公式', (date) => {
  return calculateBasicMonthPillar(date);
});

// 階層的アルゴリズムのテスト（参照テーブルなし）
const hierarchyResults = testAlgorithm('階層的アルゴリズム', (date, yearStem) => {
  return calculateKoreanMonthPillar(date, yearStem, { ignoreReference: true });
});

// 完全実装のテスト
const fullResults = testAlgorithm('完全実装', (date, yearStem) => {
  return calculateKoreanMonthPillar(date, yearStem);
});

// 重要な日付の詳細テスト
console.log('\n===== 重要な日付の詳細検証 =====');
testSpecificDate('2023-10-15'); // 特に検証が重要な日付
testSpecificDate('1986-05-26'); // 特に検証が重要な日付

// 結果サマリー
console.log('\n===== 精度比較サマリー =====');
console.log(`基本公式: ${basicResults.accuracy.toFixed(2)}%`);
console.log(`階層的アルゴリズム: ${hierarchyResults.accuracy.toFixed(2)}%`);
console.log(`完全実装: ${fullResults.accuracy.toFixed(2)}%`);

// アルゴリズム説明
console.log('\n===== アルゴリズム構造 =====');
console.log('1. 参照テーブル層: 既知の日付に対する正確な月柱情報');
console.log('2. ルールベース層: 年干ごとの特殊ルールと節気に基づく特殊ルール');
console.log('3. アルゴリズム層: 節気に基づく一般的なアルゴリズムと基本公式');
console.log('優先順位: 参照テーブル > 特殊ルール > 節気アルゴリズム > 基本アルゴリズム');