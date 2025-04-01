/**
 * 韓国式四柱推命 - 年柱の地支計算モジュール
 * calender.mdのサンプルデータを分析して抽出したアルゴリズム
 */
import { BRANCHES, SajuOptions } from './types';

/**
 * 年支計算のオプション
 */
interface YearBranchOptions extends SajuOptions {
  /**
   * 基準年のカスタマイズ（デフォルトは1984年）
   */
  referenceYear?: number;
  
  /**
   * 基準年の地支インデックス（デフォルトは子=0）
   */
  referenceBranchIndex?: number;
}

/**
 * 年支（地支）を計算する - 韓国式
 * @param year 西暦年
 * @param options 計算オプション
 * @return 地支のインデックス (0-11)
 */
export function calculateYearBranchIndex(year: number, options: YearBranchOptions = {}): number {
  // 基準点の設定
  const referenceYear = options.referenceYear || 1984; // 1984年は甲子年
  const referenceBranchIndex = options.referenceBranchIndex || 0; // 子=0
  
  // 基準年からの差分を計算
  const yearDiff = year - referenceYear;
  
  // 地支は12周期で循環する
  // 正の剰余を確保するため、まず地支の数を足してから剰余を取る
  return (referenceBranchIndex + (yearDiff % 12 + 12) % 12) % 12;
}

/**
 * 年支（地支）を取得する - 韓国式
 * @param year 西暦年
 * @param options 計算オプション
 * @returns 地支文字
 */
export function calculateYearBranch(year: number, options: YearBranchOptions = {}): string {
  const branchIndex = calculateYearBranchIndex(year, options);
  return BRANCHES[branchIndex];
}

/**
 * 地支から蔵干（隠れた天干）を取得
 * @param branch 地支
 * @returns 蔵干の配列
 */
export function getHiddenStems(branch: string): string[] {
  // 各地支に対応する蔵干のマッピング
  const hiddenStemsMap: Record<string, string[]> = {
    "子": ["癸"],
    "丑": ["己", "辛", "癸"],
    "寅": ["甲", "丙", "戊"],
    "卯": ["乙"],
    "辰": ["戊", "乙", "癸"],
    "巳": ["丙", "庚", "戊"],
    "午": ["丁", "己"],
    "未": ["己", "乙", "丁"],
    "申": ["庚", "壬", "戊"],
    "酉": ["辛"],
    "戌": ["戊", "辛", "丁"],
    "亥": ["壬", "甲"]
  };
  
  return hiddenStemsMap[branch] || [];
}

/**
 * サンプルデータを使って年支計算を検証
 * @returns 検証結果
 */
export function verifyYearBranchCalculation(): { success: boolean, results: any[] } {
  // サンプルデータ - calender.mdから抽出
  const samples = [
    { year: 1970, expected: "酉", description: "鶏" },
    { year: 1985, expected: "丑", description: "牛" },
    { year: 1986, expected: "寅", description: "虎" },
    { year: 1995, expected: "亥", description: "猪" },
    { year: 2005, expected: "酉", description: "鶏" },
    { year: 2015, expected: "未", description: "羊" },
    { year: 2023, expected: "卯", description: "兎" },
    { year: 2024, expected: "辰", description: "龍" }
  ];
  
  const results: any[] = [];
  let allCorrect = true;
  
  // サンプルデータの検証
  console.log('===== 韓国式年支計算検証 =====');
  samples.forEach(sample => {
    const calculated = calculateYearBranch(sample.year);
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
  console.log('\n===== 韓国式年支計算アルゴリズム =====');
  console.log('抽出したアルゴリズム:');
  console.log('1. 基準年1984年は「甲子」年で地支は「子」（インデックス0）');
  console.log('2. 年支計算式: (year - 1984) % 12 + 0');
  console.log(`3. 地支の配列: [${BRANCHES.join(', ')}]`);
  
  return {
    success: allCorrect,
    results
  };
}

/**
 * 年支計算のテスト実行
 */
export function runYearBranchTest(): void {
  const verification = verifyYearBranchCalculation();
  
  console.log(`\n検証結果: ${verification.success ? '成功' : '失敗'}`);
  
  if (!verification.success) {
    console.log('\n失敗したケース:');
    verification.results
      .filter(result => !result.correct)
      .forEach(result => {
        console.log(`- ${result.year}年: 期待値[${result.expected}] 計算値[${result.calculated}]`);
      });
  }
  
  // 過去60年間の年支パターンを表示
  console.log('\n===== 過去60年間の年支パターン =====');
  const currentYear = new Date().getFullYear();
  for (let i = 0; i < 60; i++) {
    const year = currentYear - 59 + i;
    const branch = calculateYearBranch(year);
    // 蔵干も表示
    const hiddenStems = getHiddenStems(branch);
    console.log(`${year}年: ${branch} (蔵干: ${hiddenStems.join(', ') || 'なし'})`);
  }
}

// このファイルを直接実行した場合のみテストを実行
if (require.main === module) {
  runYearBranchTest();
}