/**
 * 参照テーブルなしの純粋アルゴリズム実装の精度テスト
 */

// 基本定数
const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

// 既知のテストケース（正解データ）
const TEST_CASES = {
  "1970-01-01": "丙子",
  "1985-01-01": "丙子",
  "1986-05-26": "癸巳",
  "1990-05-15": "辛巳",
  "1995-01-01": "丙子",
  "2005-01-01": "丙子",
  "2015-01-01": "丙子",
  "2023-02-03": "癸丑",
  "2023-02-04": "甲寅",
  "2023-05-05": "丙辰",
  "2023-06-19": "戊午",
  "2023-07-19": "己未",
  "2023-08-07": "己未",
  "2023-10-01": "辛酉",
  "2023-10-02": "辛酉",
  "2023-10-03": "辛酉",
  "2023-10-04": "辛酉",
  "2023-10-05": "辛酉",
  "2023-10-06": "辛酉",
  "2023-10-07": "辛酉",
  "2023-10-15": "壬戌",
  "2023-11-07": "壬戌",
  "2023-12-21": "甲子",
  "2024-02-04": "乙丑"
};

/**
 * 年干から月干の基準インデックスを計算する（×2ルール）
 * @param {string} yearStem 年干
 * @returns {number} 月干の基準インデックス（0-9）
 */
function getMonthStemBaseIndex(yearStem) {
  const yearStemIndex = STEMS.indexOf(yearStem);
  // ×2ルール - 年干インデックスの2倍が月干の基準値
  return (yearStemIndex * 2) % 10;
}

/**
 * 月から月支のインデックスを計算
 * @param {number} month 月（1-12）
 * @returns {number} 地支のインデックス（0-11）
 */
function getMonthBranchIndex(month) {
  // 月支の対応関係: 1月→寅, 2月→卯, ...
  return (month + 1) % 12;
}

/**
 * 月柱の天干を純粋なアルゴリズムで計算する
 * @param {string} yearStem 年干
 * @param {number} month 月（1-12）
 * @returns {string} 月干
 */
function calculateMonthStemPure(yearStem, month) {
  // 年干から月干の基準インデックスを計算（×2ルール）
  const monthStemBase = getMonthStemBaseIndex(yearStem);
  
  // 月干のインデックスを計算（月ごとに2ずつ増加、10で循環）
  const monthStemIndex = (monthStemBase + ((month - 1) * 2) % 10) % 10;
  
  // 月干を返す
  return STEMS[monthStemIndex];
}

/**
 * 月柱の地支を計算する
 * @param {number} month 月（1-12）
 * @returns {string} 月支
 */
function calculateMonthBranch(month) {
  const branchIndex = getMonthBranchIndex(month);
  return BRANCHES[branchIndex];
}

/**
 * 月柱を純粋なアルゴリズムで計算する
 * @param {Date} date 日付
 * @param {string} yearStem 年干
 * @returns {string} 月柱（天干地支）
 */
function calculateMonthPillarPure(date, yearStem) {
  const month = date.getMonth() + 1; // 月（1-12）
  
  // 月干と月支を計算
  const stem = calculateMonthStemPure(yearStem, month);
  const branch = calculateMonthBranch(month);
  
  // 月柱（天干地支）を返す
  return `${stem}${branch}`;
}

/**
 * 年干を計算する
 * @param {number} year 年
 * @returns {string} 年干
 */
function calculateYearStem(year) {
  // 年干のパターン: (年 - 4) % 10 → 天干インデックス
  const stemIndex = (year - 4) % 10;
  return STEMS[stemIndex];
}

/**
 * 純粋アルゴリズム実装の精度をテストする
 */
function testPureAlgorithmAccuracy() {
  console.log('===== 純粋アルゴリズム実装の精度テスト =====\n');
  
  // テストケースの配列を生成
  const testCases = Object.entries(TEST_CASES).map(([dateStr, expected]) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return {
      date: new Date(year, month - 1, day),
      expected,
      dateStr,
      year,
      month
    };
  });
  
  // 純粋アルゴリズムで計算して精度を検証
  let correctCount = 0;
  const results = [];
  
  for (const { date, expected, dateStr, year, month } of testCases) {
    const yearStem = calculateYearStem(year);
    
    // 純粋アルゴリズムで月柱を計算
    const calculated = calculateMonthPillarPure(date, yearStem);
    
    // 正解と比較
    const isCorrect = calculated === expected;
    if (isCorrect) correctCount++;
    
    results.push({
      dateStr,
      year,
      month,
      expected,
      calculated,
      isCorrect,
      yearStem
    });
  }
  
  // 結果の表示
  console.log('各テストケースの結果:');
  results.forEach(({ dateStr, expected, calculated, isCorrect, yearStem }) => {
    const mark = isCorrect ? '✓' : '✗';
    console.log(`${mark} ${dateStr} (${yearStem}年): 計算値[${calculated}] 期待値[${expected}]`);
  });
  
  // 精度の表示
  const totalCases = testCases.length;
  const accuracy = (correctCount / totalCases * 100).toFixed(1);
  
  console.log(`\n総テスト数: ${totalCases}`);
  console.log(`正解数: ${correctCount}`);
  console.log(`精度: ${accuracy}%\n`);
  
  // 月ごとの精度分析
  const monthlyResults = {};
  for (let month = 1; month <= 12; month++) {
    monthlyResults[month] = { total: 0, correct: 0 };
  }
  
  results.forEach(({ month, isCorrect }) => {
    monthlyResults[month].total++;
    if (isCorrect) monthlyResults[month].correct++;
  });
  
  console.log('月ごとの精度:');
  for (let month = 1; month <= 12; month++) {
    const { total, correct } = monthlyResults[month];
    if (total > 0) {
      const monthAccuracy = (correct / total * 100).toFixed(1);
      console.log(`${month}月: ${correct}/${total} (${monthAccuracy}%)`);
    } else {
      console.log(`${month}月: テストケースなし`);
    }
  }
  
  // 年干ごとの精度分析
  const yearStemResults = {};
  for (const stem of STEMS) {
    yearStemResults[stem] = { total: 0, correct: 0 };
  }
  
  results.forEach(({ yearStem, isCorrect }) => {
    yearStemResults[yearStem].total++;
    if (isCorrect) yearStemResults[yearStem].correct++;
  });
  
  console.log('\n年干ごとの精度:');
  for (const stem of STEMS) {
    const { total, correct } = yearStemResults[stem];
    if (total > 0) {
      const stemAccuracy = (correct / total * 100).toFixed(1);
      console.log(`${stem}年: ${correct}/${total} (${stemAccuracy}%)`);
    } else {
      console.log(`${stem}年: テストケースなし`);
    }
  }
  
  // 不正解だったケースの分析
  const incorrectCases = results.filter(result => !result.isCorrect);
  
  if (incorrectCases.length > 0) {
    console.log('\n不正解だったケースの分析:');
    
    // 年干別の不正解パターン
    const yearStemPatterns = {};
    
    incorrectCases.forEach(({ dateStr, yearStem, expected, calculated }) => {
      if (!yearStemPatterns[yearStem]) {
        yearStemPatterns[yearStem] = [];
      }
      
      yearStemPatterns[yearStem].push({ dateStr, expected, calculated });
    });
    
    for (const [stem, cases] of Object.entries(yearStemPatterns)) {
      console.log(`\n${stem}年の不正解パターン:`);
      cases.forEach(({ dateStr, expected, calculated }) => {
        console.log(`  ${dateStr}: 計算値[${calculated}] 期待値[${expected}]`);
      });
    }
    
    // 月別の不正解パターン
    console.log('\n月別の不正解パターン:');
    for (let month = 1; month <= 12; month++) {
      const monthCases = incorrectCases.filter(({ month: m }) => m === month);
      
      if (monthCases.length > 0) {
        console.log(`\n${month}月の不正解:`);
        monthCases.forEach(({ dateStr, expected, calculated }) => {
          console.log(`  ${dateStr}: 計算値[${calculated}] 期待値[${expected}]`);
        });
      }
    }
  }
  
  // ×2ルールの検証
  console.log('\n×2ルールの検証:');
  for (const stem of STEMS) {
    const stemIndex = STEMS.indexOf(stem);
    const baseIndex = getMonthStemBaseIndex(stem);
    console.log(`${stem}(${stemIndex}) → 基準値: ${STEMS[baseIndex]}(${baseIndex}) [${stemIndex} × 2 = ${stemIndex * 2} % 10 = ${baseIndex}]`);
  }
  
  return {
    totalCases,
    correctCount,
    accuracy,
    results
  };
}

// テスト実行
testPureAlgorithmAccuracy();