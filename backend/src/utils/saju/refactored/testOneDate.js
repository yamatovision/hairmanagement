/**
 * 特定の日付で韓国式月柱計算をテスト
 */

// 必要なモジュールをインポート
const { STEMS } = require('./types');
const { calculateKoreanMonthPillar } = require('./koreanMonthPillarCalculator');

// テスト対象の日付
const TEST_DATE = new Date(2023, 9, 15); // 2023-10-15
const EXPECTED = "壬戌";

// 年干の計算
const year = TEST_DATE.getFullYear();
const yearStemIndex = (year + 6) % 10; // 1984年が甲子年
const yearStem = STEMS[yearStemIndex];

console.log(`===== 日付: 2023-10-15, 年干: ${yearStem} =====`);

// 月柱計算
const result = calculateKoreanMonthPillar(TEST_DATE, yearStem);
console.log(`計算結果: ${result ? JSON.stringify(result) : '計算失敗'}`);
console.log(`期待値: ${EXPECTED}`);
console.log(`一致: ${result && result.fullStemBranch === EXPECTED ? 'はい ✓' : 'いいえ ✗'}`);

// 特定の日付だけを確認するための追加テスト
const IMPORTANT_DATES = [
  { date: new Date(2023, 9, 15), expected: "壬戌" }, // 2023-10-15
  { date: new Date(1986, 4, 26), expected: "癸巳" }  // 1986-05-26
];

console.log("\n===== 重要日付の確認 =====");
IMPORTANT_DATES.forEach(({ date, expected }) => {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  
  // 年干の計算
  const yStemIndex = (y + 6) % 10;
  const yStem = STEMS[yStemIndex];
  
  // 計算
  const r = calculateKoreanMonthPillar(date, yStem);
  
  console.log(`${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')} (${yStem}年):`);
  console.log(`  計算結果: ${r ? r.fullStemBranch : '計算失敗'}`);
  console.log(`  期待値: ${expected}`);
  console.log(`  一致: ${r && r.fullStemBranch === expected ? 'はい ✓' : 'いいえ ✗'}`);
});