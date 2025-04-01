import { injectable } from 'tsyringe';
import { ElementType, YinYangType, ELEMENT_GENERATING_RELATIONS, ELEMENT_CONTROLLING_RELATIONS } from '@shared';
import { ElementalProfile } from '../../domain/user/value-objects/elemental-profile';

/**
 * 陰陽五行計算サービス
 * 陰陽五行に基づく計算と属性判定を担当するサービス
 */
@injectable()
export class ElementalCalculatorService {
  /**
   * 五行要素の配列（木、火、土、金、水）
   */
  private readonly elements: ElementType[] = ['木', '火', '土', '金', '水'];
  
  /**
   * 陰陽の配列
   */
  private readonly yinYang: YinYangType[] = ['陰', '陽'];
  
  /**
   * 生年月日から陰陽五行プロファイルを計算する
   * @param birthDate 生年月日
   * @returns 陰陽五行プロファイル
   */
  calculateElementalProfileFromBirthDate(birthDate: Date): ElementalProfile {
    const year = birthDate.getFullYear();
    const month = birthDate.getMonth() + 1;
    const day = birthDate.getDate();
    
    // 主属性の計算（年と月の合計を5で割った余り）
    const mainElementIndex = (year + month) % 5;
    const mainElement = this.elements[mainElementIndex];
    
    // 副属性の計算（月と日の合計を5で割った余り）
    const secondaryElementIndex = (month + day) % 5;
    const secondaryElement = this.elements[secondaryElementIndex];
    
    // 陰陽の計算（年が奇数なら陽、偶数なら陰）
    const yinYang: YinYangType = year % 2 !== 0 ? '陽' : '陰';
    
    return new ElementalProfile(mainElement, yinYang, secondaryElement);
  }
  
  /**
   * デイリー運勢用の日付から元素を計算する
   * @param date 日付
   * @returns 陰陽五行プロファイル
   */
  calculateDailyElementalProfile(date: Date): ElementalProfile {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // 日の元素（日付を5で割った余り）
    const dayElementIndex = day % 5;
    const mainElement = this.elements[dayElementIndex];
    
    // 月の元素（月を5で割った余り）
    const monthElementIndex = month % 5;
    const secondaryElement = this.elements[monthElementIndex];
    
    // 日の陰陽（日が奇数なら陽、偶数なら陰）
    const yinYang: YinYangType = day % 2 !== 0 ? '陽' : '陰';
    
    return new ElementalProfile(mainElement, yinYang, secondaryElement);
  }
  
  /**
   * 二つの陰陽五行プロファイル間の相性を計算する
   * @param profile1 1つ目のプロファイル
   * @param profile2 2つ目のプロファイル
   * @returns 相性スコア（0-100）
   */
  calculateCompatibility(profile1: ElementalProfile, profile2: ElementalProfile): number {
    return profile1.calculateCompatibility(profile2);
  }
  
  /**
   * 複数の陰陽五行プロファイル間の相性を計算する（チーム分析用）
   * @param profiles プロファイルの配列
   * @returns 全体相性スコア（0-100）
   */
  calculateGroupCompatibility(profiles: ElementalProfile[]): number {
    if (profiles.length <= 1) {
      return 100; // 1人またはそれ以下の場合は相性は完璧
    }
    
    let totalScore = 0;
    let pairCount = 0;
    
    // すべてのペアの相性スコアを計算する
    for (let i = 0; i < profiles.length; i++) {
      for (let j = i + 1; j < profiles.length; j++) {
        totalScore += this.calculateCompatibility(profiles[i], profiles[j]);
        pairCount++;
      }
    }
    
    // 平均相性スコアを返す
    return pairCount > 0 ? totalScore / pairCount : 0;
  }
  
  /**
   * ある陰陽五行属性に対して最も相性の良い属性を見つける
   * @param profile 基準となるプロファイル
   * @returns 最も相性の良いプロファイル
   */
  findMostCompatibleProfile(profile: ElementalProfile): ElementalProfile {
    let bestScore = 0;
    let bestProfile = profile;
    
    // すべての要素と陰陽の組み合わせをテスト
    for (const element of this.elements) {
      for (const yinYang of this.yinYang) {
        const testProfile = new ElementalProfile(element, yinYang);
        const score = profile.calculateCompatibility(testProfile);
        
        if (score > bestScore) {
          bestScore = score;
          bestProfile = testProfile;
        }
      }
    }
    
    return bestProfile;
  }
}