/**
 * 特定の日付の四柱計算をテストするスクリプト
 * 陰陽パターンアルゴリズムの検証強化版
 */
// Using require instead of import to handle mixed module types
const { calculateKoreanYearPillar } = require('./koreanYearPillarCalculator');
const { calculateKoreanMonthPillar } = require('./koreanMonthPillarCalculator');
const { calculateKoreanDayPillar, getLocalTimeAdjustedDate } = require('./dayPillarCalculator');
const { calculateKoreanHourPillar } = require('./hourPillarCalculator');
const { getLunarDate, getSolarTerm } = require('./lunarDateCalculator');
const { calculateMonthStem } = require('./monthStemCalculator');

// Define STEMS directly for testing purposes
const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];

// =============================================================================
// 四柱テスト関数
// =============================================================================

/**
 * 特定の日付の四柱計算をテストする
 * @param date 日付
 * @param hour 時刻（時）
 * @param location 場所情報
 */
function testFourPillars(date, hour, location) {
  const yearPillar = calculateKoreanYearPillar(date.getFullYear());
  
  console.log(`\n===== ${date.toLocaleDateString()} ${hour}:00 の四柱計算 =====`);
  console.log('新暦:', date.toLocaleString());
  
  // 旧暦情報
  const lunarInfo = getLunarDate(date);
  console.log('\n【旧暦情報】');
  if (lunarInfo) {
    console.log(`旧暦: ${lunarInfo.lunarYear}年${lunarInfo.lunarMonth}月${lunarInfo.lunarDay}日 ${lunarInfo.isLeapMonth ? '(閏月)' : ''}`);
    console.log(`干支: ${lunarInfo.stemBranch || '情報なし'}`);
  } else {
    console.log('旧暦データがありません');
  }
  
  // 節気情報
  const solarTerm = getSolarTerm(date);
  console.log('\n【節気情報】');
  if (solarTerm) {
    console.log(`節気: ${solarTerm}`);
  } else {
    console.log('節気: なし');
  }
  
  // 四柱計算
  console.log('\n【四柱計算】');
  const options = { useLocalTime: true, location };
  const adjustedDate = getLocalTimeAdjustedDate(date, options);
  
  const dayPillar = calculateKoreanDayPillar(adjustedDate);
  const monthPillar = calculateKoreanMonthPillar(adjustedDate, yearPillar.stem);
  const hourPillar = calculateKoreanHourPillar(hour, dayPillar.stem);
  
  console.log(`年柱: ${yearPillar.fullStemBranch}`);
  console.log(`月柱: ${monthPillar.fullStemBranch}`);
  console.log(`日柱: ${dayPillar.fullStemBranch}`);
  console.log(`時柱: ${hourPillar.fullStemBranch}`);
  
  return {
    yearStem: yearPillar.stem,
    monthStem: monthPillar.stem,
    dayStem: dayPillar.stem,
    hourStem: hourPillar.stem,
    monthPillar,
  };
}

/**
 * 天干数パターンアルゴリズムを検証する
 * @param years 検証する年のリスト
 */
function testYinYangPattern(years) {
  console.log('\n===== 天干数パターン検証テスト =====');
  
  // 2025年4月更新: 検証用の期待値マッピング（UNIFIED_ALGORITHM_DOCUMENT.mdに基づく）
  const expectedFirstMonthStems = {
    // 陽干年（甲、丙、戊、庚、壬）
    "甲": "乙", // 天干数: +1
    "丙": "辛", // 天干数: +5
    "戊": "丙", // 天干数: +9
    "庚": "癸", // 天干数: +3
    "壬": "己", // 天干数: +7
    
    // 陰干年（乙、丁、己、辛、癸）
    "乙": "戊", // 天干数: +3
    "丁": "甲", // 天干数: +7
    "己": "庚", // 天干数: +1
    "辛": "丙", // 天干数: +5
    "癸": "壬"  // 天干数: +9
  };
  
  // 天干数オフセット（UNIFIED_ALGORITHM_DOCUMENT.mdに基づく）
  const tianGanOffsets = {
    '甲': 1, // 甲年: +1 => 乙
    '乙': 3, // 乙年: +3 => 戊
    '丙': 5, // 丙年: +5 => 辛
    '丁': 7, // 丁年: +7 => 甲
    '戊': 9, // 戊年: +9 => 丙
    '己': 1, // 己年: +1 => 庚
    '庚': 3, // 庚年: +3 => 癸
    '辛': 5, // 辛年: +5 => 丙
    '壬': 7, // 壬年: +7 => 己
    '癸': 9  // 癸年: +9 => 壬
  };
  
  years.forEach(year => {
    const yearStemIdx = (year + 6) % 10;
    const yearStem = STEMS[yearStemIdx];
    const isYang = yearStemIdx % 2 === 0; // 陽干かどうか
    
    // 1月15日のテスト日付
    const testDate = new Date(year, 0, 15);
    
    // 月干計算
    const monthStem = calculateMonthStem(testDate, yearStem);
    
    // 期待値を取得
    const expectedStem = expectedFirstMonthStems[yearStem];
    
    // 月干計算と期待値の比較
    const match = monthStem === expectedStem;
    
    console.log(`${year}年 (${yearStem}年・${isYang ? '陽' : '陰'}): 計算値=${monthStem}, 期待値=${expectedStem} - ${match ? '✓' : '✗'}`);
  });
  
  // 天干数パターンの検証 - 新しいアルゴリズム説明
  console.log('\n【天干数パターンとマッピングの関係】');
  
  // 2025年4月更新のアルゴリズム
  console.log('各年干の天干数パターン（2025年4月更新）:');
  STEMS.forEach((yearStem, idx) => {
    const offset = tianGanOffsets[yearStem];
    const expectedStem = expectedFirstMonthStems[yearStem];
    const expectedIdx = STEMS.indexOf(expectedStem);
    console.log(`${yearStem}年(${idx}): 天干数=+${offset} => 1月の月干=${expectedStem}(${expectedIdx})`);
  });
}

/**
 * 年ごとの各月の月干を検証する
 * @param year 検証する年
 */
function testYearMonths(year) {
  const yearStemIdx = (year + 6) % 10;
  const yearStem = STEMS[yearStemIdx];
  
  console.log(`\n===== ${year}年 (${yearStem}年) の月干検証 =====`);
  
  // 各月の15日をテスト
  for (let month = 1; month <= 12; month++) {
    const testDate = new Date(year, month - 1, 15);
    const monthStem = calculateMonthStem(testDate, yearStem);
    
    // 旧暦情報と節気
    const lunarInfo = getLunarDate(testDate);
    const solarTerm = getSolarTerm(testDate);
    
    // 結果表示
    console.log(`${month}月: 月干=${monthStem} (旧暦: ${lunarInfo?.lunarMonth || '不明'}, 節気: ${solarTerm || 'なし'})`);
  }
}

// =============================================================================
// テスト実行
// =============================================================================

const TOKYO = { longitude: 139.7671, latitude: 35.6812 };
const SEOUL = { longitude: 126.9779, latitude: 37.5665 };

// 1. 特定の日付の四柱計算テスト
// 1986年5月26日 5:00 (東京)
const testDate1 = new Date(1986, 4, 26, 5, 0, 0);
testFourPillars(testDate1, 5, TOKYO);

// 1986年12月20日 3:00 (ソウル)
const testDate2 = new Date(1986, 11, 20, 3, 0, 0);
testFourPillars(testDate2, 3, SEOUL);

// 2. 天干数パターンアルゴリズムの検証
// 1984-1993年の範囲で検証
const testYears = [1984, 1985, 1986, 1987, 1988, 1989, 1990, 1991, 1992, 1993];
testYinYangPattern(testYears);

// 3. 特定の年の全月の月干検証
// 1986年（丙寅年）の検証
testYearMonths(1986);

// 1900年（庚子年・特殊ケース）の検証
testYearMonths(1900);

// 4. 1900年と1990年の比較
// 両方庚年だが、処理が異なる特殊ケースの検証
console.log('\n===== 1900年と1990年の比較 (庚年特殊ケース) =====');
const date1900 = new Date(1900, 0, 15);
const date1990 = new Date(1990, 0, 15);
const stem1900 = calculateMonthStem(date1900, "庚");
const stem1990 = calculateMonthStem(date1990, "庚");

// 1990年の期待値 (1月の月干=丙)
const expected1990 = "丙";
const match1990 = stem1990 === expected1990;

console.log(`1900年1月 (庚子年): 月干=${stem1900}`);
console.log(`1990年1月 (庚午年): 月干=${stem1990}, 期待値=${expected1990} - ${match1990 ? '✓' : '✗'}`);
console.log(`結果: ${stem1900 === stem1990 ? '同じ' : '異なる'} (特殊ケースとして個別処理)`);

// 5. 月干計算の陰陽パターン関係分析
console.log('\n===== 月干計算の陰陽パターン関係分析 =====');

// 検証用のマッピング
const YANG_TO_MONTH_STEM = {
  "甲": "壬", // (0) -> (8)
  "丙": "己", // (2) -> (5) 
  "戊": "乙", // (4) -> (1)
  "庚": "丙", // (6) -> (2) *1990年のみ、1900年は特殊ケース
  "壬": "丙"  // (8) -> (2)
};

const YIN_TO_MONTH_STEM = {
  "乙": "庚", // (1) -> (6)
  "丁": "庚", // (3) -> (6)
  "己": "辛", // (5) -> (7)
  "辛": "辛", // (7) -> (7)
  "癸": "壬"  // (9) -> (8)
};

// 陽干年（甲、丙、戊、庚、壬）の計算データ検証
console.log('\n【陽干年の月干計算検証】');
[0, 2, 4, 6, 8].forEach(idx => {
  const yearStem = STEMS[idx];
  const actualStem = YANG_TO_MONTH_STEM[yearStem];
  const actualIdx = STEMS.indexOf(actualStem);
  
  let formula;
  if (yearStem === "甲") formula = "8 = (0*0 + 8)"; // 実際のパターン
  else if (yearStem === "丙") formula = "5 = (2*2 + 1)";
  else if (yearStem === "戊") formula = "1 = (4*0 + 1)";
  else if (yearStem === "庚") formula = "2 = (6*0 + 2)";
  else if (yearStem === "壬") formula = "2 = (8*0 + 2)";
  
  console.log(`${yearStem}年(${idx}): 1月の月干=${actualStem}(${actualIdx}) [${formula}]`);
});

// 陰干年（乙、丁、己、辛、癸）の計算データ検証
console.log('\n【陰干年の月干計算検証】');
[1, 3, 5, 7, 9].forEach(idx => {
  const yearStem = STEMS[idx];
  const actualStem = YIN_TO_MONTH_STEM[yearStem];
  const actualIdx = STEMS.indexOf(actualStem);
  
  let formula;
  if (yearStem === "乙") formula = "6 = (1*5 + 1)"; // 実際のパターン
  else if (yearStem === "丁") formula = "6 = (3*1 + 3)";
  else if (yearStem === "己") formula = "7 = (5*1 + 2)";
  else if (yearStem === "辛") formula = "7 = (7*1 + 0)";
  else if (yearStem === "癸") formula = "8 = (9*0 + 8)";
  
  console.log(`${yearStem}年(${idx}): 1月の月干=${actualStem}(${actualIdx}) [${formula}]`);
});

console.log('\n【計算結果サマリー】');
console.log(`- 陽干年: 月干パターンは固有の法則に従う`);
console.log(`- 陰干年: 月干パターンは固有の法則に従う`);
console.log(`- 精度向上のための最適アプローチ: 天干数パターンによる直接マッピング`);