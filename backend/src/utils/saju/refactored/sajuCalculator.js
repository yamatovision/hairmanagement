"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SajuCalculator = void 0;
exports.testSajuCalculator = testSajuCalculator;
var koreanYearPillarCalculator_1 = require("./koreanYearPillarCalculator");
var koreanMonthPillarCalculator_1 = require("./koreanMonthPillarCalculator");
var dayPillarCalculator_1 = require("./dayPillarCalculator");
var hourPillarCalculator_1 = require("./hourPillarCalculator");
var tenGodCalculator_1 = require("./tenGodCalculator");
var twelveFortuneSpiritCalculator_1 = require("./twelveFortuneSpiritCalculator");
var lunarDateCalculator_1 = require("./lunarDateCalculator");
/**
 * 四柱推命計算クラス
 */
var SajuCalculator = /** @class */ (function () {
    function SajuCalculator() {
    }
    /**
     * 生年月日時から四柱推命情報を計算する
     * @param birthDate 生年月日
     * @param birthHour 生まれた時間（0-23）
     * @param gender 性別（'M'=男性, 'F'=女性）
     * @param location 位置情報（経度・緯度）
     * @returns 四柱推命計算結果
     */
    SajuCalculator.calculate = function (birthDate, birthHour, gender, location // デフォルトは東京
    ) {
        if (location === void 0) { location = { longitude: 139.7671, latitude: 35.6812 }; }
        // オプション設定
        var options = {
            gender: gender,
            useLocalTime: true,
            location: location
        };
        // 地方時に調整
        var adjustedDate = (0, dayPillarCalculator_1.getLocalTimeAdjustedDate)(birthDate, options);
        // 旧暦（陰暦）情報を取得
        var lunarDate = (0, lunarDateCalculator_1.getLunarDate)(adjustedDate);
        // 1. 年柱を計算 - 韓国式
        var yearPillar = (0, koreanYearPillarCalculator_1.calculateKoreanYearPillar)(adjustedDate.getFullYear());
        // 2. 日柱を計算 - 韓国式
        var dayPillar = (0, dayPillarCalculator_1.calculateKoreanDayPillar)(adjustedDate, options);
        // 3. 月柱を計算 - 韓国式
        var monthPillar = (0, koreanMonthPillarCalculator_1.calculateKoreanMonthPillar)(adjustedDate, yearPillar.stem, { useSolarTerms: true });
        // 4. 時柱を計算 - 韓国式
        var hourPillar = (0, hourPillarCalculator_1.calculateKoreanHourPillar)(birthHour, dayPillar.stem);
        // 四柱情報を構築
        var fourPillars = {
            yearPillar: yearPillar,
            monthPillar: monthPillar,
            dayPillar: dayPillar,
            hourPillar: hourPillar
        };
        // 5. 十神関係を計算
        var tenGods = (0, tenGodCalculator_1.calculateTenGods)(dayPillar.stem, yearPillar.stem, monthPillar.stem, hourPillar.stem);
        // 6. 日柱から五行属性プロファイルを計算
        var elementProfile = this.calculateElementalProfile(dayPillar, monthPillar);
        // 7. 十二運星と十二神殺を計算（オプション）
        var twelveFortunes = (0, twelveFortuneSpiritCalculator_1.calculateTwelveFortunes)(dayPillar.stem, yearPillar.branch, monthPillar.branch, dayPillar.branch, hourPillar.branch, birthDate, birthHour);
        var twelveSpirits = (0, twelveFortuneSpiritCalculator_1.calculateTwelveSpirits)(yearPillar.branch, monthPillar.branch, dayPillar.branch, hourPillar.branch, birthDate, birthHour);
        // 結果をまとめて返す
        return {
            fourPillars: fourPillars,
            lunarDate: lunarDate ? {
                year: lunarDate.lunarYear,
                month: lunarDate.lunarMonth,
                day: lunarDate.lunarDay,
                isLeapMonth: lunarDate.isLeapMonth
            } : undefined,
            tenGods: tenGods,
            elementProfile: elementProfile,
            twelveFortunes: twelveFortunes,
            twelveSpirits: twelveSpirits
        };
    };
    /**
     * 四柱から五行プロファイルを導出
     * @param dayPillar 日柱
     * @param monthPillar 月柱
     * @returns 五行プロファイル
     */
    SajuCalculator.calculateElementalProfile = function (dayPillar, monthPillar) {
        // 日柱から主要な五行属性を取得
        var mainElement = (0, tenGodCalculator_1.getElementFromStem)(dayPillar.stem);
        // 月柱から副次的な五行属性を取得
        var secondaryElement = (0, tenGodCalculator_1.getElementFromStem)(monthPillar.stem);
        // 日主の陰陽を取得
        var yinYang = (0, tenGodCalculator_1.isStemYin)(dayPillar.stem) ? '陰' : '陽';
        return {
            mainElement: mainElement,
            secondaryElement: secondaryElement,
            yinYang: yinYang
        };
    };
    /**
     * 現在の日の四柱情報を取得
     * @returns 今日の四柱情報
     */
    SajuCalculator.getTodayFourPillars = function () {
        var now = new Date();
        var hour = now.getHours();
        // 計算結果から四柱のみを取得
        var result = this.calculate(now, hour);
        return result.fourPillars;
    };
    /**
     * 指定した日付のサンプルデータと比較検証
     * @param date 検証する日付
     * @param hour 検証する時間
     * @returns 検証結果と詳細
     */
    SajuCalculator.verifySampleData = function (date, hour) {
        // 計算結果
        var result = this.calculate(date, hour);
        // サンプルデータから期待される値
        // 実際のサンプルがあれば、それを参照するように修正
        var expected = {
            yearPillar: "丙寅", // 例: 1986年
            monthPillar: "乙巳", // 例: 5月
            dayPillar: "庚午", // 例: 26日
            hourPillar: "己卯" // 例: 5時
        };
        // 検証
        var details = {
            yearPillar: {
                expected: expected.yearPillar,
                actual: result.fourPillars.yearPillar.fullStemBranch,
                passed: result.fourPillars.yearPillar.fullStemBranch === expected.yearPillar
            },
            monthPillar: {
                expected: expected.monthPillar,
                actual: result.fourPillars.monthPillar.fullStemBranch,
                passed: result.fourPillars.monthPillar.fullStemBranch === expected.monthPillar
            },
            dayPillar: {
                expected: expected.dayPillar,
                actual: result.fourPillars.dayPillar.fullStemBranch,
                passed: result.fourPillars.dayPillar.fullStemBranch === expected.dayPillar
            },
            hourPillar: {
                expected: expected.hourPillar,
                actual: result.fourPillars.hourPillar.fullStemBranch,
                passed: result.fourPillars.hourPillar.fullStemBranch === expected.hourPillar
            }
        };
        // 全て合格したか
        var passed = Object.values(details).every(function (item) { return item.passed; });
        return { passed: passed, details: details };
    };
    return SajuCalculator;
}());
exports.SajuCalculator = SajuCalculator;
/**
 * 四柱推命計算テスト関数
 */
function testSajuCalculator() {
    // テスト用の日付
    var testCases = [
        {
            description: "1986年5月26日5時",
            date: new Date(1986, 4, 26),
            hour: 5,
            expected: {
                yearPillar: "丙寅",
                monthPillar: "乙巳",
                dayPillar: "庚午",
                hourPillar: "丙寅"
            }
        },
        {
            description: "2023年10月15日12時",
            date: new Date(2023, 9, 15),
            hour: 12,
            expected: {
                yearPillar: "癸卯",
                monthPillar: "辛酉",
                dayPillar: "丙午",
                hourPillar: "甲午"
            }
        }
    ];
    for (var _i = 0, testCases_1 = testCases; _i < testCases_1.length; _i++) {
        var _a = testCases_1[_i], description = _a.description, date = _a.date, hour = _a.hour, expected = _a.expected;
        console.log("\u3010\u30C6\u30B9\u30C8\u3011".concat(description, "\u306E\u56DB\u67F1\u63A8\u547D\u8A08\u7B97:"));
        // 韓国式四柱推命計算
        var result = SajuCalculator.calculate(date, hour);
        // 旧暦情報表示
        if (result.lunarDate) {
            console.log("\u65E7\u66A6: ".concat(result.lunarDate.year, "\u5E74").concat(result.lunarDate.month, "\u6708").concat(result.lunarDate.day, "\u65E5").concat(result.lunarDate.isLeapMonth ? ' (閏月)' : ''));
        }
        // 四柱情報表示
        console.log('四柱:', formatFourPillars(result.fourPillars));
        // 期待値との比較
        var verificationResults = [
            {
                name: '年柱',
                expected: expected.yearPillar,
                actual: result.fourPillars.yearPillar.fullStemBranch,
                passed: result.fourPillars.yearPillar.fullStemBranch === expected.yearPillar
            },
            {
                name: '月柱',
                expected: expected.monthPillar,
                actual: result.fourPillars.monthPillar.fullStemBranch,
                passed: result.fourPillars.monthPillar.fullStemBranch === expected.monthPillar
            },
            {
                name: '日柱',
                expected: expected.dayPillar,
                actual: result.fourPillars.dayPillar.fullStemBranch,
                passed: result.fourPillars.dayPillar.fullStemBranch === expected.dayPillar
            },
            {
                name: '時柱',
                expected: expected.hourPillar,
                actual: result.fourPillars.hourPillar.fullStemBranch,
                passed: result.fourPillars.hourPillar.fullStemBranch === expected.hourPillar
            }
        ];
        console.log('検証結果:');
        for (var _b = 0, verificationResults_1 = verificationResults; _b < verificationResults_1.length; _b++) {
            var item = verificationResults_1[_b];
            var mark = item.passed ? '✓' : '✗';
            console.log("  ".concat(mark, " ").concat(item.name, ": \u671F\u5F85\u5024[").concat(item.expected, "] \u5B9F\u969B[").concat(item.actual, "]"));
        }
        // 五行属性表示
        console.log('五行属性:', "".concat(result.elementProfile.yinYang).concat(result.elementProfile.mainElement, "(\u4E3B)"), "/ ".concat(result.elementProfile.secondaryElement, "(\u526F)"));
        // 十神関係表示
        console.log('十神関係:');
        Object.entries(result.tenGods).forEach(function (_a) {
            var pillar = _a[0], god = _a[1];
            console.log("  ".concat(pillar, ": ").concat(god));
        });
        console.log('---\n');
    }
    // 現在の四柱情報も表示
    console.log('【現在の四柱情報】');
    var todayPillars = SajuCalculator.getTodayFourPillars();
    console.log(formatFourPillars(todayPillars));
}
/**
 * 四柱を文字列表現に整形
 */
function formatFourPillars(fourPillars) {
    return "\u5E74\u67F1[".concat(fourPillars.yearPillar.fullStemBranch, "] ") +
        "\u6708\u67F1[".concat(fourPillars.monthPillar.fullStemBranch, "] ") +
        "\u65E5\u67F1[".concat(fourPillars.dayPillar.fullStemBranch, "] ") +
        "\u6642\u67F1[".concat(fourPillars.hourPillar.fullStemBranch, "]");
}
