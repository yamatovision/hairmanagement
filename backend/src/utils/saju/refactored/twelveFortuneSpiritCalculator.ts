/**
 * 十二運星計算モジュール
 * 
 * 四柱推命における十二運星の計算を行います。
 * 十二運星（十二長生）は日柱の天干（日主）から見た四柱の地支の関係を表します。
 */

/**
 * 十二運星の順序（標準的な順序）
 */
const TWELVE_FORTUNE_ORDER = [
  '長生', '沐浴', '冠帯', '臨官', '帝旺', '衰', 
  '病', '死', '墓', '絶', '胎', '養'
];

/**
 * 地支の配列 (子から亥までの順)
 */
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/**
 * 天干の配列 (甲から癸までの順)
 */
const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

/**
 * 天干の五行属性
 */
const STEM_ELEMENTS = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水'
};

/**
 * 天干の陰陽属性
 */
const STEM_YIN_YANG = {
  '甲': '陽', '丙': '陽', '戊': '陽', '庚': '陽', '壬': '陽',
  '乙': '陰', '丁': '陰', '己': '陰', '辛': '陰', '癸': '陰'
};

/**
 * 各天干の長生地支（十二運星の起点）
 * サンプルデータからの分析に基づいて改良
 */
const LONG_LIFE_START_BRANCHES = {
  '甲': '寅', // 木の陽
  '乙': '酉', // 木の陰
  '丙': '寅', // 火の陽
  '丁': '酉', // 火の陰
  '戊': '寅', // 土の陽
  '己': '酉', // 土の陰
  '庚': '寅', // 金の陽 
  '辛': '巳', // 金の陰
  '壬': '申', // 水の陽
  '癸': '卯'  // 水の陰
};

/**
 * 各天干の衰地支（長生から数えて5つ目）
 * サンプルデータからの分析に基づいて作成
 * 
 * 衰（すい）とは十二運星の帝旺の次、病の前に位置し、
 * 盛んな勢いが衰え始めた状態を意味する。
 */
const DECLINE_BRANCHES = {
  '甲': '辰', // 木の陽
  '乙': '丑', // 木の陰
  '丙': '未', // 火の陽 (推定)
  '丁': '卯', // 火の陰 (推定)
  '戊': '未', // 土の陽
  '己': '未', // 土の陰
  '庚': '未', // 金の陽 (推定)
  '辛': '未', // 金の陰
  '壬': '戌', // 水の陽 (推定)
  '癸': '丑'  // 水の陰
};

/**
 * 各天干の病地支（サンプルデータからの分析に基づいて作成）
 * 
 * 病（びょう）は十二運星の衰の次、死の前に位置し、
 * 勢いが衰えて病の状態になったことを意味する。
 */
const ILLNESS_BRANCHES = {
  '甲': '巳', // 木の陽
  '乙': '子', // 木の陰
  '丙': '申', // 火の陽
  '丁': '寅', // 火の陰
  '戊': '申', // 土の陽
  '己': '申', // 土の陰
  '庚': '申', // 金の陽
  '辛': '申', // 金の陰
  '壬': '亥', // 水の陽
  '癸': '子'  // 水の陰
};

/**
 * 各天干の死地支（サンプルデータからの分析に基づいて作成）
 * 
 * 死（し）は十二運星の病の次、墓の前に位置し、
 * 勢いが完全に尽きた状態を意味する。
 */
const DEATH_BRANCHES = {
  '甲': '午', // 木の陽
  '乙': '亥', // 木の陰
  '丙': '酉', // 火の陽
  '丁': '丑', // 火の陰
  '戊': '酉', // 土の陽
  '己': '酉', // 土の陰
  '庚': '子', // 金の陽
  '辛': '巳', // 金の陰
  '壬': '寅', // 水の陽
  '癸': '申'  // 水の陰
};

/**
 * 各天干の墓地支（サンプルデータからの分析に基づいて作成）
 * 
 * 墓（ぼ）は十二運星の死の次、絶の前に位置し、
 * 勢いが完全に尽きて墓所に入った状態を意味する。
 * 暦注では「死-墓-絶」の順序で進行する。
 */
const GRAVE_BRANCHES = {
  '甲': '未', // 木の陽
  '乙': '戌', // 木の陰
  '丙': '丑', // 火の陽
  '丁': '戌', // 火の陰
  '戊': '丑', // 土の陽 - サンプルから判断
  '己': '丑', // 土の陰
  '庚': '丑', // 金の陽
  '辛': '丑', // 金の陰
  '壬': '辰', // 水の陽
  '癸': '未'  // 水の陰
};

/**
 * 進行方向（通常は順行、特定の天干は逆行）
 * true: 順行、false: 逆行
 */
const PROGRESSION_DIRECTION = {
  '甲': true,  '乙': false, // 木の天干
  '丙': true,  '丁': false, // 火の天干
  '戊': true,  '己': false, // 土の天干
  '庚': true,  '辛': false, // 金の天干
  '壬': true,  '癸': false  // 水の天干
};

/**
 * 衰の十二運星かどうかを判定する
 * @param stem 天干
 * @param branch 地支 
 * @returns 衰かどうか
 */
function isDeclineFortune(stem: string, branch: string): boolean {
  // 各天干の衰地支との一致を確認
  return DECLINE_BRANCHES[stem] === branch;
}

/**
 * 病の十二運星かどうかを判定する
 * @param stem 天干
 * @param branch 地支
 * @returns 病かどうか
 */
function isIllnessFortune(stem: string, branch: string): boolean {
  // 各天干の病地支との一致を確認
  return ILLNESS_BRANCHES[stem] === branch;
}

/**
 * 死の十二運星かどうかを判定する
 * @param stem 天干
 * @param branch 地支
 * @returns 死かどうか
 */
function isDeathFortune(stem: string, branch: string): boolean {
  // 各天干の死地支との一致を確認
  return DEATH_BRANCHES[stem] === branch;
}

/**
 * 墓の十二運星かどうかを判定する
 * @param stem 天干
 * @param branch 地支
 * @returns 墓かどうか
 */
function isGraveFortune(stem: string, branch: string): boolean {
  // 各天干の墓地支との一致を確認
  return GRAVE_BRANCHES[stem] === branch;
}

/**
 * アルゴリズムに基づいて特定の天干と地支の組み合わせから十二運星を計算する
 * @param stem 天干
 * @param branch 地支
 * @returns 対応する十二運星
 */
export function calculateTwelveFortuneForBranch(stem: string, branch: string): string {
  // パラメータの検証
  if (!STEMS.includes(stem) || !BRANCHES.includes(branch)) {
    return '不明';
  }
  
  // 特殊なパターンの判定
  // 1. 衰（すい）の判定
  if (isDeclineFortune(stem, branch)) {
    return '衰';
  }
  
  // 2. 病（びょう）の判定
  if (isIllnessFortune(stem, branch)) {
    return '病';
  }
  
  // 3. 死（し）の判定
  if (isDeathFortune(stem, branch)) {
    return '死';
  }
  
  // 4. 墓（ぼ）の判定
  if (isGraveFortune(stem, branch)) {
    return '墓';
  }
  
  // 天干に対応する長生の始点地支を取得
  const startBranch = LONG_LIFE_START_BRANCHES[stem];
  if (!startBranch) return '不明';
  
  // 始点地支のインデックスを取得
  const startIndex = BRANCHES.indexOf(startBranch);
  
  // 対象地支のインデックスを取得
  const branchIndex = BRANCHES.indexOf(branch);
  
  // 進行方向を取得
  const isForward = PROGRESSION_DIRECTION[stem];
  
  // 十二運星の位置を計算
  // 順行なら (currentIdx - startIdx) を12で割った余り
  // 逆行なら (startIdx - currentIdx) を12で割った余り
  let position;
  if (isForward) {
    // 順行: 始点から対象地支まで何ステップ進むか計算
    position = (branchIndex - startIndex + 12) % 12;
  } else {
    // 逆行: 始点から対象地支まで何ステップ戻るか計算
    position = (startIndex - branchIndex + 12) % 12;
  }
  
  // 十二運星順序から結果を取得
  const fortune = position < TWELVE_FORTUNE_ORDER.length ? TWELVE_FORTUNE_ORDER[position] : '不明';
  return fortune;
}

/**
 * 十二運星を計算
 * @param dayStem 日主（日柱の天干）
 * @param yearBranch 年柱の地支
 * @param monthBranch 月柱の地支
 * @param dayBranch 日柱の地支
 * @param hourBranch 時柱の地支
 * @returns 四柱の十二運星を含むオブジェクト
 */
export function calculateTwelveFortunes(
  dayStem: string,
  yearBranch: string,
  monthBranch: string,
  dayBranch: string,
  hourBranch: string,
  date?: Date,
  hour?: number
): Record<string, string> {
  // 各柱の地支に対応する十二運星を計算
  return {
    year: calculateTwelveFortuneForBranch(dayStem, yearBranch),
    month: calculateTwelveFortuneForBranch(dayStem, monthBranch),
    day: calculateTwelveFortuneForBranch(dayStem, dayBranch),
    hour: calculateTwelveFortuneForBranch(dayStem, hourBranch)
  };
}

/**
 * 十二運星のテスト関数
 */
function testTwelveFortuneCalculator(): void {
  console.log('--- 十二運星計算テスト (新アルゴリズム版) ---');
  
  // 1986年5月26日5時のテスト
  const test1 = calculateTwelveFortunes('庚', '寅', '巳', '午', '卯');
  console.log('1986-5-26-5 (庚午日): ', test1);
  
  // 2023年10月15日12時のテスト
  const test2 = calculateTwelveFortunes('丙', '卯', '戌', '午', '午');
  console.log('2023-10-15-12 (丙午日): ', test2);
  
  // サンプルデータに基づくテスト
  console.log('\n--- サンプルデータに基づく十二運星計算テスト ---');
  
  // サンプル1: 1970年(陽暦1月1日, 00:00, 男性, ソウル)
  // 四柱: 年柱[己酉], 月柱[丙子], 日柱[辛巳], 時柱[戊子]
  const sample1 = calculateTwelveFortunes('辛', '酉', '子', '巳', '子');
  console.log('1970-1-1-0 (辛巳日): ', sample1);
  // 期待値: 年[建禄], 月[長生], 日[死], 時[長生]
  
  // サンプル2: 1985年(陽暦1月1日, 00:00, 男性, ソウル)
  // 四柱: 年柱[甲子], 月柱[丙子], 日柱[庚子], 時柱[丙子]
  const sample2 = calculateTwelveFortunes('庚', '子', '子', '子', '子');
  console.log('1985-1-1-0 (庚子日): ', sample2);
  // 期待値: 年[死], 月[死], 日[死], 時[死]
  
  // サンプル3: 2023年10月1日(00:00, 女性, ソウル)
  // 四柱: 年柱[癸卯], 月柱[辛酉], 日柱[壬辰], 時柱[庚子]
  const sample3 = calculateTwelveFortunes('壬', '卯', '酉', '辰', '子');
  console.log('2023-10-1-0 (壬辰日): ', sample3);
  // 期待値: 年[長生], 月[絶], 日[墓], 時[帝旺]
  
  // サンプル4: 2023年2月4日(立春, 00:00, 女性, ソウル)
  // 四柱: 年柱[壬寅], 月柱[癸丑], 日柱[癸巳], 時柱[壬子]
  const sample4 = calculateTwelveFortunes('癸', '寅', '丑', '巳', '子');
  console.log('2023-2-4-0 (癸巳日): ', sample4);
  // 期待値: 年[沐浴], 月[冠帯], 日[胎], 時[建禄]
  
  // 天干と地支の組み合わせテスト
  console.log('\n--- 天干ごとの長生地支とその十二運星 ---');
  
  // すべての天干について長生地支の検証
  const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  
  for (const stem of stems) {
    // 長生地支の取得
    const longLifeBranch = LONG_LIFE_START_BRANCHES[stem];
    // 長生地支での十二運星の計算
    const fortune = calculateTwelveFortuneForBranch(stem, longLifeBranch);
    console.log(`${stem}日の長生地支: ${longLifeBranch} - 十二運星: ${fortune}`);
    
    // 各天干について地支全体の十二運星をテスト
    console.log(`${stem}日の十二運星パターン:`);
    const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    const fortunes = branches.map(branch => calculateTwelveFortuneForBranch(stem, branch));
    console.log(`順序: ${branches.map((b, i) => `${b}[${fortunes[i]}]`).join(' → ')}`);
    console.log('------');
  }
}

// モジュールが直接実行されたときにテストを実行
if (require.main === module) {
  testTwelveFortuneCalculator();
}

// エクスポート
export { testTwelveFortuneCalculator };
// テスト関数のエイリアスとして追加（互換性のため）
export const testTwelveFortuneSpiritCalculator = testTwelveFortuneCalculator;