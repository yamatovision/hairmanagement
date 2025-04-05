/**
 * 運勢関連エンドポイントの簡易テスト
 */
const axios = require('axios');

async function testFortune() {
  // 127.0.0.1を使用（localhostではなく）
  const baseUrl = 'http://127.0.0.1:5001/api/v1';
  const testUser = {
    email: 'admin@example.com',
    password: 'admin123'
  };

  try {
    console.log('運勢関連APIの簡易テストを実行します');
    console.log(`ベースURL: ${baseUrl}`);
    
    // 1. まずログインして認証トークンを取得
    console.log(`ログインを試行中... (${testUser.email})`);
    const loginResponse = await axios.post(`${baseUrl}/auth/login`, testUser);
    
    let token;
    if (loginResponse.status === 200) {
      // レスポンス構造に応じてトークンを取得
      if (loginResponse.data.token) {
        token = loginResponse.data.token;
      } else if (loginResponse.data.data && loginResponse.data.data.token) {
        token = loginResponse.data.data.token;
      }
      
      if (token) {
        console.log('✅ ログイン成功!');
        console.log(`トークン: ${token.substring(0, 15)}...`);
        
        // 2. デイリー運勢の取得
        console.log('\nデイリー運勢を取得中...');
        try {
          const dailyFortuneResponse = await axios.get(`${baseUrl}/fortune/daily`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log(`デイリー運勢取得結果: ${dailyFortuneResponse.status}`);
          console.log('デイリー運勢情報の一部:', JSON.stringify(dailyFortuneResponse.data, null, 2).substring(0, 200) + '...');
          
          // 3. 四柱推命情報の取得
          console.log('\n四柱推命情報を取得中...');
          try {
            const sajuResponse = await axios.get(`${baseUrl}/fortune/saju`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log(`四柱推命情報取得結果: ${sajuResponse.status}`);
            console.log('四柱推命情報の一部:', JSON.stringify(sajuResponse.data, null, 2).substring(0, 200) + '...');
            
            // 4. チーム相性の取得
            console.log('\nチーム相性情報を取得中...');
            try {
              const teamCompatibilityResponse = await axios.get(`${baseUrl}/fortune/team-compatibility`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              
              console.log(`チーム相性取得結果: ${teamCompatibilityResponse.status}`);
              console.log('チーム相性情報の一部:', JSON.stringify(teamCompatibilityResponse.data, null, 2).substring(0, 200) + '...');
              
              // 5. 特定日の運勢を取得
              const testDate = '2025-04-01';
              console.log(`\n特定日の運勢を取得中... (${testDate})`);
              try {
                const dateFortuneResponse = await axios.get(`${baseUrl}/fortune/date/${testDate}`, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                
                console.log(`特定日の運勢取得結果: ${dateFortuneResponse.status}`);
                console.log('特定日の運勢情報の一部:', JSON.stringify(dateFortuneResponse.data, null, 2).substring(0, 200) + '...');
                
              } catch (error) {
                console.error('特定日の運勢取得エラー:', error.message);
                if (error.response) {
                  console.error(`ステータスコード: ${error.response.status}`);
                }
              }
              
            } catch (error) {
              console.error('チーム相性取得エラー:', error.message);
              if (error.response) {
                console.error(`ステータスコード: ${error.response.status}`);
              }
            }
            
          } catch (error) {
            console.error('四柱推命情報取得エラー:', error.message);
            if (error.response) {
              console.error(`ステータスコード: ${error.response.status}`);
            }
          }
          
        } catch (error) {
          console.error('デイリー運勢取得エラー:', error.message);
          if (error.response) {
            console.error(`ステータスコード: ${error.response.status}`);
            console.error('レスポンスデータ:', error.response.data);
          }
        }
        
      } else {
        console.log('❌ トークンが見つかりません');
      }
    } else {
      console.log('❌ ログイン失敗');
    }
    
  } catch (error) {
    console.error('テスト実行エラー:', error.message);
    if (error.response) {
      console.error('レスポンスデータ:', error.response.data);
      console.error('ステータスコード:', error.response.status);
    }
  }
}

testFortune();