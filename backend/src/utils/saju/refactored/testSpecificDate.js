/**
 * 韓国式四柱推命 - 特定日付の月柱計算テスト
 * 任意の日付の月柱を計算し、検証するためのスクリプト
 */
const { calculateKoreanMonthPillar } = require('./koreanMonthPillarCalculator');
const { STEMS } = require('./types');
const lunarDateCalculator = require('./lunarDateCalculator');

/**
 * 特定の日付の月柱を計算するユーティリティ関数
 * @param {number} year 年
 * @param {number} month 月 (1-12)
 * @param {number} day 日
 * @returns {object} 月柱情報
 */
function calculateMonthPillarForDate(year, month, day) {
  // 日付オブジェクト作成（月は0から始まるので調整）
  const date = new Date(year, month - 1, day);
  
  // 年干を計算
  const yearStemIndex = (year + 6) % 10;
  const yearStem = STEMS[yearStemIndex];
  
  // 月柱計算
  const monthPillar = calculateKoreanMonthPillar(date, yearStem, { 
    ignoreTestCases: true // テストケースを無視して常にアルゴリズムで計算
  });
  
  return {
    date: lunarDateCalculator.formatDateKey(date),
    yearStem,
    monthPillar
  };
}

// メイン関数
function main() {
  // コマンドライン引数からの日付取得
  // デフォルトは現在の日付
  let year, month, day;
  
  if (process.argv.length >= 5) {
    // コマンドライン引数から日付を取得
    year = parseInt(process.argv[2]);
    month = parseInt(process.argv[3]);
    day = parseInt(process.argv[4]);
  } else {
    // 現在の日付を使用
    const now = new Date();
    year = now.getFullYear();
    month = now.getMonth() + 1;
    day = now.getDate();
    
    console.log(`引数が指定されていないため、現在の日付を使用します: ${year}年${month}月${day}日`);
  }
  
  // 日付が有効かチェック
  if (isNaN(year) || isNaN(month) || isNaN(day) || 
      year < 1900 || year > 2100 || 
      month < 1 || month > 12 || 
      day < 1 || day > 31) {
    console.error('無効な日付です。正しい日付形式: YYYY MM DD');
    process.exit(1);
  }
  
  // 月柱計算
  const result = calculateMonthPillarForDate(year, month, day);
  
  // 結果表示
  console.log(`===== 韓国式月柱計算結果 =====`);
  console.log(`日付: ${result.date} (${result.yearStem}年)`);
  console.log(`月柱: ${result.monthPillar.fullStemBranch} [${result.monthPillar.stem}${result.monthPillar.branch}]`);
  
  // 旧暦情報を表示
  const date = new Date(year, month - 1, day);
  console.log('\n【旧暦情報】');
  const lunarDate = lunarDateCalculator.getLunarDate(date);
  if (lunarDate) {
    console.log(`旧暦: ${lunarDate.lunarYear}年${lunarDate.lunarMonth}月${lunarDate.lunarDay}日 ${lunarDate.isLeapMonth ? '(閏月)' : ''}`);
    console.log(`干支: ${lunarDate.stemBranch || '情報なし'}`);
  } else {
    console.log('旧暦データがありません');
  }
  
  // 節気情報も表示
  console.log('\n【節気情報】');
  const solarTerm = lunarDateCalculator.getSolarTerm(date);
  if (solarTerm) {
    console.log(`節気: ${solarTerm}`);
  } else {
    console.log('節気: なし');
  }
  
  // 今後3ヶ月の月柱も表示
  console.log("\n===== 今後3ヶ月の月柱 =====");
  for (let i = 1; i <= 3; i++) {
    const nextMonth = month + i;
    let nextYear = year;
    let adjustedMonth = nextMonth;
    
    // 月が12を超える場合、年を調整
    if (nextMonth > 12) {
      adjustedMonth = nextMonth - 12;
      nextYear++;
    }
    
    // 翌月の結果を計算
    const nextResult = calculateMonthPillarForDate(nextYear, adjustedMonth, day);
    console.log(`${nextYear}年${adjustedMonth}月${day}日: ${nextResult.monthPillar.fullStemBranch}`);
  }
}

// スクリプト実行
main();