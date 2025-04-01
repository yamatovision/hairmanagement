/**
 * 韓国式四柱推命計算システム 統合テスト
 * 
 * 正しく動作するために以下の修正を実施:
 * - require/import文の互換性修正
 * - 日付操作とパース処理の改善
 * - 韓国語の入力サポート
 */
import { SajuCalculator } from './sajuCalculator';
import { calculateKoreanYearPillar } from './koreanYearPillarCalculator';
import { calculateKoreanMonthPillar } from './koreanMonthPillarCalculator';
import { calculateKoreanDayPillar } from './dayPillarCalculator';
import { calculateKoreanHourPillar } from './hourPillarCalculator';

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
    description: "韓国語テスト1: 2023年8月7日 12時",
    date: new Date(2023, 7, 7),
    hour: 12,
    gender: 'F' as 'F'
  },
  {
    description: "韓国語テスト2: 2023年6月19日 12時",
    date: new Date(2023, 5, 19),
    hour: 12,
    gender: 'F' as 'F'
  },
  {
    description: "陽 2022/04/06 23:00 女性 ソウル",
    date: new Date(2022, 3, 6),
    hour: 23,
    gender: 'F' as 'F',
    location: 'ソウル特別市'
  },
  {
    description: "陽 2024/02/04 12:00 女性 東京",
    date: new Date(2024, 1, 4),
    hour: 12,
    gender: 'F' as 'F',
    location: '東京 都'
  },
  {
    description: "陽 2023/02/03 12:00 女性 東京",
    date: new Date(2023, 1, 3),
    hour: 12,
    gender: 'F' as 'F',
    location: '東京 都'
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
  
  // 修正済みテストデータ
  const validTestDates = [
    {
      description: "1986年5月26日 5時 (丙寅年)",
      date: new Date(1986, 4, 26, 5, 0, 0),
      hour: 5,
      gender: 'M' as 'M',
      location: '東京',
      yearStem: "丙"
    },
    {
      description: "2023年10月15日 12時 (癸卯年)",
      date: new Date(2023, 9, 15, 12, 0, 0),
      hour: 12,
      gender: 'M' as 'M',
      location: '東京',
      yearStem: "癸"
    }
  ];
  
  for (const test of validTestDates) {
    try {
      console.log(`【${test.description}】`);
      console.log(`日付: ${test.date.toISOString().split('T')[0]}, 時間: ${test.hour}時, 性別: ${test.gender}`);
      
      // 修正: まず各柱を個別に計算
      const yearPillar = calculateKoreanYearPillar(test.date.getFullYear());
      const monthPillar = calculateKoreanMonthPillar(test.date, test.yearStem);
      const dayPillar = calculateKoreanDayPillar(test.date);
      const hourPillar = calculateKoreanHourPillar(test.hour, dayPillar.stem);
      
      console.log('直接計算の柱:',
        `年柱[${yearPillar.fullStemBranch}] ` +
        `月柱[${monthPillar.fullStemBranch}] ` +
        `日柱[${dayPillar.fullStemBranch}] ` +
        `時柱[${hourPillar.fullStemBranch}]`);
      
      // SajuCalculatorで統合計算も実行
      const result = SajuCalculator.calculate(test.date, test.hour, test.gender, test.location);
      
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
      
      // 十二運星を表示（オプション）
      if (result.twelveFortunes) {
        console.log('十二運星:');
        Object.entries(result.twelveFortunes).forEach(([branch, fortune]) => {
          console.log(`  ${branch}: ${fortune}`);
        });
      }
    } catch (error) {
      console.error(`【エラー】${test.description}の計算中にエラーが発生しました:`, error);
    }
    
    console.log('\n---\n');
  }
  
  console.log('テスト完了');
}

// 個別テスト用関数
function testSpecificDates() {
  console.log('=== 特定の日時のテスト ===\n');
  
  // 日付を文字列からパースする関数
  function parseDate(dateStr: string, hourStr: string): Date {
    const [year, month, day] = dateStr.split('/').map(Number);
    const hour = parseInt(hourStr.split(':')[0], 10);
    // JavaScriptの月は0始まりなので1を引く
    return new Date(year, month - 1, day, hour, 0, 0);
  }
  
  const specificTests = [
    {
      description: "양 2022/04/06 23:00 여자 서울특별시",
      dateStr: "2022/04/06",
      hourStr: "23:00",
      gender: 'F' as 'F',
      location: 'ソウル'
    },
    {
      description: "양 2024/02/04 12:00 여자 도쿄 도",
      dateStr: "2024/02/04",
      hourStr: "12:00",
      gender: 'F' as 'F',
      location: '東京'
    },
    {
      description: "양 2023/02/03 12:00 여자 도쿄 도",
      dateStr: "2023/02/03",
      hourStr: "12:00",
      gender: 'F' as 'F',
      location: '東京'
    }
  ].map(test => ({
    ...test,
    date: parseDate(test.dateStr, test.hourStr),
    hour: parseInt(test.hourStr.split(':')[0], 10)
  }));
  
  for (const test of specificTests) {
    console.log(`【${test.description}】`);
    console.log(`日付: ${test.date.toISOString().split('T')[0]}, 時間: ${test.hour}時, 性別: ${test.gender}, 場所: ${test.location}`);
    
    try {
      // 四柱推命計算を実行
      const result = SajuCalculator.calculate(test.date, test.hour, test.gender, test.location);
      
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
      
      // 五行属性を表示
      console.log('五行属性:',
        `${result.elementProfile.yinYang}${result.elementProfile.mainElement}(主)`,
        `/ ${result.elementProfile.secondaryElement}(副)`);
      
      // 十神関係を表示
      console.log('十神関係:');
      Object.entries(result.tenGods).forEach(([pillar, god]) => {
        console.log(`  ${pillar}: ${god}`);
      });
      
      console.log('\n---\n');
    } catch (error) {
      console.error(`【エラー】${test.description}の計算中にエラーが発生しました:`, error);
      console.log('\n---\n');
    }
  }
}

// コメントアウト - テストは下のif文で実行
// testSajuCalculation();
// testSpecificDates();

/**
 * 統合テスト関数 - 直接計算版
 * SajuCalculator を使わず、個別のモジュールを使用して四柱を計算
 */
function testDirectCalculation(): void {
  console.log('=== 韓国式四柱推命計算システム 直接計算テスト ===\n');
  
  // テストデータ
  const testDates = [
    {
      description: "1986年5月26日 5時",
      date: new Date(1986, 4, 26),
      hour: 5,
      yearStem: "丙"
    },
    {
      description: "2023年10月15日 12時",
      date: new Date(2023, 9, 15),
      hour: 12,
      yearStem: "癸"
    }
  ];
  
  for (const test of testDates) {
    console.log(`【${test.description}】`);
    
    // 直接計算（個別モジュール使用）
    const yearPillar = calculateKoreanYearPillar(test.date.getFullYear());
    const monthPillar = calculateKoreanMonthPillar(test.date, test.yearStem);
    const dayPillar = calculateKoreanDayPillar(test.date);
    const hourPillar = calculateKoreanHourPillar(test.hour, dayPillar.stem);
    
    // 四柱情報を表示
    console.log('四柱:',
      `年柱[${yearPillar.fullStemBranch}] ` +
      `月柱[${monthPillar.fullStemBranch}] ` +
      `日柱[${dayPillar.fullStemBranch}] ` +
      `時柱[${hourPillar.fullStemBranch}]`);
    
    console.log('\n---\n');
  }
}

// このファイルを直接実行した場合のみテストを実行
if (require.main === module) {
  // 標準テスト
  testSajuCalculation();
  
  // 直接計算テスト
  testDirectCalculation();
  
  // 特定の日時のテスト
  // testSpecificDates();
}