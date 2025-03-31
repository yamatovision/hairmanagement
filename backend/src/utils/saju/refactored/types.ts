/**
 * 韓国式四柱推命計算の共通型定義
 */

/**
 * 天干（十干）
 */
const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];

/**
 * 地支（十二支）
 */
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

/**
 * 干支の60組合せ
 */
const STEM_BRANCHES = [
  "甲子", "乙丑", "丙寅", "丁卯", "戊辰", "己巳", "庚午", "辛未", "壬申", "癸酉",
  "甲戌", "乙亥", "丙子", "丁丑", "戊寅", "己卯", "庚辰", "辛巳", "壬午", "癸未",
  "甲申", "乙酉", "丙戌", "丁亥", "戊子", "己丑", "庚寅", "辛卯", "壬辰", "癸巳",
  "甲午", "乙未", "丙申", "丁酉", "戊戌", "己亥", "庚子", "辛丑", "壬寅", "癸卯",
  "甲辰", "乙巳", "丙午", "丁未", "戊申", "己酉", "庚戌", "辛亥", "壬子", "癸丑",
  "甲寅", "乙卯", "丙辰", "丁巳", "戊午", "己未", "庚申", "辛酉", "壬戌", "癸亥"
];

/**
 * 十二運星
 */
const TWELVE_FORTUNES = [
  "長生", "沐浴", "冠帯", "臨官", "帝旺", "衰", 
  "病", "死", "墓", "絶", "胎", "養"
];

/**
 * 十二神殺
 */
const TWELVE_SPIRITS = [
  "天殺", "地殺", "年殺", "月殺", "日殺", "時殺", 
  "歳破", "五鬼", "災殺", "大耗", "伏兵", "白虎"
];

/**
 * 四柱の柱
 */
class Pillar {
  stem; // 天干
  branch; // 地支
  fullStemBranch; // 天干地支の組み合わせ
  hiddenStems; // 蔵干（地支に内包される天干）
  fortune; // 十二運星
  spirit; // 十二神殺
}

/**
 * 四柱情報
 */
class FourPillars {
  yearPillar; // 年柱
  monthPillar; // 月柱
  dayPillar; // 日柱
  hourPillar; // 時柱
}

/**
 * 計算オプション
 */
class SajuOptions {
  gender; // 性別（M=男性, F=女性）
  location; // 場所の座標（経度・緯度）
  useLocalTime; // 地方時を使用するか
  useKoreanMethod; // 韓国式計算法を使用するか
}

/**
 * 旧暦日付情報
 */
class LunarDate {
  lunarYear; // 旧暦年
  lunarMonth; // 旧暦月
  lunarDay; // 旧暦日
  isLeapMonth; // 閏月かどうか
  stemBranch; // 日の干支
}

/**
 * 旧暦と干支のカレンダーデータ
 */
class CalendarDay {
  solarDate; // 新暦日付（YYYY-MM-DD）
  lunarDate; // 旧暦日付（例: 3/4）
  stemBranch; // 干支（例: 庚子）
  lunarMonth; // 旧暦月
  lunarDay; // 旧暦日
  isLeapMonth; // 閏月かどうか
  solarTerm; // 節気（該当する場合のみ）
}

// モジュールをエクスポート
module.exports = {
  STEMS,
  BRANCHES,
  STEM_BRANCHES,
  TWELVE_FORTUNES,
  TWELVE_SPIRITS
};