/**
 * 四柱推命計算テスト（TypeScript版）
 */

import { SajuCalculator } from './sajuCalculator';

/**
 * テストの実行
 */
async function runCalculationTests() {
  console.log('===== 四柱推命計算テスト開始 =====\n');
  
  // テストケース1: 1986年5月26日午前5時生まれ
  try {
    console.log('テストケース1: 1986年5月26日午前5時生まれ');
    console.log('-------------------------------------');
    
    const birthDate = new Date(1986, 4, 26); // 月は0からスタート
    const birthHour = 5;
    
    // 通常の計算方法
    console.log('【通常計算】');
    const result = await SajuCalculator.calculate(birthDate, birthHour);
    logResult(result);
    
    // 韓国式計算方法
    console.log('\n【韓国式計算】');
    const koreanResult = await SajuCalculator.calculate(birthDate, birthHour, undefined, true);
    logResult(koreanResult);
    
  } catch (error) {
    console.error('テスト実行エラー:', error);
  }
  
  // テストケース2: 現在の四柱
  try {
    console.log('\nテストケース2: 今日の四柱');
    console.log('-------------------------------------');
    
    // 今日の四柱
    const today = await SajuCalculator.getTodayFourPillars();
    console.log('今日の四柱:', formatFourPillars(today));
    
  } catch (error) {
    console.error('テスト実行エラー:', error);
  }
  
  console.log('\n===== 四柱推命計算テスト完了 =====');
}

/**
 * 計算結果を整形して表示
 */
function logResult(result: any) {
  console.log('四柱:', formatFourPillars(result.fourPillars));
  console.log('基本属性:', `${result.elementProfile.yinYang}${result.elementProfile.mainElement}`);
  console.log('副属性:', result.elementProfile.secondaryElement);
  
  console.log('十神関係:');
  Object.entries(result.tenGods).forEach(([pillar, god]) => {
    console.log(`  ${pillar}: ${god}`);
  });
}

/**
 * 四柱を文字列表現に整形
 */
function formatFourPillars(fourPillars: any) {
  return `年柱[${fourPillars.yearPillar.fullStemBranch}] 月柱[${fourPillars.monthPillar.fullStemBranch}] 日柱[${fourPillars.dayPillar.fullStemBranch}] 時柱[${fourPillars.hourPillar.fullStemBranch}]`;
}

// テスト実行
runCalculationTests().catch(error => {
  console.error('テスト実行中のエラー:', error);
});