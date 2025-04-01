/**
 * 韓国式四柱推命 - 年柱の天干計算モジュール
 * calender.mdのサンプルデータを分析して抽出したアルゴリズム
 */
import { STEMS, SajuOptions } from './types';

/**
 * 年干計算のオプション
 */
interface YearStemOptions extends SajuOptions {
  /**
   * 基準年のカスタマイズ（デフォルトは1984年）
   */
  referenceYear?: number;
  
  /**
   * 基準年の天干インデックス（デフォルトは甲=0）
   */
  referenceStemIndex?: number;
}

/**
 * 年干（天干）を計算する - 韓国式
 * @param year 西暦年
 * @param options 計算オプション
 * @return 天干のインデックス (0-9)
 */
export function calculateYearStemIndex(year: number, options: YearStemOptions = {}): number {
  // 基準点の設定
  const referenceYear = options.referenceYear || 1984; // 1984年は甲子年
  const referenceStemIndex = options.referenceStemIndex || 0; // 甲=0
  
  // 基準年からの差分を計算
  const yearDiff = year - referenceYear;
  
  // 天干は10周期で循環する
  // 正の剰余を確保するため、まず天干の数を足してから剰余を取る
  return (referenceStemIndex + (yearDiff % 10 + 10) % 10) % 10;
}

/**
 * 年干（天干）を取得する - 韓国式
 * @param year 西暦年
 * @param options 計算オプション
 * @returns 天干文字
 */
export function calculateYearStem(year: number, options: YearStemOptions = {}): string {
  const stemIndex = calculateYearStemIndex(year, options);
  return STEMS[stemIndex];
}

/**
 * サンプルデータを使って年干計算を検証
 * @returns 検証結果
 */
export function verifyYearStemCalculation(): { success: boolean, results: any[] } {
  // サンプルデータ - calender.mdから抽出
  const samples = [
    { year: 1970, expected: "己", description: "陰の土" },
    { year: 1985, expected: "乙", description: "陰の木" },
    { year: 1986, expected: "丙", description: "陽の火" },
    { year: 1995, expected: "乙", description: "陰の木" },
    { year: 2005, expected: "乙", description: "陰の木" },
    { year: 2015, expected: "乙", description: "陰の木" },
    { year: 2023, expected: "癸", description: "陰の水" },
    { year: 2024, expected: "甲", description: "陽の木" }
  ];
  
  const results: any[] = [];
  let allCorrect = true;
  
  // サンプルデータの検証
  console.log('===== 韓国式年干計算検証 =====');
  samples.forEach(sample => {
    const calculated = calculateYearStem(sample.year);
    const isCorrect = calculated === sample.expected;
    
    if (!isCorrect) allCorrect = false;
    
    results.push({
      year: sample.year,
      expected: sample.expected,
      calculated: calculated,
      correct: isCorrect
    });
    
    console.log(`${sample.year}年: 期待値[${sample.expected} - ${sample.description}] 計算値[${calculated}] - ${isCorrect ? '✓' : '✗'}`);
  });
  
  // アルゴリズム説明
  console.log('\n===== 韓国式年干計算アルゴリズム =====');
  console.log('抽出したアルゴリズム:');
  console.log('1. 基準年1984年は「甲子」年で天干は「甲」（インデックス0）');
  console.log('2. 年干計算式: (year - 1984) % 10 + 0');
  console.log(`3. 天干の配列: [${STEMS.join(', ')}]`);
  
  return {
    success: allCorrect,
    results
  };
}

/**
 * 年干計算のテスト実行
 */
export function runYearStemTest(): void {
  const verification = verifyYearStemCalculation();
  
  console.log(`\n検証結果: ${verification.success ? '成功' : '失敗'}`);
  
  if (!verification.success) {
    console.log('\n失敗したケース:');
    verification.results
      .filter(result => !result.correct)
      .forEach(result => {
        console.log(`- ${result.year}年: 期待値[${result.expected}] 計算値[${result.calculated}]`);
      });
  }
  
  // 過去60年間の年干パターンを表示
  console.log('\n===== 過去60年間の年干パターン =====');
  const currentYear = new Date().getFullYear();
  for (let i = 0; i < 60; i++) {
    const year = currentYear - 59 + i;
    const stem = calculateYearStem(year);
    console.log(`${year}年: ${stem}`);
  }
}

// このファイルを直接実行した場合のみテストを実行
if (require.main === module) {
  runYearStemTest();
}