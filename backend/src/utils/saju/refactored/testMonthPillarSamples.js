/**
 * 韓国式四柱推命 - 月柱計算サンプルテスト
 * calender.mdから抽出したサンプルデータと追加の新しいサンプルを検証
 */
const { calculateKoreanMonthPillar } = require('./koreanMonthPillarCalculator');
const { STEMS, BRANCHES } = require('./types');

// 検証サンプル - 既存のテストケース
const EXISTING_TEST_SAMPLES = [
  { date: "2023-10-15", expected: "壬戌", description: "癸年10月15日 - 壬戌" },
  { date: "1986-05-26", expected: "癸巳", description: "丙年5月26日 - 癸巳" },
  { date: "2024-02-04", expected: "乙丑", description: "甲年2月4日 - 乙丑" },
  { date: "2023-02-03", expected: "癸丑", description: "癸年2月3日 - 癸丑" },
  { date: "2023-02-04", expected: "甲寅", description: "癸年2月4日 - 甲寅（立春）" }
];

// 新しいテストサンプル - 既存のテストケースに含まれない日付
const NEW_TEST_SAMPLES = [
  { date: "2025-03-15", description: "乙年3月15日" },
  { date: "2026-02-04", description: "丙年2月4日（立春）" },
  { date: "2022-11-07", description: "壬年11月7日" },
  { date: "2028-06-15", description: "戊年6月15日" },
  { date: "2029-09-21", description: "己年9月21日" }
];

/**
 * サンプルデータの検証
 */
function testSamples() {
  console.log('===== 韓国式月柱計算サンプル検証 =====\n');
  
  // 既存のテストケース検証
  console.log("【既存のテストケース検証】");
  let existingSuccessCount = 0;
  
  EXISTING_TEST_SAMPLES.forEach(sample => {
    // 日付解析
    const [year, month, day] = sample.date.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    // 年干計算
    const yearStemIndex = (year + 6) % 10;
    const yearStem = STEMS[yearStemIndex];
    
    // 月柱計算（テストケース無視）
    const result = calculateKoreanMonthPillar(date, yearStem, { ignoreTestCases: true });
    const isSuccess = result.fullStemBranch === sample.expected;
    
    if (isSuccess) existingSuccessCount++;
    
    // 結果表示
    const mark = isSuccess ? '✓' : '✗';
    console.log(`${mark} ${sample.date} (${yearStem}年): ${sample.description}`);
    console.log(`   期待値[${sample.expected}] アルゴリズム計算値[${result.fullStemBranch}]`);
    
    if (!isSuccess) {
      // 不一致の場合は詳細を表示
      console.log(`   - 不一致の詳細: 期待[${sample.expected}] vs 計算[${result.fullStemBranch}]`);
    }
  });
  
  // 成功率表示
  const existingTotalSamples = EXISTING_TEST_SAMPLES.length;
  const existingSuccessRate = Math.round((existingSuccessCount / existingTotalSamples) * 100);
  
  console.log(`\n結果: ${existingSuccessCount}成功, ${existingTotalSamples - existingSuccessCount}失敗 (成功率: ${existingSuccessRate}%)`);

  // 新しいサンプルの検証
  console.log("\n【新しいサンプルの検証】");
  
  NEW_TEST_SAMPLES.forEach(sample => {
    // 日付解析
    const [year, month, day] = sample.date.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    // 年干計算
    const yearStemIndex = (year + 6) % 10;
    const yearStem = STEMS[yearStemIndex];
    
    // アルゴリズムで計算（テストケース無視）
    const result = calculateKoreanMonthPillar(date, yearStem, { ignoreTestCases: true });
    
    // 韓国式月柱計算の参考計算式（calender.mdから抽出）
    // v ≡ (2y + m + 3) mod 10 （月干）
    // u ≡ (m + 1) mod 12 （月支）
    const v = (2 * year + month + 3) % 10;
    const monthStemIndex = v === 0 ? 9 : v - 1; // インデックスは0始まりなので調整
    
    const u = (month + 1) % 12;
    const monthBranchIndex = u === 0 ? 11 : u - 1; // インデックスは0始まりなので調整
    
    const formulaStem = STEMS[monthStemIndex];
    const formulaBranch = BRANCHES[monthBranchIndex];
    const formulaResult = `${formulaStem}${formulaBranch}`;
    
    console.log(`${sample.date} (${yearStem}年): ${sample.description}`);
    console.log(`   アルゴリズム計算値: ${result.fullStemBranch}`);
    console.log(`   基本計算式による値: ${formulaResult}`);
    
    // 計算結果が一致するか確認
    if (result.fullStemBranch !== formulaResult) {
      console.log(`   - 注意: 標準計算式との差異があります`);
    }
  });
  
  // 総括
  console.log('\n===== 総括 =====');
  console.log('韓国式四柱推命の月柱計算アルゴリズムの精度評価:');
  console.log(`1. 既知のテストケース: ${existingSuccessRate}%の成功率 (${existingSuccessCount}/${existingTotalSamples})`);
  console.log('2. 新しいサンプルについては、アルゴリズム計算と基本計算式による結果を比較');
  console.log('   ※アルゴリズムは節気や特殊な日付を考慮するため、基本計算式とは差異があります');
  
  return {
    existingSuccessCount,
    existingTotalSamples,
    existingSuccessRate
  };
}

// スクリプト実行
testSamples();