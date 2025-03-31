/**
 * 旧暦変換モジュールの手動テスト
 * 
 * このファイルは、Jest設定の問題を回避するための
 * 簡易的な手動テストスクリプトです。
 */
import { getLunarDate, fetchLunarDate, getStemBranch, isLeapMonth, getSolarTerm } from './lunarConverter';

/**
 * 簡易テスト関数
 */
function assertEqual(actual: any, expected: any, message: string) {
  const isEqual = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${message}: ${isEqual ? '✅ 成功' : '❌ 失敗'}`);
  if (!isEqual) {
    console.log('  期待値:', expected);
    console.log('  実際値:', actual);
  }
}

/**
 * テスト実行
 */
async function runTests() {
  console.log('===== 旧暦変換モジュール テスト開始 =====');

  // getLunarDate関数のテスト
  console.log('\n----- getLunarDate関数のテスト -----');
  
  // 2023年10月15日のテスト
  const result1 = getLunarDate(new Date(2023, 9, 15));
  const expected1 = {
    lunarYear: 2023,
    lunarMonth: 9,
    lunarDay: 1,
    isLeapMonth: false,
    stemBranch: "丙午"
  };
  assertEqual(result1, expected1, '2023年10月15日の旧暦変換');
  
  // 1986年5月26日のテスト
  const result2 = getLunarDate(new Date(1986, 4, 26));
  const expected2 = {
    lunarYear: 1986,
    lunarMonth: 4,
    lunarDay: 18,
    isLeapMonth: false,
    stemBranch: "庚午"
  };
  assertEqual(result2, expected2, '1986年5月26日の旧暦変換');
  
  // 1970年1月1日のテスト
  const result3 = getLunarDate(new Date(1970, 0, 1));
  const expected3 = {
    lunarYear: 1970,
    lunarMonth: 11,
    lunarDay: 23,
    isLeapMonth: false,
    stemBranch: "辛巳"
  };
  assertEqual(result3, expected3, '1970年1月1日の旧暦変換');
  
  // 存在しない日付のテスト
  const result4 = getLunarDate(new Date(2000, 0, 1));
  assertEqual(result4, null, '存在しない日付のテスト');

  // fetchLunarDate関数のテスト
  console.log('\n----- fetchLunarDate関数のテスト -----');
  const result5 = await fetchLunarDate(new Date(2023, 9, 15));
  assertEqual(result5, expected1, 'fetchLunarDateの非同期テスト');

  // getStemBranch関数のテスト
  console.log('\n----- getStemBranch関数のテスト -----');
  const result6 = getStemBranch(new Date(2023, 9, 15));
  assertEqual(result6, "丙午", '2023年10月15日の干支');

  // 10日間連続の干支のテスト
  console.log('\n----- 連続干支のテスト -----');
  const expectedStems = [
    "壬辰", // 10月1日
    "癸巳", // 10月2日
    "甲午", // 10月3日
    "乙未", // 10月4日
    "丙申", // 10月5日
    "丁酉", // 10月6日
    "戊戌"  // 10月7日
  ];
  
  for (let i = 0; i < expectedStems.length; i++) {
    const date = new Date(2023, 9, i + 1); // 10月は9、日付は1からスタート
    const result = getStemBranch(date);
    assertEqual(result, expectedStems[i], `2023年10月${i+1}日の干支`);
  }

  // isLeapMonth関数のテスト
  console.log('\n----- isLeapMonth関数のテスト -----');
  const result7 = isLeapMonth(new Date(2023, 9, 15));
  assertEqual(result7, false, '通常月のテスト');

  const result8 = isLeapMonth(new Date(2023, 5, 19));
  assertEqual(result8, true, '閏月のテスト');

  const result9 = isLeapMonth(new Date(2023, 6, 19));
  assertEqual(result9, false, '閏月後の月のテスト');

  // getSolarTerm関数のテスト
  console.log('\n----- getSolarTerm関数のテスト -----');
  const result10 = getSolarTerm(new Date(2023, 1, 4));
  assertEqual(result10, "立春", '立春のテスト');

  const result11 = getSolarTerm(new Date(2023, 11, 21));
  assertEqual(result11, "冬至", '冬至のテスト');

  const result12 = getSolarTerm(new Date(2023, 1, 3));
  assertEqual(result12, null, '節気のない日のテスト');

  console.log('\n===== テスト完了 =====');
}

// テスト実行
runTests()
  .then(() => console.log('テスト実行完了'))
  .catch(err => console.error('テスト実行エラー:', err));