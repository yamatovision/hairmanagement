/**
 * 十神関係の計算を行うモジュール
 * 日主（日柱の天干）を基準に他の天干との関係を判定します
 * 
 * 変更履歴:
 * - 2025/03/31: 初期実装 (AppGenius)
 */

import { FourPillars } from './fourPillars';

// 十神の型定義
export type TenGodType = 
  | '比肩' | '劫財' 
  | '偏印' | '正印' 
  | '偏官' | '正官' 
  | '偏財' | '正財' 
  | '食神' | '傷官';

/**
 * 十神関係を判定する
 * @param dayStem - 日主（日柱の天干）
 * @param targetStem - 比較対象の天干
 * @returns 十神関係
 */
export function determineTenGodRelation(dayStem: string, targetStem: string): TenGodType {
  // 天干の五行属性
  const stemElements = {
    '甲': '木', '乙': '木',
    '丙': '火', '丁': '火',
    '戊': '土', '己': '土',
    '庚': '金', '辛': '金',
    '壬': '水', '癸': '水'
  };
  
  // 日主と対象の天干の陰陽
  const dayYin = ['乙', '丁', '己', '辛', '癸'].includes(dayStem);
  const targetYin = ['乙', '丁', '己', '辛', '癸'].includes(targetStem);
  
  // 日主と対象の五行属性
  const dayElement = stemElements[dayStem];
  const targetElement = stemElements[targetStem];
  
  // 十神判定
  if (dayElement === targetElement) {
    // 同じ五行
    return dayYin === targetYin ? '比肩' : '劫財';
  } else if (isGenerating(targetElement, dayElement)) {
    // 対象が日主を生む
    return dayYin === targetYin ? '偏印' : '正印';
  } else if (isControlling(targetElement, dayElement)) {
    // 対象が日主を克する
    return dayYin === targetYin ? '偏官' : '正官';
  } else if (isGenerating(dayElement, targetElement)) {
    // 日主が対象を生む
    return dayYin === targetYin ? '食神' : '傷官';
  } else if (isControlling(dayElement, targetElement)) {
    // 日主が対象を克する
    return dayYin === targetYin ? '偏財' : '正財';
  }
  
  // 該当なし（ここには来ないはず）
  return '比肩';
}

/**
 * 四柱の十神関係を計算する
 * @param fourPillars - 四柱
 * @returns 十神関係のマップ
 */
export function calculateTenGods(fourPillars: FourPillars): Record<string, TenGodType> {
  const dayStem = fourPillars.dayPillar.stem;
  
  // 各柱の天干に対する十神関係
  const tenGods = {
    year: determineTenGodRelation(dayStem, fourPillars.yearPillar.stem),
    month: determineTenGodRelation(dayStem, fourPillars.monthPillar.fullStemBranch.charAt(0)),
    hour: determineTenGodRelation(dayStem, fourPillars.hourPillar.stem)
  };
  
  return tenGods;
}

/**
 * 要素Aが要素Bを生む(相生)かどうかをチェック
 * @param elementA - 要素A
 * @param elementB - 要素B
 * @returns 相生関係ならtrue
 */
function isGenerating(elementA: string, elementB: string): boolean {
  const generatingMap = {
    '木': '火', // 木は火を生む
    '火': '土', // 火は土を生む
    '土': '金', // 土は金を生む
    '金': '水', // 金は水を生む
    '水': '木'  // 水は木を生む
  };
  
  return generatingMap[elementA] === elementB;
}

/**
 * 要素Aが要素Bを剋する(相剋)かどうかをチェック
 * @param elementA - 要素A
 * @param elementB - 要素B
 * @returns 相剋関係ならtrue
 */
function isControlling(elementA: string, elementB: string): boolean {
  const controllingMap = {
    '木': '土', // 木は土を剋する
    '土': '水', // 土は水を剋する
    '水': '火', // 水は火を剋する
    '火': '金', // 火は金を剋する
    '金': '木'  // 金は木を剋する
  };
  
  return controllingMap[elementA] === elementB;
}