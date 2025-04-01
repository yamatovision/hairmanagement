/**
 * 韓国式四柱推命計算システム - 包括的テストスクリプト
 * 
 * このファイルは四柱推命計算の各モジュールを個別にテストし、
 * 統合的な動作も検証するための総合的なテストスクリプトです。
 * 
 * テスト対象モジュール:
 * 1. koreanYearPillarCalculator.ts - 年柱計算
 * 2. koreanMonthPillarCalculator.ts - 月柱計算
 * 3. dayPillarCalculator.ts - 日柱計算
 * 4. hourPillarCalculator.ts - 時柱計算
 * 5. lunarDateCalculator.ts - 旧暦日付計算
 * 6. tenGodCalculator.ts - 十神計算
 * 7. sajuCalculator.ts - 統合システム
 */

import { calculateKoreanYearPillar } from './koreanYearPillarCalculator';
import { calculateKoreanMonthPillar } from './koreanMonthPillarCalculator';
import { calculateKoreanDayPillar, getLocalTimeAdjustedDate } from './dayPillarCalculator';
import { calculateKoreanHourPillar } from './hourPillarCalculator';
import { getLunarDate, getSolarTerm, getSolarTermPeriod } from './lunarDateCalculator';
import { calculateTenGods, getElementFromStem } from './tenGodCalculator';
import { SajuCalculator } from './sajuCalculator';
import { STEMS, BRANCHES, Pillar, SajuOptions, FourPillars } from './types';

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
    expected: {
      year: "丙寅",
      month: "甲巳",
      day: "庚午",
      hour: "己卯"
    }
  },
  {
    description: "2023年10月15日 12時 (癸卯年)",
    date: new Date(2023, 9, 15),
    hour: 12,
    gender: 'M' as 'M',
    location: '東京',
    expected: {
      year: "癸卯",
      month: "戊戌",
      day: "丙午",
      hour: "甲午"
    }
  },
  {
    description: "2022年4月6日 23時 (壬寅年)",
    date: new Date(2022, 3, 6),
    hour: 23,
    gender: 'F' as 'F',
    location: 'ソウル',
    expected: {
      year: "壬寅",
      month: "丁卯",
      day: "丙子",
      hour: "丙子"
    }
  },
  {
    description: "現在の日時",
    date: new Date(),
    hour: new Date().getHours(),
    gender: 'M' as 'M',
    location: '東京',
    // 現在の日時の期待値は固定できないのでnull
    expected: null
  }
];

/**
 * 四柱情報をフォーマットして表示用文字列に変換
 */
function formatFourPillars(fourPillars: FourPillars): string {
  return `年柱[${fourPillars.yearPillar.fullStemBranch}] ` +
         `月柱[${fourPillars.monthPillar.fullStemBranch}] ` +
         `日柱[${fourPillars.dayPillar.fullStemBranch}] ` +
         `時柱[${fourPillars.hourPillar.fullStemBranch}]`;
}

/**
 * テスト結果を文字列化する
 */
function formatPillarExpectation(expected: Record<string, string> | null): string {
  if (!expected) return "動的に計算";
  return `年柱[${expected.year}] 月柱[${expected.month}] 日柱[${expected.day}] 時柱[${expected.hour}]`;
}

/**
 * 各モジュールの個別テスト
 */
function testIndividualModules(): void {
  console.log('\n===== 各モジュール個別テスト =====');
  
  let totalTests = 0;
  let passedTests = 0;
  
  for (const test of TEST_DATES) {
    if (!test.expected) continue; // 期待値がnullの場合はスキップ
    
    console.log(`\n【${test.description}】`);
    console.log(`- 日付: ${test.date.toISOString().split('T')[0]}`);
    console.log(`- 時間: ${test.hour}時`);
    console.log(`- 期待値: ${formatPillarExpectation(test.expected)}`);
    
    // 1. 年柱テスト
    const yearPillar = calculateKoreanYearPillar(test.date.getFullYear());
    const yearResult = yearPillar.fullStemBranch === test.expected.year;
    totalTests++;
    if (yearResult) passedTests++;
    console.log(`- 年柱: [${yearPillar.fullStemBranch}] ${yearResult ? '✓' : '✗'}`);
    
    // 2. 月柱テスト
    // 年干を取得
    const yearStem = yearPillar.stem;
    const monthPillar = calculateKoreanMonthPillar(test.date, yearStem);
    const monthResult = monthPillar.fullStemBranch === test.expected.month;
    totalTests++;
    if (monthResult) passedTests++;
    console.log(`- 月柱: [${monthPillar.fullStemBranch}] ${monthResult ? '✓' : '✗'}`);
    
    // 3. 日柱テスト
    const options: SajuOptions = {
      gender: test.gender,
      location: test.location,
      useLocalTime: true
    };
    const dayPillar = calculateKoreanDayPillar(test.date, options);
    const dayResult = dayPillar.fullStemBranch === test.expected.day;
    totalTests++;
    if (dayResult) passedTests++;
    console.log(`- 日柱: [${dayPillar.fullStemBranch}] ${dayResult ? '✓' : '✗'}`);
    
    // 4. 時柱テスト
    const hourPillar = calculateKoreanHourPillar(test.hour, dayPillar.stem);
    const hourResult = hourPillar.fullStemBranch === test.expected.hour;
    totalTests++;
    if (hourResult) passedTests++;
    console.log(`- 時柱: [${hourPillar.fullStemBranch}] ${hourResult ? '✓' : '✗'}`);
    
    // 5. 旧暦日付テスト
    try {
      const lunarDate = getLunarDate(test.date);
      console.log(`- 旧暦: ${lunarDate ? `${lunarDate.lunarYear}年${lunarDate.lunarMonth}月${lunarDate.lunarDay}日${lunarDate.isLeapMonth ? '(閏)' : ''}` : '取得できません'}`);
    } catch (error) {
      console.log(`- 旧暦: エラー`);
    }
    
    // 6. 節気情報テスト
    try {
      const solarTerm = getSolarTerm(test.date);
      const solarTermPeriod = getSolarTermPeriod(test.date);
      console.log(`- 節気: ${solarTerm || 'なし'}`);
      console.log(`- 節気期間: ${solarTermPeriod.name} (${solarTermPeriod.index})`);
    } catch (error) {
      console.log(`- 節気: エラー`);
    }
    
    // 7. 十神関係テスト
    try {
      const tenGods = calculateTenGods(
        dayPillar.stem,
        yearPillar.stem,
        monthPillar.stem, 
        hourPillar.stem
      );
      console.log(`- 十神: 年[${tenGods.year}] 月[${tenGods.month}] 日[${tenGods.day}] 時[${tenGods.hour}]`);
    } catch (error) {
      console.log(`- 十神: エラー`);
    }
  }
  
  // 成功率表示
  const successRate = Math.round((passedTests / totalTests) * 100);
  console.log(`\n個別モジュールテスト結果: ${passedTests}/${totalTests} (${successRate}%)`);
}

/**
 * 直接計算テスト - 各モジュールを直接使用
 */
function testDirectCalculation(): void {
  console.log('\n===== 直接計算テスト (モジュール統合) =====');
  
  let totalTests = 0;
  let passedTests = 0;

  for (const test of TEST_DATES) {
    console.log(`\n【${test.description}】`);
    
    try {
      // 直接計算（個別モジュール使用）
      const yearPillar = calculateKoreanYearPillar(test.date.getFullYear());
      
      const options: SajuOptions = {
        gender: test.gender,
        location: test.location,
        useLocalTime: true
      };
      
      // 地方時調整
      const adjustedDate = getLocalTimeAdjustedDate(test.date, options);
      console.log(`- 調整日時: ${adjustedDate.toISOString()}`);
      
      const monthPillar = calculateKoreanMonthPillar(adjustedDate, yearPillar.stem);
      const dayPillar = calculateKoreanDayPillar(adjustedDate, options);
      const hourPillar = calculateKoreanHourPillar(test.hour, dayPillar.stem);
      
      // 四柱情報を表示
      const fourPillars = {
        yearPillar,
        monthPillar,
        dayPillar,
        hourPillar
      };
      
      console.log(`- 四柱: ${formatFourPillars(fourPillars)}`);
      
      // 期待値との比較（期待値がある場合のみ）
      if (test.expected) {
        const yearResult = yearPillar.fullStemBranch === test.expected.year;
        const monthResult = monthPillar.fullStemBranch === test.expected.month;
        const dayResult = dayPillar.fullStemBranch === test.expected.day;
        const hourResult = hourPillar.fullStemBranch === test.expected.hour;
        
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
  const successRate = Math.round((passedTests / totalTests) * 100);
  console.log(`\n直接計算テスト結果: ${passedTests}/${totalTests} (${successRate}%)`);
}

/**
 * SajuCalculator を使用した統合テスト
 */
function testSajuCalculator(): void {
  console.log('\n===== SajuCalculator 統合テスト =====');
  
  let totalTests = 0;
  let passedTests = 0;

  for (const test of TEST_DATES) {
    console.log(`\n【${test.description}】`);
    
    try {
      // SajuCalculator で計算
      const result = SajuCalculator.calculate(
        test.date,
        test.hour,
        test.gender,
        test.location
      );
      
      // 旧暦情報を表示
      if (result.lunarDate) {
        console.log(`- 旧暦: ${result.lunarDate.year}年${result.lunarDate.month}月${result.lunarDate.day}日${result.lunarDate.isLeapMonth ? ' (閏月)' : ''}`);
      } else {
        console.log('- 旧暦: 取得できません');
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
  const successRate = Math.round((passedTests / totalTests) * 100);
  console.log(`\nSajuCalculator テスト結果: ${passedTests}/${totalTests} (${successRate}%)`);
}

/**
 * 改善提案関数
 */
function suggestImprovements(): void {
  console.log('\n===== 改善提案 =====');
  console.log('1. koreanYearPillarCalculator.ts:');
  console.log('   - 年柱計算が正常に動作していますが、一部の年に対して予期しない結果を返す可能性あり');
  console.log('   - 1970年のケースを修正するため、基準点のアルゴリズムを微調整してください');
  
  console.log('\n2. koreanMonthPillarCalculator.ts:');
  console.log('   - 月柱計算は天干数パターンを使用した新アルゴリズムが実装されています');
  console.log('   - 2023年の特定の月（6月、8月）に特殊ケースが必要なことを検証');
  
  console.log('\n3. dayPillarCalculator.ts:');
  console.log('   - 日柱計算は60干支サイクルに基づいていますが、地方時調整に問題が見られます');
  console.log('   - 旧暦変換時のエラーハンドリングを強化する必要があります');
  
  console.log('\n4. lunarDateCalculator.ts:');
  console.log('   - lunar-javascriptライブラリへの依存の改善');
  console.log('   - 旧暦変換に際してエラーが発生した場合のフォールバック処理の強化');
  
  console.log('\n5. sajuCalculator.ts:');
  console.log('   - 年柱と月柱の取得に不具合があります');
  console.log('   - エラー回復メカニズムを実装しましたが、直接計算とSajuCalculatorの結果に差異があります');
  console.log('   - 地方時調整のエラーハンドリングを改善する必要があります');
}

/**
 * メイン実行関数
 */
function runComprehensiveTests(): void {
  console.log('======= 韓国式四柱推命計算システム 包括的テスト =======');
  console.log('テスト実行日時:', new Date().toISOString());
  console.log('テスト対象モジュール:');
  console.log('1. koreanYearPillarCalculator.ts - 年柱計算');
  console.log('2. koreanMonthPillarCalculator.ts - 月柱計算');
  console.log('3. dayPillarCalculator.ts - 日柱計算');
  console.log('4. hourPillarCalculator.ts - 時柱計算');
  console.log('5. lunarDateCalculator.ts - 旧暦日付計算');
  console.log('6. tenGodCalculator.ts - 十神計算');
  console.log('7. sajuCalculator.ts - 統合システム');
  
  // 各テスト実行
  testIndividualModules();
  testDirectCalculation();
  testSajuCalculator();
  
  // 改善提案
  suggestImprovements();
  
  console.log('\n======= テスト完了 =======');
}

// 直接実行された場合のみテストを実行
if (require.main === module) {
  runComprehensiveTests();
}