/**
 * 地支の十神関係計算モジュール
 * 個別地支ごとの十神関係を計算する関数の実装
 */

import {
  stems, 
  branches, 
  stemElements, 
  stemYinYang, 
  branchElements, 
  branchYinYang,
  hiddenStems,
  determineTenGodRelation
} from './tenGodBasicData';

/**
 * 子（ねずみ）の十神関係計算
 * 子の五行は水、蔵干は癸
 */
export function determineRatBranchTenGod(dayStem: string): string {
  const dayStemElement = stemElements[dayStem];
  const branchElement = '水'; // 子の五行は水
  const dayStemYin = stemYinYang[dayStem] === 'yin';
  const branchYin = false; // 子は陽
  
  return determineTenGodRelation(dayStemElement, branchElement, dayStemYin, branchYin);
}

/**
 * 丑（牛）の十神関係計算
 * 丑の五行は土、蔵干は己辛癸
 */
export function determineOxBranchTenGod(dayStem: string): string {
  const dayStemElement = stemElements[dayStem];
  const branchElement = '土'; // 丑の五行は土
  const dayStemYin = stemYinYang[dayStem] === 'yin';
  const branchYin = true; // 丑は陰
  
  return determineTenGodRelation(dayStemElement, branchElement, dayStemYin, branchYin);
}

/**
 * 寅（虎）の十神関係計算
 * 寅の五行は木、蔵干は甲丙戊
 */
export function determineTigerBranchTenGod(dayStem: string): string {
  const dayStemElement = stemElements[dayStem];
  const branchElement = '木'; // 寅の五行は木
  const dayStemYin = stemYinYang[dayStem] === 'yin';
  const branchYin = false; // 寅は陽
  
  return determineTenGodRelation(dayStemElement, branchElement, dayStemYin, branchYin);
}

/**
 * 卯（兎）の十神関係計算
 * 卯の五行は木、蔵干は乙
 */
export function determineRabbitBranchTenGod(dayStem: string): string {
  const dayStemElement = stemElements[dayStem];
  const branchElement = '木'; // 卯の五行は木
  const dayStemYin = stemYinYang[dayStem] === 'yin';
  const branchYin = true; // 卯は陰
  
  return determineTenGodRelation(dayStemElement, branchElement, dayStemYin, branchYin);
}

/**
 * 辰（龍）の十神関係計算
 * 辰の五行は土、蔵干は戊乙癸
 */
export function determineDragonBranchTenGod(dayStem: string): string {
  const dayStemElement = stemElements[dayStem];
  const branchElement = '土'; // 辰の五行は土
  const dayStemYin = stemYinYang[dayStem] === 'yin';
  const branchYin = false; // 辰は陽
  
  return determineTenGodRelation(dayStemElement, branchElement, dayStemYin, branchYin);
}

/**
 * 巳（蛇）の十神関係計算
 * 巳の五行は火、蔵干は丙庚戊
 */
export function determineSnakeBranchTenGod(dayStem: string): string {
  const dayStemElement = stemElements[dayStem];
  const branchElement = '火'; // 巳の五行は火
  const dayStemYin = stemYinYang[dayStem] === 'yin';
  const branchYin = true; // 巳は陰
  
  return determineTenGodRelation(dayStemElement, branchElement, dayStemYin, branchYin);
}

/**
 * 午（馬）の十神関係計算
 * 午の五行は火、蔵干は丁己丙
 */
export function determineHorseBranchTenGod(dayStem: string): string {
  const dayStemElement = stemElements[dayStem];
  const branchElement = '火'; // 午の五行は火
  const dayStemYin = stemYinYang[dayStem] === 'yin';
  const branchYin = false; // 午は陽
  
  return determineTenGodRelation(dayStemElement, branchElement, dayStemYin, branchYin);
}

/**
 * 未（羊）の十神関係計算
 * 未の五行は土、蔵干は己乙丁
 */
export function determineGoatBranchTenGod(dayStem: string): string {
  const dayStemElement = stemElements[dayStem];
  const branchElement = '土'; // 未の五行は土
  const dayStemYin = stemYinYang[dayStem] === 'yin';
  const branchYin = true; // 未は陰
  
  return determineTenGodRelation(dayStemElement, branchElement, dayStemYin, branchYin);
}

/**
 * 申（猿）の十神関係計算
 * 申の五行は金、蔵干は庚壬戊
 */
export function determineMonkeyBranchTenGod(dayStem: string): string {
  const dayStemElement = stemElements[dayStem];
  const branchElement = '金'; // 申の五行は金
  const dayStemYin = stemYinYang[dayStem] === 'yin';
  const branchYin = false; // 申は陽
  
  return determineTenGodRelation(dayStemElement, branchElement, dayStemYin, branchYin);
}

/**
 * 酉（鶏）の十神関係計算
 * 酉の五行は金、蔵干は辛
 */
export function determineRoosterBranchTenGod(dayStem: string): string {
  const dayStemElement = stemElements[dayStem];
  const branchElement = '金'; // 酉の五行は金
  const dayStemYin = stemYinYang[dayStem] === 'yin';
  const branchYin = true; // 酉は陰
  
  return determineTenGodRelation(dayStemElement, branchElement, dayStemYin, branchYin);
}

/**
 * 戌（犬）の十神関係計算
 * 戌の五行は土、蔵干は戊丁辛
 */
export function determineDogBranchTenGod(dayStem: string): string {
  const dayStemElement = stemElements[dayStem];
  const branchElement = '土'; // 戌の五行は土
  const dayStemYin = stemYinYang[dayStem] === 'yin';
  const branchYin = false; // 戌は陽
  
  return determineTenGodRelation(dayStemElement, branchElement, dayStemYin, branchYin);
}

/**
 * 亥（猪）の十神関係計算
 * 亥の五行は水、蔵干は壬甲戊
 */
export function determinePigBranchTenGod(dayStem: string): string {
  const dayStemElement = stemElements[dayStem];
  const branchElement = '水'; // 亥の五行は水
  const dayStemYin = stemYinYang[dayStem] === 'yin';
  const branchYin = true; // 亥は陰
  
  return determineTenGodRelation(dayStemElement, branchElement, dayStemYin, branchYin);
}

/**
 * 地支と十神関係の配列
 * インデックスを使って地支の順番に対応する関数を取得するための配列
 */
const branchTenGodFunctions = [
  determineRatBranchTenGod,      // 子
  determineOxBranchTenGod,       // 丑
  determineTigerBranchTenGod,    // 寅
  determineRabbitBranchTenGod,   // 卯
  determineDragonBranchTenGod,   // 辰
  determineSnakeBranchTenGod,    // 巳
  determineHorseBranchTenGod,    // 午
  determineGoatBranchTenGod,     // 未
  determineMonkeyBranchTenGod,   // 申
  determineRoosterBranchTenGod,  // 酉
  determineDogBranchTenGod,      // 戌
  determinePigBranchTenGod       // 亥
];

/**
 * 地支のインデックスを取得
 */
function getBranchIndex(branch: string): number {
  return branches.indexOf(branch);
}

/**
 * 地支に対応する十神関係計算関数を取得
 */
export function getBranchTenGodFunction(branch: string): (dayStem: string) => string {
  const index = getBranchIndex(branch);
  if (index === -1) {
    throw new Error(`Invalid branch: ${branch}`);
  }
  return branchTenGodFunctions[index];
}