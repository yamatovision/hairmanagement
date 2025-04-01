import { ElementType, YinYangType, ELEMENT_GENERATING_RELATIONS, ELEMENT_CONTROLLING_RELATIONS } from '@shared';

/**
 * 陰陽五行プロファイル値オブジェクト
 * ユーザーの五行属性を表す値オブジェクト
 */
export class ElementalProfile {
  /**
   * コンストラクタ
   * @param mainElement 主要素
   * @param yinYang 陰陽
   * @param secondaryElement 副要素（オプション）
   */
  constructor(
    public readonly mainElement: ElementType,
    public readonly yinYang: YinYangType,
    public readonly secondaryElement?: ElementType
  ) {}
  
  /**
   * 別のプロファイルとの相性を計算する
   * @param other 比較対象のプロファイル
   * @returns 相性スコア（0-100）
   */
  calculateCompatibility(other: ElementalProfile): number {
    let score = 50; // 基本スコア
    
    // 主要素の相生関係
    if (ELEMENT_GENERATING_RELATIONS[this.mainElement] === other.mainElement) {
      // 自分の要素が相手の要素を生む（良い関係）
      score += 20;
    } else if (ELEMENT_GENERATING_RELATIONS[other.mainElement] === this.mainElement) {
      // 相手の要素が自分の要素を生む（良い関係だが少し弱い）
      score += 15;
    }
    
    // 主要素の相剋関係
    if (ELEMENT_CONTROLLING_RELATIONS[this.mainElement] === other.mainElement) {
      // 自分の要素が相手の要素を抑制（やや複雑な関係）
      score -= 10;
    } else if (ELEMENT_CONTROLLING_RELATIONS[other.mainElement] === this.mainElement) {
      // 相手の要素が自分の要素を抑制（やや複雑な関係）
      score -= 10;
    }
    
    // 陰陽の影響
    if (this.yinYang === other.yinYang) {
      // 同じ陰陽はバランスを欠く可能性がある
      score -= 5;
    } else {
      // 異なる陰陽は互いに補完する
      score += 10;
    }
    
    // 副要素の影響を考慮（両方が副要素を持つ場合）
    if (this.secondaryElement && other.secondaryElement) {
      if (this.secondaryElement === other.mainElement || other.secondaryElement === this.mainElement) {
        // 副要素と主要素の相互補完性
        score += 10;
      }
    }
    
    // スコアを0-100の範囲に収める
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * 指定された要素が相生関係にあるかチェックする
   * @param element チェックする要素
   * @returns 相生関係ならtrue
   */
  isGeneratingElement(element: ElementType): boolean {
    return ELEMENT_GENERATING_RELATIONS[this.mainElement] === element;
  }
  
  /**
   * 指定された要素が相剋関係にあるかチェックする
   * @param element チェックする要素
   * @returns 相剋関係ならtrue
   */
  isControllingElement(element: ElementType): boolean {
    return ELEMENT_CONTROLLING_RELATIONS[this.mainElement] === element;
  }
  
  /**
   * プロファイルのシンプルな文字列表現を返す
   * @returns 文字列表現
   */
  toString(): string {
    return `${this.yinYang}${this.mainElement}${this.secondaryElement ? `/${this.secondaryElement}` : ''}`;
  }
  
  /**
   * データオブジェクトに変換する
   * @returns プレーンなオブジェクト
   */
  toPlain() {
    return {
      mainElement: this.mainElement,
      secondaryElement: this.secondaryElement,
      yinYang: this.yinYang
    };
  }
}