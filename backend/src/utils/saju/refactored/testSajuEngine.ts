/**
 * 新しいSajuEngine実装のテストスクリプト
 */
import { SajuEngine } from './SajuEngine';
import { DateTimeProcessor } from './DateTimeProcessor';

/**
 * テストデータセット
 */
const TEST_DATES = [
  {
    description: "1986年5月26日 5時 (丙寅年)",
    date: new Date(1986, 4, 26),
    hour: 5,
    gender: 'M' as 'M',
    location: '東京',
    expected: null
  },
  {
    description: "2023年10月15日 12時 (癸卯年)",
    date: new Date(2023, 9, 15),
    hour: 12,
    gender: 'M' as 'M',
    location: '東京',
    expected: null
  },
  {
    description: "2022年4月6日 23時 (壬寅年)",
    date: new Date(2022, 3, 6),
    hour: 23,
    gender: 'F' as 'F',
    location: 'ソウル',
    expected: null
  }
];

/**
 * 四柱情報をフォーマットして表示用文字列に変換
 */
function formatFourPillars(fourPillars) {
  return `年柱[${fourPillars.yearPillar.fullStemBranch}] ` +
         `月柱[${fourPillars.monthPillar.fullStemBranch}] ` +
         `日柱[${fourPillars.dayPillar.fullStemBranch}] ` +
         `時柱[${fourPillars.hourPillar.fullStemBranch}]`;
}

/**
 * テスト結果を文字列化する
 */
function formatPillarExpectation(expected) {
  if (!expected) return "動的に計算";
  return `年柱[${expected.year}] 月柱[${expected.month}] 日柱[${expected.day}] 時柱[${expected.hour}]`;
}

/**
 * SajuEngineの包括的テスト
 */
function testSajuEngine(): void {
  console.log('======= SajuEngine 包括的テスト =======');
  
  // 新しいエンジンのインスタンスを作成
  const engine = new SajuEngine();
  
  let totalTests = 0;
  let passedTests = 0;
  
  // 標準テストケース
  const allTests = [
    ...TEST_DATES,
    // 追加テストケース
    {
      description: "2022年4月6日 23時 (壬寅年) - 女性 ソウル",
      date: new Date(2022, 3, 6),
      hour: 23,
      gender: 'F' as 'F',
      location: 'ソウル',
      expected: null
    },
    {
      description: "2024年2月4日 12時 (甲辰年) - 女性 東京",
      date: new Date(2024, 1, 4),
      hour: 12,
      gender: 'F' as 'F',
      location: '東京',
      expected: null
    },
    {
      description: "2023年2月3日 12時 (癸卯年) - 女性 東京",
      date: new Date(2023, 1, 3),
      hour: 12,
      gender: 'F' as 'F',
      location: '東京',
      expected: null
    },
    {
      description: "1985年4月22日 10時 (乙丑年) - 女性 ソウル",
      date: new Date(1985, 3, 22),
      hour: 10,
      gender: 'F' as 'F',
      location: 'ソウル',
      expected: null
    }
  ];
  
  for (const test of allTests) {
    console.log(`\n【${test.description}】`);
    console.log(`- 日付: ${test.date.toISOString().split('T')[0]}`);
    console.log(`- 時間: ${test.hour}時`);
    console.log(`- 場所: ${test.location}`);
    console.log(`- 性別: ${test.gender === 'F' ? '女性' : '男性'}`);
    console.log(`- 期待値: ${formatPillarExpectation(test.expected)}`);
    
    try {
      // SajuEngineで計算
      const result = engine.calculate(
        test.date,
        test.hour,
        test.gender,
        test.location
      );
      
      // 旧暦情報を表示
      if (result.lunarDate) {
        console.log(`- 旧暦: ${result.lunarDate.year}年${result.lunarDate.month}月${result.lunarDate.day}日${result.lunarDate.isLeapMonth ? ' (閏月)' : ''}`);
      }
      
      // 四柱情報を表示
      console.log(`- 四柱: ${formatFourPillars(result.fourPillars)}`);
      
      // 五行属性を表示
      console.log(`- 五行: ${result.elementProfile.yinYang}${result.elementProfile.mainElement}(主) / ${result.elementProfile.secondaryElement}(副)`);
      
      // 期待値との比較（期待値がある場合のみ）
      if (test.expected) {
        const yearResult = result.fourPillars.yearPillar.fullStemBranch === test.expected.year;
        const monthResult = result.fourPillars.monthPillar.fullStemBranch === test.expected.month;
        const dayResult = result.fourPillars.dayPillar.fullStemBranch === test.expected.day;
        const hourResult = result.fourPillars.hourPillar.fullStemBranch === test.expected.hour;
        
        totalTests += 4;
        if (yearResult) passedTests++;
        if (monthResult) passedTests++;
        if (dayResult) passedTests++;
        if (hourResult) passedTests++;
        
        console.log(`- 検証: 年[${yearResult ? '✓' : '✗'}] 月[${monthResult ? '✓' : '✗'}] 日[${dayResult ? '✓' : '✗'}] 時[${hourResult ? '✓' : '✗'}]`);
        
        const allCorrect = yearResult && monthResult && dayResult && hourResult;
        console.log(`- 結果: ${allCorrect ? '✓ 完全一致' : '✗ 不一致あり'}`);
      }
    } catch (error) {
      console.error(`【エラー】${test.description}の計算中にエラーが発生:`, error);
    }
  }
  
  // 成功率表示
  const successRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
  console.log(`\nSajuEngineテスト結果: ${passedTests}/${totalTests} (${successRate}%)`);
}

/**
 * DateTimeProcessorの単体テスト
 */
function testDateTimeProcessor(): void {
  console.log('\n======= DateTimeProcessor テスト =======');
  
  const processor = new DateTimeProcessor({
    useLocalTime: true
  });
  
  // サンプル日付でテスト
  const testDates = [
    { date: new Date(1986, 4, 26), hour: 5, location: '東京' },
    { date: new Date(2023, 9, 15), hour: 12, location: 'ソウル' }
  ];
  
  for (const test of testDates) {
    console.log(`\n【${test.date.toISOString().split('T')[0]} ${test.hour}時 @ ${test.location}】`);
    
    // オプション更新
    processor.updateOptions({ location: test.location });
    
    // 処理実行
    const processed = processor.processDateTime(test.date, test.hour);
    
    console.log(`- 元の日時: ${processed.originalDate.toISOString()}`);
    console.log(`- 調整日時: ${processed.adjustedDate.toISOString()}`);
    if (processed.lunarDate) {
      console.log(`- 旧暦情報: ${processed.lunarDate.year}年${processed.lunarDate.month}月${processed.lunarDate.day}日${processed.lunarDate.isLeapMonth ? ' (閏月)' : ''}`);
    }
    if (processed.solarTermPeriod) {
      console.log(`- 節気期間: ${processed.solarTermPeriod.name} (${processed.solarTermPeriod.index})`);
    }
  }
}

/**
 * 全テスト実行
 */
function runTests(): void {
  testSajuEngine();
  testDateTimeProcessor();
}

// このファイルが直接実行された場合にテストを実行
if (require.main === module) {
  runTests();
}

// テスト関数をエクスポート
export {
  testSajuEngine,
  testDateTimeProcessor,
  runTests as default
};