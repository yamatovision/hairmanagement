/**
 * 韓国式四柱推命計算システム 統合テスト
 */
import { SajuCalculator } from './sajuCalculator';

/**
 * テスト日時のサンプル
 */
const TEST_DATES = [
  {
    description: "1986年5月26日 5時",
    date: new Date(1986, 4, 26),
    hour: 5,
    gender: 'M' as 'M'
  },
  {
    description: "1990年10月10日 12時",
    date: new Date(1990, 9, 10),
    hour: 12,
    gender: 'F' as 'F'
  },
  {
    description: "2023年10月15日 12時",
    date: new Date(2023, 9, 15),
    hour: 12,
    gender: 'M' as 'M'
  },
  {
    description: "2023年10月2日 0時",
    date: new Date(2023, 9, 2),
    hour: 0,
    gender: 'F' as 'F'
  },
  {
    description: "現在の日時",
    date: new Date(),
    hour: new Date().getHours(),
    gender: 'M' as 'M'
  }
];

/**
 * 四柱推命計算テスト
 */
function testSajuCalculation(): void {
  console.log('=== 韓国式四柱推命計算システム 統合テスト ===\n');
  
  for (const test of TEST_DATES) {
    console.log(`【${test.description}】`);
    console.log(`日付: ${test.date.toISOString().split('T')[0]}, 時間: ${test.hour}時, 性別: ${test.gender}`);
    
    // 四柱推命計算を実行
    const result = SajuCalculator.calculate(test.date, test.hour, test.gender);
    
    // 旧暦情報を表示
    if (result.lunarDate) {
      console.log(`旧暦: ${result.lunarDate.year}年${result.lunarDate.month}月${result.lunarDate.day}日${result.lunarDate.isLeapMonth ? ' (閏月)' : ''}`);
    } else {
      console.log('旧暦: 取得できません');
    }
    
    // 四柱情報を表示
    console.log('四柱:',
      `年柱[${result.fourPillars.yearPillar.fullStemBranch}] ` +
      `月柱[${result.fourPillars.monthPillar.fullStemBranch}] ` +
      `日柱[${result.fourPillars.dayPillar.fullStemBranch}] ` +
      `時柱[${result.fourPillars.hourPillar.fullStemBranch}]`);
    
    // 蔵干（隠れた天干）を表示
    console.log('蔵干:',
      `年支[${result.fourPillars.yearPillar.branch}]: ${result.fourPillars.yearPillar.hiddenStems?.join(', ') || 'なし'}, ` +
      `日支[${result.fourPillars.dayPillar.branch}]: ${result.fourPillars.dayPillar.hiddenStems?.join(', ') || 'なし'}`);
    
    // 五行属性を表示
    console.log('五行属性:',
      `${result.elementProfile.yinYang}${result.elementProfile.mainElement}(主)`,
      `/ ${result.elementProfile.secondaryElement}(副)`);
    
    // 十神関係を表示
    console.log('十神関係:');
    Object.entries(result.tenGods).forEach(([pillar, god]) => {
      console.log(`  ${pillar}: ${god}`);
    });
    
    // 十二運星・十二神殺を表示（オプション）
    if (result.twelveFortunes) {
      console.log('十二運星:');
      Object.entries(result.twelveFortunes).forEach(([branch, fortune]) => {
        console.log(`  ${branch}: ${fortune}`);
      });
    }
    
    if (result.twelveSpirits) {
      console.log('十二神殺:');
      Object.entries(result.twelveSpirits).forEach(([branch, spirit]) => {
        console.log(`  ${branch}: ${spirit}`);
      });
    }
    
    console.log('\n---\n');
  }
  
  console.log('テスト完了');
}

// テスト実行
testSajuCalculation();

// このファイルを直接実行した場合のみテストを実行
if (require.main === module) {
  testSajuCalculation();
}