/**
 * 四柱推命の基本型定義
 * 天干地支や十神などの基本的な型を定義します
 * 
 * 作成日: 2025/04/05
 * 更新日: 2025/04/05 - 型安全性向上のための型ガード関数追加
 */

// 天干（Celestial Stem）の型定義
export type CelestialStem = '甲' | '乙' | '丙' | '丁' | '戊' | '己' | '庚' | '辛' | '壬' | '癸';

// 地支（Terrestrial Branch）の型定義
export type TerrestrialBranch = '子' | '丑' | '寅' | '卯' | '辰' | '巳' | '午' | '未' | '申' | '酉' | '戌' | '亥';

// 十神（Ten Gods）の型定義
export type TenGodType = '比肩' | '劫財' | '食神' | '傷官' | '偏財' | '正財' | '七殺' | '正官' | '偏印' | '正印' | '日主' |
  '偏官' | // 七殺の別名
  '長生' | '沐浴' | '冠帯' | '臨官' | '帝旺' | '衰' | '病' | '死' | '墓' | '絶' | '胎' | '養'; // 十二運星（互換性のため）

// 陰陽の型定義
export type YinYangType = '陰' | '陽';

// 五行の型定義
export type ElementType = '木' | '火' | '土' | '金' | '水';

// 柱の種類
export type PillarType = 'year' | 'month' | 'day' | 'hour';

// 定数リスト
export const STEMS: CelestialStem[] = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
export const BRANCHES: TerrestrialBranch[] = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
export const ELEMENTS: ElementType[] = ["木", "火", "土", "金", "水"];
export const YIN_YANG: YinYangType[] = ["陰", "陽"];
export const PILLAR_TYPES: PillarType[] = ["year", "month", "day", "hour"];

// 五行マッピング
export const STEM_TO_ELEMENT: Record<CelestialStem, ElementType> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水'
};

export const BRANCH_TO_ELEMENT: Record<TerrestrialBranch, ElementType> = {
  '子': '水', '丑': '土',
  '寅': '木', '卯': '木',
  '辰': '土', '巳': '火',
  '午': '火', '未': '土',
  '申': '金', '酉': '金',
  '戌': '土', '亥': '水'
};

// 陰陽マッピング
export const STEM_TO_YIN_YANG: Record<CelestialStem, YinYangType> = {
  '甲': '陽', '乙': '陰',
  '丙': '陽', '丁': '陰',
  '戊': '陽', '己': '陰',
  '庚': '陽', '辛': '陰',
  '壬': '陽', '癸': '陰'
};

export const BRANCH_TO_YIN_YANG: Record<TerrestrialBranch, YinYangType> = {
  '子': '陽', '丑': '陰',
  '寅': '陽', '卯': '陰',
  '辰': '陽', '巳': '陰',
  '午': '陽', '未': '陰',
  '申': '陽', '酉': '陰',
  '戌': '陽', '亥': '陰'
};

// 十二運星
export const TWELVE_FORTUNES = [
  "長生", "沐浴", "冠帯", "臨官", "帝旺", "衰", 
  "病", "死", "墓", "絶", "胎", "養"
];

// 十二神殺
export const TWELVE_SPIRIT_KILLERS = [
  "年殺", "月殺", "日殺", "劫殺", "望神殺", "天殺", 
  "地殺", "六害殺", "長生殺", "反安殺", "火開殺", "逆馬殺"
];

// 干支の60組合せ
export const STEM_BRANCHES = [
  "甲子", "乙丑", "丙寅", "丁卯", "戊辰", "己巳", "庚午", "辛未", "壬申", "癸酉",
  "甲戌", "乙亥", "丙子", "丁丑", "戊寅", "己卯", "庚辰", "辛巳", "壬午", "癸未",
  "甲申", "乙酉", "丙戌", "丁亥", "戊子", "己丑", "庚寅", "辛卯", "壬辰", "癸巳",
  "甲午", "乙未", "丙申", "丁酉", "戊戌", "己亥", "庚子", "辛丑", "壬寅", "癸卯",
  "甲辰", "乙巳", "丙午", "丁未", "戊申", "己酉", "庚戌", "辛亥", "壬子", "癸丑",
  "甲寅", "乙卯", "丙辰", "丁巳", "戊午", "己未", "庚申", "辛酉", "壬戌", "癸亥"
];

/**
 * 型安全性のための型ガード関数
 */

/**
 * 値が五行（ElementType）かどうかを判定
 * @param value 判定する値
 * @returns ElementType型かどうか
 */
export function isElementType(value: unknown): value is ElementType {
  return typeof value === 'string' && ELEMENTS.includes(value as ElementType);
}

/**
 * 値が天干（CelestialStem）かどうかを判定
 * @param value 判定する値
 * @returns CelestialStem型かどうか
 */
export function isCelestialStem(value: unknown): value is CelestialStem {
  return typeof value === 'string' && STEMS.includes(value as CelestialStem);
}

/**
 * 値が地支（TerrestrialBranch）かどうかを判定
 * @param value 判定する値
 * @returns TerrestrialBranch型かどうか
 */
export function isTerrestrialBranch(value: unknown): value is TerrestrialBranch {
  return typeof value === 'string' && BRANCHES.includes(value as TerrestrialBranch);
}

/**
 * 値が陰陽（YinYangType）かどうかを判定
 * @param value 判定する値
 * @returns YinYangType型かどうか
 */
export function isYinYangType(value: unknown): value is YinYangType {
  return typeof value === 'string' && YIN_YANG.includes(value as YinYangType);
}

/**
 * 値が柱の種類（PillarType）かどうかを判定
 * @param value 判定する値
 * @returns PillarType型かどうか
 */
export function isPillarType(value: unknown): value is PillarType {
  return typeof value === 'string' && PILLAR_TYPES.includes(value as PillarType);
}

/**
 * 安全なオブジェクトアクセスヘルパー関数
 * @param obj 対象オブジェクト
 * @param key アクセスするキー
 * @param defaultValue キーが存在しない場合のデフォルト値
 * @returns オブジェクトのプロパティ値またはデフォルト値
 */
export function safeAccess<T extends object>(
  obj: T,
  key: string | number | symbol,
  defaultValue: any = undefined
): any {
  if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
    return obj[key as keyof T];
  }
  return defaultValue;
}