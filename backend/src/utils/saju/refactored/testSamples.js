/**
 * 韓国式四柱推命月柱テスト - 2023年サンプルテスト実行ファイル
 */
const { calculateKoreanMonthPillar } = require('./koreanMonthPillarCalculator');
const { STEMS, BRANCHES } = require('./types');

// テスト関数
function testDate(year, month, day, yearStem) {
  const date = new Date(year, month-1, day);
  const result = calculateKoreanMonthPillar(date, yearStem);
  console.log(`${year}年${month}月${day}日 (${yearStem}年): 月柱=${result.fullStemBranch} (${result.stem}${result.branch}) [計算方法: ${result.method || "basic_algorithm"}]`);
  return result;
}

// 一覧でテスト
console.log('===== 2023年サンプルデータの月柱検証 =====');
const sampleData = [
  { date: "2023/01/02", expected: "壬子", yearStem: "癸" },  // サンプル114
  { date: "2023/01/04", expected: "壬子", yearStem: "癸" },  // サンプル115
  { date: "2023/01/05", expected: "壬子", yearStem: "癸" },  // サンプル117
  { date: "2023/01/06", expected: "癸丑", yearStem: "癸" },
  { date: "2023/01/07", expected: "癸丑", yearStem: "癸" },  // サンプル116
  { date: "2023/01/15", expected: "癸丑", yearStem: "癸" },
  { date: "2023/01/30", expected: "癸丑", yearStem: "癸" },
  { date: "2023/02/02", expected: "癸丑", yearStem: "癸" },
  { date: "2023/02/04", expected: "甲寅", yearStem: "癸" },  // 立春
  { date: "2023/02/05", expected: "甲寅", yearStem: "癸" },
  { date: "2023/03/05", expected: "甲寅", yearStem: "癸" },
  { date: "2023/03/06", expected: "乙卯", yearStem: "癸" },  // 驚蟄
  { date: "2023/04/05", expected: "丙辰", yearStem: "癸" },  // サンプル120 清明
  { date: "2023/04/20", expected: "丙辰", yearStem: "癸" },  // サンプル121
  { date: "2023/05/05", expected: "丙辰", yearStem: "癸" },  // サンプル122
  { date: "2023/05/21", expected: "丁巳", yearStem: "癸" },  // サンプル123 小満
  { date: "2023/06/06", expected: "戊午", yearStem: "癸" },  // サンプル124 芒種
  { date: "2023/06/21", expected: "戊午", yearStem: "癸" },  // サンプル125 夏至
];

// サンプルデータの検証
sampleData.forEach(sample => {
  const [year, month, day] = sample.date.split('/').map(Number);
  const result = testDate(year, month, day, sample.yearStem);
  const isMatch = result.fullStemBranch === sample.expected;
  console.log(`  検証結果: ${isMatch ? '✓ 一致' : '✗ 不一致'} (期待値: ${sample.expected})`);
});

// 比較検証
console.log('\n===== 節気の前後比較 =====');
// 立春の前後
console.log('\n【立春の前後】');
testDate(2023, 2, 3, '癸');  // 立春前
testDate(2023, 2, 4, '癸');  // 立春当日
testDate(2023, 2, 5, '癸');  // 立春後

// 驚蟄の前後
console.log('\n【驚蟄の前後】');
testDate(2023, 3, 5, '癸');  // 驚蟄前
testDate(2023, 3, 6, '癸');  // 驚蟄当日
testDate(2023, 3, 7, '癸');  // 驚蟄後

// 清明の前後
console.log('\n【清明の前後】');
testDate(2023, 4, 4, '癸');  // 清明前
testDate(2023, 4, 5, '癸');  // 清明当日
testDate(2023, 4, 6, '癸');  // 清明後

// 2025年サンプル
console.log('\n===== 2025年サンプル =====');
testDate(2025, 2, 6, '乙');  // サンプル（丙午・赤い馬）

// 検証サマリー
console.log('\n===== 月柱計算精度サマリー =====');
let correct = 0;
sampleData.forEach(sample => {
  const [year, month, day] = sample.date.split('/').map(Number);
  const date = new Date(year, month-1, day);
  const result = calculateKoreanMonthPillar(date, sample.yearStem);
  if (result.fullStemBranch === sample.expected) {
    correct++;
  }
});

const accuracy = (correct / sampleData.length * 100).toFixed(2);
console.log(`検証結果: ${correct}/${sampleData.length} 正解 (${accuracy}%)`);

// 計算方法の使用状況
const methods = {};
sampleData.forEach(sample => {
  const [year, month, day] = sample.date.split('/').map(Number);
  const date = new Date(year, month-1, day);
  const result = calculateKoreanMonthPillar(date, sample.yearStem);
  methods[result.method] = (methods[result.method] || 0) + 1;
});

console.log('\n【使用された計算方法】');
Object.entries(methods).forEach(([method, count]) => {
  const percentage = (count / sampleData.length * 100).toFixed(2);
  console.log(`${method}: ${count}件 (${percentage}%)`);
});