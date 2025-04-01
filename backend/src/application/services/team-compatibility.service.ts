/**
 * チーム相性計算サービス
 * 
 * チームメンバー間の相性分析と五行バランス分析を行うサービス
 * 
 * 変更履歴:
 * - 2025/04/02: 初期実装 (Claude)
 */

import { injectable, inject } from 'tsyringe';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { ITeamRepository } from '../../domain/repositories/ITeamRepository';

// 五行要素の種類
type ElementType = '木' | '火' | '土' | '金' | '水';
type YinYangType = '陰' | '陽';

// 相性タイプの定義
enum CompatibilityType {
  GENERATING = '相生', // 相生関係（x生y）
  CONTROLLING = '相剋', // 相剋関係（x克y）
  NEUTRAL = '中立',    // 中立関係
}

// プロフィール簡易型
interface UserElementalProfile {
  userId: string;
  mainElement: ElementType;
  yinYang: YinYangType;
  dayPillarStem?: string;
}

// 相性結果型
interface CompatibilityResult {
  userId1: string;
  userId2: string;
  compatibilityScore: number;
  relationshipType: CompatibilityType;
  complementaryAreas: string[];
}

// チーム五行分析結果型
interface TeamElementalAnalysis {
  teamId: string;
  elementDistribution: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
  yinYangBalance: {
    yin: number;
    yang: number;
  };
  complementaryRelations: CompatibilityResult[];
  teamStrengths: string[];
  teamWeaknesses: string[];
  optimizationSuggestions: Array<{
    type: 'recruitment' | 'reassignment' | 'development';
    description: string;
    priority: 'low' | 'medium' | 'high';
  }>;
}

/**
 * チーム相性計算サービス
 */
@injectable()
export class TeamCompatibilityService {
  constructor(
    @inject('IUserRepository') private userRepository: IUserRepository,
    @inject('ITeamRepository') private teamRepository: ITeamRepository
  ) {}

  /**
   * チームメンバー間の相性を計算
   * @param userProfile1 ユーザー1のプロフィール
   * @param userProfile2 ユーザー2のプロフィール
   * @returns 相性結果
   */
  calculateCompatibility(
    userProfile1: UserElementalProfile,
    userProfile2: UserElementalProfile
  ): CompatibilityResult {
    // 五行相性計算
    const element1 = userProfile1.mainElement;
    const element2 = userProfile2.mainElement;

    // 相生関係（相互に生じる関係）の判定
    const isGenerating = this.isElementGenerating(element1, element2);
    const isGenerated = this.isElementGenerating(element2, element1);

    // 相剋関係（相互に克する関係）の判定
    const isControlling = this.isElementControlling(element1, element2);
    const isControlled = this.isElementControlling(element2, element1);

    // 陰陽の相性判定
    const yinYangCompatibility = this.calculateYinYangCompatibility(
      userProfile1.yinYang,
      userProfile2.yinYang
    );

    // 十神関係の分析（日干同士から生じる関係）
    const tenGodBonus = this.analyzeTenGodRelations(
      userProfile1.dayPillarStem,
      userProfile2.dayPillarStem
    );

    // 関係性タイプの判定
    let relationshipType: CompatibilityType;
    if (isGenerating || isGenerated) {
      relationshipType = CompatibilityType.GENERATING;
    } else if (isControlling || isControlled) {
      relationshipType = CompatibilityType.CONTROLLING;
    } else {
      relationshipType = CompatibilityType.NEUTRAL;
    }

    // 相生は良い相性、相剋は対立関係の可能性
    let baseScore = relationshipType === CompatibilityType.GENERATING ? 70 : 
                    relationshipType === CompatibilityType.CONTROLLING ? 40 : 55;

    // 陰陽の相性を加味
    baseScore += yinYangCompatibility;

    // 十神関係ボーナスを加算
    baseScore += tenGodBonus;

    // 最終スコアの制限（0-100の範囲内に）
    const compatibilityScore = Math.max(0, Math.min(100, baseScore));

    // 補完領域の判定
    const complementaryAreas = this.getComplementaryAreas(
      element1,
      element2,
      relationshipType,
      userProfile1.yinYang,
      userProfile2.yinYang
    );

    return {
      userId1: userProfile1.userId,
      userId2: userProfile2.userId,
      compatibilityScore,
      relationshipType,
      complementaryAreas,
    };
  }

  /**
   * チーム全体の五行バランスを分析
   * @param teamId チームID
   * @returns チーム五行分析結果
   */
  async analyzeTeamElementalBalance(teamId: string): Promise<TeamElementalAnalysis> {
    // チーム情報の取得
    const team = await this.teamRepository.findById(teamId);
    if (!team) {
      throw new Error(`Team with ID ${teamId} not found`);
    }

    // チームメンバーのプロフィール取得
    const memberProfiles: UserElementalProfile[] = [];
    
    // チームメンバーのIDリスト
    const memberIds = team.members.map(member => member.userId);
    
    // 各メンバーのプロフィール取得
    for (const memberId of memberIds) {
      const user = await this.userRepository.findById(memberId);
      if (user && user.elementalProfile) {
        memberProfiles.push({
          userId: user.id,
          mainElement: user.elementalProfile.mainElement as ElementType,
          yinYang: user.elementalProfile.yinYang as YinYangType,
          dayPillarStem: user.sajuProfile?.fourPillars?.dayPillar?.stem
        });
      }
    }

    // 五行分布の計算
    const elementDistribution = this.calculateElementDistribution(memberProfiles);
    
    // 陰陽バランスの計算
    const yinYangBalance = this.calculateYinYangBalance(memberProfiles);
    
    // メンバー間の相性計算
    const complementaryRelations = this.calculateTeamCompatibilities(memberProfiles);
    
    // チームの強みと弱みの分析
    const { strengths, weaknesses } = this.analyzeTeamStrengthsAndWeaknesses(
      elementDistribution,
      yinYangBalance
    );
    
    // チーム最適化提案の生成
    const optimizationSuggestions = this.generateOptimizationSuggestions(
      elementDistribution,
      memberProfiles
    );

    return {
      teamId,
      elementDistribution: {
        wood: elementDistribution.木 || 0,
        fire: elementDistribution.火 || 0,
        earth: elementDistribution.土 || 0,
        metal: elementDistribution.金 || 0,
        water: elementDistribution.水 || 0,
      },
      yinYangBalance: {
        yin: yinYangBalance.陰 || 0,
        yang: yinYangBalance.陽 || 0,
      },
      complementaryRelations,
      teamStrengths: strengths,
      teamWeaknesses: weaknesses,
      optimizationSuggestions,
    };
  }

  /**
   * 相生関係判定（element1がelement2を生むか）
   */
  private isElementGenerating(element1: ElementType, element2: ElementType): boolean {
    const generatesMap: Record<ElementType, ElementType> = {
      '木': '火',
      '火': '土',
      '土': '金',
      '金': '水',
      '水': '木'
    };

    return generatesMap[element1] === element2;
  }

  /**
   * 相剋関係判定（element1がelement2を克するか）
   */
  private isElementControlling(element1: ElementType, element2: ElementType): boolean {
    const controlsMap: Record<ElementType, ElementType> = {
      '木': '土',
      '土': '水',
      '水': '火',
      '火': '金',
      '金': '木'
    };

    return controlsMap[element1] === element2;
  }

  /**
   * 陰陽の相性計算
   */
  private calculateYinYangCompatibility(yinYang1: YinYangType, yinYang2: YinYangType): number {
    // 同じ陰陽は安定するが、変化が少ない
    if (yinYang1 === yinYang2) {
      return 5; // 小さなプラス効果
    }
    
    // 異なる陰陽は相互補完的
    return 10; // より大きなプラス効果
  }

  /**
   * 十神関係の分析（日干から見た相性）
   */
  private analyzeTenGodRelations(stem1?: string, stem2?: string): number {
    // 日干情報がない場合は分析できない
    if (!stem1 || !stem2) {
      return 0;
    }

    // 同じ天干は比肩・劫財関係（協力関係）
    if (stem1 === stem2) {
      return 15;
    }

    // 相生関係にある天干は食神・傷官・印星などの関係
    // 実際には複雑な計算が必要だが、簡易版として相生・相剋を使用
    
    // 天干の五行マッピング
    const stemToElement: Record<string, ElementType> = {
      '甲': '木', '乙': '木',
      '丙': '火', '丁': '火',
      '戊': '土', '己': '土',
      '庚': '金', '辛': '金',
      '壬': '水', '癸': '水'
    };
    
    const element1 = stemToElement[stem1];
    const element2 = stemToElement[stem2];
    
    if (element1 && element2) {
      // 相生関係
      if (this.isElementGenerating(element1, element2) || this.isElementGenerating(element2, element1)) {
        return 10;
      }
      
      // 相剋関係
      if (this.isElementControlling(element1, element2) || this.isElementControlling(element2, element1)) {
        return -5;
      }
    }
    
    return 0;
  }

  /**
   * 補完領域の取得
   */
  private getComplementaryAreas(
    element1: ElementType,
    element2: ElementType,
    relationshipType: CompatibilityType,
    yinYang1: YinYangType,
    yinYang2: YinYangType
  ): string[] {
    const areas: string[] = [];
    
    // 五行特性に基づく領域
    const elementalCharacteristics: Record<ElementType, string[]> = {
      '木': ['創造性', '成長能力', '柔軟性'],
      '火': ['情熱', 'コミュニケーション力', 'リーダーシップ'],
      '土': ['安定性', '信頼性', '実用性'],
      '金': ['精度', '分析力', '決断力'],
      '水': ['知恵', '適応力', '洞察力']
    };
    
    // 陰陽特性に基づく領域
    const yinYangCharacteristics: Record<YinYangType, string[]> = {
      '陰': ['内省力', '計画性', '持続力'],
      '陽': ['行動力', '率先力', '影響力']
    };
    
    // 関係性に基づく特性の選択
    if (relationshipType === CompatibilityType.GENERATING) {
      // 相生関係では互いの得意分野を活かせる
      areas.push(elementalCharacteristics[element1][0]);
      areas.push(elementalCharacteristics[element2][0]);
    } else if (relationshipType === CompatibilityType.CONTROLLING) {
      // 相剋関係では互いに抑制し合うが、バランスをもたらす可能性も
      areas.push('相互補完');
      areas.push(element1 === '木' ? '具体化能力' :
                element1 === '火' ? '実行力' :
                element1 === '土' ? '柔軟思考' :
                element1 === '金' ? '発想力' : '体系化能力');
    } else {
      // 中立関係では陰陽バランスが重要に
      areas.push(yinYangCharacteristics[yinYang1][0]);
      areas.push(yinYangCharacteristics[yinYang2][0]);
    }
    
    return [...new Set(areas)]; // 重複を排除
  }

  /**
   * チーム内の五行分布を計算
   */
  private calculateElementDistribution(
    profiles: UserElementalProfile[]
  ): Record<ElementType, number> {
    const distribution: Record<ElementType, number> = {
      '木': 0,
      '火': 0,
      '土': 0,
      '金': 0,
      '水': 0
    };

    profiles.forEach(profile => {
      distribution[profile.mainElement]++;
    });

    return distribution;
  }

  /**
   * チーム内の陰陽バランスを計算
   */
  private calculateYinYangBalance(
    profiles: UserElementalProfile[]
  ): Record<YinYangType, number> {
    const balance: Record<YinYangType, number> = {
      '陰': 0,
      '陽': 0
    };

    profiles.forEach(profile => {
      balance[profile.yinYang]++;
    });

    return balance;
  }

  /**
   * チームメンバー間の全ての相性を計算
   */
  private calculateTeamCompatibilities(
    profiles: UserElementalProfile[]
  ): CompatibilityResult[] {
    const results: CompatibilityResult[] = [];

    // 全ての組み合わせを計算
    for (let i = 0; i < profiles.length; i++) {
      for (let j = i + 1; j < profiles.length; j++) {
        const result = this.calculateCompatibility(
          profiles[i],
          profiles[j]
        );
        results.push(result);
      }
    }

    return results;
  }

  /**
   * チームの強みと弱みを分析
   */
  private analyzeTeamStrengthsAndWeaknesses(
    elementDistribution: Record<ElementType, number>,
    yinYangBalance: Record<YinYangType, number>
  ): { strengths: string[], weaknesses: string[] } {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    
    // 総メンバー数
    const totalMembers = Object.values(elementDistribution).reduce((a, b) => a + b, 0);
    
    // 五行の偏りを分析
    const elements: ElementType[] = ['木', '火', '土', '金', '水'];
    
    // 五行ごとの比率を計算
    const elementRatios: Record<ElementType, number> = {} as Record<ElementType, number>;
    elements.forEach(element => {
      elementRatios[element] = elementDistribution[element] / totalMembers;
    });
    
    // 最も多い五行と最も少ない五行を特定
    let maxElement: ElementType = '木';
    let minElement: ElementType = '木';
    let maxRatio = elementRatios['木'];
    let minRatio = elementRatios['木'];
    
    elements.forEach(element => {
      if (elementRatios[element] > maxRatio) {
        maxRatio = elementRatios[element];
        maxElement = element;
      }
      if (elementRatios[element] < minRatio || (minRatio === 0 && elementRatios[element] === 0)) {
        minRatio = elementRatios[element];
        minElement = element;
      }
    });
    
    // 五行の特性マップ
    const elementalStrengths: Record<ElementType, string[]> = {
      '木': ['創造的な発想力', '成長志向', '柔軟な対応力'],
      '火': ['情熱的なコミュニケーション', 'モチベーション向上能力', 'リーダーシップ'],
      '土': ['安定した実行力', '信頼関係構築', '実用的な問題解決'],
      '金': ['精度の高い業務遂行', '分析的思考', '明確な決断'],
      '水': ['深い知識と洞察', '柔軟な適応力', '戦略的思考']
    };
    
    const elementalWeaknesses: Record<ElementType, string[]> = {
      '木': ['具体的な実行の不足', '整理整頓の苦手意識', '詳細への注意不足'],
      '火': ['計画性の欠如', '持続力の弱さ', '冷静さの欠如'],
      '土': ['変化への抵抗', '革新性の不足', '柔軟性の欠如'],
      '金': ['共感性の不足', '柔軟性の欠如', '過度な批判的思考'],
      '水': ['実行力の弱さ', '優柔不断', '理論に偏りすぎる']
    };
    
    // 強みの追加（最も多い五行から）
    strengths.push(elementalStrengths[maxElement][0]);
    
    // 五行バランスの分析
    if (maxRatio > 0.4) {
      // 特定の五行に偏っている場合
      strengths.push(`${maxElement}の特性が強い: ${elementalStrengths[maxElement][1]}`);
      weaknesses.push(`${maxElement}に偏りすぎ: ${elementalWeaknesses[maxElement][0]}`);
    }
    
    if (minRatio === 0) {
      // 特定の五行が欠けている場合
      const generatedBy = elements.find(el => this.isElementGenerating(el, minElement));
      weaknesses.push(`${minElement}の欠如: ${elementalWeaknesses[minElement][0]}`);
      if (generatedBy) {
        weaknesses.push(`${generatedBy}から${minElement}を生成するプロセスの弱さ`);
      }
    }
    
    // 相生循環の分析
    let hasGenerationCycle = true;
    elements.forEach((element, index) => {
      const nextElement = elements[(index + 1) % 5];
      if (elementDistribution[element] === 0 || elementDistribution[nextElement] === 0) {
        hasGenerationCycle = false;
      }
    });
    
    if (hasGenerationCycle) {
      strengths.push('五行の相生循環が健全: プロジェクト完遂能力');
    } else {
      weaknesses.push('五行の相生循環が不完全: プロセスのどこかで停滞する可能性');
    }
    
    // 陰陽バランスの分析
    const yinRatio = yinYangBalance['陰'] / totalMembers;
    const yangRatio = yinYangBalance['陽'] / totalMembers;
    
    if (Math.abs(yinRatio - yangRatio) < 0.2) {
      strengths.push('陰陽のバランスが取れている: 行動と内省のバランス');
    } else if (yinRatio > yangRatio) {
      strengths.push('内省的な強み: 計画性と深い思考');
      weaknesses.push('行動力と発信力の不足');
    } else {
      strengths.push('行動的な強み: 迅速な意思決定と実行力');
      weaknesses.push('深い分析や熟考の不足');
    }
    
    return { strengths, weaknesses };
  }

  /**
   * チーム最適化提案を生成
   */
  private generateOptimizationSuggestions(
    elementDistribution: Record<ElementType, number>,
    profiles: UserElementalProfile[]
  ): Array<{
    type: 'recruitment' | 'reassignment' | 'development';
    description: string;
    priority: 'low' | 'medium' | 'high';
  }> {
    const suggestions: Array<{
      type: 'recruitment' | 'reassignment' | 'development';
      description: string;
      priority: 'low' | 'medium' | 'high';
    }> = [];
    
    // 総メンバー数
    const totalMembers = Object.values(elementDistribution).reduce((a, b) => a + b, 0);
    
    // 五行の偏りを分析
    const elements: ElementType[] = ['木', '火', '土', '金', '水'];
    
    // 五行ごとの比率を計算
    const elementRatios: Record<ElementType, number> = {} as Record<ElementType, number>;
    elements.forEach(element => {
      elementRatios[element] = elementDistribution[element] / totalMembers;
    });
    
    // 最も弱い五行要素を特定
    let weakestElement: ElementType | null = null;
    let weakestRatio = 1; // 初期値を最大に設定
    
    elements.forEach(element => {
      if (elementRatios[element] < weakestRatio) {
        weakestRatio = elementRatios[element];
        weakestElement = element;
      }
    });
    
    // 最も強い五行要素を特定
    let strongestElement: ElementType | null = null;
    let strongestRatio = 0;
    
    elements.forEach(element => {
      if (elementRatios[element] > strongestRatio) {
        strongestRatio = elementRatios[element];
        strongestElement = element;
      }
    });
    
    // 最も弱い五行の補強提案
    if (weakestElement && weakestRatio < 0.1) {
      suggestions.push({
        type: 'recruitment',
        description: `「${weakestElement}」属性の人材を追加し、チームの${
          weakestElement === '木' ? '創造性と成長力' :
          weakestElement === '火' ? 'コミュニケーション力と情熱' :
          weakestElement === '土' ? '安定性と信頼性' :
          weakestElement === '金' ? '分析力と精度' : '洞察力と適応力'
        }を強化する`,
        priority: 'high'
      });
    }
    
    // 役割再配置の提案
    if (strongestElement && weakestElement && profiles.length >= 4) {
      const strongestMembers = profiles.filter(p => p.mainElement === strongestElement);
      
      if (strongestMembers.length >= 2) {
        suggestions.push({
          type: 'reassignment',
          description: `「${strongestElement}」と「${
            this.isElementGenerating(strongestElement as ElementType, weakestElement) ? weakestElement : 
            elements.find(e => this.isElementGenerating(e, weakestElement as ElementType)) || '土'
          }」の属性を持つメンバー間の協力を促進するための役割調整`,
          priority: 'medium'
        });
      }
    }
    
    // 能力開発の提案
    const developmentSuggestions = [
      {
        element: '木',
        description: '「木」属性メンバーの創造的発想を活かしたブレインストーミングセッションの導入',
        priority: 'low' as const
      },
      {
        element: '火',
        description: '「火」属性メンバーのコミュニケーション能力を活かしたチーム内情報共有の強化',
        priority: 'low' as const
      },
      {
        element: '土',
        description: '「土」属性メンバーの安定性を活かしたプロジェクト管理プロセスの確立',
        priority: 'low' as const
      },
      {
        element: '金',
        description: '「金」属性メンバーの詳細指向能力を活かしたレビュープロセスの導入',
        priority: 'low' as const
      },
      {
        element: '水',
        description: '「水」属性メンバーの洞察力を活かした戦略的計画立案の強化',
        priority: 'low' as const
      }
    ];
    
    // 存在する五行属性に対応する開発提案を追加
    elements.forEach(element => {
      if (elementDistribution[element] > 0) {
        const suggestion = developmentSuggestions.find(s => s.element === element);
        if (suggestion) {
          suggestions.push({
            type: 'development',
            description: suggestion.description,
            priority: suggestion.priority
          });
        }
      }
    });
    
    // 提案は最大3つまでに制限
    return suggestions.slice(0, 3);
  }
}

export default TeamCompatibilityService;