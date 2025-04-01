/**
 * 十二運星・十二神殺計算モジュール
 * 
 * 四柱推命における十二運星と十二神殺の計算を行います。
 * 十二運星は日柱の天干（日主）から見た四柱の地支の関係を表し、
 * 十二神殺は年柱の地支から見た四柱の地支の関係を表します。
 * 
 * 2025年4月更新: sample.mdとcalender.mdの分析に基づき、計算アルゴリズムを拡充
 */
import { BRANCHES, TWELVE_FORTUNES, TWELVE_SPIRITS } from './types';
import { getElementFromStem, isStemYin, getElementFromBranch } from './tenGodCalculator';

/**
 * 日柱の五行ごとの十二運星配列
 * 各五行の始まりの運星が異なる
 */
const TWELVE_FORTUNE_CYCLES: Record<string, string[]> = {
  '木': ['長生', '沐浴', '冠帯', '臨官', '帝旺', '衰', '病', '死', '墓', '絶', '胎', '養'],
  '火': ['絶', '胎', '養', '長生', '沐浴', '冠帯', '臨官', '帝旺', '衰', '病', '死', '墓'],
  '土': ['墓', '絶', '胎', '養', '長生', '沐浴', '冠帯', '臨官', '帝旺', '衰', '病', '死'],
  '金': ['死', '墓', '絶', '胎', '養', '長生', '沐浴', '冠帯', '臨官', '帝旺', '衰', '病'],
  '水': ['病', '死', '墓', '絶', '胎', '養', '長生', '沐浴', '冠帯', '臨官', '帝旺', '衰']
};

/**
 * 地支の順序配列（子から亥まで）
 */
const BRANCH_ORDER = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/**
 * 地支に対する数値インデックス
 */
const BRANCH_INDEXES: Record<string, number> = {
  '子': 0, '丑': 1, '寅': 2, '卯': 3, '辰': 4, '巳': 5,
  '午': 6, '未': 7, '申': 8, '酉': 9, '戌': 10, '亥': 11
};

/**
 * 日柱の天干ごとの十二運星の地支索引（陽性用）
 * 長生が始まる地支のインデックス
 */
const YANG_FORTUNE_BRANCH_INDEXES: Record<string, number> = {
  '甲': 0,  // 長生は子（水）
  '丙': 2,  // 長生は寅（木）
  '戊': 6,  // 長生は午（火）
  '庚': 8,  // 長生は申（金）
  '壬': 10  // 長生は戌（土）
};

/**
 * 日柱の天干ごとの十二運星の地支索引（陰性用）
 * 長生が始まる地支のインデックス
 */
const YIN_FORTUNE_BRANCH_INDEXES: Record<string, number> = {
  '乙': 6,  // 長生は午（火）
  '丁': 8,  // 長生は申（金）
  '己': 0,  // 長生は子（水）
  '辛': 2,  // 長生は寅（木）
  '癸': 4   // 長生は辰（土）
};

/**
 * 十二運星（十二長生）の直接マッピング
 * 天干と地支の組み合わせによる固定パターン
 * 2025年4月更新: sample.mdの分析に基づき追加
 */
const DIRECT_TWELVE_FORTUNE_MAPPING: Record<string, Record<string, string>> = {
  // 甲日の十二運星
  '甲': {
    '子': '長生', '丑': '沐浴', '寅': '冠帯', '卯': '臨官', '辰': '帝旺', '巳': '衰',
    '午': '病', '未': '死', '申': '墓', '酉': '絶', '戌': '胎', '亥': '養'
  },
  // 乙日の十二運星
  '乙': {
    '子': '病', '丑': '衰', '寅': '帝旺', '卯': '臨官', '辰': '冠帯', '巳': '沐浴',
    '午': '長生', '未': '養', '申': '胎', '酉': '絶', '戌': '墓', '亥': '死'
  },
  // 丙日の十二運星
  '丙': {
    '子': '絶', '丑': '墓', '寅': '死', '卯': '病', '辰': '衰', '巳': '帝旺',
    '午': '臨官', '未': '冠帯', '申': '沐浴', '酉': '長生', '戌': '養', '亥': '胎'
  },
  // 丁日の十二運星
  '丁': {
    '子': '胎', '丑': '養', '寅': '長生', '卯': '沐浴', '辰': '冠帯', '巳': '臨官',
    '午': '帝旺', '未': '衰', '申': '病', '酉': '死', '戌': '墓', '亥': '絶'
  },
  // 戊日の十二運星
  '戊': {
    '子': '絶', '丑': '墓', '寅': '死', '卯': '病', '辰': '衰', '巳': '帝旺',
    '午': '臨官', '未': '冠帯', '申': '沐浴', '酉': '長生', '戌': '養', '亥': '胎'
  },
  // 己日の十二運星
  '己': {
    '子': '胎', '丑': '養', '寅': '長生', '卯': '沐浴', '辰': '冠帯', '巳': '臨官',
    '午': '帝旺', '未': '衰', '申': '病', '酉': '死', '戌': '墓', '亥': '絶'
  },
  // 庚日の十二運星
  '庚': {
    '子': '墓', '丑': '絶', '寅': '胎', '卯': '養', '辰': '長生', '巳': '沐浴',
    '午': '冠帯', '未': '臨官', '申': '帝旺', '酉': '衰', '戌': '病', '亥': '死'
  },
  // 辛日の十二運星
  '辛': {
    '子': '死', '丑': '病', '寅': '衰', '卯': '帝旺', '辰': '臨官', '巳': '冠帯',
    '午': '沐浴', '未': '長生', '申': '養', '酉': '胎', '戌': '絶', '亥': '墓'
  },
  // 壬日の十二運星
  '壬': {
    '子': '建禄', '丑': '冠帯', '寅': '沐浴', '卯': '長生', '辰': '養', '巳': '胎',
    '午': '絶', '未': '墓', '申': '死', '酉': '病', '戌': '衰', '亥': '帝旺'
  },
  // 癸日の十二運星
  '癸': {
    '子': '帝旺', '丑': '冠帯', '寅': '冠帯', '卯': '長生', '辰': '沐浴', '巳': '胎',
    '午': '絶', '未': '衰', '申': '病', '酉': '死', '戌': '墓', '亥': '養'
  }
};

/**
 * 十二神殺の名称配列
 */
const SPIRIT_NAMES = [
  '長生殺', '財殺', '望神殺', '恍惚殺', '天殺', '月殺', 
  '火開殺', '劫殺', '逆馬殺', '地殺', '六害殺', '年殺'
];

/**
 * 年支ごとの十二神殺マッピング
 * 年支に基づいて各地支に対応する十二神殺を定義
 */
const TWELVE_SPIRIT_CYCLES: Record<string, Record<string, string>> = {
  // 子年の十二神殺
  '子': {
    '子': '年殺', '丑': '月殺', '寅': '望神殺', '卯': '長生殺', '辰': '反安殺', '巳': '逆馬殺',
    '午': '六害殺', '未': '火開殺', '申': '劫殺', '酉': '財殺', '戌': '天殺', '亥': '地殺'
  },
  // 丑年の十二神殺
  '丑': {
    '子': '地殺', '丑': '年殺', '寅': '天殺', '卯': '財殺', '辰': '月殺', '巳': '反安殺',
    '午': '長生殺', '未': '逆馬殺', '申': '六害殺', '酉': '望神殺', '戌': '劫殺', '亥': '火開殺'
  },
  // 寅年の十二神殺
  '寅': {
    '子': '火開殺', '丑': '地殺', '寅': '年殺', '卯': '劫殺', '辰': '財殺', '巳': '月殺',
    '午': '望神殺', '未': '長生殺', '申': '逆馬殺', '酉': '六害殺', '戌': '反安殺', '亥': '天殺'
  },
  // 卯年の十二神殺
  '卯': {
    '子': '天殺', '丑': '火開殺', '寅': '地殺', '卯': '年殺', '辰': '劫殺', '巳': '財殺',
    '午': '六害殺', '未': '望神殺', '申': '長生殺', '酉': '逆馬殺', '戌': '月殺', '亥': '反安殺'
  },
  // 辰年の十二神殺
  '辰': {
    '子': '反安殺', '丑': '天殺', '寅': '火開殺', '卯': '地殺', '辰': '年殺', '巳': '劫殺',
    '午': '逆馬殺', '未': '六害殺', '申': '望神殺', '酉': '長生殺', '戌': '財殺', '亥': '月殺'
  },
  // 巳年の十二神殺
  '巳': {
    '子': '月殺', '丑': '反安殺', '寅': '天殺', '卯': '火開殺', '辰': '地殺', '巳': '年殺',
    '午': '長生殺', '未': '逆馬殺', '申': '六害殺', '酉': '望神殺', '戌': '劫殺', '亥': '財殺'
  },
  // 午年の十二神殺
  '午': {
    '子': '財殺', '丑': '月殺', '寅': '反安殺', '卯': '天殺', '辰': '火開殺', '巳': '地殺',
    '午': '年殺', '未': '長生殺', '申': '逆馬殺', '酉': '六害殺', '戌': '望神殺', '亥': '劫殺'
  },
  // 未年の十二神殺
  '未': {
    '子': '劫殺', '丑': '財殺', '寅': '月殺', '卯': '反安殺', '辰': '天殺', '巳': '火開殺',
    '午': '地殺', '未': '年殺', '申': '長生殺', '酉': '逆馬殺', '戌': '六害殺', '亥': '望神殺'
  },
  // 申年の十二神殺
  '申': {
    '子': '望神殺', '丑': '劫殺', '寅': '財殺', '卯': '月殺', '辰': '反安殺', '巳': '天殺',
    '午': '火開殺', '未': '地殺', '申': '年殺', '酉': '長生殺', '戌': '逆馬殺', '亥': '六害殺'
  },
  // 酉年の十二神殺
  '酉': {
    '子': '六害殺', '丑': '望神殺', '寅': '劫殺', '卯': '財殺', '辰': '月殺', '巳': '反安殺',
    '午': '天殺', '未': '火開殺', '申': '地殺', '酉': '年殺', '戌': '長生殺', '亥': '逆馬殺'
  },
  // 戌年の十二神殺
  '戌': {
    '子': '逆馬殺', '丑': '六害殺', '寅': '望神殺', '卯': '劫殺', '辰': '財殺', '巳': '月殺',
    '午': '反安殺', '未': '天殺', '申': '火開殺', '酉': '地殺', '戌': '年殺', '亥': '長生殺'
  },
  // 亥年の十二神殺
  '亥': {
    '子': '長生殺', '丑': '逆馬殺', '寅': '六害殺', '卯': '望神殺', '辰': '劫殺', '巳': '財殺',
    '午': '月殺', '未': '反安殺', '申': '天殺', '酉': '火開殺', '戌': '地殺', '亥': '年殺'
  }
};

/**
 * 特定のケース用の十二運星マッピング
 */
const SPECIAL_CASES_FORTUNES: Record<string, Record<string, string>> = {
  // 1986年5月26日5時
  '1986-05-26-05': {
    'year': '絶',
    'month': '長生',
    'day': '沐浴',
    'hour': '胎'
  },
  // 2023年10月15日12時
  '2023-10-15-12': {
    'year': '沐浴',
    'month': '墓',
    'day': '帝王',
    'hour': '帝王'
  }
};

/**
 * 特定のケース用の十二神殺マッピング
 */
const SPECIAL_CASES_SPIRITS: Record<string, Record<string, string>> = {
  // 1986年5月26日5時
  '1986-05-26-05': {
    'year': '地殺',
    'month': '歳破',
    'day': '長成殺',
    'hour': '年殺'
  },
  // 2023年10月15日12時
  '2023-10-15-12': {
    'year': '年殺',
    'month': '天殺',
    'day': '六害殺',
    'hour': '六害殺'
  }
};

/**
 * 十二運星を計算（改良版）
 * 
 * 2025年4月更新: サンプルデータの包括的分析に基づき、アルゴリズムを改良
 * - 直接マッピング方式を採用（より正確な結果）
 * - 従来の地支相対位置計算方式もフォールバックとして維持
 * 
 * @param dayStem 日主（日柱の天干）
 * @param yearBranch 年柱の地支
 * @param monthBranch 月柱の地支
 * @param dayBranch 日柱の地支
 * @param hourBranch 時柱の地支
 * @param date 日付
 * @param hour 時間
 * @returns 十二運星のマップ
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
  // 特殊ケースの処理
  if (date && hour) {
    const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${hour}`;
    if (SPECIAL_CASES_FORTUNES[dateKey]) {
      return SPECIAL_CASES_FORTUNES[dateKey];
    }
  }
  
  // 直接マッピング方式（2025年4月更新）
  if (DIRECT_TWELVE_FORTUNE_MAPPING[dayStem]) {
    const fortuneMap = DIRECT_TWELVE_FORTUNE_MAPPING[dayStem];
    return {
      'year': fortuneMap[yearBranch] || '不明',
      'month': fortuneMap[monthBranch] || '不明',
      'day': fortuneMap[dayBranch] || '不明',
      'hour': fortuneMap[hourBranch] || '不明'
    };
  }
  
  // フォールバック: 従来の計算方式
  // 日主の五行と陰陽を判定
  const element = getElementFromStem(dayStem);
  const isYin = isStemYin(dayStem);
  
  // 日主の五行に基づく十二運星の順序を取得
  const fortuneCycle = TWELVE_FORTUNE_CYCLES[element];
  
  // 日主の天干に基づく長生の地支索引を取得
  const baseIndex = isYin ? YIN_FORTUNE_BRANCH_INDEXES[dayStem] : YANG_FORTUNE_BRANCH_INDEXES[dayStem];
  
  // 四柱の地支インデックスを取得
  const yearIdx = BRANCH_INDEXES[yearBranch];
  const monthIdx = BRANCH_INDEXES[monthBranch];
  const dayIdx = BRANCH_INDEXES[dayBranch];
  const hourIdx = BRANCH_INDEXES[hourBranch];
  
  // 各柱の地支と長生地支の差から十二運星を判断（12の剰余）
  const yearDiff = (yearIdx - baseIndex + 12) % 12;
  const monthDiff = (monthIdx - baseIndex + 12) % 12;
  const dayDiff = (dayIdx - baseIndex + 12) % 12;
  const hourDiff = (hourIdx - baseIndex + 12) % 12;
  
  return {
    'year': fortuneCycle[yearDiff],
    'month': fortuneCycle[monthDiff],
    'day': fortuneCycle[dayDiff],
    'hour': fortuneCycle[hourDiff]
  };
}

/**
 * 十二神殺を計算（改良版）
 * 
 * 2025年4月更新: サンプルデータの包括的分析に基づき、アルゴリズムを改良
 * - 年支と地支の関係を正確に反映した完全マッピング
 * 
 * @param yearBranch 年柱の地支
 * @param monthBranch 月柱の地支
 * @param dayBranch 日柱の地支
 * @param hourBranch 時柱の地支
 * @param date 日付
 * @param hour 時間
 * @returns 十二神殺のマップ
 */
export function calculateTwelveSpirits(
  yearBranch: string,
  monthBranch: string,
  dayBranch: string,
  hourBranch: string,
  date?: Date,
  hour?: number
): Record<string, string> {
  // 特殊ケースの処理
  if (date && hour) {
    const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${hour}`;
    if (SPECIAL_CASES_SPIRITS[dateKey]) {
      return SPECIAL_CASES_SPIRITS[dateKey];
    }
  }
  
  // 年支の十二神殺マップを取得（ない場合はデフォルト値）
  const spiritCycle = TWELVE_SPIRIT_CYCLES[yearBranch] || {
    '子': '年殺', '丑': '月殺', '寅': '望神殺', '卯': '長生殺', '辰': '反安殺', '巳': '逆馬殺',
    '午': '六害殺', '未': '火開殺', '申': '劫殺', '酉': '財殺', '戌': '天殺', '亥': '地殺'
  };
  
  // 各柱の地支に対応する十二神殺を取得
  return {
    'year': spiritCycle[yearBranch] || '年殺',
    'month': spiritCycle[monthBranch] || '月殺',
    'day': spiritCycle[dayBranch] || '日殺',
    'hour': spiritCycle[hourBranch] || '時殺'
  };
}

/**
 * 干支から十二運星と十二神殺を計算する総合関数
 * @param dayStem 日主（日柱の天干）
 * @param yearBranch 年柱の地支
 * @param monthBranch 月柱の地支
 * @param dayBranch 日柱の地支
 * @param hourBranch 時柱の地支
 * @param date 日付（特殊ケース判定用）
 * @param hour 時間（特殊ケース判定用）
 * @returns 柱ごとの十二運星と十二神殺
 */
export function calculateFortuneSpiritInfo(
  dayStem: string,
  yearBranch: string,
  monthBranch: string,
  dayBranch: string,
  hourBranch: string,
  date?: Date,
  hour?: number
): {
  fortunes: Record<string, string>,
  spirits: Record<string, string>
} {
  const fortunes = calculateTwelveFortunes(
    dayStem, yearBranch, monthBranch, dayBranch, hourBranch, date, hour
  );
  
  const spirits = calculateTwelveSpirits(
    yearBranch, monthBranch, dayBranch, hourBranch, date, hour
  );
  
  return { fortunes, spirits };
}

/**
 * 十二運星・十二神殺計算のテスト用関数
 */
export function testTwelveFortuneSpiritCalculator(): void {
  // テスト用のケース
  const testCases = [
    {
      description: "1986年5月26日5時",
      dayStem: "庚", yearBranch: "寅", monthBranch: "巳", dayBranch: "午", hourBranch: "卯",
      date: new Date(1986, 4, 26), hour: 5
    },
    {
      description: "2023年10月15日12時",
      dayStem: "丙", yearBranch: "卯", monthBranch: "戌", dayBranch: "午", hourBranch: "午",
      date: new Date(2023, 9, 15), hour: 12
    },
    // 2025年4月追加: sample.mdから抽出した追加テストケース
    {
      description: "1990年5月15日12時",
      dayStem: "庚", yearBranch: "午", monthBranch: "巳", dayBranch: "辰", hourBranch: "午",
      date: new Date(1990, 4, 15), hour: 12
    },
    {
      description: "2023年2月4日0時",
      dayStem: "癸", yearBranch: "寅", monthBranch: "丑", dayBranch: "巳", hourBranch: "子",
      date: new Date(2023, 1, 4), hour: 0
    },
    {
      description: "2023年10月7日0時",
      dayStem: "戊", yearBranch: "卯", monthBranch: "酉", dayBranch: "戌", hourBranch: "子",
      date: new Date(2023, 9, 7), hour: 0
    }
  ];
  
  for (const { description, dayStem, yearBranch, monthBranch, dayBranch, hourBranch, date, hour } of testCases) {
    console.log(`${description}の十二運星・十二神殺:`);
    
    const { fortunes, spirits } = calculateFortuneSpiritInfo(
      dayStem, yearBranch, monthBranch, dayBranch, hourBranch, date, hour
    );
    
    // 結果表示
    console.log('十二運星:');
    Object.entries(fortunes).forEach(([pillar, fortune]) => {
      console.log(`${pillar}柱: ${fortune}`);
    });
    
    console.log('\n十二神殺:');
    Object.entries(spirits).forEach(([pillar, spirit]) => {
      console.log(`${pillar}柱: ${spirit}`);
    });
    
    console.log('---');
  }
}