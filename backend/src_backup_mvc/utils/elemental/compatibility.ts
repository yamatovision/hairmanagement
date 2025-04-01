/**
 * 陰陽五行の相性判定を行うユーティリティ
 * 二人の個人間やチーム内の相性を分析する
 * 
 * 変更履歴:
 * - 2025/03/26: 初期実装 (AppGenius)
 */

import { 
  ElementType, 
  YinYangType,
  CompatibilityLevel,
  COMPATIBILITY_RATINGS,
  ELEMENT_GENERATING_RELATIONS,
  ELEMENT_CONTROLLING_RELATIONS,
  GENERATING_DESCRIPTIONS,
  CONTROLLING_DESCRIPTIONS
} from '@shared';

export class ElementalCompatibility {
  /**
   * 二人の陰陽五行属性に基づく相性を計算する
   * 
   * @param person1 最初の人の五行属性情報
   * @param person2 2番目の人の五行属性情報
   * @returns 相性レベルと詳細な分析
   */
  static calculatePersonalCompatibility(
    person1: {
      mainElement: ElementType;
      secondaryElement?: ElementType;
      yinYang: YinYangType;
    },
    person2: {
      mainElement: ElementType;
      secondaryElement?: ElementType;
      yinYang: YinYangType;
    }
  ): {
    level: CompatibilityLevel;
    score: number;
    analysis: string;
    strengths: string[];
    challenges: string[];
  } {
    // 主要属性間の相性をチェック
    const mainCompatibility = this.getElementCompatibility(
      person1.mainElement,
      person2.mainElement
    );
    
    // 副次的な相性チェック(副属性がある場合)
    let secondaryCompatibilityScore = 0;
    let secondaryCompatibilityAnalysis = '';
    
    if (person1.secondaryElement && person2.secondaryElement) {
      const secondaryCompatibility = this.getElementCompatibility(
        person1.secondaryElement,
        person2.secondaryElement
      );
      
      secondaryCompatibilityScore = COMPATIBILITY_RATINGS[secondaryCompatibility].value;
      secondaryCompatibilityAnalysis = `副属性(${person1.secondaryElement}と${person2.secondaryElement})は`;
      
      if (secondaryCompatibilityScore >= 4) {
        secondaryCompatibilityAnalysis += '非常に相性が良く、お互いの隠れた才能を引き出し合えます。';
      } else if (secondaryCompatibilityScore >= 3) {
        secondaryCompatibilityAnalysis += '良い相性で、お互いの副次的な特性を補完します。';
      } else {
        secondaryCompatibilityAnalysis += 'やや挑戦的な関係で、理解し合うための努力が必要です。';
      }
    }
    
    // 陰陽の相性をチェック
    const yinYangCompatibility = this.getYinYangCompatibility(
      person1.yinYang,
      person2.yinYang
    );
    
    // 総合スコアの計算 (主属性70%、副属性20%、陰陽10%の重み付け)
    const mainScore = COMPATIBILITY_RATINGS[mainCompatibility].value;
    const totalScore = Math.round(
      mainScore * 0.7 + 
      (secondaryCompatibilityScore * 0.2) + 
      yinYangCompatibility.score * 0.1
    );
    
    // 合計スコアから総合的な相性レベルを決定
    let level: CompatibilityLevel;
    if (totalScore >= 4.5) level = CompatibilityLevel.EXCELLENT;
    else if (totalScore >= 3.5) level = CompatibilityLevel.GOOD;
    else if (totalScore >= 2.5) level = CompatibilityLevel.NEUTRAL;
    else if (totalScore >= 1.5) level = CompatibilityLevel.CHALLENGING;
    else level = CompatibilityLevel.DIFFICULT;
    
    // 総合分析の作成
    let analysis = `${person1.mainElement}と${person2.mainElement}の相性は`;
    
    if (this.isGeneratingRelation(person1.mainElement, person2.mainElement)) {
      analysis += `相生の関係にあり、${this.getGeneratingDescription(person1.mainElement, person2.mainElement)}。`;
    } else if (this.isGeneratingRelation(person2.mainElement, person1.mainElement)) {
      analysis += `相生の関係にあり、${this.getGeneratingDescription(person2.mainElement, person1.mainElement)}。`;
    } else if (this.isControllingRelation(person1.mainElement, person2.mainElement)) {
      analysis += `相剋の関係にあり、${this.getControllingDescription(person1.mainElement, person2.mainElement)}。`;
    } else if (this.isControllingRelation(person2.mainElement, person1.mainElement)) {
      analysis += `相剋の関係にあり、${this.getControllingDescription(person2.mainElement, person1.mainElement)}。`;
    } else if (person1.mainElement === person2.mainElement) {
      analysis += '同じ要素を持ち、類似した特性や視点を共有しています。';
    }
    
    // 陰陽分析を追加
    analysis += ` ${yinYangCompatibility.analysis}`;
    
    // 副属性分析を追加
    if (secondaryCompatibilityAnalysis) {
      analysis += ` ${secondaryCompatibilityAnalysis}`;
    }
    
    // 強みと課題のリスト作成
    const strengths = this.getRelationshipStrengths(
      person1.mainElement, 
      person2.mainElement,
      person1.yinYang,
      person2.yinYang
    );
    
    const challenges = this.getRelationshipChallenges(
      person1.mainElement, 
      person2.mainElement,
      person1.yinYang,
      person2.yinYang
    );
    
    // 最終スコアを0-100のスケールに変換
    const score = Math.round((totalScore / 5) * 100);
    
    return {
      level,
      score,
      analysis,
      strengths,
      challenges
    };
  }
  
  /**
   * 二つの五行要素間の基本的な相性レベルを判定
   * 
   * @param elementA 要素A
   * @param elementB 要素B
   * @returns 相性レベル
   */
  static getElementCompatibility(
    elementA: ElementType,
    elementB: ElementType
  ): CompatibilityLevel {
    // 同じ要素: 類似性があるが刺激が少ない
    if (elementA === elementB) {
      return CompatibilityLevel.NEUTRAL;
    }
    
    // 相生関係 (AがBを生む): 非常に良い相性
    if (this.isGeneratingRelation(elementA, elementB)) {
      return CompatibilityLevel.EXCELLENT;
    }
    
    // 相生関係 (BがAを生む): 良い相性
    if (this.isGeneratingRelation(elementB, elementA)) {
      return CompatibilityLevel.GOOD;
    }
    
    // 相剋関係 (AがBを剋する): やや難しい相性
    if (this.isControllingRelation(elementA, elementB)) {
      return CompatibilityLevel.CHALLENGING;
    }
    
    // 相剋関係 (BがAを剋する): 困難な相性
    if (this.isControllingRelation(elementB, elementA)) {
      return CompatibilityLevel.DIFFICULT;
    }
    
    // その他の関係: 中立的
    return CompatibilityLevel.NEUTRAL;
  }
  
  /**
   * 陰陽の相性を判定
   * 
   * @param personAYinYang 人Aの陰陽 ('陰'または'陽')
   * @param personBYinYang 人Bの陰陽 ('陰'または'陽')
   * @returns 相性スコアと分析
   */
  static getYinYangCompatibility(
    personAYinYang: YinYangType,
    personBYinYang: YinYangType
  ): { score: number; analysis: string } {
    // 同じ陰陽: 類似性があるが、バランスに欠ける可能性
    if (personAYinYang === personBYinYang) {
      return {
        score: 3,
        analysis: `両者とも${personAYinYang}のエネルギーを持ち、よく似た行動パターンと価値観を共有しています。相互理解は容易ですが、多様性に欠ける可能性があります。`
      };
    }
    
    // 異なる陰陽: 補完的だが、調整が必要
    return {
      score: 4,
      analysis: `一方は${personAYinYang}、もう一方は${personBYinYang}のエネルギーを持ち、互いに補完し合う関係です。多様な視点がありますが、時に調整が必要です。`
    };
  }
  
  /**
   * 相生関係（AがBを生む）かどうかをチェック
   */
  private static isGeneratingRelation(
    elementA: ElementType,
    elementB: ElementType
  ): boolean {
    return ELEMENT_GENERATING_RELATIONS[elementA] === elementB;
  }
  
  /**
   * 相剋関係（AがBを剋する）かどうかをチェック
   */
  private static isControllingRelation(
    elementA: ElementType,
    elementB: ElementType
  ): boolean {
    return ELEMENT_CONTROLLING_RELATIONS[elementA] === elementB;
  }
  
  /**
   * 相生関係の説明を取得
   */
  private static getGeneratingDescription(
    elementA: ElementType,
    elementB: ElementType
  ): string {
    const key = `${elementA}→${elementB}` as keyof typeof GENERATING_DESCRIPTIONS;
    return GENERATING_DESCRIPTIONS[key] || `${elementA}は${elementB}を育みます`;
  }
  
  /**
   * 相剋関係の説明を取得
   */
  private static getControllingDescription(
    elementA: ElementType,
    elementB: ElementType
  ): string {
    const key = `${elementA}→${elementB}` as keyof typeof CONTROLLING_DESCRIPTIONS;
    return CONTROLLING_DESCRIPTIONS[key] || `${elementA}は${elementB}を抑制します`;
  }
  
  /**
   * 二人の関係における強みを取得
   */
  private static getRelationshipStrengths(
    elementA: ElementType,
    elementB: ElementType,
    yinYangA: YinYangType | boolean,
    yinYangB: YinYangType | boolean
  ): string[] {
    const strengths: string[] = [];
    
    // 相生関係の強み
    if (this.isGeneratingRelation(elementA, elementB) || 
        this.isGeneratingRelation(elementB, elementA)) {
      strengths.push('相互に成長を促進する関係');
      strengths.push('自然な協力関係が築きやすい');
      strengths.push('長期的な関係構築に有利');
    }
    
    // 同じ要素の強み
    if (elementA === elementB) {
      strengths.push('共通の価値観と目標を持ちやすい');
      strengths.push('お互いを直感的に理解できる');
      strengths.push('類似した作業スタイルで効率的に協力できる');
    }
    
    // 相剋関係の強み
    if (this.isControllingRelation(elementA, elementB) || 
        this.isControllingRelation(elementB, elementA)) {
      strengths.push('お互いに新しい視点を提供できる');
      strengths.push('課題への多角的なアプローチが可能');
      strengths.push('お互いの弱点を補完できる可能性');
    }
    
    // 陰陽の強み - yinYangがbooleanの場合とYinYangTypeの場合の両方に対応
    const isYinA = typeof yinYangA === 'boolean' ? yinYangA : yinYangA === '陰';
    const isYinB = typeof yinYangB === 'boolean' ? yinYangB : yinYangB === '陰';
    
    if (isYinA !== isYinB) {
      strengths.push('バランスの取れたエネルギーが生まれる');
      strengths.push('多様な視点からの問題解決が可能');
      strengths.push('互いの不足を補完する関係性');
    } else {
      strengths.push('類似したコミュニケーションスタイル');
      strengths.push('意思決定の方向性が一致しやすい');
    }
    
    return strengths;
  }
  
  /**
   * 二人の関係における課題を取得
   */
  private static getRelationshipChallenges(
    elementA: ElementType,
    elementB: ElementType,
    yinYangA: YinYangType | boolean,
    yinYangB: YinYangType | boolean
  ): string[] {
    const challenges: string[] = [];
    
    // 相生関係の課題
    if (this.isGeneratingRelation(elementA, elementB) || 
        this.isGeneratingRelation(elementB, elementA)) {
      challenges.push('一方が他方に依存しがちになる可能性');
      challenges.push('役割が固定化しやすい');
    }
    
    // 同じ要素の課題
    if (elementA === elementB) {
      challenges.push('同じ弱点や盲点を共有する可能性');
      challenges.push('新鮮な視点が不足する傾向');
      challenges.push('競争意識が生まれやすい');
    }
    
    // 相剋関係の課題
    if (this.isControllingRelation(elementA, elementB)) {
      challenges.push(`${elementB}の特性が${elementA}により抑制される可能性`);
      challenges.push('パワーバランスの不均衡が生じやすい');
      challenges.push('意図せず相手を批判しがちになる');
    } else if (this.isControllingRelation(elementB, elementA)) {
      challenges.push(`${elementA}の特性が${elementB}により抑制される可能性`);
      challenges.push('自信や自己表現が制限される場面がある');
      challenges.push('意見の相違が対立に発展しやすい');
    }
    
    // 陰陽の課題 - yinYangがbooleanの場合とYinYangTypeの場合の両方に対応
    const isYinA = typeof yinYangA === 'boolean' ? yinYangA : yinYangA === '陰';
    const isYinB = typeof yinYangB === 'boolean' ? yinYangB : yinYangB === '陰';
    
    if (isYinA !== isYinB) {
      challenges.push('行動ペースや意思決定スピードの違いによる摩擦');
      challenges.push('コミュニケーションスタイルの相違による誤解');
    } else {
      challenges.push('エネルギーバランスの偏り');
      challenges.push('同じ傾向の行き過ぎによる問題');
    }
    
    return challenges;
  }
  
  /**
   * チーム内の五行バランスを分析
   * 
   * @param members メンバーの五行情報配列
   * @returns チーム分析結果
   */
  static analyzeTeamDynamics(
    members: Array<{
      id: string;
      name: string;
      mainElement: ElementType;
      secondaryElement?: ElementType;
      yinYang: YinYangType;
    }>
  ): {
    elementDistribution: Record<ElementType, number>;
    yinYangRatio: { yin: number; yang: number };
    missingElements: ElementType[];
    dominantElement: ElementType;
    balance: 'excellent' | 'good' | 'incomplete' | 'imbalanced';
    recommendations: string[];
    bestPairs: Array<{
      member1Id: string;
      member2Id: string;
      compatibility: CompatibilityLevel;
      score: number;
    }>;
  } {
    // 五行の分布を計算
    const elementDistribution: Record<ElementType, number> = {
      '木': 0, '火': 0, '土': 0, '金': 0, '水': 0
    };
    
    // 陰陽の比率
    let yinCount = 0;
    let yangCount = 0;
    
    // 各メンバーの五行をカウント
    members.forEach(member => {
      elementDistribution[member.mainElement]++;
      if (member.secondaryElement) {
        elementDistribution[member.secondaryElement] += 0.5; // 副属性は重みを半分に
      }
      
      member.yinYang === '陰' ? yinCount++ : yangCount++;
    });
    
    // 欠けている要素を特定
    const missingElements = Object.entries(elementDistribution)
      .filter(([, count]) => count === 0)
      .map(([element]) => element as ElementType);
    
    // 最も多い要素を特定
    let dominantElement: ElementType = '木';
    let maxCount = 0;
    
    Object.entries(elementDistribution).forEach(([element, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominantElement = element as ElementType;
      }
    });
    
    // チームのバランスを評価
    let balance: 'excellent' | 'good' | 'incomplete' | 'imbalanced';
    
    if (missingElements.length === 0 && Math.abs(yinCount - yangCount) <= 1) {
      balance = 'excellent'; // すべての要素があり、陰陽のバランスが良い
    } else if (missingElements.length <= 1) {
      balance = 'good'; // 最大1つの要素が欠けている
    } else if (missingElements.length <= 2) {
      balance = 'incomplete'; // 2つの要素が欠けている
    } else {
      balance = 'imbalanced'; // 3つ以上の要素が欠けている
    }
    
    // 推奨事項
    const recommendations: string[] = [];
    
    if (missingElements.length > 0) {
      recommendations.push(
        `チームには${missingElements.join('、')}の属性が不足しています。` +
        `これらの属性を持つメンバーを追加するか、既存メンバーがこれらの特性を意識的に発揮することで、バランスを改善できます。`
      );
    }
    
    if (maxCount > members.length * 0.5) {
      recommendations.push(
        `${dominantElement}の属性が特に強いチームです。多様な視点を確保するために、意思決定の際は少数派の意見も積極的に取り入れましょう。`
      );
    }
    
    if (Math.abs(yinCount - yangCount) > members.length * 0.3) {
      const dominant = yinCount > yangCount ? '陰' : '陽';
      recommendations.push(
        `チームは${dominant}のエネルギーが優勢です。バランスを取るために、意思決定やプロジェクト計画において反対の特性も意識的に取り入れましょう。`
      );
    }
    
    // 最も相性の良いペアを特定
    const bestPairs: Array<{
      member1Id: string;
      member2Id: string;
      compatibility: CompatibilityLevel;
      score: number;
    }> = [];
    
    // 各メンバーペアの相性を計算
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        const compatibility = this.calculatePersonalCompatibility(
          members[i],
          members[j]
        );
        
        if (compatibility.level === CompatibilityLevel.EXCELLENT || 
            compatibility.level === CompatibilityLevel.GOOD) {
          bestPairs.push({
            member1Id: members[i].id,
            member2Id: members[j].id,
            compatibility: compatibility.level,
            score: compatibility.score
          });
        }
      }
    }
    
    // 相性スコアでソート
    bestPairs.sort((a, b) => b.score - a.score);
    
    // 上位5ペアに制限
    const topPairs = bestPairs.slice(0, 5);
    
    return {
      elementDistribution,
      yinYangRatio: { yin: yinCount, yang: yangCount },
      missingElements,
      dominantElement,
      balance,
      recommendations,
      bestPairs: topPairs
    };
  }
}