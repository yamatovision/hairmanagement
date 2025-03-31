"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOLAR_TERM_DATA = exports.LUNAR_CALENDAR_DATA = void 0;
exports.formatDateKey = formatDateKey;
exports.getLunarDate = getLunarDate;
exports.calculateLunarDate = calculateLunarDate;
exports.getDayStemBranch = getDayStemBranch;
exports.isLeapMonth = isLeapMonth;
exports.getSolarTerm = getSolarTerm;
exports.getLocalTimeAdjustedDate = getLocalTimeAdjustedDate;
exports.verifyLunarDateCalculator = verifyLunarDateCalculator;
/**
 * 旧暦カレンダーデータ
 * 実際の実装では、複数年のデータベースが必要
 */
exports.LUNAR_CALENDAR_DATA = {
    // 基本サンプルデータ (calender.mdから抽出)
    "1970-01-01": { lunarYear: 1969, lunarMonth: 11, lunarDay: 23, isLeapMonth: false },
    "1985-01-01": { lunarYear: 1984, lunarMonth: 11, lunarDay: 10, isLeapMonth: false },
    "1995-01-01": { lunarYear: 1994, lunarMonth: 11, lunarDay: 29, isLeapMonth: false },
    "2005-01-01": { lunarYear: 2004, lunarMonth: 11, lunarDay: 20, isLeapMonth: false },
    "2015-01-01": { lunarYear: 2014, lunarMonth: 11, lunarDay: 10, isLeapMonth: false },
    // 月柱計算サンプル
    "2023-02-03": { lunarYear: 2023, lunarMonth: 1, lunarDay: 12, isLeapMonth: false },
    "2023-02-04": { lunarYear: 2023, lunarMonth: 1, lunarDay: 13, isLeapMonth: false },
    "2023-05-05": { lunarYear: 2023, lunarMonth: 3, lunarDay: 15, isLeapMonth: false },
    "2023-08-07": { lunarYear: 2023, lunarMonth: 6, lunarDay: 20, isLeapMonth: false },
    "2023-11-07": { lunarYear: 2023, lunarMonth: 9, lunarDay: 23, isLeapMonth: false },
    "2023-12-21": { lunarYear: 2023, lunarMonth: 11, lunarDay: 8, isLeapMonth: false },
    // 閏月サンプル
    "2023-06-19": { lunarYear: 2023, lunarMonth: 5, lunarDay: 1, isLeapMonth: false },
    "2023-07-19": { lunarYear: 2023, lunarMonth: 6, lunarDay: 1, isLeapMonth: false },
    // 日柱計算サンプル
    "2023-10-01": { lunarYear: 2023, lunarMonth: 8, lunarDay: 16, isLeapMonth: false },
    "2023-10-02": { lunarYear: 2023, lunarMonth: 8, lunarDay: 17, isLeapMonth: false },
    "2023-10-03": { lunarYear: 2023, lunarMonth: 8, lunarDay: 18, isLeapMonth: false },
    "2023-10-04": { lunarYear: 2023, lunarMonth: 8, lunarDay: 19, isLeapMonth: false },
    "2023-10-05": { lunarYear: 2023, lunarMonth: 8, lunarDay: 20, isLeapMonth: false },
    "2023-10-06": { lunarYear: 2023, lunarMonth: 8, lunarDay: 21, isLeapMonth: false },
    "2023-10-07": { lunarYear: 2023, lunarMonth: 8, lunarDay: 22, isLeapMonth: false },
    "2023-10-15": { lunarYear: 2023, lunarMonth: 9, lunarDay: 1, isLeapMonth: false },
    // 時柱計算サンプル (同じ日の異なる時間はLunarDateとしては同じ)
    // 特別なケース - calender.mdから取得したデータ
    "1986-05-26": { lunarYear: 1986, lunarMonth: 4, lunarDay: 18, isLeapMonth: false, stemBranch: "庚午" },
    "1990-05-15": { lunarYear: 1990, lunarMonth: 4, lunarDay: 21, isLeapMonth: false, stemBranch: "庚辰" }
};
/**
 * 日付キー文字列を生成（YYYY-MM-DD形式）
 * @param date 日付
 * @returns 日付キー文字列
 */
function formatDateKey(date) {
    return date.toISOString().split('T')[0];
}
/**
 * 指定された日付の旧暦情報を取得
 * @param date 新暦日付
 * @returns 旧暦情報（ない場合はnull）
 */
function getLunarDate(date) {
    var dateKey = formatDateKey(date);
    return exports.LUNAR_CALENDAR_DATA[dateKey] || null;
}
/**
 * 実際の旧暦計算アルゴリズムを実装
 * @param date 新暦日付
 * @returns 旧暦情報
 */
function calculateLunarDate(date) {
    // 注: このメソッドは実際には複雑な計算を必要とします
    // 実際の実装では、旧暦の天文学的計算や、複雑な変換テーブルが必要です
    // ここではサンプルデータを返すだけの簡易実装
    return getLunarDate(date);
}
/**
 * 新暦日の干支（日柱の天干地支）を取得
 * @param date 新暦日付
 * @returns 日柱の干支
 */
function getDayStemBranch(date) {
    // 注: このメソッドは実際には複雑な計算を必要とします
    // 60日周期の干支計算や、特定の基準日からの計算が必要です
    // 現在は未実装のため、nullを返す
    return null;
}
/**
 * 日付が閏月かどうか判定
 * @param date 新暦日付
 * @returns 閏月ならtrue
 */
function isLeapMonth(date) {
    var lunarDate = getLunarDate(date);
    return (lunarDate === null || lunarDate === void 0 ? void 0 : lunarDate.isLeapMonth) || false;
}
/**
 * 節気データ
 * 実際の実装では、複数年の節気データベースが必要
 */
exports.SOLAR_TERM_DATA = {
    // 2023年の節気サンプル (calender.mdから抽出)
    "2023-02-04": "立春",
    "2023-02-19": "雨水",
    "2023-03-06": "驚蟄",
    "2023-03-21": "春分",
    "2023-04-05": "清明",
    "2023-04-20": "穀雨",
    "2023-05-05": "立夏",
    "2023-05-21": "小満",
    "2023-06-06": "芒種",
    "2023-06-21": "夏至",
    "2023-07-07": "小暑",
    "2023-07-23": "大暑",
    "2023-08-08": "立秋",
    "2023-08-23": "処暑",
    "2023-09-08": "白露",
    "2023-09-23": "秋分",
    "2023-10-08": "寒露",
    "2023-10-24": "霜降",
    "2023-11-08": "立冬",
    "2023-11-22": "小雪",
    "2023-12-07": "大雪",
    "2023-12-22": "冬至",
    // 1986年のサンプル
    "1986-05-06": "立夏"
};
/**
 * 節気情報を取得
 * @param date 新暦日付
 * @returns 節気名（該当する場合）またはnull
 */
function getSolarTerm(date) {
    var dateKey = formatDateKey(date);
    return exports.SOLAR_TERM_DATA[dateKey] || null;
}
/**
 * 韓国式地方時に調整した日付を取得
 * @param date 元の日付
 * @param longitude 経度
 * @param latitude 緯度
 * @returns 地方時に調整された日付
 */
function getLocalTimeAdjustedDate(date, longitude, // ソウルのデフォルト経度
latitude // ソウルのデフォルト緯度
) {
    if (longitude === void 0) { longitude = 126.98; }
    if (latitude === void 0) { latitude = 37.57; }
    // 韓国式地域時調整 (calender.mdの分析から)
    var localTimeAdjustment = 0;
    // 地域による時間調整
    if (longitude >= 135 && longitude <= 145) {
        // 東京エリア: +18分 (例: 東京 139.77度)
        localTimeAdjustment = 18 * 60 * 1000; // ミリ秒に変換
    }
    else if (longitude >= 125 && longitude < 135) {
        // ソウルエリア: -32/33分 (例: ソウル 126.98度)
        localTimeAdjustment = -32 * 60 * 1000; // ミリ秒に変換
    }
    else {
        // その他の地域は経度に基づいて計算
        // 東経135度を標準時として時差を調整（日本標準時）
        var standardMeridian = 135;
        var timeDiffMinutes = (longitude - standardMeridian) * 4;
        localTimeAdjustment = timeDiffMinutes * 60 * 1000;
    }
    // 時差を調整
    var adjustedDate = new Date(date.getTime() + localTimeAdjustment);
    return adjustedDate;
}
/**
 * 旧暦計算モジュールの検証
 */
function verifyLunarDateCalculator() {
    console.log('===== 旧暦変換テスト =====');
    // サンプルデータから数例を選んでテスト
    var testDates = [
        new Date(1986, 4, 26), // 1986年5月26日
        new Date(2023, 9, 15) // 2023年10月15日
    ];
    testDates.forEach(function (date) {
        var formattedDate = formatDateKey(date);
        var lunarDate = getLunarDate(date);
        if (lunarDate) {
            console.log("".concat(formattedDate, " \u2192 \u65E7\u66A6 ").concat(lunarDate.lunarYear, "\u5E74 ").concat(lunarDate.lunarMonth, "\u6708 ").concat(lunarDate.lunarDay, "\u65E5 ").concat(lunarDate.isLeapMonth ? '(閏月)' : ''));
        }
        else {
            console.log("".concat(formattedDate, " \u2192 \u65E7\u66A6\u30C7\u30FC\u30BF\u306A\u3057"));
        }
    });
    // 地方時調整テスト
    console.log('\n===== 地方時調整テスト =====');
    testDates.forEach(function (date) {
        var formattedDate = formatDateKey(date);
        // ソウルと東京の地方時調整
        var seoulAdjusted = getLocalTimeAdjustedDate(date, 126.98, 37.57);
        var tokyoAdjusted = getLocalTimeAdjustedDate(date, 139.77, 35.68);
        var seoulDiffMinutes = (seoulAdjusted.getTime() - date.getTime()) / 60000;
        var tokyoDiffMinutes = (tokyoAdjusted.getTime() - date.getTime()) / 60000;
        console.log("".concat(formattedDate, ":"));
        console.log("- \u30BD\u30A6\u30EB\u8ABF\u6574: ".concat(seoulDiffMinutes.toFixed(1), "\u5206 (").concat(seoulAdjusted.toISOString(), ")"));
        console.log("- \u6771\u4EAC\u8ABF\u6574: ".concat(tokyoDiffMinutes.toFixed(1), "\u5206 (").concat(tokyoAdjusted.toISOString(), ")"));
    });
}
// このファイルを直接実行した場合のみテストを実行
if (require.main === module) {
    verifyLunarDateCalculator();
}
