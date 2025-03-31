"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 韓国式四柱推命計算システム 統合テスト
 */
var sajuCalculator_1 = require("./sajuCalculator");
/**
 * テスト日時のサンプル
 */
var TEST_DATES = [
    {
        description: "1986年5月26日 5時",
        date: new Date(1986, 4, 26),
        hour: 5,
        gender: 'M'
    },
    {
        description: "1990年10月10日 12時",
        date: new Date(1990, 9, 10),
        hour: 12,
        gender: 'F'
    },
    {
        description: "2023年10月15日 12時",
        date: new Date(2023, 9, 15),
        hour: 12,
        gender: 'M'
    },
    {
        description: "2023年10月2日 0時",
        date: new Date(2023, 9, 2),
        hour: 0,
        gender: 'F'
    },
    {
        description: "現在の日時",
        date: new Date(),
        hour: new Date().getHours(),
        gender: 'M'
    }
];
/**
 * 四柱推命計算テスト
 */
function testSajuCalculation() {
    var _a, _b;
    console.log('=== 韓国式四柱推命計算システム 統合テスト ===\n');
    for (var _i = 0, TEST_DATES_1 = TEST_DATES; _i < TEST_DATES_1.length; _i++) {
        var test = TEST_DATES_1[_i];
        console.log("\u3010".concat(test.description, "\u3011"));
        console.log("\u65E5\u4ED8: ".concat(test.date.toISOString().split('T')[0], ", \u6642\u9593: ").concat(test.hour, "\u6642, \u6027\u5225: ").concat(test.gender));
        // 四柱推命計算を実行
        var result = sajuCalculator_1.SajuCalculator.calculate(test.date, test.hour, test.gender);
        // 旧暦情報を表示
        if (result.lunarDate) {
            console.log("\u65E7\u66A6: ".concat(result.lunarDate.year, "\u5E74").concat(result.lunarDate.month, "\u6708").concat(result.lunarDate.day, "\u65E5").concat(result.lunarDate.isLeapMonth ? ' (閏月)' : ''));
        }
        else {
            console.log('旧暦: 取得できません');
        }
        // 四柱情報を表示
        console.log('四柱:', "\u5E74\u67F1[".concat(result.fourPillars.yearPillar.fullStemBranch, "] ") +
            "\u6708\u67F1[".concat(result.fourPillars.monthPillar.fullStemBranch, "] ") +
            "\u65E5\u67F1[".concat(result.fourPillars.dayPillar.fullStemBranch, "] ") +
            "\u6642\u67F1[".concat(result.fourPillars.hourPillar.fullStemBranch, "]"));
        // 蔵干（隠れた天干）を表示
        console.log('蔵干:', "\u5E74\u652F[".concat(result.fourPillars.yearPillar.branch, "]: ").concat(((_a = result.fourPillars.yearPillar.hiddenStems) === null || _a === void 0 ? void 0 : _a.join(', ')) || 'なし', ", ") +
            "\u65E5\u652F[".concat(result.fourPillars.dayPillar.branch, "]: ").concat(((_b = result.fourPillars.dayPillar.hiddenStems) === null || _b === void 0 ? void 0 : _b.join(', ')) || 'なし'));
        // 五行属性を表示
        console.log('五行属性:', "".concat(result.elementProfile.yinYang).concat(result.elementProfile.mainElement, "(\u4E3B)"), "/ ".concat(result.elementProfile.secondaryElement, "(\u526F)"));
        // 十神関係を表示
        console.log('十神関係:');
        Object.entries(result.tenGods).forEach(function (_a) {
            var pillar = _a[0], god = _a[1];
            console.log("  ".concat(pillar, ": ").concat(god));
        });
        // 十二運星・十二神殺を表示（オプション）
        if (result.twelveFortunes) {
            console.log('十二運星:');
            Object.entries(result.twelveFortunes).forEach(function (_a) {
                var branch = _a[0], fortune = _a[1];
                console.log("  ".concat(branch, ": ").concat(fortune));
            });
        }
        if (result.twelveSpirits) {
            console.log('十二神殺:');
            Object.entries(result.twelveSpirits).forEach(function (_a) {
                var branch = _a[0], spirit = _a[1];
                console.log("  ".concat(branch, ": ").concat(spirit));
            });
        }
        console.log('\n---\n');
    }
    console.log('テスト完了');
}
// テスト実行
testSajuCalculation();
// このファイルを直接実行した場合のみテストを実行
if (require.main === module) {
    testSajuCalculation();
}
