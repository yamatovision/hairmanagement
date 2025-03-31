/**
 * 韓国式四柱推命計算 - 年柱計算アルゴリズム検証モジュール
 */
import { Pillar, STEMS, BRANCHES } from './types';

/**
 * サンプルデータ - 年柱計算
 */
const YEAR_PILLAR_SAMPLES = [
  { year: 1970, expected: "己酉" }, // 기유 (白い鶏)
  { year: 1985, expected: "乙丑" }, // 을축 (木の牛) - 実際のデータは "갑자" になっていますが、文字数解釈の誤りかもしれません
  { year: 1995, expected: "乙亥" }, // 을해 (木の猪)
  { year: 2005, expected: "乙酉" }, // 을유 (木の鶏)
  { year: 2015, expected: "乙未" }  // 을미 (木の羊)
];

/**
 * 追加サンプルデータ - データの充実化
 */
const ADDITIONAL_SAMPLES = [
  { year: 1984, expected: "甲子" }, // 갑자 (木のねずみ)
  { year: 1986, expected: "丙寅" }, // 병인 (火の虎)
  { year: 2023, expected: "癸卯" }, // 계묘 (水の兎)
  { year: 2024, expected: "甲辰" }  // 갑진 (木の龍)
];

/**
 * 年干（天干）を計算する
 * @param year 西暦年
 * @return 天干のインデックス (0-9)
 */
export function calculateYearStemIndex(year: number): number {
  // 韓国式の計算: (年 + 6) % 10
  return (year + 6) % 10;
}

/**
 * 年支（地支）を計算する
 * @param year 西暦年
 * @return 地支のインデックス (0-11)
 */
export function calculateYearBranchIndex(year: number): number {
  // 韓国式の計算: (年 + 0) % 12
  return year % 12;
}

/**
 * 韓国式四柱推命の年柱を計算する
 * @param year 西暦年
 * @returns 年柱
 */
export function calculateKoreanYearPillar(year: number): Pillar {
  const stemIndex = calculateYearStemIndex(year);
  const branchIndex = calculateYearBranchIndex(year);
  
  const stem = STEMS[stemIndex];
  const branch = BRANCHES[branchIndex];
  
  return {
    stem,
    branch,
    fullStemBranch: `${stem}${branch}`
  };
}

/**
 * サンプルデータを使って年柱計算を検証
 * @returns 検証結果
 */
export function verifyYearPillarCalculation(): { success: boolean, results: any[] } {
  const results: any[] = [];
  let allCorrect = true;
  
  // サンプルデータの検証
  console.log('===== 年柱計算検証 - サンプルデータ =====');
  YEAR_PILLAR_SAMPLES.forEach(sample => {
    const calculated = calculateKoreanYearPillar(sample.year);
    const isCorrect = calculated.fullStemBranch === sample.expected;
    
    if (!isCorrect) allCorrect = false;
    
    results.push({
      year: sample.year,
      expected: sample.expected,
      calculated: calculated.fullStemBranch,
      correct: isCorrect
    });
    
    console.log(`${sample.year}年: 期待値[${sample.expected}] 計算値[${calculated.fullStemBranch}] - ${isCorrect ? '✓' : '✗'}`);
  });
  
  // 追加サンプルの検証
  console.log('\n===== 年柱計算検証 - 追加サンプル =====');
  ADDITIONAL_SAMPLES.forEach(sample => {
    const calculated = calculateKoreanYearPillar(sample.year);
    const isCorrect = calculated.fullStemBranch === sample.expected;
    
    if (!isCorrect) allCorrect = false;
    
    results.push({
      year: sample.year,
      expected: sample.expected,
      calculated: calculated.fullStemBranch,
      correct: isCorrect
    });
    
    console.log(`${sample.year}年: 期待値[${sample.expected}] 計算値[${calculated.fullStemBranch}] - ${isCorrect ? '✓' : '✗'}`);
  });
  
  // アルゴリズム解説
  console.log('\n===== 年柱計算アルゴリズム =====');
  console.log('韓国式四柱推命の年柱計算:');
  console.log('- 年干(天干): (年 + 6) % 10のインデックスで求める');
  console.log('- 年支(地支): (年 % 12)のインデックスで求める');
  console.log(`- 天干の配列: ${STEMS.join(', ')}`);
  console.log(`- 地支の配列: ${BRANCHES.join(', ')}`);
  
  // 計算例
  const exampleYear = 2023;
  const stemIndex = calculateYearStemIndex(exampleYear);
  const branchIndex = calculateYearBranchIndex(exampleYear);
  console.log(`\n例: ${exampleYear}年の年柱計算`);
  console.log(`- 天干インデックス: (${exampleYear} + 6) % 10 = ${stemIndex} → ${STEMS[stemIndex]}`);
  console.log(`- 地支インデックス: ${exampleYear} % 12 = ${branchIndex} → ${BRANCHES[branchIndex]}`);
  console.log(`- 年柱: ${STEMS[stemIndex]}${BRANCHES[branchIndex]}`);
  
  return {
    success: allCorrect,
    results
  };
}

/**
 * 一連の年の年柱を計算して表示（パターン確認用）
 * @param startYear 開始年
 * @param count 計算する年数
 */
export function showYearPillarPattern(startYear: number, count: number = 60): void {
  console.log(`\n===== ${startYear}年から${count}年間の年柱パターン =====`);
  
  for (let i = 0; i < count; i++) {
    const year = startYear + i;
    const yearPillar = calculateKoreanYearPillar(year);
    console.log(`${year}年: ${yearPillar.fullStemBranch}`);
  }
}

/**
 * 年柱計算用のテスト実行関数
 */
export function runYearPillarTest(): void {
  // 年柱計算の検証
  const verification = verifyYearPillarCalculation();
  
  console.log(`\n検証結果: ${verification.success ? '成功' : '失敗'}`);
  
  // 年柱の60年周期パターンを表示（オプション）
  // showYearPillarPattern(1924);
}

// このファイルを直接実行した場合、テストを実行
if (require.main === module) {
  runYearPillarTest();
}