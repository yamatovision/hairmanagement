/**
 * 十神関係計算のデバッグ・検証用テストスクリプト
 */
import * as elementalTenGodCalculator from '../../utils/saju/refactored/elementalTenGodCalculator';
import * as stemBranchTenGodRelation from '../../utils/saju/refactored/stemBranchTenGodRelation';
import { stems, branches } from '../../utils/saju/refactored/tenGodBasicData';

// 特定のパターンをテスト
function testSpecificCases() {
  console.log('===== 特定パターンのテスト =====');

  // 問題のあるケース
  const problemCases = [
    { dayStem: '乙', branch: '丑', description: 'テストケース1' },
    { dayStem: '丙', branch: '寅', description: 'テストケース2' },
    { dayStem: '甲', branch: '丑', description: 'テストケース3' },
  ];

  problemCases.forEach(({ dayStem, branch, description }) => {
    console.log(`\n【${description}】${dayStem}×${branch}`);
    
    // elementalTenGodCalculator での計算
    const elementalResult = elementalTenGodCalculator.calculateTenGodRelation(dayStem, branch, true);
    console.log(`elementalTenGodCalculator 結果: ${elementalResult}`);
    
    // stemBranchTenGodRelation での計算
    const stemBranchResult = stemBranchTenGodRelation.determineBranchTenGodRelation(dayStem, branch);
    console.log(`stemBranchTenGodRelation 結果: ${stemBranchResult}`);
    
    // 隠れた天干も取得
    const hiddenResult = elementalTenGodCalculator.determineTenGodWithHiddenStems(dayStem, branch);
    console.log(`hiddenStems 結果: ${JSON.stringify(hiddenResult)}`);
  });
}

// すべての天干と地支の組み合わせをテスト
function testAllCombinations() {
  console.log('\n===== すべての組み合わせのテスト =====');
  
  // 不一致のケースを収集
  const mismatches: {dayStem: string, branch: string, elemental: string, stemBranch: string}[] = [];
  
  stems.forEach(stem => {
    branches.forEach(branch => {
      const elementalResult = elementalTenGodCalculator.calculateTenGodRelation(stem, branch, true);
      const stemBranchResult = stemBranchTenGodRelation.determineBranchTenGodRelation(stem, branch);
      
      if (elementalResult !== stemBranchResult) {
        mismatches.push({
          dayStem: stem,
          branch,
          elemental: elementalResult,
          stemBranch: stemBranchResult
        });
      }
    });
  });
  
  if (mismatches.length > 0) {
    console.log(`不一致パターン: ${mismatches.length}件`);
    mismatches.forEach(mismatch => {
      console.log(`- ${mismatch.dayStem}×${mismatch.branch}: elemental=${mismatch.elemental}, stemBranch=${mismatch.stemBranch}`);
    });
  } else {
    console.log('すべてのパターンで一致しています');
  }
}

// メイン実行
function main() {
  testSpecificCases();
  testAllCombinations();
}

// スクリプト直接実行時に実行
if (require.main === module) {
  main();
}

export { testSpecificCases, testAllCombinations };