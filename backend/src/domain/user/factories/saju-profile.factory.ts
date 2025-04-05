/**
 * SajuProfileファクトリ
 * 
 * プレーンオブジェクトからSajuProfileインスタンスを生成するための
 * ファクトリ関数を提供
 * 
 * 作成日: 2025/04/05
 */

import { SajuProfile } from '../value-objects/saju-profile';
import { 
  CelestialStem, 
  ElementType,
  YinYangType,
  FourPillars,
  TenGodMap,
  PillarType,
  TenGodType,
  FortuneMap,
  HiddenStemsMap,
  SpiritKillerMap
} from '../../../shared/types/saju';

/**
 * SajuProfileのファクトリ関数
 * プレーンオブジェクトからSajuProfileインスタンスを生成
 * 
 * @param data SajuProfileのプロパティを持つオブジェクト
 * @returns SajuProfileインスタンス
 */
export function createSajuProfile(data: any): SajuProfile {
  // データ検証
  if (!data) {
    throw new Error('SajuProfile データが null または undefined です');
  }

  if (!data.fourPillars || !data.fourPillars.dayPillar) {
    throw new Error('無効なSajuProfileデータ: fourPillarsまたはdayPillarが不足しています');
  }

  // デフォルト値と型アサーション
  const validElements = ['木', '火', '土', '金', '水'];
  const validYinYang = ['陰', '陽'];

  // 主要五行のバリデーションと設定
  const mainElement = data.mainElement && validElements.includes(data.mainElement) 
    ? data.mainElement as ElementType 
    : '木' as ElementType;

  // 陰陽のバリデーションと設定
  const yinYang = data.yinYang && validYinYang.includes(data.yinYang)
    ? data.yinYang as YinYangType
    : '陽' as YinYangType;

  // 十神関係（tenGodsとbranchTenGods）のデフォルト値
  const emptyTenGods = {} as Record<PillarType, TenGodType>;
  
  return new SajuProfile(
    data.fourPillars as FourPillars,
    mainElement,
    yinYang,
    data.tenGods || emptyTenGods,
    data.branchTenGods || emptyTenGods,
    data.secondaryElement as ElementType | undefined,
    data.twelveFortunes as FortuneMap | undefined,
    data.hiddenStems as HiddenStemsMap | undefined,
    data.twelveSpiritKillers as SpiritKillerMap | undefined,
    data.dayMaster as CelestialStem | undefined
  );
}

/**
 * SajuProfileを安全にクローンする関数
 * オリジナルのSajuProfileから新しいインスタンスを作成
 * 
 * @param profile 元のSajuProfileインスタンス
 * @param overrides プロパティのオーバーライド（オプション）
 * @returns 新しいSajuProfileインスタンス
 */
export function cloneSajuProfile(
  profile: SajuProfile, 
  overrides?: Partial<{
    fourPillars: FourPillars;
    mainElement: ElementType;
    yinYang: YinYangType;
    tenGods: TenGodMap;
    branchTenGods: TenGodMap;
    secondaryElement?: ElementType;
    twelveFortunes?: FortuneMap;
    hiddenStems?: HiddenStemsMap;
    twelveSpiritKillers?: SpiritKillerMap;
    dayMaster?: CelestialStem;
  }>
): SajuProfile {
  return new SajuProfile(
    overrides?.fourPillars || profile.fourPillars,
    overrides?.mainElement || profile.mainElement,
    overrides?.yinYang || profile.yinYang,
    overrides?.tenGods || profile.tenGods,
    overrides?.branchTenGods || profile.branchTenGods,
    overrides?.secondaryElement || profile.secondaryElement,
    overrides?.twelveFortunes || profile.twelveFortunes,
    overrides?.hiddenStems || profile.hiddenStems,
    overrides?.twelveSpiritKillers || profile.twelveSpiritKillers,
    overrides?.dayMaster || profile.dayMaster
  );
}

/**
 * プレーンなオブジェクトをSajuProfileに変換するためのヘルパー関数
 * データベース等から取得したオブジェクトを安全に変換
 * 
 * @param obj プレーンなオブジェクト（JSON.parseやDBから取得したデータなど）
 * @returns SajuProfileインスタンス
 */
export function fromPlainObject(obj: any): SajuProfile | null {
  if (!obj) return null;
  
  try {
    return createSajuProfile(obj);
  } catch (error) {
    console.error('SajuProfileへの変換に失敗しました:', error);
    return null;
  }
}