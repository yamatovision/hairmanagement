/**
 * 日柱計算モジュールのテスト
 * 
 * calender.mdからのデータと比較して検証します。
 */
import { 
  getDayPillar, 
  calculateKoreanDayPillar,
  verifyDayPillarCalculation
} from './dayPillarCalculator';
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
  console.log('===== 日柱計算モジュール テスト開始 =====');

  // calender.mdからのサンプルデータ
  const testData = [
    { date: new Date(2023, 9, 1), expected: "壬辰" },
    { date: new Date(2023, 9, 2), expected: "癸巳" },
    { date: new Date(2023, 9, 3), expected: "甲午" },
    { date: new Date(2023, 9, 4), expected: "乙未" },
    { date: new Date(2023, 9, 5), expected: "丙申" },
    { date: new Date(2023, 9, 6), expected: "丁酉" },
    { date: new Date(2023, 9, 7), expected: "戊戌" },
    { date: new Date(2023, 9, 15), expected: "丙午" },
    { date: new Date(1986, 4, 26), expected: "庚午" }
  ];

  // 韓国式計算のテスト
  console.log('\n----- 韓国式計算のテスト -----');
  let successCount = 0;
  let failCount = 0;
  
  for (const test of testData) {
    const result = calculateKoreanDayPillar(test.date);
    const success = assertEqual(result.fullStemBranch, test.expected, 
      `${test.date.toISOString().split('T')[0]}の日柱`);
    if (success) successCount++; else failCount++;
  }
  
  console.log(`\n韓国式計算: ${successCount}成功, ${failCount}失敗`);

  // 内部検証関数のテスト
  console.log('\n----- 内部検証関数のテスト -----');
  const verificationResult = verifyDayPillarCalculation();
  console.log(`内部検証関数の結果: ${verificationResult ? '✅ 全て成功' : '❌ 一部失敗'}`);

  // 日柱の周期性テスト
  console.log('\n----- 日柱の周期性テスト -----');
  
  // 60日周期で同じ干支が繰り返されるか検証
  const baseDate = new Date(2023, 9, 1); // 2023-10-01: 壬辰
  const expectedStemBranch = "壬辰";
  
  // 60日ごとの日付を生成
  for (let i = 1; i <= 3; i++) {
    const cycleDays = 60 * i;
    const cycleDate = new Date(baseDate.getTime() + cycleDays * 24 * 60 * 60 * 1000);
    const result = calculateKoreanDayPillar(cycleDate);
    
    console.log(`${baseDate.toISOString().split('T')[0]}から${cycleDays}日後(${cycleDate.toISOString().split('T')[0]})の日柱: ${result.fullStemBranch}`);
    assertEqual(result.fullStemBranch, expectedStemBranch, `${cycleDays}日周期の検証`);
  }

  // 蔵干のテスト
  console.log('\n----- 蔵干のテスト -----');
  const day1 = calculateKoreanDayPillar(new Date(2023, 9, 1)); // 壬辰
  assertEqual(day1.hiddenStems, ["戊", "乙", "癸"], "2023-10-01(壬辰)の蔵干");
  
  const day2 = calculateKoreanDayPillar(new Date(2023, 9, 2)); // 癸巳
  assertEqual(day2.hiddenStems, ["丙", "庚", "戊"], "2023-10-02(癸巳)の蔵干");

  console.log('\n===== テスト完了 =====');
  
  return {
    successRate: successCount / testData.length
  };
}

// テスト実行
runTests()
  .then(result => {
    console.log('\n韓国式四柱推命の日柱計算について：');
    
    console.log(`
日柱計算の特徴：

1. 日柱は単純な日付の周期に基づく：
   - 天干は10日周期で循環
   - 地支は12日周期で循環
   - 全体としては60日周期で同じ干支が繰り返される

2. 計算アルゴリズム：
   - 基準日（2023年10月2日＝癸巳）からの日数差を計算
   - 10周期の天干と12周期の地支にオフセットを適用

3. 地方時の調整：
   - 厳密には地方時（経度に基づく時差）を考慮する必要がある
   - 日付変更の境界で影響する可能性がある

蔵干（地支に内包される天干）も正確に計算されます。
    `);
  })
  .catch(err => console.error('テスト実行エラー:', err));