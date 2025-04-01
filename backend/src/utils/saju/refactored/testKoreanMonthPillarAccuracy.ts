/**
 * 韓国式月柱計算アルゴリズムの精度検証
 * 参照データセットに対する異なるアルゴリズムの精度を測定
 */

// 直接require文を使用してモジュールをインポート
const koreanMonthPillarCalc = require('./koreanMonthPillarCalculator');
const typesModule = require('./types');

const STEMS = typesModule.STEMS;
const {
  calculateBasicMonthPillar,
  calculateKoreanMonthPillar,
  MONTH_PILLAR_REFERENCE,
  formatDateKey
} = koreanMonthPillarCalc;

// 参照テーブルをテストデータとして変換
const testCases = Object.entries(MONTH_PILLAR_REFERENCE).map(([dateStr, expected]) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return {
    date: new Date(year, month - 1, day),
    expected,
    dateStr
  };
});

/**
 * 特定のアルゴリズムの精度を検証
 * @param algorithmName アルゴリズム名
 * @param calculateFn 計算関数
 */
function testAlgorithmAccuracy(algorithmName, calculateFn) {
  console.log(`\n===== ${algorithmName}の精度検証 =====`);
  
  let correctCount = 0;
  let incorrectCount = 0;
  
  testCases.forEach(({ date, expected, dateStr }) => {
    // 年干を取得（西暦から年干を算出）
    const year = date.getFullYear();
    const yearStemIndex = (year + 6) % 10; // 1984年が甲子年のため、+6のオフセット
    const yearStem = STEMS[yearStemIndex];
    
    // 指定されたアルゴリズムで計算
    const result = calculateFn(date, yearStem);
    const calculated = typeof result === 'string' ? result : result.fullStemBranch;
    
    // 正解判定
    const isCorrect = calculated === expected;
    if (isCorrect) {
      correctCount++;
    } else {
      incorrectCount++;
    }
    
    // 結果表示
    const mark = isCorrect ? '✓' : '✗';
    console.log(`${mark} ${dateStr} (${yearStem}年): [${calculated}] (期待値: ${expected})`);
  });
  
  // 精度の計算
  const accuracy = (correctCount / testCases.length) * 100;
  console.log(`\n${algorithmName}の精度: ${correctCount}/${testCases.length} 正解 (${accuracy.toFixed(2)}%)`);
  
  return { correctCount, incorrectCount, accuracy };
}

/**
 * 基本公式のみの精度を検証
 */
function testBasicFormulaAccuracy() {
  return testAlgorithmAccuracy('基本公式のみ', (date) => {
    const result = calculateBasicMonthPillar(date);
    return result;
  });
}

/**
 * 階層的アルゴリズムの精度を検証（参照テーブルなし）
 */
function testHierarchicalAlgorithmAccuracy() {
  return testAlgorithmAccuracy('階層的アルゴリズム（参照テーブルなし）', (date, yearStem) => {
    return calculateKoreanMonthPillar(date, yearStem, { ignoreReference: true });
  });
}

/**
 * 完全実装（参照テーブル含む）の精度を検証
 */
function testFullImplementationAccuracy() {
  return testAlgorithmAccuracy('完全実装（参照テーブル含む）', (date, yearStem) => {
    return calculateKoreanMonthPillar(date, yearStem);
  });
}

/**
 * 特定の日付の結果を詳細表示
 * @param dateStr 日付文字列（YYYY-MM-DD）
 */
function testSpecificDate(dateStr) {
  console.log(`\n===== ${dateStr} の詳細検証 =====`);
  
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  // 年干を取得
  const yearStemIndex = (year + 6) % 10;
  const yearStem = STEMS[yearStemIndex];
  
  console.log(`日付: ${dateStr}, 年干: ${yearStem}`);
  
  // 各アルゴリズムで計算
  const expected = MONTH_PILLAR_REFERENCE[dateStr] || '不明';
  
  // 1. 基本公式
  const basicResult = calculateBasicMonthPillar(date);
  const basicCorrect = basicResult.fullStemBranch === expected;
  console.log(`基本公式: ${basicResult.fullStemBranch} ${basicCorrect ? '✓' : '✗'} (${basicResult.algorithm})`);
  
  // 2. 階層的アルゴリズム（参照テーブルなし）
  const hierarchicalResult = calculateKoreanMonthPillar(date, yearStem, { ignoreReference: true });
  const hierarchicalCorrect = hierarchicalResult.fullStemBranch === expected;
  console.log(`階層的アルゴリズム: ${hierarchicalResult.fullStemBranch} ${hierarchicalCorrect ? '✓' : '✗'} (${hierarchicalResult.method})`);
  
  // 3. 完全実装
  const fullResult = calculateKoreanMonthPillar(date, yearStem);
  const fullCorrect = fullResult.fullStemBranch === expected;
  console.log(`完全実装: ${fullResult.fullStemBranch} ${fullCorrect ? '✓' : '✗'} (${fullResult.method})`);
  
  return {
    basic: basicResult,
    hierarchical: hierarchicalResult,
    full: fullResult,
    expected
  };
}

// テスト実行
console.log('===== 韓国式月柱計算アルゴリズム精度検証 =====');

// 基本公式の精度
const basicResults = testBasicFormulaAccuracy();

// 階層的アルゴリズムの精度
const hierarchicalResults = testHierarchicalAlgorithmAccuracy();

// 完全実装の精度
const fullResults = testFullImplementationAccuracy();

// 特定日付の詳細検証
console.log('\n===== 重要日付の詳細検証 =====');

// 2023/10/15（重要なテストケース）
testSpecificDate('2023-10-15');

// 1986/05/26（重要なテストケース）
testSpecificDate('1986-05-26');

// 精度比較サマリー
console.log('\n===== 精度比較サマリー =====');
console.log(`基本公式のみ: ${basicResults.accuracy.toFixed(2)}%`);
console.log(`階層的アルゴリズム（参照テーブルなし）: ${hierarchicalResults.accuracy.toFixed(2)}%`);
console.log(`完全実装（参照テーブル含む）: ${fullResults.accuracy.toFixed(2)}%`);

console.log('\n===== アルゴリズム構造 =====');
console.log('1. 参照テーブル層: 既知の日付に対する正確な月柱情報');
console.log('2. ルールベース層: 年干ごとの特殊ルールと節気に基づく特殊ルール');
console.log('3. アルゴリズム層: 節気に基づく一般的なアルゴリズムと基本公式');
console.log('優先順位: 参照テーブル > 特殊ルール > 節気アルゴリズム > 基本アルゴリズム');

// このファイルが直接実行された場合のみテストを実行
if (require.main === module) {
  // すでに上記でテストを実行済み
}