/**
 * SajuEngine テストスクリプト - sample.mdとsample2.mdからのサンプルデータを使用
 */
import { SajuEngine } from '../../utils/saju/refactored/SajuEngine';
import * as fs from 'fs';
import * as path from 'path';

// テスト結果保存用ディレクトリの作成
const testResultsDir = path.join(__dirname);
if (!fs.existsSync(testResultsDir)) {
  fs.mkdirSync(testResultsDir, { recursive: true });
}

// テスト対象地域
const LOCATIONS = ['ソウル', '東京'];

// 最初のテストセット - sample.mdからの基本テスト
const TEST_SET_1 = [
  // 1. 年柱計算のサンプル
  {
    description: "1970年1月1日 0時 - 男性 ソウル",
    date: new Date(1970, 0, 1),
    hour: 0,
    gender: 'M' as 'M',
    location: 'ソウル',
    expected: {
      year: "己酉",
      month: "丙子",
      day: "辛巳",
      hour: "戊子"
    }
  },
  {
    description: "1985年1月1日 0時 - 男性 ソウル",
    date: new Date(1985, 0, 1),
    hour: 0,
    gender: 'M' as 'M',
    location: 'ソウル',
    expected: {
      year: "甲子",
      month: "丙子",
      day: "庚子",
      hour: "丙子"
    }
  },
  {
    description: "1995年1月1日 0時 - 男性 ソウル",
    date: new Date(1995, 0, 1),
    hour: 0,
    gender: 'M' as 'M',
    location: 'ソウル',
    expected: {
      year: "甲戌",
      month: "丙子",
      day: "壬辰",
      hour: "庚子"
    }
  },
  {
    description: "2005年1月1日 0時 - 男性 ソウル",
    date: new Date(2005, 0, 1),
    hour: 0,
    gender: 'M' as 'M',
    location: 'ソウル',
    expected: {
      year: "甲申",
      month: "丙子",
      day: "乙酉",
      hour: "丙子"
    }
  },
  {
    description: "2015年1月1日 0時 - 男性 ソウル",
    date: new Date(2015, 0, 1),
    hour: 0,
    gender: 'M' as 'M',
    location: 'ソウル',
    expected: {
      year: "甲午",
      month: "丙子",
      day: "丁丑",
      hour: "庚子"
    }
  },

  // 2. 月柱計算のサンプル
  {
    description: "2023年2月3日 0時 (立春前) - 女性 ソウル",
    date: new Date(2023, 1, 3),
    hour: 0,
    gender: 'F' as 'F',
    location: 'ソウル',
    expected: {
      year: "壬寅",
      month: "癸丑",
      day: "壬辰",
      hour: "庚子"
    }
  },
  {
    description: "2023年2月4日 0時 (立春) - 女性 ソウル",
    date: new Date(2023, 1, 4),
    hour: 0,
    gender: 'F' as 'F',
    location: 'ソウル',
    expected: {
      year: "癸卯",
      month: "甲寅",
      day: "癸巳",
      hour: "壬子"
    }
  },
  {
    description: "2023年5月5日 0時 (立夏前) - 女性 ソウル",
    date: new Date(2023, 4, 5),
    hour: 0,
    gender: 'F' as 'F',
    location: 'ソウル',
    expected: {
      year: "癸卯",
      month: "丙辰",
      day: "癸亥",
      hour: "壬子"
    }
  },
  {
    description: "2023年8月7日 0時 (立秋前) - 女性 ソウル",
    date: new Date(2023, 7, 7),
    hour: 0,
    gender: 'F' as 'F',
    location: 'ソウル',
    expected: {
      year: "癸卯",
      month: "己未",
      day: "丁酉",
      hour: "庚子"
    }
  },
  {
    description: "2023年11月7日 0時 (立冬前) - 女性 ソウル",
    date: new Date(2023, 10, 7),
    hour: 0,
    gender: 'F' as 'F',
    location: 'ソウル',
    expected: {
      year: "癸卯",
      month: "壬戌",
      day: "己巳",
      hour: "甲子"
    }
  },
  {
    description: "2023年12月21日 0時 (冬至) - 女性 ソウル",
    date: new Date(2023, 11, 21),
    hour: 0,
    gender: 'F' as 'F',
    location: 'ソウル',
    expected: {
      year: "癸卯",
      month: "甲子",
      day: "癸丑",
      hour: "壬子"
    }
  },

  // 3. 日柱計算のサンプル
  {
    description: "2023年10月1日 0時 - 女性 ソウル",
    date: new Date(2023, 9, 1),
    hour: 0,
    gender: 'F' as 'F',
    location: 'ソウル',
    expected: {
      year: "癸卯",
      month: "辛酉",
      day: "壬辰",
      hour: "庚子"
    }
  },
  {
    description: "2023年10月2日 0時 - 女性 ソウル",
    date: new Date(2023, 9, 2),
    hour: 0,
    gender: 'F' as 'F',
    location: 'ソウル',
    expected: {
      year: "癸卯",
      month: "辛酉",
      day: "癸巳",
      hour: "壬子"
    }
  },
  {
    description: "2023年10月3日 0時 - 女性 ソウル",
    date: new Date(2023, 9, 3),
    hour: 0,
    gender: 'F' as 'F',
    location: 'ソウル',
    expected: {
      year: "癸卯",
      month: "辛酉",
      day: "甲午",
      hour: "甲子"
    }
  },
  {
    description: "2023年10月4日 0時 - 女性 ソウル",
    date: new Date(2023, 9, 4),
    hour: 0,
    gender: 'F' as 'F',
    location: 'ソウル',
    expected: {
      year: "癸卯",
      month: "辛酉",
      day: "乙未",
      hour: "丙子"
    }
  },
  {
    description: "2023年10月5日 0時 - 女性 ソウル",
    date: new Date(2023, 9, 5),
    hour: 0,
    gender: 'F' as 'F',
    location: 'ソウル',
    expected: {
      year: "癸卯",
      month: "辛酉",
      day: "丙申",
      hour: "戊子"
    }
  },

  // 4. 時柱計算のサンプル
  {
    description: "2023年10月15日 1時 (子の刻) - 女性 ソウル",
    date: new Date(2023, 9, 15),
    hour: 1,
    gender: 'F' as 'F',
    location: 'ソウル',
    expected: {
      year: "癸卯",
      month: "壬戌",
      day: "丙午",
      hour: "戊子"
    }
  },
  {
    description: "2023年10月15日 5時 (卯の刻) - 女性 ソウル",
    date: new Date(2023, 9, 15),
    hour: 5,
    gender: 'F' as 'F',
    location: 'ソウル',
    expected: {
      year: "癸卯",
      month: "壬戌",
      day: "丙午",
      hour: "庚寅"
    }
  },
  {
    description: "2023年10月15日 9時 (午の刻) - 女性 ソウル",
    date: new Date(2023, 9, 15),
    hour: 9,
    gender: 'F' as 'F',
    location: 'ソウル',
    expected: {
      year: "癸卯",
      month: "壬戌",
      day: "丙午",
      hour: "壬辰"
    }
  },
  {
    description: "2023年10月15日 13時 (未の刻) - 女性 ソウル",
    date: new Date(2023, 9, 15),
    hour: 13,
    gender: 'F' as 'F',
    location: 'ソウル',
    expected: {
      year: "癸卯",
      month: "壬戌",
      day: "丙午",
      hour: "甲午"
    }
  },
  {
    description: "2023年10月15日 17時 (酉の刻) - 女性 ソウル",
    date: new Date(2023, 9, 15),
    hour: 17,
    gender: 'F' as 'F',
    location: 'ソウル',
    expected: {
      year: "癸卯",
      month: "壬戌",
      day: "丙午",
      hour: "丙申"
    }
  },
  {
    description: "2023年10月15日 21時 (亥の刻) - 女性 ソウル",
    date: new Date(2023, 9, 15),
    hour: 21,
    gender: 'F' as 'F',
    location: 'ソウル',
    expected: {
      year: "癸卯",
      month: "壬戌",
      day: "丙午",
      hour: "戊戌"
    }
  },

  // 5. 性別差の検証サンプル
  {
    description: "1990年5月15日 12時 - 女性 ソウル",
    date: new Date(1990, 4, 15),
    hour: 12,
    gender: 'F' as 'F',
    location: 'ソウル',
    expected: {
      year: "庚午",
      month: "辛巳",
      day: "庚辰",
      hour: "壬午"
    }
  },
  {
    description: "1990年5月15日 12時 - 男性 ソウル",
    date: new Date(1990, 4, 15),
    hour: 12,
    gender: 'M' as 'M',
    location: 'ソウル',
    expected: {
      year: "庚午",
      month: "辛巳",
      day: "庚辰",
      hour: "壬午"
    }
  },

  // 6. 地域差の検証サンプル
  {
    description: "2023年10月15日 12時 - 男性 東京",
    date: new Date(2023, 9, 15),
    hour: 12,
    gender: 'M' as 'M',
    location: '東京',
    expected: {
      year: "癸卯",
      month: "壬戌",
      day: "丙午",
      hour: "甲午"
    }
  },
  {
    description: "2023年10月15日 12時 - 男性 ソウル",
    date: new Date(2023, 9, 15),
    hour: 12,
    gender: 'M' as 'M',
    location: 'ソウル',
    expected: {
      year: "癸卯",
      month: "壬戌",
      day: "丙午",
      hour: "甲午"
    }
  },
];

// 追加テストセット - sample2.mdからの特殊ケース
const TEST_SET_2 = [
  // 1. 甲日の時間変化サンプル
  {
    description: "1987年5月8日 11時 - 女性 ソウル",
    date: new Date(1987, 4, 8),
    hour: 11,
    gender: 'F' as 'F',
    location: 'ソウル',
    expected: {
      year: "丁卯",
      month: "乙巳",
      day: "丁巳",
      hour: "乙巳"
    }
  },
  {
    description: "1987年5月8日 12時 - 女性 ソウル",
    date: new Date(1987, 4, 8),
    hour: 12,
    gender: 'F' as 'F',
    location: 'ソウル',
    expected: {
      year: "丁卯",
      month: "乙巳",
      day: "丁巳",
      hour: "丙午"
    }
  },
  {
    description: "1987年5月8日 13時 - 女性 ソウル",
    date: new Date(1987, 4, 8),
    hour: 13,
    gender: 'F' as 'F',
    location: 'ソウル',
    expected: {
      year: "丁卯",
      month: "乙巳",
      day: "丁巳",
      hour: "丙午"
    }
  },

  // 2. サマータイム影響調査
  {
    description: "1986年6月1日 23時 - 女性 ソウル",
    date: new Date(1986, 5, 1, 23),
    hour: 23,
    gender: 'F' as 'F',
    location: 'ソウル',
    expected: {
      year: "丙寅",
      month: "癸巳",
      day: "丙子",
      hour: "己亥"
    }
  },
  {
    description: "1986年6月1日 0時 - 女性 ソウル",
    date: new Date(1986, 5, 1),
    hour: 0,
    gender: 'F' as 'F',
    location: 'ソウル',
    expected: {
      year: "丙寅",
      month: "癸巳",
      day: "丙子",
      hour: "戊子"
    }
  },

  // 3. 詳細な地域差テスト
  {
    description: "2024年2月4日 12時 (立春) - 女性 東京",
    date: new Date(2024, 1, 4),
    hour: 12,
    gender: 'F' as 'F',
    location: '東京',
    expected: {
      year: "甲辰",
      month: "乙卯",
      day: "戊戌",
      hour: "戊午"
    }
  },
  {
    description: "2023年2月3日 12時 - 女性 東京",
    date: new Date(2023, 1, 3),
    hour: 12,
    gender: 'F' as 'F',
    location: '東京',
    expected: {
      year: "壬寅",
      month: "癸丑",
      day: "壬辰",
      hour: "丙午"
    }
  },

  // 4. その他の年代テスト
  {
    description: "1924年1月1日 0時 - 男性 ソウル",
    date: new Date(1924, 0, 1),
    hour: 0,
    gender: 'M' as 'M',
    location: 'ソウル',
    expected: {
      year: "癸亥",
      month: "壬子",
      day: "丙戌",
      hour: "甲子"
    }
  },
  {
    description: "1984年1月1日 0時 - 男性 ソウル",
    date: new Date(1984, 0, 1),
    hour: 0,
    gender: 'M' as 'M',
    location: 'ソウル',
    expected: {
      year: "癸亥",
      month: "壬子",
      day: "辛酉",
      hour: "甲子"
    }
  },
  {
    description: "2044年1月1日 0時 - 男性 ソウル",
    date: new Date(2044, 0, 1),
    hour: 0,
    gender: 'M' as 'M',
    location: 'ソウル',
    expected: {
      year: "癸亥",
      month: "壬子",
      day: "乙未",
      hour: "甲子"
    }
  },
];

// オプションのその他のテストケース
const ADDITIONAL_TESTS = [
  {
    description: "2022年1月31日 12時 - 男性 ソウル",
    date: new Date(2022, 0, 31),
    hour: 12,
    gender: 'M' as 'M',
    location: 'ソウル',
    expected: {
      year: "辛丑",
      month: "辛丑",
      day: "己卯",
      hour: "丁巳"
    }
  },
  {
    description: "2022年2月1日 12時 - 男性 ソウル",
    date: new Date(2022, 1, 1),
    hour: 12,
    gender: 'M' as 'M',
    location: 'ソウル',
    expected: {
      year: "辛丑",
      month: "辛丑",
      day: "庚辰",
      hour: "丁巳"
    }
  },
  {
    description: "2022年5月5日 0時 (立夏) - 女性 ソウル",
    date: new Date(2022, 4, 5),
    hour: 0,
    gender: 'F' as 'F',
    location: 'ソウル',
    expected: {
      year: "壬寅",
      month: "丁巳",
      day: "丁亥",
      hour: "庚子"
    }
  },
  {
    description: "2022年5月5日 12時 (立夏) - 女性 ソウル",
    date: new Date(2022, 4, 5),
    hour: 12,
    gender: 'F' as 'F',
    location: 'ソウル',
    expected: {
      year: "壬寅",
      month: "丁巳",
      day: "丁亥",
      hour: "丙午"
    }
  },
  {
    description: "1986年7月1日 12時 - 男性 ソウル",
    date: new Date(1986, 6, 1),
    hour: 12,
    gender: 'M' as 'M',
    location: 'ソウル',
    expected: {
      year: "丙寅",
      month: "己未",
      day: "戊子",
      hour: "丙午"
    }
  },
  {
    description: "1986年7月2日 12時 - 男性 ソウル",
    date: new Date(1986, 6, 2),
    hour: 12,
    gender: 'M' as 'M',
    location: 'ソウル',
    expected: {
      year: "丙寅",
      month: "己未",
      day: "己丑",
      hour: "丙午"
    }
  },
  {
    description: "2022年11月15日 0時 (子の刻) - 女性 ソウル",
    date: new Date(2022, 10, 15),
    hour: 0,
    gender: 'F' as 'F',
    location: 'ソウル',
    expected: {
      year: "壬寅",
      month: "辛亥",
      day: "丁酉",
      hour: "戊子"
    }
  },
  {
    description: "2022年11月15日 12時 (午の刻) - 女性 ソウル",
    date: new Date(2022, 10, 15),
    hour: 12,
    gender: 'F' as 'F',
    location: 'ソウル',
    expected: {
      year: "壬寅",
      month: "辛亥",
      day: "丁酉",
      hour: "甲午"
    }
  },
  {
    description: "2023年2月20日 12時 (閏月) - 男性 ソウル",
    date: new Date(2023, 1, 20),
    hour: 12,
    gender: 'M' as 'M',
    location: 'ソウル',
    expected: {
      year: "癸卯",
      month: "甲寅",
      day: "己未",
      hour: "丙午"
    }
  },
  {
    description: "2023年3月1日 23時 (甲日の子刻近く) - 男性 ソウル",
    date: new Date(2023, 2, 1, 23),
    hour: 23,
    gender: 'M' as 'M',
    location: 'ソウル',
    expected: {
      year: "癸卯",
      month: "甲寅",
      day: "甲戌",
      hour: "甲亥"
    }
  },
  {
    description: "2023年3月6日 0時 (己日の子刻) - 男性 ソウル",
    date: new Date(2023, 2, 6),
    hour: 0,
    gender: 'M' as 'M',
    location: 'ソウル',
    expected: {
      year: "癸卯",
      month: "甲寅",
      day: "己卯",
      hour: "甲子"
    }
  },
  {
    description: "2023年3月2日 12時 (乙日の午刻) - 男性 ソウル",
    date: new Date(2023, 2, 2),
    hour: 12,
    gender: 'M' as 'M',
    location: 'ソウル',
    expected: {
      year: "癸卯",
      month: "甲寅",
      day: "乙亥",
      hour: "丙午"
    }
  },
  {
    description: "2023年3月3日 12時 (丙日の午刻) - 男性 ソウル",
    date: new Date(2023, 2, 3),
    hour: 12,
    gender: 'M' as 'M',
    location: 'ソウル',
    expected: {
      year: "癸卯",
      month: "甲寅",
      day: "丙子",
      hour: "戊午"
    }
  },
  {
    description: "2023年3月4日 12時 (丁日の午刻) - 男性 ソウル",
    date: new Date(2023, 2, 4),
    hour: 12,
    gender: 'M' as 'M',
    location: 'ソウル',
    expected: {
      year: "癸卯",
      month: "甲寅",
      day: "丁丑",
      hour: "庚午"
    }
  },
  {
    description: "2023年3月5日 12時 (戊日の午刻) - 男性 ソウル",
    date: new Date(2023, 2, 5),
    hour: 12,
    gender: 'M' as 'M',
    location: 'ソウル',
    expected: {
      year: "癸卯",
      month: "甲寅",
      day: "戊寅",
      hour: "壬午"
    }
  },
  {
    description: "2023年7月15日 2時 - 男性 ソウル",
    date: new Date(2023, 6, 15, 2),
    hour: 2,
    gender: 'M' as 'M',
    location: 'ソウル',
    expected: {
      year: "癸卯",
      month: "庚申",
      day: "壬午",
      hour: "庚丑"
    }
  },
  {
    description: "2023年7月15日 4時 - 男性 ソウル",
    date: new Date(2023, 6, 15, 4),
    hour: 4,
    gender: 'M' as 'M',
    location: 'ソウル',
    expected: {
      year: "癸卯",
      month: "庚申",
      day: "壬午",
      hour: "壬寅"
    }
  },
  {
    description: "2023年7月15日 6時 - 男性 ソウル",
    date: new Date(2023, 6, 15, 6),
    hour: 6,
    gender: 'M' as 'M',
    location: 'ソウル',
    expected: {
      year: "癸卯",
      month: "庚申",
      day: "壬午",
      hour: "甲卯"
    }
  },
  {
    description: "2023年7月15日 8時 - 男性 ソウル",
    date: new Date(2023, 6, 15, 8),
    hour: 8,
    gender: 'M' as 'M',
    location: 'ソウル',
    expected: {
      year: "癸卯",
      month: "庚申",
      day: "壬午",
      hour: "丙辰"
    }
  },
  {
    description: "2023年7月15日 10時 - 男性 ソウル",
    date: new Date(2023, 6, 15, 10),
    hour: 10,
    gender: 'M' as 'M',
    location: 'ソウル',
    expected: {
      year: "癸卯",
      month: "庚申",
      day: "壬午",
      hour: "戊巳"
    }
  },
];

// 全テストケースを結合
const ALL_TESTS = [...TEST_SET_1, ...TEST_SET_2, ...ADDITIONAL_TESTS];

/**
 * 四柱情報をフォーマットして表示用文字列に変換
 */
function formatFourPillars(fourPillars) {
  return `年柱[${fourPillars.yearPillar.fullStemBranch}] ` +
         `月柱[${fourPillars.monthPillar.fullStemBranch}] ` +
         `日柱[${fourPillars.dayPillar.fullStemBranch}] ` +
         `時柱[${fourPillars.hourPillar.fullStemBranch}]`;
}

/**
 * テスト期待値をフォーマット
 */
function formatPillarExpectation(expected) {
  if (!expected) return "動的に計算";
  return `年柱[${expected.year}] 月柱[${expected.month}] 日柱[${expected.day}] 時柱[${expected.hour}]`;
}

/**
 * SajuEngine包括的テスト
 */
function runTests(): void {
  console.log('======= SajuEngine サンプルテスト =======');
  console.log(`実行日時: ${new Date().toLocaleString()}`);
  console.log(`テスト総数: ${ALL_TESTS.length}件\n`);
  
  // 新しいエンジンのインスタンスを作成
  const engine = new SajuEngine();
  
  let totalTests = 0;
  let passedTests = 0;
  
  // 柱ごとの成功カウント
  let yearSuccess = 0;
  let monthSuccess = 0;
  let daySuccess = 0;
  let hourSuccess = 0;

  // 一致数の分布
  let match0 = 0;
  let match1 = 0;
  let match2 = 0;
  let match3 = 0;
  let match4 = 0;

  // 不一致パターン分析用
  const yearMismatches: Record<string, number> = {};
  const monthMismatches: Record<string, number> = {};
  const dayMismatches: Record<string, number> = {};
  const hourMismatches: Record<string, number> = {};

  // テスト結果の詳細保存用
  const testResults = [];
  
  for (const test of ALL_TESTS) {
    let thisTestMatches = 0;
    let testResult = {
      description: test.description,
      expected: formatPillarExpectation(test.expected),
      actual: '',
      matches: ''
    };
    
    try {
      // SajuEngineで計算
      const result = engine.calculate(
        test.date,
        test.hour,
        test.gender,
        test.location
      );
      
      const calculatedResult = formatFourPillars(result.fourPillars);
      testResult.actual = calculatedResult;
      
      // 期待値との比較
      if (test.expected) {
        const yearResult = result.fourPillars.yearPillar.fullStemBranch === test.expected.year;
        const monthResult = result.fourPillars.monthPillar.fullStemBranch === test.expected.month;
        const dayResult = result.fourPillars.dayPillar.fullStemBranch === test.expected.day;
        const hourResult = result.fourPillars.hourPillar.fullStemBranch === test.expected.hour;
        
        totalTests += 4;
        if (yearResult) { passedTests++; yearSuccess++; thisTestMatches++; }
        if (monthResult) { passedTests++; monthSuccess++; thisTestMatches++; }
        if (dayResult) { passedTests++; daySuccess++; thisTestMatches++; }
        if (hourResult) { passedTests++; hourSuccess++; thisTestMatches++; }
        
        // 不一致を記録
        if (!yearResult) {
          const key = `${test.expected.year} → ${result.fourPillars.yearPillar.fullStemBranch}`;
          yearMismatches[key] = (yearMismatches[key] || 0) + 1;
        }
        if (!monthResult) {
          const key = `${test.expected.month} → ${result.fourPillars.monthPillar.fullStemBranch}`;
          monthMismatches[key] = (monthMismatches[key] || 0) + 1;
        }
        if (!dayResult) {
          const key = `${test.expected.day} → ${result.fourPillars.dayPillar.fullStemBranch}`;
          dayMismatches[key] = (dayMismatches[key] || 0) + 1;
        }
        if (!hourResult) {
          const key = `${test.expected.hour} → ${result.fourPillars.hourPillar.fullStemBranch}`;
          hourMismatches[key] = (hourMismatches[key] || 0) + 1;
        }
        
        testResult.matches = `年[${yearResult ? '✓' : '✗'}] 月[${monthResult ? '✓' : '✗'}] 日[${dayResult ? '✓' : '✗'}] 時[${hourResult ? '✓' : '✗'}]`;
        
        // 一致数のカウント
        switch (thisTestMatches) {
          case 0: match0++; break;
          case 1: match1++; break;
          case 2: match2++; break;
          case 3: match3++; break;
          case 4: match4++; break;
        }
      }
    } catch (error) {
      console.error(`【エラー】${test.description}の計算中にエラーが発生:`, error);
      testResult.actual = `エラー: ${error.message}`;
      testResult.matches = 'エラー';
    }
    
    testResults.push(testResult);
  }
  
  // Markdownテーブル形式で結果を保存
  const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
  
  let markdownReport = `# SajuEngine テスト結果レポート\n\n`;
  markdownReport += `**実行日時**: ${new Date().toLocaleString()}\n`;
  markdownReport += `**テスト総数**: ${ALL_TESTS.length}件\n\n`;
  
  markdownReport += `## 1. 全体の統計情報\n\n`;
  markdownReport += `- **総テスト数**: ${ALL_TESTS.length}件\n`;
  markdownReport += `- **総検証ポイント**: ${totalTests}箇所 (年柱・月柱・日柱・時柱)\n`;
  markdownReport += `- **一致したポイント**: ${passedTests}箇所\n`;
  markdownReport += `- **全体の成功率**: ${successRate.toFixed(2)}%\n\n`;
  
  markdownReport += `### 柱ごとの成功率\n\n`;
  markdownReport += `- **年柱**: ${yearSuccess}/${ALL_TESTS.length} (${((yearSuccess / ALL_TESTS.length) * 100).toFixed(2)}%)\n`;
  markdownReport += `- **月柱**: ${monthSuccess}/${ALL_TESTS.length} (${((monthSuccess / ALL_TESTS.length) * 100).toFixed(2)}%)\n`;
  markdownReport += `- **日柱**: ${daySuccess}/${ALL_TESTS.length} (${((daySuccess / ALL_TESTS.length) * 100).toFixed(2)}%)\n`;
  markdownReport += `- **時柱**: ${hourSuccess}/${ALL_TESTS.length} (${((hourSuccess / ALL_TESTS.length) * 100).toFixed(2)}%)\n\n`;
  
  markdownReport += `### 一致数の分布\n\n`;
  markdownReport += `- **完全一致 (4柱)**: ${match4}件 (${((match4 / ALL_TESTS.length) * 100).toFixed(2)}%)\n`;
  markdownReport += `- **3柱一致**: ${match3}件 (${((match3 / ALL_TESTS.length) * 100).toFixed(2)}%)\n`;
  markdownReport += `- **2柱一致**: ${match2}件 (${((match2 / ALL_TESTS.length) * 100).toFixed(2)}%)\n`;
  markdownReport += `- **1柱一致**: ${match1}件 (${((match1 / ALL_TESTS.length) * 100).toFixed(2)}%)\n`;
  markdownReport += `- **不一致 (0柱)**: ${match0}件 (${((match0 / ALL_TESTS.length) * 100).toFixed(2)}%)\n\n`;
  
  markdownReport += `## 2. 不一致パターン分析\n\n`;
  
  markdownReport += `### 年柱の不一致パターン\n\n`;
  markdownReport += `| 変換パターン | 件数 |\n`;
  markdownReport += `|------------|------|\n`;
  Object.entries(yearMismatches).sort((a, b) => b[1] - a[1]).forEach(([pattern, count]) => {
    markdownReport += `| ${pattern} | ${count} |\n`;
  });
  
  markdownReport += `\n### 月柱の不一致パターン\n\n`;
  markdownReport += `| 変換パターン | 件数 |\n`;
  markdownReport += `|------------|------|\n`;
  Object.entries(monthMismatches).sort((a, b) => b[1] - a[1]).forEach(([pattern, count]) => {
    markdownReport += `| ${pattern} | ${count} |\n`;
  });
  
  markdownReport += `\n### 日柱の不一致パターン\n\n`;
  markdownReport += `| 変換パターン | 件数 |\n`;
  markdownReport += `|------------|------|\n`;
  Object.entries(dayMismatches).sort((a, b) => b[1] - a[1]).forEach(([pattern, count]) => {
    markdownReport += `| ${pattern} | ${count} |\n`;
  });
  
  markdownReport += `\n### 時柱の不一致パターン\n\n`;
  markdownReport += `| 変換パターン | 件数 |\n`;
  markdownReport += `|------------|------|\n`;
  Object.entries(hourMismatches).sort((a, b) => b[1] - a[1]).forEach(([pattern, count]) => {
    markdownReport += `| ${pattern} | ${count} |\n`;
  });
  
  markdownReport += `\n## 3. 詳細テスト結果\n\n`;
  markdownReport += `| 説明 | 期待値 | 計算結果 | 一致 |\n`;
  markdownReport += `|------|--------|---------|------|\n`;
  testResults.forEach(result => {
    markdownReport += `| ${result.description} | ${result.expected} | ${result.actual} | ${result.matches} |\n`;
  });
  
  markdownReport += `\n## 4. 改善が必要な主な問題点\n\n`;
  markdownReport += `テスト結果から、以下の主な問題点が特定されました：\n\n`;
  markdownReport += `1. **立春日の柱計算**: 2月4日前後の年柱計算で不一致が見られます。立春の時刻を正確に考慮した年柱切り替えロジックが必要です。\n\n`;
  markdownReport += `2. **時柱計算の韓国式対応**: 特に子の刻（23時-1時）の時干計算に不一致が見られます。日干に基づく時干マッピングの韓国式ルールに対応する必要があります。\n\n`;
  markdownReport += `3. **節気境界の特殊処理**: 立秋前、立夏前などの月柱計算に不一致が見られます。節気境界日の特殊処理ロジックを実装する必要があります。\n\n`;
  
  markdownReport += `## 5. 改善計画\n\n`;
  markdownReport += `1. **specialCaseHandler.ts** の実装拡張:\n`;
  markdownReport += `   - 立春日の特殊処理\n`;
  markdownReport += `   - 節気境界の処理\n`;
  markdownReport += `   - 韓国式時柱計算ルールの実装\n\n`;
  
  markdownReport += `2. **DateTimeProcessor** の精密化:\n`;
  markdownReport += `   - 経度に基づく地方時調整の精度向上\n`;
  markdownReport += `   - 日付変更対応の強化\n\n`;
  
  markdownReport += `3. **SajuEngine** の計算ロジック強化:\n`;
  markdownReport += `   - 立春時刻の正確な取得と反映\n`;
  markdownReport += `   - 干支境界の精密な処理\n`;
  
  // 結果をファイルに保存
  fs.writeFileSync(path.join(testResultsDir, 'test_results.md'), markdownReport);
  
  // 成功率を表示
  console.log(`\nテスト結果統計:\n`);
  console.log(`- 総テスト数: ${ALL_TESTS.length}件`);
  console.log(`- 総検証ポイント: ${totalTests}箇所`);
  console.log(`- 一致したポイント: ${passedTests}箇所`);
  console.log(`- 全体の成功率: ${successRate.toFixed(2)}%\n`);
  
  console.log(`柱ごとの成功率:`);
  console.log(`- 年柱: ${yearSuccess}/${ALL_TESTS.length} (${((yearSuccess / ALL_TESTS.length) * 100).toFixed(2)}%)`);
  console.log(`- 月柱: ${monthSuccess}/${ALL_TESTS.length} (${((monthSuccess / ALL_TESTS.length) * 100).toFixed(2)}%)`);
  console.log(`- 日柱: ${daySuccess}/${ALL_TESTS.length} (${((daySuccess / ALL_TESTS.length) * 100).toFixed(2)}%)`);
  console.log(`- 時柱: ${hourSuccess}/${ALL_TESTS.length} (${((hourSuccess / ALL_TESTS.length) * 100).toFixed(2)}%)\n`);
  
  console.log(`詳細なテスト結果レポートが以下に保存されました: ${path.join(testResultsDir, 'test_results.md')}`);
}

// モジュールとして利用される場合のエクスポート
export default runTests;

// このファイルが直接実行された場合にテストを実行
if (require.main === module) {
  runTests();
}