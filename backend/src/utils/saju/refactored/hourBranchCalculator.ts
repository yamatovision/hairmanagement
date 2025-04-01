/**
 * 韓国式四柱推命 - 時柱の地支計算モジュール
 * calender.mdのサンプルデータを分析して抽出したアルゴリズム
 */
import { BRANCHES, SajuOptions } from './types';

/**
 * 時支計算のオプション
 */
interface HourBranchOptions extends SajuOptions {
  /**
   * 韓国式時間調整を使用するかどうか
   */
  useKoreanHourSystem?: boolean;
}

/**
 * 時刻と地支のマッピング
 * 各時刻帯に対応する地支
 */
const HOUR_TO_BRANCH_MAPPING: Record<number, number> = {
  23: 0, 0: 0, 1: 0,  // 子（子の刻: 23時-1時）
  2: 1, 3: 1,        // 丑（丑の刻: 1時-3時）
  4: 2, 5: 2,        // 寅（寅の刻: 3時-5時）
  6: 3, 7: 3,        // 卯（卯の刻: 5時-7時）
  8: 4, 9: 4,        // 辰（辰の刻: 7時-9時）
  10: 5, 11: 5,      // 巳（巳の刻: 9時-11時）
  12: 6, 13: 6,      // 午（午の刻: 11時-13時）
  14: 7, 15: 7,      // 未（未の刻: 13時-15時）
  16: 8, 17: 8,      // 申（申の刻: 15時-17時）
  18: 9, 19: 9,      // 酉（酉の刻: 17時-19時）
  20: 10, 21: 10,    // 戌（戌の刻: 19時-21時）
  22: 11              // 亥（亥の刻: 21時-23時）
};

/**
 * 地支に対応する蔵干（隠れた天干）
 */
const HIDDEN_STEMS_MAP: Record<string, string[]> = {
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

/**
 * 時刻から時柱の地支インデックスを計算
 * @param hour 時刻（0-23）
 * @param options 計算オプション
 * @returns 地支インデックス (0-11)
 */
export function calculateHourBranchIndex(hour: number, options: HourBranchOptions = {}): number {
  try {
    // 時刻の正規化（24時間形式で0-23）
    const normalizedHour = ((hour % 24) + 24) % 24;
    
    // 時刻から直接地支インデックスを取得
    if (HOUR_TO_BRANCH_MAPPING[normalizedHour] !== undefined) {
      return HOUR_TO_BRANCH_MAPPING[normalizedHour];
    }
    
    // マッピングにない場合（通常はここに到達しない）は計算式で求める
    // 子の刻（23-1時）が0、丑の刻（1-3時）が1...
    return Math.floor(((normalizedHour + 1) % 24) / 2);
  } catch (error) {
    console.error('時支計算エラー:', error);
    return 0; // エラー時はデフォルト値
  }
}

/**
 * 時柱の地支を計算
 * @param hour 時刻（0-23）
 * @param options 計算オプション
 * @returns 地支文字
 */
export function calculateHourBranch(hour: number, options: HourBranchOptions = {}): string {
  const branchIndex = calculateHourBranchIndex(hour, options);
  return BRANCHES[branchIndex];
}

/**
 * 地支から蔵干（隠れた天干）を取得
 * @param branch 地支
 * @returns 蔵干の配列
 */
export function getHiddenStems(branch: string): string[] {
  return HIDDEN_STEMS_MAP[branch] || [];
}

/**
 * サンプルデータを使って時支計算を検証
 * @returns 検証結果
 */
export function verifyHourBranchCalculation(): { success: boolean, results: any[] } {
  // 検証用の時刻と期待値のセット
  const testCases = [
    { hour: 0, expected: "子" },  // 子の刻（夜中）
    { hour: 1, expected: "子" },  // 子の刻
    { hour: 2, expected: "丑" },  // 丑の刻
    { hour: 3, expected: "丑" },  // 丑の刻
    { hour: 4, expected: "寅" },  // 寅の刻
    { hour: 5, expected: "寅" },  // 寅の刻
    { hour: 6, expected: "卯" },  // 卯の刻
    { hour: 7, expected: "卯" },  // 卯の刻
    { hour: 8, expected: "辰" },  // 辰の刻
    { hour: 9, expected: "辰" },  // 辰の刻
    { hour: 10, expected: "巳" }, // 巳の刻
    { hour: 11, expected: "巳" }, // 巳の刻
    { hour: 12, expected: "午" }, // 午の刻（正午）
    { hour: 13, expected: "午" }, // 午の刻
    { hour: 14, expected: "未" }, // 未の刻
    { hour: 15, expected: "未" }, // 未の刻
    { hour: 16, expected: "申" }, // 申の刻
    { hour: 17, expected: "申" }, // 申の刻
    { hour: 18, expected: "酉" }, // 酉の刻
    { hour: 19, expected: "酉" }, // 酉の刻
    { hour: 20, expected: "戌" }, // 戌の刻
    { hour: 21, expected: "戌" }, // 戌の刻
    { hour: 22, expected: "亥" }, // 亥の刻
    { hour: 23, expected: "子" }  // 子の刻（夜）
  ];

  const results: any[] = [];
  let allCorrect = true;
  
  console.log('===== 韓国式時支計算検証 =====');
  
  // テストケースごとに検証
  testCases.forEach(({ hour, expected }) => {
    // 時支計算
    const calculated = calculateHourBranch(hour);
    const isCorrect = calculated === expected;
    
    if (!isCorrect) allCorrect = false;
    
    results.push({
      hour,
      expected,
      calculated,
      correct: isCorrect
    });
    
    console.log(`${hour}時: 期待値[${expected}] 計算値[${calculated}] - ${isCorrect ? '✓' : '✗'}`);
  });
  
  // アルゴリズム説明
  console.log('\n===== 韓国式時支計算アルゴリズム =====');
  console.log('時刻と地支の対応:');
  console.log('- 23-1時: 子（ねずみ）の刻');
  console.log('- 1-3時: 丑（うし）の刻');
  console.log('- 3-5時: 寅（とら）の刻');
  console.log('- 5-7時: 卯（うさぎ）の刻');
  console.log('- 7-9時: 辰（たつ）の刻');
  console.log('- 9-11時: 巳（へび）の刻');
  console.log('- 11-13時: 午（うま）の刻');
  console.log('- 13-15時: 未（ひつじ）の刻');
  console.log('- 15-17時: 申（さる）の刻');
  console.log('- 17-19時: 酉（とり）の刻');
  console.log('- 19-21時: 戌（いぬ）の刻');
  console.log('- 21-23時: 亥（いのしし）の刻');
  
  return {
    success: allCorrect,
    results
  };
}

/**
 * 時支計算のテスト実行
 */
export function runHourBranchTest(): void {
  const verification = verifyHourBranchCalculation();
  
  console.log(`\n検証結果: ${verification.success ? '成功' : '失敗'}`);
  
  if (!verification.success) {
    console.log('\n失敗したケース:');
    verification.results
      .filter(result => !result.correct)
      .forEach(result => {
        console.log(`- ${result.hour}時: 期待値[${result.expected}] 計算値[${result.calculated}]`);
      });
  }
  
  // 各時刻の地支と蔵干を表示
  console.log('\n===== 各時間帯の地支と蔵干 =====');
  for (let hour = 0; hour < 24; hour += 2) {
    const branch = calculateHourBranch(hour);
    const hiddenStems = getHiddenStems(branch);
    console.log(`${hour}-${hour+1}時: ${branch} (蔵干: ${hiddenStems.join(', ') || 'なし'})`);
  }
}

// このファイルを直接実行した場合のみテストを実行
if (require.main === module) {
  runHourBranchTest();
}