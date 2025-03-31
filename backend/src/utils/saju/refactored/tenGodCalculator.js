"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEN_GOD_KR = exports.ELEMENT_CONTROLS = exports.ELEMENT_GENERATES = exports.BRANCH_ELEMENTS = exports.STEM_ELEMENTS = void 0;
exports.getElementFromStem = getElementFromStem;
exports.getElementFromBranch = getElementFromBranch;
exports.isStemYin = isStemYin;
exports.determineTenGodRelation = determineTenGodRelation;
exports.getHiddenStems = getHiddenStems;
exports.calculateTenGods = calculateTenGods;
exports.testTenGods = testTenGods;
/**
 * 天干の五行属性
 */
exports.STEM_ELEMENTS = {
    '甲': '木', '乙': '木',
    '丙': '火', '丁': '火',
    '戊': '土', '己': '土',
    '庚': '金', '辛': '金',
    '壬': '水', '癸': '水'
};
/**
 * 地支の五行属性
 */
exports.BRANCH_ELEMENTS = {
    '子': '水', '丑': '土',
    '寅': '木', '卯': '木',
    '辰': '土', '巳': '火',
    '午': '火', '未': '土',
    '申': '金', '酉': '金',
    '戌': '土', '亥': '水'
};
/**
 * 五行相生関係（生む）
 */
exports.ELEMENT_GENERATES = {
    '木': '火',
    '火': '土',
    '土': '金',
    '金': '水',
    '水': '木'
};
/**
 * 五行相剋関係（克す）
 */
exports.ELEMENT_CONTROLS = {
    '木': '土',
    '土': '水',
    '水': '火',
    '火': '金',
    '金': '木'
};
/**
 * 天干から五行を取得
 * @param stem 天干
 * @returns 五行
 */
function getElementFromStem(stem) {
    return exports.STEM_ELEMENTS[stem] || '不明';
}
/**
 * 地支から五行を取得
 * @param branch 地支
 * @returns 五行
 */
function getElementFromBranch(branch) {
    return exports.BRANCH_ELEMENTS[branch] || '不明';
}
/**
 * 天干が陰性かどうか
 * @param stem 天干
 * @returns 陰性ならtrue
 */
function isStemYin(stem) {
    return ['乙', '丁', '己', '辛', '癸'].includes(stem);
}
/**
 * 通変星関係（十神関係）を判定する
 * @param dayStem 日主（日柱の天干）
 * @param targetStem 比較対象の天干
 * @returns 十神関係
 */
function determineTenGodRelation(dayStem, targetStem) {
    // 日主と対象の陰陽
    var dayYin = isStemYin(dayStem);
    var targetYin = isStemYin(targetStem);
    var sameSex = dayYin === targetYin;
    // 日主と対象の五行
    var dayElement = exports.STEM_ELEMENTS[dayStem];
    var targetElement = exports.STEM_ELEMENTS[targetStem];
    // 1. 同じ五行の場合
    if (dayElement === targetElement) {
        return sameSex ? '比肩' : '劫財';
    }
    // 2. 対象が日主を生む関係
    if (exports.ELEMENT_GENERATES[targetElement] === dayElement) {
        return sameSex ? '偏印' : '正印';
    }
    // 3. 対象が日主を克する関係
    if (exports.ELEMENT_CONTROLS[targetElement] === dayElement) {
        return sameSex ? '偏官' : '正官';
    }
    // 4. 日主が対象を生む関係
    if (exports.ELEMENT_GENERATES[dayElement] === targetElement) {
        return sameSex ? '食神' : '傷官';
    }
    // 5. 日主が対象を克する関係
    if (exports.ELEMENT_CONTROLS[dayElement] === targetElement) {
        return sameSex ? '偏財' : '正財';
    }
    return '不明';
}
/**
 * 天干に対する十神の韓国語名
 */
exports.TEN_GOD_KR = {
    '比肩': '비견',
    '劫財': '겁재',
    '食神': '식신',
    '傷官': '상관',
    '偏財': '편재',
    '正財': '정재',
    '偏官': '편관',
    '正官': '정관',
    '偏印': '편인',
    '正印': '정인'
};
/**
 * 蔵干（地支に内包される天干）を取得
 * @param branch 地支
 * @returns 蔵干の配列
 */
function getHiddenStems(branch) {
    var hiddenStemsMap = {
        '子': ['癸'],
        '丑': ['己', '癸', '辛'],
        '寅': ['甲', '丙', '戊'],
        '卯': ['乙'],
        '辰': ['戊', '乙', '癸'],
        '巳': ['丙', '庚', '戊'],
        '午': ['丁', '己'],
        '未': ['己', '丁', '乙'],
        '申': ['庚', '壬', '戊'],
        '酉': ['辛'],
        '戌': ['戊', '辛', '丁'],
        '亥': ['壬', '甲']
    };
    return hiddenStemsMap[branch] || [];
}
/**
 * 特定の天干と地支の組み合わせに対する十神関係を計算
 * @param dayStem 日主（日柱の天干）
 * @param yearStem 年干
 * @param monthStem 月干
 * @param hourStem 時干
 * @returns 十神関係のマップ
 */
function calculateTenGods(dayStem, yearStem, monthStem, hourStem) {
    return {
        year: determineTenGodRelation(dayStem, yearStem),
        month: determineTenGodRelation(dayStem, monthStem),
        day: '比肩', // 日柱自身は常に比肩
        hour: determineTenGodRelation(dayStem, hourStem)
    };
}
/**
 * 十神関係計算のテスト用関数
 */
function testTenGods() {
    // テスト用の干支組み合わせ
    var testCases = [
        {
            description: "1986年5月26日5時（庚午日）",
            dayStem: "庚", yearStem: "丙", monthStem: "癸", hourStem: "己"
        },
        {
            description: "2023年10月15日12時（丙午日）",
            dayStem: "丙", yearStem: "癸", monthStem: "壬", hourStem: "甲"
        }
    ];
    for (var _i = 0, testCases_1 = testCases; _i < testCases_1.length; _i++) {
        var _a = testCases_1[_i], description = _a.description, dayStem = _a.dayStem, yearStem = _a.yearStem, monthStem = _a.monthStem, hourStem = _a.hourStem;
        console.log("".concat(description, "\u306E\u5341\u795E\u95A2\u4FC2:"));
        var tenGods = calculateTenGods(dayStem, yearStem, monthStem, hourStem);
        Object.entries(tenGods).forEach(function (_a) {
            var pillar = _a[0], god = _a[1];
            console.log("".concat(pillar, "\u67F1: ").concat(god, " (").concat(exports.TEN_GOD_KR[god] || '不明', ")"));
        });
        console.log('---');
    }
}
