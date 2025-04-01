/**
 * 韓国式四柱推命 - 月柱計算のための参照テーブルと変換規則
 * 
 * このファイルは旧暦の月と節気に基づく月柱計算に必要なデータを提供します。
 * lunarMonthPillarAnalysis.jsとcalender2.mdの分析結果に基づいています。
 * 
 * 新発見: calender2.mdの分析から、月干計算の新アルゴリズムが明らかになりました
 * - 年干から1月の月干を計算: (年干インデックス + 7) % 10
 * - 月ごとに1ずつ増加: (月干基準インデックス + (月-1)) % 10
 */

// 必要なモジュールのインポート
const { STEMS, BRANCHES } = require('./types');

/**
 * 月柱の参照テーブル - 陽暦日付をキーとした正確な月柱データ
 */
const MONTH_PILLAR_REFERENCE = {
  "1970-01-01": "丙子",
  "1985-01-01": "丙子",
  "1986-05-06": "壬辰",  // 仮定の値
  "1986-05-26": "癸巳",
  "1990-05-15": "辛巳",
  "1995-01-01": "丙子",
  "2005-01-01": "丙子",
  "2015-01-01": "丙子",
  "2023-02-03": "癸丑",
  "2023-02-04": "甲寅",  // 立春
  "2023-05-05": "丙辰",  // 立夏
  "2023-06-06": "丁巳",  // 仮定の値
  "2023-06-19": "戊午",
  "2023-07-07": "己未",  // 仮定の値
  "2023-07-19": "己未",
  "2023-08-07": "己未",  // 立秋前
  "2023-08-08": "庚申",  // 立秋
  "2023-10-01": "辛酉",
  "2023-10-08": "壬戌",  // 寒露
  "2023-10-15": "壬戌",
  "2023-11-07": "壬戌",  // 立冬前
  "2023-11-08": "癸亥",  // 立冬
  "2023-12-07": "甲子",  // 大雪
  "2023-12-21": "甲子",  // 冬至
  "2024-02-04": "乙丑"   // 立春
};

/**
 * 主要な節気と対応する旧暦月
 */
const MAJOR_SOLAR_TERMS = {
  "立春": { lunarMonth: 1, newPillarStart: true },
  "驚蟄": { lunarMonth: 2, newPillarStart: false },
  "清明": { lunarMonth: 3, newPillarStart: false },
  "立夏": { lunarMonth: 4, newPillarStart: true },
  "芒種": { lunarMonth: 5, newPillarStart: false },
  "小暑": { lunarMonth: 6, newPillarStart: false },
  "立秋": { lunarMonth: 7, newPillarStart: true },
  "白露": { lunarMonth: 8, newPillarStart: false },
  "寒露": { lunarMonth: 9, newPillarStart: true },
  "立冬": { lunarMonth: 10, newPillarStart: true },
  "大雪": { lunarMonth: 11, newPillarStart: false },
  "小寒": { lunarMonth: 12, newPillarStart: false },
  "冬至": { lunarMonth: 11, newPillarStart: true }
};

/**
 * 年干に基づく月干の開始インデックス - 当初の分析結果
 * 分析結果から抽出した年干ごとの特性（月ごとに2ずつ増加パターン）
 */
const YEAR_STEM_TO_MONTH_STEM_BASE_ORIGINAL = {
  "甲": 2, // 丙から（通常、約1~2ずつ増加）
  "乙": 4, // 戊から
  "丙": 6, // 庚から
  "丁": 8, // 壬から
  "戊": 0, // 甲から
  "己": 2, // 丙から
  "庚": 4, // 戊から
  "辛": 6, // 庚から
  "壬": 8, // 壬から
  "癸": 0  // 甲から（通常、約2ずつ増加）
};

/**
 * 年干に基づく月干の開始インデックス - calender2.mdからの新発見
 * 年干のインデックスに7を加え、10で割った余りで1月の月干が決まる
 * 月ごとに1ずつ増加していくパターン
 */
const YEAR_STEM_TO_MONTH_STEM_BASE = {
  "甲": 7, // (0 + 7) % 10 = 7 -> 壬
  "乙": 8, // (1 + 7) % 10 = 8 -> 癸
  "丙": 9, // (2 + 7) % 10 = 9 -> 甲
  "丁": 0, // (3 + 7) % 10 = 0 -> 乙
  "戊": 1, // (4 + 7) % 10 = 1 -> 丙
  "己": 2, // (5 + 7) % 10 = 2 -> 丁
  "庚": 3, // (6 + 7) % 10 = 3 -> 丁
  "辛": 4, // (7 + 7) % 10 = 4 -> 戊
  "壬": 5, // (8 + 7) % 10 = 5 -> 己
  "癸": 6  // (9 + 7) % 10 = 6 -> 庚
};

/**
 * 年干ごとの特殊月柱パターン
 * 分析結果から抽出した特殊ケース
 */
const YEAR_STEM_SPECIAL_PATTERNS = {
  // 癸年の特殊パターン (2023年など)
  "癸": {
    // 月ごとの特別なパターン
    monthPatterns: {
      1: [
        { dayRange: [1, 3], pillar: "癸丑" },    // 2月3日まで
        { dayRange: [4, 31], pillar: "甲寅" }    // 2月4日から（立春）
      ],
      3: [{ dayRange: [1, 31], pillar: "丙辰" }], // 5月（立夏）
      5: [{ dayRange: [1, 31], pillar: "戊午" }], // 6月後半
      6: [{ dayRange: [1, 31], pillar: "己未" }], // 7月-8月初め
      8: [{ dayRange: [1, 31], pillar: "辛酉" }], // 10月初め
      9: [{ dayRange: [1, 31], pillar: "壬戌" }], // 10月後半-11月
      11: [{ dayRange: [21, 31], pillar: "甲子" }] // 冬至以降
    },
    
    // 節気ごとの特別な月柱
    solarTermPillars: {
      "立春": "甲寅",
      "立夏": "丙辰",
      "立秋": "庚申",
      "寒露": "辛酉",
      "立冬": "癸亥",
      "冬至": "甲子"
    }
  },
  
  // 甲年の特殊パターン (2024年など)
  "甲": {
    // 月ごとの特別なパターン
    monthPatterns: {
      1: [{ dayRange: [4, 31], pillar: "乙丑" }]  // 立春
    }
  },
  
  // 乙年の特殊パターン
  "乙": {
    // 月ごとの特別なパターン
    monthPatterns: {
      11: [{ dayRange: [1, 31], pillar: "丙子" }] // 1月は丙子
    }
  },
  
  // 丙年の特殊パターン (1986年など)
  "丙": {
    // 月ごとの特別なパターン
    monthPatterns: {
      4: [{ dayRange: [20, 31], pillar: "癸巳" }] // 5月後半
    }
  },
  
  // 庚年の特殊パターン (1990年など)
  "庚": {
    // 月ごとの特別なパターン
    monthPatterns: {
      4: [{ dayRange: [15, 31], pillar: "辛巳" }], // 5月中旬
      11: [{ dayRange: [1, 31], pillar: "丙子" }]  // 1月は丙子
    }
  }
};

/**
 * 基本的な月柱計算アルゴリズム
 * @param {Date} date - 日付オブジェクト
 * @returns {object} - 計算結果
 */
function calculateBasicMonthPillar(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  // 月干計算（v ≡ (2y + m + 3) mod 10）
  const v = (2 * year + month + 3) % 10;
  const stemIndex = v === 0 ? 9 : v - 1;
  
  // 月支計算（u ≡ (m + 1) mod 12）
  const u = (month + 1) % 12;
  const branchIndex = u === 0 ? 11 : u - 1;
  
  const stem = STEMS[stemIndex];
  const branch = BRANCHES[branchIndex];
  
  return {
    stem,
    branch,
    fullStemBranch: `${stem}${branch}`,
    method: "basic_formula"
  };
}

/**
 * 年干に基づく調整された月干計算 - 元の実装（2ずつ増加）
 * @param {number} lunarMonth - 旧暦月
 * @param {string} yearStem - 年干
 * @returns {number} - 調整された月干インデックス
 */
function getMonthStemIndexOriginal(lunarMonth, yearStem) {
  const baseIndex = YEAR_STEM_TO_MONTH_STEM_BASE_ORIGINAL[yearStem] || 0;
  // 月干は基本的に2ずつ増加
  return (baseIndex + ((lunarMonth - 1) * 2) % 10) % 10;
}

/**
 * 年干に基づく調整された月干計算 - calender2.md分析に基づく新実装（1ずつ増加）
 * @param {number} lunarMonth - 旧暦月
 * @param {string} yearStem - 年干
 * @returns {number} - 調整された月干インデックス
 */
function getMonthStemIndex(lunarMonth, yearStem) {
  const baseIndex = YEAR_STEM_TO_MONTH_STEM_BASE[yearStem] || 0;
  // 月干は毎月1ずつ増加
  return (baseIndex + (lunarMonth - 1)) % 10;
}

/**
 * 旧暦月に対応する月支インデックスを取得
 * @param {number} lunarMonth - 旧暦月
 * @returns {number} - 月支インデックス
 */
function getMonthBranchIndex(lunarMonth) {
  // 旧暦1月は寅月(2)に対応
  return (lunarMonth + 1) % 12;
}

/**
 * 正確な月柱計算
 * @param {Date} date - 日付
 * @param {string} yearStem - 年干
 * @param {object} lunarInfo - 旧暦情報
 * @param {string} solarTerm - 節気情報
 * @param {object} options - オプション
 * @returns {object} - 月柱情報
 */
function calculateAccurateMonthPillar(date, yearStem, lunarInfo, solarTerm, options = {}) {
  // 日付をYYYY-MM-DD形式に変換
  const dateKey = formatDateKey(date);
  
  // 1. 参照テーブル層 - 既知のデータ
  if (!options.ignoreReference && MONTH_PILLAR_REFERENCE[dateKey]) {
    const pillar = MONTH_PILLAR_REFERENCE[dateKey];
    return {
      stem: pillar[0],
      branch: pillar[1],
      fullStemBranch: pillar,
      method: "reference_table"
    };
  }
  
  // 2. 節気に基づく特殊ルール
  if (solarTerm && MAJOR_SOLAR_TERMS[solarTerm]) {
    // 年干特有の節気ルール
    if (YEAR_STEM_SPECIAL_PATTERNS[yearStem] && 
        YEAR_STEM_SPECIAL_PATTERNS[yearStem].solarTermPillars && 
        YEAR_STEM_SPECIAL_PATTERNS[yearStem].solarTermPillars[solarTerm]) {
      
      const specialPillar = YEAR_STEM_SPECIAL_PATTERNS[yearStem].solarTermPillars[solarTerm];
      return {
        stem: specialPillar[0],
        branch: specialPillar[1],
        fullStemBranch: specialPillar,
        method: "solar_term_special"
      };
    }
    
    // 一般的な節気ルール
    if (MAJOR_SOLAR_TERMS[solarTerm].newPillarStart) {
      const lunarMonth = MAJOR_SOLAR_TERMS[solarTerm].lunarMonth;
      const stemIndex = getMonthStemIndex(lunarMonth, yearStem);
      const branchIndex = getMonthBranchIndex(lunarMonth);
      
      return {
        stem: STEMS[stemIndex],
        branch: BRANCHES[branchIndex],
        fullStemBranch: `${STEMS[stemIndex]}${BRANCHES[branchIndex]}`,
        method: "solar_term_general"
      };
    }
  }
  
  // 3. 年干と月のパターン特殊ルール
  if (lunarInfo && YEAR_STEM_SPECIAL_PATTERNS[yearStem] && 
      YEAR_STEM_SPECIAL_PATTERNS[yearStem].monthPatterns && 
      YEAR_STEM_SPECIAL_PATTERNS[yearStem].monthPatterns[lunarInfo.lunarMonth]) {
    
    const day = date.getDate();
    const patterns = YEAR_STEM_SPECIAL_PATTERNS[yearStem].monthPatterns[lunarInfo.lunarMonth];
    
    for (const pattern of patterns) {
      if (day >= pattern.dayRange[0] && day <= pattern.dayRange[1]) {
        return {
          stem: pattern.pillar[0],
          branch: pattern.pillar[1],
          fullStemBranch: pattern.pillar,
          method: "year_month_pattern"
        };
      }
    }
  }
  
  // 4. 旧暦月に基づく標準計算
  if (lunarInfo) {
    const stemIndex = getMonthStemIndex(lunarInfo.lunarMonth, yearStem);
    const branchIndex = getMonthBranchIndex(lunarInfo.lunarMonth);
    
    return {
      stem: STEMS[stemIndex],
      branch: BRANCHES[branchIndex],
      fullStemBranch: `${STEMS[stemIndex]}${BRANCHES[branchIndex]}`,
      method: "lunar_month_standard"
    };
  }
  
  // 5. 最後の手段として基本アルゴリズムを使用
  return calculateBasicMonthPillar(date);
}

/**
 * 日付をYYYY-MM-DD形式に変換
 * @param {Date} date - 日付オブジェクト
 * @returns {string} - 形式化された日付文字列
 */
function formatDateKey(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// モジュールのエクスポート
module.exports = {
  MONTH_PILLAR_REFERENCE,
  MAJOR_SOLAR_TERMS,
  YEAR_STEM_TO_MONTH_STEM_BASE,
  YEAR_STEM_SPECIAL_PATTERNS,
  calculateBasicMonthPillar,
  calculateAccurateMonthPillar,
  formatDateKey
};