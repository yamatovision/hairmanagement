/**
 * 韓国式四柱推命 - 時柱の地支計算モジュール
 * calender.mdのサンプルデータを分析して抽出したアルゴリズム
 */

// 地支の配列
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

/**
 * 時刻と地支のマッピング
 * 各時刻帯に対応する地支
 */
const HOUR_TO_BRANCH_MAPPING = {
  23: 0, 0: 0, 1: 0,  // 子（子の刻: 23時-1時）
  2: 1, 3: 1,        // 丑（丑の刻: 1時-3時）
  4: 2, 5: 2,        // 寅（寅の刻: 3時-5時）
  6: 3, 7: 3,        // 卯（卯の刻: 5時-7時）
  8: 4, 9: 4,        // 辰（辰の刻: 7時-9時）
  10: 5, 11: 5,      // 巳（巳の刻: 9時-11時）
  12: 6, 13: 6,      // 午（午の刻: 11時-13時）
  14: 7, 15: 7,      // 未（未の刻: 13時-15時）
  16: 8, 17: 8,      // 申（申の刻: 15時-17時）
  18: 9, 19: 9,      // 酉（酉の刻: 17時-19時）
  20: 10, 21: 10,    // 戌（戌の刻: 19時-21時）
  22: 11              // 亥（亥の刻: 21時-23時）
};

/**
 * 地支に対応する蔵干（隠れた天干）
 */
const HIDDEN_STEMS_MAP = {
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

/**
 * 時刻から時柱の地支インデックスを計算
 * @param {number} hour 時刻（0-23）
 * @param {Object} options 計算オプション
 * @returns {number} 地支インデックス (0-11)
 */
function calculateHourBranchIndex(hour, options = {}) {
  try {
    // 時刻の正規化（24時間形式で0-23）
    const normalizedHour = ((hour % 24) + 24) % 24;
    
    // 時刻から直接地支インデックスを取得
    if (HOUR_TO_BRANCH_MAPPING[normalizedHour] !== undefined) {
      return HOUR_TO_BRANCH_MAPPING[normalizedHour];
    }
    
    // マッピングにない場合（通常はここに到達しない）は計算式で求める
    // 子の刻（23-1時）が0、丑の刻（1-3時）が1...
    return Math.floor(((normalizedHour + 1) % 24) / 2);
  } catch (error) {
    console.error('時支計算エラー:', error);
    return 0; // エラー時はデフォルト値
  }
}

/**
 * 時柱の地支を計算
 * @param {number} hour 時刻（0-23）
 * @param {Object} options 計算オプション
 * @returns {string} 地支文字
 */
function calculateHourBranch(hour, options = {}) {
  const branchIndex = calculateHourBranchIndex(hour, options);
  return BRANCHES[branchIndex];
}

/**
 * 地支から蔵干（隠れた天干）を取得
 * @param {string} branch 地支
 * @returns {string[]} 蔵干の配列
 */
function getHiddenStems(branch) {
  return HIDDEN_STEMS_MAP[branch] || [];
}

// モジュールエクスポート
module.exports = {
  calculateHourBranchIndex,
  calculateHourBranch,
  getHiddenStems
};