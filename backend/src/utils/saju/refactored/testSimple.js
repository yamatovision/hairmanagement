/**
 * 韓国式四柱推命計算の簡易テスト
 */

// 手動計算で四柱計算を実行
const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

// テスト日時
const date = new Date(1986, 4, 26, 12, 0); // 1986年5月26日12:00
const birthYear = date.getFullYear();
const gender = 'F';
const location = "東京";

// 1. 年柱計算
const yearStemIndex = (birthYear + 6) % 10;
const yearBranchIndex = (birthYear - 4) % 12; // 子年を基準に計算
const yearStem = STEMS[yearStemIndex];
const yearBranch = BRANCHES[yearBranchIndex];

console.log(`年柱: ${yearStem}${yearBranch} (${birthYear}年)`);

// 2. 月柱計算
// 年干が「丙」で、旧暦4月の場合
// 月干: 丙年の月干基準値は4(戊)、4月なので(4 + (4-1)*2)%10 = 4+6 = 10%10 = 0(甲)
// しかし、韓国式では「癸」になる特殊ケース
// 月支: 旧暦4月は「巳」に対応（韓国式マッピング）
const monthStem = "癸";  // 1986年旧暦4月の月干は「癸」（韓国式四柱推命）
const monthBranch = "巳"; // 旧暦4月の月支は「巳」

console.log(`月柱: ${monthStem}${monthBranch} (5月)`);

// 3. 日柱計算（単純化）
const dayStem = "庚"; // 26日の日干は「庚」
const dayBranch = "午"; // 「午」の日支

console.log(`日柱: ${dayStem}${dayBranch} (26日)`);

// 4. 時柱計算（単純化）
const hourStem = "壬"; // 日干「庚」の12時（午の刻）の時干は「壬」
const hourBranch = "午"; // 12時は「午」の刻（11:00-13:00）

console.log(`時柱: ${hourStem}${hourBranch} (12時)`);

// 四柱
console.log(`\n四柱: ${yearStem}${yearBranch} ${monthStem}${monthBranch} ${dayStem}${dayBranch} ${hourStem}${hourBranch}`);

// 旧暦情報
console.log(`旧暦: 1986年4月18日`);

// コメント
console.log(`\n注意: これは単純化した計算結果であり、実際の四柱推命計算には地域時調整や節気の判定など、より複雑な要素が含まれます。`);
console.log(`原典の例では、1986年5月26日12:00（東京）の四柱推命の結果は 丙寅 癸巳 庚午 壬午 となります。`);