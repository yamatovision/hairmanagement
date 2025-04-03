/**
 * 地支の十神関係計算の精度検証テスト
 * sample.mdとsample2.mdのデータに基づいて作成
 */

import { determineBranchTenGodRelation } from './tenGodIntegration';

interface TestCase {
  description: string;
  dayStem: string;
  branch: string;
  expected: string;
}

/**
 * サンプルデータから抽出したテストケース
 * sample.mdとsample2.mdの実際の計算例から作成
 */
const testCasesFromSamples: TestCase[] = [
  // 1970年(陽暦1月1日, 00:00, 男性, ソウル) - sample.md
  { description: "1970年 辛日 × 巳支", dayStem: "辛", branch: "巳", expected: "正官" },
  { description: "1970年 辛日 × 子支", dayStem: "辛", branch: "子", expected: "正財" },
  { description: "1970年 辛日 × 酉支", dayStem: "辛", branch: "酉", expected: "比肩" },
  
  // 1985年(陽暦1月1日, 00:00, 男性, ソウル) - sample.md
  { description: "1985年 庚日 × 子支", dayStem: "庚", branch: "子", expected: "傷官" },
  { description: "1985年 庚日 × 子支", dayStem: "庚", branch: "子", expected: "傷官" },
  
  // 1995年(陽暦1月1日, 00:00, 男性, ソウル) - sample.md
  { description: "1995年 壬日 × 子支", dayStem: "壬", branch: "子", expected: "劫財" },
  { description: "1995年 壬日 × 辰支", dayStem: "壬", branch: "辰", expected: "偏官" },
  { description: "1995年 壬日 × 戌支", dayStem: "壬", branch: "戌", expected: "偏官" },
  
  // 2005年(陽暦1月1日, 00:00, 男性, ソウル) - sample.md
  { description: "2005年 乙日 × 子支", dayStem: "乙", branch: "子", expected: "偏印" },
  { description: "2005年 乙日 × 酉支", dayStem: "乙", branch: "酉", expected: "偏官" },
  { description: "2005年 乙日 × 申支", dayStem: "乙", branch: "申", expected: "正官" },
  
  // 2015年(陽暦1月1日, 00:00, 男性, ソウル) - sample.md
  { description: "2015年 丁日 × 子支", dayStem: "丁", branch: "子", expected: "偏官" },
  { description: "2015年 丁日 × 丑支", dayStem: "丁", branch: "丑", expected: "食神" },
  { description: "2015年 丁日 × 午支", dayStem: "丁", branch: "午", expected: "比肩" },
  
  // 2023年2月3日(節分前, 00:00, 女性, ソウル) - sample.md
  { description: "2023年2月3日 壬日 × 子支", dayStem: "壬", branch: "子", expected: "劫財" },
  { description: "2023年2月3日 壬日 × 辰支", dayStem: "壬", branch: "辰", expected: "偏官" },
  { description: "2023年2月3日 壬日 × 丑支", dayStem: "壬", branch: "丑", expected: "正官" },
  { description: "2023年2月3日 壬日 × 寅支", dayStem: "壬", branch: "寅", expected: "食神" },
  
  // 2023年2月4日(立春, 00:00, 女性, ソウル) - sample.md
  { description: "2023年2月4日 癸日 × 子支", dayStem: "癸", branch: "子", expected: "比肩" },
  { description: "2023年2月4日 癸日 × 巳支", dayStem: "癸", branch: "巳", expected: "正財" },
  { description: "2023年2月4日 癸日 × 丑支", dayStem: "癸", branch: "丑", expected: "偏官" },
  { description: "2023年2月4日 癸日 × 寅支", dayStem: "癸", branch: "寅", expected: "傷官" },
  
  // 2023年10月1日(00:00, 女性, ソウル) - sample.md
  { description: "2023年10月1日 壬日 × 子支", dayStem: "壬", branch: "子", expected: "劫財" },
  { description: "2023年10月1日 壬日 × 辰支", dayStem: "壬", branch: "辰", expected: "偏官" },
  { description: "2023年10月1日 壬日 × 酉支", dayStem: "壬", branch: "酉", expected: "正印" },
  { description: "2023年10月1日 壬日 × 卯支", dayStem: "壬", branch: "卯", expected: "傷官" },
  
  // 2023年10月2日(00:00, 女性, ソウル) - sample.md
  { description: "2023年10月2日 癸日 × 子支", dayStem: "癸", branch: "子", expected: "比肩" },
  { description: "2023年10月2日 癸日 × 巳支", dayStem: "癸", branch: "巳", expected: "正財" },
  { description: "2023年10月2日 癸日 × 酉支", dayStem: "癸", branch: "酉", expected: "偏印" },
  { description: "2023年10月2日 癸日 × 卯支", dayStem: "癸", branch: "卯", expected: "食神" },
  
  // テスト結果で不一致が見られた組み合わせを重点的にテスト
  { description: "不一致テスト 丙 × 寅", dayStem: "丙", branch: "寅", expected: "偏財" },
  { description: "不一致テスト 丁 × 卯", dayStem: "丁", branch: "卯", expected: "偏財" },
  { description: "不一致テスト 戊 × 辰", dayStem: "戊", branch: "辰", expected: "劫財" },
  { description: "不一致テスト 己 × 巳", dayStem: "己", branch: "巳", expected: "傷官" },
  { description: "不一致テスト 庚 × 午", dayStem: "庚", branch: "午", expected: "正印" },
  { description: "不一致テスト 辛 × 未", dayStem: "辛", branch: "未", expected: "偏官" },
  { description: "不一致テスト 壬 × 戌", dayStem: "壬", branch: "戌", expected: "正官" },
  { description: "不一致テスト 壬 × 辰", dayStem: "壬", branch: "辰", expected: "正官" },
  { description: "不一致テスト 丁 × 午", dayStem: "丁", branch: "午", expected: "比肩" },
  { description: "不一致テスト 丁 × 子", dayStem: "丁", branch: "子", expected: "食神" },
  { description: "不一致テスト 丁 × 丑", dayStem: "丁", branch: "丑", expected: "正印" },
];

/**
 * 蔵干の十神関係を検証するテストケース
 */
const hiddenStemTestCases: TestCase[] = [
  // 子（癸）
  { description: "蔵干 甲日×子支(癸)", dayStem: "甲", branch: "子", expected: "正印" },
  // 丑（己辛癸）
  { description: "蔵干 甲日×丑支(己)", dayStem: "甲", branch: "丑", expected: "偏財" },
  { description: "蔵干 甲日×丑支(辛)", dayStem: "甲", branch: "丑", expected: "偏官" },
  { description: "蔵干 甲日×丑支(癸)", dayStem: "甲", branch: "丑", expected: "正印" },
  // 寅（甲丙戊）
  { description: "蔵干 乙日×寅支(甲)", dayStem: "乙", branch: "寅", expected: "劫財" },
  { description: "蔵干 乙日×寅支(丙)", dayStem: "乙", branch: "寅", expected: "傷官" },
  { description: "蔵干 乙日×寅支(戊)", dayStem: "乙", branch: "寅", expected: "正官" },
];

/**
 * 全天干と全地支の組み合わせをテスト
 */
function runAllCombinationsTest() {
  const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  
  console.log('\n========== 全天干と全地支の組み合わせテスト ==========');
  
  const results = {
    total: stems.length * branches.length,
    successful: 0,
    failed: 0,
    errors: 0
  };
  
  for (const stem of stems) {
    for (const branch of branches) {
      try {
        const result = determineBranchTenGodRelation(stem, branch);
        console.log(`${stem}×${branch} => ${result.mainTenGod}`);
        // 成功としてカウント（ここでは期待値の検証はしない）
        results.successful++;
        
        // 蔵干情報の表示（蔵干がある場合のみ）
        if (result.hiddenTenGods.length > 0) {
          console.log(`  蔵干: ${result.hiddenTenGods.map(h => `${h.stem}(${h.tenGod})`).join(', ')}`);
        }
      } catch (error) {
        console.error(`エラー ${stem}×${branch}: ${error}`);
        results.errors++;
      }
    }
  }
  
  console.log(`\n全組み合わせ実行結果: 成功=${results.successful}, 失敗=${results.failed}, エラー=${results.errors}, 合計=${results.total}`);
}

/**
 * サンプルデータからのテストケースを実行
 */
function runSampleTests() {
  console.log('\n========== サンプルデータに基づくテスト ==========');
  
  const results = {
    total: testCasesFromSamples.length,
    successful: 0,
    failed: 0,
    errors: 0
  };
  
  for (const test of testCasesFromSamples) {
    try {
      const result = determineBranchTenGodRelation(test.dayStem, test.branch);
      const isSuccess = result.mainTenGod === test.expected;
      
      if (isSuccess) {
        console.log(`✓ ${test.description}: ${test.dayStem}×${test.branch} => ${result.mainTenGod}`);
        results.successful++;
      } else {
        console.log(`✗ ${test.description}: ${test.dayStem}×${test.branch} => ${result.mainTenGod} (期待: ${test.expected})`);
        results.failed++;
      }
    } catch (error) {
      console.error(`エラー ${test.description}: ${error}`);
      results.errors++;
    }
  }
  
  console.log(`\nサンプルテスト実行結果: 成功=${results.successful}, 失敗=${results.failed}, エラー=${results.errors}, 合計=${results.total}`);
  console.log(`成功率: ${Math.round((results.successful / results.total) * 100)}%`);
}

/**
 * 蔵干の十神関係テストを実行
 */
function runHiddenStemTests() {
  console.log('\n========== 蔵干の十神関係テスト ==========');
  
  const results = {
    total: hiddenStemTestCases.length,
    successful: 0,
    failed: 0,
    errors: 0
  };
  
  for (const test of hiddenStemTestCases) {
    try {
      const result = determineBranchTenGodRelation(test.dayStem, test.branch);
      // テスト説明から蔵干を抽出 (例: "蔵干 甲日×丑支(己)" → "己")
      const targetHiddenStem = test.description.match(/\((.+)\)/)?.[1];
      
      if (!targetHiddenStem) {
        console.log(`? テスト説明から蔵干を特定できません: ${test.description}`);
        continue;
      }
      
      // 指定された蔵干の十神関係を検索
      const hiddenStemResult = result.hiddenTenGods.find(h => h.stem === targetHiddenStem);
      
      if (!hiddenStemResult) {
        console.log(`? 蔵干が見つかりません: ${test.dayStem}×${test.branch} に ${targetHiddenStem} なし`);
        results.failed++;
        continue;
      }
      
      const isSuccess = hiddenStemResult.tenGod === test.expected;
      
      if (isSuccess) {
        console.log(`✓ ${test.description}: ${test.dayStem}×${test.branch} の蔵干 ${targetHiddenStem} => ${hiddenStemResult.tenGod}`);
        results.successful++;
      } else {
        console.log(`✗ ${test.description}: ${test.dayStem}×${test.branch} の蔵干 ${targetHiddenStem} => ${hiddenStemResult.tenGod} (期待: ${test.expected})`);
        results.failed++;
      }
    } catch (error) {
      console.error(`エラー ${test.description}: ${error}`);
      results.errors++;
    }
  }
  
  console.log(`\n蔵干テスト実行結果: 成功=${results.successful}, 失敗=${results.failed}, エラー=${results.errors}, 合計=${results.total}`);
  console.log(`成功率: ${Math.round((results.successful / results.total) * 100)}%`);
}

/**
 * すべてのテストを実行
 */
function runAllTests() {
  console.log('地支の十神関係計算テスト開始\n');
  
  // 全組み合わせテスト
  runAllCombinationsTest();
  
  // サンプルデータからのテスト
  runSampleTests();
  
  // 蔵干のテスト
  runHiddenStemTests();
  
  console.log('\n地支の十神関係計算テスト終了');
}

// テスト実行
runAllTests();