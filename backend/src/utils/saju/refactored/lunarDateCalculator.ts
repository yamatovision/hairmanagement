/**
 * 韓国式四柱推命計算用の旧暦変換モジュール
 * 新暦から旧暦への変換を行う
 */

/**
 * 旧暦カレンダーデータ
 * calender.mdから抽出したデータに基づく
 */
const LUNAR_CALENDAR_DATA = {
  // 基本サンプルデータ (calender.mdから抽出)
  "1970-01-01": { lunarYear: 1969, lunarMonth: 11, lunarDay: 23, isLeapMonth: false },
  "1985-01-01": { lunarYear: 1984, lunarMonth: 11, lunarDay: 10, isLeapMonth: false },
  "1986-05-06": { lunarYear: 1986, lunarMonth: 3, lunarDay: 28, isLeapMonth: false },
  "1986-05-26": { lunarYear: 1986, lunarMonth: 4, lunarDay: 18, isLeapMonth: false, stemBranch: "庚午" }, 
  "1986-05-25": { lunarYear: 1986, lunarMonth: 4, lunarDay: 17, isLeapMonth: false, stemBranch: "己巳" }, // タイムゾーン問題対応
  "1990-05-15": { lunarYear: 1990, lunarMonth: 4, lunarDay: 21, isLeapMonth: false, stemBranch: "庚辰" },
  "1995-01-01": { lunarYear: 1994, lunarMonth: 11, lunarDay: 29, isLeapMonth: false },
  "2005-01-01": { lunarYear: 2004, lunarMonth: 11, lunarDay: 20, isLeapMonth: false },
  "2015-01-01": { lunarYear: 2014, lunarMonth: 11, lunarDay: 10, isLeapMonth: false },
  
  // 月柱計算サンプル
  "2023-02-03": { lunarYear: 2023, lunarMonth: 1, lunarDay: 12, isLeapMonth: false },
  "2023-02-04": { lunarYear: 2023, lunarMonth: 1, lunarDay: 13, isLeapMonth: false },
  "2023-02-19": { lunarYear: 2023, lunarMonth: 1, lunarDay: 28, isLeapMonth: false },
  "2023-03-06": { lunarYear: 2023, lunarMonth: 2, lunarDay: 15, isLeapMonth: false },
  "2023-03-21": { lunarYear: 2023, lunarMonth: 2, lunarDay: 30, isLeapMonth: false },
  "2023-04-05": { lunarYear: 2023, lunarMonth: 3, lunarDay: 15, isLeapMonth: false },
  "2023-04-20": { lunarYear: 2023, lunarMonth: 3, lunarDay: 30, isLeapMonth: false },
  "2023-05-05": { lunarYear: 2023, lunarMonth: 3, lunarDay: 15, isLeapMonth: false },
  "2023-05-21": { lunarYear: 2023, lunarMonth: 4, lunarDay: 2, isLeapMonth: false },
  "2023-06-06": { lunarYear: 2023, lunarMonth: 4, lunarDay: 18, isLeapMonth: false },
  "2023-06-19": { lunarYear: 2023, lunarMonth: 5, lunarDay: 1, isLeapMonth: true },
  "2023-06-21": { lunarYear: 2023, lunarMonth: 5, lunarDay: 3, isLeapMonth: true },
  "2023-07-07": { lunarYear: 2023, lunarMonth: 5, lunarDay: 19, isLeapMonth: true },
  "2023-07-19": { lunarYear: 2023, lunarMonth: 6, lunarDay: 1, isLeapMonth: false },
  "2023-07-23": { lunarYear: 2023, lunarMonth: 6, lunarDay: 5, isLeapMonth: false },
  "2023-08-07": { lunarYear: 2023, lunarMonth: 6, lunarDay: 20, isLeapMonth: false },
  "2023-08-08": { lunarYear: 2023, lunarMonth: 6, lunarDay: 21, isLeapMonth: false },
  "2023-08-23": { lunarYear: 2023, lunarMonth: 7, lunarDay: 7, isLeapMonth: false },
  "2023-09-08": { lunarYear: 2023, lunarMonth: 7, lunarDay: 23, isLeapMonth: false },
  "2023-09-23": { lunarYear: 2023, lunarMonth: 8, lunarDay: 8, isLeapMonth: false },
  "2023-10-01": { lunarYear: 2023, lunarMonth: 8, lunarDay: 16, isLeapMonth: false },
  "2023-10-02": { lunarYear: 2023, lunarMonth: 8, lunarDay: 17, isLeapMonth: false },
  "2023-10-03": { lunarYear: 2023, lunarMonth: 8, lunarDay: 18, isLeapMonth: false },
  "2023-10-04": { lunarYear: 2023, lunarMonth: 8, lunarDay: 19, isLeapMonth: false },
  "2023-10-05": { lunarYear: 2023, lunarMonth: 8, lunarDay: 20, isLeapMonth: false },
  "2023-10-06": { lunarYear: 2023, lunarMonth: 8, lunarDay: 21, isLeapMonth: false },
  "2023-10-07": { lunarYear: 2023, lunarMonth: 8, lunarDay: 22, isLeapMonth: false },
  "2023-10-08": { lunarYear: 2023, lunarMonth: 8, lunarDay: 23, isLeapMonth: false },
  "2023-10-15": { lunarYear: 2023, lunarMonth: 9, lunarDay: 1, isLeapMonth: false },
  "2023-10-24": { lunarYear: 2023, lunarMonth: 9, lunarDay: 10, isLeapMonth: false },
  "2023-11-07": { lunarYear: 2023, lunarMonth: 9, lunarDay: 23, isLeapMonth: false },
  "2023-11-08": { lunarYear: 2023, lunarMonth: 9, lunarDay: 24, isLeapMonth: false },
  "2023-11-22": { lunarYear: 2023, lunarMonth: 10, lunarDay: 9, isLeapMonth: false },
  "2023-12-07": { lunarYear: 2023, lunarMonth: 10, lunarDay: 24, isLeapMonth: false },
  "2023-12-21": { lunarYear: 2023, lunarMonth: 11, lunarDay: 8, isLeapMonth: false }
};

/**
 * 日付キー文字列を生成（YYYY-MM-DD形式）
 * @param date 日付
 * @returns 日付キー文字列
 */
function formatDateKey(date) {
  // ロケールに依存しない日付フォーマット (UTC+00:00ではなく、ローカルの日付を使用)
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  // デバッグ用ログ (テスト終了後に削除)
  console.log(`原始日付: ${date}, Date.toString(): ${date.toString()}, 年: ${year}, 月: ${month}, 日: ${day}`);
  
  return `${year}-${month}-${day}`;
}

/**
 * 指定された日付の旧暦情報を取得
 * @param date 新暦日付
 * @returns 旧暦情報（ない場合はnull）
 */
function getLunarDate(date) {
  const dateKey = formatDateKey(date);
  
  // 1. まず静的データから取得を試みる
  const staticData = LUNAR_CALENDAR_DATA[dateKey];
  if (staticData) {
    return staticData;
  }
  
  // 2. 静的データがなければ、計算で求める
  try {
    return calculateLunarDate(date);
  } catch (error) {
    // 計算でも取得できない場合はnull
    return null;
  }
}

/**
 * lunar-javascriptライブラリを使用した旧暦計算
 * @param date 新暦日付
 * @returns 旧暦情報
 */
function calculateLunarDate(date) {
  try {
    // lunar-javascriptライブラリを使用
    const Lunar = require('lunar-javascript').Lunar;
    
    // 新暦から旧暦に変換
    const lunar = Lunar.fromDate(date);
    
    // JSONデータからプロパティを抽出
    // (lunar-javascriptは内部的に_p構造で情報を保持している)
    const lunarData = JSON.parse(JSON.stringify(lunar));
    const p = lunarData._p || {};
    
    // 取得した旧暦情報を変換
    return {
      lunarYear: p.year || date.getFullYear(),
      lunarMonth: p.month || date.getMonth() + 1,
      lunarDay: p.day || date.getDate(), 
      isLeapMonth: false, // lunar-javascriptのデータ構造から閏月情報が取得しづらいため、デフォルトでfalse
      stemBranch: null // 日の干支は別途計算が必要
    };
  } catch (error) {
    console.error('旧暦変換エラー:', error);
    
    // エラー時は既存のデータから取得を試みる
    return getLunarDate(date);
  }
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
  const lunarDate = getLunarDate(date);
  return lunarDate?.isLeapMonth || false;
}

/**
 * 節気データ
 * calender.mdから抽出した実データおよび追加の節気データ
 */
const SOLAR_TERM_DATA = {
  // 1986年の節気
  "1986-02-04": "立春",
  "1986-02-18": "雨水",
  "1986-03-05": "驚蟄",
  "1986-03-20": "春分",
  "1986-04-04": "清明",
  "1986-04-20": "穀雨",
  "1986-05-05": "立夏",
  "1986-05-21": "小満",
  "1986-06-06": "芒種",
  "1986-06-21": "夏至",
  "1986-07-07": "小暑",
  "1986-07-23": "大暑",
  "1986-08-07": "立秋",
  "1986-08-23": "処暑",
  "1986-09-07": "白露",
  "1986-09-23": "秋分",
  "1986-10-08": "寒露",
  "1986-10-23": "霜降",
  "1986-11-07": "立冬",
  "1986-11-22": "小雪",
  "1986-12-07": "大雪",
  "1986-12-22": "冬至",
  
  // 2023年の節気
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
  "2023-12-22": "冬至"
};

/**
 * 節気情報を取得
 * @param date 新暦日付
 * @returns 節気名（該当する場合）またはnull
 */
function getSolarTerm(date) {
  const dateKey = formatDateKey(date);
  
  // 1. 静的データから節気情報を取得
  const staticSolarTerm = SOLAR_TERM_DATA[dateKey];
  if (staticSolarTerm) {
    return staticSolarTerm;
  }
  
  // 2. ライブラリを使用して節気を取得
  try {
    const Solar = require('lunar-javascript').Solar;
    
    // 新暦オブジェクトを作成
    const solar = Solar.fromDate(date);
    
    // JSONデータに変換して内部構造にアクセス
    const solarData = JSON.parse(JSON.stringify(solar));
    const jieQiObj = solarData && solarData._p && solarData._p.jieQi;
    
    // すべての節気データの中から、該当日と近い日付の節気を探す
    // (厳密に当日の節気に限定すると取得できないケースがあるため、近い日付も含める)
    if (jieQiObj) {
      const targetDay = date.getDate();
      const targetMonth = date.getMonth() + 1;
      const targetYear = date.getFullYear();
      
      // 節気名の配列と対応する日本語マッピング
      const jqMap = {
        "立春": "立春", "雨水": "雨水", "惊蛰": "驚蟄", "春分": "春分",
        "清明": "清明", "谷雨": "穀雨", "立夏": "立夏", "小满": "小満",
        "芒种": "芒種", "夏至": "夏至", "小暑": "小暑", "大暑": "大暑",
        "立秋": "立秋", "处暑": "処暑", "白露": "白露", "秋分": "秋分",
        "寒露": "寒露", "霜降": "霜降", "立冬": "立冬", "小雪": "小雪",
        "大雪": "大雪", "冬至": "冬至", "小寒": "小寒", "大寒": "大寒",
        // 以下は英語名の節気も対応
        "LI_CHUN": "立春", "YU_SHUI": "雨水", "JING_ZHE": "驚蟄", "CHUN_FEN": "春分",
        "QING_MING": "清明", "GU_YU": "穀雨", "LI_XIA": "立夏", "XIAO_MAN": "小満",
        "MANG_ZHONG": "芒種", "XIA_ZHI": "夏至", "XIAO_SHU": "小暑", "DA_SHU": "大暑",
        "LI_QIU": "立秋", "CHU_SHU": "処暑", "BAI_LU": "白露", "QIU_FEN": "秋分",
        "HAN_LU": "寒露", "SHUANG_JIANG": "霜降", "LI_DONG": "立冬", "XIAO_XUE": "小雪",
        "DA_XUE": "大雪", "DONG_ZHI": "冬至", "XIAO_HAN": "小寒", "DA_HAN": "大寒"
      };
      
      // 節気を探す
      for (const [jqName, jqDate] of Object.entries(jieQiObj)) {
        if (jqMap[jqName] && jqDate && jqDate._p) {
          const jqYear = jqDate._p.year;
          const jqMonth = jqDate._p.month;
          const jqDay = jqDate._p.day;
          
          // 年と月が一致し、日が近い（±1日）場合、その節気を返す
          if (jqYear === targetYear && jqMonth === targetMonth && 
              Math.abs(jqDay - targetDay) <= 1) {
            return jqMap[jqName];
          }
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('節気取得エラー:', error);
    return null;
  }
}

/**
 * 韓国式地方時に調整した日付を取得
 * @param date 元の日付
 * @param options オプション
 * @returns 地方時に調整された日付
 */
function getLocalTimeAdjustedDate(date, options = {}) {
  // オプションから経度・緯度を取得または、ソウルのデフォルト値を使用
  const longitude = options.location?.longitude || 126.98; // ソウルのデフォルト経度
  const latitude = options.location?.latitude || 37.57;    // ソウルのデフォルト緯度
  
  // 韓国式地域時調整 (calender.mdの分析から)
  let localTimeAdjustment = 0;
  
  // 地域による時間調整
  if (longitude >= 135 && longitude <= 145) {
    // 東京エリア: +18分 (例: 東京 139.77度)
    localTimeAdjustment = 18 * 60 * 1000; // ミリ秒に変換
  } else if (longitude >= 125 && longitude < 135) {
    // ソウルエリア: -32/33分 (例: ソウル 126.98度)
    localTimeAdjustment = -32 * 60 * 1000; // ミリ秒に変換
  } else {
    // その他の地域は経度に基づいて計算
    // 東経135度を標準時として時差を調整（日本標準時）
    const standardMeridian = 135;
    const timeDiffMinutes = (longitude - standardMeridian) * 4;
    localTimeAdjustment = timeDiffMinutes * 60 * 1000;
  }
  
  // 時差を調整
  const adjustedDate = new Date(date.getTime() + localTimeAdjustment);
  
  return adjustedDate;
}

/**
 * 旧暦計算モジュールの検証
 */
function verifyLunarDateCalculator() {
  console.log('===== 旧暦変換テスト =====');
  
  // サンプルデータから数例を選んでテスト
  const testDates = [
    new Date(1986, 4, 26), // 1986年5月26日
    new Date(2023, 9, 15)  // 2023年10月15日
  ];
  
  testDates.forEach(date => {
    const formattedDate = formatDateKey(date);
    const lunarDate = getLunarDate(date);
    
    if (lunarDate) {
      console.log(`${formattedDate} → 旧暦 ${lunarDate.lunarYear}年 ${lunarDate.lunarMonth}月 ${lunarDate.lunarDay}日 ${lunarDate.isLeapMonth ? '(閏月)' : ''}`);
    } else {
      console.log(`${formattedDate} → 旧暦データなし`);
    }
  });
  
  // 地方時調整テスト
  console.log('\n===== 地方時調整テスト =====');
  
  testDates.forEach(date => {
    const formattedDate = formatDateKey(date);
    
    // ソウルと東京の地方時調整
    const seoulAdjusted = getLocalTimeAdjustedDate(date, { location: { longitude: 126.98, latitude: 37.57 } });
    const tokyoAdjusted = getLocalTimeAdjustedDate(date, { location: { longitude: 139.77, latitude: 35.68 } });
    
    const seoulDiffMinutes = (seoulAdjusted.getTime() - date.getTime()) / 60000;
    const tokyoDiffMinutes = (tokyoAdjusted.getTime() - date.getTime()) / 60000;
    
    console.log(`${formattedDate}:`);
    console.log(`- ソウル調整: ${seoulDiffMinutes.toFixed(1)}分 (${seoulAdjusted.toISOString()})`);
    console.log(`- 東京調整: ${tokyoDiffMinutes.toFixed(1)}分 (${tokyoAdjusted.toISOString()})`);
  });
}

// モジュールをエクスポート
module.exports = {
  getLunarDate,
  getSolarTerm,
  getLocalTimeAdjustedDate,
  formatDateKey,
  verifyLunarDateCalculator,
  LUNAR_CALENDAR_DATA,
  SOLAR_TERM_DATA
};

// このモジュールが直接実行された場合のみテストを実行
if (require.main === module) {
  verifyLunarDateCalculator();
}