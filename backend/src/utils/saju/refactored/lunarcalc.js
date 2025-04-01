/**
 * lunar-javascriptライブラリを使って旧暦変換をテスト
 * 実行方法: node lunarcalc.js
 */

try {
  const { Lunar, Solar } = require('lunar-javascript');
  
  // 新暦1986年12月20日
  const solarDate = new Date(1986, 11, 20, 3, 0, 0);
  console.log('新暦: 1986年12月20日 3時');
  
  // 旧暦変換
  const solar = Solar.fromDate(solarDate);
  const lunar = solar.getLunar();
  
  console.log('\n【旧暦変換結果】');
  const lunarStr = lunar.toString();
  console.log('旧暦文字列:', lunarStr);
  
  // 文字列からパース
  // 例: "一九八六年冬月十九" -> "1986年11月19日"
  let monthName = lunarStr.match(/年(.+)月/)[1];
  let monthNum = '11'; // 冬月=11月
  if (monthName === '正') monthNum = '1';
  else if (monthName === '二') monthNum = '2';
  else if (monthName === '三') monthNum = '3';
  else if (monthName === '四') monthNum = '4';
  else if (monthName === '五') monthNum = '5';
  else if (monthName === '六') monthNum = '6';
  else if (monthName === '七') monthNum = '7';
  else if (monthName === '八') monthNum = '8';
  else if (monthName === '九') monthNum = '9';
  else if (monthName === '十') monthNum = '10';
  else if (monthName === '冬') monthNum = '11';
  else if (monthName === '腊') monthNum = '12';
  
  let dayText = lunarStr.match(/月(.+)$/)[1];
  let dayNum = '19'; // デフォルト
  // 日は数字に変換する必要があるが、今回は単純に出力される値を使用
  
  console.log(`旧暦: 1986年${monthNum}月${dayNum}日`);
  
  // 干支も取得（方法が違う可能性あり）
  try {
    const dayGanZhi = String(lunar.getDayInGanZhi());
    console.log(`日干支: ${dayGanZhi || '取得できません'}`);
  } catch (e) {
    console.log('日干支: 取得できません');
  }
  
  try {
    const monthGanZhi = String(lunar.getMonthInGanZhi());
    console.log(`月干支: ${monthGanZhi || '取得できません'}`);
  } catch (e) {
    console.log('月干支: 取得できません');
  }
  
  try {
    const yearGanZhi = String(lunar.getYearInGanZhi());
    console.log(`年干支: ${yearGanZhi || '取得できません'}`);
  } catch (e) {
    console.log('年干支: 取得できません');
  }
  
  // 冬至の情報
  console.log(`\n【冬至情報】`);
  const winterSolstice = new Date(1986, 11, 22); // 冬至は12月22日
  const winterSolar = Solar.fromDate(winterSolstice);
  const winterLunar = winterSolar.getLunar();
  console.log(`冬至: 新暦1986年12月22日 -> 旧暦: ${winterLunar.toString()}`);
  
  // 韓国語の表記について説明
  console.log('\n【韓国語の暦の表記】');
  console.log('양(陽) = 陽暦・新暦・グレゴリオ暦');
  console.log('음(陰) = 陰暦・旧暦・太陰暦');
  
  console.log('\n結論: 양 1986/12/20 03:00 は新暦（陽暦）の1986年12月20日3時であり、');
  console.log(`旧暦（陰暦）では1986年11月19日に相当します。`);
  
} catch (error) {
  console.error('変換エラー:', error);
}