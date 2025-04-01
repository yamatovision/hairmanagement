/**
 * 陰陽五行の計算を行うユーティリティクラス
 * 生年月日から個人の五行属性を計算し、日付から日の五行を求める
 * 
 * 変更履歴:
 * - 2025/03/26: 初期実装 (AppGenius)
 */

import { 
  ElementType, 
  YinYangType, 
  SIMPLIFIED_DAY_CALCULATION 
} from '@shared';

export class ElementalCalculator {
  /**
   * 生年月日から個人の主要五行属性を計算する
   * この実装は簡略化されたもので、実際の算命学では複雑な計算が必要
   * 
   * @param birthDate 生年月日 (YYYY-MM-DD形式)
   * @returns 主要五行属性と陰陽
   */
  static calculatePersonalElement(birthDate: string): { 
    mainElement: ElementType, 
    secondaryElement: ElementType, 
    yin: boolean 
  } {
    if (!this.isValidDateFormat(birthDate)) {
      throw new Error('無効な日付形式です。YYYY-MM-DD形式で指定してください。');
    }
    
    const [year, month, day] = birthDate.split('-').map(Number);
    
    // 簡略化した計算方法
    // 実際の五行計算はもっと複雑で、干支や八字に基づく
    
    // 主要属性: 月と日の合計を5で割った余りから計算
    const mainElementIndex = (month + day) % 5;
    const mainElement = SIMPLIFIED_DAY_CALCULATION.dayElementMap[mainElementIndex] as ElementType;
    
    // 副属性: 年と月の合計を5で割った余りから計算
    const secondaryElementIndex = (year + month) % 5;
    const secondaryElement = SIMPLIFIED_DAY_CALCULATION.dayElementMap[secondaryElementIndex] as ElementType;
    
    // 陰陽は誕生日の日付から (偶数=陰、奇数=陽)
    const yin = day % 2 === 0;
    
    return {
      mainElement,
      secondaryElement,
      yin
    };
  }
  
  /**
   * 特定の日付の五行属性と陰陽を計算する
   * 
   * @param date 日付 (YYYY-MM-DD形式)
   * @returns 日の五行属性と陰陽
   */
  static calculateDayElement(date: string): {
    element: ElementType,
    yinYang: YinYangType
  } {
    if (!this.isValidDateFormat(date)) {
      throw new Error('無効な日付形式です。YYYY-MM-DD形式で指定してください。');
    }
    
    const [, month, day] = date.split('-').map(Number);
    
    // 日の五行を計算
    const elementIndex = (month + day) % 5;
    const element = SIMPLIFIED_DAY_CALCULATION.dayElementMap[elementIndex] as ElementType;
    
    // 日の陰陽を計算
    const yinYang = day % 2 === 0 
      ? SIMPLIFIED_DAY_CALCULATION.dayYinYangMap.even 
      : SIMPLIFIED_DAY_CALCULATION.dayYinYangMap.odd;
    
    return { element, yinYang: yinYang as YinYangType };
  }
  
  /**
   * 月ごとの五行属性を返す
   * これは伝統的な季節の割り当てに基づく
   * 
   * @param month 月 (1-12)
   * @returns 月の五行属性
   */
  static getMonthElement(month: number): ElementType {
    if (month < 1 || month > 12) {
      throw new Error('無効な月です。1から12の間で指定してください。');
    }
    
    // 伝統的な季節に基づく五行の割り当て
    const monthElementMap: Record<number, ElementType> = {
      1: '水', // 1月: 冬 (水)
      2: '水', // 2月: 冬 (水)
      3: '木', // 3月: 春 (木)
      4: '木', // 4月: 春 (木)
      5: '土', // 5月: 土用 (土)
      6: '火', // 6月: 夏 (火)
      7: '火', // 7月: 夏 (火)
      8: '土', // 8月: 土用 (土)
      9: '金', // 9月: 秋 (金)
      10: '金', // 10月: 秋 (金)
      11: '土', // 11月: 土用 (土)
      12: '水'  // 12月: 冬 (水)
    };
    
    return monthElementMap[month];
  }
  
  /**
   * 日付文字列が有効なYYYY-MM-DD形式かチェックする
   * 
   * @param dateStr 日付文字列
   * @returns 有効な日付形式ならtrue
   */
  private static isValidDateFormat(dateStr: string): boolean {
    // YYYY-MM-DD形式のRegExp
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    
    if (!dateRegex.test(dateStr)) {
      return false;
    }
    
    // 日付として有効かチェック
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  }
  
  /**
   * 現在の日の五行属性と陰陽を計算する
   * 
   * @returns 今日の五行属性と陰陽
   */
  static getTodayElement(): {
    element: ElementType,
    yinYang: YinYangType
  } {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // JavaScriptでの月は0始まり
    const day = today.getDate();
    
    // YYYY-MM-DD形式に変換
    const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    return this.calculateDayElement(dateStr);
  }
  
  /**
   * 指定日の運勢スコアを計算する
   * 個人の五行属性と日の五行属性の関係に基づいて計算
   * 
   * @param personalElement 個人の五行属性
   * @param dayElement 日の五行属性
   * @param personalYin 個人の陰陽(true=陰, false=陽)
   * @param dayYinYang 日の陰陽
   * @returns 運勢スコア (1-100)
   */
  static calculateLuckScore(
    personalElement: ElementType,
    dayElement: ElementType,
    personalYin: boolean,
    dayYinYang: YinYangType
  ): number {
    let baseScore = 50; // ニュートラルなスタートポイント
    
    // 1. 五行の相生相剋関係による加減点
    if (this.isGenerating(personalElement, dayElement)) {
      // 個人が日を生む: 良い運勢
      baseScore += 20;
    } else if (this.isGenerating(dayElement, personalElement)) {
      // 日が個人を生む: やや良い運勢
      baseScore += 15;
    } else if (this.isControlling(personalElement, dayElement)) {
      // 個人が日を剋する: やや難しい運勢
      baseScore -= 10;
    } else if (this.isControlling(dayElement, personalElement)) {
      // 日が個人を剋する: 厳しい運勢
      baseScore -= 15;
    } else if (personalElement === dayElement) {
      // 同じ五行: 調和的だが刺激が少ない
      baseScore += 5;
    }
    
    // 2. 陰陽の調和による加減点
    const personalYinYang = personalYin ? '陰' : '陽';
    if (personalYinYang === dayYinYang) {
      // 陰陽が一致: エネルギーの調和
      baseScore += 5;
    } else {
      // 陰陽が異なる: 補完的だが調整が必要
      baseScore += 2;
    }
    
    // 3. ランダム要素を追加してバリエーションを持たせる (±5ポイント)
    baseScore += Math.floor(Math.random() * 11) - 5;
    
    // スコアを1-100の間に制限
    return Math.max(1, Math.min(100, baseScore));
  }
  
  /**
   * 要素Aが要素Bを生む(相生)かどうかをチェック
   * 
   * @param elementA 要素A
   * @param elementB 要素B
   * @returns 相生関係ならtrue
   */
  static isGenerating(elementA: ElementType, elementB: ElementType): boolean {
    const generatingMap: Record<ElementType, ElementType> = {
      '木': '火', // 木は火を生む
      '火': '土', // 火は土を生む
      '土': '金', // 土は金を生む
      '金': '水', // 金は水を生む
      '水': '木'  // 水は木を生む
    };
    
    return generatingMap[elementA] === elementB;
  }
  
  /**
   * 要素Aが要素Bを剋する(相剋)かどうかをチェック
   * 
   * @param elementA 要素A
   * @param elementB 要素B
   * @returns 相剋関係ならtrue
   */
  static isControlling(elementA: ElementType, elementB: ElementType): boolean {
    const controllingMap: Record<ElementType, ElementType> = {
      '木': '土', // 木は土を剋する
      '土': '水', // 土は水を剋する
      '水': '火', // 水は火を剋する
      '火': '金', // 火は金を剋する
      '金': '木'  // 金は木を剋する
    };
    
    return controllingMap[elementA] === elementB;
  }
}