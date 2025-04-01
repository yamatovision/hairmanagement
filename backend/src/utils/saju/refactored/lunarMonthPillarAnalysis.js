/**
 * 旧暦月と月柱の対応関係分析
 * 
 * このスクリプトはcalender.mdのデータを元に旧暦月と月柱の相関関係を分析します。
 * 韓国式四柱推命における月柱計算の正確性向上のために使用します。
 */

// 必要なモジュールのインポート
const { STEMS, BRANCHES } = require('./types');
const { getLunarDate, getSolarTerm } = require('./lunarDateCalculator');

/**
 * サンプルデータ - 陽暦日付、旧暦情報、月柱の対応表
 * calender.mdから抽出したデータに基づく
 */
const SAMPLE_DATA = [
  // 年柱計算サンプル（基本的には月柱も含まれている）
  { 
    solarDate: "1970-01-01", 
    lunarDate: { year: 1969, month: 11, day: 23, isLeapMonth: false },
    yearStem: "己",
    yearBranch: "酉",
    monthStem: "丙", 
    monthBranch: "子", 
    monthPillar: "丙子",
    solarTerm: null
  },
  { 
    solarDate: "1985-01-01", 
    lunarDate: { year: 1984, month: 11, day: 10, isLeapMonth: false },
    yearStem: "甲",
    yearBranch: "子",
    monthStem: "丙", 
    monthBranch: "子", 
    monthPillar: "丙子",
    solarTerm: null
  },
  { 
    solarDate: "1995-01-01", 
    lunarDate: { year: 1994, month: 11, day: 29, isLeapMonth: false },
    yearStem: "甲",
    yearBranch: "戌",
    monthStem: "丙", 
    monthBranch: "子", 
    monthPillar: "丙子",
    solarTerm: null
  },
  { 
    solarDate: "2005-01-01", 
    lunarDate: { year: 2004, month: 11, day: 20, isLeapMonth: false },
    yearStem: "甲",
    yearBranch: "申",
    monthStem: "丙", 
    monthBranch: "子", 
    monthPillar: "丙子",
    solarTerm: null
  },
  { 
    solarDate: "2015-01-01", 
    lunarDate: { year: 2014, month: 11, day: 10, isLeapMonth: false },
    yearStem: "甲",
    yearBranch: "午",
    monthStem: "丙", 
    monthBranch: "子", 
    monthPillar: "丙子",
    solarTerm: null
  },
  
  // 月柱計算サンプル
  { 
    solarDate: "2023-02-03", 
    lunarDate: { year: 2023, month: 1, day: 12, isLeapMonth: false },
    yearStem: "癸",
    yearBranch: "卯",
    monthStem: "癸", 
    monthBranch: "丑", 
    monthPillar: "癸丑",
    solarTerm: null,
    note: "節分前"
  },
  { 
    solarDate: "2023-02-04", 
    lunarDate: { year: 2023, month: 1, day: 13, isLeapMonth: false },
    yearStem: "癸",
    yearBranch: "卯",
    monthStem: "甲", 
    monthBranch: "寅", 
    monthPillar: "甲寅",
    solarTerm: "立春",
    note: "立春"
  },
  { 
    solarDate: "2023-05-05", 
    lunarDate: { year: 2023, month: 3, day: 15, isLeapMonth: false },
    yearStem: "癸",
    yearBranch: "卯",
    monthStem: "丙", 
    monthBranch: "辰", 
    monthPillar: "丙辰",
    solarTerm: "立夏",
    note: "立夏頃"
  },
  { 
    solarDate: "2023-06-19", 
    lunarDate: { year: 2023, month: 5, day: 1, isLeapMonth: true },
    yearStem: "癸",
    yearBranch: "卯",
    monthStem: "戊", 
    monthBranch: "午", 
    monthPillar: "戊午",
    solarTerm: null,
    note: "旧暦閏5月"
  },
  { 
    solarDate: "2023-07-19", 
    lunarDate: { year: 2023, month: 6, day: 1, isLeapMonth: false },
    yearStem: "癸",
    yearBranch: "卯",
    monthStem: "己", 
    monthBranch: "未", 
    monthPillar: "己未",
    solarTerm: null,
    note: "閏月の翌月"
  },
  { 
    solarDate: "2023-08-07", 
    lunarDate: { year: 2023, month: 6, day: 20, isLeapMonth: false },
    yearStem: "癸",
    yearBranch: "卯",
    monthStem: "己", 
    monthBranch: "未", 
    monthPillar: "己未",
    solarTerm: "立秋",
    note: "立秋前後"
  },
  { 
    solarDate: "2023-10-01", 
    lunarDate: { year: 2023, month: 8, day: 16, isLeapMonth: false },
    yearStem: "癸",
    yearBranch: "卯",
    monthStem: "辛", 
    monthBranch: "酉", 
    monthPillar: "辛酉",
    solarTerm: "寒露",
    note: "寒露頃"
  },
  { 
    solarDate: "2023-10-15", 
    lunarDate: { year: 2023, month: 9, day: 1, isLeapMonth: false },
    yearStem: "癸",
    yearBranch: "卯",
    monthStem: "壬", 
    monthBranch: "戌", 
    monthPillar: "壬戌",
    solarTerm: null,
    note: "10月中旬"
  },
  { 
    solarDate: "2023-11-07", 
    lunarDate: { year: 2023, month: 9, day: 23, isLeapMonth: false },
    yearStem: "癸",
    yearBranch: "卯",
    monthStem: "壬", 
    monthBranch: "戌", 
    monthPillar: "壬戌",
    solarTerm: "立冬",
    note: "立冬前後"
  },
  { 
    solarDate: "2023-12-21", 
    lunarDate: { year: 2023, month: 11, day: 8, isLeapMonth: false },
    yearStem: "癸",
    yearBranch: "卯",
    monthStem: "甲", 
    monthBranch: "子", 
    monthPillar: "甲子",
    solarTerm: "冬至",
    note: "冬至"
  },
  
  // 1986年のサンプル
  { 
    solarDate: "1986-05-26", 
    lunarDate: { year: 1986, month: 4, day: 18, isLeapMonth: false },
    yearStem: "丙",
    yearBranch: "寅",
    monthStem: "癸", 
    monthBranch: "巳", 
    monthPillar: "癸巳",
    solarTerm: null,
    note: "5月後半"
  },
  
  // 1990年のサンプル
  { 
    solarDate: "1990-05-15", 
    lunarDate: { year: 1990, month: 4, day: 21, isLeapMonth: false },
    yearStem: "庚",
    yearBranch: "午",
    monthStem: "辛", 
    monthBranch: "巳", 
    monthPillar: "辛巳",
    solarTerm: null,
    note: "5月中旬"
  },
  
  // 2024年のサンプル
  { 
    solarDate: "2024-02-04", 
    lunarDate: { year: 2024, month: 1, day: 13, isLeapMonth: false },
    yearStem: "甲",
    yearBranch: "辰",
    monthStem: "乙", 
    monthBranch: "丑", 
    monthPillar: "乙丑",
    solarTerm: "立春",
    note: "立春"
  }
];

/**
 * 旧暦月と月柱の関係を分析
 */
function analyzeLunarMonthToMonthPillar() {
  // 旧暦月ごとの月柱データを集計
  const lunarMonthData = {};
  
  // 年干ごとの月柱パターンを集計
  const yearStemPatterns = {};
  
  // 節気ごとの月柱データを集計
  const solarTermData = {};
  
  // データ分析
  SAMPLE_DATA.forEach(sample => {
    const { lunarDate, monthPillar, yearStem, solarTerm } = sample;
    const lunarMonthKey = `${lunarDate.year}-${lunarDate.month}${lunarDate.isLeapMonth ? '閏' : ''}`;
    
    // 旧暦月ごとの集計
    if (!lunarMonthData[lunarMonthKey]) {
      lunarMonthData[lunarMonthKey] = [];
    }
    lunarMonthData[lunarMonthKey].push({
      solarDate: sample.solarDate,
      monthPillar,
      yearStem,
      solarTerm,
      note: sample.note
    });
    
    // 年干ごとのパターン集計
    if (!yearStemPatterns[yearStem]) {
      yearStemPatterns[yearStem] = {};
    }
    const lunarMonth = lunarDate.month;
    if (!yearStemPatterns[yearStem][lunarMonth]) {
      yearStemPatterns[yearStem][lunarMonth] = [];
    }
    yearStemPatterns[yearStem][lunarMonth].push({
      solarDate: sample.solarDate,
      monthPillar,
      solarTerm,
      note: sample.note
    });
    
    // 節気ごとの集計
    if (solarTerm) {
      if (!solarTermData[solarTerm]) {
        solarTermData[solarTerm] = [];
      }
      solarTermData[solarTerm].push({
        solarDate: sample.solarDate,
        yearStem,
        monthPillar,
        lunarMonth: lunarDate.month,
        note: sample.note
      });
    }
  });
  
  return {
    lunarMonthData,
    yearStemPatterns,
    solarTermData
  };
}

/**
 * 規則性を見出すためのパターン分析
 */
function findMonthPillarPatterns() {
  const analysisResults = analyzeLunarMonthToMonthPillar();
  
  console.log("===== 旧暦月と月柱の対応分析 =====");
  
  // 1. 旧暦月ごとの月柱
  console.log("\n【旧暦月ごとの月柱】");
  Object.entries(analysisResults.lunarMonthData).forEach(([lunarMonth, entries]) => {
    console.log(`旧暦月: ${lunarMonth}`);
    entries.forEach(entry => {
      console.log(`  ${entry.solarDate} | 年干: ${entry.yearStem} | 月柱: ${entry.monthPillar} | 節気: ${entry.solarTerm || '無し'} | ${entry.note || ''}`);
    });
  });
  
  // 2. 年干ごとの月柱パターン
  console.log("\n【年干ごとの月柱パターン】");
  Object.entries(analysisResults.yearStemPatterns).forEach(([yearStem, monthData]) => {
    console.log(`年干: ${yearStem}`);
    Object.entries(monthData).forEach(([lunarMonth, entries]) => {
      console.log(`  旧暦${lunarMonth}月:`);
      entries.forEach(entry => {
        console.log(`    ${entry.solarDate} | 月柱: ${entry.monthPillar} | 節気: ${entry.solarTerm || '無し'} | ${entry.note || ''}`);
      });
    });
  });
  
  // 3. 節気と月柱の関係
  console.log("\n【節気と月柱の関係】");
  Object.entries(analysisResults.solarTermData).forEach(([solarTerm, entries]) => {
    console.log(`節気: ${solarTerm}`);
    entries.forEach(entry => {
      console.log(`  ${entry.solarDate} | 年干: ${entry.yearStem} | 月柱: ${entry.monthPillar} | 旧暦月: ${entry.lunarMonth} | ${entry.note || ''}`);
    });
  });
  
  // 4. 年干と月干の関係性分析
  console.log("\n【年干と月干の関係性分析】");
  analyzeYearStemToMonthStem();
  
  // 5. 旧暦月と月支の関係性分析
  console.log("\n【旧暦月と月支の関係性分析】");
  analyzeLunarMonthToBranch();
  
  // 6. 節気による月柱の変化
  console.log("\n【節気による月柱の変化】");
  analyzeSolarTermTransitions();
  
  return analysisResults;
}

/**
 * 年干と月干の関係性を分析
 */
function analyzeYearStemToMonthStem() {
  // 年干ごとの月干パターンを分析
  const yearStemToMonthStem = {};
  
  SAMPLE_DATA.forEach(sample => {
    const { yearStem, monthStem, lunarDate, solarTerm } = sample;
    
    if (!yearStemToMonthStem[yearStem]) {
      yearStemToMonthStem[yearStem] = {};
    }
    
    const lunarMonth = lunarDate.month;
    if (!yearStemToMonthStem[yearStem][lunarMonth]) {
      yearStemToMonthStem[yearStem][lunarMonth] = [];
    }
    
    yearStemToMonthStem[yearStem][lunarMonth].push({
      monthStem,
      solarDate: sample.solarDate,
      solarTerm,
      note: sample.note
    });
  });
  
  // パターンを出力
  Object.entries(yearStemToMonthStem).forEach(([yearStem, monthData]) => {
    console.log(`年干: ${yearStem}`);
    Object.entries(monthData).forEach(([lunarMonth, entries]) => {
      const monthStems = entries.map(e => e.monthStem);
      const uniqueStems = [...new Set(monthStems)];
      
      if (uniqueStems.length === 1) {
        console.log(`  旧暦${lunarMonth}月 => 月干: ${uniqueStems[0]} (固定)`);
      } else {
        console.log(`  旧暦${lunarMonth}月 => 月干: ${uniqueStems.join('/')} (変動)`);
        entries.forEach(entry => {
          console.log(`    ${entry.solarDate} | 月干: ${entry.monthStem} | 節気: ${entry.solarTerm || '無し'} | ${entry.note || ''}`);
        });
      }
    });
  });
  
  // 年干から月干へのマッピング規則を推測
  console.log("\n【年干から月干への変換規則】");
  inferYearStemToMonthStemRules();
}

/**
 * 旧暦月と月支の関係性を分析
 */
function analyzeLunarMonthToBranch() {
  // 旧暦月ごとの月支を分析
  const lunarMonthToBranch = {};
  
  SAMPLE_DATA.forEach(sample => {
    const { lunarDate, monthBranch, solarTerm } = sample;
    const lunarMonth = lunarDate.month;
    
    if (!lunarMonthToBranch[lunarMonth]) {
      lunarMonthToBranch[lunarMonth] = [];
    }
    
    lunarMonthToBranch[lunarMonth].push({
      monthBranch,
      solarDate: sample.solarDate,
      solarTerm,
      note: sample.note
    });
  });
  
  // パターンを出力
  Object.entries(lunarMonthToBranch).forEach(([lunarMonth, entries]) => {
    const branches = entries.map(e => e.monthBranch);
    const uniqueBranches = [...new Set(branches)];
    
    if (uniqueBranches.length === 1) {
      console.log(`旧暦${lunarMonth}月 => 月支: ${uniqueBranches[0]} (固定)`);
    } else {
      console.log(`旧暦${lunarMonth}月 => 月支: ${uniqueBranches.join('/')} (変動)`);
      entries.forEach(entry => {
        console.log(`  ${entry.solarDate} | 月支: ${entry.monthBranch} | 節気: ${entry.solarTerm || '無し'} | ${entry.note || ''}`);
      });
    }
  });
  
  // 旧暦月から月支へのマッピング規則を推測
  console.log("\n【旧暦月から月支への変換規則】");
  inferLunarMonthToBranchRules();
}

/**
 * 節気による月柱の変化を分析
 */
function analyzeSolarTermTransitions() {
  // 節気の前後での月柱変化を調査
  const transitionData = {};
  
  // 節気日を取得
  const solarTermDates = SAMPLE_DATA.filter(s => s.solarTerm).map(s => ({
    date: s.solarDate,
    term: s.solarTerm,
    yearStem: s.yearStem,
    beforePillar: null,
    afterPillar: s.monthPillar
  }));
  
  // 前日と翌日の月柱を確認（実際のデータでは厳密な前後関係の確認が必要）
  solarTermDates.forEach(termData => {
    // 前日の月柱を見つける（実際のデータではもっと詳細な検索が必要）
    const [year, month, day] = termData.date.split('-').map(Number);
    const prevDateStr = `${year}-${month.toString().padStart(2, '0')}-${(day-1).toString().padStart(2, '0')}`;
    
    const prevDayData = SAMPLE_DATA.find(s => s.solarDate === prevDateStr);
    if (prevDayData) {
      termData.beforePillar = prevDayData.monthPillar;
    }
    
    transitionData[termData.term] = termData;
  });
  
  // 結果出力
  Object.values(transitionData).forEach(data => {
    console.log(`節気: ${data.term} (${data.date}), 年干: ${data.yearStem}`);
    console.log(`  変化: ${data.beforePillar || '不明'} → ${data.afterPillar}`);
  });
}

/**
 * 年干から月干への変換規則を推測
 */
function inferYearStemToMonthStemRules() {
  const years = SAMPLE_DATA.map(s => ({ 
    yearStem: s.yearStem, 
    monthStem: s.monthStem, 
    lunarMonth: s.lunarDate.month 
  }));
  
  // 特定の年干ごとに、各旧暦月の月干パターンを分析
  const patterns = {};
  
  years.forEach(data => {
    if (!patterns[data.yearStem]) {
      patterns[data.yearStem] = {};
    }
    if (!patterns[data.yearStem][data.lunarMonth]) {
      patterns[data.yearStem][data.lunarMonth] = new Set();
    }
    patterns[data.yearStem][data.lunarMonth].add(data.monthStem);
  });
  
  // 推測された変換パターンを出力
  console.log("推測される年干→月干変換規則:");
  
  Object.entries(patterns).forEach(([yearStem, monthData]) => {
    console.log(`年干: ${yearStem}`);
    
    // 各月の開始インデックス推測
    const monthStems = {};
    Object.entries(monthData).forEach(([month, stems]) => {
      monthStems[month] = Array.from(stems)[0]; // 最初の要素を代表値として
    });
    
    // 連続する月を検査
    const months = Object.keys(monthStems).sort((a, b) => a - b);
    const diffs = [];
    for (let i = 1; i < months.length; i++) {
      const prevMonth = months[i-1];
      const currMonth = months[i];
      const prevStem = monthStems[prevMonth];
      const currStem = monthStems[currMonth];
      
      const prevIdx = STEMS.indexOf(prevStem);
      const currIdx = STEMS.indexOf(currStem);
      
      // 干の差分（循環を考慮）
      let diff = (currIdx - prevIdx + 10) % 10;
      diffs.push(diff);
    }
    
    // 最も頻繁に出現する差分を検出
    const diffCounts = {};
    diffs.forEach(d => {
      diffCounts[d] = (diffCounts[d] || 0) + 1;
    });
    
    const mostCommonDiff = Object.entries(diffCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([diff]) => diff)[0];
    
    console.log(`  月間差分: ${mostCommonDiff} (月ごとに天干が${mostCommonDiff}ずつ増加する傾向)`);
    
    // 基準となる月干を推測
    if (months.length > 0) {
      const firstMonth = months[0];
      const firstStem = monthStems[firstMonth];
      const baseIndex = (STEMS.indexOf(firstStem) - ((firstMonth - 1) * parseInt(mostCommonDiff)) + 10) % 10;
      
      console.log(`  推測される基準天干: ${STEMS[baseIndex]} (1月の場合)`);
    }
  });
}

/**
 * 旧暦月から月支への変換規則を推測
 */
function inferLunarMonthToBranchRules() {
  console.log("推測される旧暦月→月支変換規則:");
  
  // 旧暦月と月支の対応表を作成
  const monthToBranch = {};
  
  SAMPLE_DATA.forEach(sample => {
    const lunarMonth = sample.lunarDate.month;
    if (!monthToBranch[lunarMonth]) {
      monthToBranch[lunarMonth] = new Set();
    }
    monthToBranch[lunarMonth].add(sample.monthBranch);
  });
  
  // 結果を確認
  const entries = Object.entries(monthToBranch)
    .sort((a, b) => a[0] - b[0])
    .map(([month, branches]) => {
      const branchList = Array.from(branches);
      // 最も頻繁な支を代表値とする
      const mainBranch = branchList.length === 1 ? branchList[0] : branchList[0];
      return { month: parseInt(month), branch: mainBranch };
    });
  
  // 月と支の対応パターンを検出
  if (entries.length >= 2) {
    const firstMonth = entries[0].month;
    const firstBranch = entries[0].branch;
    const firstIdx = BRANCHES.indexOf(firstBranch);
    
    const pattern = entries.map(({ month, branch }) => {
      const branchIdx = BRANCHES.indexOf(branch);
      const expectedIdx = (firstIdx + (month - firstMonth)) % 12;
      return { 
        month, 
        branch, 
        expected: BRANCHES[expectedIdx],
        isMatching: branch === BRANCHES[expectedIdx]
      };
    });
    
    // パターン表示
    console.log("旧暦月と月支の対応パターン:");
    pattern.forEach(p => {
      console.log(`  旧暦${p.month}月 => ${p.branch} ${p.isMatching ? '✓' : '✗'} (期待値: ${p.expected})`);
    });
    
    // 正規パターン検出
    const matchCount = pattern.filter(p => p.isMatching).length;
    const matchRate = (matchCount / pattern.length) * 100;
    
    console.log(`\n正規パターン一致率: ${matchRate.toFixed(1)}% (${matchCount}/${pattern.length})`);
    
    if (matchRate >= 80) {
      // 基本公式を推測
      const formula = `月支 = 地支[旧暦月 + ${(firstIdx - firstMonth + 12) % 12}]`;
      console.log(`推測される基本公式: ${formula}`);
    } else {
      console.log("正規パターンが検出できませんでした。特殊ルールが必要です。");
    }
  } else {
    console.log("データ不足のため規則性を推測できません。");
  }
}

// 分析実行
findMonthPillarPatterns();
console.log("\n===== 基本公式検証 =====");
console.log("月干公式: v ≡ (2y + m + 3) mod 10");
console.log("月支公式: u ≡ (m + 1) mod 12");
console.log("\n各サンプルでの基本公式精度:");

// 基本公式の検証
SAMPLE_DATA.forEach(sample => {
  const year = parseInt(sample.solarDate.split('-')[0]);
  const month = parseInt(sample.solarDate.split('-')[1]);
  
  // 月干計算（v ≡ (2y + m + 3) mod 10）
  const v = (2 * year + month + 3) % 10;
  const stemIndex = v === 0 ? 9 : v - 1;
  
  // 月支計算（u ≡ (m + 1) mod 12）
  const u = (month + 1) % 12;
  const branchIndex = u === 0 ? 11 : u - 1;
  
  const calculatedStem = STEMS[stemIndex];
  const calculatedBranch = BRANCHES[branchIndex];
  const calculatedPillar = `${calculatedStem}${calculatedBranch}`;
  
  const stemMatches = calculatedStem === sample.monthStem;
  const branchMatches = calculatedBranch === sample.monthBranch;
  const pillarMatches = calculatedPillar === sample.monthPillar;
  
  console.log(`${sample.solarDate} (${sample.yearStem}年): ${calculatedPillar} ${pillarMatches ? '✓' : '✗'} (期待値: ${sample.monthPillar})`);
});

// モジュールエクスポート
module.exports = {
  SAMPLE_DATA,
  findMonthPillarPatterns,
  analyzeLunarMonthToMonthPillar
};

// 直接実行される場合のみ分析を実行
if (require.main === module) {
  // すでに分析を実行済み
}