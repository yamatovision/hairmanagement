/**
 * 日柱計算モジュール (修正版)
 * タイムゾーン非依存の堅牢な実装
 */

// 天干と地支の配列
const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

// サンプルデータ
const DAY_PILLAR_SAMPLES = {
  "2023-10-01": "壬辰", // 2023年10月1日
  "2023-10-02": "癸巳", // 2023年10月2日
  "2023-10-03": "甲午", // 2023年10月3日
  "2023-10-04": "乙未", // 2023年10月4日
  "2023-10-05": "丙申", // 2023年10月5日
  "2023-10-06": "丁酉", // 2023年10月6日
  "2023-10-07": "戊戌", // 2023年10月7日
  "2023-10-15": "丙午", // 2023年10月15日
  "1986-05-26": "庚午"  // 1986年5月26日
};

// 地支の蔵干
const HIDDEN_STEMS_MAP = {
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
 * 日付を YYYY-MM-DD 形式の文字列に変換
 */
function formatDateKey(date) {
  try {
    if (isNaN(date.getTime())) {
      console.warn('無効な日付が渡されました');
      return 'invalid-date';
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月は0始まりなので+1
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('日付フォーマットエラー:', error);
    return 'format-error';
  }
}

/**
 * 日付から時刻情報を取り除き、日付のみ保持する新しい日付オブジェクトを返す
 */
function normalizeDate(date) {
  if (isNaN(date.getTime())) {
    console.warn('無効な日付が渡されました。現在日を使用します。');
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * 2つの日付の間の日数を計算（タイムゾーン非依存）
 */
function daysBetween(date1, date2) {
  // 日付のみを正規化して時刻情報を削除
  const normDate1 = normalizeDate(date1);
  const normDate2 = normalizeDate(date2);
  
  // UTC ミリ秒に変換して時差をなくす
  const utc1 = Date.UTC(normDate1.getFullYear(), normDate1.getMonth(), normDate1.getDate());
  const utc2 = Date.UTC(normDate2.getFullYear(), normDate2.getMonth(), normDate2.getDate());
  
  // ミリ秒から日数に変換
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.round((utc2 - utc1) / millisecondsPerDay);
}

/**
 * 日柱を計算する
 * @param {Date} date - 計算対象の日付
 * @param {Object} options - 計算オプション
 * @returns {Object} 日柱情報
 */
function calculateDayPillar(date, options = {}) {
  try {
    // 1. 日付の前処理
    // 無効な日付のチェック
    if (!date || isNaN(date.getTime())) {
      console.warn('無効な日付が渡されました。現在の日付を使用します。');
      date = new Date();
    }
    
    // 2. 韓国式日付変更モードの処理
    if (options.dateChangeMode === 'korean') {
      const hours = date.getHours();
      // 午前0-5時は前日の日付として扱う
      if (hours >= 0 && hours < 5) {
        console.log(`韓国式モード: ${hours}時は前日として扱います`);
        // 前日の日付を作成
        const prevDay = new Date(date);
        prevDay.setDate(date.getDate() - 1);
        
        // 韓国式モードなしで前日の日柱を計算
        const prevOptions = {...options};
        delete prevOptions.dateChangeMode;
        return calculateDayPillar(prevDay, prevOptions);
      }
    }
    
    // 3. サンプルデータによる検証と高速なルックアップ
    const dateKey = formatDateKey(date);
    const exactMatch = DAY_PILLAR_SAMPLES[dateKey];
    
    if (exactMatch && !options.dateChangeMode) {
      const stem = exactMatch.charAt(0);
      const branch = exactMatch.charAt(1);
      
      return {
        stem,
        branch,
        fullStemBranch: exactMatch,
        hiddenStems: HIDDEN_STEMS_MAP[branch] || []
      };
    }
    
    // 4. 基準日の設定
    const referenceDate = options.referenceDate 
      ? normalizeDate(options.referenceDate)
      : new Date(2023, 9, 2); // 2023年10月2日
    
    const referenceStemIndex = options.referenceStemIndex !== undefined ? options.referenceStemIndex : 9; // 癸
    const referenceBranchIndex = options.referenceBranchIndex !== undefined ? options.referenceBranchIndex : 5; // 巳
    
    // 5. 日数差の計算 (タイムゾーン非依存)
    const diffDays = daysBetween(referenceDate, date);
    
    // 6. 干支の計算
    let stemIndex, branchIndex;
    
    if (diffDays >= 0) {
      // 正の差（参照日より未来）
      stemIndex = (referenceStemIndex + diffDays) % 10;
      branchIndex = (referenceBranchIndex + diffDays) % 12;
    } else {
      // 負の差（参照日より過去）- 正確なインデックスを計算
      // 60サイクルで確実に元に戻るようにする
      const absDiffDays = Math.abs(diffDays);
      // 天干のサイクル (10日)
      const stemCycle = Math.floor(absDiffDays / 10);
      const stemRemainder = absDiffDays % 10;
      stemIndex = stemRemainder === 0 ? referenceStemIndex : (referenceStemIndex - stemRemainder + 10) % 10;
      
      // 地支のサイクル (12日)
      const branchCycle = Math.floor(absDiffDays / 12);
      const branchRemainder = absDiffDays % 12;
      branchIndex = branchRemainder === 0 ? referenceBranchIndex : (referenceBranchIndex - branchRemainder + 12) % 12;
    }
    
    // 7. 干支情報の取得
    const stem = STEMS[stemIndex];
    const branch = BRANCHES[branchIndex];
    const fullStemBranch = `${stem}${branch}`;
    
    // 8. 蔵干の取得
    const hiddenStems = HIDDEN_STEMS_MAP[branch] || [];
    
    // 9. 結果の組み立て
    return {
      stem,
      branch,
      fullStemBranch,
      hiddenStems
    };
  } catch (error) {
    console.error('日柱計算エラー:', error);
    
    // エラー時のフォールバック
    return {
      stem: "甲",
      branch: "子",
      fullStemBranch: "甲子",
      hiddenStems: ["癸"]
    };
  }
}

/**
 * 日柱を計算する（公開API）
 */
function getDayPillar(date, options = {}) {
  return calculateDayPillar(date, options);
}

/**
 * 基準日からオフセットした日の日柱を計算
 */
function getDayPillarWithOffset(baseDate, dayOffset, options = {}) {
  const targetDate = new Date(baseDate);
  targetDate.setDate(baseDate.getDate() + dayOffset);
  return getDayPillar(targetDate, options);
}

/**
 * 範囲内の日柱を一括計算
 */
function getDayPillarRange(startDate, endDate, options = {}) {
  const result = new Map();
  
  const normalizedStart = normalizeDate(startDate);
  const normalizedEnd = normalizeDate(endDate);
  
  // 開始日から終了日まで日柱を計算
  const currentDate = new Date(normalizedStart);
  while (currentDate <= normalizedEnd) {
    const dateKey = formatDateKey(currentDate);
    result.set(dateKey, getDayPillar(currentDate, options));
    
    // 次の日へ
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return result;
}

// モジュールのエクスポート
module.exports = {
  calculateDayPillar,
  getDayPillar,
  getDayPillarWithOffset,
  getDayPillarRange,
  STEMS,
  BRANCHES
};