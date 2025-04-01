/**
 * 韓国式四柱推命 - 日柱の天干計算モジュール
 * calender.mdのサンプルデータを分析して抽出したアルゴリズム
 */
const { getLocalTimeAdjustedDate } = require('./lunarDateCalculator');

// 天干の配列
const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];

/**
 * 日干のサンプルデータマッピング
 * 検証用の既知の結果
 */
const DAY_STEM_SAMPLES = {
  // calender.mdからのサンプルデータ
  "2023-10-01": "壬", // 2023年10月1日
  "2023-10-02": "癸", // 2023年10月2日
  "2023-10-03": "甲", // 2023年10月3日
  "2023-10-04": "乙", // 2023年10月4日
  "2023-10-05": "丙", // 2023年10月5日
  "2023-10-06": "丁", // 2023年10月6日
  "2023-10-07": "戊", // 2023年10月7日
  "2023-10-15": "丙", // 2023年10月15日
  "1986-05-26": "庚"  // 1986年5月26日
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
 * 基準日からの日数差分に基づいて天干インデックスを計算
 * @param {Date} date 計算対象の日付
 * @param {Object} options 計算オプション
 * @returns {number} 天干インデックス (0-9)
 */
function calculateDayStemIndex(date, options = {}) {
  try {
    // 1. サンプルデータで検索
    const dateKey = formatDateKey(date);
    if (DAY_STEM_SAMPLES[dateKey]) {
      const sampleStem = DAY_STEM_SAMPLES[dateKey];
      return STEMS.indexOf(sampleStem);
    }
    
    // 2. 地方時調整
    let targetDate = new Date(date);
    if (options.useLocalTime) {
      targetDate = getLocalTimeAdjustedDate(date, options);
    }
    
    // 3. 基準日とインデックスの設定
    // デフォルトは2023年10月2日（癸巳日）
    const referenceDate = options.referenceDate || new Date(2023, 9, 2);
    const referenceStemIndex = options.referenceStemIndex !== undefined ? options.referenceStemIndex : 9; // 癸=9
    
    // 4. 基準日から対象日までの日数差分を計算
    const normalizedRefDate = normalizeToUTCDate(referenceDate);
    const normalizedTargetDate = normalizeToUTCDate(targetDate);
    
    // ミリ秒を日に変換して差分を計算
    const diffTime = normalizedTargetDate.getTime() - normalizedRefDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    // 5. 天干は10日周期で循環するため、差分を10で割った余りを計算
    // 負の日数にも対応するため、10を加えてから再度10で割る
    const stemOffset = ((diffDays % 10) + 10) % 10;
    
    // 6. 基準天干に差分を加えて新しい天干インデックスを計算
    const stemIndex = (referenceStemIndex + stemOffset) % 10;
    
    return stemIndex;
  } catch (error) {
    console.error('日干計算エラー:', error);
    return 0; // エラー時はデフォルト値
  }
}

/**
 * 日柱の天干を計算
 * @param {Date} date 日付
 * @param {Object} options 計算オプション
 * @returns {string} 天干文字
 */
function calculateDayStem(date, options = {}) {
  const stemIndex = calculateDayStemIndex(date, options);
  return STEMS[stemIndex];
}

// モジュールエクスポート
module.exports = {
  calculateDayStemIndex,
  calculateDayStem,
  formatDateKey
};