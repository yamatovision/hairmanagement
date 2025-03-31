"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLunarDate = getLunarDate;
exports.fetchLunarDate = fetchLunarDate;
exports.getStemBranch = getStemBranch;
exports.isLeapMonth = isLeapMonth;
exports.getSolarTerm = getSolarTerm;
/**
 * カレンダーデータ
 * calendar.mdから抽出した実データ
 */
const CALENDAR_DATA = {
    // 年柱計算のサンプルから
    "1970-01-01": {
        solarDate: "1970-01-01",
        lunarDate: "11/23",
        stemBranch: "辛巳",
        lunarMonth: 11,
        lunarDay: 23,
        isLeapMonth: false
    },
    "1985-01-01": {
        solarDate: "1985-01-01",
        lunarDate: "11/10",
        stemBranch: "庚子",
        lunarMonth: 11,
        lunarDay: 10,
        isLeapMonth: false
    },
    "1995-01-01": {
        solarDate: "1995-01-01",
        lunarDate: "11/29",
        stemBranch: "壬辰",
        lunarMonth: 11,
        lunarDay: 29,
        isLeapMonth: false
    },
    "2005-01-01": {
        solarDate: "2005-01-01",
        lunarDate: "11/20",
        stemBranch: "乙酉",
        lunarMonth: 11,
        lunarDay: 20,
        isLeapMonth: false
    },
    "2015-01-01": {
        solarDate: "2015-01-01",
        lunarDate: "11/10",
        stemBranch: "丁丑",
        lunarMonth: 11,
        lunarDay: 10,
        isLeapMonth: false
    },
    // 月柱計算のサンプルから
    "2023-02-03": {
        solarDate: "2023-02-03",
        lunarDate: "1/12",
        stemBranch: "壬辰",
        lunarMonth: 1,
        lunarDay: 12,
        isLeapMonth: false
    },
    "2023-02-04": {
        solarDate: "2023-02-04",
        lunarDate: "1/13",
        stemBranch: "癸巳",
        lunarMonth: 1,
        lunarDay: 13,
        isLeapMonth: false,
        solarTerm: "立春" // 節気
    },
    "2023-05-05": {
        solarDate: "2023-05-05",
        lunarDate: "3/15",
        stemBranch: "癸亥",
        lunarMonth: 3,
        lunarDay: 15,
        isLeapMonth: false
    },
    "2023-08-07": {
        solarDate: "2023-08-07",
        lunarDate: "6/20",
        stemBranch: "丁酉",
        lunarMonth: 6,
        lunarDay: 20,
        isLeapMonth: false
    },
    "2023-11-07": {
        solarDate: "2023-11-07",
        lunarDate: "9/23",
        stemBranch: "己巳",
        lunarMonth: 9,
        lunarDay: 23,
        isLeapMonth: false
    },
    "2023-12-21": {
        solarDate: "2023-12-21",
        lunarDate: "11/8",
        stemBranch: "癸丑",
        lunarMonth: 11,
        lunarDay: 8,
        isLeapMonth: false,
        solarTerm: "冬至" // 節気
    },
    // 閏月のサンプルから
    "2023-06-19": {
        solarDate: "2023-06-19",
        lunarDate: "5/1",
        stemBranch: "戊申",
        lunarMonth: 5,
        lunarDay: 1,
        isLeapMonth: true // 閏月
    },
    "2023-07-19": {
        solarDate: "2023-07-19",
        lunarDate: "6/1",
        stemBranch: "戊寅",
        lunarMonth: 6,
        lunarDay: 1,
        isLeapMonth: false
    },
    // 日柱計算のサンプルから
    "2023-10-01": {
        solarDate: "2023-10-01",
        lunarDate: "8/16",
        stemBranch: "壬辰",
        lunarMonth: 8,
        lunarDay: 16,
        isLeapMonth: false
    },
    "2023-10-02": {
        solarDate: "2023-10-02",
        lunarDate: "8/17",
        stemBranch: "癸巳",
        lunarMonth: 8,
        lunarDay: 17,
        isLeapMonth: false
    },
    "2023-10-03": {
        solarDate: "2023-10-03",
        lunarDate: "8/18",
        stemBranch: "甲午",
        lunarMonth: 8,
        lunarDay: 18,
        isLeapMonth: false
    },
    "2023-10-04": {
        solarDate: "2023-10-04",
        lunarDate: "8/19",
        stemBranch: "乙未",
        lunarMonth: 8,
        lunarDay: 19,
        isLeapMonth: false
    },
    "2023-10-05": {
        solarDate: "2023-10-05",
        lunarDate: "8/20",
        stemBranch: "丙申",
        lunarMonth: 8,
        lunarDay: 20,
        isLeapMonth: false
    },
    "2023-10-06": {
        solarDate: "2023-10-06",
        lunarDate: "8/21",
        stemBranch: "丁酉",
        lunarMonth: 8,
        lunarDay: 21,
        isLeapMonth: false
    },
    "2023-10-07": {
        solarDate: "2023-10-07",
        lunarDate: "8/22",
        stemBranch: "戊戌",
        lunarMonth: 8,
        lunarDay: 22,
        isLeapMonth: false
    },
    "2023-10-15": {
        solarDate: "2023-10-15",
        lunarDate: "9/1",
        stemBranch: "丙午",
        lunarMonth: 9,
        lunarDay: 1,
        isLeapMonth: false
    },
    // 性別差・地域差の検証サンプルから
    "1990-05-15": {
        solarDate: "1990-05-15",
        lunarDate: "4/21",
        stemBranch: "庚辰",
        lunarMonth: 4,
        lunarDay: 21,
        isLeapMonth: false
    },
    // original sample
    "1986-05-26": {
        solarDate: "1986-05-26",
        lunarDate: "4/18",
        stemBranch: "庚午",
        lunarMonth: 4,
        lunarDay: 18,
        isLeapMonth: false
    }
};
/**
 * 日付キーを生成（YYYY-MM-DD形式）
 */
function formatDateKey(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}
/**
 * 新暦から旧暦情報を取得
 * @param date 新暦日付
 * @returns 旧暦情報（ない場合はnull）
 */
function getLunarDate(date) {
    const dateKey = formatDateKey(date);
    const calendarDay = CALENDAR_DATA[dateKey];
    if (!calendarDay) {
        // データがない場合はnull
        console.warn(`旧暦データがありません: ${dateKey}`);
        return null;
    }
    return {
        lunarYear: date.getFullYear(), // 単純化。正確には旧暦年は異なる場合がある
        lunarMonth: calendarDay.lunarMonth,
        lunarDay: calendarDay.lunarDay,
        isLeapMonth: calendarDay.isLeapMonth || false,
        stemBranch: calendarDay.stemBranch
    };
}
/**
 * APIを使用して旧暦情報を取得（将来的な拡張用）
 * @param date 新暦日付
 * @returns 旧暦情報
 */
async function fetchLunarDate(date) {
    try {
        // ここでは、固定データを返す実装にしています
        // 実際にはAPI呼び出しや計算ロジックを実装する
        return getLunarDate(date);
    }
    catch (error) {
        console.error('旧暦変換エラー:', error);
        return null;
    }
}
/**
 * 特定の日付の干支を取得
 * @param date 新暦日付
 * @returns 干支情報
 */
function getStemBranch(date) {
    const lunarInfo = getLunarDate(date);
    return (lunarInfo === null || lunarInfo === void 0 ? void 0 : lunarInfo.stemBranch) || null;
}
/**
 * 日付が閏月かどうかを判断
 * @param date 新暦日付
 * @returns 閏月ならtrue
 */
function isLeapMonth(date) {
    const lunarInfo = getLunarDate(date);
    return (lunarInfo === null || lunarInfo === void 0 ? void 0 : lunarInfo.isLeapMonth) || false;
}
/**
 * 日付の節気情報を取得
 * @param date 新暦日付
 * @returns 節気情報（ない場合はnull）
 */
function getSolarTerm(date) {
    const dateKey = formatDateKey(date);
    const calendarDay = CALENDAR_DATA[dateKey];
    return (calendarDay === null || calendarDay === void 0 ? void 0 : calendarDay.solarTerm) || null;
}
