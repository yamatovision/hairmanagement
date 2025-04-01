/**
 * 特定の1日だけをテストするスクリプト
 */
const { SajuEngine } = require('./SajuEngine');
const { DateTimeProcessor } = require('./DateTimeProcessor');

// テスト実行
function runTest(customDate, customHour, customGender, customLocation) {
  // デフォルト値またはカスタム値を使用
  const testDate = customDate || new Date(2023, 1, 1); // 2023年2月1日
  const testHour = customHour || 12; // 12時
  const gender = customGender || 'F'; // 女性
  const location = customLocation || 'ソウル'; // ソウル
  console.log(`===== 양 ${testDate.getFullYear()}/${testDate.getMonth() + 1}/${testDate.getDate()} ${testHour}:00 ${gender === 'F' ? '여자' : '남자'} ${location} テスト =====`);
  
  // 四柱推命エンジンの初期化
  const engine = new SajuEngine();
  
  // 日時処理クラスの初期化
  const dateProcessor = new DateTimeProcessor({
    useLocalTime: true,
    location: location
  });
  
  // 日時処理結果を取得
  const processedDateTime = dateProcessor.processDateTime(testDate, testHour);
  
  console.log('【入力パラメータ】');
  console.log(`- 日付: ${testDate.getFullYear()}年${testDate.getMonth() + 1}月${testDate.getDate()}日`);
  console.log(`- 時間: ${testHour}時`);
  console.log(`- 性別: ${gender === 'F' ? '女性' : '男性'}`);
  console.log(`- 場所: ${location}`);
  
  console.log('\n【日時処理結果】');
  console.log(`- 地方時調整: ${location} => ${processedDateTime.adjustedDate.minute > 0 ? processedDateTime.adjustedDate.minute + '分' : '-32分'}`);
  console.log(`- 調整後日時: ${processedDateTime.adjustedDate.year}年${processedDateTime.adjustedDate.month}月${processedDateTime.adjustedDate.day}日 ${processedDateTime.adjustedDate.hour}時${processedDateTime.adjustedDate.minute > 0 ? processedDateTime.adjustedDate.minute + '分' : ''}`);
  
  if (processedDateTime.lunarDate) {
    console.log(`- 旧暦: ${processedDateTime.lunarDate.year}年${processedDateTime.lunarDate.month}月${processedDateTime.lunarDate.day}日${processedDateTime.lunarDate.isLeapMonth ? ' (閏月)' : ''}`);
  }
  
  if (processedDateTime.solarTermPeriod) {
    console.log(`- 節気期間: ${processedDateTime.solarTermPeriod.name}`);
  }
  
  // 四柱推命計算
  const result = engine.calculate(testDate, testHour, gender, location);
  
  console.log('\n【四柱推命結果】');
  console.log(`- 年柱: ${result.fourPillars.yearPillar.fullStemBranch}`);
  console.log(`- 月柱: ${result.fourPillars.monthPillar.fullStemBranch}`);
  console.log(`- 日柱: ${result.fourPillars.dayPillar.fullStemBranch}`);
  console.log(`- 時柱: ${result.fourPillars.hourPillar.fullStemBranch}`);
  
  // 蔵干情報を表示
  console.log('\n【蔵干（地支に内包される天干）】');
  console.log(`- 年柱: ${result.hiddenStems?.year?.join('、') || 'なし'}`);
  console.log(`- 月柱: ${result.hiddenStems?.month?.join('、') || 'なし'}`);
  console.log(`- 日柱: ${result.hiddenStems?.day?.join('、') || 'なし'}`);
  console.log(`- 時柱: ${result.hiddenStems?.hour?.join('、') || 'なし'}`);
  
  // 十神関係を表示
  console.log('\n【十神関係】');
  console.log(`- 年柱: ${result.tenGods?.year || 'なし'}`);
  console.log(`- 月柱: ${result.tenGods?.month || 'なし'}`);
  console.log(`- 日柱: ${result.tenGods?.day || '主星'}`);
  console.log(`- 時柱: ${result.tenGods?.hour || 'なし'}`);

  // 十二運星を表示
  console.log('\n【十二運星】');
  console.log(`- 年柱: ${result.twelveFortunes?.year || 'なし'}`);
  console.log(`- 月柱: ${result.twelveFortunes?.month || 'なし'}`);
  console.log(`- 日柱: ${result.twelveFortunes?.day || 'なし'}`);
  console.log(`- 時柱: ${result.twelveFortunes?.hour || 'なし'}`);
  
  // 五行属性を表示
  console.log('\n【五行属性】');
  console.log(`- 本命星: ${result.elementProfile.yinYang}${result.elementProfile.mainElement}`);
  console.log(`- 副星: ${result.elementProfile.secondaryElement}`);
  
  console.log('\n【韓国語での表示】');
  console.log(`양 ${testDate.getFullYear()}/${testDate.getMonth() + 1}/${testDate.getDate()} ${testHour}:00 ${gender === 'F' ? '여자' : '남자'} ${location}`);
  console.log(`음(평달) ${processedDateTime.lunarDate?.year}/${processedDateTime.lunarDate?.month}/${processedDateTime.lunarDate?.day} ${processedDateTime.adjustedDate.hour}:${processedDateTime.adjustedDate.minute.toString().padStart(2, '0')} ${gender === 'F' ? '여자' : '남자'} ${location} (지역시 -32분)`);
}

// テストを実行
runTest();

// モジュールエクスポート
module.exports = { runTest };