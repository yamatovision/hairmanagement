/**
 * 理論に基づいた四柱推命計算のテスト
 */

import { calculateKoreanFourPillars, determineTenGodRelation } from './koreanSajuModified';

/**
 * テンゴッドの日本語と韓国語の対応表
 */
const TEN_GOD_MAP: Record<string, string> = {
  '比肩': '비견', // 比肩
  '劫財': '겁재', // 劫財
  '食神': '식신', // 食神
  '傷官': '상관', // 傷官
  '偏財': '편재', // 偏財
  '正財': '정재', // 正財
  '偏官': '편관', // 偏官
  '正官': '정관', // 正官
  '偏印': '편인', // 偏印
  '正印': '정인'  // 正印
};

/**
 * 五行の韓国語表記
 */
const ELEMENT_MAP: Record<string, string> = {
  '木': '목',
  '火': '화',
  '土': '토',
  '金': '금',
  '水': '수'
};

/**
 * テストの実行
 */
async function runTest() {
  console.log('===== 理論に基づいた韓国式四柱推命計算テスト =====\n');
  
  // 2019年6月19日10時59分
  try {
    console.log('テストケース: 2019年6月19日10時59分');
    console.log('-------------------------------------');
    
    const testDate = new Date(2019, 5, 19);
    const testHour = 10;
    
    // 韓国式計算で四柱を計算
    console.log('【韓国式計算】');
    const result = await calculateKoreanFourPillars(testDate, testHour, {
      useLocalTime: true,
      location: {
        longitude: 139.7,
        latitude: 35.7
      }
    });
    
    // 結果表示
    console.log('四柱（年月日時）:');
    console.log(`年柱: ${result.yearPillar.fullStemBranch}`);
    console.log(`月柱: ${result.monthPillar.fullStemBranch}`);
    console.log(`日柱: ${result.dayPillar.fullStemBranch}`);
    console.log(`時柱: ${result.hourPillar.fullStemBranch}`);
    
    // 十神関係を計算
    const tenGods = {
      year: determineTenGodRelation(result.dayPillar.stem, result.yearPillar.stem),
      month: determineTenGodRelation(result.dayPillar.stem, result.monthPillar.fullStemBranch.charAt(0)),
      day: '比肩', // 日干自身は常に比肩
      hour: determineTenGodRelation(result.dayPillar.stem, result.hourPillar.stem)
    };
    
    console.log('\n十神関係:');
    Object.entries(tenGods).forEach(([pillar, tenGod]) => {
      console.log(`${pillar}柱: ${tenGod}（${TEN_GOD_MAP[tenGod] || tenGod}）`);
    });
    
    // 五行情報
    console.log('\n五行情報:');
    const stemToElement = {
      '甲': '木', '乙': '木',
      '丙': '火', '丁': '火',
      '戊': '土', '己': '土',
      '庚': '金', '辛': '金',
      '壬': '水', '癸': '水'
    };
    
    console.log(`年干: ${result.yearPillar.stem} - ${stemToElement[result.yearPillar.stem]}`);
    console.log(`月干: ${result.monthPillar.fullStemBranch.charAt(0)} - ${stemToElement[result.monthPillar.fullStemBranch.charAt(0)]}`);
    console.log(`日干: ${result.dayPillar.stem} - ${stemToElement[result.dayPillar.stem]}`);
    console.log(`時干: ${result.hourPillar.stem} - ${stemToElement[result.hourPillar.stem]}`);
    
    // 陰陽情報
    console.log('\n陰陽情報:');
    const yinStems = ['乙', '丁', '己', '辛', '癸'];
    console.log(`年干: ${result.yearPillar.stem} - ${yinStems.includes(result.yearPillar.stem) ? '陰' : '陽'}`);
    console.log(`月干: ${result.monthPillar.fullStemBranch.charAt(0)} - ${yinStems.includes(result.monthPillar.fullStemBranch.charAt(0)) ? '陰' : '陽'}`);
    console.log(`日干: ${result.dayPillar.stem} - ${yinStems.includes(result.dayPillar.stem) ? '陰' : '陽'}`);
    console.log(`時干: ${result.hourPillar.stem} - ${yinStems.includes(result.hourPillar.stem) ? '陰' : '陽'}`);
    
    // 韓国語でのフォーマット出力
    console.log('\n【韓国語フォーマット】');
    
    // 干支情報の出力
    const formatPillar = (stem: string, branch: string, element: string, isYin: boolean, tenGodJP: string) => {
      const elementSymbol = isYin ? '-' : '+';
      const elementKR = ELEMENT_MAP[element] || element;
      const tenGodKR = TEN_GOD_MAP[tenGodJP] || tenGodJP;
      return `${stem}${branch} (${stem}${elementSymbol}${elementKR}, ${tenGodKR})`;
    };
    
    console.log(`생년: ${formatPillar(
      result.yearPillar.stem, 
      result.yearPillar.branch, 
      stemToElement[result.yearPillar.stem], 
      yinStems.includes(result.yearPillar.stem), 
      tenGods.year
    )}`);
    
    console.log(`생월: ${formatPillar(
      result.monthPillar.fullStemBranch.charAt(0), 
      result.monthPillar.fullStemBranch.charAt(1), 
      stemToElement[result.monthPillar.fullStemBranch.charAt(0)], 
      yinStems.includes(result.monthPillar.fullStemBranch.charAt(0)), 
      tenGods.month
    )}`);
    
    console.log(`생일: ${formatPillar(
      result.dayPillar.stem, 
      result.dayPillar.branch, 
      stemToElement[result.dayPillar.stem], 
      yinStems.includes(result.dayPillar.stem), 
      tenGods.day
    )}`);
    
    console.log(`생시: ${formatPillar(
      result.hourPillar.stem, 
      result.hourPillar.branch, 
      stemToElement[result.hourPillar.stem], 
      yinStems.includes(result.hourPillar.stem), 
      tenGods.hour
    )}`);
    
  } catch (error) {
    console.error('テスト実行エラー:', error);
  }
  
  console.log('\n===== テスト完了 =====');
}

// テスト実行
runTest().catch(console.error);