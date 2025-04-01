/**
 * 四柱推命に関連する型定義
 * 
 * 四柱推命（四柱八字）の計算結果を表す型定義を提供します。
 * 
 * 変更履歴:
 * - 2025/04/02: 初期実装 (Claude)
 */

import { ElementType, YinYangType } from '../index';

/**
 * 四柱推命の運勢予測結果
 */
export interface SajuFortune {
  /**
   * 天干地支の組み合わせ（四柱）
   */
  fourPillars: {
    yearPillar: SajuPillar;
    monthPillar: SajuPillar;
    dayPillar: SajuPillar;
    hourPillar: SajuPillar;
  };
  
  /**
   * 日柱の天干（日主）
   */
  dayMaster: string;
  
  /**
   * 主要な五行属性
   */
  mainElement: ElementType;
  
  /**
   * 副次的な五行属性（存在する場合）
   */
  secondaryElement?: ElementType;
  
  /**
   * 陰陽属性
   */
  yinYang: YinYangType;
  
  /**
   * 十神関係
   * 他の天干と日主との関係性
   */
  tenGods: Record<string, string>;
  
  /**
   * 十二運星情報
   */
  twelveFortunes?: Record<string, string>;
  
  /**
   * 蔵干情報（地支に隠れた天干）
   */
  hiddenStems?: Record<string, string[]>;
  
  /**
   * 運勢レベル（0-100）
   */
  fortuneLevel?: number;
  
  /**
   * 運勢の説明
   */
  description?: string;
  
  /**
   * アドバイス
   */
  advice?: string;
  
  /**
   * カテゴリごとの運勢（0-100）
   */
  categoryFortune?: {
    career?: number;
    relationship?: number;
    health?: number;
    wealth?: number;
    creativity?: number;
  };
}

/**
 * 四柱推命の柱（天干地支の組み合わせ）
 */
export interface SajuPillar {
  /**
   * 天干
   */
  stem: string;
  
  /**
   * 地支
   */
  branch: string;
  
  /**
   * 完全な天干地支の組み合わせ
   */
  fullStemBranch: string;
  
  /**
   * 蔵干（地支に隠れた天干）
   */
  hiddenStems?: string[];
  
  /**
   * 十二運星
   */
  fortune?: string;
}

/**
 * 十二運星の種類
 */
export enum TwelveFortunes {
  LONG_LIFE = '長生',
  GRAVE = '沐浴',
  HEALTH = '冠帯',
  POSITION = '臨官',
  PROSPERITY = '帝旺',
  STRENGTH = '衰',
  ILLNESS = '病',
  DEATH = '死',
  BURIAL = '墓',
  GHOSTGATE = '絶',
  CONCEPTION = '胎',
  BIRTH = '養'
}

/**
 * 十神の種類
 */
export enum TenGods {
  SELF = '比肩',
  FRIEND = '劫財',
  RESOURCE = '正財',
  PARALLEL_RESOURCE = '偏財',
  PARENT = '正官',
  PARALLEL_PARENT = '偏官',
  OUTPUT = '正印',
  PARALLEL_OUTPUT = '偏印',
  CHILD = '食神',
  GRANDCHILD = '傷官'
}

/**
 * 十二神殺の種類
 */
export enum TwelveSpiritKillers {
  YEAR_KILLER = '歳破',
  MONTH_KILLER = '月破',
  DAY_KILLER = '日破',
  HOUR_KILLER = '時破',
  SIX_CONFLICT = '六衝',
  SIX_HARM = '六害',
  SIX_DESTRUCTION = '六破',
  THREE_DESTRUCTION = '三刑',
  SELF_DESTRUCTION = '自刑',
  REVERSE_DESTRUCTION = '反吟',
  WEALTH_KILLER = '財殺',
  REVERSE_HORSE_KILLER = '逆馬殺'
}