/**
 * チーム関連エンドポイントの簡易テスト
 */
const axios = require('axios');

async function testTeam() {
  // 127.0.0.1を使用（localhostではなく）
  const baseUrl = 'http://127.0.0.1:5001/api/v1';
  const testUser = {
    email: 'admin@example.com',
    password: 'admin123'
  };

  try {
    console.log('チーム関連APIの簡易テストを実行します');
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
        
        // 2. チーム一覧の取得
        console.log('\nチーム一覧を取得中...');
        try {
          const teamsResponse = await axios.get(`${baseUrl}/teams`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log(`チーム一覧取得結果: ${teamsResponse.status}`);
          console.log(`チーム数: ${teamsResponse.data.length || 0}`);
          
          // チームIDがあれば保存
          let teamId = null;
          if (teamsResponse.data && teamsResponse.data.length > 0) {
            teamId = teamsResponse.data[0].id || teamsResponse.data[0]._id;
            console.log(`最初のチームID: ${teamId}`);
            
            // 3. チーム詳細の取得
            console.log('\nチーム詳細を取得中...');
            try {
              const teamDetailResponse = await axios.get(`${baseUrl}/teams/${teamId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              
              console.log(`チーム詳細取得結果: ${teamDetailResponse.status}`);
              console.log(`チーム名: ${teamDetailResponse.data.name}`);
              
              // 4. チーム相性の取得
              console.log('\nチーム相性情報を取得中...');
              try {
                const compatibilityResponse = await axios.get(`${baseUrl}/teams/${teamId}/compatibility`, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                
                console.log(`チーム相性取得結果: ${compatibilityResponse.status}`);
                if (compatibilityResponse.data.overallCompatibility !== undefined) {
                  console.log(`全体相性スコア: ${compatibilityResponse.data.overallCompatibility}`);
                }
                
                // 5. チームメンバー間の関係を取得
                console.log('\nチームメンバー間の関係を取得中...');
                try {
                  const relationshipsResponse = await axios.get(`${baseUrl}/teams/${teamId}/relationships`, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  
                  console.log(`メンバー関係取得結果: ${relationshipsResponse.status}`);
                  console.log('メンバー関係情報:', JSON.stringify(relationshipsResponse.data, null, 2));
                  
                } catch (error) {
                  console.error('メンバー関係取得エラー:', error.message);
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
              console.error('チーム詳細取得エラー:', error.message);
              if (error.response) {
                console.error(`ステータスコード: ${error.response.status}`);
              }
            }
            
          } else {
            console.log('チームが見つかりません。新しいチームを作成します...');
            try {
              const createTeamResponse = await axios.post(`${baseUrl}/teams`, {
                name: `テストチーム_${new Date().getTime()}`,
                description: 'APIテスト用のチーム'
              }, {
                headers: { Authorization: `Bearer ${token}` }
              });
              
              console.log(`チーム作成結果: ${createTeamResponse.status}`);
              console.log(`新しいチームID: ${createTeamResponse.data.id || createTeamResponse.data._id}`);
              
            } catch (error) {
              console.error('チーム作成エラー:', error.message);
              if (error.response) {
                console.error(`ステータスコード: ${error.response.status}`);
              }
            }
          }
          
        } catch (error) {
          console.error('チーム一覧取得エラー:', error.message);
          if (error.response) {
            console.error(`ステータスコード: ${error.response.status}`);
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

testTeam();