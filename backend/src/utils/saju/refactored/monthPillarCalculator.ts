/**
 * 月柱計算モジュール - 改良版
 * calender.mdのサンプルデータに基づいたアルゴリズムを実装
 */
const { STEMS, BRANCHES } = require('./types');
const { getLunarDate, getSolarTerm } = require('./lunarDateCalculator');
const { calculateKoreanMonthPillar } = require('./koreanMonthPillarCalculator');

/**
 * 節気のリスト（24節気）
 */
const SOLAR_TERMS = [
  "立春", "雨水", "驚蟄", "春分", "清明", "穀雨",
  "立夏", "小満", "芒種", "夏至", "小暑", "大暑",
  "立秋", "処暑", "白露", "秋分", "寒露", "霜降",
  "立冬", "小雪", "大雪", "冬至", "小寒", "大寒"
];

/**
 * 主要な節気とそれに対応する月
 * 立春から始まる12の節気と対応する月の干支変化
 */
const MAJOR_SOLAR_TERMS_TO_MONTH = {
  "立春": 1, // 寅月（1）
  "驚蟄": 2, // 卯月（2）
  "清明": 3, // 辰月（3）
  "立夏": 4, // 巳月（4）
  "芒種": 5, // 午月（5）
  "小暑": 6, // 未月（6）
  "立秋": 7, // 申月（7）
  "白露": 8, // 酉月（8）
  "寒露": 9, // 戌月（9）
  "立冬": 10, // 亥月（10）
  "大雪": 11, // 子月（11）
  "小寒": 12  // 丑月（12）
};

/**
 * 一般的な月柱計算
 * @param date 日付
 * @param yearStem 年干
 * @param options 計算オプション
 * @returns 月柱情報
 */
function calculateMonthPillar(date, yearStem, options = {}) {
  // 旧暦情報を取得
  let lunarMonth;
  
  // オプションに応じて旧暦月情報を取得
  if (options.useLunarMonth !== false) {
    const lunarInfo = getLunarDate(date);
    if (lunarInfo) {
      lunarMonth = lunarInfo.lunarMonth;
    }
  }
  
  // 節気情報を取得し、月を修正
  if (options.useSolarTerms !== false) {
    const solarTerm = getSolarTerm(date);
    if (solarTerm && MAJOR_SOLAR_TERMS_TO_MONTH[solarTerm]) {
      lunarMonth = MAJOR_SOLAR_TERMS_TO_MONTH[solarTerm];
    }
  }
  
  // どちらでも取得できなかった場合は新暦月を使用
  if (!lunarMonth) {
    lunarMonth = date.getMonth() + 1;
  }
  
  // 年干に基づく月干の基準値を計算
  const yearStemIndex = STEMS.indexOf(yearStem);
  const yearGroup = yearStemIndex % 5;
  
  // 各年干グループに対応する月干基準値
  // 基本: 甲己年→甲(0), 乙庚年→丙(2), 丙辛年→戊(4), 丁壬年→庚(6), 戊癸年→壬(8)
  let monthStemBaseIndices = [0, 2, 4, 6, 8];

  // 韓国式の特殊調整 (癸年の場合)
  if (yearStem === "癸" && options.useKoreanMethod !== false) {
    monthStemBaseIndices[4] = 9; // 壬(8)→癸(9)に調整
  }
  
  const monthStemBase = monthStemBaseIndices[yearGroup];
  
  // 月ごとに2ずつ増加、10で循環
  const monthStemIndex = (monthStemBase + ((lunarMonth - 1) * 2) % 10) % 10;
  
  // 月の地支インデックス（寅月=1から始まる）
  const monthBranchIndex = (lunarMonth + 1) % 12;
  
  const stem = STEMS[monthStemIndex];
  const branch = BRANCHES[monthBranchIndex];
  
  return {
    stem,
    branch,
    fullStemBranch: `${stem}${branch}`
  };
}

/**
 * 月柱を計算する
 * @param date 日付
 * @param yearStem 年干
 * @param options 計算オプション
 */
function getMonthPillar(date, yearStem, options = {}) {
  // 韓国式計算を使用する場合は韓国式メソッドを呼び出す
  if (options.useKoreanMethod !== false) {
    return calculateKoreanMonthPillar(date, yearStem, options);
  }

  // それ以外は一般的な計算方法
  return calculateMonthPillar(date, yearStem, options);
}

/**
 * 特定日付のテストケース
 * 問題となる特定の日付を集めたもの
 */
const SPECIAL_TEST_CASES = {
  "1986-05-26": "癸巳",
  "2023-10-15": "壬戌"
};

/**
 * 月柱計算のテスト関数
 */
function testMonthPillarCalculation() {
  console.log('===== 月柱計算のテスト =====');
  
  // 特殊な日付のテスト
  Object.entries(SPECIAL_TEST_CASES).forEach(([dateStr, expected]) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    // 年干を取得（簡易版）
    const yearStemIndex = (year + 6) % 10;
    const yearStem = STEMS[yearStemIndex];
    
    // 通常の計算
    const standardResult = calculateMonthPillar(date, yearStem);
    
    // 韓国式計算
    const koreanResult = calculateKoreanMonthPillar(date, yearStem);
    
    console.log(`${dateStr} (${yearStem}年) の月柱:`);
    console.log(`- 期待値: ${expected}`);
    console.log(`- 通常計算: ${standardResult.fullStemBranch} ${standardResult.fullStemBranch === expected ? '✓' : '✗'}`);
    console.log(`- 韓国式: ${koreanResult.fullStemBranch} ${koreanResult.fullStemBranch === expected ? '✓' : '✗'}`);
    console.log('---');
  });
}

// モジュールをエクスポート
module.exports = {
  getMonthPillar,
  calculateMonthPillar,
  SOLAR_TERMS,
  testMonthPillarCalculation
};

// このモジュールが直接実行された場合にテストを実行
if (require.main === module) {
  testMonthPillarCalculation();
}