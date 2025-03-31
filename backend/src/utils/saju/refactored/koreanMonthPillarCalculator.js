"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMonthStemBaseIndex = getMonthStemBaseIndex;
exports.calculateKoreanMonthPillar = calculateKoreanMonthPillar;
exports.verifyKoreanMonthPillarCalculation = verifyKoreanMonthPillarCalculation;
exports.runKoreanMonthPillarTest = runKoreanMonthPillarTest;
/**
 * 韓国式四柱推命 - 月柱計算モジュール (一般アルゴリズム)
 * calender.mdのサンプルデータを分析して抽出したアルゴリズム
 */
var types_1 = require("./types");
var lunarDateCalculator_1 = require("./lunarDateCalculator");
/**
 * 年干インデックスから月干の基準インデックスを計算
 * @param yearStemIndex 年干のインデックス
 * @returns 月干の基準インデックス
 */
function getMonthStemBaseIndex(yearStemIndex) {
    // 年干に基づく月干の基準値
    // 甲己年は甲(0)から、乙庚年は丙(2)から、丙辛年は戊(4)から、丁壬年は庚(6)から、戊癸年は壬(8)から
    var yearGroup = yearStemIndex % 5; // 5種類の年干グループに分類
    // 年干グループごとの月干基準値
    var monthStemBaseIndices = [0, 2, 4, 6, 8];
    return monthStemBaseIndices[yearGroup];
}
/**
 * 韓国式月柱計算 - サンプルデータから抽出した一般アルゴリズム
 * @param date 日付
 * @param yearStem 年干
 * @param options 計算オプション
 * @returns 月柱情報
 */
function calculateKoreanMonthPillar(date, yearStem, options) {
    if (options === void 0) { options = {}; }
    // 旧暦情報を取得
    var lunarDate = (0, lunarDateCalculator_1.getLunarDate)(date);
    // 旧暦月の取得（または新暦月）
    var lunarMonth;
    if (lunarDate && options.useSolarTerms !== false) {
        // 旧暦情報が利用可能で、かつ節気を使用する場合
        lunarMonth = lunarDate.lunarMonth;
    }
    else {
        // 旧暦情報がない場合や節気を使用しない場合は新暦月を使用
        lunarMonth = date.getMonth() + 1; // 0-indexed to 1-indexed
    }
    // 年干に基づく月干の計算
    var yearStemIndex = types_1.STEMS.indexOf(yearStem);
    // 年干グループに基づく月干の基準インデックス
    var monthStemBaseIndex = getMonthStemBaseIndex(yearStemIndex);
    // 月干インデックスの計算（月ごとに2ずつ増加）
    var monthStemIndex = (monthStemBaseIndex + ((lunarMonth - 1) * 2) % 10) % 10;
    // 月支インデックスの計算（寅(2)月から始まる）
    // 1月→寅(2), 2月→卯(3), ..., 12月→丑(1)
    var monthBranchIndex = ((lunarMonth + 1) % 12);
    var stem = types_1.STEMS[monthStemIndex];
    var branch = types_1.BRANCHES[monthBranchIndex];
    return {
        stem: stem,
        branch: branch,
        fullStemBranch: "".concat(stem).concat(branch)
    };
}
/**
 * サンプルデータを使って月柱計算を検証
 * @returns 検証結果
 */
function verifyKoreanMonthPillarCalculation() {
    // サンプルデータ - calender.mdから抽出した月柱サンプル
    var samples = [
        {
            date: new Date(2023, 1, 3), // 2月3日（節分前）
            yearStem: "癸",
            expected: "癸丑"
        },
        {
            date: new Date(2023, 1, 4), // 2月4日（立春）
            yearStem: "癸",
            expected: "癸卯"
        },
        {
            date: new Date(2023, 4, 5), // 5月5日（立夏前）
            yearStem: "癸",
            expected: "丙辰"
        },
        {
            date: new Date(2023, 7, 7), // 8月7日（立秋前）
            yearStem: "癸",
            expected: "己未"
        },
        {
            date: new Date(2023, 10, 7), // 11月7日（立冬前）
            yearStem: "癸",
            expected: "壬戌"
        },
        {
            date: new Date(2023, 11, 21), // 12月21日（冬至）
            yearStem: "癸",
            expected: "甲子"
        }
    ];
    // 閏月のサンプル
    var leapMonthSamples = [
        {
            date: new Date(2023, 5, 19), // 6月19日（旧暦閏4月）
            yearStem: "癸",
            expected: "戊午"
        },
        {
            date: new Date(2023, 6, 19), // 7月19日（閏月の翌月）
            yearStem: "癸",
            expected: "己未"
        }
    ];
    var results = [];
    var allCorrect = true;
    // サンプルデータの検証
    console.log('===== 韓国式月柱計算検証 - 基本サンプル =====');
    samples.forEach(function (sample) {
        var calculated = calculateKoreanMonthPillar(sample.date, sample.yearStem);
        var isCorrect = calculated.fullStemBranch === sample.expected;
        if (!isCorrect)
            allCorrect = false;
        var formattedDate = "".concat(sample.date.getFullYear(), "/").concat((sample.date.getMonth() + 1).toString().padStart(2, '0'), "/").concat(sample.date.getDate().toString().padStart(2, '0'));
        results.push({
            date: formattedDate,
            yearStem: sample.yearStem,
            expected: sample.expected,
            calculated: calculated.fullStemBranch,
            correct: isCorrect
        });
        console.log("".concat(formattedDate, ": \u5E74\u5E72[").concat(sample.yearStem, "] \u671F\u5F85\u5024[").concat(sample.expected, "] \u8A08\u7B97\u5024[").concat(calculated.fullStemBranch, "] - ").concat(isCorrect ? '✓' : '✗'));
    });
    // 閏月サンプルの検証
    console.log('\n===== 韓国式月柱計算検証 - 閏月サンプル =====');
    leapMonthSamples.forEach(function (sample) {
        var calculated = calculateKoreanMonthPillar(sample.date, sample.yearStem);
        var isCorrect = calculated.fullStemBranch === sample.expected;
        if (!isCorrect)
            allCorrect = false;
        var formattedDate = "".concat(sample.date.getFullYear(), "/").concat((sample.date.getMonth() + 1).toString().padStart(2, '0'), "/").concat(sample.date.getDate().toString().padStart(2, '0'));
        results.push({
            date: formattedDate,
            yearStem: sample.yearStem,
            expected: sample.expected,
            calculated: calculated.fullStemBranch,
            correct: isCorrect
        });
        console.log("".concat(formattedDate, ": \u5E74\u5E72[").concat(sample.yearStem, "] \u671F\u5F85\u5024[").concat(sample.expected, "] \u8A08\u7B97\u5024[").concat(calculated.fullStemBranch, "] - ").concat(isCorrect ? '✓' : '✗'));
    });
    // アルゴリズム説明
    console.log('\n===== 韓国式月柱計算アルゴリズム =====');
    console.log('抽出したアルゴリズム:');
    console.log('1. 年干に基づいて月干の基準インデックスを決定:');
    console.log('   - 甲己年は甲(0)から、乙庚年は丙(2)から、丙辛年は戊(4)から、丁壬年は庚(6)から、戊癸年は壬(8)から');
    console.log('2. 月干インデックス: (基準インデックス + (旧暦月-1) * 2) % 10');
    console.log('3. 月支インデックス: (旧暦月 + 1) % 12 （1月→寅(2), 2月→卯(3), ...）');
    return {
        success: allCorrect,
        results: results
    };
}
/**
 * 韓国式月柱計算のテスト実行
 */
function runKoreanMonthPillarTest() {
    // 旧暦計算モジュールを初期化
    initializeLunarDateCalculator();
    var verification = verifyKoreanMonthPillarCalculation();
    console.log("\n\u691C\u8A3C\u7D50\u679C: ".concat(verification.success ? '成功' : '失敗'));
    if (!verification.success) {
        console.log('\n失敗したケース:');
        verification.results
            .filter(function (result) { return !result.correct; })
            .forEach(function (result) {
            console.log("- ".concat(result.date, ": \u671F\u5F85\u5024[").concat(result.expected, "] \u8A08\u7B97\u5024[").concat(result.calculated, "]"));
        });
        console.log('\n注意: 現時点では旧暦データが不足しているため、計算結果が異なる可能性があります。');
        console.log('実際の韓国式四柱推命では、旧暦や節気情報に基づいて月柱を計算します。');
    }
}
/**
 * 旧暦計算モジュールを初期化
 * （実際には旧暦データベースや計算ロジックが必要）
 */
function initializeLunarDateCalculator() {
    // ここに旧暦計算モジュールの初期化コードを実装
    // この関数はモック実装のみ
}
// このファイルを直接実行した場合のみテストを実行
if (require.main === module) {
    runKoreanMonthPillarTest();
}
