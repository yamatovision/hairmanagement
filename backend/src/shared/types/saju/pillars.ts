/**
 * 四柱推命の柱（四柱）関連型定義
 * 
 * 作成日: 2025/04/05
 */

import { CelestialStem, TerrestrialBranch, TenGodType, PillarType } from './core';

/**
 * 蔵干の十神関係
 */
export interface HiddenStemTenGod {
  stem: CelestialStem;
  tenGod: TenGodType;
}

/**
 * 柱の型定義
 */
export interface Pillar {
  stem: CelestialStem;
  branch: TerrestrialBranch;
  fullStemBranch: string;
  hiddenStems?: CelestialStem[]; // 蔵干（地支に隠れた天干）
  fortune?: string; // 十二運星
  spiritKiller?: string; // 十二神殺
  branchTenGod?: TenGodType; // 地支の十神関係
  stemTenGod?: TenGodType; // 天干の十神関係
  hiddenStemsTenGods?: HiddenStemTenGod[]; // 蔵干の十神関係
}

/**
 * 四柱の型定義
 */
export interface FourPillars {
  yearPillar: Pillar;
  monthPillar: Pillar;
  dayPillar: Pillar;
  hourPillar: Pillar;
}

/**
 * 十神関係情報
 */
export interface TenGodRelations {
  year?: TenGodType;
  month?: TenGodType;
  day?: TenGodType;
  hour?: TenGodType;
}

/**
 * 十神関係マッピング
 */
export type TenGodMap = Record<PillarType, TenGodType>;

/**
 * 蔵干情報マッピング
 */
export type HiddenStemsMap = Record<PillarType, CelestialStem[]>;

/**
 * 運星情報マッピング
 */
export type FortuneMap = Record<PillarType, string>;

/**
 * 神殺情報マッピング
 */
export type SpiritKillerMap = Record<PillarType, string>;