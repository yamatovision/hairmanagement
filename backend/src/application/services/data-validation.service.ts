/**
 * データ検証サービス
 * 
 * 四柱推命データの型検証と整合性チェックを行うサービス
 * 異常データの早期検出と適切なエラーハンドリングのために使用
 * 
 * 作成日: 2025/04/05
 * 作成者: Claude
 */

import { injectable } from 'tsyringe';
import { Result, success, failure, ErrorContext } from '../../utils/result.util';

// 有効な五行の定義
export type ElementType = '木' | '火' | '土' | '金' | '水';

// 有効な陰陽の定義
export type YinYangType = '陰' | '陽';

// 有効な天干の定義
export type CelestialStem = '甲' | '乙' | '丙' | '丁' | '戊' | '己' | '庚' | '辛' | '壬' | '癸';

// 有効な地支の定義
export type TerrestrialBranch = 
  '子' | '丑' | '寅' | '卯' | '辰' | '巳' | 
  '午' | '未' | '申' | '酉' | '戌' | '亥';

// 有効な十神の定義
export type TenGodType = 
  '比肩' | '劫財' | '食神' | '傷官' | '偏財' | '正財' | 
  '偏官' | '正官' | '偏印' | '正印' | '日主';

/**
 * 検証エラー型
 */
export interface ValidationError {
  field: string;
  message: string;
  severity: 'warning' | 'error' | 'critical';
  value?: any;
}

/**
 * 検証結果型
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * 四柱パターン情報型
 */
export interface PillarPattern {
  stem: string;
  branch: string;
}

/**
 * 四柱情報型
 */
export interface FourPillarsData {
  yearPillar?: PillarPattern;
  monthPillar?: PillarPattern;
  dayPillar: PillarPattern;
  hourPillar?: PillarPattern;
}

/**
 * サジュデータ型
 */
export interface SajuData {
  mainElement: ElementType;
  yinYang: YinYangType;
  compatibility?: number;
  tenGod?: TenGodType;
  branchTenGod?: TenGodType;
  dayMaster?: CelestialStem;
  dayElement?: ElementType;
}

/**
 * 四柱推命データ検証サービス
 */
@injectable()
export class DataValidationService {
  // 有効な値リスト
  private readonly validElements: ElementType[] = ['木', '火', '土', '金', '水'];
  private readonly validYinYangs: YinYangType[] = ['陰', '陽'];
  private readonly validTenGods: TenGodType[] = [
    '比肩', '劫財', '食神', '傷官', '偏財', '正財', 
    '偏官', '正官', '偏印', '正印', '日主'
  ];
  private readonly validCelestialStems: CelestialStem[] = [
    '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'
  ];
  private readonly validTerrestrialBranches: TerrestrialBranch[] = [
    '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'
  ];
  
  // 環境設定の取得
  private readonly isStrictMode: boolean = process.env.NODE_ENV === 'development';
  
  /**
   * 検証モードを取得
   * @returns 厳格モードかどうか
   */
  isStrictValidationEnabled(): boolean {
    return this.isStrictMode;
  }
  
  /**
   * 四柱情報を検証
   * @param data 検証する四柱情報
   * @returns 検証結果
   */
  validateFourPillars(data: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    
    // null/undefined チェック
    if (!data) {
      errors.push({
        field: 'fourPillars',
        message: '四柱情報が存在しません',
        severity: 'critical'
      });
      return { isValid: false, errors, warnings };
    }
    
    // 日柱存在チェック（必須）
    if (!data.dayPillar) {
      errors.push({
        field: 'fourPillars.dayPillar',
        message: '日柱情報が存在しません',
        severity: 'critical'
      });
    } else {
      // 日柱内容チェック
      if (!data.dayPillar.stem) {
        errors.push({
          field: 'fourPillars.dayPillar.stem',
          message: '日柱の天干が存在しません',
          severity: 'critical'
        });
      } else if (!this.validCelestialStems.includes(data.dayPillar.stem)) {
        errors.push({
          field: 'fourPillars.dayPillar.stem',
          message: `無効な天干です: ${data.dayPillar.stem}`,
          severity: 'error',
          value: data.dayPillar.stem
        });
      }
      
      if (!data.dayPillar.branch) {
        errors.push({
          field: 'fourPillars.dayPillar.branch',
          message: '日柱の地支が存在しません',
          severity: 'error'
        });
      } else if (!this.validTerrestrialBranches.includes(data.dayPillar.branch)) {
        errors.push({
          field: 'fourPillars.dayPillar.branch',
          message: `無効な地支です: ${data.dayPillar.branch}`,
          severity: 'error',
          value: data.dayPillar.branch
        });
      }
    }
    
    // 他の柱（年・月・時）は警告レベルでチェック
    if (data.yearPillar) {
      this.validatePillar('year', data.yearPillar, warnings);
    }
    
    if (data.monthPillar) {
      this.validatePillar('month', data.monthPillar, warnings);
    }
    
    if (data.hourPillar) {
      this.validatePillar('hour', data.hourPillar, warnings);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * 個別の柱を検証
   * @param name 柱の名前
   * @param pillar 柱のデータ
   * @param warnings 警告リスト
   */
  private validatePillar(
    name: string, 
    pillar: any, 
    warnings: ValidationError[]
  ): void {
    if (!pillar) {
      warnings.push({
        field: `fourPillars.${name}Pillar`,
        message: `${name}柱情報が存在しません`,
        severity: 'warning'
      });
      return;
    }
    
    if (!pillar.stem) {
      warnings.push({
        field: `fourPillars.${name}Pillar.stem`,
        message: `${name}柱の天干が存在しません`,
        severity: 'warning'
      });
    } else if (!this.validCelestialStems.includes(pillar.stem)) {
      warnings.push({
        field: `fourPillars.${name}Pillar.stem`,
        message: `${name}柱の天干が無効です: ${pillar.stem}`,
        severity: 'warning',
        value: pillar.stem
      });
    }
    
    if (!pillar.branch) {
      warnings.push({
        field: `fourPillars.${name}Pillar.branch`,
        message: `${name}柱の地支が存在しません`,
        severity: 'warning'
      });
    } else if (!this.validTerrestrialBranches.includes(pillar.branch)) {
      warnings.push({
        field: `fourPillars.${name}Pillar.branch`,
        message: `${name}柱の地支が無効です: ${pillar.branch}`,
        severity: 'warning',
        value: pillar.branch
      });
    }
  }
  
  /**
   * SajuData型のデータを検証
   * @param data 検証するSajuData
   * @returns 検証結果
   */
  validateSajuData(data: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    
    // null/undefined チェック
    if (!data) {
      errors.push({
        field: 'sajuData',
        message: 'SajuDataが存在しません',
        severity: 'critical'
      });
      return { isValid: false, errors, warnings };
    }
    
    // 必須フィールドのチェック
    if (!data.mainElement) {
      errors.push({
        field: 'sajuData.mainElement',
        message: '主要五行が存在しません',
        severity: 'error'
      });
    } else if (!this.validElements.includes(data.mainElement)) {
      errors.push({
        field: 'sajuData.mainElement',
        message: `無効な五行です: ${data.mainElement}`,
        severity: 'error',
        value: data.mainElement
      });
    }
    
    if (!data.yinYang) {
      warnings.push({
        field: 'sajuData.yinYang',
        message: '陰陽情報が存在しません',
        severity: 'warning'
      });
    } else if (!this.validYinYangs.includes(data.yinYang)) {
      warnings.push({
        field: 'sajuData.yinYang',
        message: `無効な陰陽値です: ${data.yinYang}`,
        severity: 'warning',
        value: data.yinYang
      });
    }
    
    // 十神関係のチェック
    if (data.tenGod && !this.validTenGods.includes(data.tenGod)) {
      warnings.push({
        field: 'sajuData.tenGod',
        message: `無効な十神です: ${data.tenGod}`,
        severity: 'warning',
        value: data.tenGod
      });
    }
    
    if (data.branchTenGod && !this.validTenGods.includes(data.branchTenGod)) {
      warnings.push({
        field: 'sajuData.branchTenGod',
        message: `無効な地支十神です: ${data.branchTenGod}`,
        severity: 'warning',
        value: data.branchTenGod
      });
    }
    
    // 相性スコアは 0-100 の範囲内であるべき
    if (typeof data.compatibility !== 'undefined') {
      if (typeof data.compatibility !== 'number') {
        warnings.push({
          field: 'sajuData.compatibility',
          message: '相性スコアが数値ではありません',
          severity: 'warning',
          value: data.compatibility
        });
      } else if (data.compatibility < 0 || data.compatibility > 100) {
        warnings.push({
          field: 'sajuData.compatibility',
          message: '相性スコアが範囲外です (0-100)',
          severity: 'warning',
          value: data.compatibility
        });
      }
    }
    
    // 日主や日の五行は任意だがチェック
    if (data.dayMaster && !this.validCelestialStems.includes(data.dayMaster)) {
      warnings.push({
        field: 'sajuData.dayMaster',
        message: `無効な日主です: ${data.dayMaster}`,
        severity: 'warning',
        value: data.dayMaster
      });
    }
    
    if (data.dayElement && !this.validElements.includes(data.dayElement)) {
      warnings.push({
        field: 'sajuData.dayElement',
        message: `無効な日の五行です: ${data.dayElement}`,
        severity: 'warning',
        value: data.dayElement
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * カレンダー情報の検証
   * @param data 検証するカレンダー情報
   * @returns 検証結果
   */
  validateCalendarInfo(data: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    
    // null/undefined チェック
    if (!data) {
      errors.push({
        field: 'calendarInfo',
        message: 'カレンダー情報が存在しません',
        severity: 'critical'
      });
      return { isValid: false, errors, warnings };
    }
    
    // 日付チェック
    if (!data.date) {
      errors.push({
        field: 'calendarInfo.date',
        message: '日付が存在しません',
        severity: 'error'
      });
    }
    
    // 日柱チェック
    if (!data.dayPillar) {
      errors.push({
        field: 'calendarInfo.dayPillar',
        message: '日柱情報が存在しません',
        severity: 'error'
      });
    } else {
      // 日柱の内容チェック
      this.validatePillar('day', data.dayPillar, errors);
    }
    
    // その他の柱は警告レベルでチェック
    if (data.yearPillar) {
      this.validatePillar('year', data.yearPillar, warnings);
    }
    
    if (data.monthPillar) {
      this.validatePillar('month', data.monthPillar, warnings);
    }
    
    // 必須ではないが重要なフィールド
    if (!data.mainElement) {
      warnings.push({
        field: 'calendarInfo.mainElement',
        message: '主要五行が存在しません',
        severity: 'warning'
      });
    } else if (!this.validElements.includes(data.mainElement)) {
      warnings.push({
        field: 'calendarInfo.mainElement',
        message: `無効な五行です: ${data.mainElement}`,
        severity: 'warning',
        value: data.mainElement
      });
    }
    
    if (!data.dayYinYang) {
      warnings.push({
        field: 'calendarInfo.dayYinYang',
        message: '日の陰陽が存在しません',
        severity: 'warning'
      });
    } else if (!this.validYinYangs.includes(data.dayYinYang)) {
      warnings.push({
        field: 'calendarInfo.dayYinYang',
        message: `無効な陰陽値です: ${data.dayYinYang}`,
        severity: 'warning',
        value: data.dayYinYang
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * 四柱推命データを検証
   * 
   * Result型を使用した検証結果を返す
   * @param data 検証するデータ
   * @returns 検証結果を含むResult型
   */
  validateFourPillarsWithResult(data: any): Result<FourPillarsData, ValidationError[]> {
    const { isValid, errors, warnings } = this.validateFourPillars(data);
    
    // 開発環境では警告も含めてエラーとして扱う
    if (!isValid || (this.isStrictMode && warnings.length > 0)) {
      const context: ErrorContext = {
        operationName: 'validateFourPillarsWithResult',
        source: 'DataValidationService',
        severity: 'error',
        details: {
          data,
          isValid,
          errors,
          warnings
        }
      };
      
      return failure(errors.concat(this.isStrictMode ? warnings : []), context);
    }
    
    // エラーがなければ四柱データを成功として返す
    const fourPillars: FourPillarsData = {
      dayPillar: {
        stem: data.dayPillar.stem,
        branch: data.dayPillar.branch
      }
    };
    
    // オプショナルな柱の追加
    if (data.yearPillar?.stem && data.yearPillar?.branch) {
      fourPillars.yearPillar = {
        stem: data.yearPillar.stem,
        branch: data.yearPillar.branch
      };
    }
    
    if (data.monthPillar?.stem && data.monthPillar?.branch) {
      fourPillars.monthPillar = {
        stem: data.monthPillar.stem,
        branch: data.monthPillar.branch
      };
    }
    
    if (data.hourPillar?.stem && data.hourPillar?.branch) {
      fourPillars.hourPillar = {
        stem: data.hourPillar.stem,
        branch: data.hourPillar.branch
      };
    }
    
    return success(fourPillars);
  }
  
  /**
   * サジュデータを検証
   * 
   * Result型を使用した検証結果を返す
   * @param data 検証するデータ
   * @returns 検証結果を含むResult型
   */
  validateSajuDataWithResult(data: any): Result<SajuData, ValidationError[]> {
    const { isValid, errors, warnings } = this.validateSajuData(data);
    
    // 開発環境では警告も含めてエラーとして扱う
    if (!isValid || (this.isStrictMode && warnings.length > 0)) {
      const context: ErrorContext = {
        operationName: 'validateSajuDataWithResult',
        source: 'DataValidationService',
        severity: 'error',
        details: {
          data,
          isValid,
          errors,
          warnings
        }
      };
      
      return failure(errors.concat(this.isStrictMode ? warnings : []), context);
    }
    
    // エラーがなければSajuDataを成功として返す
    const sajuData: SajuData = {
      mainElement: data.mainElement as ElementType,
      yinYang: (data.yinYang || '陽') as YinYangType
    };
    
    // オプショナルフィールドの追加
    if (typeof data.compatibility !== 'undefined') {
      sajuData.compatibility = data.compatibility;
    }
    
    if (data.tenGod) {
      sajuData.tenGod = data.tenGod as TenGodType;
    }
    
    if (data.branchTenGod) {
      sajuData.branchTenGod = data.branchTenGod as TenGodType;
    }
    
    if (data.dayMaster) {
      sajuData.dayMaster = data.dayMaster as CelestialStem;
    }
    
    if (data.dayElement) {
      sajuData.dayElement = data.dayElement as ElementType;
    }
    
    return success(sajuData);
  }
  
  /**
   * 検証エラーをフォーマット
   * @param result 検証結果
   * @returns フォーマットされたエラーメッセージ
   */
  formatValidationErrors(result: ValidationResult): string {
    if (result.isValid && result.warnings.length === 0) {
      return '検証に成功しました。エラーはありません。';
    }
    
    let message = '';
    
    if (result.errors.length > 0) {
      message += '検証エラー：\n';
      result.errors.forEach((error, index) => {
        message += `${index + 1}. [${error.severity}] ${error.field}: ${error.message}\n`;
      });
    }
    
    if (result.warnings.length > 0) {
      message += '\n警告：\n';
      result.warnings.forEach((warning, index) => {
        message += `${index + 1}. ${warning.field}: ${warning.message}\n`;
      });
    }
    
    return message;
  }
  
  /**
   * 安全なデータアクセス - 存在しない可能性があるプロパティに安全にアクセス
   * @param obj 対象オブジェクト
   * @param path アクセスするプロパティパス（ドット区切り）
   * @param defaultValue 値が存在しない場合のデフォルト値
   */
  safeAccess<T>(obj: any, path: string, defaultValue: T): T {
    if (!obj) return defaultValue;
    
    const props = path.split('.');
    let result = obj;
    
    for (const prop of props) {
      if (result === null || result === undefined || typeof result !== 'object') {
        return defaultValue;
      }
      result = result[prop];
    }
    
    return (result === undefined || result === null) ? defaultValue : result as T;
  }
  
  /**
   * 天干から五行属性を取得
   * @param stem 天干
   * @returns 五行属性
   */
  getStemElement(stem: string): ElementType | null {
    const stemElementMap: Record<string, ElementType> = {
      '甲': '木', '乙': '木',
      '丙': '火', '丁': '火',
      '戊': '土', '己': '土',
      '庚': '金', '辛': '金',
      '壬': '水', '癸': '水'
    };
    
    return stemElementMap[stem] || null;
  }
  
  /**
   * 地支から五行属性を取得
   * @param branch 地支
   * @returns 五行属性
   */
  getBranchElement(branch: string): ElementType | null {
    const branchElementMap: Record<string, ElementType> = {
      '子': '水', '丑': '土',
      '寅': '木', '卯': '木',
      '辰': '土', '巳': '火',
      '午': '火', '未': '土',
      '申': '金', '酉': '金',
      '戌': '土', '亥': '水'
    };
    
    return branchElementMap[branch] || null;
  }
  
  /**
   * 天干の陰陽を取得
   * @param stem 天干
   * @returns 陰陽
   */
  getStemYinYang(stem: string): YinYangType | null {
    const stemYinYangMap: Record<string, YinYangType> = {
      '甲': '陽', '乙': '陰',
      '丙': '陽', '丁': '陰',
      '戊': '陽', '己': '陰',
      '庚': '陽', '辛': '陰',
      '壬': '陽', '癸': '陰'
    };
    
    return stemYinYangMap[stem] || null;
  }
}