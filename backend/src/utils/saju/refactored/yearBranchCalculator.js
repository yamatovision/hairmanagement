/**
 * 韓国式四柱推命 - 年柱の地支計算モジュール
 * calender.mdのサンプルデータを分析して抽出したアルゴリズム
 */

// 地支の配列
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

/**
 * 年支（地支）を計算する - 韓国式
 * @param {number} year 西暦年
 * @param {Object} options 計算オプション
 * @return {number} 地支のインデックス (0-11)
 */
function calculateYearBranchIndex(year, options = {}) {
  // 基準点の設定
  const referenceYear = options.referenceYear || 1984; // 1984年は甲子年
  const referenceBranchIndex = options.referenceBranchIndex || 0; // 子=0
  
  // 基準年からの差分を計算
  const yearDiff = year - referenceYear;
  
  // 地支は12周期で循環する
  // 正の剰余を確保するため、まず地支の数を足してから剰余を取る
  return (referenceBranchIndex + (yearDiff % 12 + 12) % 12) % 12;
}

/**
 * 年支（地支）を取得する - 韓国式
 * @param {number} year 西暦年
 * @param {Object} options 計算オプション
 * @returns {string} 地支文字
 */
function calculateYearBranch(year, options = {}) {
  const branchIndex = calculateYearBranchIndex(year, options);
  return BRANCHES[branchIndex];
}

/**
 * 地支から蔵干（隠れた天干）を取得
 * @param {string} branch 地支
 * @returns {string[]} 蔵干の配列
 */
function getHiddenStems(branch) {
  // 各地支に対応する蔵干のマッピング
  const hiddenStemsMap = {
    "子": ["癸"],
    "丑": ["己", "辛", "癸"],
    "寅": ["甲", "丙", "戊"],
    "卯": ["乙"],
    "辰": ["戊", "乙", "癸"],
    "巳": ["丙", "庚", "戊"],
    "午": ["丁", "己"],
    "未": ["己", "乙", "丁"],
    "申": ["庚", "壬", "戊"],
    "酉": ["辛"],
    "戌": ["戊", "辛", "丁"],
    "亥": ["壬", "甲"]
  };
  
  return hiddenStemsMap[branch] || [];
}

// モジュールエクスポート
module.exports = {
  calculateYearBranchIndex,
  calculateYearBranch,
  getHiddenStems
};