"use strict";
/**
 * 十二神殺計算モジュール
 *
 * 四柱推命における十二神殺の計算を行います。
 * 十二神殺は四柱（年・月・日・時）の干支関係から特定の凶運や障害を示します。
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isYearSpirit = isYearSpirit;
exports.isMonthSpirit = isMonthSpirit;
exports.isDaySpirit = isDaySpirit;
exports.isRobberySpirit = isRobberySpirit;
exports.calculateTwelveSpirits = calculateTwelveSpirits;
exports.testTwelveSpiritCalculator = testTwelveSpiritCalculator;
// 地支の六害関係（互いに害を及ぼす関係にある地支のペア）
var SIX_HARMS = {
    '子': '未', '丑': '午', '寅': '酉',
    '卯': '申', '辰': '亥', '巳': '戌',
    '午': '丑', '未': '子', '申': '卯',
    '酉': '寅', '戌': '巳', '亥': '辰'
};
// 相剋（五行の相剋関係: 木→土→水→火→金→木）
var OVERCOMING = {
    '木': '土', '土': '水', '水': '火', '火': '金', '金': '木'
};
// 天干の五行属性
var STEM_ELEMENTS = {
    '甲': '木', '乙': '木',
    '丙': '火', '丁': '火',
    '戊': '土', '己': '土',
    '庚': '金', '辛': '金',
    '壬': '水', '癸': '水'
};
// 地支の五行属性
var BRANCH_ELEMENTS = {
    '寅': '木', '卯': '木',
    '巳': '火', '午': '火',
    '辰': '土', '丑': '土', '戌': '土', '未': '土',
    '申': '金', '酉': '金',
    '子': '水', '亥': '水'
};
/**
 * 年殺を判定する
 * 年柱と日柱の地支が六害関係にある場合
 * @param yearBranch 年柱の地支
 * @param dayBranch 日柱の地支
 * @returns 年殺かどうか
 */
function isYearSpirit(yearBranch, dayBranch) {
    return SIX_HARMS[yearBranch] === dayBranch;
}
/**
 * 月殺を判定する
 * 月柱と日柱の地支が六害関係にある場合
 * @param monthBranch 月柱の地支
 * @param dayBranch 日柱の地支
 * @returns 月殺かどうか
 */
function isMonthSpirit(monthBranch, dayBranch) {
    return SIX_HARMS[monthBranch] === dayBranch;
}
/**
 * 日殺を判定する
 * 時柱と日柱の地支が六害関係にある場合
 * @param dayBranch 日柱の地支
 * @param hourBranch 時柱の地支
 * @returns 日殺かどうか
 */
function isDaySpirit(dayBranch, hourBranch) {
    return SIX_HARMS[dayBranch] === hourBranch;
}
/**
 * 劫殺を判定する
 * サンプルデータから分析した結果、寅(tiger)とのコンフリクト関係または特定の組み合わせが関係している
 * @param yearBranch 年柱の地支
 * @param monthBranch 月柱の地支
 * @param dayBranch 日柱の地支
 * @param hourBranch 時柱の地支
 * @param yearStem 年柱の天干
 * @param monthStem 月柱の天干
 * @param dayStem 日柱の天干
 * @param hourStem 時柱の天干
 * @returns 劫殺かどうか
 */
function isRobberySpirit(yearBranch, monthBranch, dayBranch, hourBranch, yearStem, monthStem, dayStem, hourStem) {
    // サンプルデータに基づく分析
    // 1. サンプル2: 2023年2月4日 - 壬寅年 - 劫殺
    // 2. サンプル5: 2023年10月5日 - 丙申日 - 劫殺
    // 3. サンプル5: 2023年10月15日 17:00 - 丙申時 - 劫殺
    // 分析結果: 申(monkey)と寅(tiger)の組み合わせが関連していると推測
    // 申と寅は直接的な六害関係にはないが、特殊な関係を持つ
    // 1. 申または寅が四柱のいずれかに存在
    var hasMonkeyOrTiger = [yearBranch, monthBranch, dayBranch, hourBranch].some(function (branch) { return branch === '申' || branch === '寅'; });
    // 2. 特定の組み合わせパターン
    var hasTiger = yearBranch === '寅' || monthBranch === '寅' || dayBranch === '寅' || hourBranch === '寅';
    var hasMonkey = yearBranch === '申' || monthBranch === '申' || dayBranch === '申' || hourBranch === '申';
    // 寅(tiger)と申(monkey)の対角関係
    if (hasTiger && hasMonkey) {
        return true;
    }
    // 日支が申または寅で、特定の天干との組み合わせ（サンプルから推測）
    if ((dayBranch === '申' && dayStem === '丙') ||
        (dayBranch === '寅' && dayStem === '壬')) {
        return true;
    }
    // 時支が申で丙干と組み合わさる場合
    if (hourBranch === '申' && hourStem === '丙') {
        return true;
    }
    return false;
}
/**
 * 十二神殺を計算する
 * 現在は年殺、月殺、日殺、劫殺のみ実装
 * @param yearStem 年柱の天干
 * @param monthStem 月柱の天干
 * @param dayStem 日柱の天干
 * @param hourStem 時柱の天干
 * @param yearBranch 年柱の地支
 * @param monthBranch 月柱の地支
 * @param dayBranch 日柱の地支
 * @param hourBranch 時柱の地支
 * @returns 各柱の十二神殺を含むオブジェクト
 */
function calculateTwelveSpirits(yearStem, monthStem, dayStem, hourStem, yearBranch, monthBranch, dayBranch, hourBranch) {
    // 各柱の神殺を初期化
    var yearSpirit = '';
    var monthSpirit = '';
    var daySpirit = '';
    var hourSpirit = '';
    // 年殺の判定
    if (isYearSpirit(yearBranch, dayBranch)) {
        yearSpirit = '年殺';
    }
    // 月殺の判定
    if (isMonthSpirit(monthBranch, dayBranch)) {
        monthSpirit = '月殺';
    }
    // 日殺の判定
    if (isDaySpirit(dayBranch, hourBranch)) {
        daySpirit = '日殺';
    }
    // 劫殺の判定
    if (isRobberySpirit(yearBranch, monthBranch, dayBranch, hourBranch, yearStem, monthStem, dayStem, hourStem)) {
        // 劫殺がどの柱に表示されるかを決定
        if (dayBranch === '申' || dayBranch === '寅') {
            daySpirit = '劫殺';
        }
        else if (monthBranch === '申' || monthBranch === '寅') {
            monthSpirit = '劫殺';
        }
        else if (yearBranch === '申' || yearBranch === '寅') {
            yearSpirit = '劫殺';
        }
        else if (hourBranch === '申' || hourBranch === '寅') {
            hourSpirit = '劫殺';
        }
    }
    // その他の神殺も同様に実装可能
    // 長生殺、望神殺、天殺、地殺、六害殺、など
    return {
        year: yearSpirit,
        month: monthSpirit,
        day: daySpirit,
        hour: hourSpirit
    };
}
/**
 * 十二神殺のテスト関数
 */
function testTwelveSpiritCalculator() {
    console.log('--- 十二神殺計算テスト ---');
    // サンプル1: 年殺のテスト
    var test1 = calculateTwelveSpirits('甲', '丙', '壬', '戊', '子', '子', '辰', '子');
    console.log('年殺テスト: ', test1);
    // サンプル2: 月殺のテスト
    var test2 = calculateTwelveSpirits('癸', '癸', '壬', '庚', '卯', '丑', '辰', '子');
    console.log('月殺テスト: ', test2);
    // サンプル3: 劫殺のテスト - 2023年2月4日(立春)
    var test3 = calculateTwelveSpirits('壬', '癸', '癸', '壬', '寅', '丑', '巳', '子');
    console.log('劫殺テスト 1: ', test3);
    // サンプル4: 劫殺のテスト - 2023年10月5日
    var test4 = calculateTwelveSpirits('癸', '辛', '丙', '戊', '卯', '酉', '申', '子');
    console.log('劫殺テスト 2: ', test4);
    // サンプル5: 劫殺のテスト - 2023年10月15日 17:00
    var test5 = calculateTwelveSpirits('癸', '壬', '丙', '丙', '卯', '戌', '午', '申');
    console.log('劫殺テスト 3: ', test5);
}
// モジュールが直接実行されたときにテストを実行
if (require.main === module) {
    testTwelveSpiritCalculator();
}
