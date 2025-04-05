/**
 * 四柱推命データ変換サービス
 * 
 * データフロー強化（フェーズ2）の一部として実装
 * 四柱推命データの様々なサービス間での変換を担当
 * 
 * 変更履歴:
 * - 2025/04/05: 初期実装 (Claude)
 * - 2025/04/09: データモデル検証と安全性強化 (Claude)
 *   - データ型の検証機能追加
 *   - エラー処理の強化
 *   - 変換方法の一貫性向上
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
  PillarType,
  SajuData
} from '../../shared/types/saju';
import { IDailyCalendarInfoDocument } from '../../domain/models/daily-calendar-info.model';
import { Result, success, failure } from '../../utils/result.util';

/**
 * 四柱推命データ変換サービス
 * 様々なサービス間でのデータ変換を担当
 */
@injectable()
export class SajuDataTransformer {
  /**
   * 四柱情報から主要五行と陰陽情報を抽出
   * データ検証機能付き
   * 
   * @param fourPillars 四柱情報
   * @returns 主要五行と陰陽の情報
   * @throws Error 四柱情報が不完全または無効な場合
   */
  extractElementalInfo(fourPillars: FourPillars): { 
    mainElement: ElementType; 
    yinYang: YinYangType;
    secondaryElement?: ElementType;
  } {
    // データ検証: 四柱情報が完全かどうか確認
    if (!fourPillars || !fourPillars.dayPillar || !fourPillars.dayPillar.stem) {
      console.error('[SajuDataTransformer.extractElementalInfo] 不完全な四柱情報:', 
        JSON.stringify(fourPillars, null, 2));
      throw new Error('四柱情報が不完全です。有効な日柱情報が必要です。');
    }
    
    // 日柱天干から五行と陰陽を取得
    const dayStem = fourPillars.dayPillar.stem;
    
    // 天干と五行のマッピング
    const stemToElement: Record<CelestialStem, ElementType> = {
      '甲': '木', '乙': '木',
      '丙': '火', '丁': '火',
      '戊': '土', '己': '土',
      '庚': '金', '辛': '金',
      '壬': '水', '癸': '水'
    };
    
    // 天干と陰陽のマッピング
    const stemToYinYang: Record<CelestialStem, YinYangType> = {
      '甲': '陽', '丙': '陽', '戊': '陽', '庚': '陽', '壬': '陽',
      '乙': '陰', '丁': '陰', '己': '陰', '辛': '陰', '癸': '陰'
    };
    
    // データ検証: 有効な天干かどうか確認
    if (!stemToElement[dayStem]) {
      console.error('[SajuDataTransformer.extractElementalInfo] 無効な天干:', dayStem);
      throw new Error(`無効な天干です: ${dayStem}`);
    }
    
    // 月柱から二次要素を取得（オプション）
    let secondaryElement: ElementType | undefined;
    if (fourPillars.monthPillar && fourPillars.monthPillar.stem) {
      const monthStem = fourPillars.monthPillar.stem;
      secondaryElement = stemToElement[monthStem];
    }
    
    const result = {
      mainElement: stemToElement[dayStem],
      yinYang: stemToYinYang[dayStem],
      secondaryElement
    };
    
    console.log('[SajuDataTransformer.extractElementalInfo] 抽出結果:', result);
    return result;
  }

  /**
   * DailyCalendarInfoとユーザーのSajuプロファイルから運勢データ用のSajuDataを作成
   * フェーズ2: データ検証とエラーハンドリング強化
   * 
   * @param calendarInfo 日次カレンダー情報
   * @param userDayMaster ユーザーの日主（日干）
   * @param userMainElement ユーザーの主要五行
   * @param userBranchTenGods ユーザーの十神関係
   * @returns 運勢データ用のSajuData（Result型でラップ）
   */
  createFortuneCompatibilityData(
    calendarInfo: IDailyCalendarInfoDocument | any,
    userDayMaster: CelestialStem | string,
    userMainElement: ElementType | string,
    userBranchTenGods?: Record<string, TenGodType> | any
  ): Result<SajuData, Error> {
    const operationName = 'createFortuneCompatibilityData';
    const logPrefix = `[SajuDataTransformer.${operationName}]`;
    
    try {
      console.log(`${logPrefix} 開始`);
      
      // 入力データのバリデーション
      if (!calendarInfo) {
        console.error(`${logPrefix} カレンダー情報がnullまたはundefinedです`);
        return failure(new Error('カレンダー情報が提供されていません'), {
          operationName,
          source: 'SajuDataTransformer',
          severity: 'error'
        });
      }
      
      if (!calendarInfo.dayPillar || !calendarInfo.dayPillar.stem || !calendarInfo.dayPillar.branch) {
        console.error(`${logPrefix} カレンダー情報の日柱データが不完全です:`, calendarInfo);
        return failure(new Error('カレンダー情報の日柱データが不完全です'), {
          operationName,
          source: 'SajuDataTransformer',
          severity: 'error',
          details: { calendarInfo }
        });
      }
      
      // 天干の検証
      const validCelestialStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
      if (!userDayMaster || !validCelestialStems.includes(userDayMaster)) {
        console.error(`${logPrefix} 無効なユーザー日主:`, userDayMaster);
        return failure(new Error(`無効なユーザー日主: ${userDayMaster}`), {
          operationName,
          source: 'SajuDataTransformer',
          severity: 'error'
        });
      }
      
      // 五行の検証
      const validElements = ['木', '火', '土', '金', '水'];
      if (!userMainElement || !validElements.includes(userMainElement)) {
        console.error(`${logPrefix} 無効なユーザー主要五行:`, userMainElement);
        // エラーではなくフォールバック
        console.warn(`${logPrefix} デフォルト値「木」を使用します`);
        userMainElement = '木';
      }
      
      // 日柱の天干と地支を取得
      const dayStem = calendarInfo.dayPillar.stem;
      const dayBranch = calendarInfo.dayPillar.branch;
      
      console.log(`${logPrefix} カレンダー日柱: ${dayStem}${dayBranch}`);
      
      // 天干から十神関係を計算
      let tenGod: TenGodType;
      try {
        tenGod = this.calculateTenGodRelation(userDayMaster as CelestialStem, dayStem as CelestialStem);
        console.log(`${logPrefix} 天干十神計算: ${userDayMaster} と ${dayStem} の関係 = ${tenGod}`);
      } catch (error) {
        console.error(`${logPrefix} 天干十神計算エラー:`, error);
        // フォールバック
        tenGod = '比肩';
        console.warn(`${logPrefix} 天干十神計算エラー - デフォルト値「比肩」を使用します`);
      }
      
      // 地支から十神関係を取得（ユーザーの情報があれば使用）
      let branchTenGod: TenGodType = '比肩'; // デフォルト値
      
      try {
        if (userBranchTenGods && userBranchTenGods['day']) {
          branchTenGod = userBranchTenGods['day'];
          console.log(`${logPrefix} ユーザーの地支十神情報を使用: ${branchTenGod}`);
        } else {
          // サーバーサイドで地支十神計算（簡易版）
          branchTenGod = this.calculateSimpleBranchTenGod(userDayMaster as CelestialStem, dayBranch as TerrestrialBranch);
          console.log(`${logPrefix} 地支十神計算: ${userDayMaster} と ${dayBranch} の関係 = ${branchTenGod}`);
        }
      } catch (error) {
        console.error(`${logPrefix} 地支十神計算エラー:`, error);
        // フォールバック
        branchTenGod = '比肩';
        console.warn(`${logPrefix} 地支十神計算エラー - デフォルト値「比肩」を使用します`);
      }
      
      // 日の五行を検証
      let dayElement = calendarInfo.mainElement;
      if (!dayElement || !validElements.includes(dayElement)) {
        console.warn(`${logPrefix} 無効な日の五行(${dayElement}) - 日干から導出します`);
        
        // 天干から五行を導出
        const stemToElement: Record<string, ElementType> = {
          '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
          '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'
        };
        
        dayElement = stemToElement[dayStem] || '木';
        console.log(`${logPrefix} 日干から日の五行を導出: ${dayStem} → ${dayElement}`);
      }
      
      // 相性スコアを計算（0-100の範囲）
      let compatibility: number;
      try {
        compatibility = this.calculateCompatibilityScore(
          userMainElement as ElementType,
          dayElement as ElementType,
          tenGod,
          branchTenGod
        );
        console.log(`${logPrefix} 相性スコア計算結果: ${compatibility}`);
      } catch (error) {
        console.error(`${logPrefix} 相性スコア計算エラー:`, error);
        // フォールバック
        compatibility = 50;
        console.warn(`${logPrefix} 相性スコア計算エラー - デフォルト値50を使用します`);
      }
      
      // 結果オブジェクトを生成
      const result: SajuData = {
        dayMaster: userDayMaster,
        dayElement: userMainElement as ElementType,
        tenGod,
        branchTenGod,
        compatibility,
        // 拡張情報
        mainElement: userMainElement as ElementType,
        yinYang: this.getStemYinYang(userDayMaster) || '陽',
        rating: this.getCompatibilityRating(compatibility)
      };
      
      console.log(`${logPrefix} 完了:`, {
        mainElement: result.mainElement,
        tenGod: result.tenGod,
        branchTenGod: result.branchTenGod,
        compatibility: result.compatibility
      });
      
      return success(result);
    } catch (error) {
      console.error(`${logPrefix} 予期しないエラー:`, error);
      
      // エラーコンテキストを構築
      const context = {
        operationName,
        source: 'SajuDataTransformer',
        severity: 'error' as 'error',
        details: {
          calendarInfo: calendarInfo ? {
            date: calendarInfo.date,
            dayPillar: calendarInfo.dayPillar
          } : 'undefined',
          userDayMaster,
          userMainElement
        }
      };
      
      return failure(error instanceof Error ? error : new Error('四柱推命データの互換性計算中にエラーが発生しました'), context);
    }
  }
  
  /**
   * 相性スコアに基づいた評価を取得
   * @param score 相性スコア（0-100）
   * @returns 評価文字列
   */
  private getCompatibilityRating(score: number): string {
    if (score >= 80) return '非常に良好';
    if (score >= 60) return '良好';
    if (score >= 40) return '中立';
    if (score >= 20) return '要注意';
    return '困難';
  }

  /**
   * 天干の陰陽を取得
   * @param stem 天干
   * @returns 陰陽（不明な場合はnull）
   */
  private getStemYinYang(stem: string): YinYangType | null {
    const stemToYinYang: Record<string, YinYangType> = {
      '甲': '陽', '丙': '陽', '戊': '陽', '庚': '陽', '壬': '陽',
      '乙': '陰', '丁': '陰', '己': '陰', '辛': '陰', '癸': '陰'
    };
    
    return stemToYinYang[stem] || null;
  }
  
  /**
   * 天干の十神関係を計算（基本アルゴリズム）
   * 
   * @param dayMaster 日主（日干）
   * @param targetStem 対象の天干
   * @returns 十神関係
   */
  private calculateTenGodRelation(dayMaster: CelestialStem, targetStem: CelestialStem): TenGodType {
    // 天干と五行のマッピング
    const stemToElement: Record<CelestialStem, ElementType> = {
      '甲': '木', '乙': '木',
      '丙': '火', '丁': '火',
      '戊': '土', '己': '土',
      '庚': '金', '辛': '金',
      '壬': '水', '癸': '水'
    };
    
    // 天干が陽性かどうか
    const isYang = (stem: CelestialStem): boolean => {
      return ['甲', '丙', '戊', '庚', '壬'].includes(stem);
    };
    
    // 自身の場合は日主
    if (dayMaster === targetStem) {
      return '日主';
    }
    
    const dayMasterElement = stemToElement[dayMaster];
    const targetElement = stemToElement[targetStem];
    const isSameElement = dayMasterElement === targetElement;
    const isBothYang = isYang(dayMaster) && isYang(targetStem);
    const isBothYin = !isYang(dayMaster) && !isYang(targetStem);
    
    // 同じ五行同士の関係
    if (isSameElement) {
      if (isBothYang || isBothYin) {
        return '比肩'; // 同じ陰陽
      } else {
        return '劫財'; // 異なる陰陽
      }
    }
    
    // 五行の相生・相剋関係に基づいて十神関係を決定
    const dayMasterIsYang = isYang(dayMaster);
    
    switch (dayMasterElement) {
      case '木':
        if (targetElement === '火') { // 木が火を生む
          return dayMasterIsYang ? '食神' : '傷官';
        } else if (targetElement === '土') { // 木が土に克される
          return dayMasterIsYang ? '偏財' : '正財';
        } else if (targetElement === '金') { // 金が木を克す
          return dayMasterIsYang ? '七殺' : '正官';
        } else if (targetElement === '水') { // 水が木を生む
          return dayMasterIsYang ? '偏印' : '正印';
        }
        break;
      case '火':
        if (targetElement === '土') { // 火が土を生む
          return dayMasterIsYang ? '食神' : '傷官';
        } else if (targetElement === '金') { // 火が金に克される
          return dayMasterIsYang ? '偏財' : '正財';
        } else if (targetElement === '水') { // 水が火を克す
          return dayMasterIsYang ? '七殺' : '正官';
        } else if (targetElement === '木') { // 木が火を生む
          return dayMasterIsYang ? '偏印' : '正印';
        }
        break;
      case '土':
        if (targetElement === '金') { // 土が金を生む
          return dayMasterIsYang ? '食神' : '傷官';
        } else if (targetElement === '水') { // 土が水に克される
          return dayMasterIsYang ? '偏財' : '正財';
        } else if (targetElement === '木') { // 木が土を克す
          return dayMasterIsYang ? '七殺' : '正官';
        } else if (targetElement === '火') { // 火が土を生む
          return dayMasterIsYang ? '偏印' : '正印';
        }
        break;
      case '金':
        if (targetElement === '水') { // 金が水を生む
          return dayMasterIsYang ? '食神' : '傷官';
        } else if (targetElement === '木') { // 金が木に克される
          return dayMasterIsYang ? '偏財' : '正財';
        } else if (targetElement === '火') { // 火が金を克す
          return dayMasterIsYang ? '七殺' : '正官';
        } else if (targetElement === '土') { // 土が金を生む
          return dayMasterIsYang ? '偏印' : '正印';
        }
        break;
      case '水':
        if (targetElement === '木') { // 水が木を生む
          return dayMasterIsYang ? '食神' : '傷官';
        } else if (targetElement === '火') { // 水が火に克される
          return dayMasterIsYang ? '偏財' : '正財';
        } else if (targetElement === '土') { // 土が水を克す
          return dayMasterIsYang ? '七殺' : '正官';
        } else if (targetElement === '金') { // 金が水を生む
          return dayMasterIsYang ? '偏印' : '正印';
        }
        break;
    }
    
    // 万が一計算できない場合のデフォルト値
    return '比肩';
  }

  /**
   * 地支の十神関係を簡易計算（地支の持つ五行から）
   * 注: 実際の地支十神計算はより複雑なため、
   * 完全版は専用の計算クラスを使用するべき
   * 
   * @param dayMaster 日主（日干）
   * @param branch 地支
   * @returns 十神関係
   */
  private calculateSimpleBranchTenGod(dayMaster: CelestialStem, branch: TerrestrialBranch): TenGodType {
    // 地支と五行のマッピング（簡易版）
    const branchToElement: Record<TerrestrialBranch, ElementType> = {
      '子': '水', '丑': '土', '寅': '木',
      '卯': '木', '辰': '土', '巳': '火',
      '午': '火', '未': '土', '申': '金',
      '酉': '金', '戌': '土', '亥': '水'
    };
    
    // 架空の天干を作成して天干の十神計算を利用
    // 単純化のため、地支の五行に対応する陽の天干を使用
    const elementToYangStem: Record<ElementType, CelestialStem> = {
      '木': '甲',
      '火': '丙',
      '土': '戊',
      '金': '庚',
      '水': '壬'
    };
    
    const branchElement = branchToElement[branch];
    const equivalentStem = elementToYangStem[branchElement];
    
    return this.calculateTenGodRelation(dayMaster, equivalentStem);
  }

  /**
   * 相性スコアを計算（0-100の範囲）
   * ユーザーの五行と日次の五行、十神関係に基づく計算
   * データ検証とロギング機能付き
   * 
   * @param userElement ユーザーの主要五行
   * @param dayElement 日の五行
   * @param tenGod 天干十神関係
   * @param branchTenGod 地支十神関係
   * @returns 相性スコア（0-100）
   */
  private calculateCompatibilityScore(
    userElement: ElementType,
    dayElement: ElementType,
    tenGod: TenGodType,
    branchTenGod: TenGodType
  ): number {
    // データ検証
    const validElements: ElementType[] = ['木', '火', '土', '金', '水'];
    const validTenGods: TenGodType[] = [
      '比肩', '劫財', '食神', '傷官', '偏財', '正財', 
      '七殺', '正官', '偏印', '正印', '日主'
    ];
    
    // 不正なデータを検出した場合はデフォルト値を使用
    if (!validElements.includes(userElement)) {
      console.warn(`[SajuDataTransformer] 無効なユーザー五行: ${userElement}, デフォルト「木」を使用`);
      userElement = '木';
    }
    
    if (!validElements.includes(dayElement)) {
      console.warn(`[SajuDataTransformer] 無効な日の五行: ${dayElement}, デフォルト「木」を使用`);
      dayElement = '木';
    }
    
    if (!validTenGods.includes(tenGod)) {
      console.warn(`[SajuDataTransformer] 無効な天干十神関係: ${tenGod}, デフォルト「比肩」を使用`);
      tenGod = '比肩';
    }
    
    if (!validTenGods.includes(branchTenGod)) {
      console.warn(`[SajuDataTransformer] 無効な地支十神関係: ${branchTenGod}, デフォルト「比肩」を使用`);
      branchTenGod = '比肩';
    }
    
    let score = 50; // 基本点
    let scoreLog: Record<string, number> = { 'base': 50 };
    
    // 五行相性スコア計算（相生：+10、相剋：-10、同じ：+5）
    if (this.isElementGenerating(userElement, dayElement)) {
      score += 10; // 相生+
      scoreLog['相生+'] = 10;
    } else if (this.isElementGenerating(dayElement, userElement)) {
      score += 5; // 相生-
      scoreLog['相生-'] = 5;
    } else if (this.isElementOvercoming(userElement, dayElement)) {
      score -= 5; // 相剋+
      scoreLog['相剋+'] = -5;
    } else if (this.isElementOvercoming(dayElement, userElement)) {
      score -= 10; // 相剋-
      scoreLog['相剋-'] = -10;
    } else if (userElement === dayElement) {
      score += 5; // 同じ五行
      scoreLog['同五行'] = 5;
    }
    
    // 十神関係によるスコア調整
    // 食神、偏印、比肩は生産性高い
    if (['食神', '偏印', '比肩'].includes(tenGod)) {
      score += 15;
      scoreLog[`天干十神(${tenGod})`] = 15;
    } 
    // 正財、正印は安定
    else if (['正財', '正印'].includes(tenGod)) {
      score += 10;
      scoreLog[`天干十神(${tenGod})`] = 10;
    }
    // 傷官、劫財は変化をもたらす
    else if (['傷官', '劫財'].includes(tenGod)) {
      score += 5;
      scoreLog[`天干十神(${tenGod})`] = 5;
    }
    // 七殺、正官は制約をもたらす
    else if (['七殺', '正官'].includes(tenGod)) {
      score -= 5;
      scoreLog[`天干十神(${tenGod})`] = -5;
    }
    // 偏財は不安定
    else if (tenGod === '偏財') {
      score -= 10;
      scoreLog[`天干十神(${tenGod})`] = -10;
    }
    
    // 地支十神関係によるスコア調整（天干より影響小）
    if (['食神', '偏印', '比肩'].includes(branchTenGod)) {
      score += 7;
      scoreLog[`地支十神(${branchTenGod})`] = 7;
    } else if (['正財', '正印'].includes(branchTenGod)) {
      score += 5;
      scoreLog[`地支十神(${branchTenGod})`] = 5;
    } else if (['傷官', '劫財'].includes(branchTenGod)) {
      score += 3;
      scoreLog[`地支十神(${branchTenGod})`] = 3;
    } else if (['七殺', '正官'].includes(branchTenGod)) {
      score -= 3;
      scoreLog[`地支十神(${branchTenGod})`] = -3;
    } else if (branchTenGod === '偏財') {
      score -= 5;
      scoreLog[`地支十神(${branchTenGod})`] = -5;
    }
    
    // スコアの上限・下限調整
    const finalScore = Math.max(0, Math.min(100, score));
    
    // 詳細なスコア計算ログ
    console.log('[SajuDataTransformer] 相性スコア計算:', {
      userElement,
      dayElement,
      tenGod,
      branchTenGod,
      scoreComponents: scoreLog,
      rawScore: score,
      finalScore
    });
    
    return finalScore;
  }
  
  /**
   * 五行の相生関係を確認（sourceがtargetを生む）
   * 
   * @param source 元の五行
   * @param target 対象の五行
   * @returns sourceがtargetを生むかどうか
   */
  private isElementGenerating(source: ElementType, target: ElementType): boolean {
    const relationships = {
      '木': '火',
      '火': '土',
      '土': '金',
      '金': '水',
      '水': '木'
    };
    
    return relationships[source] === target;
  }
  
  /**
   * 五行の相剋関係を確認（sourceがtargetを克す）
   * 
   * @param source 元の五行
   * @param target 対象の五行
   * @returns sourceがtargetを克すかどうか
   */
  private isElementOvercoming(source: ElementType, target: ElementType): boolean {
    const relationships = {
      '木': '土',
      '土': '水',
      '水': '火',
      '火': '金',
      '金': '木'
    };
    
    return relationships[source] === target;
  }
  
  /**
   * 運勢データとカレンダー情報を組み合わせて強化したデータを作成
   * エラー処理とデータ検証付き
   * 
   * @param fortune 運勢データ
   * @param calendarInfo 日次カレンダー情報
   * @returns 強化された運勢データ
   */
  combineFortuneWithCalendarInfo(fortune: any, calendarInfo: IDailyCalendarInfoDocument): any {
    try {
      console.log('[SajuDataTransformer.combineFortuneWithCalendarInfo] 開始');
      
      // データ検証
      if (!fortune) {
        console.error('[SajuDataTransformer] 運勢データが提供されていません');
        return this.createDefaultFortune();
      }
      
      if (!calendarInfo) {
        console.error('[SajuDataTransformer] カレンダー情報が提供されていません');
        return fortune; // 元の運勢データをそのまま返す
      }
      
      // 既存の運勢データをコピー
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
        lunarDate: (calendarInfo as any).lunarDate || {
          year: new Date().getFullYear(),
          month: new Date().getMonth() + 1,
          day: new Date().getDate(),
          isLeapMonth: false
        },
        solarTerms: (calendarInfo as any).solarTerms || {
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
      
      console.log('[SajuDataTransformer.combineFortuneWithCalendarInfo] 完了');
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
      console.warn('[SajuDataTransformer.formatPillar] 無効な柱情報が提供されました');
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
      const stemToInfo: Record<string, [ElementType, YinYangType]> = {
        '甲': ['木', '陽'], '乙': ['木', '陰'],
        '丙': ['火', '陽'], '丁': ['火', '陰'],
        '戊': ['土', '陽'], '己': ['土', '陰'],
        '庚': ['金', '陽'], '辛': ['金', '陰'],
        '壬': ['水', '陽'], '癸': ['水', '陰']
      };
      
      if (stemToInfo[stem]) {
        [element, yinYang] = stemToInfo[stem];
      } else {
        element = '木';
        yinYang = '陽';
      }
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
   * @returns 地支十神情報のマッピング
   */
  extractBranchTenGods(sajuProfile: any): Record<PillarType, TenGodType> | null {
    try {
      if (!sajuProfile) {
        console.warn('[SajuDataTransformer.extractBranchTenGods] プロファイルが指定されていません');
        return null;
      }
      
      // branchTenGods プロパティが既にある場合はそのまま返す
      if (sajuProfile.branchTenGods && typeof sajuProfile.branchTenGods === 'object') {
        console.log('[SajuDataTransformer.extractBranchTenGods] 既存のbranchTenGodsを検出:', 
          Object.keys(sajuProfile.branchTenGods));
        return sajuProfile.branchTenGods as Record<PillarType, TenGodType>;
      }
      
      // 代替データとして各柱の地支に対して簡易計算
      if (sajuProfile.fourPillars && sajuProfile.fourPillars.dayPillar && sajuProfile.fourPillars.dayPillar.stem) {
        const dayMaster = sajuProfile.fourPillars.dayPillar.stem;
        const result: Partial<Record<PillarType, TenGodType>> = {};
        
        // 各柱の地支に対して計算
        const pillarTypes: PillarType[] = ['year', 'month', 'day', 'hour'];
        
        pillarTypes.forEach(pillarType => {
          if (sajuProfile.fourPillars[pillarType] && sajuProfile.fourPillars[pillarType].branch) {
            const branch = sajuProfile.fourPillars[pillarType].branch;
            result[pillarType] = this.calculateSimpleBranchTenGod(dayMaster, branch);
          }
        });
        
        console.log('[SajuDataTransformer.extractBranchTenGods] 計算された地支十神:', result);
        return result as Record<PillarType, TenGodType>;
      }
      
      console.warn('[SajuDataTransformer.extractBranchTenGods] 必要な四柱情報が見つかりません');
      return null;
    } catch (error) {
      console.error('[SajuDataTransformer.extractBranchTenGods] エラー:', 
        error instanceof Error ? error.message : 'unknown error');
      return null;
    }
  }
}