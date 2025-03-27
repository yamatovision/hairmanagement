// すべてのAPIエンドポイントをテスト
const axios = require('axios');

const BASE_URL = 'http://localhost:5001'; // 現在立ち上がっているサーバー
const API_BASE = `${BASE_URL}/api/v1`;

async function getAllEndpoints() {
  try {
    console.log('使用可能なすべてのAPIエンドポイントを確認中...');
    const response = await axios.get(BASE_URL);
    console.log('ルート応答:', response.data);
    
    // あらゆるパスを試す
    const testPaths = [
      '/api',
      '/api/v1',
      '/api/v1/users',
      '/api/v1/users/me',
      '/api/v1/auth',
      '/api/v1/fortune',
      '/api/v1/team',
      '/api/v1/analytics',
      '/api/v1/test'
    ];
    
    for (const path of testPaths) {
      try {
        console.log(`パスを試行: ${BASE_URL}${path}`);
        const pathResponse = await axios.get(`${BASE_URL}${path}`);
        console.log(`成功! ${path}:`, pathResponse.status, pathResponse.statusText);
      } catch (error) {
        const statusCode = error.response ? error.response.status : 'N/A';
        const statusMessage = error.response ? error.response.statusText : error.message;
        console.log(`エラー ${path}: ${statusCode} ${statusMessage}`);
      }
    }
  } catch (error) {
    console.error('エラー:', error.message);
  }
}

async function main() {
  await getAllEndpoints();
}

main();