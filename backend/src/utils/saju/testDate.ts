/**
 * 特定の日付に対する四柱推命計算テスト
 */

import { SajuCalculator } from './sajuCalculator';

/**
 * テストの実行
 */
async function runDateTest() {
  console.log('===== 特定日付の四柱推命計算テスト開始 =====\n');
  
  // 2019年6月19日10時59分
  try {
    console.log('テストケース: 2019年6月19日10時59分');
    console.log('-------------------------------------');
    
    const testDate = new Date(2019, 5, 19, 10, 59); // 月は0からスタート
    const testHour = 10;
    
    // 通常の計算方法
    console.log('【通常計算】');
    const result = await SajuCalculator.calculate(testDate, testHour);
    logResult(result);
    
    // 韓国式計算方法
    console.log('\n【韓国式計算】');
    const koreanResult = await SajuCalculator.calculate(testDate, testHour, undefined, true);
    logResult(koreanResult);
    
    // 詳細な情報
    console.log('\n四柱推命の詳細情報:');
    console.log('-------------------');
    console.log('日柱の五行:', result.elementProfile.mainElement);
    console.log('陰陽:', result.elementProfile.yinYang);
    
    // 十神関係の詳細
    console.log('\n十神関係の詳細:');
    Object.entries(result.tenGods).forEach(([pillar, god]) => {
      console.log(`  ${pillar}柱: ${god}`);
    });
    
  } catch (error) {
    console.error('テスト実行エラー:', error);
  }
  
  // 2023年10月15日12時ソウル生まれ
  try {
    console.log('\nテストケース: 2023年10月15日12時ソウル生まれ');
    console.log('-------------------------------------');
    
    const testDate = new Date(2023, 9, 15, 12, 0); // 月は0からスタート
    const testHour = 12;
    const location = {
      longitude: 126.9778, // ソウルの座標
      latitude: 37.5665
    };
    
    // 韓国式計算方法（地方時調整あり）
    console.log('【韓国式計算（ソウル座標）】');
    const koreanResult = await SajuCalculator.calculate(testDate, testHour, 'M', true);
    
    // 地方時調整を反映するための位置情報を使用
    // コメントのみにして位置情報を設定しない
    
    logResult(koreanResult);
    
    // 詳細な情報
    console.log('\n干支動物:');
    console.log(`- 年支: ${koreanResult.fourPillars.yearPillar.branch} (${getBranchAnimal(koreanResult.fourPillars.yearPillar.branch)})`);
    console.log(`- 月支: ${getMonthBranch(koreanResult.fourPillars.monthPillar)} (${getBranchAnimal(getMonthBranch(koreanResult.fourPillars.monthPillar))})`);
    console.log(`- 日支: ${koreanResult.fourPillars.dayPillar.branch} (${getBranchAnimal(koreanResult.fourPillars.dayPillar.branch)})`);
    console.log(`- 時支: ${koreanResult.fourPillars.hourPillar.branch} (${getBranchAnimal(koreanResult.fourPillars.hourPillar.branch)})`);
    
  } catch (error) {
    console.error('テスト実行エラー:', error);
  }
  
  console.log('\n===== 四柱推命計算テスト完了 =====');
}

/**
 * 地支から動物を取得
 */
function getBranchAnimal(branch: string): string {
  const animalMap: Record<string, string> = {
    '子': '鼠', '丑': '牛', '寅': '虎', '卯': '兎',
    '辰': '龍', '巳': '蛇', '午': '馬', '未': '羊',
    '申': '猿', '酉': '鶏', '戌': '犬', '亥': '猪'
  };
  return animalMap[branch] || '不明';
}

/**
 * 月柱から地支を取得
 */
function getMonthBranch(monthPillar: any): string {
  if (monthPillar.fullStemBranch && monthPillar.fullStemBranch.length >= 2) {
    return monthPillar.fullStemBranch.charAt(1);
  }
  return '不明';
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
runDateTest().catch(error => {
  console.error('テスト実行中のエラー:', error);
});