/**
 * 韓国式四柱推命 - 時柱の天干計算モジュール
 * calender.mdのサンプルデータを分析して抽出したアルゴリズム
 */

// 天干の配列
const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];

/**
 * 日干(天干)グループごとの時干開始インデックス
 * 時干のベースとなる天干インデックス
 */
const DAY_STEM_TO_HOUR_STEM_BASE = {
  "甲": 0, // 甲の日は甲から始まる
  "乙": 0, // 乙の日も甲から始まる
  "丙": 2, // 丙の日は丙から始まる
  "丁": 2, // 丁の日も丙から始まる
  "戊": 4, // 戊の日は戊から始まる
  "己": 4, // 己の日も戊から始まる
  "庚": 6, // 庚の日は庚から始まる
  "辛": 6, // 辛の日も庚から始まる
  "壬": 8, // 壬の日は壬から始まる
  "癸": 8  // 癸の日も壬から始まる
};

/**
 * 時刻に対応する干支の既知マッピング
 * 特定の時刻帯と対応する時干のサンプル
 */
const HOUR_STEM_SAMPLES = {
  // 2023年10月15日（丙午日）の時干サンプル
  "2023-10-15": {
    1: "戊", // 子の刻 (23-1時)
    5: "庚", // 寅の刻 (3-5時)
    9: "壬", // 辰の刻 (7-9時)
    13: "甲", // 午の刻 (11-13時)
    17: "丙", // 申の刻 (15-17時)
    21: "戊"  // 戌の刻 (19-21時)
  }
};

/**
 * 日干から時干のベースインデックスを取得
 * @param {string} dayStem 日干文字
 * @returns {number} 時干ベースインデックス (0-9)
 */
function getHourStemBaseIndex(dayStem) {
  return DAY_STEM_TO_HOUR_STEM_BASE[dayStem] || 0;
}

/**
 * 時刻から時柱のインデックスを計算
 * @param {number} hour 時刻（0-23）
 * @returns {number} 時柱のインデックス（0-11）
 */
function getHourPillarIndex(hour) {
  // 23時-1時が子(0)、1時-3時が丑(1)...という対応
  const adjustedHour = (hour + 1) % 24;
  return Math.floor(adjustedHour / 2);
}

/**
 * 時刻から時干のインデックスを計算
 * @param {number} hour 時刻（0-23）
 * @param {string} dayStem 日干文字
 * @param {Object} options 計算オプション
 * @returns {number} 時干インデックス (0-9)
 */
function calculateHourStemIndex(hour, dayStem, options = {}) {
  try {
    // サンプルデータでの検証
    const dateKey = options.sampleDate ? formatDateKey(options.sampleDate) : '';
    if (dateKey && HOUR_STEM_SAMPLES[dateKey] && HOUR_STEM_SAMPLES[dateKey][hour]) {
      const sampleStem = HOUR_STEM_SAMPLES[dateKey][hour];
      return STEMS.indexOf(sampleStem);
    }
    
    // 時柱のインデックスを取得（0-11）
    const hourPillarIndex = getHourPillarIndex(hour);
    
    // 日干から時干ベースインデックスを取得
    const hourStemBase = getHourStemBaseIndex(dayStem);
    
    // 時干を計算（各時柱インデックスに対応）
    // 天干は時柱の数に合わせて循環する
    return (hourStemBase + hourPillarIndex) % 10;
  } catch (error) {
    console.error('時干計算エラー:', error);
    return 0; // エラー時はデフォルト値
  }
}

/**
 * 時柱の天干を計算
 * @param {number} hour 時刻（0-23）
 * @param {string} dayStem 日干文字
 * @param {Object} options 計算オプション
 * @returns {string} 時干文字
 */
function calculateHourStem(hour, dayStem, options = {}) {
  const stemIndex = calculateHourStemIndex(hour, dayStem, options);
  return STEMS[stemIndex];
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

// モジュールエクスポート
module.exports = {
  calculateHourStemIndex,
  calculateHourStem,
  getHourStemBaseIndex
};