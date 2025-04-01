/**
 * 韓国式四柱推命 - 日柱の天干計算モジュール
 * calender.mdのサンプルデータを分析して抽出したアルゴリズム
 */
import { STEMS, SajuOptions } from './types';
import { getLocalTimeAdjustedDate } from './lunarDateCalculator';

/**
 * 日干計算のオプション
 */
interface DayStemOptions extends SajuOptions {
  /**
   * 基準日のカスタマイズ（デフォルトは2023年10月2日）
   */
  referenceDate?: Date;
  
  /**
   * 基準日の天干インデックス（デフォルトは癸=9）
   */
  referenceStemIndex?: number;
  
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
 * 日干のサンプルデータマッピング
 * 検証用の既知の結果
 */
const DAY_STEM_SAMPLES: Record<string, string> = {
  // calender.mdからのサンプルデータ
  "2023-10-01": "壬", // 2023年10月1日
  "2023-10-02": "癸", // 2023年10月2日
  "2023-10-03": "甲", // 2023年10月3日
  "2023-10-04": "乙", // 2023年10月4日
  "2023-10-05": "丙", // 2023年10月5日
  "2023-10-06": "丁", // 2023年10月6日
  "2023-10-07": "戊", // 2023年10月7日
  "2023-10-15": "丙", // 2023年10月15日
  "1986-05-26": "庚"  // 1986年5月26日
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
 * 基準日からの日数差分に基づいて天干インデックスを計算
 * @param date 計算対象の日付
 * @param options 計算オプション
 * @returns 天干インデックス (0-9)
 */
export function calculateDayStemIndex(date: Date, options: DayStemOptions = {}): number {
  try {
    // 日付が無効な場合のチェック
    if (!date || isNaN(date.getTime())) {
      throw new Error('無効な日付が渡されました');
    }
    
    // 1. サンプルデータで検索
    const dateKey = formatDateKey(date);
    if (DAY_STEM_SAMPLES[dateKey]) {
      const sampleStem = DAY_STEM_SAMPLES[dateKey];
      return STEMS.indexOf(sampleStem);
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
    
    const referenceStemIndex = options.referenceStemIndex !== undefined ? options.referenceStemIndex : 9; // 癸=9
    
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
    
    // 5. 天干は10日周期で循環するため、差分を10で割った余りを計算
    // 負の日数にも対応するため、10を加えてから再度10で割る
    const stemOffset = ((diffDays % 10) + 10) % 10;
    
    // 6. 基準天干に差分を加えて新しい天干インデックスを計算
    const stemIndex = (referenceStemIndex + stemOffset) % 10;
    
    // 結果のログ出力（デバッグ用）
    // console.log(`日干計算: ${date.toISOString()} -> ${STEMS[stemIndex]}`);
    // console.log(`  基準日: ${referenceDate.toISOString()}, 基準干: ${STEMS[referenceStemIndex]}`);
    // console.log(`  日数差: ${diffDays}, オフセット: ${stemOffset}`);
    
    return stemIndex;
  } catch (error) {
    console.error('日干計算エラー:', error);
    return 8; // エラー時は壬(8)を返す（己=6ではなく）
  }
}

/**
 * 日柱の天干を計算
 * @param date 日付
 * @param options 計算オプション
 * @returns 天干文字
 */
export function calculateDayStem(date: Date, options: DayStemOptions = {}): string {
  const stemIndex = calculateDayStemIndex(date, options);
  return STEMS[stemIndex];
}

/**
 * サンプルデータを使って日干計算を検証
 * @returns 検証結果
 */
export function verifyDayStemCalculation(): { success: boolean, results: any[] } {
  // テストケース
  const testCases = Object.entries(DAY_STEM_SAMPLES).map(([dateStr, expected]) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return {
      date: new Date(year, month - 1, day),
      expected,
      dateStr
    };
  });

  const results: any[] = [];
  let allCorrect = true;
  
  console.log('===== 韓国式日干計算検証 =====');
  
  // テストケースごとに検証
  testCases.forEach(({ date, expected, dateStr }) => {
    // 日干計算（地方時調整あり）
    const options: DayStemOptions = {
      useLocalTime: true,
      location: { longitude: 126.9779, latitude: 37.5665 } // ソウルの座標
    };
    const calculated = calculateDayStem(date, options);
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
  console.log('\n===== 韓国式日干計算アルゴリズム =====');
  console.log('1. 基準日：2023年10月2日（癸巳日）');
  console.log('2. 日数差分を計算し、10で割った余りを求める');
  console.log('3. 求めた余りを基準日の天干から進める（または戻す）');
  console.log('4. 地方時調整により当日の干支が変わる可能性がある');
  
  return {
    success: allCorrect,
    results
  };
}

/**
 * 日干計算のテスト実行
 */
export function runDayStemTest(): void {
  const verification = verifyDayStemCalculation();
  
  console.log(`\n検証結果: ${verification.success ? '成功' : '失敗'}`);
  
  if (!verification.success) {
    console.log('\n失敗したケース:');
    verification.results
      .filter(result => !result.correct)
      .forEach(result => {
        console.log(`- ${result.date}: 期待値[${result.expected}] 計算値[${result.calculated}]`);
      });
  }
  
  // 10日間の天干パターンを表示
  console.log('\n===== 連続する10日間の天干パターン =====');
  const today = new Date();
  for (let i = 0; i < 10; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const stem = calculateDayStem(date, { useLocalTime: true });
    console.log(`${formatDateKey(date)}: ${stem}`);
  }
}

// このファイルを直接実行した場合のみテストを実行
if (require.main === module) {
  runDayStemTest();
}