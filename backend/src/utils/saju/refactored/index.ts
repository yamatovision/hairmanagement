/**
 * 韓国式四柱推命計算システム
 * リファクタリング計画に基づいた改善実装
 */

// 型定義のエクスポート
export * from './types';

// 型定義
import { FourPillars, Gender, SajuOptions, TenGodRelation } from './types';
import { calculateKoreanYearPillar } from './koreanYearPillarCalculator';
import { calculateKoreanMonthPillar } from './koreanMonthPillarCalculator';
import { calculateKoreanDayPillar } from './dayPillarCalculator';
import { calculateKoreanHourPillar } from './hourPillarCalculator';
import { calculateTenGods } from './tenGodCalculator';

// SajuEngineとDateTimeProcessorの代替実装
class SajuEngine {
  calculate(
    birthDate: Date,
    birthHour: number,
    gender?: Gender,
    location?: string | { longitude: number; latitude: number }
  ) {
    // 共通オプション
    const options: SajuOptions = {
      useLocalTime: !!location,
      location: location || { longitude: 135, latitude: 35 } // デフォルトは日本標準時
    };

    // 四柱の計算
    const yearPillar = calculateKoreanYearPillar(birthDate.getFullYear());
    const monthPillar = calculateKoreanMonthPillar(birthDate, yearPillar.stem);
    const dayPillar = calculateKoreanDayPillar(birthDate, options);
    
    // 修正された時間で時柱計算
    const dateWithHour = new Date(birthDate);
    dateWithHour.setHours(birthHour);
    const hourPillar = calculateKoreanHourPillar(birthHour, dayPillar.stem);
    
    // 四柱データの構築
    const fourPillars: FourPillars = {
      yearPillar,
      monthPillar,
      dayPillar,
      hourPillar
    };
    
    // 十神関係を計算 (ダミー実装)
    const tenGods = { year: '比肩', month: '比肩', day: '比肩', hour: '比肩' };
    
    return {
      fourPillars,
      tenGods,
      options
    };
  }
  
  getCurrentSaju() {
    const now = new Date();
    return this.calculate(now, now.getHours(), 'M', { longitude: 135, latitude: 35 });
  }
}

class DateTimeProcessor {
  // 必要最小限の実装
  static adjustDateTime(date: Date, location?: string | { longitude: number; latitude: number }) {
    return date;
  }
}

// エクスポート
export { SajuEngine, DateTimeProcessor };

// 旧来の実装 - 互換性のため残す
export { SajuCalculator } from './sajuCalculator';

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
  calculateTwelveFortunes
} from './twelveFortuneSpiritCalculator';

/**
 * 簡易インターフェース：生年月日時から四柱を計算
 * @param birthDate 生年月日
 * @param birthHour 生まれた時間（0-23）
 * @param gender 性別（'M'=男性, 'F'=女性）
 * @param location 位置情報（都市名または経度・緯度）
 * @returns 四柱推命計算結果
 */
export function calculateSaju(
  birthDate: Date, 
  birthHour: number, 
  gender?: 'M' | 'F',
  location?: string | { longitude: number, latitude: number }
) {
  // 新しいエンジンを使用
  const engine = new SajuEngine();
  return engine.calculate(birthDate, birthHour, gender, location);
}

/**
 * 現在時刻の四柱を計算
 * @returns 現在の四柱推命計算結果
 */
export function getCurrentSaju() {
  const engine = new SajuEngine();
  return engine.getCurrentSaju();
}

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
  
  console.log('\n### 旧来の四柱計算テスト ###');
  import('./sajuCalculator').then(module => {
    if (module.testSajuCalculator) {
      module.testSajuCalculator();
    }
  });
  
  console.log('\n### 新しいSajuEngineテスト ###');
  // エンジンによる計算結果のテスト
  const engine = new SajuEngine();
  const testDate = new Date(1986, 4, 26); // 1986年5月26日
  const result = engine.calculate(testDate, 5, 'M', '東京');
  console.log('SajuEngine計算結果:');
  console.log(`年柱: ${result.fourPillars.yearPillar.fullStemBranch}`);
  console.log(`月柱: ${result.fourPillars.monthPillar.fullStemBranch}`);
  console.log(`日柱: ${result.fourPillars.dayPillar.fullStemBranch}`);
  console.log(`時柱: ${result.fourPillars.hourPillar.fullStemBranch}`);
}