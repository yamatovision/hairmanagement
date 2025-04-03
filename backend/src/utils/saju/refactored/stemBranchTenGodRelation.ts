/**
 * 地支と日主の組み合わせによる十神関係計算
 * 天干（日主）と地支の組み合わせから十神関係を計算する統合インターフェース
 */

import { 
  getDayStemTenGodFunction,
  buildTenGodMatrix 
} from './dayStemBranchMatrix';

import {
  stems,
  branches
} from './tenGodBasicData';

import {
  getBranchTenGodFunction
} from './branchTenGodCalculator';

/**
 * 天干（日主）と地支の組み合わせから十神関係を計算
 * 
 * このメソッドは2つのアプローチを提供します:
 * 1. 行列方式: 事前に構築された参照テーブルを使用した高速計算
 * 2. 関数方式: 個別の計算関数を使用した柔軟な計算
 * 
 * @param dayStem 日主となる天干
 * @param branch 対象となる地支
 * @param useMatrix 行列方式を使用するかどうか（デフォルトtrue）
 * @returns 十神関係を表す文字列
 */
export function determineStemBranchTenGod(
  dayStem: string, 
  branch: string, 
  useMatrix: boolean = true
): string {
  // パラメータの検証
  if (!stems.includes(dayStem)) {
    throw new Error(`Invalid day stem: ${dayStem}`);
  }
  
  if (!branches.includes(branch)) {
    throw new Error(`Invalid branch: ${branch}`);
  }
  
  // アプローチ1: 行列方式（デフォルト）
  if (useMatrix) {
    return getTenGodFromMatrix(dayStem, branch);
  }
  
  // アプローチ2: 関数方式
  // 天干（日主）に基づく関数を使用
  const dayStemFunction = getDayStemTenGodFunction(dayStem);
  return dayStemFunction(branch);
}

// 天干×地支の十神関係行列（遅延初期化）
let tenGodMatrix: string[][] | null = null;

/**
 * 行列から十神関係を取得
 */
function getTenGodFromMatrix(dayStem: string, branch: string): string {
  // 行列が未初期化の場合は構築
  if (tenGodMatrix === null) {
    tenGodMatrix = buildTenGodMatrix();
  }
  
  const stemIndex = stems.indexOf(dayStem);
  const branchIndex = branches.indexOf(branch);
  
  return tenGodMatrix[stemIndex][branchIndex];
}

/**
 * 蔵干（隠れた天干）を考慮した十神関係の計算
 * このバージョンはベーシックな実装のため、地支の主要な五行属性のみを考慮
 * 
 * @param dayStem 日主となる天干
 * @param branch 対象となる地支
 * @returns 十神関係を表す文字列
 */
export function determineBranchTenGod(dayStem: string, branch: string): string {
  // 基本的な地支の十神関係を取得
  const branchFunction = getBranchTenGodFunction(branch);
  return branchFunction(dayStem);
}

/**
 * 実際に使用する統合関数
 * この関数は複数のアプローチを統合し、最終的な十神関係を決定
 * 
 * @param dayStem 日主となる天干
 * @param branch 対象となる地支
 * @returns 十神関係を表す文字列
 */
export function determineBranchTenGodRelation(dayStem: string, branch: string): string {
  // デバッグログの追加
  console.log(`地支十神計算: ${dayStem} × ${branch}`);
  
  // 今回の実装では、行列方式を使用
  // この関数は将来的に、蔵干を考慮した計算や他のロジックを統合するための拡張ポイント
  const result = determineStemBranchTenGod(dayStem, branch, true);
  
  return result;
}