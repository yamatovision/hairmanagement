/**
 * 陰陽五行に基づく運勢予測とアドバイス生成
 * 
 * 変更履歴:
 * - 2025/03/26: 初期実装 (AppGenius)
 */

import { 
  ElementType, 
  YinYangType, 
  FortuneCategory,
  ELEMENT_PROPERTIES,
  YIN_YANG_PROPERTIES
} from '@shared';

import { ElementalCalculator } from './calculator';

export class ElementalForecast {
  /**
   * 日別運勢データを生成する
   * 
   * @param birthDate 生年月日 (YYYY-MM-DD形式)
   * @param targetDate 予測対象日 (YYYY-MM-DD形式)
   * @returns 運勢データ
   */
  static generateDailyFortune(
    birthDate: string,
    targetDate: string
  ): {
    dailyElement: ElementType;
    yinYang: YinYangType;
    overallLuck: number;
    careerLuck: number;
    relationshipLuck: number;
    creativityLuck: number;
    healthLuck: number;
    wealthLuck: number;
    description: string;
    advice: string;
    luckyColors: string[];
    luckyDirections: string[];
    compatibleElements: ElementType[];
    incompatibleElements: ElementType[];
  } {
    // 個人の五行属性を計算
    const personalElement = ElementalCalculator.calculatePersonalElement(birthDate);
    
    // 対象日の五行と陰陽を計算
    const dayElement = ElementalCalculator.calculateDayElement(targetDate);
    
    // 基本運勢スコアを計算
    const overallLuck = ElementalCalculator.calculateLuckScore(
      personalElement.mainElement,
      dayElement.element,
      personalElement.yin,
      dayElement.yinYang
    );
    
    // 各カテゴリの運勢スコアを計算 (基本スコアを元に変動)
    const careerLuck = this.calculateCategoryLuck(
      overallLuck, 
      personalElement.mainElement, 
      dayElement.element,
      FortuneCategory.CAREER
    );
    
    const relationshipLuck = this.calculateCategoryLuck(
      overallLuck, 
      personalElement.mainElement, 
      dayElement.element,
      FortuneCategory.RELATIONSHIP
    );
    
    const creativityLuck = this.calculateCategoryLuck(
      overallLuck, 
      personalElement.mainElement, 
      dayElement.element,
      FortuneCategory.CREATIVITY
    );
    
    const healthLuck = this.calculateCategoryLuck(
      overallLuck, 
      personalElement.mainElement, 
      dayElement.element,
      FortuneCategory.HEALTH
    );
    
    const wealthLuck = this.calculateCategoryLuck(
      overallLuck, 
      personalElement.mainElement, 
      dayElement.element,
      FortuneCategory.WEALTH
    );
    
    // 運勢の説明文を生成
    const description = this.generateFortuneDescription(
      personalElement.mainElement,
      dayElement.element,
      dayElement.yinYang,
      overallLuck
    );
    
    // アドバイスを生成
    const advice = this.generateAdvice(
      personalElement.mainElement,
      dayElement.element,
      dayElement.yinYang,
      overallLuck,
      this.getHighestLuckCategory({
        career: careerLuck,
        relationship: relationshipLuck,
        creativity: creativityLuck,
        health: healthLuck,
        wealth: wealthLuck
      })
    );
    
    // ラッキーカラーを取得 (その日の五行に基づく)
    const luckyColors = this.getLuckyColors(dayElement.element);
    
    // ラッキー方角を取得
    const luckyDirections = this.getLuckyDirections(
      personalElement.mainElement,
      dayElement.element
    );
    
    // 相性の良い五行と悪い五行を取得
    const { compatibleElements, incompatibleElements } = 
      this.getCompatibleAndIncompatibleElements(dayElement.element);
    
    return {
      dailyElement: dayElement.element,
      yinYang: dayElement.yinYang,
      overallLuck,
      careerLuck,
      relationshipLuck,
      creativityLuck,
      healthLuck,
      wealthLuck,
      description,
      advice,
      luckyColors,
      luckyDirections,
      compatibleElements,
      incompatibleElements
    };
  }
  
  /**
   * カテゴリー別の運勢スコアを計算
   * 
   * @param baseScore 基本運勢スコア
   * @param personalElement 個人の五行属性
   * @param dayElement 日の五行属性
   * @param category 運勢カテゴリ
   * @returns カテゴリ別運勢スコア (1-100)
   */
  private static calculateCategoryLuck(
    baseScore: number,
    personalElement: ElementType,
    dayElement: ElementType,
    category: FortuneCategory
  ): number {
    let score = baseScore;
    
    // カテゴリに対する五行の相性による加減点
    switch (category) {
      case FortuneCategory.CAREER:
        // キャリア運は「木」(成長)と「金」(確実性)に強く影響される
        if (dayElement === '木' || personalElement === '木') score += 10;
        if (dayElement === '金' || personalElement === '金') score += 5;
        if (dayElement === '土' && personalElement === '土') score -= 5; // 土同士は停滞的
        break;
        
      case FortuneCategory.RELATIONSHIP:
        // 人間関係運は「火」(情熱)と「水」(柔軟性)に強く影響される
        if (dayElement === '火' || personalElement === '火') score += 10;
        if (dayElement === '水' || personalElement === '水') score += 5;
        if (dayElement === '金' && personalElement === '金') score -= 5; // 金同士は冷静すぎる
        break;
        
      case FortuneCategory.CREATIVITY:
        // 創造力運は「木」(創造性)と「火」(表現力)に強く影響される
        if (dayElement === '木' || personalElement === '木') score += 10;
        if (dayElement === '火' || personalElement === '火') score += 8;
        if (dayElement === '金' && personalElement === '土') score -= 5; // 金と土は保守的になりがち
        break;
        
      case FortuneCategory.HEALTH:
        // 健康運は「土」(安定)と「水」(適応力)に強く影響される
        if (dayElement === '土' || personalElement === '土') score += 10;
        if (dayElement === '水' || personalElement === '水') score += 5;
        if (dayElement === '火' && personalElement === '火') score -= 5; // 火同士はエネルギー消費が激しい
        break;
        
      case FortuneCategory.WEALTH:
        // 金運は「金」(収穫)と「土」(安定)に強く影響される
        if (dayElement === '金' || personalElement === '金') score += 10;
        if (dayElement === '土' || personalElement === '土') score += 5;
        if (dayElement === '木' && personalElement === '木') score -= 5; // 木同士は散財の傾向
        break;
    }
    
    // 五行の相生相剋関係による微調整
    if (ElementalCalculator.isGenerating(personalElement, dayElement)) {
      score += 3; // 個人が日を生む: やや良い影響
    } else if (ElementalCalculator.isGenerating(dayElement, personalElement)) {
      score += 5; // 日が個人を生む: 良い影響
    } else if (ElementalCalculator.isControlling(personalElement, dayElement)) {
      score -= 3; // 個人が日を剋する: やや悪い影響
    } else if (ElementalCalculator.isControlling(dayElement, personalElement)) {
      score -= 5; // 日が個人を剋する: 悪い影響
    }
    
    // ランダム変動要素の追加 (±8ポイント)
    score += Math.floor(Math.random() * 17) - 8;
    
    // スコアを1-100の範囲に制限
    return Math.max(1, Math.min(100, score));
  }
  
  /**
   * 運勢の説明文を生成
   * 
   * @param personalElement 個人の五行
   * @param dayElement 日の五行
   * @param dayYinYang 日の陰陽
   * @param overallLuck 総合運勢スコア
   * @returns 運勢説明文
   */
  private static generateFortuneDescription(
    personalElement: ElementType,
    dayElement: ElementType,
    dayYinYang: YinYangType,
    overallLuck: number
  ): string {
    // 運勢レベルの分類
    let fortuneLevel: '絶好調' | '好調' | '普通' | 'やや調子が悪い' | '厳しい';
    if (overallLuck >= 85) fortuneLevel = '絶好調';
    else if (overallLuck >= 70) fortuneLevel = '好調';
    else if (overallLuck >= 45) fortuneLevel = '普通';
    else if (overallLuck >= 30) fortuneLevel = 'やや調子が悪い';
    else fortuneLevel = '厳しい';
    
    // 五行特性に関する説明
    const dayElementProps = ELEMENT_PROPERTIES[dayElement];
    const personalElementProps = ELEMENT_PROPERTIES[personalElement];
    const yinYangProps = YIN_YANG_PROPERTIES[dayYinYang];
    
    let description = `今日は${dayElement}の気が強まる${dayYinYang}の日です。`;
    
    // 日の五行特性を追加
    description += `${dayElementProps.keywords.slice(0, 3).join('、')}といった性質が高まっています。`;
    
    // 運勢レベルに応じた説明
    if (fortuneLevel === '絶好調' || fortuneLevel === '好調') {
      description += `あなたの${personalElement}の性質と今日の${dayElement}の気は非常に調和しており、${fortuneLevel}です。`;
      
      if (ElementalCalculator.isGenerating(personalElement, dayElement)) {
        description += `あなたの${personalElement}のエネルギーが今日の${dayElement}を活性化させ、特に良い影響をもたらすでしょう。`;
      } else if (ElementalCalculator.isGenerating(dayElement, personalElement)) {
        description += `今日の${dayElement}のエネルギーがあなたの${personalElement}を育み、力強くサポートしてくれるでしょう。`;
      } else if (personalElement === dayElement) {
        description += `同じ${dayElement}同士の共鳴により、あなたの強みがさらに発揮されるでしょう。`;
      }
    } else if (fortuneLevel === '普通') {
      description += `あなたの${personalElement}の性質と今日の${dayElement}の気は大きな干渉はなく、安定した一日となりそうです。`;
      description += `${dayYinYang}のエネルギーを活かし、${yinYangProps.traits.slice(0, 2).join('、')}な側面を意識すると良いでしょう。`;
    } else {
      description += `あなたの${personalElement}の性質は今日の${dayElement}の気と若干の摩擦があり、${fortuneLevel}かもしれません。`;
      
      if (ElementalCalculator.isControlling(dayElement, personalElement)) {
        description += `特に、今日の${dayElement}のエネルギーがあなたの${personalElement}に対して抑制的に働く可能性があります。意識して調和を心がけましょう。`;
      } else if (ElementalCalculator.isControlling(personalElement, dayElement)) {
        description += `あなたの${personalElement}のエネルギーが今日の${dayElement}の気を過度に抑制しないよう、バランスを意識しましょう。`;
      }
    }
    
    // 陰陽に関するコメントを追加
    description += `${dayYinYang}の日は${yinYangProps.nature.slice(0, 2).join('・')}の性質が強まります。`;
    
    return description;
  }
  
  /**
   * アドバイスを生成
   * 
   * @param personalElement 個人の五行
   * @param dayElement 日の五行
   * @param dayYinYang 日の陰陽
   * @param overallLuck 総合運勢スコア
   * @param highestCategory 最も運勢の良いカテゴリ
   * @returns アドバイス文
   */
  private static generateAdvice(
    personalElement: ElementType,
    dayElement: ElementType,
    dayYinYang: YinYangType,
    overallLuck: number,
    highestCategory: FortuneCategory
  ): string {
    // 五行特性を取得
    const dayElementProps = ELEMENT_PROPERTIES[dayElement];
    
    // 基本的なアドバイス
    let advice = '';
    
    // 運勢レベルに応じたアドバイス
    if (overallLuck >= 70) {
      advice += `今日は特に${dayElementProps.strengths.slice(0, 2).join('と')}を活かせる日です。`;
    } else if (overallLuck >= 45) {
      advice += `今日は${dayElementProps.strengths[0]}を意識しながら、${dayElementProps.weaknesses[0]}に注意すると良いでしょう。`;
    } else {
      advice += `今日は${dayElementProps.weaknesses.slice(0, 2).join('や')}の傾向に注意し、意識的に${dayElementProps.strengths[0]}を心がけましょう。`;
    }
    
    // 調和を促進するアドバイス
    if (ElementalCalculator.isControlling(dayElement, personalElement) || 
        ElementalCalculator.isControlling(personalElement, dayElement)) {
      advice += `あなたの${personalElement}と今日の${dayElement}のエネルギーに若干の緊張関係がありますので、バランスを意識しましょう。`;
    }
    
    // 最も運勢の良いカテゴリに関するアドバイス
    switch (highestCategory) {
      case FortuneCategory.CAREER:
        advice += `今日はキャリアに関する取り組みに特に良い日です。`;
        if (dayElement === '木') {
          advice += `新しいスキルの習得や成長につながる挑戦に適しています。特に美容技術の研究や新しいスタイリング技法を学ぶのに良い時期です。`;
        } else if (dayElement === '火') {
          advice += `自己表現やリーダーシップを発揮する場面で力を発揮できるでしょう。お客様へのスタイル提案や新しい企画の提案に適しています。`;
        } else if (dayElement === '土') {
          advice += `安定と基礎固めに適した日です。基本テクニックの見直しや業務の効率化を検討するのに良いでしょう。`;
        } else if (dayElement === '金') {
          advice += `計画の実行や細部への注意が活かせる日です。精密なカットテクニックの向上や厳密な時間管理に適しています。`;
        } else if (dayElement === '水') {
          advice += `柔軟な思考と適応力を活かせる日です。様々なお客様のニーズに対応する臨機応変さを意識すると良いでしょう。`;
        }
        break;
        
      case FortuneCategory.RELATIONSHIP:
        advice += `今日は人間関係において良い展開があるでしょう。`;
        if (dayElement === '木') {
          advice += `新しい関係の構築や既存の関係の成長に適しています。チーム内での協力関係を育てる良い機会です。`;
        } else if (dayElement === '火') {
          advice += `積極的なコミュニケーションが実を結ぶ日です。サロン内での交流を深めたり、お客様との信頼関係を強化しましょう。`;
        } else if (dayElement === '土') {
          advice += `安定した信頼関係を築くのに適した日です。同僚やメンターとの関係を深める機会を作りましょう。`;
        } else if (dayElement === '金') {
          advice += `公平さと誠実さが重要な日です。チーム内での役割分担や責任の明確化に適しています。`;
        } else if (dayElement === '水') {
          advice += `共感と理解が深まる日です。他者の視点に立ち、柔軟に対応することで関係が改善するでしょう。`;
        }
        break;
        
      case FortuneCategory.CREATIVITY:
        advice += `今日は創造力が特に高まる日です。`;
        if (dayElement === '木') {
          advice += `新しいアイデアやスタイルの創造に最適です。オリジナルのヘアスタイルやカラーリングの開発に挑戦してみましょう。`;
        } else if (dayElement === '火') {
          advice += `情熱的な表現力が高まります。大胆なデザインやカラーリングに挑戦する良い機会です。`;
        } else if (dayElement === '土') {
          advice += `実用的なデザインや改良に適しています。既存のテクニックを見直し、改善するのに良い日です。`;
        } else if (dayElement === '金') {
          advice += `精密さと美的センスが活きる日です。細部にこだわったスタイリングや技術的な完成度を高めましょう。`;
        } else if (dayElement === '水') {
          advice += `直感と想像力が豊かになります。お客様の個性を引き出す独創的なスタイルを考案するのに最適です。`;
        }
        break;
        
      case FortuneCategory.HEALTH:
        advice += `今日は健康に特に良い影響がある日です。`;
        if (dayElement === '木') {
          advice += `柔軟性を高めるストレッチや新鮮な食事が効果的です。立ち仕事の合間に短時間の運動を取り入れましょう。`;
        } else if (dayElement === '火') {
          advice += `エネルギーを高める有酸素運動が効果的です。適度な活動と休息のバランスを意識してください。`;
        } else if (dayElement === '土') {
          advice += `栄養バランスと消化に注目する日です。規則正しい食事と休息で体の基礎を整えましょう。`;
        } else if (dayElement === '金') {
          advice += `呼吸法や姿勢の改善に適しています。立ち姿勢の見直しや正しい呼吸を意識すると効果的です。`;
        } else if (dayElement === '水') {
          advice += `水分補給と柔軟性を意識する日です。十分な水分をとり、リラクゼーションを心がけましょう。`;
        }
        break;
        
      case FortuneCategory.WEALTH:
        advice += `今日は経済面で良い展開が期待できます。`;
        if (dayElement === '木') {
          advice += `新しい収入源や成長につながる投資に適しています。スキルアップや教育への投資を検討しましょう。`;
        } else if (dayElement === '火') {
          advice += `積極的な収益活動に適した日です。新しいサービスの提案や追加メニューの開発が有効です。`;
        } else if (dayElement === '土') {
          advice += `安定した経済基盤を作るのに適しています。予算計画や節約戦略を見直す良い機会です。`;
        } else if (dayElement === '金') {
          advice += `財務管理と効率化に最適な日です。無駄を省き、リソースを最大限に活用する方法を考えましょう。`;
        } else if (dayElement === '水') {
          advice += `柔軟な財務戦略が効果的です。様々な収益オプションの検討や財務知識の向上に適しています。`;
        }
        break;
    }
    
    // 美容師に特化したアドバイス
    advice += ` 美容師としては、`;
    
    if (dayElement === '木') {
      advice += `今日は創造力と成長のエネルギーが高まります。新しいスタイリング技術を試す、またはお客様に新しい提案をするのに適しています。`;
    } else if (dayElement === '火') {
      advice += `今日は情熱と表現力が高まります。個性的なカラーリングや印象的なスタイリングに取り組むと良い結果が得られるでしょう。`;
    } else if (dayElement === '土') {
      advice += `今日は安定性と信頼性が高まります。基本に忠実な施術やお客様との信頼関係構築に力を入れると良いでしょう。`;
    } else if (dayElement === '金') {
      advice += `今日は精密さと完璧主義が高まります。正確なカットや細部へのこだわりが特に評価される日です。`;
    } else if (dayElement === '水') {
      advice += `今日は柔軟性と直感力が高まります。お客様の要望を深く理解し、臨機応変に対応することで満足度を高められるでしょう。`;
    }
    
    return advice;
  }
  
  /**
   * 最も運勢の良いカテゴリを取得
   * 
   * @param luckScores 各カテゴリの運勢スコア
   * @returns 最も運勢の良いカテゴリ
   */
  private static getHighestLuckCategory(
    luckScores: {
      career: number;
      relationship: number;
      creativity: number;
      health: number;
      wealth: number;
    }
  ): FortuneCategory {
    let highestCategory = FortuneCategory.CAREER;
    let highestScore = luckScores.career;
    
    if (luckScores.relationship > highestScore) {
      highestCategory = FortuneCategory.RELATIONSHIP;
      highestScore = luckScores.relationship;
    }
    
    if (luckScores.creativity > highestScore) {
      highestCategory = FortuneCategory.CREATIVITY;
      highestScore = luckScores.creativity;
    }
    
    if (luckScores.health > highestScore) {
      highestCategory = FortuneCategory.HEALTH;
      highestScore = luckScores.health;
    }
    
    if (luckScores.wealth > highestScore) {
      highestCategory = FortuneCategory.WEALTH;
      highestScore = luckScores.wealth;
    }
    
    return highestCategory;
  }
  
  /**
   * ラッキーカラーを取得
   * 
   * @param element 五行要素
   * @returns ラッキーカラーの配列
   */
  private static getLuckyColors(element: ElementType): string[] {
    // 各五行に対応するラッキーカラー
    const elementColors: Record<ElementType, string[]> = {
      '木': ['緑', 'ライム', 'オリーブ', 'ターコイズ', '青緑'],
      '火': ['赤', 'オレンジ', 'ピンク', 'マゼンタ', '紫'],
      '土': ['黄色', 'ベージュ', '茶色', 'テラコッタ', 'ゴールド'],
      '金': ['白', 'シルバー', 'グレー', 'アイボリー', 'メタリック'],
      '水': ['青', '紺', '水色', '藍色', 'ネイビー']
    };
    
    // ランダムに3色選択
    const colors = [...elementColors[element]];
    return this.getRandomElements(colors, 3);
  }
  
  /**
   * ラッキー方角を取得
   * 
   * @param personalElement 個人の五行
   * @param dayElement 日の五行
   * @returns ラッキー方角の配列
   */
  private static getLuckyDirections(
    personalElement: ElementType,
    dayElement: ElementType
  ): string[] {
    // 各五行に対応する方角
    const elementDirections: Record<ElementType, string[]> = {
      '木': ['東', '東南'],
      '火': ['南', '南西'],
      '土': ['中央', '南西', '北東'],
      '金': ['西', '北西'],
      '水': ['北', '北東']
    };
    
    // 個人の属性と日の属性の方角を合わせる
    let directions: string[] = [];
    
    // 1. 日の五行に対応する方角を優先
    directions = [...elementDirections[dayElement]];
    
    // 2. 相生関係があれば、その五行の方角も追加
    if (ElementalCalculator.isGenerating(personalElement, dayElement) || 
        ElementalCalculator.isGenerating(dayElement, personalElement)) {
      const generatingElement = ElementalCalculator.isGenerating(personalElement, dayElement) 
        ? dayElement 
        : personalElement;
      
      elementDirections[generatingElement].forEach(dir => {
        if (!directions.includes(dir)) {
          directions.push(dir);
        }
      });
    }
    
    // 最大2つの方角を選択
    return this.getRandomElements(directions, 2);
  }
  
  /**
   * 相性の良い五行と悪い五行を取得
   * 
   * @param element 基準となる五行
   * @returns 相性の良い五行と悪い五行
   */
  private static getCompatibleAndIncompatibleElements(
    element: ElementType
  ): {
    compatibleElements: ElementType[];
    incompatibleElements: ElementType[];
  } {
    const compatibleElements: ElementType[] = [];
    const incompatibleElements: ElementType[] = [];
    
    // 全ての五行要素
    const allElements: ElementType[] = ['木', '火', '土', '金', '水'];
    
    // 相生関係の五行を追加
    allElements.forEach(e => {
      if (ElementalCalculator.isGenerating(element, e)) {
        compatibleElements.push(e); // 生む関係
      }
      if (ElementalCalculator.isGenerating(e, element)) {
        compatibleElements.push(e); // 生まれる関係
      }
    });
    
    // 相剋関係の五行を追加
    allElements.forEach(e => {
      if (ElementalCalculator.isControlling(element, e)) {
        incompatibleElements.push(e); // 剋する関係
      }
      if (ElementalCalculator.isControlling(e, element)) {
        incompatibleElements.push(e); // 剋される関係
      }
    });
    
    return { compatibleElements, incompatibleElements };
  }
  
  /**
   * 配列からランダムに要素を取得
   * 
   * @param array 元の配列
   * @param count 取得する要素数
   * @returns ランダムに選択された要素の配列
   */
  private static getRandomElements<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
  
  /**
   * 週間運勢予報を生成
   * 
   * @param birthDate 生年月日 (YYYY-MM-DD形式)
   * @param startDate 予測開始日 (YYYY-MM-DD形式)
   * @param days 日数 (デフォルト7日間)
   * @returns 日別運勢の配列
   */
  static generateWeeklyForecast(
    birthDate: string,
    startDate: string,
    days: number = 7
  ): Array<{
    date: string;
    dailyElement: ElementType;
    yinYang: YinYangType;
    overallLuck: number;
  }> {
    const forecast: Array<{
      date: string;
      dailyElement: ElementType;
      yinYang: YinYangType;
      overallLuck: number;
    }> = [];
    
    // 開始日のDateオブジェクト
    const start = new Date(startDate);
    
    // 指定日数分の運勢を生成
    for (let i = 0; i < days; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      
      // YYYY-MM-DD形式に変換
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // その日の簡易的な運勢を計算
      const fortune = this.generateDailyFortune(birthDate, dateStr);
      
      forecast.push({
        date: dateStr,
        dailyElement: fortune.dailyElement,
        yinYang: fortune.yinYang,
        overallLuck: fortune.overallLuck
      });
    }
    
    return forecast;
  }
}