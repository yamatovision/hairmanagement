/**
 * 韓国式四柱推命計算用の旧暦変換モジュール
 * 新暦から旧暦への変換を行う
 * 
 * @module lunarDateCalculator
 */

/**
 * 日付キー文字列を生成（YYYY-MM-DD形式）
 * @param date 日付
 * @returns 日付キー文字列
 */
function formatDateKey(date) {
  // 無効な日付オブジェクトをチェック
  if (isNaN(date.getTime())) {
    console.error('無効な日付オブジェクト:', date);
    return 'invalid-date';
  }
  
  // ロケールに依存しない日付フォーマット
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * 指定された日付の旧暦情報を取得
 * @param date 新暦日付
 * @returns 旧暦情報（ない場合はnull）
 */
function getLunarDate(date) {
  // 無効な日付オブジェクトをチェック
  if (isNaN(date.getTime())) {
    console.error('getLunarDate: 無効な日付オブジェクト:', date);
    return null;
  }
  
  const dateKey = formatDateKey(date);
  if (dateKey === 'invalid-date') {
    return null;
  }
  
  try {
    // アルゴリズムベースの計算
    return calculateLunarDate(date);
  } catch (error) {
    console.error('旧暦計算エラー:', error);
    return null;
  }
}

/**
 * アルゴリズムベースの旧暦計算
 * @param date 新暦日付
 * @returns 旧暦情報
 */
function calculateLunarDate(date) {
  // 無効な日付オブジェクトをチェック
  if (!date || isNaN(date.getTime())) {
    console.error('calculateLunarDate: 無効な日付オブジェクト:', date);
    return null;
  }
  
  try {
    // 日付情報の取得
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // 旧暦は通常、新暦より約1ヶ月遅れる
    let lunarMonth = (month - 1) || 12; // 1月の場合は12月に
    let lunarYear = month === 1 ? year - 1 : year;
    let lunarDay = day;
    
    // 月の日数調整（旧暦の月は29日か30日）
    if (lunarDay > 30) {
      lunarDay = 30;
    }
    
    // 季節の調整（通常、旧暦の正月は新暦の1月中旬〜2月中旬）
    if (month === 1 && day < 20) {
      lunarMonth = 12;
      lunarYear = year - 1;
    } else if (month === 2 && day < 15) {
      lunarMonth = 1;
    } else {
      // 通常は新暦月より1ヶ月少ない
      lunarMonth = month - 1;
      // 12月の場合は1月に
      if (lunarMonth === 0) {
        lunarMonth = 12;
        lunarYear = year - 1;
      }
    }
    
    return {
      lunarYear,
      lunarMonth,
      lunarDay,
      isLeapMonth: false,
      isCalculated: true
    };
  } catch (error) {
    console.error('旧暦変換エラー:', error);
    
    // エラー発生時は単純な近似計算を使用
    const approxLunarMonth = date.getMonth();
    const approxLunarDay = date.getDate();
    return {
      lunarYear: approxLunarMonth === 0 ? date.getFullYear() - 1 : date.getFullYear(),
      lunarMonth: approxLunarMonth === 0 ? 12 : approxLunarMonth,
      lunarDay: approxLunarDay,
      isLeapMonth: false,
      isError: true,
      isApproximation: true
    };
  }
}

/**
 * 節気データ（二十四節気の基本情報）
 */
const SOLAR_TERMS = [
  { name: "小寒", month: 1, day: 5, isMonthChanging: true },   // 1月上旬 - 丑月開始
  { name: "大寒", month: 1, day: 20, isMonthChanging: false }, // 1月下旬
  { name: "立春", month: 2, day: 4, isMonthChanging: true },   // 2月上旬 - 寅月開始
  { name: "雨水", month: 2, day: 19, isMonthChanging: false }, // 2月下旬
  { name: "驚蟄", month: 3, day: 6, isMonthChanging: true },   // 3月上旬 - 卯月開始
  { name: "春分", month: 3, day: 21, isMonthChanging: false }, // 3月下旬
  { name: "清明", month: 4, day: 5, isMonthChanging: true },   // 4月上旬 - 辰月開始
  { name: "穀雨", month: 4, day: 20, isMonthChanging: false }, // 4月下旬
  { name: "立夏", month: 5, day: 6, isMonthChanging: true },   // 5月上旬 - 巳月開始
  { name: "小満", month: 5, day: 21, isMonthChanging: false }, // 5月下旬
  { name: "芒種", month: 6, day: 6, isMonthChanging: true },   // 6月上旬 - 午月開始
  { name: "夏至", month: 6, day: 21, isMonthChanging: false }, // 6月下旬
  { name: "小暑", month: 7, day: 7, isMonthChanging: true },   // 7月上旬 - 未月開始
  { name: "大暑", month: 7, day: 23, isMonthChanging: false }, // 7月下旬
  { name: "立秋", month: 8, day: 8, isMonthChanging: true },   // 8月上旬 - 申月開始
  { name: "処暑", month: 8, day: 23, isMonthChanging: false }, // 8月下旬
  { name: "白露", month: 9, day: 8, isMonthChanging: true },   // 9月上旬 - 酉月開始
  { name: "秋分", month: 9, day: 23, isMonthChanging: false }, // 9月下旬
  { name: "寒露", month: 10, day: 8, isMonthChanging: true },  // 10月上旬 - 戌月開始
  { name: "霜降", month: 10, day: 24, isMonthChanging: false },// 10月下旬
  { name: "立冬", month: 11, day: 7, isMonthChanging: true },  // 11月上旬 - 亥月開始
  { name: "小雪", month: 11, day: 22, isMonthChanging: false },// 11月下旬
  { name: "大雪", month: 12, day: 7, isMonthChanging: true },  // 12月上旬 - 子月開始
  { name: "冬至", month: 12, day: 22, isMonthChanging: false } // 12月下旬
];

/**
 * 月柱切替に使用する「節気」（各月の最初の節気）
 */
const MONTH_CHANGING_TERMS = [
  "小寒", "立春", "驚蟄", "清明", "立夏", "芒種", 
  "小暑", "立秋", "白露", "寒露", "立冬", "大雪"
];

/**
 * 指定された日付の節気期間を特定する
 * @param date 日付
 * @returns 節気期間情報 {name, index, startDate, endDate, isMonthChanging}
 */
function getSolarTermPeriod(date) {
  // 無効な日付オブジェクトをチェック
  if (!date || isNaN(date.getTime())) {
    console.error('getSolarTermPeriod: 無効な日付オブジェクト:', date);
    return { 
      name: "無効な日付", 
      index: 0, 
      startDate: null, 
      endDate: null,
      isMonthChanging: false,
      isError: true 
    };
  }
  
  try {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // 年の範囲チェック (計算対象範囲は1900年〜2100年)
    if (year < 1900 || year > 2100) {
      console.warn(`getSolarTermPeriod: 計算対象外の年 (${year})`);
    }
    
    // 1. その年の各節気の日付を取得（標準日付から計算）
    const termDates = SOLAR_TERMS.map(term => ({
      name: term.name,
      date: new Date(year, term.month - 1, term.day),
      isMonthChanging: term.isMonthChanging
    }));
    
    // 2. 日付がどの節気期間に入るか判定
    const targetDate = new Date(date);
    
    // 3. 各期間の開始日（節気日）をチェック
    for (let i = 0; i < termDates.length; i++) {
      const currentTerm = termDates[i];
      const nextTermIndex = (i + 1) % termDates.length;
      const nextTerm = nextTermIndex === 0 
        ? { 
            name: "小寒", 
            date: new Date(year + 1, 0, 5),
            isMonthChanging: true
          } // 年をまたぐ場合
        : termDates[nextTermIndex];
      
      // 4. 日付が現在の節気日以上、次の節気日未満なら、この期間に属する
      if (
        targetDate >= currentTerm.date && 
        targetDate < nextTerm.date
      ) {
        // 5. 月柱計算用のインデックスを取得
        // 小寒期=0, 立春期=1, 驚蟄期=2, ...
        const monthChangingIndex = MONTH_CHANGING_TERMS.indexOf(currentTerm.name);
        
        // 節気に基づく月のインデックス（月柱計算で使用）
        const solarTermToMonthIndex = {
          "小寒": 11, // 子月 (11)
          "立春": 0,  // 寅月 (0)
          "驚蟄": 1,  // 卯月 (1)
          "清明": 2,  // 辰月 (2)
          "立夏": 3,  // 巳月 (3)
          "芒種": 4,  // 午月 (4)
          "小暑": 5,  // 未月 (5)
          "立秋": 6,  // 申月 (6)
          "白露": 7,  // 酉月 (7)
          "寒露": 8,  // 戌月 (8)
          "立冬": 9,  // 亥月 (9)
          "大雪": 10  // 子月 (10)
        };
        
        // 節気から正確な月のインデックスを取得
        const periodIndex = solarTermToMonthIndex[currentTerm.name] !== undefined
          ? solarTermToMonthIndex[currentTerm.name]
          : (monthChangingIndex >= 0 ? monthChangingIndex : Math.floor(i / 2));
        
        // 6. 結果を返す
        return {
          name: currentTerm.name,
          index: periodIndex,
          startDate: currentTerm.date,
          endDate: nextTerm.date,
          isMonthChanging: currentTerm.isMonthChanging,
          currentTermIndex: i,
          nextTermIndex: nextTermIndex
        };
      }
    }
    
    // 7. 年末（大雪以降、翌年小寒前まで）の場合
    const winterSolstice = new Date(year, 11, 22); // 冬至
    if (targetDate >= winterSolstice) {
      return {
        name: "冬至",
        index: 11, // 子月に相当
        startDate: winterSolstice,
        endDate: new Date(year + 1, 0, 5), // 翌年の小寒
        isMonthChanging: false,
        isYearEnd: true
      };
    }
    
    // 8. 年始（前年大雪以降、小寒前まで）の場合
    if (targetDate < new Date(year, 0, 5)) { // 小寒前
      return {
        name: "小寒前",
        index: 11, // 子月に相当
        startDate: new Date(year - 1, 11, 22), // 前年の冬至
        endDate: new Date(year, 0, 5), // 小寒
        isMonthChanging: false,
        isYearBegin: true
      };
    }
    
    // 9. エラー時はデフォルト値
    console.error("日付に対応する節気期間が見つかりませんでした", formatDateKey(date));
    
    // フォールバック: 月から概算推定
    const estimatedIndex = (month + 10) % 12; // 立春は2月だが寅月は0
    return { 
      name: "不明", 
      index: estimatedIndex, 
      startDate: new Date(year, month - 1, 1), // 月初日
      endDate: new Date(year, month, 0), // 月末日
      isMonthChanging: false,
      isEstimated: true
    };
  } catch (error) {
    console.error("節気期間計算エラー:", error);
    // 最低限の情報を返す
    return { 
      name: "エラー", 
      index: 0, 
      startDate: null, 
      endDate: null,
      isMonthChanging: false,
      isError: true
    };
  }
}

/**
 * 主要都市のデータベース
 */
const MAJOR_CITIES = {
  "東京": { longitude: 139.77, latitude: 35.68 },
  "ソウル": { longitude: 126.98, latitude: 37.57 },
  "京都": { longitude: 135.77, latitude: 35.02 },
  "大阪": { longitude: 135.50, latitude: 34.70 },
  "名古屋": { longitude: 136.91, latitude: 35.18 },
  "福岡": { longitude: 130.40, latitude: 33.60 },
  "札幌": { longitude: 141.35, latitude: 43.07 },
  "那覇": { longitude: 127.68, latitude: 26.22 },
  "北京": { longitude: 116.41, latitude: 39.90 },
  "上海": { longitude: 121.47, latitude: 31.23 },
  "台北": { longitude: 121.56, latitude: 25.03 },
  "香港": { longitude: 114.17, latitude: 22.28 },
  "釜山": { longitude: 129.04, latitude: 35.18 },
  "光州": { longitude: 126.85, latitude: 35.15 },
  "平壌": { longitude: 125.75, latitude: 39.03 },
  "ニューヨーク": { longitude: -74.01, latitude: 40.71 },
  "ロンドン": { longitude: -0.13, latitude: 51.51 },
  "パリ": { longitude: 2.35, latitude: 48.86 },
  "シドニー": { longitude: 151.21, latitude: -33.87 },
  "シンガポール": { longitude: 103.82, latitude: 1.35 }
};

/**
 * 都市名または座標から位置情報を取得する関数
 * @param location 都市名または座標情報
 * @returns 経度・緯度の座標情報
 */
function getLocationCoordinates(location?: string | { longitude: number, latitude: number }): { longitude: number, latitude: number } {
  if (typeof location === 'string') {
    // 都市名から座標を取得
    const cityLocation = MAJOR_CITIES[location];
    if (cityLocation) {
      return cityLocation;
    }
    // デフォルト値（東京）を返す
    return MAJOR_CITIES["東京"];
  } else if (location && typeof location === 'object' && 'longitude' in location && 'latitude' in location) {
    // 座標が直接入力された場合はそのまま返す
    return location;
  }
  // デフォルト値（東京）を返す
  return MAJOR_CITIES["東京"];
}

/**
 * 韓国式地方時に調整した日付を取得
 * @param date 元の日付
 * @param options オプション
 * @returns 地方時に調整された日付
 */
function getLocalTimeAdjustedDate(date: Date, options: {
  location?: string | { longitude: number, latitude: number },
  useLocalTime?: boolean,
  useDST?: boolean
} = {}) {
  // 無効な日付オブジェクトをチェック
  if (!date || isNaN(date.getTime())) {
    console.error('getLocalTimeAdjustedDate: 無効な日付オブジェクト:', date);
    // 無効な場合は現在の日付を作成して返す
    return new Date();
  }

  // 位置情報が有効かどうかをチェック
  if (!options.useLocalTime) {
    return new Date(date); // 地方時調整が無効なら元の日付を複製して返す
  }

  // 都市名または座標から位置情報を取得
  const locationInput = options.location || "東京";
  let locationCoords;
  
  try {
    locationCoords = getLocationCoordinates(locationInput);
  } catch (error) {
    console.error('位置情報取得エラー:', error);
    // 位置情報取得エラー時は東京の座標を使用
    locationCoords = MAJOR_CITIES["東京"];
  }
  
  // 経度・緯度を取得
  const longitude = locationCoords?.longitude || 139.77; // 東京のデフォルト経度
  const latitude = locationCoords?.latitude || 35.68;    // 東京のデフォルト緯度
  
  // 地方時調整
  let localTimeAdjustment = 0;
  
  try {
    // 地域による時間調整
    if (longitude >= 135 && longitude <= 145) {
      // 東京エリア: +18分
      localTimeAdjustment = 18 * 60 * 1000; // ミリ秒に変換
    } else if (longitude >= 125 && longitude < 135) {
      // ソウルエリア: -32分
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
    
    // 結果の日付が有効かチェック
    if (isNaN(adjustedDate.getTime())) {
      console.error('調整後の日付が無効です:', date, adjustedDate);
      return new Date(); // 無効な場合は現在日時を返す
    }
    
    return adjustedDate;
  } catch (error) {
    console.error('地方時調整計算エラー:', error);
    return new Date(date); // エラー時は元の日付の複製を返す
  }
}

/**
 * 日付と時刻をフォーマット
 * @param date 日付オブジェクト
 * @returns フォーマットされた日付文字列
 */
function formatDateWithTime(date) {
  if (!date || isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  
  try {
    return date.toISOString();
  } catch (error) {
    // ISOStringが失敗した場合の代替フォーマット
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }
}

/**
 * 旧暦計算モジュールの検証
 */
function verifyLunarDateCalculator() {
  console.log('===== 旧暦変換テスト =====');
  
  // サンプルデータからテスト
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

/**
 * 指定された日付の節気を取得する
 * @param date 日付
 * @returns 節気情報 {name, date, isMonthChanging}
 */
function getSolarTerm(date: Date) {
  // 無効な日付オブジェクトをチェック
  if (!date || isNaN(date.getTime())) {
    console.error('getSolarTerm: 無効な日付オブジェクト:', date);
    return {
      name: "無効な日付",
      date: null,
      isMonthChanging: false,
      isError: true
    };
  }
  
  try {
    // 節気期間を取得
    const period = getSolarTermPeriod(date);
    
    // 節気期間から節気情報を返す
    return {
      name: period.name,
      date: period.startDate,
      isMonthChanging: period.isMonthChanging
    };
  } catch (error) {
    console.error("節気取得エラー:", error);
    // エラー時はデフォルト値
    return {
      name: "エラー",
      date: null,
      isMonthChanging: false,
      isError: true
    };
  }
}

// TypeScriptエクスポート
export {
  getLunarDate,
  getSolarTerm,
  getSolarTermPeriod,
  getLocalTimeAdjustedDate,
  formatDateKey,
  formatDateWithTime,
  verifyLunarDateCalculator,
  SOLAR_TERMS,
  MONTH_CHANGING_TERMS,
  MAJOR_CITIES,
  getLocationCoordinates
};

// このモジュールが直接実行された場合のみテストを実行
if (require.main === module) {
  verifyLunarDateCalculator();
}