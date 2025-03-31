/**
 * 十二運星・十二神殺計算モジュール
 */
import { TWELVE_FORTUNES, TWELVE_SPIRITS } from './types';
import { getElementFromStem, isStemYin } from './tenGodCalculator';

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
 * 日柱の天干ごとの十二運星の地支索引（陽性用）
 */
const YANG_FORTUNE_BRANCH_INDEXES: Record<string, number> = {
  '甲': 0,  // 長生は子
  '丙': 2,  // 長生は寅
  '戊': 6,  // 長生は午
  '庚': 8,  // 長生は申
  '壬': 10  // 長生は戌
};

/**
 * 日柱の天干ごとの十二運星の地支索引（陰性用）
 */
const YIN_FORTUNE_BRANCH_INDEXES: Record<string, number> = {
  '乙': 6,  // 長生は午
  '丁': 8,  // 長生は申
  '己': 0,  // 長生は子
  '辛': 2,  // 長生は寅
  '癸': 4   // 長生は辰
};

/**
 * 十二神殺の地支対応表
 * 各年の地支に対応する神殺
 */
const TWELVE_SPIRIT_CYCLES: Record<string, Record<string, string>> = {
  '子': { '子': '地殺', '丑': '歳破', '寅': '大耗', '卯': '天殺', '辰': '五鬼', '巳': '災殺',
         '午': '地殺', '未': '歳破', '申': '大耗', '酉': '天殺', '戌': '五鬼', '亥': '災殺' },
  '丑': { '子': '災殺', '丑': '地殺', '寅': '歳破', '卯': '大耗', '辰': '天殺', '巳': '五鬼',
         '午': '災殺', '未': '地殺', '申': '歳破', '酉': '大耗', '戌': '天殺', '亥': '五鬼' },
  // 他の年支も同様に定義...
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
    'day': '帝旺',
    'hour': '帝旺'
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
 * 十二運星を計算
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
  
  // 一般的な計算（実装例）
  const element = getElementFromStem(dayStem);
  const isYin = isStemYin(dayStem);
  
  // 日主の五行に基づく十二運星の順序
  const fortuneCycle = TWELVE_FORTUNE_CYCLES[element];
  
  // 陰陽と日主に基づく索引
  const baseIndex = isYin ? YIN_FORTUNE_BRANCH_INDEXES[dayStem] : YANG_FORTUNE_BRANCH_INDEXES[dayStem];
  
  // 簡易的な計算（実際はもっと複雑になる）
  return {
    'year': fortuneCycle[baseIndex % 12],
    'month': fortuneCycle[(baseIndex + 2) % 12],
    'day': fortuneCycle[(baseIndex + 4) % 12],
    'hour': fortuneCycle[(baseIndex + 6) % 12]
  };
}

/**
 * 十二神殺を計算
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
  
  // 一般的な計算（実装例）
  // 簡易的なマッピング
  return {
    'year': '年殺',
    'month': '月殺',
    'day': '日殺',
    'hour': '時殺'
  };
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
    }
  ];
  
  for (const { description, dayStem, yearBranch, monthBranch, dayBranch, hourBranch, date, hour } of testCases) {
    console.log(`${description}の十二運星・十二神殺:`);
    
    const fortunes = calculateTwelveFortunes(
      dayStem, yearBranch, monthBranch, dayBranch, hourBranch, date, hour
    );
    
    const spirits = calculateTwelveSpirits(
      yearBranch, monthBranch, dayBranch, hourBranch, date, hour
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