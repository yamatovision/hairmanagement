/**
 * 地支の十神関係計算をテストするスクリプト
 */

import { determineBranchTenGodRelation } from './tenGodIntegration';
import { calculateFourPillarsBranchTenGods } from './tenGodIntegration';
import * as tenGodCalculator from './tenGodCalculator';

/**
 * 天干と地支の組み合わせテスト
 */
function testBranchTenGodRelation() {
  console.log('==== 地支の十神関係計算テスト ====');
  
  // サンプルデータに基づくテストケース
  const testCases = [
    { dayStem: '甲', branch: '子', expected: '偏印' },
    { dayStem: '乙', branch: '丑', expected: '偏財' },
    { dayStem: '丙', branch: '寅', expected: '偏財' },
    { dayStem: '丁', branch: '卯', expected: '偏財' },
    { dayStem: '戊', branch: '辰', expected: '劫財' },
    { dayStem: '己', branch: '巳', expected: '傷官' },
    { dayStem: '庚', branch: '午', expected: '正印' },
    { dayStem: '辛', branch: '未', expected: '偏官' },
    { dayStem: '壬', branch: '申', expected: '偏印' },
    { dayStem: '癸', branch: '酉', expected: '偏印' },
    { dayStem: '甲', branch: '戌', expected: '偏財' },
    { dayStem: '乙', branch: '亥', expected: '偏印' }
  ];
  
  for (const { dayStem, branch, expected } of testCases) {
    try {
      const result = determineBranchTenGodRelation(dayStem, branch);
      const matches = result.mainTenGod === expected;
      
      console.log(
        `${dayStem}×${branch} => ${result.mainTenGod} ${matches ? '✓' : '✗ (期待値: ' + expected + ')'}`
      );
      
      // 蔵干情報も表示
      if (result.hiddenTenGods.length > 0) {
        console.log(`  蔵干: ${result.hiddenTenGods.map(h => `${h.stem}(${h.tenGod})`).join(', ')}`);
      }
    } catch (error) {
      console.error(`エラー ${dayStem}×${branch}: ${error}`);
    }
  }
}

/**
 * 日主と四柱の組み合わせテスト
 */
function testFourPillarsTenGods() {
  console.log('\n==== 四柱の十神関係計算テスト ====');
  
  // サンプルの四柱データ（sample.mdより抽出）
  const testCases = [
    // 1995年1月1日 00:00 男性 ソウル
    {
      description: "1995年1月1日00:00",
      dayStem: "壬", // 日柱天干（日主）
      yearBranch: "戌", // 年柱地支 
      monthBranch: "子", // 月柱地支
      dayBranch: "辰", // 日柱地支
      hourBranch: "子",  // 時柱地支
      expected: {
        year: "正官", // 年柱地支の十神関係
        month: "比肩", // 月柱地支の十神関係
        day: "正官",   // 日柱地支の十神関係
        hour: "比肩"    // 時柱地支の十神関係
      }
    },
    // 2015年1月1日 00:00 男性 ソウル
    {
      description: "2015年1月1日00:00",
      dayStem: "丁", // 日柱天干（日主）
      yearBranch: "午", // 年柱地支
      monthBranch: "子", // 月柱地支
      dayBranch: "丑", // 日柱地支
      hourBranch: "子",  // 時柱地支
      expected: {
        year: "比肩", // 年柱地支の十神関係
        month: "偏官", // 月柱地支の十神関係
        day: "食神",   // 日柱地支の十神関係
        hour: "偏官"    // 時柱地支の十神関係
      }
    }
  ];
  
  for (const test of testCases) {
    console.log(`\n🔍 ${test.description} のテスト`);
    
    try {
      const result = calculateFourPillarsBranchTenGods(
        test.dayStem,
        test.yearBranch,
        test.monthBranch,
        test.dayBranch,
        test.hourBranch
      );
      
      // 結果表示
      console.log('計算結果:');
      console.log(`年柱地支(${test.yearBranch}): ${result.year.mainTenGod}`);
      console.log(`月柱地支(${test.monthBranch}): ${result.month.mainTenGod}`);
      console.log(`日柱地支(${test.dayBranch}): ${result.day.mainTenGod}`);
      console.log(`時柱地支(${test.hourBranch}): ${result.hour.mainTenGod}`);
      
      // 期待値と比較
      let matches = 0;
      let total = 4;
      
      if (result.year.mainTenGod === test.expected.year) matches++;
      else console.log(`  ✗ 年柱地支: 期待=${test.expected.year}, 実際=${result.year.mainTenGod}`);
      
      if (result.month.mainTenGod === test.expected.month) matches++;
      else console.log(`  ✗ 月柱地支: 期待=${test.expected.month}, 実際=${result.month.mainTenGod}`);
      
      if (result.day.mainTenGod === test.expected.day) matches++;
      else console.log(`  ✗ 日柱地支: 期待=${test.expected.day}, 実際=${result.day.mainTenGod}`);
      
      if (result.hour.mainTenGod === test.expected.hour) matches++;
      else console.log(`  ✗ 時柱地支: 期待=${test.expected.hour}, 実際=${result.hour.mainTenGod}`);
      
      console.log(`結果: ${matches}/${total} 一致`);
    } catch (error) {
      console.error(`エラー ${test.description}: ${error}`);
    }
  }
}

/**
 * 既存の計算関数との比較テスト
 */
function testAgainstExistingCalculator() {
  console.log('\n==== 既存の計算関数との比較テスト ====');
  
  // 天干と地支の全組み合わせをテスト
  const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  
  let matches = 0;
  let mismatches = 0;
  
  for (const dayStem of stems) {
    for (const branch of branches) {
      try {
        // 新実装
        const newResult = determineBranchTenGodRelation(dayStem, branch);
        
        // 既存実装
        const existingResult = tenGodCalculator.determineBranchTenGodRelation(dayStem, branch);
        
        // 結果比較
        if (newResult.mainTenGod === existingResult) {
          matches++;
        } else {
          mismatches++;
          console.log(`差異 ${dayStem}×${branch}: 新=${newResult.mainTenGod}, 既存=${existingResult}`);
        }
      } catch (error) {
        console.error(`エラー ${dayStem}×${branch}: ${error}`);
      }
    }
  }
  
  console.log(`一致: ${matches}, 不一致: ${mismatches}, 合計: ${stems.length * branches.length}`);
}

// テスト実行
console.log('地支の十神関係計算テスト開始\n');

// 個別の天干x地支テスト
testBranchTenGodRelation();

// 四柱の天干x地支テスト
testFourPillarsTenGods();

// 既存実装との比較テスト
testAgainstExistingCalculator();

console.log('\n地支の十神関係計算テスト終了');