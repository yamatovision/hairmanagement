/**
 * 四柱推命計算の数学的パターン分析・実装
 * 専門書から抽出された数学的アルゴリズムに基づく実装
 */

// 基本定数
const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

/**
 * 年干から月干の基準インデックスを計算する（×2ルール）
 * @param {string} yearStem 年干
 * @returns {number} 月干の基準インデックス（0-9）
 */
function getMonthStemBaseIndex(yearStem) {
  const yearStemIndex = STEMS.indexOf(yearStem);
  // 重要な発見: ×2ルール - 年干インデックスの2倍が月干の基準値
  return (yearStemIndex * 2) % 10;
}

/**
 * 月柱の天干を計算する
 * @param {string} yearStem 年干
 * @param {number} month 月（1-12）
 * @returns {string} 月干
 */
function calculateMonthStem(yearStem, month) {
  // 1. 年干から月干の基準インデックスを計算（×2ルール）
  const monthStemBase = getMonthStemBaseIndex(yearStem);
  
  // 2. 月干のインデックスを計算（月ごとに2ずつ増加、10で循環）
  const monthStemIndex = (monthStemBase + ((month - 1) * 2) % 10) % 10;
  
  // 3. 月干を返す
  return STEMS[monthStemIndex];
}

/**
 * 日干から時干の基準インデックスを計算する（×2ルール）
 * @param {string} dayStem 日干
 * @returns {number} 時干の基準インデックス（0-9）
 */
function getHourStemBaseIndex(dayStem) {
  const dayStemIndex = STEMS.indexOf(dayStem);
  // 重要な発見: ×2ルール - 日干インデックスの2倍が時干の基準値
  return (dayStemIndex * 2) % 10;
}

/**
 * 時柱の天干を計算する
 * @param {string} dayStem 日干
 * @param {number} hour 時間（0-23）
 * @returns {string} 時干
 */
function calculateHourStem(dayStem, hour) {
  // 1. 時刻に対応する地支（時辰）のインデックスを取得
  const hourBranchIndex = getHourBranchIndex(hour);
  
  // 2. 日干から時干の基準インデックスを計算（×2ルール）
  const hourStemBase = getHourStemBaseIndex(dayStem);
  
  // 3. 時干のインデックスを計算
  const hourStemIndex = (hourStemBase + hourBranchIndex) % 10;
  
  // 4. 時干を返す
  return STEMS[hourStemIndex];
}

/**
 * 時間から時辰（地支）のインデックスを取得
 * @param {number} hour 時間（0-23）
 * @returns {number} 地支のインデックス（0-11）
 */
function getHourBranchIndex(hour) {
  // 2時間ごとの時辰マッピング
  if (hour >= 23 || hour < 1) return 0;  // 子 (23-1時)
  if (hour >= 1 && hour < 3) return 1;   // 丑 (1-3時)
  if (hour >= 3 && hour < 5) return 2;   // 寅 (3-5時)
  if (hour >= 5 && hour < 7) return 3;   // 卯 (5-7時)
  if (hour >= 7 && hour < 9) return 4;   // 辰 (7-9時)
  if (hour >= 9 && hour < 11) return 5;  // 巳 (9-11時)
  if (hour >= 11 && hour < 13) return 6; // 午 (11-13時)
  if (hour >= 13 && hour < 15) return 7; // 未 (13-15時)
  if (hour >= 15 && hour < 17) return 8; // 申 (15-17時)
  if (hour >= 17 && hour < 19) return 9; // 酉 (17-19時)
  if (hour >= 19 && hour < 21) return 10;// 戌 (19-21時)
  return 11; // 亥 (21-23時)
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
 * 四柱推命の計算パターンをテスト
 */
function testPillarCalculations() {
  console.log("===== 四柱推命の数学的パターン検証 =====");
  
  // 1. 年干と月干の関係検証（×2ルール）
  console.log("\n1. 年干から月干への基準値計算（×2ルール）:");
  STEMS.forEach(yearStem => {
    const yearStemIndex = STEMS.indexOf(yearStem);
    const monthStemBase = getMonthStemBaseIndex(yearStem);
    const baseStem = STEMS[monthStemBase];
    console.log(`  年干: ${yearStem}(${yearStemIndex}) → 月干基準値: ${baseStem}(${monthStemBase}) [${yearStemIndex} × 2 = ${yearStemIndex * 2} % 10 = ${monthStemBase}]`);
  });
  
  // 2. 年干別の月干の変化パターン
  console.log("\n2. 年干別の月干の変化パターン:");
  // 3つの代表的な年干で検証
  ["甲", "乙", "丙"].forEach(yearStem => {
    console.log(`  ${yearStem}年の月干変化:`);
    for (let month = 1; month <= 12; month++) {
      const monthStem = calculateMonthStem(yearStem, month);
      const monthBranchIndex = getMonthBranchIndex(month);
      const monthBranch = BRANCHES[monthBranchIndex];
      console.log(`    ${month}月: ${monthStem}${monthBranch}`);
    }
  });
  
  // 3. 日干と時干の関係検証（×2ルール）
  console.log("\n3. 日干から時干への基準値計算（×2ルール）:");
  STEMS.forEach(dayStem => {
    const dayStemIndex = STEMS.indexOf(dayStem);
    const hourStemBase = getHourStemBaseIndex(dayStem);
    const baseStem = STEMS[hourStemBase];
    console.log(`  日干: ${dayStem}(${dayStemIndex}) → 時干基準値: ${baseStem}(${hourStemBase}) [${dayStemIndex} × 2 = ${dayStemIndex * 2} % 10 = ${hourStemBase}]`);
  });
  
  // 4. 日干別の時干の変化パターン
  console.log("\n4. 日干別の時干の変化パターン:");
  // 3つの代表的な日干で検証
  ["甲", "乙", "丙"].forEach(dayStem => {
    console.log(`  ${dayStem}日の時干変化:`);
    // 代表的な時間帯で検証
    [0, 3, 6, 9, 12, 15, 18, 21].forEach(hour => {
      const hourStem = calculateHourStem(dayStem, hour);
      const hourBranchIndex = getHourBranchIndex(hour);
      const hourBranch = BRANCHES[hourBranchIndex];
      console.log(`    ${hour}時: ${hourStem}${hourBranch}`);
    });
  });
  
  // 5. 実際の日時での検証
  console.log("\n5. 実際の日時での四柱検証:");
  const testCases = [
    { date: "2023年10月15日12時", yearStem: "癸", month: 10, dayStem: "丙", hour: 12 },
    { date: "1986年5月26日5時", yearStem: "丙", month: 5, dayStem: "庚", hour: 5 }
  ];
  
  testCases.forEach(({ date, yearStem, month, dayStem, hour }) => {
    const monthStem = calculateMonthStem(yearStem, month);
    const monthBranchIndex = getMonthBranchIndex(month);
    const monthBranch = BRANCHES[monthBranchIndex];
    
    const hourStem = calculateHourStem(dayStem, hour);
    const hourBranchIndex = getHourBranchIndex(hour);
    const hourBranch = BRANCHES[hourBranchIndex];
    
    console.log(`  ${date}の計算結果:`);
    console.log(`    年柱: ${yearStem}${BRANCHES[STEMS.indexOf(yearStem) % 12]}`);
    console.log(`    月柱: ${monthStem}${monthBranch}`);
    console.log(`    日柱: ${dayStem}${BRANCHES[STEMS.indexOf(dayStem) % 12]}`);
    console.log(`    時柱: ${hourStem}${hourBranch}`);
  });
}

// テスト実行
testPillarCalculations();

// モジュールのエクスポート
module.exports = {
  getMonthStemBaseIndex,
  calculateMonthStem,
  getHourStemBaseIndex,
  calculateHourStem,
  getHourBranchIndex,
  getMonthBranchIndex
};