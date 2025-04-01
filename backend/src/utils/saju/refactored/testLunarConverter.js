/**
 * 旧暦変換モジュールのテスト
 */
const { Solar, Lunar } = require('lunar-javascript');

/**
 * lunar-javascriptを使用した旧暦変換をテスト
 */
function testLunarConversion() {
  const testDates = [
    { date: new Date(2023, 1, 1), description: "2023-02-01 (양력)" },
    { date: new Date(2023, 1, 4), description: "2023-02-04 (立春)" },
    { date: new Date(2023, 9, 15), description: "2023-10-15" },
    { date: new Date(1986, 4, 26), description: "1986-05-26" }
  ];
  
  console.log("===== lunar-javascriptを使用した旧暦変換テスト =====");
  
  for (const test of testDates) {
    try {
      console.log(`\n【${test.description}】`);
      // Solar オブジェクトに変換
      const solar = Solar.fromDate(test.date);
      // Lunar オブジェクトを取得
      const lunar = solar.getLunar();
      
      // 基本情報を表示
      console.log(`- 西暦: ${test.date.getFullYear()}年${test.date.getMonth()+1}月${test.date.getDate()}日`);
      console.log(`- 旧暦: ${lunar.getYear()}年${lunar.getMonth()}月${lunar.getDay()}日`);
      
      // 干支情報を表示
      console.log(`- 年柱: ${lunar.getYearInGanZhi()}`);
      console.log(`- 月柱: ${lunar.getMonthInGanZhi()}`);
      console.log(`- 日柱: ${lunar.getDayInGanZhi()}`);
      
      // 利用可能なメソッドを確認する
      // console.log("\n- 利用可能なメソッド:");
      // console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(lunar))
      //   .filter(name => typeof lunar[name] === 'function' && name !== 'constructor')
      //   .join(', '));
    } catch (error) {
      console.error(`【エラー】${test.description} の変換中にエラーが発生:`, error);
    }
  }
}

/**
 * 新旧変換モジュールの結果を比較
 */
function compareLunarConversions() {
  // 旧実装のインポート
  const oldConverter = require('./lunarConverter');
  
  // 新実装のモジュールパスを調整（まだコンパイルされていない場合は動作しない可能性あり）
  // 本番環境では実際のモジュールパスを指定する
  let newConverter;
  try {
    // TypeScriptファイルを直接requieすることはできないため、
    // コンパイル済みのJSファイルが必要
    newConverter = require('./lunarConverter-new');
  } catch (error) {
    console.error("新実装モジュールの読み込みに失敗しました。コンパイル済みJSファイルが必要です:", error);
    return;
  }
  
  const testDates = [
    { date: new Date(2023, 1, 1), description: "2023-02-01" },
    { date: new Date(2023, 1, 4), description: "2023-02-04 (立春)" },
    { date: new Date(2023, 9, 15), description: "2023-10-15" },
    { date: new Date(1986, 4, 26), description: "1986-05-26" }
  ];
  
  console.log("\n===== 旧暦変換モジュールの比較 =====");
  
  for (const test of testDates) {
    console.log(`\n【${test.description}】`);
    const oldResult = oldConverter.getLunarDate(test.date);
    const newResult = newConverter.getLunarDate(test.date);
    
    console.log("- 旧実装結果:", oldResult);
    console.log("- 新実装結果:", newResult);
    
    // 比較
    if (oldResult && newResult) {
      const isSameMonth = oldResult.lunarMonth === newResult.lunarMonth;
      const isSameDay = oldResult.lunarDay === newResult.lunarDay;
      console.log(`- 一致: ${isSameMonth && isSameDay ? '✓' : '✗'} (月: ${isSameMonth ? '✓' : '✗'}, 日: ${isSameDay ? '✓' : '✗'})`);
    } else {
      console.log("- 比較不能: 片方または両方の結果がnull");
    }
  }
}

// テスト実行
testLunarConversion();
// 新旧比較は新モジュールがコンパイルされた後に実行する
// compareLunarConversions();