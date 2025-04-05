/**
 * 四柱推命データ変換サービス（最適化版）
 * 
 * データフロー強化（フェーズ2）の一部として実装
 * 四柱推命データの様々なサービス間での変換を担当
 * 最適化版ではメモ化パターンと結果型を活用し、処理を効率化
 * 
 * 変更履歴:
 * - 2025/04/05: 初期実装 (Claude)
 * - 2025/04/09: データモデル検証と安全性強化 (Claude)
 * - 2025/04/05: パフォーマンス最適化（メモ化と関数集約）(Claude)
 */

import { injectable } from 'tsyringe';
import { 
  ElementType, 
  YinYangType,
  CelestialStem,
  TerrestrialBranch,
  TenGodType,
  FourPillars,
  Pillar,
  PillarType
} from '../../shared/types/saju';
import Fortune from '../../domain/models/fortune.model';
import { IDailyCalendarInfoDocument } from '../../domain/models/daily-calendar-info.model';
import { Memoize } from '../../utils/cache.util';
import { Optional, Result, success, failure, tryCatch } from '../../utils/result.util';

// 必須となる型定義
// 日次カレンダー情報の拡張型定義
interface ExtendedCalendarInfo extends IDailyCalendarInfoDocument {
  lunarDate?: {
    year: number;
    month: number;
    day: number;
    isLeapMonth: boolean;
  };
  solarTerms?: {
    current: {
      name: string;
      date: Date;
    };
  };
}

interface ElementalInfo {
  mainElement: ElementType;
  yinYang: YinYangType;
  secondaryElement?: ElementType;
}

interface FortuneCompatibilityData {
  dayMaster: CelestialStem;
  dayElement: ElementType;
  tenGod: TenGodType;
  branchTenGod: TenGodType;
  compatibility: number;
}

/**
 * 四柱推命データ変換サービス（最適化版）
 * 様々なサービス間でのデータ変換を担当
 */
@injectable()
export class SajuDataTransformer {
  // キャッシュ用のマッピングテーブル - クラス初期化時に一度だけ構築
  private readonly stemToElement: Record<CelestialStem, ElementType> = {
    '甲': '木', '乙': '木',
    '丙': '火', '丁': '火',
    '戊': '土', '己': '土',
    '庚': '金', '辛': '金',
    '壬': '水', '癸': '水'
  };
  
  private readonly stemToYinYang: Record<CelestialStem, YinYangType> = {
    '甲': '陽', '丙': '陽', '戊': '陽', '庚': '陽', '壬': '陽',
    '乙': '陰', '丁': '陰', '己': '陰', '辛': '陰', '癸': '陰'
  };
  
  private readonly branchToElement: Record<TerrestrialBranch, ElementType> = {
    '子': '水', '丑': '土', '寅': '木',
    '卯': '木', '辰': '土', '巳': '火',
    '午': '火', '未': '土', '申': '金',
    '酉': '金', '戌': '土', '亥': '水'
  };
  
  private readonly elementToYangStem: Record<ElementType, CelestialStem> = {
    '木': '甲', '火': '丙', '土': '戊', '金': '庚', '水': '壬'
  };
  
  private readonly elementGeneratingRelationships: Record<ElementType, ElementType> = {
    '木': '火', '火': '土', '土': '金', '金': '水', '水': '木'
  };
  
  private readonly elementOvercomingRelationships: Record<ElementType, ElementType> = {
    '木': '土', '土': '水', '水': '火', '火': '金', '金': '木'
  };
  
  // 有効なデータ値のリスト - 検証用
  private readonly validElements: ElementType[] = ['木', '火', '土', '金', '水'];
  private readonly validTenGods: TenGodType[] = [
    '比肩', '劫財', '食神', '傷官', '偏財', '正財', 
    '七殺', '正官', '偏印', '正印', '日主'
  ];
  
  /**
   * 四柱情報から主要五行と陰陽情報を抽出
   * データ検証機能付き、メモ化パターン適用で効率化
   * 
   * @param fourPillars 四柱情報
   * @returns 主要五行と陰陽の情報を含む Result オブジェクト
   */
  @Memoize((fourPillars) => {
    if (!fourPillars || !fourPillars.dayPillar) return 'invalid';
    return `${fourPillars.dayPillar.stem || 'null'}-${fourPillars.monthPillar?.stem || 'null'}`;
  })
  extractElementalInfo(fourPillars: FourPillars): Result<ElementalInfo, Error> {
    // 型検証: null/undefined チェック
    if (!fourPillars) {
      return failure(new Error('四柱情報が提供されていません'));
    }
    
    // 型検証: 日柱存在チェック
    if (!fourPillars.dayPillar || !fourPillars.dayPillar.stem) {
      return failure(new Error('四柱情報が不完全です。有効な日柱情報が必要です。'));
    }
    
    // 日柱天干を取得
    const dayStem = fourPillars.dayPillar.stem;
    
    // 型検証: 有効な天干かどうか確認
    if (!this.stemToElement[dayStem]) {
      return failure(new Error(`無効な天干です: ${dayStem}`));
    }
    
    // 月柱から二次要素を取得（オプション）
    let secondaryElement: ElementType | undefined;
    if (fourPillars.monthPillar && fourPillars.monthPillar.stem) {
      const monthStem = fourPillars.monthPillar.stem;
      if (this.stemToElement[monthStem]) {
        secondaryElement = this.stemToElement[monthStem];
      }
    }
    
    // 結果を返す
    return success({
      mainElement: this.stemToElement[dayStem],
      yinYang: this.stemToYinYang[dayStem],
      secondaryElement
    });
  }

  /**
   * DailyCalendarInfoとユーザーのSajuプロファイルから運勢データ用のSajuDataを作成
   * メモ化パターン適用で効率化
   * 
   * @param calendarInfo 日次カレンダー情報
   * @param userDayMaster ユーザーの日主（日干）
   * @param userMainElement ユーザーの主要五行
   * @param userBranchTenGods ユーザーの地支十神関係
   * @returns 運勢データ用のSajuData を含む Result オブジェクト
   */
  @Memoize((calendarInfo, userDayMaster, userMainElement, userBranchTenGods) => {
    return `${calendarInfo.date}-${userDayMaster}-${userMainElement}-${userBranchTenGods ? Object.keys(userBranchTenGods).length : 0}`;
  })
  createFortuneCompatibilityData(
    calendarInfo: IDailyCalendarInfoDocument,
    userDayMaster: CelestialStem,
    userMainElement: ElementType,
    userBranchTenGods?: Record<string, TenGodType>
  ): Result<FortuneCompatibilityData, Error> {
    // データ検証
    if (!calendarInfo) {
      return failure(new Error('日次カレンダー情報が提供されていません'));
    }
    
    if (!calendarInfo.dayPillar || !calendarInfo.dayPillar.stem || !calendarInfo.dayPillar.branch) {
      return failure(new Error('日次カレンダー情報が不完全です。日柱情報が必要です。'));
    }
    
    if (!this.stemToElement[userDayMaster]) {
      return failure(new Error(`無効な日主です: ${userDayMaster}`));
    }
    
    if (!this.validElements.includes(userMainElement)) {
      return failure(new Error(`無効な五行です: ${userMainElement}`));
    }
    
    // 日柱の天干と地支を取得
    const dayStem = calendarInfo.dayPillar.stem;
    const dayBranch = calendarInfo.dayPillar.branch;
    
    // 天干から十神関係を計算（型アサーション使用）
    const tenGodResult = this.calculateTenGodRelation(
      userDayMaster as CelestialStem, 
      dayStem as CelestialStem
    );
    if (tenGodResult.isFailure) {
      return failure(tenGodResult.getError());
    }
    const tenGod = tenGodResult.getValue();
    
    // 地支から十神関係を取得（ユーザーの情報があれば使用）
    let branchTenGod: TenGodType = '比肩'; // デフォルト値
    
    if (userBranchTenGods && userBranchTenGods['day']) {
      // 安全なプロパティアクセス
      branchTenGod = userBranchTenGods['day'] as TenGodType;
    } else {
      // サーバーサイドで地支十神計算（型アサーション使用）
      const branchTenGodResult = this.calculateSimpleBranchTenGod(
        userDayMaster as CelestialStem, 
        dayBranch as TerrestrialBranch
      );
      if (branchTenGodResult.isSuccess) {
        branchTenGod = branchTenGodResult.getValue();
      }
    }
    
    // 相性スコアを計算（0-100の範囲）
    const compatibilityResult = this.calculateCompatibilityScore(
      userMainElement as ElementType,
      (calendarInfo.mainElement as ElementType) || this.stemToElement[dayStem as CelestialStem],
      tenGod,
      branchTenGod
    );
    
    if (compatibilityResult.isFailure) {
      return failure(compatibilityResult.getError());
    }
    
    // 結果を返す
    return success({
      dayMaster: userDayMaster,
      dayElement: userMainElement,
      tenGod,
      branchTenGod,
      compatibility: compatibilityResult.getValue()
    });
  }
  
  /**
   * 天干の十神関係を計算（基本アルゴリズム）
   * メモ化パターン適用で効率化
   * 
   * @param dayMaster 日主（日干）
   * @param targetStem 対象の天干
   * @returns 十神関係を含む Result オブジェクト
   */
  @Memoize((dayMaster, targetStem) => `${dayMaster}-${targetStem}`)
  private calculateTenGodRelation(dayMaster: CelestialStem, targetStem: CelestialStem): Result<TenGodType, Error> {
    // データ検証
    if (!this.stemToElement[dayMaster]) {
      return failure(new Error(`無効な日主です: ${dayMaster}`));
    }
    
    if (!this.stemToElement[targetStem]) {
      return failure(new Error(`無効な天干です: ${targetStem}`));
    }
    
    // 自身の場合は日主
    if (dayMaster === targetStem) {
      return success('日主');
    }
    
    // 天干が陽性かどうか
    const isYang = (stem: CelestialStem): boolean => {
      return ['甲', '丙', '戊', '庚', '壬'].includes(stem);
    };
    
    const dayMasterElement = this.stemToElement[dayMaster];
    const targetElement = this.stemToElement[targetStem];
    const isSameElement = dayMasterElement === targetElement;
    const isBothYang = isYang(dayMaster) && isYang(targetStem);
    const isBothYin = !isYang(dayMaster) && !isYang(targetStem);
    
    // 同じ五行同士の関係
    if (isSameElement) {
      if (isBothYang || isBothYin) {
        return success('比肩'); // 同じ陰陽
      } else {
        return success('劫財'); // 異なる陰陽
      }
    }
    
    // 五行の相生・相剋関係に基づいて十神関係を決定
    const dayMasterIsYang = isYang(dayMaster);
    
    switch (dayMasterElement) {
      case '木':
        if (targetElement === '火') { // 木が火を生む
          return success(dayMasterIsYang ? '食神' : '傷官');
        } else if (targetElement === '土') { // 木が土に克される
          return success(dayMasterIsYang ? '偏財' : '正財');
        } else if (targetElement === '金') { // 金が木を克す
          return success(dayMasterIsYang ? '七殺' : '正官');
        } else if (targetElement === '水') { // 水が木を生む
          return success(dayMasterIsYang ? '偏印' : '正印');
        }
        break;
      case '火':
        if (targetElement === '土') { // 火が土を生む
          return success(dayMasterIsYang ? '食神' : '傷官');
        } else if (targetElement === '金') { // 火が金に克される
          return success(dayMasterIsYang ? '偏財' : '正財');
        } else if (targetElement === '水') { // 水が火を克す
          return success(dayMasterIsYang ? '七殺' : '正官');
        } else if (targetElement === '木') { // 木が火を生む
          return success(dayMasterIsYang ? '偏印' : '正印');
        }
        break;
      case '土':
        if (targetElement === '金') { // 土が金を生む
          return success(dayMasterIsYang ? '食神' : '傷官');
        } else if (targetElement === '水') { // 土が水に克される
          return success(dayMasterIsYang ? '偏財' : '正財');
        } else if (targetElement === '木') { // 木が土を克す
          return success(dayMasterIsYang ? '七殺' : '正官');
        } else if (targetElement === '火') { // 火が土を生む
          return success(dayMasterIsYang ? '偏印' : '正印');
        }
        break;
      case '金':
        if (targetElement === '水') { // 金が水を生む
          return success(dayMasterIsYang ? '食神' : '傷官');
        } else if (targetElement === '木') { // 金が木に克される
          return success(dayMasterIsYang ? '偏財' : '正財');
        } else if (targetElement === '火') { // 火が金を克す
          return success(dayMasterIsYang ? '七殺' : '正官');
        } else if (targetElement === '土') { // 土が金を生む
          return success(dayMasterIsYang ? '偏印' : '正印');
        }
        break;
      case '水':
        if (targetElement === '木') { // 水が木を生む
          return success(dayMasterIsYang ? '食神' : '傷官');
        } else if (targetElement === '火') { // 水が火に克される
          return success(dayMasterIsYang ? '偏財' : '正財');
        } else if (targetElement === '土') { // 土が水を克す
          return success(dayMasterIsYang ? '七殺' : '正官');
        } else if (targetElement === '金') { // 金が水を生む
          return success(dayMasterIsYang ? '偏印' : '正印');
        }
        break;
    }
    
    // ここに到達することはないはずだが、コンパイルエラー防止のため
    return success('比肩');
  }

  /**
   * 地支の十神関係を簡易計算（地支の持つ五行から）
   * メモ化パターン適用で効率化
   * 
   * @param dayMaster 日主（日干）
   * @param branch 地支
   * @returns 十神関係を含む Result オブジェクト
   */
  @Memoize((dayMaster, branch) => `${dayMaster}-${branch}`)
  private calculateSimpleBranchTenGod(dayMaster: CelestialStem, branch: TerrestrialBranch): Result<TenGodType, Error> {
    // データ検証
    if (!this.stemToElement[dayMaster]) {
      return failure(new Error(`無効な日主です: ${dayMaster}`));
    }
    
    if (!this.branchToElement[branch]) {
      return failure(new Error(`無効な地支です: ${branch}`));
    }
    
    // 地支の五行を取得
    const branchElement = this.branchToElement[branch];
    // 対応する陽の天干を取得
    const equivalentStem = this.elementToYangStem[branchElement];
    
    // 天干の十神計算を利用
    return this.calculateTenGodRelation(dayMaster, equivalentStem);
  }

  /**
   * 相性スコアを計算（0-100の範囲）
   * ユーザーの五行と日次の五行、十神関係に基づく計算
   * データ検証とロギング機能付き、メモ化パターン適用で効率化
   * 
   * @param userElement ユーザーの主要五行
   * @param dayElement 日の五行
   * @param tenGod 天干十神関係
   * @param branchTenGod 地支十神関係
   * @returns 相性スコア（0-100）を含む Result オブジェクト
   */
  @Memoize((userElement, dayElement, tenGod, branchTenGod) => 
    `${userElement}-${dayElement}-${tenGod}-${branchTenGod}`)
  private calculateCompatibilityScore(
    userElement: ElementType,
    dayElement: ElementType,
    tenGod: TenGodType,
    branchTenGod: TenGodType
  ): Result<number, Error> {
    // データ検証
    if (!this.validElements.includes(userElement)) {
      userElement = '木'; // デフォルト値
    }
    
    if (!this.validElements.includes(dayElement)) {
      dayElement = '木'; // デフォルト値
    }
    
    if (!this.validTenGods.includes(tenGod)) {
      tenGod = '比肩'; // デフォルト値
    }
    
    if (!this.validTenGods.includes(branchTenGod)) {
      branchTenGod = '比肩'; // デフォルト値
    }
    
    let score = 50; // 基本点
    
    // 五行相性スコア計算（相生：+10、相剋：-10、同じ：+5）
    if (this.isElementGenerating(userElement, dayElement)) {
      score += 10; // 相生+
    } else if (this.isElementGenerating(dayElement, userElement)) {
      score += 5; // 相生-
    } else if (this.isElementOvercoming(userElement, dayElement)) {
      score -= 5; // 相剋+
    } else if (this.isElementOvercoming(dayElement, userElement)) {
      score -= 10; // 相剋-
    } else if (userElement === dayElement) {
      score += 5; // 同じ五行
    }
    
    // 十神関係によるスコア調整
    // 食神、偏印、比肩は生産性高い
    if (['食神', '偏印', '比肩'].includes(tenGod)) {
      score += 15;
    } 
    // 正財、正印は安定
    else if (['正財', '正印'].includes(tenGod)) {
      score += 10;
    }
    // 傷官、劫財は変化をもたらす
    else if (['傷官', '劫財'].includes(tenGod)) {
      score += 5;
    }
    // 七殺、正官は制約をもたらす
    else if (['七殺', '正官'].includes(tenGod)) {
      score -= 5;
    }
    // 偏財は不安定
    else if (tenGod === '偏財') {
      score -= 10;
    }
    
    // 地支十神関係によるスコア調整（天干より影響小）
    if (['食神', '偏印', '比肩'].includes(branchTenGod)) {
      score += 7;
    } else if (['正財', '正印'].includes(branchTenGod)) {
      score += 5;
    } else if (['傷官', '劫財'].includes(branchTenGod)) {
      score += 3;
    } else if (['七殺', '正官'].includes(branchTenGod)) {
      score -= 3;
    } else if (branchTenGod === '偏財') {
      score -= 5;
    }
    
    // スコアの上限・下限調整
    const finalScore = Math.max(0, Math.min(100, score));
    
    return success(finalScore);
  }
  
  /**
   * 五行の相生関係を確認（sourceがtargetを生む）
   * @param source 元の五行
   * @param target 対象の五行
   * @returns sourceがtargetを生むかどうか
   */
  private isElementGenerating(source: ElementType, target: ElementType): boolean {
    return this.elementGeneratingRelationships[source] === target;
  }
  
  /**
   * 五行の相剋関係を確認（sourceがtargetを克す）
   * @param source 元の五行
   * @param target 対象の五行
   * @returns sourceがtargetを克すかどうか
   */
  private isElementOvercoming(source: ElementType, target: ElementType): boolean {
    return this.elementOvercomingRelationships[source] === target;
  }
  
  /**
   * 運勢データとカレンダー情報を組み合わせて強化したデータを作成
   * エラー処理とデータ検証付き
   * 
   * @param fortune 運勢データ
   * @param calendarInfo 日次カレンダー情報
   * @returns 強化された運勢データ
   */
  combineFortuneWithCalendarInfo(fortune: any, calendarInfo: ExtendedCalendarInfo): any {
    // データ検証
    if (!fortune) {
      return this.createDefaultFortune();
    }
    
    if (!calendarInfo) {
      return fortune; // 元の運勢データをそのまま返す
    }
    
    try {
      // 既存の運勢データをコピー（イミュータブルに処理）
      const enhancedFortune = { ...fortune };
      
      // 日柱情報から五行・陰陽を更新
      if (calendarInfo.mainElement) {
        enhancedFortune.dailyElement = calendarInfo.mainElement;
      }
      
      if (calendarInfo.dayYinYang) {
        enhancedFortune.yinYang = calendarInfo.dayYinYang;
      }
      
      // 暦情報を追加
      enhancedFortune.calendarInfo = {
        date: calendarInfo.date,
        lunarDate: calendarInfo.lunarDate || {
          year: new Date().getFullYear(),
          month: new Date().getMonth() + 1,
          day: new Date().getDate(),
          isLeapMonth: false
        },
        solarTerms: calendarInfo.solarTerms || {
          current: { name: '未定義', date: new Date() }
        }
      };
      
      // 四柱情報のフォーマット（データ検証付き）
      enhancedFortune.fourPillars = {};
      
      // 年柱のフォーマット（存在する場合）
      if (calendarInfo.yearPillar) {
        enhancedFortune.fourPillars.year = this.formatPillar(calendarInfo.yearPillar);
      }
      
      // 月柱のフォーマット（存在する場合）
      if (calendarInfo.monthPillar) {
        enhancedFortune.fourPillars.month = this.formatPillar(calendarInfo.monthPillar);
      }
      
      // 日柱のフォーマット（存在する場合）
      if (calendarInfo.dayPillar) {
        enhancedFortune.fourPillars.day = this.formatPillar(calendarInfo.dayPillar);
      }
      
      // 時柱のフォーマット（存在する場合）
      if (calendarInfo.hourPillar) {
        enhancedFortune.fourPillars.hour = this.formatPillar(calendarInfo.hourPillar);
      }
      
      // DailyCalendarInfoの参照を追加
      if (calendarInfo._id) {
        enhancedFortune.dailyCalendarInfoId = calendarInfo._id.toString();
      }
      
      return enhancedFortune;
    } catch (error) {
      console.error('[SajuDataTransformer.combineFortuneWithCalendarInfo] エラー:', 
        error instanceof Error ? error.message : 'unknown error');
      
      // エラー時は元の運勢データをそのまま返す
      return fortune;
    }
  }
  
  /**
   * デフォルトの運勢データを作成
   * @returns デフォルトの運勢データ
   */
  private createDefaultFortune(): any {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    return {
      date: todayStr,
      dailyElement: '木',
      yinYang: '陽',
      overallLuck: 50,
      careerLuck: 50,
      relationshipLuck: 50,
      creativeEnergyLuck: 50,
      healthLuck: 50,
      wealthLuck: 50,
      description: 'デフォルトの運勢情報です。',
      advice: 'デフォルトのアドバイスです。',
      luckyColors: ['青'],
      luckyDirections: ['東'],
      compatibleElements: ['水'],
      incompatibleElements: ['土'],
      createdAt: today,
      updatedAt: today
    };
  }
  
  /**
   * 柱情報をフォーマット（表示用）
   * データ検証と安全な変換付き
   * 
   * @param pillar 柱情報
   * @returns フォーマットされた柱情報
   */
  private formatPillar(pillar: any): any {
    // データ検証
    if (!pillar) {
      return {
        stem: '甲',
        branch: '子',
        fullName: '甲子',
        element: '木',
        yinYang: '陽',
        hiddenStems: []
      };
    }
    
    // 必須プロパティの存在確認
    const stem = pillar.stem || '甲';
    const branch = pillar.branch || '子';
    
    // 要素と陰陽のデフォルト値（stem から取得できる場合は取得）
    let element = pillar.element;
    let yinYang = pillar.yinYang;
    
    // stem から element と yinYang を導出（存在しない場合）
    if (!element || !yinYang) {
      const safeStem = stem as CelestialStem;
      element = this.stemToElement[safeStem] || '木';
      yinYang = this.stemToYinYang[safeStem] || '陽';
    }
    
    // hiddenStems の安全な処理
    let hiddenStems = [];
    if (Array.isArray(pillar.hiddenStems)) {
      hiddenStems = pillar.hiddenStems;
    }
    
    return {
      stem,
      branch,
      fullName: `${stem}${branch}`,
      element,
      yinYang,
      hiddenStems
    };
  }
  
  /**
   * 指定されたSajuProfileから地支十神情報を抽出
   * SystemMessageBuilderやDailyFortuneServiceでの使用を考慮
   * 
   * @param sajuProfile 四柱推命プロファイル
   * @returns 地支十神情報のマッピングを含む Optional オブジェクト
   */
  extractBranchTenGods(sajuProfile: any): Optional<Record<PillarType, TenGodType>> {
    if (!sajuProfile) {
      return Optional.empty();
    }
    
    try {
      // branchTenGods プロパティが既にある場合はそのまま返す
      if (sajuProfile.branchTenGods && typeof sajuProfile.branchTenGods === 'object') {
        return Optional.of(sajuProfile.branchTenGods as Record<PillarType, TenGodType>);
      }
      
      // 代替データとして各柱の地支に対して簡易計算
      if (sajuProfile.fourPillars && sajuProfile.fourPillars.dayPillar && sajuProfile.fourPillars.dayPillar.stem) {
        const dayMaster = sajuProfile.fourPillars.dayPillar.stem;
        const result: Partial<Record<PillarType, TenGodType>> = {};
        
        // 各柱の地支に対して計算
        const pillarTypes: PillarType[] = ['year', 'month', 'day', 'hour'];
        
        // すべての柱を一度に処理（並行計算）
        for (const pillarType of pillarTypes) {
          if (sajuProfile.fourPillars[pillarType] && sajuProfile.fourPillars[pillarType].branch) {
            const branch = sajuProfile.fourPillars[pillarType].branch;
            const tenGodResult = this.calculateSimpleBranchTenGod(dayMaster, branch);
            if (tenGodResult.isSuccess) {
              result[pillarType] = tenGodResult.getValue();
            }
          }
        }
        
        if (Object.keys(result).length > 0) {
          return Optional.of(result as Record<PillarType, TenGodType>);
        }
      }
      
      return Optional.empty();
    } catch (error) {
      console.error('[SajuDataTransformer.extractBranchTenGods] エラー:', 
        error instanceof Error ? error.message : 'unknown error');
      return Optional.empty();
    }
  }
  
  /**
   * 統合されたチーム相性データを生成
   * 複数のメンバー間の相性を一度に計算
   * 
   * @param members チームメンバーの配列
   * @returns チーム相性データ
   */
  @Memoize((members) => {
    // メンバーのIDとベーシックな情報からキーを生成
    if (!members || !Array.isArray(members)) return 'invalid';
    return members.map(m => m.id || m._id).sort().join('-');
  })
  calculateTeamCompatibility(members: any[]): any {
    if (!members || !Array.isArray(members) || members.length < 2) {
      return {
        overallScore: 0,
        relationships: [],
        elementalBalance: {},
        teamSize: 0
      };
    }
    
    const relationships: any[] = [];
    let totalScore = 0;
    const elementalCount: Record<ElementType, number> = {
      '木': 0, '火': 0, '土': 0, '金': 0, '水': 0
    };
    
    // メンバー間の総当たりで相性を計算
    for (let i = 0; i < members.length; i++) {
      const member1 = members[i];
      
      // 五行情報を集計
      if (member1.sajuProfile && member1.sajuProfile.mainElement) {
        const element = member1.sajuProfile.mainElement as ElementType;
        if (this.validElements.includes(element)) {
          elementalCount[element]++;
        }
      }
      
      for (let j = i + 1; j < members.length; j++) {
        const member2 = members[j];
        
        // 両方のメンバーに四柱情報がある場合のみ計算
        if (
          member1.sajuProfile && member1.sajuProfile.fourPillars && 
          member2.sajuProfile && member2.sajuProfile.fourPillars
        ) {
          try {
            // 互換性スコアを計算
            const compatibilityResult = this.calculateMemberCompatibility(member1, member2);
            
            if (compatibilityResult.isSuccess) {
              const compatibility = compatibilityResult.getValue();
              relationships.push({
                member1Id: member1.id || member1._id,
                member1Name: member1.name || member1.username || 'Unknown',
                member2Id: member2.id || member2._id,
                member2Name: member2.name || member2.username || 'Unknown',
                compatibilityScore: compatibility.score,
                relationship: compatibility.relationship,
                tenGodRelationship: compatibility.tenGodRelationship
              });
              
              totalScore += compatibility.score;
            }
          } catch (error) {
            console.error('[SajuDataTransformer.calculateTeamCompatibility] 相性計算エラー:', 
              error instanceof Error ? error.message : 'unknown error');
          }
        }
      }
    }
    
    // 平均スコア計算（関係がない場合は0）
    const relationshipCount = relationships.length;
    const overallScore = relationshipCount > 0 ? Math.round(totalScore / relationshipCount) : 0;
    
    // 五行のバランス分析
    const totalElements = Object.values(elementalCount).reduce((sum, count) => sum + count, 0);
    const elementalBalance: Record<ElementType, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
    
    if (totalElements > 0) {
      for (const element of this.validElements) {
        elementalBalance[element] = Math.round((elementalCount[element] / totalElements) * 100);
      }
    }
    
    // チーム相性データを返す
    return {
      overallScore,
      relationships,
      elementalBalance,
      teamSize: members.length
    };
  }
  
  /**
   * 2人のメンバー間の相性を計算
   * 
   * @param member1 メンバー1
   * @param member2 メンバー2
   * @returns 相性情報
   */
  private calculateMemberCompatibility(member1: any, member2: any): Result<{
    score: number;
    relationship: string;
    tenGodRelationship: {
      member1ToMember2: TenGodType;
      member2ToMember1: TenGodType;
    };
  }, Error> {
    // データ検証
    if (!member1 || !member2) {
      return failure(new Error('メンバー情報が不完全です'));
    }
    
    if (!member1.sajuProfile || !member2.sajuProfile) {
      return failure(new Error('四柱推命プロファイルが不足しています'));
    }
    
    try {
      // 日主の取得
      const dayMaster1 = member1.sajuProfile.fourPillars.dayPillar.stem;
      const dayMaster2 = member2.sajuProfile.fourPillars.dayPillar.stem;
      
      // 十神関係の計算
      const tenGod1To2Result = this.calculateTenGodRelation(dayMaster1, dayMaster2);
      const tenGod2To1Result = this.calculateTenGodRelation(dayMaster2, dayMaster1);
      
      if (tenGod1To2Result.isFailure || tenGod2To1Result.isFailure) {
        return failure(new Error('十神関係の計算に失敗しました'));
      }
      
      const tenGod1To2 = tenGod1To2Result.getValue();
      const tenGod2To1 = tenGod2To1Result.getValue();
      
      // 五行の取得
      const element1 = member1.sajuProfile.mainElement;
      const element2 = member2.sajuProfile.mainElement;
      
      // 五行相性の判定
      let relationshipType = '中立';
      let baseScore = 50;
      
      if (this.isElementGenerating(element1, element2)) {
        relationshipType = '相生+';
        baseScore += 10;
      } else if (this.isElementGenerating(element2, element1)) {
        relationshipType = '相生-';
        baseScore += 5;
      } else if (this.isElementOvercoming(element1, element2)) {
        relationshipType = '相剋+';
        baseScore -= 5;
      } else if (this.isElementOvercoming(element2, element1)) {
        relationshipType = '相剋-';
        baseScore -= 10;
      } else if (element1 === element2) {
        relationshipType = '同五行';
        baseScore += 5;
      }
      
      // 十神関係による調整
      const tenGodScore1 = this.getTenGodCompatibilityScore(tenGod1To2);
      const tenGodScore2 = this.getTenGodCompatibilityScore(tenGod2To1);
      
      const score = Math.min(100, Math.max(0, Math.round(baseScore + (tenGodScore1 + tenGodScore2) / 2)));
      
      return success({
        score,
        relationship: relationshipType,
        tenGodRelationship: {
          member1ToMember2: tenGod1To2,
          member2ToMember1: tenGod2To1
        }
      });
    } catch (error) {
      return failure(new Error(`相性計算エラー: ${error instanceof Error ? error.message : 'unknown error'}`));
    }
  }
  
  /**
   * 十神関係に基づく相性スコアを取得
   * 
   * @param tenGod 十神関係
   * @returns 相性スコア
   */
  private getTenGodCompatibilityScore(tenGod: TenGodType): number {
    switch (tenGod) {
      case '食神': return 15;
      case '偏印': return 15;
      case '比肩': return 15;
      case '正財': return 10;
      case '正印': return 10;
      case '傷官': return 5;
      case '劫財': return 5;
      case '七殺': return -5;
      case '正官': return -5;
      case '偏財': return -10;
      case '日主': return 0;
      default: return 0;
    }
  }
}