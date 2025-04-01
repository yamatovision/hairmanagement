/**
 * 韓国式四柱推命 - 年柱の天干計算モジュール
 * calender.mdのサンプルデータを分析して抽出したアルゴリズム
 */

// 天干の配列
const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];

/**
 * 年干（天干）を計算する - 韓国式
 * @param {number} year 西暦年
 * @param {Object} options 計算オプション
 * @return {number} 天干のインデックス (0-9)
 */
function calculateYearStemIndex(year, options = {}) {
  // 基準点の設定
  const referenceYear = options.referenceYear || 1984; // 1984年は甲子年
  const referenceStemIndex = options.referenceStemIndex || 0; // 甲=0
  
  // 基準年からの差分を計算
  const yearDiff = year - referenceYear;
  
  // 天干は10周期で循環する
  // 正の剰余を確保するため、まず天干の数を足してから剰余を取る
  return (referenceStemIndex + (yearDiff % 10 + 10) % 10) % 10;
}

/**
 * 年干（天干）を取得する - 韓国式
 * @param {number} year 西暦年
 * @param {Object} options 計算オプション
 * @returns {string} 天干文字
 */
function calculateYearStem(year, options = {}) {
  const stemIndex = calculateYearStemIndex(year, options);
  return STEMS[stemIndex];
}

// モジュールエクスポート
module.exports = {
  calculateYearStemIndex,
  calculateYearStem
};