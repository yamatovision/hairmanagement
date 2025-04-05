/**
 * ログイン時に生成されるトークンのユーザーIDを追跡するスクリプト
 * 
 * 問題：
 * - ログイン時に生成されるトークンにIDが 67e487dbc4a58a62d38ac6ac のユーザー情報が含まれる
 * - しかし、実際のユーザーIDは 67e52f32fb1b7bc2b73744ce
 * 
 * このスクリプトはログインプロセスをシミュレートし、各段階でIDの変化を追跡します
 */
require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const axios = require('axios');

// MongoDB接続
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hairmanagement';
console.log(`接続先MongoDB: ${MONGODB_URI}`);

// 問題のあるID
const EXPECTED_ID = '67e52f32fb1b7bc2b73744ce'; // 実際のデータがあるID
const PROBLEM_ID = '67e487dbc4a58a62d38ac6ac';  // ログインで返されるID
const EMAIL = 'admin@example.com';
const PASSWORD = 'admin123'; // または実際のパスワード

// APIエンドポイント (ローカル開発サーバー)
const API_URL = process.env.API_URL || 'http://localhost:5000';
const LOGIN_ENDPOINT = `${API_URL}/api/v1/auth/login`;

// ユーザースキーマ定義
const userSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  email: String,
  password: String,
  name: String,
  role: String
});

/**
 * MongoDBからユーザー情報を直接確認
 */
async function checkUserInDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB接続成功');

    const User = mongoose.model('User', userSchema);
    
    // メールアドレスでユーザーを検索
    console.log(`\n=== ${EMAIL} によるユーザー検索 ===`);
    const userByEmail = await User.findOne({ email: EMAIL });
    if (userByEmail) {
      console.log(`ユーザー情報: ID=${userByEmail._id}, Name=${userByEmail.name}, Role=${userByEmail.role}`);
    } else {
      console.log(`メールアドレス ${EMAIL} のユーザーは見つかりません`);
    }
    
    // 期待されるIDでユーザーを検索
    console.log(`\n=== ID:${EXPECTED_ID} による検索 ===`);
    const userByExpectedId = await User.findById(EXPECTED_ID);
    if (userByExpectedId) {
      console.log(`ユーザー情報: Email=${userByExpectedId.email}, Name=${userByExpectedId.name}`);
    } else {
      console.log(`ID:${EXPECTED_ID} に該当するユーザーは見つかりません`);
    }
    
    // 問題のIDでユーザーを検索
    console.log(`\n=== ID:${PROBLEM_ID} による検索 ===`);
    const userByProblemId = await User.findById(PROBLEM_ID);
    if (userByProblemId) {
      console.log(`ユーザー情報: Email=${userByProblemId.email}, Name=${userByProblemId.name}`);
    } else {
      console.log(`ID:${PROBLEM_ID} に該当するユーザーは見つかりません`);
    }
    
    // すべてのユーザーを確認
    console.log('\n=== すべてのユーザー ===');
    const allUsers = await User.find({}, { email: 1, _id: 1, name: 1 });
    allUsers.forEach((user, index) => {
      console.log(`${index+1}. ID: ${user._id}, Email: ${user.email}, Name: ${user.name || 'N/A'}`);
    });
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('データベース操作エラー:', error);
    try {
      await mongoose.connection.close();
    } catch (e) {}
  }
}

/**
 * 実際のログインリクエストをシミュレート
 */
async function simulateLogin() {
  try {
    console.log(`\n=== ${LOGIN_ENDPOINT} へのログインリクエスト ===`);
    
    const response = await axios.post(LOGIN_ENDPOINT, {
      email: EMAIL,
      password: PASSWORD
    });
    
    console.log('ログイン成功');
    console.log(`ステータスコード: ${response.status}`);
    
    // トークンの解析
    const token = response.data.token;
    console.log('\n=== トークンの内容 ===');
    console.log(`トークン: ${token.substring(0, 20)}...`);
    
    // トークンをデコード
    const decoded = jwt.decode(token);
    console.log('デコードされたトークン:');
    console.log(JSON.stringify(decoded, null, 2));
    
    // userId確認
    if (decoded && decoded.userId) {
      console.log(`\n=== トークン内のユーザーID確認 ===`);
      console.log(`トークン内のユーザーID: ${decoded.userId}`);
      
      if (decoded.userId === EXPECTED_ID) {
        console.log('✅ ユーザーIDは期待値と一致しています');
      } else if (decoded.userId === PROBLEM_ID) {
        console.log('❌ ユーザーIDは問題のIDと一致しています');
        console.log('これが直接チャット機能で四柱推命データが取得できない原因です');
      } else {
        console.log('❓ ユーザーIDは期待値とも問題のIDとも一致しません');
      }
    }
    
    return { token, userId: decoded?.userId, userData: response.data.user };
  } catch (error) {
    console.error('ログインエラー:', error.response?.data || error.message);
    return null;
  }
}

/**
 * 実際のAPIへのリクエストとレスポンスを記録
 */
async function testAPI(token) {
  if (!token) return;
  
  try {
    console.log(`\n=== トークンを使ったAPIリクエスト ===`);
    // ユーザープロファイルエンドポイント
    const profileEndpoint = `${API_URL}/api/v1/users/profile`;
    const response = await axios.get(profileEndpoint, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log(`プロファイルAPI応答: ${response.status}`);
    console.log('ユーザーデータ:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // レスポンス内のユーザーIDを確認
    const userId = response.data?.id || response.data?.user?.id;
    if (userId) {
      console.log(`\n=== APIレスポンス内のユーザーID確認 ===`);
      console.log(`レスポンス内のユーザーID: ${userId}`);
      
      if (userId === EXPECTED_ID) {
        console.log('✅ レスポンス内のIDは期待値と一致しています');
      } else if (userId === PROBLEM_ID) {
        console.log('❌ レスポンス内のIDは問題のIDと一致しています');
      } else {
        console.log('❓ レスポンス内のIDは期待値とも問題のIDとも一致しません');
      }
    }
  } catch (error) {
    console.error('APIリクエストエラー:', error.response?.data || error.message);
  }
}

/**
 * JWT_SECRETを使ってユーザーIDを持つトークンを検証
 */
function verifyToken(token) {
  if (!token) return;
  
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    console.log('環境変数JWT_SECRETが設定されていないため、トークン検証をスキップします');
    return;
  }
  
  try {
    console.log(`\n=== JWT_SECRETを使ったトークン検証 ===`);
    const verified = jwt.verify(token, JWT_SECRET);
    console.log('トークン検証成功:');
    console.log(JSON.stringify(verified, null, 2));
  } catch (error) {
    console.error('トークン検証エラー:', error.message);
  }
}

/**
 * ユーザーIDが問題のIDと一致している場合の解決策を提案
 */
function suggestSolution(userId) {
  if (!userId) return;
  
  console.log('\n=== 解決策の提案 ===');
  if (userId === PROBLEM_ID) {
    console.log('問題が確認されました: トークン内のIDは問題のID（存在しないユーザーID）です');
    console.log('解決策:');
    console.log('1. トークン生成時のユーザーID取得ロジックを修正');
    console.log('2. 問題のIDを持つユーザーを作成する（メールアドレスの一意性制約に注意）');
    console.log('3. 既存ユーザーのIDを変更する（リスクあり）');
    console.log('4. 直接チャット以外のすべてのエンドポイントでもIDまたはメールアドレスでの補助検索を実装');
  } else if (userId === EXPECTED_ID) {
    console.log('トークン内のIDは期待値と一致しています。問題が修正されました！');
  } else {
    console.log(`予期しないユーザーID: ${userId}`);
    console.log('トークン内のIDが期待値とも問題のIDとも一致しないため、さらなる調査が必要です');
  }
}

/**
 * メイン実行関数
 */
async function main() {
  try {
    console.log('===== ログイントークンID追跡ツール =====');
    console.log(`期待されるユーザーID: ${EXPECTED_ID}`);
    console.log(`問題のあるユーザーID: ${PROBLEM_ID}`);
    console.log(`対象ユーザーメール: ${EMAIL}`);
    
    // データベース内のユーザー情報を確認
    await checkUserInDatabase();
    
    // 実際のログインをシミュレート
    const loginResult = await simulateLogin();
    
    if (loginResult && loginResult.token) {
      // トークンを検証
      verifyToken(loginResult.token);
      
      // APIリクエストをテスト
      await testAPI(loginResult.token);
      
      // 解決策を提案
      suggestSolution(loginResult.userId);
    }
    
    console.log('\n===== 処理完了 =====');
  } catch (error) {
    console.error('予期しないエラー:', error);
  }
}

// スクリプト実行
main();