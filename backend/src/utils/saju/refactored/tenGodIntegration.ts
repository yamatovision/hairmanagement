/**
 * 十神関係計算の統合モジュール
 * 様々なアプローチを統合して十神関係を計算
 */

import {
  determineStemBranchTenGod
} from './stemBranchTenGodRelation';

import {
  determineTenGodWithHiddenStems,
  calculateTenGodRelation
} from './elementalTenGodCalculator';

import {
  stems,
  branches,
  hiddenStems
} from './tenGodBasicData';

/**
 * 地支の十神関係を計算する統合関数
 * 複数のアプローチを組み合わせて、より信頼性の高い結果を提供
 * 
 * @param dayStem 日主となる天干
 * @param branch 対象となる地支
 * @returns 十神関係情報のオブジェクト
 */
export function determineBranchTenGodRelation(
  dayStem: string, 
  branch: string
): { 
  mainTenGod: string; 
  hiddenTenGods: { stem: string; tenGod: string }[]; 
  combined: string;
} {
  // パラメータ検証
  if (!stems.includes(dayStem)) {
    throw new Error(`無効な日主天干: ${dayStem}`);
  }
  
  if (!branches.includes(branch)) {
    throw new Error(`無効な地支: ${branch}`);
  }
  
  // デバッグログの追加
  console.log(`地支十神計算: ${dayStem} × ${branch}`);
  
  // 1. 行列方式による地支自体の十神関係
  const mainTenGod = determineStemBranchTenGod(dayStem, branch);
  
  // 2. 蔵干を考慮した十神関係
  const hiddenResult = determineTenGodWithHiddenStems(dayStem, branch);
  
  // 検証: 蔵干の結果と行列の結果が一致するか確認
  if (mainTenGod !== hiddenResult.mainTenGod) {
    console.warn(`警告: 十神計算結果の不一致 - ${dayStem}×${branch}: 行列=${mainTenGod}, 五行法則=${hiddenResult.mainTenGod}`);
  }
  
  return {
    mainTenGod: mainTenGod,
    hiddenTenGods: hiddenResult.hiddenTenGods,
    combined: mainTenGod // 将来的には、蔵干のウェイトを考慮した統合値に変更可能
  };
}

/**
 * 四柱の十神関係を計算
 * 年柱、月柱、日柱、時柱の地支に対する十神関係を一括計算
 * 
 * @param dayStem 日主天干
 * @param yearBranch 年柱の地支
 * @param monthBranch 月柱の地支
 * @param dayBranch 日柱の地支
 * @param hourBranch 時柱の地支
 * @returns 四柱の十神関係情報
 */
export function calculateFourPillarsBranchTenGods(
  dayStem: string,
  yearBranch: string,
  monthBranch: string,
  dayBranch: string,
  hourBranch: string
): { 
  year: { 
    mainTenGod: string; 
    hiddenTenGods: { stem: string; tenGod: string }[]; 
    combined: string;
  };
  month: { 
    mainTenGod: string; 
    hiddenTenGods: { stem: string; tenGod: string }[]; 
    combined: string;
  };
  day: { 
    mainTenGod: string; 
    hiddenTenGods: { stem: string; tenGod: string }[]; 
    combined: string;
  };
  hour: { 
    mainTenGod: string; 
    hiddenTenGods: { stem: string; tenGod: string }[]; 
    combined: string;
  };
} {
  return {
    year: determineBranchTenGodRelation(dayStem, yearBranch),
    month: determineBranchTenGodRelation(dayStem, monthBranch),
    day: determineBranchTenGodRelation(dayStem, dayBranch),
    hour: determineBranchTenGodRelation(dayStem, hourBranch)
  };
}

/**
 * 十神関係をテスト
 * サンプルデータに基づいて計算結果を検証
 * 
 * @param debug デバッグ出力を有効にするかどうか
 * @returns テスト結果の概要
 */
export function testTenGodCalculation(debug: boolean = false): string {
  const testCases = [
    // サンプルデータに基づくテストケース
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
  
  let passed = 0;
  let failed = 0;
  
  for (const { dayStem, branch, expected } of testCases) {
    const result = determineBranchTenGodRelation(dayStem, branch);
    
    if (result.mainTenGod === expected) {
      passed++;
      if (debug) {
        console.log(`[通過] ${dayStem}×${branch} => ${result.mainTenGod}`);
      }
    } else {
      failed++;
      console.error(`[失敗] ${dayStem}×${branch}: 期待=${expected}, 実際=${result.mainTenGod}`);
    }
  }
  
  const summary = `テスト結果: ${passed}通過, ${failed}失敗 (全${testCases.length}件)`;
  console.log(summary);
  
  return summary;
}