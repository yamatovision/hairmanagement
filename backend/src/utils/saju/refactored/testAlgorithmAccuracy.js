/**
 * 韓国式四柱推命 - 月柱計算アルゴリズムの精度検証
 * ハードコードなしの純粋なアルゴリズムのみで全テストケースを検証
 */

// 天干と地支の配列
const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

// すべてのテストケース（ハードコードから抽出）
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
 * 基本公式に基づく韓国式月柱計算
 * @param date 日付
 * @returns 月柱情報
 */
function calculateBasicMonthPillar(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  // 月干計算（v ≡ (2y + m + 3) mod 10）
  const v = (2 * year + month + 3) % 10;
  const monthStemIndex = v === 0 ? 9 : v - 1; // インデックスは0始まりなので調整
  
  // 月支計算（u ≡ (m + 1) mod 12）
  const u = (month + 1) % 12;
  const monthBranchIndex = u === 0 ? 11 : u - 1; // インデックスは0始まりなので調整
  
  const stem = STEMS[monthStemIndex];
  const branch = BRANCHES[monthBranchIndex];
  
  return {
    stem,
    branch,
    fullStemBranch: `${stem}${branch}`,
    algorithm: "basic_formula"
  };
}

/**
 * 年干に基づく調整アルゴリズム
 * @param date 日付
 * @param yearStem 年干
 * @returns 月柱情報
 */
function calculateAdjustedMonthPillar(date, yearStem) {
  const month = date.getMonth() + 1;
  
  // 年干による月干の基準インデックスを決定
  let monthStemBase;
  switch (yearStem) {
    case "甲":
    case "己":
      monthStemBase = 2; // 丙
      break;
    case "乙":
    case "庚":
      monthStemBase = 4; // 戊
      break;
    case "丙":
    case "辛":
      monthStemBase = 6; // 庚
      break;
    case "丁":
    case "壬":
      monthStemBase = 8; // 壬
      break;
    case "戊":
    case "癸":
    default:
      monthStemBase = 0; // 甲
      break;
  }
  
  // 月干インデックスを計算（月ごとに2ずつ増加、10で循環）
  const monthStemIndex = (monthStemBase + ((month - 1) * 2) % 10) % 10;
  
  // 月支インデックスを計算（寅月=1から始まる）
  const monthBranchIndex = (month + 1) % 12;
  
  // 天干地支を取得
  const stem = STEMS[monthStemIndex];
  const branch = BRANCHES[monthBranchIndex];
  
  return {
    stem,
    branch,
    fullStemBranch: `${stem}${branch}`,
    algorithm: "adjusted_formula"
  };
}

/**
 * 韓国式年柱計算
 * @param date 日付
 * @returns 年柱情報 (年干のみ)
 */
function calculateYearStem(date) {
  const year = date.getFullYear();
  
  // 年干計算（year + 6) % 10）
  const yearStemIndex = (year + 6) % 10;
  return STEMS[yearStemIndex];
}

/**
 * すべてのアルゴリズムでテストケースを検証
 */
function testAllAlgorithms() {
  console.log('===== 韓国式月柱計算の各アルゴリズム精度検証 =====\n');

  // 各テストケースを検証
  const results = {
    basic: { correct: 0, total: 0, correctCases: [] },
    adjusted: { correct: 0, total: 0, correctCases: [] }
  };
  
  Object.entries(TEST_CASES).forEach(([dateStr, expectedValue]) => {
    // 日付解析
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    // 年干を計算
    const yearStem = calculateYearStem(date);
    
    // 1. 基本公式
    const basicResult = calculateBasicMonthPillar(date);
    const basicSuccess = basicResult.fullStemBranch === expectedValue;
    if (basicSuccess) {
      results.basic.correct++;
      results.basic.correctCases.push(dateStr);
    }
    results.basic.total++;
    
    // 2. 調整公式
    const adjustedResult = calculateAdjustedMonthPillar(date, yearStem);
    const adjustedSuccess = adjustedResult.fullStemBranch === expectedValue;
    if (adjustedSuccess) {
      results.adjusted.correct++;
      results.adjusted.correctCases.push(dateStr);
    }
    results.adjusted.total++;
    
    // 結果表示
    const basicMark = basicSuccess ? '✓' : '✗';
    const adjustedMark = adjustedSuccess ? '✓' : '✗';
    
    console.log(`${dateStr} (${yearStem}年): 期待値[${expectedValue}]`);
    console.log(`  基本公式: ${basicMark} ${basicResult.fullStemBranch}`);
    console.log(`  調整公式: ${adjustedMark} ${adjustedResult.fullStemBranch}`);
    console.log('');
  });
  
  // 最終結果
  const basicRate = Math.round(results.basic.correct / results.basic.total * 100);
  const adjustedRate = Math.round(results.adjusted.correct / results.adjusted.total * 100);
  
  console.log('\n===== 精度集計 =====');
  console.log(`基本公式: ${results.basic.correct}/${results.basic.total} 正解 (${basicRate}%)`);
  console.log(`調整公式: ${results.adjusted.correct}/${results.adjusted.total} 正解 (${adjustedRate}%)`);
  
  // 正解したケースの詳細
  console.log('\n【基本公式で正解したケース】');
  console.log(results.basic.correctCases.join(', '));
  
  console.log('\n【調整公式で正解したケース】');
  console.log(results.adjusted.correctCases.join(', '));
  
  // 両方とも正解できないケース
  const bothFailCases = Object.keys(TEST_CASES).filter(
    dateStr => !results.basic.correctCases.includes(dateStr) && 
              !results.adjusted.correctCases.includes(dateStr)
  );
  
  console.log('\n【両方の公式で不正解のケース】');
  console.log(bothFailCases.join(', '));
  
  // アルゴリズムの説明
  console.log('\n===== アルゴリズム解説 =====');
  console.log('【基本公式】');
  console.log('- 月干: v ≡ (2y + m + 3) mod 10');
  console.log('- 月支: u ≡ (m + 1) mod 12');
  
  console.log('\n【調整公式】');
  console.log('- 年干ごとの月干基準値:');
  console.log('  甲己年: 丙(2), 乙庚年: 戊(4), 丙辛年: 庚(6), 丁壬年: 壬(8), 戊癸年: 甲(0)');
  console.log('- 月干計算: (基準値 + (月-1)*2) % 10');
  console.log('- 月支計算: (月+1) % 12');
  
  return results;
}

// テスト実行
testAllAlgorithms();