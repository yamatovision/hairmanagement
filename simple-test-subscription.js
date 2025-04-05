/**
 * サブスクリプションAPIエンドポイントの簡易テスト
 */
const axios = require('axios');

async function testSubscriptionAPI() {
  const baseUrl = 'http://127.0.0.1:5001/api/v1';
  const testUser = {
    email: 'admin@example.com',
    password: 'admin123'
  };

  try {
    console.log('サブスクリプションAPIエンドポイントのテスト開始');
    
    // 1. ログインしてトークンを取得
    console.log(`ログイン中... (${testUser.email})`);
    const loginResponse = await axios.post(`${baseUrl}/auth/login`, testUser);
    
    if (loginResponse.status !== 200 || !loginResponse.data.token) {
      console.error('❌ ログイン失敗:', loginResponse.data);
      return;
    }
    
    const token = loginResponse.data.token;
    const userId = loginResponse.data.user?.id;
    console.log('✅ ログイン成功!');
    console.log(`トークン: ${token.substring(0, 15)}...`);
    console.log(`ユーザーID: ${userId}`);
    
    // 2. サブスクリプション一覧を取得
    console.log('\nサブスクリプション一覧を取得中...');
    try {
      const subscriptionsResponse = await axios.get(`${baseUrl}/subscriptions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ サブスクリプション一覧取得成功!');
      console.log('サブスクリプション数:', subscriptionsResponse.data.length);
      
      // サブスクリプションがある場合は最初のサブスクリプションのIDを保存
      let subscriptionId = null;
      if (subscriptionsResponse.data.length > 0) {
        subscriptionId = subscriptionsResponse.data[0].id;
        console.log(`最初のサブスクリプションID: ${subscriptionId}`);
      }
      
      // サブスクリプションIDがある場合、特定のサブスクリプションの詳細を取得
      if (subscriptionId) {
        console.log(`\nサブスクリプション詳細を取得中... (ID: ${subscriptionId})`);
        try {
          const subscriptionResponse = await axios.get(`${baseUrl}/subscriptions/${subscriptionId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log('✅ サブスクリプション詳細取得成功!');
          console.log('サブスクリプション情報:', {
            id: subscriptionResponse.data.id,
            plan: subscriptionResponse.data.plan,
            status: subscriptionResponse.data.status,
            userId: subscriptionResponse.data.userId
          });
        } catch (error) {
          console.error('❌ サブスクリプション詳細取得失敗:');
          logError(error);
        }
      }
      
      // 3. ユーザーのAIモデル情報を取得
      if (userId) {
        console.log(`\nユーザーのAIモデル情報を取得中... (ユーザーID: ${userId})`);
        try {
          const aiModelResponse = await axios.get(`${baseUrl}/subscriptions/user/${userId}/ai-model`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log('✅ AIモデル情報取得成功!');
          console.log('AIモデル情報:', aiModelResponse.data);
        } catch (error) {
          console.error('❌ AIモデル情報取得失敗:');
          logError(error);
        }
      }
      
      // 4. サブスクリプションの新規作成テスト
      console.log('\n新しいサブスクリプションを作成中...');
      try {
        const newSubscriptionResponse = await axios.post(
          `${baseUrl}/subscriptions`, 
          {
            userId: userId,
            plan: 'standard',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active'
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        console.log('✅ サブスクリプション作成成功!');
        console.log('新しいサブスクリプションID:', newSubscriptionResponse.data.id);
        
        // 新しく作成したサブスクリプションの状態を更新
        if (newSubscriptionResponse.data.id) {
          const newSubId = newSubscriptionResponse.data.id;
          console.log(`\nサブスクリプション状態を更新中... (ID: ${newSubId})`);
          
          try {
            const updateResponse = await axios.patch(
              `${baseUrl}/subscriptions/${newSubId}/status`, 
              { status: 'suspended' },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            
            console.log('✅ サブスクリプション状態更新成功!');
            console.log('更新後の状態:', updateResponse.data.status);
          } catch (error) {
            console.error('❌ サブスクリプション状態更新失敗:');
            logError(error);
          }
        }
      } catch (error) {
        console.error('❌ サブスクリプション作成失敗:');
        logError(error);
      }
      
    } catch (error) {
      console.error('❌ サブスクリプション一覧取得失敗:');
      logError(error);
    }
    
  } catch (error) {
    console.error('❌ テスト実行エラー:');
    logError(error);
  }
}

function logError(error) {
  if (error.response) {
    console.error('ステータスコード:', error.response.status);
    console.error('エラーデータ:', error.response.data);
  } else {
    console.error('エラー:', error.message);
  }
}

testSubscriptionAPI();