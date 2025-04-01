/**
 * 8つのモジュールを使用した四柱推命計算テスト
 * 1986年12月20日午前3時の四柱を計算
 */

// 各モジュールのインポート
const { calculateYearStem } = require('./yearStemCalculator');
const { calculateYearBranch } = require('./yearBranchCalculator');
const { calculateMonthStem } = require('./monthStemCalculator');
const { calculateMonthBranch } = require('./monthBranchCalculator');
const { calculateDayStem } = require('./dayStemCalculator');
const { calculateDayBranch } = require('./dayBranchCalculator');
const { calculateHourStem } = require('./hourStemCalculator');
const { calculateHourBranch } = require('./hourBranchCalculator');

// テスト対象の日時
const birthDate = new Date(1986, 11, 20, 3, 0, 0); // 1986年12月20日午前3時
const birthHour = 3; // 午前3時

console.log(`===== 1986年12月20日 午前3時の四柱命式計算 =====`);
console.log(`新暦: ${birthDate.toLocaleString()}`);

// 旧暦情報（参考）
console.log(`\n旧暦情報: 1986年11月19日（冬至前）`);

// 計算オプション
const options = {
  useLocalTime: true,
  location: { longitude: 126.9779, latitude: 37.5665 } // ソウルの座標
};

// 年柱の計算
const yearStem = calculateYearStem(birthDate.getFullYear());
const yearBranch = calculateYearBranch(birthDate.getFullYear());
console.log(`\n【年柱計算】`);
console.log(`年干: ${yearStem} (計算方法: (年 + 6) % 10)`);
console.log(`年支: ${yearBranch} (計算方法: (年 + 0) % 12)`);
console.log(`=> 年柱: ${yearStem}${yearBranch}`);

// 月柱の計算
const monthStem = calculateMonthStem(birthDate, yearStem);
const monthBranch = calculateMonthBranch(birthDate);
console.log(`\n【月柱計算】`);
console.log(`月干: ${monthStem} (計算方法: 年干と旧暦月から導出)`);
console.log(`月支: ${monthBranch} (計算方法: 旧暦月に対応する地支)`);
console.log(`=> 月柱: ${monthStem}${monthBranch}`);

// 日柱の計算
const dayStem = calculateDayStem(birthDate, options);
const dayBranch = calculateDayBranch(birthDate, options);
console.log(`\n【日柱計算】`);
console.log(`日干: ${dayStem} (計算方法: 2023年10月2日からの日数差分)`);
console.log(`日支: ${dayBranch} (計算方法: 2023年10月2日からの日数差分)`);
console.log(`=> 日柱: ${dayStem}${dayBranch}`);

// 時柱の計算
const hourStem = calculateHourStem(birthHour, dayStem);
const hourBranch = calculateHourBranch(birthHour);
console.log(`\n【時柱計算】`);
console.log(`時干: ${hourStem} (計算方法: 日干と時刻から導出)`);
console.log(`時支: ${hourBranch} (計算方法: 時刻に対応する地支)`);
console.log(`=> 時柱: ${hourStem}${hourBranch}`);

// 四柱命式のまとめ
console.log(`\n===== 四柱命式 =====`);
console.log(`四柱: ${yearStem}${yearBranch} ${monthStem}${monthBranch} ${dayStem}${dayBranch} ${hourStem}${hourBranch}`);
console.log(`命式表:`);
console.log(`時柱\t日柱\t月柱\t年柱`);
console.log(`天干\t${hourStem}\t${dayStem}\t${monthStem}\t${yearStem}`);
console.log(`地支\t${hourBranch}\t${dayBranch}\t${monthBranch}\t${yearBranch}`);

// 分析ツールでの参照用に出力形式を調整
console.log(`\n===== JSON形式出力 =====`);
const result = {
  solarDate: '1986/12/20',
  solarTime: '03:00',
  fourPillars: {
    year: { stem: yearStem, branch: yearBranch },
    month: { stem: monthStem, branch: monthBranch },
    day: { stem: dayStem, branch: dayBranch },
    hour: { stem: hourStem, branch: hourBranch }
  }
};
console.log(JSON.stringify(result, null, 2));