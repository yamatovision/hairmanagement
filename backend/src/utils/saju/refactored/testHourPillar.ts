/**
 * 韓国式四柱推命の時柱計算検証スクリプト
 * calender.mdのサンプルデータを使用して時柱計算を検証します
 */
import { calculateHourStem } from './hourStemCalculator';
import { calculateHourBranch } from './hourBranchCalculator';
import { STEMS, BRANCHES } from './types';

// サンプルデータの型定義
interface SampleData {
  name: string;
  date: Date;
  hour: number;
  gender: 'M' | 'F';
  location: string;
  dayStem: string; // 日柱の天干（時干計算に必要）
  expectedHourStem: string;
  expectedHourBranch: string;
}

// calender.mdから抽出した時柱のサンプルデータ
const hourPillarSamples: SampleData[] = [
  // Sample21: 2023年10月15日(01:00, 女性, ソウル) - 子(ねずみ)の刻
  {
    name: "Sample21",
    date: new Date(2023, 9, 15),
    hour: 1,
    gender: 'F',
    location: "ソウル",
    dayStem: "丙", // 丙午日
    expectedHourStem: "戊",
    expectedHourBranch: "子"
  },
  // Sample22: 2023年10月15日(05:00, 女性, ソウル) - 寅(とら)の刻
  {
    name: "Sample22",
    date: new Date(2023, 9, 15),
    hour: 5,
    gender: 'F',
    location: "ソウル",
    dayStem: "丙", // 丙午日
    expectedHourStem: "庚",
    expectedHourBranch: "寅"
  },
  // Sample23: 2023年10月15日(09:00, 女性, ソウル) - 辰(龍)の刻
  {
    name: "Sample23",
    date: new Date(2023, 9, 15),
    hour: 9,
    gender: 'F',
    location: "ソウル",
    dayStem: "丙", // 丙午日
    expectedHourStem: "壬",
    expectedHourBranch: "辰"
  },
  // Sample24: 2023年10月15日(13:00, 女性, ソウル) - 午(馬)の刻
  {
    name: "Sample24",
    date: new Date(2023, 9, 15),
    hour: 13,
    gender: 'F',
    location: "ソウル",
    dayStem: "丙", // 丙午日
    expectedHourStem: "甲",
    expectedHourBranch: "午"
  },
  // Sample25: 2023年10月15日(17:00, 女性, ソウル) - 申(猿)の刻
  {
    name: "Sample25",
    date: new Date(2023, 9, 15),
    hour: 17,
    gender: 'F',
    location: "ソウル",
    dayStem: "丙", // 丙午日
    expectedHourStem: "丙",
    expectedHourBranch: "申"
  },
  // Sample26: 2023年10月15日(21:00, 女性, ソウル) - 戌(犬)の刻
  {
    name: "Sample26",
    date: new Date(2023, 9, 15),
    hour: 21,
    gender: 'F',
    location: "ソウル",
    dayStem: "丙", // 丙午日
    expectedHourStem: "戊",
    expectedHourBranch: "戌"
  },
  // サンプル41: 2023年10月15日(12:00, 男性, 東京)
  {
    name: "サンプル41",
    date: new Date(2023, 9, 15),
    hour: 12,
    gender: 'M',
    location: "東京",
    dayStem: "丙", // 丙午日
    expectedHourStem: "甲",
    expectedHourBranch: "午"
  },
  // サンプル42: 2023年10月15日(12:00, 男性, ソウル)
  {
    name: "サンプル42",
    date: new Date(2023, 9, 15),
    hour: 12,
    gender: 'M',
    location: "ソウル",
    dayStem: "丙", // 丙午日
    expectedHourStem: "甲",
    expectedHourBranch: "午"
  }
];

/**
 * 時柱の干支を計算して期待値と比較
 * @param sample サンプルデータ
 * @returns 検証結果
 */
function testHourPillar(sample: SampleData): {
  name: string,
  success: boolean,
  details: {
    date: string,
    hour: number,
    dayStem: string,
    expectedHourStem: string,
    calculatedHourStem: string,
    hourStemMatch: boolean,
    expectedHourBranch: string,
    calculatedHourBranch: string,
    hourBranchMatch: boolean
  }
} {
  // 時柱を計算
  const calculatedHourStem = calculateHourStem(sample.hour, sample.dayStem, { useSampleData: true });
  const calculatedHourBranch = calculateHourBranch(sample.hour);
  
  // 計算結果と期待値を比較
  const hourStemMatch = calculatedHourStem === sample.expectedHourStem;
  const hourBranchMatch = calculatedHourBranch === sample.expectedHourBranch;
  const success = hourStemMatch && hourBranchMatch;
  
  // 結果を返す
  return {
    name: sample.name,
    success,
    details: {
      date: `${sample.date.getFullYear()}/${sample.date.getMonth() + 1}/${sample.date.getDate()}`,
      hour: sample.hour,
      dayStem: sample.dayStem,
      expectedHourStem: sample.expectedHourStem,
      calculatedHourStem,
      hourStemMatch,
      expectedHourBranch: sample.expectedHourBranch,
      calculatedHourBranch,
      hourBranchMatch
    }
  };
}

/**
 * 全サンプルデータで時柱計算を検証
 */
function testAllHourPillarSamples(): void {
  console.log('========= 韓国式四柱推命 時柱計算検証 =========\n');
  
  let passCount = 0;
  const results = hourPillarSamples.map(sample => {
    const result = testHourPillar(sample);
    if (result.success) passCount++;
    return result;
  });
  
  // 結果をテーブル形式で表示
  console.log('検証結果一覧:');
  console.log('-'.repeat(100));
  console.log('| サンプル | 日付      | 時刻 | 日干 | 期待時干 | 計算時干 | 時干一致 | 期待時支 | 計算時支 | 時支一致 |');
  console.log('|----------|-----------|------|------|----------|----------|----------|----------|----------|----------|');
  
  results.forEach(result => {
    const { name, details } = result;
    console.log(
      `| ${name.padEnd(8)} | ${details.date.padEnd(9)} | ${String(details.hour).padEnd(4)} | ` +
      `${details.dayStem.padEnd(4)} | ` +
      `${details.expectedHourStem.padEnd(8)} | ${details.calculatedHourStem.padEnd(8)} | ` +
      `${details.hourStemMatch ? '✓'.padEnd(8) : '✗'.padEnd(8)} | ` +
      `${details.expectedHourBranch.padEnd(8)} | ${details.calculatedHourBranch.padEnd(8)} | ` +
      `${details.hourBranchMatch ? '✓'.padEnd(8) : '✗'.padEnd(8)} |`
    );
  });
  console.log('-'.repeat(100));
  
  // 総合結果
  const successRate = (passCount / hourPillarSamples.length) * 100;
  console.log(`\n総合結果: ${passCount}/${hourPillarSamples.length} 成功 (${successRate.toFixed(2)}%)\n`);
  
  // 不一致があった場合の詳細表示
  const failedResults = results.filter(r => !r.success);
  if (failedResults.length > 0) {
    console.log('不一致のあったサンプル:');
    failedResults.forEach(result => {
      const { name, details } = result;
      console.log(`\n${name} (${details.date} ${details.hour}時):`);
      console.log(`日干: ${details.dayStem}`);
      
      if (!details.hourStemMatch) {
        console.log(`時干: 期待値[${details.expectedHourStem}] 計算値[${details.calculatedHourStem}] ✗`);
      }
      
      if (!details.hourBranchMatch) {
        console.log(`時支: 期待値[${details.expectedHourBranch}] 計算値[${details.calculatedHourBranch}] ✗`);
      }
    });
  }
  
  // 時柱計算ロジックの説明
  console.log('\n========= 時柱計算ロジックの説明 =========\n');
  console.log('【時支（地支）の計算】');
  console.log('- 時間帯に応じて地支を直接割り当て');
  console.log('- 23-1時: 子, 1-3時: 丑, 3-5時: 寅, ..., 21-23時: 亥');
  
  console.log('\n【時干（天干）の計算】');
  console.log('- 日干（日柱の天干）によって時干の開始点が決まる');
  console.log('- 甲乙日: 甲から始まる (甲乙丙丁戊己庚辛壬癸)');
  console.log('- 丙丁日: 丙から始まる (丙丁戊己庚辛壬癸甲乙)');
  console.log('- 戊己日: 戊から始まる (戊己庚辛壬癸甲乙丙丁)');
  console.log('- 庚辛日: 庚から始まる (庚辛壬癸甲乙丙丁戊己)');
  console.log('- 壬癸日: 壬から始まる (壬癸甲乙丙丁戊己庚辛)');
  
  console.log('\n【特別なサンプルパターン - 丙日の時干サイクル】');
  console.log('日干「丙」の場合の特殊サイクル:');
  for (let hour = 0; hour < 24; hour++) {
    const stem = calculateHourStem(hour, "丙", { useSampleData: true });
    console.log(`${hour}時: ${stem}`);
  }
}

// テスト実行
testAllHourPillarSamples();