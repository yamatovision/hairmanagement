/**
 * 四柱推命表の分析
 * 年干支と月干支の関係性を分析するスクリプト
 */

// 表から抽出した情報
// 年干（甲～癸）ごとの月干支表
// 各配列は1月～12月の月干支を表す

// 天干（干）の配列
const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];

// 地支（支）の配列
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

// 画像から抽出した表データ
// 縦：年干/月、横：各月の天干地支
const YEAR_STEM_MONTH_PILLAR_MAP = {
  // 甲年の月干支（1月～12月）
  "甲": [
    "丙寅", "丁卯", "戊辰", "己巳", "庚午", "辛未", 
    "壬申", "癸酉", "甲戌", "乙亥", "丙子", "丁丑"
  ],
  
  // 乙年の月干支
  "乙": [
    "戊寅", "己卯", "庚辰", "辛巳", "壬午", "癸未", 
    "甲申", "乙酉", "丙戌", "丁亥", "戊子", "己丑"
  ],
  
  // 丙年の月干支
  "丙": [
    "庚寅", "辛卯", "壬辰", "癸巳", "甲午", "乙未", 
    "丙申", "丁酉", "戊戌", "己亥", "庚子", "辛丑"
  ],
  
  // 丁年の月干支
  "丁": [
    "壬寅", "癸卯", "甲辰", "乙巳", "丙午", "丁未", 
    "戊申", "己酉", "庚戌", "辛亥", "壬子", "癸丑"
  ],
  
  // 戊年の月干支
  "戊": [
    "甲寅", "乙卯", "丙辰", "丁巳", "戊午", "己未", 
    "庚申", "辛酉", "壬戌", "癸亥", "甲子", "乙丑"
  ],
  
  // 己年の月干支
  "己": [
    "丙寅", "丁卯", "戊辰", "己巳", "庚午", "辛未", 
    "壬申", "癸酉", "甲戌", "乙亥", "丙子", "丁丑"
  ],
  
  // 庚年の月干支
  "庚": [
    "戊寅", "己卯", "庚辰", "辛巳", "壬午", "癸未", 
    "甲申", "乙酉", "丙戌", "丁亥", "戊子", "己丑"
  ],
  
  // 辛年の月干支
  "辛": [
    "庚寅", "辛卯", "壬辰", "癸巳", "甲午", "乙未", 
    "丙申", "丁酉", "戊戌", "己亥", "庚子", "辛丑"
  ],
  
  // 壬年の月干支
  "壬": [
    "壬寅", "癸卯", "甲辰", "乙巳", "丙午", "丁未", 
    "戊申", "己酉", "庚戌", "辛亥", "壬子", "癸丑"
  ],
  
  // 癸年の月干支
  "癸": [
    "甲寅", "乙卯", "丙辰", "丁巳", "戊午", "己未", 
    "庚申", "辛酉", "壬戌", "癸亥", "甲子", "乙丑"
  ]
};

/**
 * 年干から各月の月干を分析
 */
function analyzeYearStemToMonthStem() {
  console.log("=== 年干から月干へのマッピング分析 ===\n");
  
  // 各年干について分析
  for (const yearStem of STEMS) {
    const monthPillars = YEAR_STEM_MONTH_PILLAR_MAP[yearStem];
    const monthStems = monthPillars.map(pillar => pillar[0]); // 各月の天干を抽出
    
    console.log(`年干 ${yearStem} の月干パターン:`);
    console.log(`  1月～12月: ${monthStems.join(' ')}`);
    
    // 月干の最初の値（1月の月干）
    const firstMonthStem = monthStems[0];
    const firstMonthStemIndex = STEMS.indexOf(firstMonthStem);
    
    // 月干の基準インデックスを求める
    console.log(`  1月の月干: ${firstMonthStem} (インデックス: ${firstMonthStemIndex})`);
    
    // 月間の変化を調査
    const diffs = [];
    for (let i = 1; i < monthStems.length; i++) {
      const prevStem = monthStems[i-1];
      const currStem = monthStems[i];
      
      const prevIdx = STEMS.indexOf(prevStem);
      const currIdx = STEMS.indexOf(currStem);
      
      // 循環を考慮した差分計算
      const diff = (currIdx - prevIdx + 10) % 10;
      diffs.push(diff);
    }
    
    console.log(`  月間の干の変化: ${diffs.join(' ')}`);
    
    // 最も頻出する差分
    const diffCount = {};
    diffs.forEach(d => diffCount[d] = (diffCount[d] || 0) + 1);
    
    const mostCommonDiff = Object.entries(diffCount)
      .sort((a, b) => b[1] - a[1])
      .map(([diff, count]) => ({ diff: parseInt(diff), count }))[0];
    
    console.log(`  最も頻出する差分: ${mostCommonDiff.diff} (${mostCommonDiff.count}回)`);
    
    // 年干と月干の関係式を推測
    console.log(`  推測される規則: 各月の月干 = (基準値 + (月 - 1) × ${mostCommonDiff.diff}) % 10`);
    console.log(`  年干 ${yearStem} の基準値: ${firstMonthStemIndex}\n`);
  }
  
  // 年干と月干の基準値の関係を分析
  console.log("=== 年干と月干の基準値の関係 ===\n");
  
  const yearStemToBaseIndex = {};
  for (const yearStem of STEMS) {
    const firstMonthStem = YEAR_STEM_MONTH_PILLAR_MAP[yearStem][0][0];
    yearStemToBaseIndex[yearStem] = STEMS.indexOf(firstMonthStem);
  }
  
  console.log("年干ごとの月干基準値:");
  for (const [yearStem, baseIndex] of Object.entries(yearStemToBaseIndex)) {
    console.log(`  ${yearStem}: ${baseIndex} (${STEMS[baseIndex]})`);
  }
  
  // 年干インデックスと月干基準値の関係を探る
  console.log("\n年干インデックスと月干基準値の関係:");
  for (const yearStem of STEMS) {
    const yearStemIndex = STEMS.indexOf(yearStem);
    const baseIndex = yearStemToBaseIndex[yearStem];
    const relation = (baseIndex - yearStemIndex + 10) % 10;
    
    console.log(`  ${yearStem}(${yearStemIndex}) → 基準値${baseIndex}(${STEMS[baseIndex]}): 差=${relation}`);
  }
  
  // パターン分析
  const patterns = {};
  for (const yearStem of STEMS) {
    const yearStemIndex = STEMS.indexOf(yearStem);
    const baseIndex = yearStemToBaseIndex[yearStem];
    const pattern = (baseIndex - yearStemIndex + 10) % 10;
    
    if (!patterns[pattern]) {
      patterns[pattern] = [];
    }
    patterns[pattern].push(yearStem);
  }
  
  console.log("\n発見されたパターン:");
  for (const [pattern, yearStems] of Object.entries(patterns)) {
    console.log(`  差分${pattern}: ${yearStems.join(', ')}`);
  }
  
  // 公式を推測
  console.log("\n推測される計算式:");
  if (Object.keys(patterns).length === 1) {
    // 単一パターン
    const pattern = parseInt(Object.keys(patterns)[0]);
    console.log(`  月干基準値 = (年干インデックス + ${pattern}) % 10`);
  } else {
    // 複数パターン - グループごとに規則を表示
    for (const [pattern, yearStems] of Object.entries(patterns)) {
      console.log(`  ${yearStems.join('/')}年の場合: 月干基準値 = (年干インデックス + ${pattern}) % 10`);
    }
  }
}

/**
 * 月と月支の関係を分析
 */
function analyzeMonthToBranch() {
  console.log("\n=== 月と月支の関係分析 ===\n");
  
  // 任意の年干のデータを使用（どの年干でも月支は同じ）
  const sampleYearStem = "甲";
  const monthPillars = YEAR_STEM_MONTH_PILLAR_MAP[sampleYearStem];
  const monthBranches = monthPillars.map(pillar => pillar[1]); // 各月の地支を抽出
  
  console.log("月と月支の対応:");
  for (let month = 1; month <= 12; month++) {
    const branch = monthBranches[month - 1];
    const branchIndex = BRANCHES.indexOf(branch);
    console.log(`  ${month}月: ${branch} (インデックス: ${branchIndex})`);
  }
  
  // 月と月支インデックスの関係を探る
  console.log("\n月と月支インデックスの関係:");
  const relations = [];
  for (let month = 1; month <= 12; month++) {
    const branch = monthBranches[month - 1];
    const branchIndex = BRANCHES.indexOf(branch);
    const relation = (branchIndex - month + 12) % 12;
    relations.push(relation);
    
    console.log(`  ${month}月 → ${branch}(${branchIndex}): 差=${relation}`);
  }
  
  // 一貫したパターンがあるかチェック
  const uniqueRelations = [...new Set(relations)];
  if (uniqueRelations.length === 1) {
    console.log(`\n発見された公式: 月支インデックス = (月 + ${uniqueRelations[0]}) % 12`);
  } else {
    console.log("\n一貫した関係式は見つかりませんでした。複数のパターンが存在します。");
  }
}

/**
 * 月柱の計算アルゴリズムを推定
 */
function inferMonthPillarAlgorithm() {
  console.log("\n=== 月柱計算アルゴリズムの推定 ===\n");
  
  // 年干と月干の基準値マップ
  const yearStemToBaseStems = {};
  for (const yearStem of STEMS) {
    const firstMonthStem = YEAR_STEM_MONTH_PILLAR_MAP[yearStem][0][0];
    yearStemToBaseStems[yearStem] = firstMonthStem;
  }
  
  // グループ化（同じ基準値を持つ年干をグループ化）
  const baseStemGroups = {};
  for (const [yearStem, baseStem] of Object.entries(yearStemToBaseStems)) {
    if (!baseStemGroups[baseStem]) {
      baseStemGroups[baseStem] = [];
    }
    baseStemGroups[baseStem].push(yearStem);
  }
  
  console.log("年干グループと月干の基準値:");
  for (const [baseStem, yearStems] of Object.entries(baseStemGroups)) {
    console.log(`  基準値${baseStem}: ${yearStems.join(', ')}年`);
  }
  
  // アルゴリズム推定
  console.log("\n推定アルゴリズム:");
  console.log("1. 年干からの月干基準値マッピング:");
  for (const yearStem of STEMS) {
    console.log(`   ${yearStem}年 → 基準値: ${yearStemToBaseStems[yearStem]}`);
  }
  
  console.log("\n2. 月ごとの月干進行:");
  console.log("   基本的に月が一つ進むごとに月干は1つ進む");
  
  console.log("\n3. 月支の計算:");
  console.log("   月支 = 地支[(月 + 2) % 12]");
  // 1月が寅で、寅は地支の3番目（インデックス2）
  
  console.log("\n4. 完全な月柱計算:");
  console.log("   a. 年干から月干の基準値を取得");
  console.log("   b. 月干 = 天干[(基準値インデックス + (月 - 1)) % 10]");
  console.log("   c. 月支 = 地支[(月 + 2) % 12]");
  console.log("   d. 月柱 = 月干 + 月支");
}

/**
 * 特殊ケースの有無を調査
 */
function checkSpecialCases() {
  console.log("\n=== 特殊ケースの調査 ===\n");
  
  // 標準パターンの計算関数
  function calculateExpectedStem(yearStem, month) {
    const baseStemIndex = STEMS.indexOf(YEAR_STEM_MONTH_PILLAR_MAP[yearStem][0][0]);
    return STEMS[(baseStemIndex + (month - 1)) % 10];
  }
  
  function calculateExpectedBranch(month) {
    // 1月は寅 (インデックス2)
    return BRANCHES[(month + 2) % 12];
  }
  
  // 表データと計算結果を比較
  let totalChecks = 0;
  let matchCount = 0;
  let specialCases = [];
  
  for (const yearStem of STEMS) {
    const monthPillars = YEAR_STEM_MONTH_PILLAR_MAP[yearStem];
    
    for (let month = 1; month <= 12; month++) {
      const actualPillar = monthPillars[month - 1];
      const actualStem = actualPillar[0];
      const actualBranch = actualPillar[1];
      
      const expectedStem = calculateExpectedStem(yearStem, month);
      const expectedBranch = calculateExpectedBranch(month);
      const expectedPillar = expectedStem + expectedBranch;
      
      const stemMatch = actualStem === expectedStem;
      const branchMatch = actualBranch === expectedBranch;
      const fullMatch = stemMatch && branchMatch;
      
      totalChecks++;
      if (fullMatch) matchCount++;
      
      if (!fullMatch) {
        specialCases.push({
          yearStem,
          month,
          actual: actualPillar,
          expected: expectedPillar,
          stemMatch,
          branchMatch
        });
      }
    }
  }
  
  // 結果出力
  const accuracy = (matchCount / totalChecks) * 100;
  console.log(`標準アルゴリズムの精度: ${accuracy.toFixed(2)}% (${matchCount}/${totalChecks})`);
  
  if (specialCases.length > 0) {
    console.log("\n検出された特殊ケース:");
    for (const specialCase of specialCases) {
      console.log(`  ${specialCase.yearStem}年 ${specialCase.month}月: ` +
        `期待値=${specialCase.expected}, 実際=${specialCase.actual} ` +
        `[天干一致: ${specialCase.stemMatch ? '○' : '×'}, 地支一致: ${specialCase.branchMatch ? '○' : '×'}]`);
    }
    
    // 特殊ケースのパターン分析
    console.log("\n特殊ケースのパターン分析:");
    // ...ここに特殊ケースのパターン分析コードを追加...
  } else {
    console.log("特殊ケースは検出されませんでした。標準アルゴリズムで全てのケースを計算できます。");
  }
}

// 分析実行
console.log("===== 四柱推命表の分析 =====\n");
analyzeYearStemToMonthStem();
analyzeMonthToBranch();
inferMonthPillarAlgorithm();
checkSpecialCases();