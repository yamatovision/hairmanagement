/**
 * 認証関連APIエンドポイントのテストスクリプト
 */
require('dotenv').config();
// ESMバージョンのfetchを使用
import('node-fetch').then(({ default: fetch }) => {
  runTests(fetch).catch(error => {
    console.error('Test suite failed:', error);
  });
});

// API URLの設定
const API_URL = process.env.API_URL || 'http://127.0.0.1:5000';
const API_VERSION = process.env.API_VERSION || 'v1';
const API_PREFIX = process.env.API_PREFIX || '/api';
const BASE_URL = `${API_URL}${API_PREFIX}/${API_VERSION}`;

// テスト用の認証情報
const TEST_USER = {
  email: 'kazutofukushima1202@gmail.com',
  password: 'aikakumei'
};

// テスト用の変数
let accessToken = null;
let refreshToken = null;
let userId = null;

/**
 * APIリクエストを実行する関数
 */
async function makeRequest(fetchFn, endpoint, method = 'GET', body = null, token = null) {
  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
    credentials: 'include'
  };

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetchFn(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    return { 
      status: response.status, 
      data, 
      headers: response.headers,
      ok: response.ok
    };
  } catch (error) {
    console.error(`Error making request to ${endpoint}:`, error);
    throw error;
  }
}

/**
 * レスポンスの検証関数
 */
function assertResponse(testName, actual, expected) {
  console.log(`\n---- ${testName} ----`);
  
  let success = true;
  
  if (actual.status !== expected.status) {
    success = false;
    console.error(`❌ Status code: Expected ${expected.status}, got ${actual.status}`);
  } else {
    console.log(`✅ Status code: ${actual.status}`);
  }

  if (expected.dataChecks) {
    for (const [key, check] of Object.entries(expected.dataChecks)) {
      if (typeof check === 'function') {
        const result = check(actual.data);
        if (!result.success) {
          success = false;
          console.error(`❌ ${key}: ${result.message}`);
        } else {
          console.log(`✅ ${key}: ${result.message || 'Passed'}`);
        }
      }
    }
  }

  console.log(`Result: ${success ? '✅ PASSED' : '❌ FAILED'}`);
  
  return success;
}

/**
 * テストを実行する関数
 */
async function runTests(fetchFn) {
  console.log('🔍 Starting Authentication API Tests 🔍');
  console.log(`API URL: ${BASE_URL}/auth`);
  console.log('='.repeat(50));

  let totalTests = 0;
  let passedTests = 0;

  // テスト1: ログインエンドポイント
  totalTests++;
  try {
    const loginResponse = await makeRequest(fetchFn, '/auth/login', 'POST', TEST_USER);
    
    const loginExpected = {
      status: 200,
      dataChecks: {
        'Success message': (data) => ({
          success: data.success === true,
          message: `Response contains success flag: ${data.success}`
        }),
        'User data': (data) => {
          if (!data.data || !data.data.user) {
            return { success: false, message: 'No user data found' };
          }
          userId = data.data.user.id;
          return { success: true, message: `User ID: ${data.data.user.id}` };
        },
        'Access token': (data) => {
          if (!data.data || !data.data.token) {
            return { success: false, message: 'No token found' };
          }
          accessToken = data.data.token;
          return { success: true, message: 'Token received' };
        }
      }
    };

    if (assertResponse('Login Test', loginResponse, loginExpected)) {
      passedTests++;
    }
  } catch (error) {
    console.error('Login test failed with error:', error);
  }

  // テスト2: 現在のユーザー情報取得エンドポイント
  if (accessToken) {
    totalTests++;
    try {
      const meResponse = await makeRequest(fetchFn, '/auth/me', 'GET', null, accessToken);
      
      const meExpected = {
        status: 200,
        dataChecks: {
          'User data': (data) => {
            if (!data.data || !data.data.id) {
              return { success: false, message: 'No user data found' };
            }
            return { 
              success: data.data.id === userId, 
              message: `User ID matches: ${data.data.id}`
            };
          },
          'Admin role': (data) => ({
            success: data.data && data.data.role === 'admin',
            message: `User role: ${data.data ? data.data.role : 'undefined'}`
          })
        }
      };

      if (assertResponse('Get Current User Test', meResponse, meExpected)) {
        passedTests++;
      }
    } catch (error) {
      console.error('Get Current User test failed with error:', error);
    }
  }

  // テスト3: 無効なトークンでのアクセス
  totalTests++;
  try {
    const invalidToken = 'invalid_token_12345';
    const invalidResponse = await makeRequest(fetchFn, '/auth/me', 'GET', null, invalidToken);
    
    const invalidExpected = {
      status: 401,
      dataChecks: {
        'Error message': (data) => ({
          success: data.message && data.message.includes('トークン'),
          message: `Error message: ${data.message || 'No message'}`
        })
      }
    };

    if (assertResponse('Invalid Token Test', invalidResponse, invalidExpected)) {
      passedTests++;
    }
  } catch (error) {
    console.error('Invalid token test failed with error:', error);
  }

  // テスト4: 無効な認証情報でのログイン
  totalTests++;
  try {
    const invalidLoginResponse = await makeRequest(fetchFn, '/auth/login', 'POST', {
      email: 'invalid@example.com',
      password: 'wrongpassword'
    });
    
    const invalidLoginExpected = {
      status: 401,
      dataChecks: {
        'Error message': (data) => ({
          success: data.message && data.message.length > 0,
          message: `Error message: ${data.message || 'No message'}`
        })
      }
    };

    if (assertResponse('Invalid Login Test', invalidLoginResponse, invalidLoginExpected)) {
      passedTests++;
    }
  } catch (error) {
    console.error('Invalid login test failed with error:', error);
  }

  // テスト5: ログアウトエンドポイント
  if (accessToken) {
    totalTests++;
    try {
      const logoutResponse = await makeRequest(fetchFn, '/auth/logout', 'POST', null, accessToken);
      
      const logoutExpected = {
        status: 200,
        dataChecks: {
          'Success message': (data) => ({
            success: data.success === true,
            message: `Response contains success flag: ${data.success}`
          })
        }
      };

      if (assertResponse('Logout Test', logoutResponse, logoutExpected)) {
        passedTests++;
      }

      // ログアウト後のトークン検証
      totalTests++;
      const afterLogoutResponse = await makeRequest(fetchFn, '/auth/me', 'GET', null, accessToken);
      
      const afterLogoutExpected = {
        status: 401,
        dataChecks: {
          'Unauthorized after logout': (data) => ({
            success: data.message && data.message.length > 0,
            message: 'Access denied after logout as expected'
          })
        }
      };

      if (assertResponse('After Logout Test', afterLogoutResponse, afterLogoutExpected)) {
        passedTests++;
      }
    } catch (error) {
      console.error('Logout test failed with error:', error);
    }
  }

  // 結果の集計
  console.log('\n' + '='.repeat(50));
  console.log(`🏁 Test Results: ${passedTests} passed out of ${totalTests} tests`);
  console.log(`Pass rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('✅ All tests passed!');
  } else {
    console.log(`❌ ${totalTests - passedTests} tests failed.`);
  }
}