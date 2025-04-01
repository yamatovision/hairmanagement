/**
 * 四柱推命計算機能のテスト
 * 韓国式と通常の計算方法を比較検証
 * 
 * 実行方法:
 * node testSajuCalculator.js
 */

// ユーザーが提供した韓国語の四柱推命データ
const userProvidedKoreanSaju = {
  // 1986年5月26日午前5時
  data1: {
    date: '1986/05/26',
    hour: 5,
    gender: 'male',
    dayPillar: { stem: '庚', branch: '午' },  // 일주: 경오
    monthPillar: { stem: '己', branch: '巳' }, // 월주: 기사
    yearPillar: { stem: '丙', branch: '寅' },  // 년주: 병인
    timePillar: { stem: '癸', branch: '巳' }   // 시주: 계사
  },
  
  // 1986年4月18日午前5時
  data2: {
    date: '1986/04/18',
    hour: 5,
    gender: 'male',
    dayPillar: { stem: '壬', branch: '辰' }  // ※韓国語データからの推測
  }
};

/**
 * テスト関数
 */
async function runCalculationTests() {
  console.log('===== 四柱推命計算テスト開始 =====\n');
  
  console.log('テストケース1: 1986年5月26日午前5時生まれ');
  console.log('-------------------------------------');
  
  // APIからの旧暦情報の確認
  const { getLunarData } = require('./lunarCalendarAPI');
  const lunarData = await getLunarData(new Date(1986, 4, 26)); // 月は0始まり
  if (lunarData) {
    console.log('旧暦情報:', lunarData);
  } else {
    console.log('旧暦情報が取得できませんでした');
  }
  
  // 通常計算方法
  try {
    const sajuCalc = require('./sajuCalculator').SajuCalculator;
    const resultStandard = await sajuCalc.calculate(
      new Date(1986, 4, 26), // 5月26日
      5, // 5時
      'M',
      false // 通常計算
    );
    
    console.log('\n通常計算結果:');
    console.log('年柱:', resultStandard.fourPillars.yearPillar.fullStemBranch);
    console.log('月柱:', resultStandard.fourPillars.monthPillar.fullStemBranch);
    console.log('日柱:', resultStandard.fourPillars.dayPillar.fullStemBranch);
    console.log('時柱:', resultStandard.fourPillars.hourPillar.fullStemBranch);
    console.log('五行:', resultStandard.elementProfile.mainElement);
    console.log('陰陽:', resultStandard.elementProfile.yinYang);
    
    // 韓国式計算方法
    console.log('\n韓国式計算結果:');
    const resultKorean = await sajuCalc.calculate(
      new Date(1986, 4, 26), // 5月26日
      5, // 5時
      'M',
      true // 韓国式計算
    );
    
    console.log('年柱:', resultKorean.fourPillars.yearPillar.fullStemBranch);
    console.log('月柱:', resultKorean.fourPillars.monthPillar.fullStemBranch);
    console.log('日柱:', resultKorean.fourPillars.dayPillar.fullStemBranch);
    console.log('時柱:', resultKorean.fourPillars.hourPillar.fullStemBranch);
    console.log('五行:', resultKorean.elementProfile.mainElement);
    console.log('陰陽:', resultKorean.elementProfile.yinYang);
    
    // 比較
    console.log('\n韓国語データとの比較:');
    const koreanData = userProvidedKoreanSaju.data1;
    console.log('年柱: 期待値=', koreanData.yearPillar.stem + koreanData.yearPillar.branch, 
      '通常計算=', resultStandard.fourPillars.yearPillar.fullStemBranch,
      '韓国式計算=', resultKorean.fourPillars.yearPillar.fullStemBranch);
      
    console.log('日柱: 期待値=', koreanData.dayPillar.stem + koreanData.dayPillar.branch, 
      '通常計算=', resultStandard.fourPillars.dayPillar.fullStemBranch,
      '韓国式計算=', resultKorean.fourPillars.dayPillar.fullStemBranch);
      
    console.log('時柱: 期待値=', koreanData.timePillar.stem + koreanData.timePillar.branch, 
      '通常計算=', resultStandard.fourPillars.hourPillar.fullStemBranch,
      '韓国式計算=', resultKorean.fourPillars.hourPillar.fullStemBranch);
  } catch (error) {
    console.error('計算エラー:', error);
  }
  
  console.log('\nテストケース2: 現在日時の四柱');
  console.log('-------------------------------------');
  
  try {
    const sajuCalc = require('./sajuCalculator').SajuCalculator;
    
    // 現在の日時の四柱（通常計算）
    const todayStandard = await sajuCalc.getTodayFourPillars(false);
    console.log('今日の四柱 (通常計算):');
    console.log('年柱:', todayStandard.yearPillar.fullStemBranch);
    console.log('月柱:', todayStandard.monthPillar.fullStemBranch);
    console.log('日柱:', todayStandard.dayPillar.fullStemBranch);
    
    // 現在の日時の四柱（韓国式計算）
    const todayKorean = await sajuCalc.getTodayFourPillars(true);
    console.log('\n今日の四柱 (韓国式計算):');
    console.log('年柱:', todayKorean.yearPillar.fullStemBranch);
    console.log('月柱:', todayKorean.monthPillar.fullStemBranch);
    console.log('日柱:', todayKorean.dayPillar.fullStemBranch);
  } catch (error) {
    console.error('計算エラー:', error);
  }
  
  console.log('\n===== 四柱推命計算テスト完了 =====');
}

// テスト実行
runCalculationTests().catch(err => {
  console.error('テスト実行エラー:', err);
});