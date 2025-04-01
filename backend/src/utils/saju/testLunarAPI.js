/**
 * 旧暦API動作確認テスト（修正版）
 * 
 * 実行方法:
 * node testLunarAPI.js
 */

const axios = require('axios');

// APIエンドポイント
const API_BASE_URL = 'https://koyomi.zingsystem.com/api/';

/**
 * 単一日付の暦情報を取得
 * @param {Date} date 取得したい日付（新暦）
 */
async function fetchLunarCalendarDay(date) {
  try {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    console.log(`\n-- ${year}年${month}月${day}日の暦情報を取得します --`);
    
    const params = {
      mode: 'd',
      cnt: '1',
      targetyyyy: year.toString(),
      targetmm: month,
      targetdd: day
    };
    
    console.log('リクエストパラメータ:', params);
    
    const response = await axios.get(API_BASE_URL, { params });
    
    // 応答形式を確認して適切に処理
    if (response.data && response.data.datelist) {
      const dateKey = `${year}-${month}-${day}`;
      const item = response.data.datelist[dateKey];
      
      if (item) {
        console.log('API応答成功:');
        
        // 結果を表示
        console.log('\n === 暦情報 ===');
        console.log('新暦:', dateKey);
        console.log('旧暦年:', item.kyurekiy);
        console.log('旧暦月:', item.kyurekim);
        console.log('旧暦日:', item.kyurekid);
        console.log('曜日:', item.week);
        console.log('六曜:', item.rokuyou);
        console.log('天干:', item.zyusi);
        console.log('地支:', item.zyunisi);
        console.log('干支:', `${item.zyusi}${item.zyunisi}`);
        console.log('十二支:', item.eto);
        console.log('節気:', item.sekki || 'なし');
        console.log('祝日:', item.holiday || 'なし');
        console.log('一粒万倍日:', item.hitotubuflg ? 'はい' : 'いいえ');
        console.log('天赦日:', item.tensyabiflg ? 'はい' : 'いいえ');
        console.log('大明日:', item.daimyoubiflg ? 'はい' : 'いいえ');
        
        return item;
      }
    }
    
    console.error('暦API取得エラー: データ形式が期待と異なります', response.data);
    return null;
  } catch (error) {
    console.error('暦API呼び出しエラー:', error.message);
    if (error.response) {
      console.error('ステータスコード:', error.response.status);
      console.error('レスポンスデータ:', error.response.data);
    }
    return null;
  }
}

/**
 * 月単位の暦情報を取得（パラメータやレスポンス形式を確認するテスト用）
 * @param {number} year 年
 * @param {number} month 月
 */
async function exploreMonthParams(year, month) {
  try {
    console.log(`\n-- ${year}年${month}月の暦情報取得パラメータ探索 --`);
    
    // 試すパラメータのバリエーション
    const paramVariations = [
      { mode: 'm', cnt: '1', targetyyyy: year.toString(), targetmm: month.toString().padStart(2, '0') },
      { mode: 'm', year: year.toString(), month: month.toString().padStart(2, '0') },
      { mode: 'monthly', year: year.toString(), month: month.toString().padStart(2, '0') },
      { action: 'monthly', year: year.toString(), month: month.toString().padStart(2, '0') }
    ];
    
    for (const params of paramVariations) {
      console.log('試行パラメータ:', params);
      
      try {
        const response = await axios.get(API_BASE_URL, { params });
        console.log('応答ステータス:', response.status);
        console.log('応答データ型:', typeof response.data);
        console.log('応答キー:', Object.keys(response.data));
        
        // 最初の5行だけ表示
        const responseStr = JSON.stringify(response.data).substring(0, 200);
        console.log(`応答データ先頭部分: ${responseStr}...`);
        
        if (response.data && typeof response.data === 'object') {
          console.log('このパラメータが機能しました！');
          return;
        }
      } catch (err) {
        console.log(`エラー発生: ${err.message}`);
      }
      
      console.log('---');
    }
    
    console.log('すべてのパラメータバリエーションで失敗しました');
  } catch (error) {
    console.error('暦API呼び出しエラー:', error.message);
    return [];
  }
}

/**
 * ユーザーが提供された韓国語の四柱推命情報と比較
 * @param {string} dateStr 日付文字列 (YYYY/MM/DD)
 */
async function compareWithProvidedInfo(dateStr) {
  try {
    const [year, month, day] = dateStr.split('/').map(Number);
    const date = new Date(year, month - 1, day); // 月は0始まり
    
    console.log(`\n-- ${year}年${month}月${day}日の暦情報を韓国式四柱と比較 --`);
    
    // APIから情報を取得
    const apiInfo = await fetchLunarCalendarDay(date);
    
    if (apiInfo) {
      // 韓国語で提供された情報（1986年5月26日5時の例）
      const koreanInfo = {
        dayPillar: { stem: '庚', branch: '午' },  // 일주: 경오
        monthPillar: { stem: '己', branch: '巳' }, // 월주: 기사
        yearPillar: { stem: '丙', branch: '寅' },  // 년주: 병인
        timePillar: { stem: '癸', branch: '巳' }   // 시주: 계사
      };
      
      console.log('\n == 韓国式四柱との比較 ==');
      console.log('年柱比較: API=' + apiInfo.zyusi + apiInfo.eto + ', 韓国式=' + koreanInfo.yearPillar.stem + koreanInfo.yearPillar.branch);
      console.log('日柱比較: API=' + apiInfo.zyusi + apiInfo.zyunisi + ', 韓国式=' + koreanInfo.dayPillar.stem + koreanInfo.dayPillar.branch);
      
      // 旧暦情報の比較
      console.log('旧暦比較: API=' + apiInfo.kyurekiy + '/' + apiInfo.kyurekim + '/' + apiInfo.kyurekid);
      console.log('旧暦想定: 1986/4/18');
      
      return apiInfo;
    }
  } catch (error) {
    console.error('比較中にエラー:', error.message);
    return null;
  }
}

/**
 * メイン関数：APIテスト実行
 */
async function runTests() {
  console.log('===== 旧暦API動作テスト開始 =====');
  
  try {
    // テストケース1: 今日の暦情報
    const today = new Date();
    await fetchLunarCalendarDay(today);
    
    // テストケース2: 1986年5月26日の暦情報（韓国式四柱推命情報と比較）
    await compareWithProvidedInfo('1986/5/26');
    
    // テストケース3: 1986年4月18日の暦情報
    const testDate2 = new Date(1986, 3, 18); // 月は0始まり
    await fetchLunarCalendarDay(testDate2);
    
    // テストケース4: 月単位の暦情報取得方法を探索
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    await exploreMonthParams(currentYear, currentMonth);
    
    console.log('\n===== 旧暦API動作テスト完了 =====');
  } catch (error) {
    console.error('テスト実行エラー:', error);
  }
}

// テスト実行
runTests();