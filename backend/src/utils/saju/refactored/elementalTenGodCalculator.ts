/**
 * 五行法則に基づく汎用的な十神関係計算モジュール
 * 五行の相生・相剋関係と陰陽に基づいて十神関係を計算
 */

import {
  stems,
  branches,
  stemElements,
  stemYinYang,
  branchElements,
  branchYinYang,
  hiddenStems,
  generatesRelation,
  controlsRelation,
  generatedByRelation,
  controlledByRelation
} from './tenGodBasicData';

/**
 * 五行属性と陰陽に基づく汎用的な十神関係計算アルゴリズム
 * 
 * @param dayStemElement 日主の五行
 * @param targetElement 対象の五行
 * @param dayStemYin 日主が陰かどうか
 * @param targetYin 対象が陰かどうか
 * @returns 十神関係を表す文字列
 */
export function determineTenGodByElements(
  dayStemElement: string, 
  targetElement: string, 
  dayStemYin: boolean, 
  targetYin: boolean
): string {
  
  // パラメータの検証
  if (!dayStemElement || !targetElement ||
      !['木', '火', '土', '金', '水'].includes(dayStemElement) ||
      !['木', '火', '土', '金', '水'].includes(targetElement)) {
    throw new Error(`無効な五行要素: ${dayStemElement} または ${targetElement}`);
  }
  
  // 陰陽一致判定（同じ陰陽属性かどうか）
  const sameYinYang = dayStemYin === targetYin;
  
  // 1. 同じ五行の場合: 比肩または劫財
  if (dayStemElement === targetElement) {
    return sameYinYang ? '比肩' : '劫財';
  }
  
  // 2. 日主が生じる五行: 食神または傷官
  if (generatesRelation[dayStemElement] === targetElement) {
    return sameYinYang ? '食神' : '傷官';
  }
  
  // 3. 日主が克する五行: 偏財または正財
  if (controlsRelation[dayStemElement] === targetElement) {
    return sameYinYang ? '偏財' : '正財';
  }
  
  // 4. 日主を克する五行: 偏官または正官
  if (controlledByRelation[dayStemElement] === targetElement) {
    return sameYinYang ? '偏官' : '正官';
  }
  
  // 5. 日主を生じる五行: 偏印または正印
  if (generatedByRelation[dayStemElement] === targetElement) {
    return sameYinYang ? '偏印' : '正印';
  }
  
  // エラー状態（通常はここには到達しない）
  console.error(`未知の五行関係: ${dayStemElement} と ${targetElement}`);
  return '未知';
}

/**
 * 天干の五行属性と陰陽を取得
 * 
 * @param stem 天干
 * @returns 五行属性と陰陽のオブジェクト
 */
export function getStemProperties(stem: string): { element: string; isYin: boolean } {
  const element = stemElements[stem];
  const isYin = stemYinYang[stem] === 'yin';
  
  return { element, isYin };
}

/**
 * 地支の五行属性と陰陽を取得
 * 
 * @param branch 地支
 * @returns 五行属性と陰陽のオブジェクト
 */
export function getBranchProperties(branch: string): { element: string; isYin: boolean } {
  const element = branchElements[branch];
  const isYin = branchYinYang[branch] === 'yin';
  
  return { element, isYin };
}

/**
 * 天干と地支の十神関係を五行法則に基づいて計算
 * 
 * @param dayStem 日主となる天干
 * @param target 対象の天干または地支
 * @param isTargetBranch 対象が地支かどうか
 * @returns 十神関係を表す文字列
 */
export function calculateTenGodRelation(
  dayStem: string, 
  target: string, 
  isTargetBranch: boolean = false
): string {
  // パラメータの検証
  if (!dayStem || !target) {
    throw new Error(`無効なパラメータ: dayStem=${dayStem}, target=${target}`);
  }
  
  if (!stems.includes(dayStem)) {
    throw new Error(`無効な天干: ${dayStem}`);
  }
  
  if (isTargetBranch && !branches.includes(target)) {
    throw new Error(`無効な地支: ${target}`);
  } else if (!isTargetBranch && !stems.includes(target)) {
    throw new Error(`無効な天干: ${target}`);
  }
  
  // 日主の属性を取得
  const { element: dayStemElement, isYin: dayStemIsYin } = getStemProperties(dayStem);
  
  // 対象の属性を取得（天干または地支）
  let targetElement: string;
  let targetIsYin: boolean;
  
  if (isTargetBranch) {
    const props = getBranchProperties(target);
    targetElement = props.element;
    targetIsYin = props.isYin;
  } else {
    const props = getStemProperties(target);
    targetElement = props.element;
    targetIsYin = props.isYin;
  }
  
  // 五行法則に基づいて十神関係を計算
  return determineTenGodByElements(dayStemElement, targetElement, dayStemIsYin, targetIsYin);
}

/**
 * 地支の蔵干を考慮した十神関係計算
 * この実装では、地支の主要な五行と蔵干（隠れた天干）の両方を考慮
 * 
 * @param dayStem 日主となる天干
 * @param branch 対象となる地支
 * @returns 十神関係情報のオブジェクト
 */
export function determineTenGodWithHiddenStems(
  dayStem: string, 
  branch: string
): { 
  mainTenGod: string; 
  hiddenTenGods: { stem: string; tenGod: string }[] 
} {
  // パラメータの検証
  if (!dayStem || !branch) {
    throw new Error(`無効なパラメータ: dayStem=${dayStem}, branch=${branch}`);
  }

  if (!stems.includes(dayStem)) {
    throw new Error(`無効な天干: ${dayStem}`);
  }

  if (!branches.includes(branch)) {
    throw new Error(`無効な地支: ${branch}`);
  }
  
  // 基本の十神関係（地支の五行に基づく）
  const mainTenGod = calculateTenGodRelation(dayStem, branch, true);
  
  // 地支の蔵干（隠れた天干）
  const hidden = hiddenStems[branch] || [];
  
  // 蔵干ごとの十神関係を計算
  const hiddenTenGods = hidden.map(stem => ({
    stem,
    tenGod: calculateTenGodRelation(dayStem, stem, false)
  }));
  
  return {
    mainTenGod,
    hiddenTenGods
  };
}