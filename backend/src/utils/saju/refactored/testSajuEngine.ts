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
    description: "1986年5月26日 5時 (丙寅年) - 男性 東京",
    date: new Date(1986, 4, 26),
    hour: 5,
    gender: 'M' as 'M',
    location: '東京',
    expected: null
  },
  {
    description: "2023年10月15日 12時 (癸卯年) - 男性 東京",
    date: new Date(2023, 9, 15),
    hour: 12,
    gender: 'M' as 'M',
    location: '東京',
    expected: null
  },
  {
    description: "2022年4月6日 23時 (壬寅年) - 女性 ソウル",
    date: new Date(2022, 3, 6),
    hour: 23,
    gender: 'F' as 'F',
    location: 'ソウル',
    expected: null
  },
  // sample.mdからの追加テストデータ
  {
    description: "2023年2月4日 0時 (立春日) - 女性 ソウル",
    date: new Date(2023, 1, 4),
    hour: 0,
    gender: 'F' as 'F',
    location: 'ソウル',
    expected: {
      year: "壬寅",
      month: "癸丑",
      day: "癸巳",
      hour: "壬子"
    }
  },
  {
    description: "2023年10月15日 1時 (子の刻) - 女性 ソウル",
    date: new Date(2023, 9, 15),
    hour: 1,
    gender: 'F' as 'F',
    location: 'ソウル',
    expected: {
      year: "癸卯",
      month: "壬戌",
      day: "丙午",
      hour: "戊子"
    }
  },
  {
    description: "1985年1月1日 0時 - 男性 ソウル",
    date: new Date(1985, 0, 1),
    hour: 0,
    gender: 'M' as 'M',
    location: 'ソウル',
    expected: {
      year: "甲子",
      month: "丙子",
      day: "庚子",
      hour: "丙子"
    }
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
 * 蔵干情報をフォーマットして表示用文字列に変換
 */
function formatHiddenStems(hiddenStems) {
  if (!hiddenStems) return "情報なし";
  
  return `年[${hiddenStems.year?.join('、') || 'なし'}] ` +
         `月[${hiddenStems.month?.join('、') || 'なし'}] ` +
         `日[${hiddenStems.day?.join('、') || 'なし'}] ` +
         `時[${hiddenStems.hour?.join('、') || 'なし'}]`;
}

/**
 * 十二運星情報をフォーマットして表示用文字列に変換
 */
function formatTwelveFortunes(twelveFortunes) {
  if (!twelveFortunes) return "情報なし";
  
  return `年[${twelveFortunes.year || 'なし'}] ` +
         `月[${twelveFortunes.month || 'なし'}] ` +
         `日[${twelveFortunes.day || 'なし'}] ` +
         `時[${twelveFortunes.hour || 'なし'}]`;
}

/**
 * テスト結果を文字列化する
 */
function formatPillarExpectation(expected) {
  if (!expected) return "動的に計算";
  return `年柱[${expected.year}] 月柱[${expected.month}] 日柱[${expected.day}] 時柱[${expected.hour}]`;
}

/**
 * 日時を読みやすい形式にフォーマット
 */
function formatSimpleDateTime(date: Date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}時${date.getMinutes() > 0 ? date.getMinutes() + '分' : ''}`;
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
      
      // 調整済み日時情報を表示
      if (result.processedDateTime) {
        console.log(`- 原始日時: ${formatSimpleDateTime(result.processedDateTime.originalDate)}`);
        console.log(`- 調整日時: ${formatSimpleDateTime(result.processedDateTime.adjustedDate)}`);
      }
      
      // 旧暦情報を表示
      if (result.lunarDate) {
        console.log(`- 旧暦: ${result.lunarDate.year}年${result.lunarDate.month}月${result.lunarDate.day}日${result.lunarDate.isLeapMonth ? ' (閏月)' : ''}`);
      }
      
      // 四柱情報を表示
      console.log(`- 四柱: ${formatFourPillars(result.fourPillars)}`);
      
      // 蔵干情報を表示
      console.log(`- 蔵干: ${formatHiddenStems(result.hiddenStems)}`);
      
      // 十二運星情報を表示
      console.log(`- 十二運星: ${formatTwelveFortunes(result.twelveFortunes)}`);
      
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
    console.log(`\n【${test.date.getFullYear()}年${test.date.getMonth() + 1}月${test.date.getDate()}日 ${test.hour}時 @ ${test.location}】`);
    
    // オプション更新
    processor.updateOptions({ location: test.location });
    
    // 処理実行
    const processed = processor.processDateTime(test.date, test.hour);
    
    console.log(`- 元の日時: ${formatSimpleDateTime(processed.originalDate)}`);
    console.log(`- 調整日時: ${formatSimpleDateTime(processed.adjustedDate)}`);
    
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