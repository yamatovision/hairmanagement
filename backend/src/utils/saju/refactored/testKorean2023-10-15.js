/**
 * 韓国式四柱推命 - 2023年10月15日の計算テスト
 */

// 天干と地支の配列
const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

/**
 * 韓国式月柱計算 - 純粋理論アルゴリズム
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
    calculation: `月干: (2×${year} + ${month} + 3) % 10 = ${v} → ${stem}, 月支: (${month}+1) % 12 = ${u} → ${branch}`
  };
}

/**
 * 韓国式月柱計算 - 年干に基づく調整アルゴリズム
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
    calculation: `月干基準値: ${yearStem}年 → ${monthStemBase}, 月干: (${monthStemBase} + (${month}-1)*2) % 10 = ${monthStemIndex} → ${stem}, 月支: (${month}+1) % 12 = ${monthBranchIndex} → ${branch}`
  };
}

/**
 * 韓国式年柱計算
 * @param date 日付
 * @returns 年柱情報
 */
function calculateYearPillar(date) {
  const year = date.getFullYear();
  
  // 年干計算（year + 6) % 10）
  const yearStemIndex = (year + 6) % 10;
  const yearStem = STEMS[yearStemIndex];
  
  // 年支計算（(year + 8) % 12）
  const yearBranchIndex = (year + 8) % 12;
  const yearBranch = BRANCHES[yearBranchIndex];
  
  return {
    stem: yearStem,
    branch: yearBranch,
    fullStemBranch: `${yearStem}${yearBranch}`,
    calculation: `年干: (${year} + 6) % 10 = ${yearStemIndex} → ${yearStem}, 年支: (${year} + 8) % 12 = ${yearBranchIndex} → ${yearBranch}`
  };
}

/**
 * 特定の日付の四柱計算（年柱・月柱のみ）
 * @param date 日付
 */
function calculateFourPillars(date) {
  console.log(`===== ${date.toISOString()} の四柱推命計算 =====`);
  
  // 年柱計算
  const yearPillar = calculateYearPillar(date);
  console.log('【年柱】');
  console.log(`- 結果: ${yearPillar.fullStemBranch}`);
  console.log(`- 計算: ${yearPillar.calculation}`);
  
  // 月柱計算 - 基本公式
  const basicMonthPillar = calculateBasicMonthPillar(date);
  console.log('\n【月柱 - 基本公式】');
  console.log(`- 結果: ${basicMonthPillar.fullStemBranch}`);
  console.log(`- 計算: ${basicMonthPillar.calculation}`);
  
  // 月柱計算 - 調整公式（年干基準）
  const adjustedMonthPillar = calculateAdjustedMonthPillar(date, yearPillar.stem);
  console.log('\n【月柱 - 調整公式】');
  console.log(`- 結果: ${adjustedMonthPillar.fullStemBranch}`);
  console.log(`- 計算: ${adjustedMonthPillar.calculation}`);
  
  // サンプルデータでは壬戌が正解
  console.log('\n【実際の期待値】');
  console.log('- 結果: 壬戌');
  if (adjustedMonthPillar.fullStemBranch === '壬戌') {
    console.log('- 調整公式と一致');
  } else if (basicMonthPillar.fullStemBranch === '壬戌') {
    console.log('- 基本公式と一致');
  } else {
    console.log('- どちらの公式とも不一致（特殊ケース）');
  }
}

// 2023年10月15日12:00の計算
const date = new Date(2023, 9, 15, 12, 0);
calculateFourPillars(date);