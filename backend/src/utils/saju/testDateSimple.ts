/**
 * 特定の日付に対する四柱推命計算の簡易テスト
 */

import { SajuCalculator } from './sajuCalculator';

async function main() {
  try {
    console.log('===== 2019年6月19日10時59分の四柱推命計算 =====\n');
    
    const date = new Date(2019, 5, 19); // 月は0からスタート
    const hour = 10; // 10時台
    
    // 韓国式計算
    console.log('【韓国式計算】');
    const result = await SajuCalculator.calculate(date, hour, undefined, true);
    
    // 結果表示
    console.log('四柱（年月日時）:');
    console.log(`年柱: ${result.fourPillars.yearPillar.fullStemBranch}`);
    console.log(`月柱: ${result.fourPillars.monthPillar.fullStemBranch}`);
    console.log(`日柱: ${result.fourPillars.dayPillar.fullStemBranch}`);
    console.log(`時柱: ${result.fourPillars.hourPillar.fullStemBranch}`);
    
    console.log('\n五行プロファイル:');
    console.log(`主要五行: ${result.elementProfile.mainElement}`);
    console.log(`陰陽: ${result.elementProfile.yinYang}`);
    console.log(`副次五行: ${result.elementProfile.secondaryElement}`);
    
    console.log('\n十神関係:');
    for (const [pillar, god] of Object.entries(result.tenGods)) {
      console.log(`${pillar}柱の十神: ${god}`);
    }
    
  } catch (error) {
    console.error('計算エラー:', error);
  }
}

main().catch(console.error);