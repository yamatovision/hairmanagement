/**
 * 韓国式四柱推命計算 - 直接メソッド呼び出しによるテスト
 * - lunarDateCalculator, yearPillarCalculator, monthPillarCalculator, dayPillarCalculator, hourPillarCalculatorを直接使用
 * - 韓国語入力をサポート
 */
import { getLocationCoordinates, getLunarDate } from './lunarDateCalculator';
import { calculateKoreanYearPillar } from './koreanYearPillarCalculator';
import { calculateKoreanMonthPillar } from './koreanMonthPillarCalculator';
import { getDayPillar } from './dayPillarCalculator';
import { calculateKoreanHourPillar } from './hourPillarCalculator';
import { STEMS, BRANCHES } from './types';

/**
 * テスト用の韓国語入力データ
 */
interface KoreanInput {
  description: string;    // 説明文
  dateStr: string;        // 日付文字列（YYYY/MM/DD形式）
  timeStr: string;        // 時間文字列（HH:MM形式）
  gender: 'M' | 'F';      // 性別（M: 男性, F: 女性）
  location: string;       // 場所（都市名）
}

/**
 * 韓国語入力から四柱推命情報を計算
 */
function calculateFourPillars(input: KoreanInput) {
  console.log(`【${input.description}】`);
  
  // 1. 日付文字列をパース
  const [year, month, day] = input.dateStr.split('/').map(Number);
  const [hour, minute] = input.timeStr.split(':').map(Number);
  
  // JavaScriptの月は0始まりなので注意
  const date = new Date(year, month - 1, day, hour, minute, 0);
  console.log(`日付: ${date.toISOString()}`);
  console.log(`日時: ${year}年${month}月${day}日 ${hour}:${minute}`);
  console.log(`性別: ${input.gender === 'M' ? '男性' : '女性'}`);
  console.log(`場所: ${input.location}`);
  
  // 2. 旧暦日付を取得
  const lunarDate = getLunarDate(date);
  if (lunarDate) {
    console.log(`旧暦: ${lunarDate.lunarYear}年${lunarDate.lunarMonth}月${lunarDate.lunarDay}日${lunarDate.isLeapMonth ? ' (閏月)' : ''}`);
  } else {
    console.log(`旧暦: 取得できません`);
  }
  
  // 3. 四柱計算
  // 3.1 年柱
  const yearPillar = calculateKoreanYearPillar(date.getFullYear());
  
  // 3.2 月柱
  const monthPillar = calculateKoreanMonthPillar(date, yearPillar.stem);
  
  // 3.3 日柱
  const dayPillar = getDayPillar(date);
  
  // 3.4 時柱
  const hourPillar = calculateKoreanHourPillar(hour, dayPillar.stem);
  
  // 結果表示
  console.log(`四柱: ` +
    `年柱[${yearPillar.fullStemBranch}] ` +
    `月柱[${monthPillar.fullStemBranch}] ` +
    `日柱[${dayPillar.fullStemBranch}] ` +
    `時柱[${hourPillar.fullStemBranch}]`);
  
  // 五行属性
  const mainElement = getElementFromStem(dayPillar.stem);
  const secondaryElement = getElementFromStem(monthPillar.stem);
  const yinYang = isStemYin(dayPillar.stem) ? '陰' : '陽';
  
  console.log(`五行属性: ${yinYang}${mainElement} (主) / ${secondaryElement} (副)`);
  
  return {
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
    lunarDate
  };
}

/**
 * 天干から五行要素を取得
 */
function getElementFromStem(stem: string): string {
  const elements: { [key: string]: string } = {
    '甲': '木', '乙': '木',
    '丙': '火', '丁': '火',
    '戊': '土', '己': '土',
    '庚': '金', '辛': '金',
    '壬': '水', '癸': '水'
  };
  return elements[stem] || '不明';
}

/**
 * 天干が陰性かチェック
 */
function isStemYin(stem: string): boolean {
  const yinStems = ['乙', '丁', '己', '辛', '癸'];
  return yinStems.includes(stem);
}

/**
 * テスト実行
 */
function runTests() {
  console.log('=== 韓国式四柱推命計算テスト（直接メソッド呼び出し） ===\n');
  
  // テスト用の韓国語入力データ
  const testInputs: KoreanInput[] = [
    {
      description: "양 2022/04/06 23:00 여자 서울",
      dateStr: "2022/04/06",
      timeStr: "23:00",
      gender: 'F',
      location: 'ソウル'
    },
    {
      description: "양 2024/02/04 12:00 여자 도쿄",
      dateStr: "2024/02/04",
      timeStr: "12:00",
      gender: 'F',
      location: '東京'
    },
    {
      description: "양 2023/02/03 12:00 여자 도쿄",
      dateStr: "2023/02/03",
      timeStr: "12:00",
      gender: 'F',
      location: '東京'
    }
  ];
  
  // 各テストを実行
  for (const input of testInputs) {
    calculateFourPillars(input);
    console.log('\n---\n');
  }
}

// テスト実行
runTests();