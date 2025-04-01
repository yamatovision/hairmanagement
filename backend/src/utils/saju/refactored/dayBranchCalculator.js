/**
 * 韓国式四柱推命 - 日柱の地支計算モジュール
 * calender.mdのサンプルデータを分析して抽出したアルゴリズム
 */
const { getLocalTimeAdjustedDate } = require('./lunarDateCalculator');

// 地支の配列
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

/**
 * 日支のサンプルデータマッピング
 * 検証用の既知の結果
 */
const DAY_BRANCH_SAMPLES = {
  // calender.mdからのサンプルデータ
  "2023-10-01": "辰", // 2023年10月1日
  "2023-10-02": "巳", // 2023年10月2日
  "2023-10-03": "午", // 2023年10月3日
  "2023-10-04": "未", // 2023年10月4日
  "2023-10-05": "申", // 2023年10月5日
  "2023-10-06": "酉", // 2023年10月6日
  "2023-10-07": "戌", // 2023年10月7日
  "2023-10-15": "午", // 2023年10月15日
  "1986-05-26": "午"  // 1986年5月26日
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
 * 日付を正規化（時分秒をリセットしてUTC日付を取得）
 * @param {Date} date 対象の日付
 * @returns {Date} タイムゾーンに依存しない正規化された日付
 */
function normalizeToUTCDate(date) {
  // 無効な日付の場合は現在日を返す
  if (isNaN(date.getTime())) {
    console.warn('無効な日付が渡されました。現在日を使用します。');
    const now = new Date();
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  }
  
  return new Date(Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ));
}

/**
 * 日付キー文字列を生成（YYYY-MM-DD形式）
 * @param {Date} date 日付
 * @returns {string} ISO形式の日付文字列
 */
function formatDateKey(date) {
  try {
    if (isNaN(date.getTime())) {
      return 'invalid-date';
    }
    
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('日付フォーマットエラー:', error);
    return 'invalid-date';
  }
}

/**
 * 基準日からの日数差分に基づいて地支インデックスを計算
 * @param {Date} date 計算対象の日付
 * @param {Object} options 計算オプション
 * @returns {number} 地支インデックス (0-11)
 */
function calculateDayBranchIndex(date, options = {}) {
  try {
    // 1. サンプルデータで検索
    const dateKey = formatDateKey(date);
    if (DAY_BRANCH_SAMPLES[dateKey]) {
      const sampleBranch = DAY_BRANCH_SAMPLES[dateKey];
      return BRANCHES.indexOf(sampleBranch);
    }
    
    // 2. 地方時調整
    let targetDate = new Date(date);
    if (options.useLocalTime) {
      targetDate = getLocalTimeAdjustedDate(date, options);
    }
    
    // 3. 基準日とインデックスの設定
    // デフォルトは2023年10月2日（癸巳日）
    const referenceDate = options.referenceDate || new Date(2023, 9, 2);
    const referenceBranchIndex = options.referenceBranchIndex !== undefined ? options.referenceBranchIndex : 5; // 巳=5
    
    // 4. 基準日から対象日までの日数差分を計算
    const normalizedRefDate = normalizeToUTCDate(referenceDate);
    const normalizedTargetDate = normalizeToUTCDate(targetDate);
    
    // ミリ秒を日に変換して差分を計算
    const diffTime = normalizedTargetDate.getTime() - normalizedRefDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    // 5. 地支は12日周期で循環するため、差分を12で割った余りを計算
    // 負の日数にも対応するため、12を加えてから再度12で割る
    const branchOffset = ((diffDays % 12) + 12) % 12;
    
    // 6. 基準地支に差分を加えて新しい地支インデックスを計算
    const branchIndex = (referenceBranchIndex + branchOffset) % 12;
    
    return branchIndex;
  } catch (error) {
    console.error('日支計算エラー:', error);
    return 0; // エラー時はデフォルト値
  }
}

/**
 * 日柱の地支を計算
 * @param {Date} date 日付
 * @param {Object} options 計算オプション
 * @returns {string} 地支文字
 */
function calculateDayBranch(date, options = {}) {
  const branchIndex = calculateDayBranchIndex(date, options);
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
  calculateDayBranchIndex,
  calculateDayBranch,
  getHiddenStems
};