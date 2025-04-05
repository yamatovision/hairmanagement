/**
 * 会話APIエンドポイントの簡易テスト
 */
const axios = require('axios');

async function testConversationAPI() {
  const baseUrl = 'http://127.0.0.1:5001/api/v1';
  const testUser = {
    email: 'admin@example.com',
    password: 'admin123'
  };

  try {
    console.log('会話APIエンドポイントのテスト開始');
    
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
    
    // 2. 会話履歴を取得
    console.log('\n会話履歴を取得中...');
    try {
      const conversationsResponse = await axios.get(`${baseUrl}/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ 会話履歴取得成功!');
      console.log('会話数:', conversationsResponse.data.length);
      
      // 会話がある場合は最初の会話のIDを保存
      let conversationId = null;
      if (conversationsResponse.data.length > 0) {
        conversationId = conversationsResponse.data[0].id;
        console.log(`最初の会話ID: ${conversationId}`);
      }
      
      // 会話IDがある場合、特定の会話の詳細を取得
      if (conversationId) {
        console.log(`\n会話詳細を取得中... (ID: ${conversationId})`);
        try {
          const conversationResponse = await axios.get(`${baseUrl}/conversations/${conversationId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log('✅ 会話詳細取得成功!');
          console.log('会話タイトル:', conversationResponse.data.title);
          console.log('メッセージ数:', conversationResponse.data.messages.length);
        } catch (error) {
          console.error('❌ 会話詳細取得失敗:');
          logError(error);
        }
      }
      
      // 3. 新しい会話を作成
      console.log('\n新しい会話を作成中...');
      try {
        const newConversationResponse = await axios.post(
          `${baseUrl}/conversations`, 
          { title: `テスト会話 ${new Date().toISOString()}` },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        console.log('✅ 会話作成成功!');
        
        const newConversationId = newConversationResponse.data.id;
        console.log(`新しい会話ID: ${newConversationId}`);
        
        // 4. 新しい会話にメッセージを送信
        console.log('\n会話にメッセージを送信中...');
        try {
          const messageResponse = await axios.post(
            `${baseUrl}/conversations/${newConversationId}/messages`, 
            { content: '今日の運勢を教えてください' },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          console.log('✅ メッセージ送信成功!');
          console.log('AIからの応答:', messageResponse.data.reply ? messageResponse.data.reply.substring(0, 50) + '...' : '[応答なし]');
        } catch (error) {
          console.error('❌ メッセージ送信失敗:');
          logError(error);
        }
      } catch (error) {
        console.error('❌ 会話作成失敗:');
        logError(error);
      }
      
      // 5. 統合会話APIを使用した直接会話
      console.log('\n統合会話APIを使用した直接会話をテスト中...');
      try {
        const directChatResponse = await axios.post(
          `${baseUrl}/unified-conversations/chat`, 
          { 
            message: '五行の特性について教えてください', 
            includeHistory: false 
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        console.log('✅ 直接会話成功!');
        console.log('AIからの応答:', directChatResponse.data.response ? directChatResponse.data.response.substring(0, 50) + '...' : '[応答なし]');
      } catch (error) {
        console.error('❌ 直接会話失敗:');
        logError(error);
        
        // 代替として元の直接会話APIを試す
        console.log('\n元の直接会話APIを使用して再試行中...');
        try {
          const originalDirectChatResponse = await axios.post(
            `${baseUrl}/direct-conversations/chat`, 
            { message: '五行の特性について教えてください' },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          console.log('✅ 元の直接会話API成功!');
          console.log('AIからの応答:', originalDirectChatResponse.data.response ? originalDirectChatResponse.data.response.substring(0, 50) + '...' : '[応答なし]');
        } catch (directChatError) {
          console.error('❌ 元の直接会話APIも失敗:');
          logError(directChatError);
        }
      }
      
    } catch (error) {
      console.error('❌ 会話履歴取得失敗:');
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

testConversationAPI();