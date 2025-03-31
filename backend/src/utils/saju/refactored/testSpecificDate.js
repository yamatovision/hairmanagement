"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 特定の日付（1986年5月26日5時）の四柱計算をテストするスクリプト
 */
var koreanYearPillarCalculator_1 = require("./koreanYearPillarCalculator");
var koreanMonthPillarCalculator_1 = require("./koreanMonthPillarCalculator");
var dayPillarCalculator_1 = require("./dayPillarCalculator");
var hourPillarCalculator_1 = require("./hourPillarCalculator");
var lunarDateCalculator_1 = require("./lunarDateCalculator");
// 1986年5月26日 5:00 (東京)
var testDate = new Date(1986, 4, 26);
var testHour = 5;
var testLocation = { longitude: 139.7671, latitude: 35.6812 }; // 東京の座標
// 1. 旧暦データを確認
var lunarDate = (0, lunarDateCalculator_1.getLunarDate)(testDate);
console.log('旧暦情報:');
if (lunarDate) {
    console.log("\u65E7\u66A6: ".concat(lunarDate.lunarYear, "\u5E74").concat(lunarDate.lunarMonth, "\u6708").concat(lunarDate.lunarDay, "\u65E5").concat(lunarDate.isLeapMonth ? '(閏月)' : ''));
}
else {
    console.log('旧暦データがありません');
}
// 2. 年柱計算
var yearPillar = (0, koreanYearPillarCalculator_1.calculateKoreanYearPillar)(testDate.getFullYear());
console.log("\u5E74\u67F1: ".concat(yearPillar.fullStemBranch));
// 3. 日柱計算 (地域時調整込み)
var options = { useLocalTime: true, location: testLocation };
var adjustedDate = (0, dayPillarCalculator_1.getLocalTimeAdjustedDate)(testDate, options);
var dayPillar = (0, dayPillarCalculator_1.calculateKoreanDayPillar)(adjustedDate);
console.log("\u65E5\u67F1: ".concat(dayPillar.fullStemBranch));
// 4. 月柱計算
console.log('\n=== 月柱計算テスト ===');
// 韓国式のデフォルト設定 (地域時調整込み)
console.log('韓国式月柱計算（デフォルト）:');
var monthPillar1 = (0, koreanMonthPillarCalculator_1.calculateKoreanMonthPillar)(adjustedDate, yearPillar.stem);
console.log("\u6708\u67F1: ".concat(monthPillar1.fullStemBranch));
// 節気使用設定（明示的）
console.log('韓国式月柱計算（節気使用）:');
var monthPillar2 = (0, koreanMonthPillarCalculator_1.calculateKoreanMonthPillar)(adjustedDate, yearPillar.stem, { useSolarTerms: true });
console.log("\u6708\u67F1: ".concat(monthPillar2.fullStemBranch));
// 節気不使用設定
console.log('韓国式月柱計算（節気不使用）:');
var monthPillar3 = (0, koreanMonthPillarCalculator_1.calculateKoreanMonthPillar)(adjustedDate, yearPillar.stem, { useSolarTerms: false });
console.log("\u6708\u67F1: ".concat(monthPillar3.fullStemBranch));
// 旧暦月の直接指定
// 旧暦1986年4月18日と仮定
console.log('韓国式月柱計算（旧暦月を直接指定）:');
// 旧暦月を直接計算に使用
var yearStemIndex = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'].indexOf(yearPillar.stem);
var yearGroup = yearStemIndex % 5;
var monthStemBase = [0, 2, 4, 6, 8][yearGroup];
var lunarMonth = 4; // 旧暦4月と仮定
var monthStemIndex = (monthStemBase + ((lunarMonth - 1) * 2) % 10) % 10;
var monthBranchIndex = ((lunarMonth + 1) % 12);
var stem = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'][monthStemIndex];
var branch = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'][monthBranchIndex];
console.log("\u65E7\u66A6\u6708: ".concat(lunarMonth, "\u6708"));
console.log("\u6708\u67F1: ".concat(stem).concat(branch));
// 5. 時柱計算
console.log('\n=== 時柱計算テスト ===');
// 地域時調整は旧暦や日柱計算に影響するが、時柱計算では素の時間（testHour）を使用
var hourPillar = (0, hourPillarCalculator_1.calculateKoreanHourPillar)(testHour, dayPillar.stem);
console.log("\u6642\u67F1: ".concat(hourPillar.fullStemBranch));
// 6. 時柱計算の詳細確認
console.log('\n時柱計算の詳細:');
console.log("\u65E5\u5E72: ".concat(dayPillar.stem));
var hourBranchIndex = Math.floor(testHour / 2) % 12;
console.log("\u6642\u523B: ".concat(testHour, "\u6642 \u2192 \u5730\u652F\u30A4\u30F3\u30C7\u30C3\u30AF\u30B9: ").concat(hourBranchIndex));
var DAY_STEM_TO_HOUR_STEM_BASE = {
    "甲": 0, "乙": 2, "丙": 4, "丁": 6, "戊": 8,
    "己": 0, "庚": 2, "辛": 4, "壬": 6, "癸": 8
};
var hourStemBase = DAY_STEM_TO_HOUR_STEM_BASE[dayPillar.stem];
console.log("\u65E5\u5E72(".concat(dayPillar.stem, ")\u306E\u6642\u5E72\u57FA\u6E96\u5024: ").concat(hourStemBase));
var stemIndex = (hourStemBase + hourBranchIndex) % 10;
console.log("\u6642\u5E72\u30A4\u30F3\u30C7\u30C3\u30AF\u30B9\u8A08\u7B97: (".concat(hourStemBase, " + ").concat(hourBranchIndex, ") % 10 = ").concat(stemIndex));
var stem2 = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'][stemIndex];
var branch2 = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'][hourBranchIndex];
console.log("\u6642\u67F1: ".concat(stem2).concat(branch2));
// 7. 韓国式からの引用結果との比較
console.log('\n=== 韓国式四柱命式の比較 ===');
console.log('計算結果:');
console.log("\u5E74\u67F1: ".concat(yearPillar.fullStemBranch));
console.log("\u6708\u67F1: ".concat(monthPillar1.fullStemBranch));
console.log("\u65E5\u67F1: ".concat(dayPillar.fullStemBranch));
console.log("\u6642\u67F1: ".concat(hourPillar.fullStemBranch));
console.log('\n韓国式からの引用:');
console.log('년주: 병인(丙寅)');
console.log('월주: 계사(癸巳)');
console.log('일주: 경오(庚午)');
console.log('시주: 기묘(己卯)');
