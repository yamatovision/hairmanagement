/**
 * 改良された十神関係計算アルゴリズムのテスト
 * 新しいアルゴリズムのパフォーマンスと精度を検証
 */

import { printValidationResults, validateAlgorithm } from './tenGodImprovedAlgorithm';
import { determineBranchTenGodRelation as determineMappedRelation } from './tenGodFixedMapping';

/**
 * サンプルケースでのテスト
 */
function testSampleCases(): void {
  console.log('========== サンプルケース検証 ==========');
  
  const testCases = [
    { dayStem: '甲', branch: '子', expected: '偏印' },
    { dayStem: '甲', branch: '丑', expected: '正財' },
    { dayStem: '甲', branch: '寅', expected: '比肩' },
    { dayStem: '甲', branch: '卯', expected: '劫財' },
    { dayStem: '甲', branch: '巳', expected: '傷官' },
    { dayStem: '甲', branch: '午', expected: '食神' },
    { dayStem: '甲', branch: '申', expected: '偏官' },
    { dayStem: '甲', branch: '酉', expected: '正官' },
    { dayStem: '丁', branch: '子', expected: '偏官' },
    { dayStem: '丁', branch: '丑', expected: '食神' },
    { dayStem: '丁', branch: '午', expected: '劫財' },
  ];
  
  for (const { dayStem, branch, expected } of testCases) {
    const result = determineMappedRelation(dayStem, branch);
    console.log(`${dayStem}×${branch} => ${result.mainTenGod}`);
    console.assert(result.mainTenGod === expected, `期待=${expected}, 実際=${result.mainTenGod}`);
  }
}

/**
 * 完全検証
 * すべての天干と地支の組み合わせをテスト
 */
function runCompleteValidation(): void {
  const result = validateAlgorithm();
  
  console.log('\n========== 完全検証結果 ==========');
  console.log(`成功: ${result.success}/${result.total} (${result.successRate.toFixed(2)}%)`);
  console.log(`失敗: ${result.fail}/${result.total}`);
  
  // 不一致が特に多い組み合わせを表示
  if (result.discrepancies.length > 0) {
    // 問題の天干と地支の組み合わせを特定
    const problemDayStemCount: Record<string, number> = {};
    const problemBranchCount: Record<string, number> = {};
    
    result.discrepancies.forEach(({ dayStem, branch }) => {
      problemDayStemCount[dayStem] = (problemDayStemCount[dayStem] || 0) + 1;
      problemBranchCount[branch] = (problemBranchCount[branch] || 0) + 1;
    });
    
    // 問題の多い天干を表示
    console.log('\n問題の多い天干:');
    Object.entries(problemDayStemCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .forEach(([stem, count]) => {
        console.log(`  ${stem}: ${count}件の不一致`);
      });
    
    // 問題の多い地支を表示
    console.log('\n問題の多い地支:');
    Object.entries(problemBranchCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .forEach(([branch, count]) => {
        console.log(`  ${branch}: ${count}件の不一致`);
      });
  }
}

/**
 * メイン関数: すべてのテストを実行
 */
function main(): void {
  console.log('===== 改良十神関係アルゴリズム検証 =====');
  
  // サンプルケースのテスト
  testSampleCases();
  
  // 詳細な検証結果の出力
  printValidationResults();
  
  // 完全検証の実行
  runCompleteValidation();
  
  console.log('\n検証完了');
}

// テストの実行
main();