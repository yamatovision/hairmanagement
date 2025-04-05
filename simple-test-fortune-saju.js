/**
 * /fortune/saju エンドポイントの簡易テスト
 */
const axios = require('axios');

async function testFortuneSaju() {
  const baseUrl = 'http://127.0.0.1:5001/api/v1';
  const testUser = {
    email: 'admin@example.com',
    password: 'admin123'
  };

  try {
    console.log('/fortune/saju エンドポイントのテスト開始');
    
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
    
    // 2. /fortune/saju エンドポイントを呼び出し
    console.log('\n/fortune/saju エンドポイントを呼び出し中...');
    
    // クエリパラメータを指定
    // birthDateは必須パラメータ
    const birthDate = '1990-01-01';
    
    try {
      const sajuResponse = await axios.get(`${baseUrl}/fortune/saju?birthDate=${birthDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ /fortune/saju エンドポイント呼び出し成功!');
      console.log('ステータスコード:', sajuResponse.status);
      console.log('レスポンスデータ（一部）:');
      
      // レスポンスデータの要約を表示
      if (sajuResponse.data) {
        const { userId, birthDate, birthHour, calculationMethod, elementalProfile, saju } = sajuResponse.data;
        
        console.log({
          userId,
          birthDate,
          birthHour,
          calculationMethod,
          elementalProfile,
          // sajuデータの一部のみ表示
          saju: {
            dayMaster: saju.dayMaster,
            // fourPillarsの一部のみ表示
            fourPillars: {
              yearPillar: saju.fourPillars.yearPillar,
              // その他は省略
            },
            // tenGodsの概要
            tenGods: Object.keys(saju.tenGods || {}),
            // branchTenGodsを表示
            branchTenGods: saju.branchTenGods
          }
        });
      }
      
    } catch (error) {
      console.error('❌ /fortune/saju エンドポイント呼び出し失敗:');
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

testFortuneSaju();