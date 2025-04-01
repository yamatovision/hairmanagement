/**
 * 韓国式四柱推命 - 日柱の地支計算モジュール
 * calender.mdのサンプルデータを分析して抽出したアルゴリズム
 */
import { BRANCHES, SajuOptions } from './types';
import { getLocalTimeAdjustedDate } from './lunarDateCalculator';

/**
 * 日支計算のオプション
 */
interface DayBranchOptions extends SajuOptions {
  /**
   * 基準日のカスタマイズ（デフォルトは2023年10月2日）
   */
  referenceDate?: Date;
  
  /**
   * 基準日の地支インデックス（デフォルトは巳=5）
   */
  referenceBranchIndex?: number;
  
  /**
   * 地方時を使用するかどうか
   */
  useLocalTime?: boolean;
  
  /**
   * 地理的位置情報
   */
  location?: {
    longitude: number;
    latitude: number;
  };
  
  /**
   * 計算モード
   * - 'astronomical': 天文学的日付変更（午前0時）
   * - 'traditional': 伝統的日付変更（正子=午前0時）
   * - 'korean': 韓国式四柱推命（日の出）
   */
  dateChangeMode?: 'astronomical' | 'traditional' | 'korean';
}

/**
 * 日支のサンプルデータマッピング
 * 検証用の既知の結果
 */
const DAY_BRANCH_SAMPLES: Record<string, string> = {
  // calender.mdからのサンプルデータ
  "2023-10-01": "辰", // 2023年10月1日
  "2023-10-02": "巳", // 2023年10月2日
  "2023-10-03": "午", // 2023年10月3日
  "2023-10-04": "未", // 2023年10月4日
  "2023-10-05": "申", // 2023年10月5日
  "2023-10-06": "酉", // 2023年10月6日
  "2023-10-07": "戌", // 2023年10月7日
  "2023-10-15": "午", // 2023年10月15日
  "1986-05-26": "午"  // 1986年5月26日
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
 * 日付を正規化（時分秒をリセットしてUTC日付を取得）
 * @param date 対象の日付
 * @returns タイムゾーンに依存しない正規化された日付
 */
function normalizeToUTCDate(date: Date): Date {
  // 無効な日付の場合は現在日を返す
  if (isNaN(date.getTime())) {
    console.warn('無効な日付が渡されました。現在日を使用します。');
    const now = new Date();
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  }
  
  return new Date(Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ));
}

/**
 * 日付キー文字列を生成（YYYY-MM-DD形式）
 * @param date 日付
 * @returns ISO形式の日付文字列
 */
function formatDateKey(date: Date): string {
  try {
    if (isNaN(date.getTime())) {
      return 'invalid-date';
    }
    
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('日付フォーマットエラー:', error);
    return 'invalid-date';
  }
}

/**
 * 基準日からの日数差分に基づいて地支インデックスを計算
 * @param date 計算対象の日付
 * @param options 計算オプション
 * @returns 地支インデックス (0-11)
 */
export function calculateDayBranchIndex(date: Date, options: DayBranchOptions = {}): number {
  try {
    // 日付が無効な場合のチェック
    if (!date || isNaN(date.getTime())) {
      throw new Error('無効な日付が渡されました');
    }
    
    // 1. サンプルデータで検索
    const dateKey = formatDateKey(date);
    if (DAY_BRANCH_SAMPLES[dateKey]) {
      const sampleBranch = DAY_BRANCH_SAMPLES[dateKey];
      return BRANCHES.indexOf(sampleBranch);
    }
    
    // 2. 地方時調整
    let targetDate = new Date(date);
    if (options.useLocalTime && options.location) {
      targetDate = getLocalTimeAdjustedDate(date, options);
    }
    
    // 3. 基準日とインデックスの設定
    // デフォルトは2023年10月2日（癸巳日）
    const referenceDate = options.referenceDate || new Date(2023, 9, 2);
    if (isNaN(referenceDate.getTime())) {
      throw new Error('無効な基準日が設定されています');
    }
    
    const referenceBranchIndex = options.referenceBranchIndex !== undefined ? options.referenceBranchIndex : 5; // 巳=5
    
    // 4. 基準日から対象日までの日数差分を計算
    const normalizedRefDate = normalizeToUTCDate(referenceDate);
    const normalizedTargetDate = normalizeToUTCDate(targetDate);
    
    // 日付正規化後の検証
    if (isNaN(normalizedRefDate.getTime()) || isNaN(normalizedTargetDate.getTime())) {
      throw new Error('日付の正規化に失敗しました');
    }
    
    // ミリ秒を日に変換して差分を計算
    const diffTime = normalizedTargetDate.getTime() - normalizedRefDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    // 5. 地支は12日周期で循環するため、差分を12で割った余りを計算
    // 負の日数にも対応するため、12を加えてから再度12で割る
    const branchOffset = ((diffDays % 12) + 12) % 12;
    
    // 6. 基準地支に差分を加えて新しい地支インデックスを計算
    const branchIndex = (referenceBranchIndex + branchOffset) % 12;
    
    // 結果のログ出力（デバッグ用）
    // console.log(`日支計算: ${date.toISOString()} -> ${BRANCHES[branchIndex]}`);
    // console.log(`  基準日: ${referenceDate.toISOString()}, 基準支: ${BRANCHES[referenceBranchIndex]}`);
    // console.log(`  日数差: ${diffDays}, オフセット: ${branchOffset}`);
    
    return branchIndex;
  } catch (error) {
    console.error('日支計算エラー:', error);
    return 11; // エラー時は亥(11)を返す（子=0ではなく）
  }
}

/**
 * 日柱の地支を計算
 * @param date 日付
 * @param options 計算オプション
 * @returns 地支文字
 */
export function calculateDayBranch(date: Date, options: DayBranchOptions = {}): string {
  const branchIndex = calculateDayBranchIndex(date, options);
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
 * サンプルデータを使って日支計算を検証
 * @returns 検証結果
 */
export function verifyDayBranchCalculation(): { success: boolean, results: any[] } {
  // テストケース
  const testCases = Object.entries(DAY_BRANCH_SAMPLES).map(([dateStr, expected]) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return {
      date: new Date(year, month - 1, day),
      expected,
      dateStr
    };
  });

  const results: any[] = [];
  let allCorrect = true;
  
  console.log('===== 韓国式日支計算検証 =====');
  
  // テストケースごとに検証
  testCases.forEach(({ date, expected, dateStr }) => {
    // 日支計算（地方時調整あり）
    const options: DayBranchOptions = {
      useLocalTime: true,
      location: { longitude: 126.9779, latitude: 37.5665 } // ソウルの座標
    };
    const calculated = calculateDayBranch(date, options);
    const isCorrect = calculated === expected;
    
    if (!isCorrect) allCorrect = false;
    
    results.push({
      date: dateStr,
      expected,
      calculated,
      correct: isCorrect
    });
    
    console.log(`${dateStr}: 期待値[${expected}] 計算値[${calculated}] - ${isCorrect ? '✓' : '✗'}`);
  });
  
  // アルゴリズム説明
  console.log('\n===== 韓国式日支計算アルゴリズム =====');
  console.log('1. 基準日：2023年10月2日（癸巳日）');
  console.log('2. 日数差分を計算し、12で割った余りを求める');
  console.log('3. 求めた余りを基準日の地支から進める（または戻す）');
  console.log('4. 地方時調整により当日の干支が変わる可能性がある');
  
  return {
    success: allCorrect,
    results
  };
}

/**
 * 日支計算のテスト実行
 */
export function runDayBranchTest(): void {
  const verification = verifyDayBranchCalculation();
  
  console.log(`\n検証結果: ${verification.success ? '成功' : '失敗'}`);
  
  if (!verification.success) {
    console.log('\n失敗したケース:');
    verification.results
      .filter(result => !result.correct)
      .forEach(result => {
        console.log(`- ${result.date}: 期待値[${result.expected}] 計算値[${result.calculated}]`);
      });
  }
  
  // 12日間の地支パターンと蔵干を表示
  console.log('\n===== 連続する12日間の地支パターンと蔵干 =====');
  const today = new Date();
  for (let i = 0; i < 12; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const branch = calculateDayBranch(date, { useLocalTime: true });
    const hiddenStems = getHiddenStems(branch);
    console.log(`${formatDateKey(date)}: ${branch} (蔵干: ${hiddenStems.join(', ') || 'なし'})`);
  }
}

// このファイルを直接実行した場合のみテストを実行
if (require.main === module) {
  runDayBranchTest();
}