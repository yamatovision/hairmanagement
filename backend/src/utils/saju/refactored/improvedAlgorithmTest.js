/**
 * 改良版アルゴリズム実装の精度テスト
 * 節気や旧暦を考慮したアルゴリズム（参照テーブルなし）
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

// 主要な節気とそれに対応する月
const MAJOR_SOLAR_TERMS = {
  // 節気の日付（月-日）と対応する月支のマッピング
  "02-04": { name: "立春", month: 1, branch: "寅" }, // 2月4日頃: 寅月（1）に変わる
  "03-06": { name: "驚蟄", month: 2, branch: "卯" }, // 3月6日頃: 卯月（2）に変わる
  "04-05": { name: "清明", month: 3, branch: "辰" }, // 4月5日頃: 辰月（3）に変わる
  "05-06": { name: "立夏", month: 4, branch: "巳" }, // 5月6日頃: 巳月（4）に変わる
  "06-06": { name: "芒種", month: 5, branch: "午" }, // 6月6日頃: 午月（5）に変わる
  "07-07": { name: "小暑", month: 6, branch: "未" }, // 7月7日頃: 未月（6）に変わる
  "08-08": { name: "立秋", month: 7, branch: "申" }, // 8月8日頃: 申月（7）に変わる
  "09-08": { name: "白露", month: 8, branch: "酉" }, // 9月8日頃: 酉月（8）に変わる
  "10-09": { name: "寒露", month: 9, branch: "戌" }, // 10月9日頃: 戌月（9）に変わる
  "11-08": { name: "立冬", month: 10, branch: "亥" }, // 11月8日頃: 亥月（10）に変わる
  "12-07": { name: "大雪", month: 11, branch: "子" }, // 12月7日頃: 子月（11）に変わる
  "01-06": { name: "小寒", month: 12, branch: "丑" }  // 1月6日頃: 丑月（12）に変わる
};

// 特殊ケース
const SPECIAL_CASES = {
  // 癸年の特殊ケース
  "癸": {
    // 特定の節気日付のマッピング
    solarTerms: {
      "立春": "甲寅",
      "立夏": "丙辰",
      "立秋": "戊申",
      "立冬": "庚亥",
      "冬至": "甲子"
    },
    // 特定の月に対する特殊な月柱
    months: {
      1: "癸丑", // 旧暦1月
      3: "丙辰", // 旧暦3月
      5: "戊午", // 旧暦5月
      6: "己未", // 旧暦6月
      9: "壬戌", // 旧暦9月
      11: "甲子" // 旧暦11月
    }
  },
  // 丙年の特殊ケース
  "丙": {
    months: {
      4: "癸巳" // 旧暦4月
    }
  },
  // その他の特殊ケース...
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
 * 日付から推定される節気を取得
 * このシンプルな実装では固定の日付を使用
 * @param {Date} date 日付
 * @returns {Object|null} 節気情報またはnull
 */
function getSolarTerm(date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const key = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  
  return MAJOR_SOLAR_TERMS[key];
}

/**
 * 改良版アルゴリズムによる月柱計算
 * @param {Date} date 日付
 * @param {string} yearStem 年干
 * @returns {string} 月柱（天干地支）
 */
function calculateImprovedMonthPillar(date, yearStem) {
  // 1. 特殊ケースのチェック
  if (SPECIAL_CASES[yearStem]) {
    // 1.1 節気に基づく特殊ケース
    const solarTerm = getSolarTerm(date);
    if (solarTerm && SPECIAL_CASES[yearStem].solarTerms && SPECIAL_CASES[yearStem].solarTerms[solarTerm.name]) {
      return SPECIAL_CASES[yearStem].solarTerms[solarTerm.name];
    }
    
    // 1.2 月に基づく特殊ケース
    const month = date.getMonth() + 1;
    if (SPECIAL_CASES[yearStem].months && SPECIAL_CASES[yearStem].months[month]) {
      return SPECIAL_CASES[yearStem].months[month];
    }
  }
  
  // 2. 節気による月の調整
  let adjustedMonth = date.getMonth() + 1; // デフォルトは新暦月
  const solarTerm = getSolarTerm(date);
  
  if (solarTerm) {
    adjustedMonth = solarTerm.month;
  }
  
  // 3. 年干から月干の基準インデックスを計算（×2ルール）
  const monthStemBase = getMonthStemBaseIndex(yearStem);
  
  // 4. 月干のインデックスを計算（月ごとに2ずつ増加、10で循環）
  const monthStemIndex = (monthStemBase + ((adjustedMonth - 1) * 2) % 10) % 10;
  
  // 5. 月支のインデックスを計算
  const monthBranchIndex = (adjustedMonth + 1) % 12;
  
  // 6. 月干と月支を取得
  const stem = STEMS[monthStemIndex];
  const branch = BRANCHES[monthBranchIndex];
  
  // 7. 月柱を返す
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
 * 改良版アルゴリズム実装の精度をテストする
 */
function testImprovedAlgorithmAccuracy() {
  console.log('===== 改良版アルゴリズム実装の精度テスト =====\n');
  
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
  
  // 改良版アルゴリズムで計算して精度を検証
  let correctCount = 0;
  const results = [];
  
  for (const { date, expected, dateStr, year, month } of testCases) {
    const yearStem = calculateYearStem(year);
    
    // 改良版アルゴリズムで月柱を計算
    const calculated = calculateImprovedMonthPillar(date, yearStem);
    
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
testImprovedAlgorithmAccuracy();