/**
 * lunar-javascriptライブラリのテスト
 */
const { Solar, Lunar, SolarTerm } = require('lunar-javascript');

// テスト対象の日付
const testDate = new Date(2023, 1, 1); // 2023年2月1日
const testHour = 12; // 12時
const gender = 'F'; // 女性
const location = 'ソウル'; // ソウル

function testLunarLibrary() {
  console.log(`===== 양 2023/02/01 12:00 여자 서울특별시 テスト =====`);
  
  // 1. 西暦日付を Solar オブジェクトに変換
  const solar = Solar.fromDate(testDate);
  
  // 2. Solar から Lunar オブジェクトを取得
  const lunar = solar.getLunar();
  
  // 基本情報を表示
  console.log('\n【基本情報】');
  console.log(`- 西暦: ${testDate.getFullYear()}年${testDate.getMonth()+1}月${testDate.getDate()}日 ${testHour}時`);
  console.log(`- 性別: ${gender === 'F' ? '女性 (여자)' : '男性 (남자)'}`);
  console.log(`- 場所: ${location} (서울특별시)`);
  
  // APIを調査し、利用可能なメソッドを確認
  console.log('\n【Lunarオブジェクトのメソッド】');
  const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(lunar))
    .filter(name => typeof lunar[name] === 'function' && name !== 'constructor');
  console.log(methods.join(', '));
  
  // 旧暦情報を表示
  console.log('\n【旧暦情報】');
  console.log(`- 旧暦日付: ${lunar.getYear()}年${lunar.getMonth()}月${lunar.getDay()}日`);
  console.log(`- 旧暦（韓国語）: ${lunar.getYear()}년 ${lunar.getMonth()}월 ${lunar.getDay()}일`);
  
  // 干支情報を表示
  console.log('\n【干支情報】');
  console.log(`- 年柱: ${lunar.getYearInGanZhi()}`);
  console.log(`- 月柱: ${lunar.getMonthInGanZhi()}`);
  console.log(`- 日柱: ${lunar.getDayInGanZhi()}`);
  
  // 時柱の計算
  const hourZhi = getHourZhi(testHour);
  const dayStem = lunar.getDayInGanZhi()[0]; // 日柱の天干を取得
  const hourStem = getHourStem(dayStem, hourZhi);
  const hourPillar = `${hourStem}${hourZhi}`;
  
  console.log(`- 時柱: ${hourPillar}`);
  
  // 節気情報を表示
  console.log('\n【節気情報】');
  const jieQi = solar.getJieQi();
  const nextJieQi = solar.getNextJieQi();
  console.log(`- 現在の節気: ${jieQi || '該当なし'}`);
  console.log(`- 次の節気: ${nextJieQi.getName()} (${formatJieQiDate(nextJieQi.getSolar().toDate())})`);
  
  // 四柱全体
  console.log('\n【四柱全体】');
  console.log(`- 四柱: ${lunar.getYearInGanZhi()} ${lunar.getMonthInGanZhi()} ${lunar.getDayInGanZhi()} ${hourPillar}`);
  
  // 韓国語表示
  console.log('\n【韓国語表示】');
  console.log(`양 ${testDate.getFullYear()}/${testDate.getMonth()+1}/${testDate.getDate()} ${testHour}:00 여자 서울특별시`);
  console.log(`음 ${lunar.getYear()}/${lunar.getMonth()}/${lunar.getDay()} ${testHour}:00 여자 서울특별시`);
}

/**
 * 時間から地支を取得
 */
function getHourZhi(hour) {
  const zhiList = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  // 23時〜1時は子の刻
  if (hour === 23 || hour === 0 || hour === 1) return '子';
  // 1時〜3時は丑の刻
  if (hour === 2 || hour === 3) return '丑';
  // 以下同様に2時間ごとに地支を割り当て
  const index = Math.floor((hour + 1) / 2) % 12;
  return zhiList[index];
}

/**
 * 日干と時支から時干を計算
 */
function getHourStem(dayStem, hourZhi) {
  const stemList = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const zhiList = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  
  // 日干のインデックスを取得
  let dayIndex = stemList.indexOf(dayStem);
  if (dayIndex === -1) {
    console.warn(`無効な日干: ${dayStem}`);
    dayIndex = 0; // デフォルト値（甲）
  }
  
  // 時支のインデックスを取得
  const hourIndex = zhiList.indexOf(hourZhi);
  
  // 時干の計算
  // 甲己日は甲子から、乙庚日は丙子から、...
  let startStem;
  if (dayIndex % 5 === 0) startStem = 0; // 甲己日
  else if (dayIndex % 5 === 1) startStem = 2; // 乙庚日
  else if (dayIndex % 5 === 2) startStem = 4; // 丙辛日
  else if (dayIndex % 5 === 3) startStem = 6; // 丁壬日
  else startStem = 8; // 戊癸日
  
  // 時干のインデックスを計算
  const hourStemIndex = (startStem + hourIndex) % 10;
  
  return stemList[hourStemIndex];
}

/**
 * 節気日付のフォーマット
 */
function formatJieQiDate(date) {
  return `${date.getFullYear()}年${date.getMonth()+1}月${date.getDate()}日`;
}

// テストを実行
testLunarLibrary();