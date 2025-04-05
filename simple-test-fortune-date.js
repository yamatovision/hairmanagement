/**
 * /fortune/date/:date エンドポイントの簡易テスト
 */
const axios = require('axios');

async function testFortuneDate() {
  const baseUrl = 'http://127.0.0.1:5001/api/v1';
  const testUser = {
    email: 'admin@example.com',
    password: 'admin123'
  };

  try {
    console.log('/fortune/date/:date エンドポイントのテスト開始');
    
    // 1. ログインしてトークンを取得
    console.log(`ログイン中... (${testUser.email})`);
    const loginResponse = await axios.post(`${baseUrl}/auth/login`, testUser);
    
    if (loginResponse.status !== 200 || !loginResponse.data.token) {
      console.error('❌ ログイン失敗:', loginResponse.data);
      return;
    }
    
    const token = loginResponse.data.token;
    console.log('✅ ログイン成功!');
    console.log(`トークン: ${token.substring(0, 15)}...`);
    
    // 2. 正しい形式の日付でテスト
    console.log('\n正しい日付形式でテスト中...');
    const validDate = '2025-04-01';
    const birthDate = '1990-01-01'; // クエリパラメータとして追加
    
    try {
      const validResponse = await axios.get(`${baseUrl}/fortune/date/${validDate}?birthDate=${birthDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ 正しい日付形式のテスト成功!');
      console.log('ステータスコード:', validResponse.status);
      console.log('レスポンスデータ（一部）:', {
        id: validResponse.data.id,
        date: validResponse.data.date,
        element: validResponse.data.element,
        overallScore: validResponse.data.overallScore,
        // その他の詳細は省略
      });
      
      // 3. 不正な形式の日付でテスト
      console.log('\n不正な日付形式でテスト中...');
      
      // いくつかの不正なフォーマットをテスト
      const invalidFormats = [
        '20250401',      // 区切り文字なし
        '2025/04/01',    // スラッシュを使用
        '01-04-2025',    // DD-MM-YYYY形式
        '2025-4-1',      // 一桁の月と日
        '04/01/2025',    // MM/DD/YYYY形式
        'April 1, 2025', // 文字列形式
        '2025-13-01',    // 無効な月
        '2025-04-32'     // 無効な日
      ];
      
      for (const invalidDate of invalidFormats) {
        try {
          console.log(`テスト: ${invalidDate}`);
          const invalidResponse = await axios.get(`${baseUrl}/fortune/date/${invalidDate}?birthDate=${birthDate}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log(`⚠️ 予期せぬ成功 (${invalidDate}):`, invalidResponse.status);
        } catch (error) {
          if (error.response && error.response.status === 400) {
            console.log(`✅ 正しくエラーを返しました (${invalidDate}): ${error.response.status}`);
          } else {
            console.error(`❌ 予期せぬエラー (${invalidDate}):`, error.message);
          }
        }
      }
      
    } catch (error) {
      console.error('❌ /fortune/date/:date エンドポイントテスト失敗:');
      if (error.response) {
        console.error('ステータスコード:', error.response.status);
        console.error('エラーデータ:', error.response.data);
      } else {
        console.error('エラー:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ テスト実行エラー:');
    if (error.response) {
      console.error('ステータスコード:', error.response.status);
      console.error('エラーデータ:', error.response.data);
    } else {
      console.error('エラー:', error.message);
    }
  }
}

testFortuneDate();