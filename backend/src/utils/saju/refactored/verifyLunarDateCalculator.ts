/**
 * 旧暦変換と地域時調整の検証スクリプト
 */

// まず、直接主要都市データを定義
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
  "台北": { longitude: 121.56, latitude: 25.03 }
};

// その他の関数をインポート
const {
  getLunarDate,
  getLocalTimeAdjustedDate,
  formatDateKey
} = require('./lunarDateCalculator');

/**
 * 都市情報の表示テスト
 */
function testCityDatabase() {
  console.log('===== 都市データベース =====');
  console.log(`登録都市数: ${Object.keys(MAJOR_CITIES).length}`);
  
  // 一部の都市情報を表示
  const sampleCities = ['東京', 'ソウル', '京都', '釜山', '北京', 'ニューヨーク'];
  console.log('主要都市の座標:');
  sampleCities.forEach(city => {
    if (MAJOR_CITIES[city]) {
      console.log(`${city}: 経度=${MAJOR_CITIES[city].longitude}°, 緯度=${MAJOR_CITIES[city].latitude}°`);
    }
  });
}

/**
 * 様々な都市での地域時調整のテスト
 */
function testCityTimeAdjustment() {
  console.log('\n===== 主要都市の地域時調整テスト =====');
  
  // テスト日付
  const testDate = new Date(1986, 4, 26, 12, 0); // 1986年5月26日12:00
  console.log(`テスト日時: ${testDate.toISOString()}`);
  
  // 主要都市でテスト
  const testCities = ['東京', 'ソウル', '京都', '大阪', '名古屋', '福岡', '札幌', '那覇'];
  
  testCities.forEach(city => {
    const adjustedDate = getLocalTimeAdjustedDate(testDate, { location: city });
    const diffMinutes = (adjustedDate.getTime() - testDate.getTime()) / 60000;
    
    console.log(`${city}: ${diffMinutes.toFixed(1)}分の調整 (${adjustedDate.toISOString()})`);
  });
}

/**
 * 夏時間適用のテスト
 */
function testDSTAdjustment() {
  console.log('\n===== 夏時間適用テスト =====');
  
  // 夏時間テスト用の日付
  const dstDates = [
    { date: new Date(1950, 6, 15, 12, 0), desc: '1950年7月15日 (日本の夏時間期間中)' },
    { date: new Date(1950, 1, 15, 12, 0), desc: '1950年2月15日 (日本の夏時間期間外)' },
    { date: new Date(1988, 6, 15, 12, 0), desc: '1988年7月15日 (韓国の夏時間期間中)' },
    { date: new Date(1986, 4, 26, 12, 0), desc: '1986年5月26日 (夏時間なし)' }
  ];
  
  // 日本と韓国でテスト
  const testLocations = ['東京', 'ソウル'];
  
  console.log('夏時間有効設定:');
  dstDates.forEach(({ date, desc }) => {
    console.log(`\n${desc}:`);
    
    testLocations.forEach(city => {
      // 夏時間あり
      const adjustedWithDST = getLocalTimeAdjustedDate(date, { 
        location: city,
        useDST: true 
      });
      
      // 夏時間なし
      const adjustedWithoutDST = getLocalTimeAdjustedDate(date, { 
        location: city,
        useDST: false 
      });
      
      const diffMinutes = (adjustedWithDST.getTime() - adjustedWithoutDST.getTime()) / 60000;
      
      console.log(`${city}: 差=${diffMinutes}分 `);
    });
  });
}

/**
 * 1986年5月26日12時（東京）のサンプルケースの詳細検証
 */
function testSpecificCase() {
  console.log('\n===== 1986年5月26日12時（東京）の詳細検証 =====');
  
  const specificDate = new Date(1986, 4, 26, 12, 0);
  const options = { location: '東京' };
  
  // 旧暦情報を取得
  const lunarDate = getLunarDate(specificDate);
  console.log(`旧暦: ${lunarDate ? `${lunarDate.lunarYear}年${lunarDate.lunarMonth}月${lunarDate.lunarDay}日${lunarDate.isLeapMonth ? ' (閏月)' : ''}` : '情報なし'}`);
  
  // 地域時調整の適用
  const adjustedDate = getLocalTimeAdjustedDate(specificDate, options);
  const adjustmentMinutes = (adjustedDate.getTime() - specificDate.getTime()) / 60000;
  
  console.log(`地域時調整: ${adjustmentMinutes.toFixed(1)}分 (${specificDate.toISOString()} -> ${adjustedDate.toISOString()})`);
  
  // 韓国式四柱推命の入力パラメータの形式で出力
  console.log('\n韓国式四柱推命計算用の入力パラメータ:');
  console.log(`양 ${specificDate.getFullYear()}/${String(specificDate.getMonth() + 1).padStart(2, '0')}/${String(specificDate.getDate()).padStart(2, '0')} ${String(specificDate.getHours()).padStart(2, '0')}:${String(specificDate.getMinutes()).padStart(2, '0')} 여자 도쿄 도`);
  
  // 調整後の時刻
  console.log(`양 ${adjustedDate.getFullYear()}/${String(adjustedDate.getMonth() + 1).padStart(2, '0')}/${String(adjustedDate.getDate()).padStart(2, '0')} ${String(adjustedDate.getHours()).padStart(2, '0')}:${String(adjustedDate.getMinutes()).padStart(2, '0')} 여자 도쿄 도 (지역시 +${adjustmentMinutes.toFixed(0)}분)`);
}

/**
 * 検証実行
 */
function runVerification() {
  console.log('===== 旧暦変換と地域時調整の検証 =====\n');
  
  // 都市データベースのテスト
  testCityDatabase();
  
  // 都市ごとの地域時調整テスト
  testCityTimeAdjustment();
  
  // 夏時間適用テスト
  testDSTAdjustment();
  
  // 特定ケースの詳細検証
  testSpecificCase();
}

// 実行
runVerification();