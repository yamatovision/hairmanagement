/**
 * 韓国式四柱推命計算モジュールのテスト
 */
import { testYearPillar } from './yearPillarCalculator';
import { testMonthPillar } from './monthPillarCalculator';
import { testDayPillar } from './dayPillarCalculator';
import { testHourPillar } from './hourPillarCalculator';
import { testTenGods } from './tenGodCalculator';
import { testTwelveFortuneSpiritCalculator } from './twelveFortuneSpiritCalculator';
import { testSajuCalculator } from './sajuCalculator';

/**
 * 韓国式四柱推命の特定ケースを検証
 * @param date 日付
 * @param hour 時間
 * @returns 検証結果
 */
function verifySpecificCase(date: Date, hour: number) {
  console.log(`===== ${date.toLocaleDateString()} ${hour}時 四柱推命検証 =====`);
  
  // 各ステップでの計算結果を検証
  console.log('\nステップ1: 年柱の計算');
  testYearPillar();
  
  console.log('\nステップ2: 月柱の計算');
  testMonthPillar();
  
  console.log('\nステップ3: 日柱の計算');
  testDayPillar();
  
  console.log('\nステップ4: 時柱の計算');
  testHourPillar();
  
  console.log('\nステップ5: 十神関係の計算');
  testTenGods();
  
  console.log('\nステップ6: 十二運星・十二神殺の計算');
  testTwelveFortuneSpiritCalculator();
  
  console.log('\nステップ7: 統合計算の検証');
  testSajuCalculator();
}

/**
 * ケース1: 1986年5月26日5時
 */
function testCase1() {
  const date = new Date(1986, 4, 26);
  const hour = 5;
  verifySpecificCase(date, hour);
}

/**
 * ケース2: 2023年10月15日12時
 */
function testCase2() {
  const date = new Date(2023, 9, 15);
  const hour = 12;
  verifySpecificCase(date, hour);
}

// メインテスト実行
// 各ステップ別に検証
console.log('===== 韓国式四柱推命計算モジュール検証 =====');
console.log('\nケース1: 1986年5月26日5時');
testCase1();

console.log('\nケース2: 2023年10月15日12時');
testCase2();