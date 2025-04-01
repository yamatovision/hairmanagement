const { SajuCalculator } = require('./sajuCalculator');

// テスト用のデータ
const birthDate = new Date(1986, 4, 26, 12, 0); // 1986年5月26日12:00
const birthHour = 12;
const gender = 'F';
const city = '東京';

// SajuCalculatorの計算実行
const result = SajuCalculator.calculate(birthDate, birthHour, gender, city);

// 結果の表示
console.log('四柱推命計算結果:');
console.log(`年柱: ${result.fourPillars.yearPillar.fullStemBranch}`);
console.log(`月柱: ${result.fourPillars.monthPillar.fullStemBranch}`);
console.log(`日柱: ${result.fourPillars.dayPillar.fullStemBranch}`);
console.log(`時柱: ${result.fourPillars.hourPillar.fullStemBranch}`);

console.log('\n四柱: ' + 
  `${result.fourPillars.yearPillar.fullStemBranch} ` +
  `${result.fourPillars.monthPillar.fullStemBranch} ` +
  `${result.fourPillars.dayPillar.fullStemBranch} ` +
  `${result.fourPillars.hourPillar.fullStemBranch}`
);

// 旧暦と場所の表示
if (result.lunarDate) {
  console.log(`旧暦: ${result.lunarDate.year}年${result.lunarDate.month}月${result.lunarDate.day}日 ${result.lunarDate.isLeapMonth ? '(閏月)' : ''}`);
}

// 五行属性のプロファイル表示
console.log(`五行属性: ${result.elementProfile.yinYang}${result.elementProfile.mainElement}(主)/ ${result.elementProfile.secondaryElement}(副)`);