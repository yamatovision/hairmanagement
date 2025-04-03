/**
 * 日主（天干）ごとの地支との十神関係行列
 * 各天干を日主とした場合の地支との十神関係を事前に計算して格納
 */

import { stems, branches } from './tenGodBasicData';

/**
 * 甲（きのえ）を日主とした地支十神関係表
 */
export function determineGanATenGodRelation(branch: string): string {
  switch(branch) {
    case '子': return '偏印';   // 水は木を生じる→偏印
    case '丑': return '正財';   // 土（陰）は木が克する→正財
    case '寅': return '比肩';   // 木（陽）は木と同じ→比肩
    case '卯': return '劫財';   // 木（陰）は木と同じ→劫財
    case '辰': return '偏財';   // 土（陽）は木が克する→偏財
    case '巳': return '食神';   // 火（陰）は木が生じる→食神
    case '午': return '傷官';   // 火（陽）は木が生じる→傷官
    case '未': return '正財';   // 土（陰）は木が克する→正財
    case '申': return '正官';   // 金（陽）は木を克する→正官
    case '酉': return '偏官';   // 金（陰）は木を克する→偏官
    case '戌': return '偏財';   // 土（陽）は木が克する→偏財
    case '亥': return '正印';   // 水（陰）は木を生じる→正印
    default: return '未知';
  }
}

/**
 * 乙（きのと）を日主とした地支十神関係表
 */
export function determineGanBTenGodRelation(branch: string): string {
  switch(branch) {
    case '子': return '正印';   // 水（陽）は木を生じる→正印
    case '丑': return '偏財';   // 土（陰）は木が克する→偏財
    case '寅': return '劫財';   // 木（陽）は木と同じ→劫財
    case '卯': return '比肩';   // 木（陰）は木と同じ→比肩
    case '辰': return '正財';   // 土（陽）は木が克する→正財
    case '巳': return '傷官';   // 火（陰）は木が生じる→傷官
    case '午': return '食神';   // 火（陽）は木が生じる→食神
    case '未': return '偏財';   // 土（陰）は木が克する→偏財
    case '申': return '偏官';   // 金（陽）は木を克する→偏官
    case '酉': return '正官';   // 金（陰）は木を克する→正官
    case '戌': return '正財';   // 土（陽）は木が克する→正財
    case '亥': return '偏印';   // 水（陰）は木を生じる→偏印
    default: return '未知';
  }
}

/**
 * 丙（ひのえ）を日主とした地支十神関係表
 */
export function determineGanCTenGodRelation(branch: string): string {
  switch(branch) {
    case '子': return '傷官';   // 水（陽）は火を克する→傷官
    case '丑': return '偏印';   // 土（陰）は火を生じる→偏印
    case '寅': return '偏財';   // 木（陽）は火が克する→偏財
    case '卯': return '正財';   // 木（陰）は火が克する→正財
    case '辰': return '正印';   // 土（陽）は火を生じる→正印
    case '巳': return '比肩';   // 火（陰）は火と同じ→比肩
    case '午': return '劫財';   // 火（陽）は火と同じ→劫財
    case '未': return '偏印';   // 土（陰）は火を生じる→偏印
    case '申': return '食神';   // 金（陽）は火が生じる→食神
    case '酉': return '傷官';   // 金（陰）は火が生じる→傷官
    case '戌': return '正印';   // 土（陽）は火を生じる→正印
    case '亥': return '正官';   // 水（陰）は火を克する→正官
    default: return '未知';
  }
}

/**
 * 丁（ひのと）を日主とした地支十神関係表
 */
export function determineGanDTenGodRelation(branch: string): string {
  switch(branch) {
    case '子': return '食神';   // 水（陽）は火を克する→食神
    case '丑': return '正印';   // 土（陰）は火を生じる→正印
    case '寅': return '正財';   // 木（陽）は火が克する→正財
    case '卯': return '偏財';   // 木（陰）は火が克する→偏財
    case '辰': return '偏印';   // 土（陽）は火を生じる→偏印
    case '巳': return '劫財';   // 火（陰）は火と同じ→劫財
    case '午': return '比肩';   // 火（陽）は火と同じ→比肩
    case '未': return '正印';   // 土（陰）は火を生じる→正印
    case '申': return '傷官';   // 金（陽）は火が生じる→傷官
    case '酉': return '食神';   // 金（陰）は火が生じる→食神
    case '戌': return '偏印';   // 土（陽）は火を生じる→偏印
    case '亥': return '偏官';   // 水（陰）は火を克する→偏官
    default: return '未知';
  }
}

/**
 * 戊（つちのえ）を日主とした地支十神関係表
 */
export function determineGanETenGodRelation(branch: string): string {
  switch(branch) {
    case '子': return '正官';   // 水（陽）は土を克する→正官
    case '丑': return '比肩';   // 土（陰）は土と同じ→比肩
    case '寅': return '偏官';   // 木（陽）は土を克する→偏官
    case '卯': return '偏印';   // 木（陰）は土を克する→偏印
    case '辰': return '劫財';   // 土（陽）は土と同じ→劫財
    case '巳': return '食神';   // 火（陰）は土が生じる→食神
    case '午': return '傷官';   // 火（陽）は土が生じる→傷官
    case '未': return '比肩';   // 土（陰）は土と同じ→比肩
    case '申': return '偏財';   // 金（陽）は土が克する→偏財
    case '酉': return '正財';   // 金（陰）は土が克する→正財
    case '戌': return '劫財';   // 土（陽）は土と同じ→劫財
    case '亥': return '偏官';   // 水（陰）は土を克する→偏官
    default: return '未知';
  }
}

/**
 * 己（つちのと）を日主とした地支十神関係表
 */
export function determineGanFTenGodRelation(branch: string): string {
  switch(branch) {
    case '子': return '偏官';   // 水（陽）は土を克する→偏官
    case '丑': return '劫財';   // 土（陰）は土と同じ→劫財
    case '寅': return '正官';   // 木（陽）は土を克する→正官
    case '卯': return '正印';   // 木（陰）は土を克する→正印
    case '辰': return '比肩';   // 土（陽）は土と同じ→比肩
    case '巳': return '傷官';   // 火（陰）は土が生じる→傷官
    case '午': return '食神';   // 火（陽）は土が生じる→食神
    case '未': return '劫財';   // 土（陰）は土と同じ→劫財
    case '申': return '正財';   // 金（陽）は土が克する→正財
    case '酉': return '偏財';   // 金（陰）は土が克する→偏財
    case '戌': return '比肩';   // 土（陽）は土と同じ→比肩
    case '亥': return '正官';   // 水（陰）は土を克する→正官
    default: return '未知';
  }
}

/**
 * 庚（かのえ）を日主とした地支十神関係表
 */
export function determineGanGTenGodRelation(branch: string): string {
  switch(branch) {
    case '子': return '偏財';   // 水（陽）は金が克する→偏財
    case '丑': return '正官';   // 土（陰）は金を克する→正官
    case '寅': return '正印';   // 木（陽）は金を生じる→正印
    case '卯': return '偏印';   // 木（陰）は金を生じる→偏印
    case '辰': return '偏官';   // 土（陽）は金を克する→偏官
    case '巳': return '偏印';   // 火（陰）は金を克する→偏印
    case '午': return '正印';   // 火（陽）は金を克する→正印
    case '未': return '正官';   // 土（陰）は金を克する→正官
    case '申': return '比肩';   // 金（陽）は金と同じ→比肩
    case '酉': return '劫財';   // 金（陰）は金と同じ→劫財
    case '戌': return '偏官';   // 土（陽）は金を克する→偏官
    case '亥': return '正財';   // 水（陰）は金が克する→正財
    default: return '未知';
  }
}

/**
 * 辛（かのと）を日主とした地支十神関係表
 */
export function determineGanHTenGodRelation(branch: string): string {
  switch(branch) {
    case '子': return '正財';   // 水（陽）は金が克する→正財
    case '丑': return '偏官';   // 土（陰）は金を克する→偏官
    case '寅': return '偏印';   // 木（陽）は金を生じる→偏印
    case '卯': return '正印';   // 木（陰）は金を生じる→正印
    case '辰': return '正官';   // 土（陽）は金を克する→正官
    case '巳': return '正印';   // 火（陰）は金を克する→正印
    case '午': return '偏印';   // 火（陽）は金を克する→偏印
    case '未': return '偏官';   // 土（陰）は金を克する→偏官
    case '申': return '劫財';   // 金（陽）は金と同じ→劫財
    case '酉': return '比肩';   // 金（陰）は金と同じ→比肩
    case '戌': return '正官';   // 土（陽）は金を克する→正官
    case '亥': return '偏財';   // 水（陰）は金が克する→偏財
    default: return '未知';
  }
}

/**
 * 壬（みずのえ）を日主とした地支十神関係表
 */
export function determineGanITenGodRelation(branch: string): string {
  switch(branch) {
    case '子': return '比肩';   // 水（陽）は水と同じ→比肩
    case '丑': return '偏官';   // 土（陰）は水を克する→偏官
    case '寅': return '食神';   // 木（陽）は水が生じる→食神
    case '卯': return '傷官';   // 木（陰）は水が生じる→傷官
    case '辰': return '正官';   // 土（陽）は水を克する→正官
    case '巳': return '正財';   // 火（陰）は水が克する→正財
    case '午': return '偏財';   // 火（陽）は水が克する→偏財
    case '未': return '偏官';   // 土（陰）は水を克する→偏官
    case '申': return '偏印';   // 金（陽）は水を生じる→偏印
    case '酉': return '正印';   // 金（陰）は水を生じる→正印
    case '戌': return '正官';   // 土（陽）は水を克する→正官
    case '亥': return '劫財';   // 水（陰）は水と同じ→劫財
    default: return '未知';
  }
}

/**
 * 癸（みずのと）を日主とした地支十神関係表
 */
export function determineGanJTenGodRelation(branch: string): string {
  switch(branch) {
    case '子': return '劫財';   // 水（陽）は水と同じ→劫財
    case '丑': return '正官';   // 土（陰）は水を克する→正官
    case '寅': return '傷官';   // 木（陽）は水が生じる→傷官
    case '卯': return '食神';   // 木（陰）は水が生じる→食神
    case '辰': return '偏官';   // 土（陽）は水を克する→偏官
    case '巳': return '偏財';   // 火（陰）は水が克する→偏財
    case '午': return '正財';   // 火（陽）は水が克する→正財
    case '未': return '正官';   // 土（陰）は水を克する→正官
    case '申': return '正印';   // 金（陽）は水を生じる→正印
    case '酉': return '偏印';   // 金（陰）は水を生じる→偏印
    case '戌': return '偏官';   // 土（陽）は水を克する→偏官
    case '亥': return '比肩';   // 水（陰）は水と同じ→比肩
    default: return '未知';
  }
}

/**
 * 天干（日主）ごとの関数配列
 */
const dayStemFunctions = [
  determineGanATenGodRelation,  // 甲
  determineGanBTenGodRelation,  // 乙
  determineGanCTenGodRelation,  // 丙
  determineGanDTenGodRelation,  // 丁
  determineGanETenGodRelation,  // 戊
  determineGanFTenGodRelation,  // 己
  determineGanGTenGodRelation,  // 庚
  determineGanHTenGodRelation,  // 辛
  determineGanITenGodRelation,  // 壬
  determineGanJTenGodRelation   // 癸
];

/**
 * 天干（日主）のインデックスを取得
 */
function getDayStemIndex(dayStem: string): number {
  return stems.indexOf(dayStem);
}

/**
 * 日主（天干）に対応する地支十神関係計算関数を取得
 */
export function getDayStemTenGodFunction(dayStem: string): (branch: string) => string {
  const index = getDayStemIndex(dayStem);
  if (index === -1) {
    throw new Error(`Invalid day stem: ${dayStem}`);
  }
  return dayStemFunctions[index];
}

/**
 * 完全な天干×地支の十神関係行列を構築
 * 各天干と地支の組み合わせに対する十神関係を事前計算して二次元配列に格納
 */
export function buildTenGodMatrix(): string[][] {
  const matrix: string[][] = [];
  
  // 各天干について
  for (let i = 0; i < stems.length; i++) {
    const row: string[] = [];
    const dayStem = stems[i];
    const tenGodFunction = dayStemFunctions[i];
    
    // 各地支について十神関係を計算
    for (let j = 0; j < branches.length; j++) {
      const branch = branches[j];
      row.push(tenGodFunction(branch));
    }
    
    matrix.push(row);
  }
  
  return matrix;
}