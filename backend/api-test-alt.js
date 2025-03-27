// サーバー接続テスト - host指定バージョン
const axios = require('axios');

async function testServerConnection() {
  console.log('サーバー接続テスト - 異なるURLバリエーション');
  
  const urlVariations = [
    'http://localhost:5001/api/v1/health',
    'http://127.0.0.1:5001/api/v1/health',
    'http://localhost:5001/',
    'http://127.0.0.1:5001/'
  ];
  
  for (const url of urlVariations) {
    try {
      console.log(`URLの試行: ${url}`);
      const response = await axios.get(url);
      console.log(`成功 (${url}):`, response.status, response.statusText);
      console.log('レスポンス内容:', JSON.stringify(response.data, null, 2));
      return true;
    } catch (error) {
      console.log(`失敗 (${url}):`, error.message);
    }
  }
  
  return false;
}

async function main() {
  await testServerConnection();
}

main().catch(err => console.error('エラー:', err.message));