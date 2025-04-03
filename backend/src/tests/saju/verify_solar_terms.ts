/**
 * 24節気の検証用スクリプト
 * 月柱計算の不一致がある日付で、24節気データベースがあれば修正できるかを検証
 */

// 仮の24節気データ（実際の正確なデータに置き換える必要があります）
const SOLAR_TERM_DATA = {
  // 2023年の節気日時（実際の天文学的データに基づく）
  // 日時はJST（日本時間）を想定
  "2023": {
    "立春": { year: 2023, month: 2, day: 4, hour: 11, minute: 42 },
    "雨水": { year: 2023, month: 2, day: 19, hour: 6, minute: 34 },
    "啓蟄": { year: 2023, month: 3, day: 6, hour: 5, minute: 23 },
    "春分": { year: 2023, month: 3, day: 21, hour: 5, minute: 24 },
    "清明": { year: 2023, month: 4, day: 5, hour: 17, minute: 13 },
    "穀雨": { year: 2023, month: 4, day: 20, hour: 15, minute: 14 },
    "立夏": { year: 2023, month: 5, day: 5, hour: 20, minute: 19 },
    "小満": { year: 2023, month: 5, day: 21, hour: 9, minute: 50 },
    "芒種": { year: 2023, month: 6, day: 6, hour: 4, minute: 58 },
    "夏至": { year: 2023, month: 6, day: 21, hour: 15, minute: 58 },
    "小暑": { year: 2023, month: 7, day: 7, hour: 11, minute: 18 },
    "大暑": { year: 2023, month: 7, day: 23, hour: 10, minute: 9 },
    "立秋": { year: 2023, month: 8, day: 8, hour: 9, minute: 2 },
    "処暑": { year: 2023, month: 8, day: 23, hour: 12, minute: 2 },
    "白露": { year: 2023, month: 9, day: 8, hour: 1, minute: 16 },
    "秋分": { year: 2023, month: 9, day: 23, hour: 8, minute: 50 },
    "寒露": { year: 2023, month: 10, day: 8, hour: 21, minute: 16 },
    "霜降": { year: 2023, month: 10, day: 24, hour: 1, minute: 0 },
    "立冬": { year: 2023, month: 11, day: 8, hour: 0, minute: 36 },
    "小雪": { year: 2023, month: 11, day: 22, hour: 16, minute: 2 },
    "大雪": { year: 2023, month: 12, day: 7, hour: 12, minute: 33 },
    "冬至": { year: 2023, month: 12, day: 22, hour: 5, minute: 27 }
  },
  // 2022年の節気日時
  "2022": {
    "立春": { year: 2022, month: 2, day: 4, hour: 5, minute: 50 },
    "雨水": { year: 2022, month: 2, day: 19, hour: 0, minute: 43 },
    "啓蟄": { year: 2022, month: 3, day: 5, hour: 23, minute: 43 },
    "春分": { year: 2022, month: 3, day: 20, hour: 23, minute: 33 },
    "清明": { year: 2022, month: 4, day: 5, hour: 11, minute: 20 },
    "穀雨": { year: 2022, month: 4, day: 20, hour: 9, minute: 24 },
    "立夏": { year: 2022, month: 5, day: 5, hour: 14, minute: 25 },
    "小満": { year: 2022, month: 5, day: 21, hour: 3, minute: 50 },
    "芒種": { year: 2022, month: 6, day: 5, hour: 23, minute: 25 },
    "夏至": { year: 2022, month: 6, day: 21, hour: 10, minute: 13 },
    "小暑": { year: 2022, month: 7, day: 7, hour: 5, minute: 37 },
    "大暑": { year: 2022, month: 7, day: 23, hour: 4, minute: 7 },
    "立秋": { year: 2022, month: 8, day: 8, hour: 3, minute: 29 },
    "処暑": { year: 2022, month: 8, day: 23, hour: 5, minute: 16 },
    "白露": { year: 2022, month: 9, day: 7, hour: 19, minute: 32 },
    "秋分": { year: 2022, month: 9, day: 23, hour: 3, minute: 3 },
    "寒露": { year: 2022, month: 10, day: 8, hour: 15, minute: 22 },
    "霜降": { year: 2022, month: 10, day: 23, hour: 19, minute: 35 },
    "立冬": { year: 2022, month: 11, day: 7, hour: 18, minute: 45 },
    "小雪": { year: 2022, month: 11, day: 22, hour: 10, minute: 20 },
    "大雪": { year: 2022, month: 12, day: 7, hour: 6, minute: 46 },
    "冬至": { year: 2022, month: 12, day: 21, hour: 23, minute: 48 }
  }
};

/**
 * 日付が指定された節気の前か後かを判定する
 * @param date 判定する日付
 * @param solarTerm 節気名
 * @param year 年
 * @returns true: 節気前、false: 節気後
 */
function isBeforeSolarTerm(date: Date, solarTerm: string, year: number): boolean {
  const termData = SOLAR_TERM_DATA[year.toString()]?.[solarTerm];
  if (!termData) return false;
  
  const termDate = new Date(termData.year, termData.month - 1, termData.day, 
                           termData.hour, termData.minute);
  
  return date < termDate;
}

/**
 * 日付に対応する節気を特定する
 * @param date 日付
 * @returns 節気名
 */
function determineSolarTerm(date: Date): string | null {
  const year = date.getFullYear();
  const yearData = SOLAR_TERM_DATA[year.toString()];
  if (!yearData) return null;
  
  // 全ての節気を日付順にソートする
  const sortedTerms = Object.entries(yearData).sort((a, b) => {
    const dataA = a[1] as any;
    const dataB = b[1] as any;
    const dateA = new Date(dataA.year, dataA.month - 1, dataA.day, dataA.hour, dataA.minute);
    const dateB = new Date(dataB.year, dataB.month - 1, dataB.day, dataB.hour, dataB.minute);
    return dateA.getTime() - dateB.getTime();
  });
  
  // 指定された日付より前の最新の節気を見つける
  let currentTerm = null;
  for (const [term, termData] of sortedTerms) {
    const data = termData as any;
    const termDate = new Date(data.year, data.month - 1, data.day, 
                             data.hour, data.minute);
    if (termDate <= date) {
      currentTerm = term;
    } else {
      break;
    }
  }
  
  return currentTerm;
}

/**
 * 日付から月柱を決定する（節気ベース）
 * @param date 日付
 * @param yearStem 年干
 * @returns 推定月柱
 */
function estimateMonthPillarWithSolarTerms(date: Date, yearStem: string): string {
  const solarTerm = determineSolarTerm(date);
  if (!solarTerm) return "不明";
  
  // 節気に基づく月支マッピング
  const termToBranch = {
    "立春": "寅", "雨水": "寅",
    "啓蟄": "卯", "春分": "卯",
    "清明": "辰", "穀雨": "辰",
    "立夏": "巳", "小満": "巳",
    "芒種": "午", "夏至": "午",
    "小暑": "未", "大暑": "未",
    "立秋": "申", "処暑": "申",
    "白露": "酉", "秋分": "酉",
    "寒露": "戌", "霜降": "戌",
    "立冬": "亥", "小雪": "亥",
    "大雪": "子", "冬至": "子",
    "小寒": "丑", "大寒": "丑"
  };
  
  // 年干に基づく月柱マッピング
  const stemMapping = {
    "癸": { // 2023年（癸卯年）
      "小寒": "壬子", "立春": "甲寅", "啓蟄": "乙卯", "清明": "丙辰",
      "立夏": "丁巳", "芒種": "戊午", "小暑": "己未", "立秋": "庚申",
      "白露": "辛酉", "寒露": "壬戌", "立冬": "癸亥", "大雪": "甲子"
    },
    "壬": { // 2022年（壬寅年）
      "小寒": "癸丑", "立春": "丙寅", "啓蟄": "丁卯", "清明": "甲辰", 
      "立夏": "乙巳", "芒種": "丙午", "小暑": "丁未", "立秋": "戊申",
      "白露": "己酉", "寒露": "庚戌", "立冬": "辛亥", "大雪": "壬子"
    }
  };
  
  // 節気の主区分を取得（例：啓蟄、春分→啓蟄）
  const mainTerm = Object.keys(termToBranch).find(term => 
    termToBranch[term] === termToBranch[solarTerm] && 
    term.indexOf("立") === 0 || term.indexOf("清明") === 0 || 
    term.indexOf("小暑") === 0 || term.indexOf("白露") === 0 || 
    term.indexOf("寒露") === 0 || term.indexOf("大雪") === 0
  ) || solarTerm;
  
  // 年干に基づく特殊マッピングを適用
  if (stemMapping[yearStem] && stemMapping[yearStem][mainTerm]) {
    return stemMapping[yearStem][mainTerm];
  }
  
  // 基本的な推定（実際にはもっと複雑なロジックが必要）
  return `不明${termToBranch[solarTerm] || '?'}`;
}

// テスト用の日付
const testCases = [
  { 
    date: new Date(2023, 1, 4, 0, 0), // 2023年2月4日 0時（立春）
    yearStem: "癸",
    expected: "甲寅", 
    calculated: "癸丑",
    description: "2023年2月4日 0時（立春）"
  },
  { 
    date: new Date(2022, 4, 5, 0, 0), // 2022年5月5日 0時（立夏）
    yearStem: "壬",
    expected: "丁巳", 
    calculated: "甲辰",
    description: "2022年5月5日 0時（立夏）"
  },
  { 
    date: new Date(2023, 6, 15, 2, 0), // 2023年7月15日 2時
    yearStem: "癸",
    expected: "庚申", 
    calculated: "己未",
    description: "2023年7月15日 2時"
  }
];

// 検証実行
console.log("===== 24節気データベースによる月柱計算検証 =====");
testCases.forEach(({ date, yearStem, expected, calculated, description }) => {
  const solarTerm = determineSolarTerm(date);
  const estimatedPillar = estimateMonthPillarWithSolarTerms(date, yearStem);
  
  console.log(`\n【${description}】`);
  console.log(`- 年干: ${yearStem}`);
  console.log(`- 該当節気: ${solarTerm || '不明'}`);
  console.log(`- 節気発生時刻: ${solarTerm ? 
    (() => {
      const termData = SOLAR_TERM_DATA[date.getFullYear().toString()][solarTerm] as any;
      return `${termData.month}月${termData.day}日${termData.hour}時${termData.minute}分`;
    })() 
    : '不明'}`);
  console.log(`- 期待値: ${expected}`);
  console.log(`- 現在の計算値: ${calculated}`);
  console.log(`- 24節気DBでの推定値: ${estimatedPillar}`);
  
  // 節気前後の判定
  if (solarTerm) {
    const beforeTerm = isBeforeSolarTerm(date, solarTerm, date.getFullYear());
    console.log(`- 節気との関係: ${beforeTerm ? '節気前' : '節気後'}`);
  }
  
  // 問題の解析
  console.log("\n【問題分析】");
  if (solarTerm) {
    const termData = SOLAR_TERM_DATA[date.getFullYear().toString()][solarTerm] as any;
    const solarTermTime = new Date(
      termData.year,
      termData.month - 1,
      termData.day,
      termData.hour,
      termData.minute
    );
    
    const timeDiff = (date.getTime() - solarTermTime.getTime()) / (1000 * 60 * 60); // 時間単位の差
    
    if (Math.abs(timeDiff) < 24) {
      console.log(`- 節気境界問題: この日付は節気の発生時刻（${solarTermTime.toLocaleString()}）から${timeDiff.toFixed(1)}時間${timeDiff < 0 ? '前' : '後'}です。`);
      console.log("- 解決策: 24節気の正確な時刻を考慮したデータベースを使用することで修正できる可能性が高いです。");
    } else if (expected !== calculated) {
      console.log("- 特殊ケース: 節気境界から離れていても月柱が不一致しています。");
      console.log("- 解決策: 特定の年干・節気の組み合わせに対する特殊マッピングが必要かもしれません。");
    }
  } else {
    console.log("- データ不足: 該当する年の節気データがないため詳細な分析ができません。");
  }
});

// 検証結果のまとめ
console.log("\n===== 検証結果のまとめ =====");
console.log("1. 節気境界の正確な時刻: 節気の開始時刻を正確に把握することが重要です。");
console.log("2. 年干による月干の特殊規則: 年干ごとに月干の決定に特殊規則があります。");
console.log("3. 地方時調整: 経度に基づく地方時調整が計算に影響する可能性があります。");
console.log("\n24節気データベースを実装することで、多くの月柱計算の不一致が解消される可能性が高いです。");
console.log("特に節気境界付近の日付では、正確な時刻情報が重要です。");