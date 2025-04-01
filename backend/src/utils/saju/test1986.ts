/**
 * 1986年5月26日5時の四柱推命計算テスト
 */

import { calculateSajuFromCalendar, determineTenGodRelation } from './sajuCalculatorCalendar';

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
 * 天干から五行を取得
 */
function stemToElement(stem: string): string {
  const map: Record<string, string> = {
    '甲': '木', '乙': '木',
    '丙': '火', '丁': '火',
    '戊': '土', '己': '土',
    '庚': '金', '辛': '金',
    '壬': '水', '癸': '水'
  };
  return map[stem] || '不明';
}

/**
 * 天干が陰性かどうか
 */
function isStemYin(stem: string): boolean {
  return ['乙', '丁', '己', '辛', '癸'].includes(stem);
}

/**
 * テストの実行
 */
function runTest() {
  console.log('===== 1986年5月26日5時の四柱推命計算テスト =====\n');
  
  // 1986年5月26日5時
  const date = new Date(1986, 4, 26); // 月は0始まり
  const hour = 5;
  
  // 四柱計算
  const result = calculateSajuFromCalendar(date, hour, {
    useLocalTime: true,
    location: {
      longitude: 139.7,
      latitude: 35.7
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
    year: determineTenGodRelation(result.dayPillar.stem, result.yearPillar.stem),
    month: determineTenGodRelation(result.dayPillar.stem, result.monthPillar.fullStemBranch.charAt(0)),
    day: '比肩', // 日柱自身は常に比肩
    hour: determineTenGodRelation(result.dayPillar.stem, result.hourPillar.stem)
  };
  
  console.log('\n十神関係:');
  for (const [pillar, tenGod] of Object.entries(tenGods)) {
    console.log(`${pillar}柱: ${tenGod}（${TEN_GOD_KR[tenGod] || tenGod}）`);
  }
  
  // 五行情報の表示
  console.log('\n五行情報:');
  console.log(`年干: ${result.yearPillar.stem} - ${stemToElement(result.yearPillar.stem)}`);
  console.log(`月干: ${result.monthPillar.fullStemBranch.charAt(0)} - ${stemToElement(result.monthPillar.fullStemBranch.charAt(0))}`);
  console.log(`日干: ${result.dayPillar.stem} - ${stemToElement(result.dayPillar.stem)}`);
  console.log(`時干: ${result.hourPillar.stem} - ${stemToElement(result.hourPillar.stem)}`);
  
  // 陰陽情報の表示
  console.log('\n陰陽情報:');
  console.log(`年干: ${result.yearPillar.stem} - ${isStemYin(result.yearPillar.stem) ? '陰' : '陽'}`);
  console.log(`月干: ${result.monthPillar.fullStemBranch.charAt(0)} - ${isStemYin(result.monthPillar.fullStemBranch.charAt(0)) ? '陰' : '陽'}`);
  console.log(`日干: ${result.dayPillar.stem} - ${isStemYin(result.dayPillar.stem) ? '陰' : '陽'}`);
  console.log(`時干: ${result.hourPillar.stem} - ${isStemYin(result.hourPillar.stem) ? '陰' : '陽'}`);
  
  // 韓国語でのフォーマット出力
  console.log('\n【韓国語フォーマット】');
  
  // 干支情報の韓国語フォーマット
  function formatKorean(stem: string, branch: string, pillarType: string) {
    const element = stemToElement(stem);
    const elementKr = ELEMENT_KR[element] || element;
    const sign = isStemYin(stem) ? '-' : '+';
    const tenGod = pillarType === 'day' ? '比肩' : determineTenGodRelation(result.dayPillar.stem, stem);
    const tenGodKr = TEN_GOD_KR[tenGod] || tenGod;
    
    return `${stem}${branch} (${stem}${sign}${elementKr}, ${tenGodKr})`;
  }
  
  console.log(`생년: ${formatKorean(result.yearPillar.stem, result.yearPillar.branch, 'year')}`);
  console.log(`생월: ${formatKorean(result.monthPillar.fullStemBranch.charAt(0), result.monthPillar.fullStemBranch.charAt(1), 'month')}`);
  console.log(`생일: ${formatKorean(result.dayPillar.stem, result.dayPillar.branch, 'day')}`);
  console.log(`생시: ${formatKorean(result.hourPillar.stem, result.hourPillar.branch, 'hour')}`);
}

// テスト実行
runTest();