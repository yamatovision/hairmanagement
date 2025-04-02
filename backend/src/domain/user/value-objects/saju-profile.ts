/**
 * 四柱推命プロファイル値オブジェクト
 * ユーザーの四柱推命情報を表す値オブジェクト
 */

// FourPillarsの型定義
export interface Pillar {
  stem: string;
  branch: string;
  fullStemBranch: string;
  hiddenStems?: string[]; // 蔵干（地支に隠れた天干）
  fortune?: string; // 十二運星
}

export interface FourPillars {
  yearPillar: Pillar;
  monthPillar: Pillar;
  dayPillar: Pillar;
  hourPillar: Pillar;
}

export class SajuProfile {
  /**
   * コンストラクタ
   * @param fourPillars 四柱情報
   * @param mainElement 主要素
   * @param secondaryElement 副要素（オプション）
   * @param yinYang 陰陽
   * @param tenGods 十神関係
   * @param twelveFortunes 十二運星情報（オプション）
   * @param hiddenStems 蔵干情報（オプション）
   * @param twelveSpiritKillers 十二神殺情報（オプション）
   * @param dayMaster 日主（日干）
   */
  constructor(
    public readonly fourPillars: FourPillars,
    public readonly mainElement: string,
    public readonly yinYang: string,
    public readonly tenGods: Record<string, string>,
    public readonly secondaryElement?: string,
    public readonly twelveFortunes?: Record<string, string>,
    public readonly hiddenStems?: Record<string, string[]>,
    public readonly twelveSpiritKillers?: Record<string, string>,
    public readonly dayMaster?: string
  ) {
    // 日主が指定されていない場合は、自動的に日干から取得
    this.dayMaster = dayMaster || fourPillars.dayPillar.stem;
  }
  
  /**
   * 簡易表現での五行陰陽の組み合わせを取得
   * @returns 五行陰陽の組み合わせ（例: '金の陽'）
   */
  getSimpleExpression(): string {
    return `${this.mainElement}の${this.yinYang}`;
  }
  
  /**
   * プレーンなオブジェクトに変換
   * @returns プレーンなオブジェクト
   */
  toPlain() {
    return {
      fourPillars: {
        yearPillar: this.fourPillars.yearPillar,
        monthPillar: this.fourPillars.monthPillar,
        dayPillar: this.fourPillars.dayPillar,
        hourPillar: this.fourPillars.hourPillar
      },
      mainElement: this.mainElement,
      secondaryElement: this.secondaryElement,
      yinYang: this.yinYang,
      tenGods: this.tenGods,
      twelveFortunes: this.twelveFortunes,
      hiddenStems: this.hiddenStems,
      twelveSpiritKillers: this.twelveSpiritKillers,
      dayMaster: this.dayMaster
    };
  }
}