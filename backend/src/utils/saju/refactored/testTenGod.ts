/**
 * 十神関係計算の検証ツール
 * 異なる計算方法による結果を比較する
 */

import {
  determineBranchTenGodRelation as determineBranchTenGodRelationOriginal,
  getElementFromStem,
  getElementFromBranch
} from './tenGodCalculator';

import {
  determineBranchTenGodRelation
} from './tenGodIntegration';

import {
  calculateTenGodRelation
} from './elementalTenGodCalculator';

import {
  stems,
  branches
} from './tenGodBasicData';

/**
 * 計算方法による差異を検証
 * @param verbose 詳細出力するかどうか
 */
export function testTenGodCalculation(verbose = false): void {
  console.log('========== 十神計算検証ツール ==========');
  console.log('異なる計算方法による結果の比較:');
  
  let totalCases = 0;
  let mismatchCases = 0;
  const mismatchDetails: { stem: string, branch: string, matrix: string, elemental: string }[] = [];
  
  // すべての天干と地支の組み合わせをテスト
  stems.forEach(stem => {
    branches.forEach(branch => {
      totalCases++;
      
      // 行列方式
      const matrixResult = determineBranchTenGodRelationOriginal(stem, branch);
      
      // 五行法則方式
      const elementalResult = calculateTenGodRelation(stem, branch, true);
      
      // 詳細な情報を表示
      if (verbose) {
        console.log(`天干: ${stem}(${getElementFromStem(stem)}), 地支: ${branch}(${getElementFromBranch(branch)})`);
        console.log(`  行列方式: ${matrixResult}`);
        console.log(`  五行法則: ${elementalResult}`);
        
        if (matrixResult !== elementalResult) {
          console.log(`  不一致: 行列=${matrixResult}, 五行法則=${elementalResult}`);
        }
        console.log('-----');
      }
      
      // 不一致をカウント
      if (matrixResult !== elementalResult) {
        mismatchCases++;
        mismatchDetails.push({
          stem,
          branch,
          matrix: matrixResult,
          elemental: elementalResult
        });
      }
    });
  });
  
  // 結果サマリー
  console.log('\n========== 検証結果サマリー ==========');
  console.log(`総テストケース数: ${totalCases}`);
  console.log(`一致: ${totalCases - mismatchCases} 件 (${Math.round((totalCases - mismatchCases) / totalCases * 100)}%)`);
  console.log(`不一致: ${mismatchCases} 件 (${Math.round(mismatchCases / totalCases * 100)}%)`);
  
  // 不一致の詳細を表示
  if (mismatchCases > 0) {
    console.log('\n========== 不一致の詳細 ==========');
    console.log('天干\t地支\t行列方式\t五行法則');
    mismatchDetails.forEach(detail => {
      console.log(`${detail.stem}\t${detail.branch}\t${detail.matrix}\t${detail.elemental}`);
    });
  }
}

/**
 * 特定の組み合わせを検証
 * @param dayStem 日主
 * @param branch 地支
 */
export function testSpecificCombination(dayStem: string, branch: string): void {
  console.log(`========== ${dayStem}×${branch}の計算検証 ==========`);
  
  // 行列方式
  const matrixResult = determineBranchTenGodRelationOriginal(dayStem, branch);
  
  // 五行法則方式
  const elementalResult = calculateTenGodRelation(dayStem, branch, true);
  
  // 統合方式
  const integratedResult = determineBranchTenGodRelation(dayStem, branch);
  
  // 詳細情報
  console.log(`天干: ${dayStem}(${getElementFromStem(dayStem)}), 地支: ${branch}(${getElementFromBranch(branch)})`);
  console.log(`行列方式結果: ${matrixResult}`);
  console.log(`五行法則結果: ${elementalResult}`);
  console.log(`統合結果: ${integratedResult.mainTenGod}`);
  console.log(`蔵干の詳細: ${JSON.stringify(integratedResult.hiddenTenGods, null, 2)}`);
}

// メイン検証関数
export default function runTests(): void {
  console.log('十神関係計算の検証を開始します');
  testTenGodCalculation(true);
  
  // 特定の問題ケースもテスト
  testSpecificCombination('丙', '卯'); // 検証に失敗した例
  testSpecificCombination('甲', '午'); // 検証に失敗した例
  testSpecificCombination('庚', '寅'); // 五行属性での比較が異なる例
  
  console.log('検証完了');
}

// 直接実行された場合はテストを実行
if (require.main === module) {
  runTests();
}