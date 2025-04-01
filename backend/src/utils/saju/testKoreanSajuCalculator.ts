/**
 * 韓国式四柱推命計算のテスト
 * サンプルデータから抽出したアルゴリズムの検証
 */

import { calculateKoreanSaju, determineKoreanTenGodRelation, getElementFromStem, isStemYin, getHiddenStems } from './koreanSajuCalculator';

/**
 * 十神の韓国語表記
 */
const TEN_GOD_KR: Record<string, string> = {
  '比肩': '비견',
  '劫財': '겁재',
  '食神': '식신',
  '傷官': '상관',
  '偏財': '편재',
  '正財': '정재',
  '偏官': '편관',
  '正官': '정관',
  '偏印': '편인',
  '正印': '정인'
};

/**
 * 五行の韓国語表記
 */
const ELEMENT_KR: Record<string, string> = {
  '木': '목',
  '火': '화',
  '土': '토',
  '金': '금',
  '水': '수'
};

/**
 * テストの実行
 */
function runTests() {
  console.log('===== 韓国式四柱推命計算テスト =====\n');
  
  // 1. サンプルデータからのテストケース
  testSampleCase();
  
  // 2. 1986年5月26日5時のテスト
  test1986Case();
  
  // 3. 年柱計算の検証（1970, 1985, 1995, 2005, 2015）
  testYearPillarCalculation();
  
  // 4. 時柱計算の検証（同じ日の異なる時間）
  testHourPillarCalculation();
  
  console.log('\n===== テスト完了 =====');
}

/**
 * サンプルデータから抽出した1つのケースでテスト
 */
function testSampleCase() {
  console.log('1. サンプルデータに基づくテスト:');
  
  // 2023年10月15日 12:00のテスト（サンプルデータあり）
  const date = new Date(2023, 9, 15); // 10月は9
  const hour = 12;
  
  const result = calculateKoreanSaju(date, hour, {
    gender: 'M',
    useLocalTime: true,
    location: {
      longitude: 126.9780, // ソウル
      latitude: 37.5665
    }
  });
  
  // 四柱の表示
  console.log('四柱（年月日時）:');
  console.log(`年柱: ${result.yearPillar.fullStemBranch}`);
  console.log(`月柱: ${result.monthPillar.fullStemBranch}`);
  console.log(`日柱: ${result.dayPillar.fullStemBranch}`);
  console.log(`時柱: ${result.hourPillar.fullStemBranch}`);
  
  // 期待値との比較 (calender.mdのサンプル)
  const expectedYearPillar = '癸卯';
  const expectedMonthPillar = '壬戌';
  const expectedDayPillar = '丙午';
  
  console.log('\n期待値との比較:');
  console.log(`年柱: ${result.yearPillar.fullStemBranch} (期待値: ${expectedYearPillar})`);
  console.log(`月柱: ${result.monthPillar.fullStemBranch} (期待値: ${expectedMonthPillar})`);
  console.log(`日柱: ${result.dayPillar.fullStemBranch} (期待値: ${expectedDayPillar})`);
  console.log('');
}

/**
 * 1986年5月26日5時のテスト
 */
function test1986Case() {
  console.log('2. 1986年5月26日5時のテスト:');
  
  const date = new Date(1986, 4, 26); // 5月は4
  const hour = 5;
  
  const result = calculateKoreanSaju(date, hour, {
    gender: 'F',
    useLocalTime: true,
    location: {
      longitude: 126.9780, // ソウル
      latitude: 37.5665
    }
  });
  
  // 四柱の表示
  console.log('四柱（年月日時）:');
  console.log(`年柱: ${result.yearPillar.fullStemBranch}`);
  console.log(`月柱: ${result.monthPillar.fullStemBranch}`);
  console.log(`日柱: ${result.dayPillar.fullStemBranch}`);
  console.log(`時柱: ${result.hourPillar.fullStemBranch}`);
  
  // 十神関係の計算と表示
  const tenGods = {
    year: determineKoreanTenGodRelation(result.dayPillar.stem, result.yearPillar.stem),
    month: determineKoreanTenGodRelation(result.dayPillar.stem, result.monthPillar.fullStemBranch.charAt(0)),
    day: '比肩', // 日柱自身は常に比肩
    hour: determineKoreanTenGodRelation(result.dayPillar.stem, result.hourPillar.stem)
  };
  
  console.log('\n十神関係:');
  for (const [pillar, tenGod] of Object.entries(tenGods)) {
    console.log(`${pillar}柱: ${tenGod}（${TEN_GOD_KR[tenGod] || tenGod}）`);
  }
  
  // 五行情報の表示
  console.log('\n五行情報:');
  console.log(`年干: ${result.yearPillar.stem} - ${getElementFromStem(result.yearPillar.stem)}`);
  console.log(`月干: ${result.monthPillar.fullStemBranch.charAt(0)} - ${getElementFromStem(result.monthPillar.fullStemBranch.charAt(0))}`);
  console.log(`日干: ${result.dayPillar.stem} - ${getElementFromStem(result.dayPillar.stem)}`);
  console.log(`時干: ${result.hourPillar.stem} - ${getElementFromStem(result.hourPillar.stem)}`);
  
  // 韓国語でのフォーマット出力
  console.log('\n【韓国語フォーマット】');
  formatKoreanOutput(result);
}

/**
 * 年柱計算の検証
 */
function testYearPillarCalculation() {
  console.log('3. 年柱計算の検証:');
  
  // サンプルデータにある年
  const years = [1970, 1985, 1995, 2005, 2015];
  const expected = ['己酉', '乙丑', '乙亥', '乙酉', '乙未'];
  
  for (let i = 0; i < years.length; i++) {
    const result = calculateKoreanSaju(new Date(years[i], 0, 1));
    console.log(`${years[i]}年: ${result.yearPillar.fullStemBranch} (期待値: ${expected[i]})`);
  }
  
  console.log('');
}

/**
 * 時柱計算の検証
 */
function testHourPillarCalculation() {
  console.log('4. 時柱計算の検証:');
  
  // 2023年10月15日の異なる時間帯
  const hours = [1, 5, 9, 13, 17, 21];
  const date = new Date(2023, 9, 15); // 10月は9
  
  for (const hour of hours) {
    const result = calculateKoreanSaju(date, hour, {
      useLocalTime: true,
      location: {
        longitude: 126.9780, // ソウル
        latitude: 37.5665
      }
    });
    
    console.log(`${hour}時: ${result.hourPillar.fullStemBranch}`);
  }
  
  console.log('');
}

/**
 * 韓国語の出力フォーマットを表示
 */
function formatKoreanOutput(result: any) {
  function formatKoreanPillar(stem: string, branch: string, pillarType: string) {
    const element = getElementFromStem(stem);
    const elementKr = ELEMENT_KR[element] || element;
    const sign = isStemYin(stem) ? '-' : '+';
    const tenGod = pillarType === 'day' ? '比肩' : determineKoreanTenGodRelation(result.dayPillar.stem, stem);
    const tenGodKr = TEN_GOD_KR[tenGod] || tenGod;
    
    return `${stem}${branch} (${stem}${sign}${elementKr}, ${tenGodKr})`;
  }
  
  console.log(`생년: ${formatKoreanPillar(
    result.yearPillar.stem, 
    result.yearPillar.branch, 
    'year'
  )}`);
  
  console.log(`생월: ${formatKoreanPillar(
    result.monthPillar.fullStemBranch.charAt(0), 
    result.monthPillar.fullStemBranch.charAt(1), 
    'month'
  )}`);
  
  console.log(`생일: ${formatKoreanPillar(
    result.dayPillar.stem, 
    result.dayPillar.branch, 
    'day'
  )}`);
  
  console.log(`생시: ${formatKoreanPillar(
    result.hourPillar.stem, 
    result.hourPillar.branch, 
    'hour'
  )}`);
}

// テスト実行
runTests();