/**
 * 韓国式四柱推命計算モジュール
 * サンプルデータに基づいた改善実装
 */

// 型定義のエクスポート
export * from './types';

// メインのSajuCalculatorクラスをエクスポート
export { SajuCalculator, SajuResult } from './sajuCalculator';

// 四柱計算モジュール（韓国式）
export { 
  calculateKoreanYearPillar, 
  getHiddenStems as getYearHiddenStems,
  verifyKoreanYearPillarCalculation 
} from './koreanYearPillarCalculator';

export { 
  calculateKoreanMonthPillar, 
  verifyKoreanMonthPillarCalculation 
} from './koreanMonthPillarCalculator';

export { 
  calculateKoreanDayPillar, 
  getLocalTimeAdjustedDate, 
  verifyDayPillarCalculation 
} from './dayPillarCalculator';

export { 
  calculateKoreanHourPillar, 
  verifyHourPillarCalculation 
} from './hourPillarCalculator';

// 旧暦変換
export { getLunarDate } from './lunarDateCalculator';

// 十神計算関連
export { 
  getElementFromStem, 
  getElementFromBranch, 
  isStemYin, 
  determineTenGodRelation, 
  calculateTenGods,
  getHiddenStems,
  STEM_ELEMENTS,
  BRANCH_ELEMENTS,
  ELEMENT_GENERATES,
  ELEMENT_CONTROLS,
  TEN_GOD_KR
} from './tenGodCalculator';

// 十二運星・十二神殺計算
export { 
  calculateTwelveFortunes, 
  calculateTwelveSpirits 
} from './twelveFortuneSpiritCalculator';

// テスト用関数
export { testSajuCalculator } from './sajuCalculator';

/**
 * 全てのテストを実行する関数
 */
export function runAllTests(): void {
  console.log('=== 韓国式四柱推命計算システム テスト実行 ===');
  
  // 各モジュールのテスト
  console.log('\n### 年柱計算テスト ###');
  import('./koreanYearPillarCalculator').then(module => {
    if (module.verifyKoreanYearPillarCalculation) {
      module.verifyKoreanYearPillarCalculation();
    }
  });
  
  console.log('\n### 月柱計算テスト ###');
  import('./koreanMonthPillarCalculator').then(module => {
    if (module.verifyKoreanMonthPillarCalculation) {
      module.verifyKoreanMonthPillarCalculation();
    }
  });
  
  console.log('\n### 日柱計算テスト ###');
  import('./dayPillarCalculator').then(module => {
    if (module.verifyDayPillarCalculation) {
      module.verifyDayPillarCalculation();
    }
  });
  
  console.log('\n### 時柱計算テスト ###');
  import('./hourPillarCalculator').then(module => {
    if (module.verifyHourPillarCalculation) {
      module.verifyHourPillarCalculation();
    }
  });
  
  console.log('\n### 四柱推命総合テスト ###');
  import('./sajuCalculator').then(module => {
    if (module.testSajuCalculator) {
      module.testSajuCalculator();
    }
  });
}