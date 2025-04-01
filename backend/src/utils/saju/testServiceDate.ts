/**
 * サービスを使用した四柱推命計算テスト
 */

import { SajuCalculatorService } from '../../application/services/saju-calculator.service';

/**
 * テストの実行
 */
async function runServiceTest() {
  console.log('===== SajuCalculatorService テスト開始 =====\n');
  
  const service = new SajuCalculatorService();
  
  // 2019年6月19日10時59分
  try {
    console.log('テストケース: 2019年6月19日10時59分');
    console.log('-------------------------------------');
    
    const testDate = '2019-06-19';
    const testHour = 10;
    
    // 四柱推命プロファイルを計算（韓国式）
    console.log('【韓国式計算】');
    const profile = await service.calculateProfile(testDate, testHour, undefined, true);
    
    console.log('四柱:', formatFourPillars(profile.fourPillars));
    console.log('基本属性:', `${profile.yinYang}${profile.mainElement}`);
    console.log('副属性:', profile.secondaryElement);
    console.log('日主:', profile.dayMaster);
    
    // その日の四柱を計算
    console.log('\n【その日の四柱】');
    const dayPillars = await service.calculateDayFourPillars(testDate, true);
    console.log('その日の四柱:', formatFourPillars(dayPillars));
    
  } catch (error) {
    console.error('テスト実行エラー:', error);
  }
  
  console.log('\n===== SajuCalculatorService テスト完了 =====');
}

/**
 * 四柱を文字列表現に整形
 */
function formatFourPillars(fourPillars: any) {
  return `年柱[${fourPillars.yearPillar.fullStemBranch}] 月柱[${fourPillars.monthPillar.fullStemBranch}] 日柱[${fourPillars.dayPillar.fullStemBranch}] 時柱[${fourPillars.hourPillar.fullStemBranch}]`;
}

// テスト実行
runServiceTest().catch(error => {
  console.error('テスト実行中のエラー:', error);
});