/**
 * トークン生成時のユーザーID不一致問題の根本原因を特定するスクリプト
 * 
 * 問題：
 * - トークン内のユーザーIDが実際のユーザーIDと一致していない
 * - トークン内ID: 67e487dbc4a58a62d38ac6ac
 * - 実際のユーザーID: 67e52f32fb1b7bc2b73744ce
 * 
 * このスクリプトはトークン生成部分をモックして原因を特定します
 */
require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// MongoDB接続
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hairmanagement';
console.log(`接続先MongoDB: ${MONGODB_URI}`);

// ユーザー情報
const EMAIL = 'admin@example.com';
const EXPECTED_ID = '67e52f32fb1b7bc2b73744ce'; // 実際のデータがあるID
const PROBLEM_ID = '67e487dbc4a58a62d38ac6ac';  // ログインで返されるID
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';

// バックエンドのソースコードファイル
const srcDir = path.join(__dirname, '..', 'backend', 'src');
const backupTokenServicePath = path.join(__dirname, 'token-service-backup.ts');
const tokenServicePath = path.join(srcDir, 'application', 'services', 'token.service.ts');
const authUseCasePath = path.join(srcDir, 'application', 'user', 'use-cases', 'user-authentication.use-case.ts');

// ユーザースキーマ定義
const userSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  email: String,
  password: String,
  name: String,
  role: String
});

/**
 * バックエンドコードの内容を確認
 */
async function checkSourceCode() {
  // token.service.tsの内容を確認
  console.log('\n=== token.service.ts ファイルの確認 ===');
  let tokenServiceContent = '';
  try {
    tokenServiceContent = fs.readFileSync(tokenServicePath, 'utf8');
    console.log('TokenServiceのファイルを読み込みました');
    
    // トークン生成部分を探す
    const generateTokenRegex = /generateAccessToken\s*\(.*?\)\s*{[\s\S]*?}/g;
    const tokenGenMatches = tokenServiceContent.match(generateTokenRegex);
    
    if (tokenGenMatches && tokenGenMatches.length > 0) {
      console.log('トークン生成メソッドを検出:');
      console.log(tokenGenMatches[0]);
      
      // ハードコードされたIDを探す
      const hardcodedIdRegex = new RegExp(PROBLEM_ID, 'g');
      const hasHardcodedId = hardcodedIdRegex.test(tokenServiceContent);
      
      if (hasHardcodedId) {
        console.log(`⚠️ token.service.ts にハードコードされたID ${PROBLEM_ID} を検出しました！`);
        console.log('これがトークン内の不正確なユーザーIDの原因かもしれません。');
      } else {
        console.log('token.service.ts にハードコードされたIDは検出されませんでした。');
      }
    } else {
      console.log('トークン生成メソッドが見つかりませんでした。');
    }
  } catch (error) {
    console.log(`token.service.ts ファイルの読み込みに失敗しました: ${error.message}`);
  }
  
  // user-authentication.use-case.tsの内容を確認
  console.log('\n=== user-authentication.use-case.ts ファイルの確認 ===');
  let authUseCaseContent = '';
  try {
    authUseCaseContent = fs.readFileSync(authUseCasePath, 'utf8');
    console.log('UserAuthenticationUseCaseのファイルを読み込みました');
    
    // ログインメソッドを探す
    const loginMethodRegex = /async\s+login\s*\(.*?\)\s*{[\s\S]*?}/g;
    const loginMatches = authUseCaseContent.match(loginMethodRegex);
    
    if (loginMatches && loginMatches.length > 0) {
      console.log('ログインメソッドを検出:');
      const loginMethod = loginMatches[0];
      
      // ユーザーIDをトークンに渡す部分を探す
      const tokenGenRegex = /tokenService\.generateAccessToken\s*\(\s*{[\s\S]*?}\s*\)/g;
      const tokenGenMatches = loginMethod.match(tokenGenRegex);
      
      if (tokenGenMatches && tokenGenMatches.length > 0) {
        console.log('トークン生成呼び出しを検出:');
        console.log(tokenGenMatches[0]);
        
        // ハードコードされたIDを探す
        const hardcodedIdRegex = new RegExp(PROBLEM_ID, 'g');
        const hasHardcodedId = hardcodedIdRegex.test(loginMethod);
        
        if (hasHardcodedId) {
          console.log(`⚠️ ログインメソッドにハードコードされたID ${PROBLEM_ID} を検出しました！`);
          console.log('これがトークン内の不正確なユーザーIDの原因かもしれません。');
        } else {
          console.log('ログインメソッドにハードコードされたIDは検出されませんでした。');
        }
        
        // user.idの使用を確認
        const userIdRegex = /userId\s*:\s*user\.id/g;
        const hasUserId = userIdRegex.test(loginMethod);
        
        if (hasUserId) {
          console.log('✅ ログインメソッドはuser.idを正しく使用しています');
        } else {
          console.log('⚠️ ログインメソッドでuser.idの使用が検出されませんでした');
          console.log('これがトークン内の不正確なユーザーIDの原因かもしれません。');
        }
      } else {
        console.log('トークン生成呼び出しが見つかりませんでした。');
      }
    } else {
      console.log('ログインメソッドが見つかりませんでした。');
    }
  } catch (error) {
    console.log(`user-authentication.use-case.ts ファイルの読み込みに失敗しました: ${error.message}`);
  }
}

/**
 * データベースからユーザー情報を取得
 */
async function getUserFromDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB接続成功');
    
    const User = mongoose.model('User', userSchema);
    
    // メールアドレスでユーザーを検索
    console.log(`\n=== ${EMAIL} によるユーザー検索 ===`);
    const user = await User.findOne({ email: EMAIL });
    
    if (user) {
      console.log(`ユーザー情報: ID=${user._id}, Name=${user.name || 'N/A'}, Role=${user.role || 'N/A'}`);
      return user;
    } else {
      console.log(`メールアドレス ${EMAIL} のユーザーは見つかりません`);
      return null;
    }
  } catch (error) {
    console.error('データベース操作エラー:', error);
    return null;
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB接続を閉じました');
  }
}

/**
 * トークン生成ロジックをシミュレート
 */
function simulateTokenGeneration(user) {
  if (!user) return null;
  
  console.log('\n=== トークン生成シミュレーション ===');
  
  // 実際のuser.idを表示
  console.log(`実際のユーザーID (user._id): ${user._id}`);
  
  // 文字列に変換されたIDを表示
  const userIdStr = user._id.toString();
  console.log(`文字列に変換されたID (user._id.toString()): ${userIdStr}`);
  
  // 期待されるペイロード
  const expectedPayload = {
    userId: userIdStr,
    role: user.role || 'user'
  };
  console.log('期待されるトークンペイロード:', expectedPayload);
  
  // 問題のあるペイロード（ハードコードされたIDを使用）
  const problematicPayload = {
    userId: PROBLEM_ID,
    role: user.role || 'user'
  };
  console.log('問題のあるトークンペイロード:', problematicPayload);
  
  // トークン生成をシミュレート
  const expectedToken = jwt.sign(expectedPayload, JWT_SECRET, { expiresIn: 3600 });
  console.log(`期待されるトークン: ${expectedToken.substring(0, 20)}...`);
  
  const problematicToken = jwt.sign(problematicPayload, JWT_SECRET, { expiresIn: 3600 });
  console.log(`問題のあるトークン: ${problematicToken.substring(0, 20)}...`);
  
  // トークンをデコード
  const decodedExpected = jwt.decode(expectedToken);
  console.log('期待されるトークンのデコード結果:');
  console.log(decodedExpected);
  
  const decodedProblematic = jwt.decode(problematicToken);
  console.log('問題のあるトークンのデコード結果:');
  console.log(decodedProblematic);
  
  return {
    expectedToken,
    problematicToken,
    expectedPayload,
    problematicPayload
  };
}

/**
 * コード内の潜在的な問題の場所を特定
 */
function identifyPotentialIssues() {
  console.log('\n=== 潜在的な問題の場所 ===');
  
  console.log('1. token.service.ts:');
  console.log('   - generateAccessToken メソッド内にハードコードされたIDがないか確認');
  console.log('   - JWT署名前にペイロード内のuserIdフィールドが変更されていないか確認');
  
  console.log('\n2. user-authentication.use-case.ts:');
  console.log('   - login メソッド内でトークン生成前にuser.idが別の値に変更されていないか確認');
  console.log('   - tokenService.generateAccessToken の呼び出し時にハードコードされたIDを渡していないか確認');
  
  console.log('\n3. MongoDB内のデータ整合性:');
  console.log('   - MongoDB内にadmin@example.comの重複レコードがないか確認');
  console.log('   - _idフィールドが予期せず変更されていないか確認');
  
  console.log('\n4. 考えられる解決策:');
  console.log('   - コード内のハードコードされたIDを修正');
  console.log('   - トークン生成時に正しいユーザーIDを使用するようにする');
  console.log('   - ID不一致が特定のユーザーだけの問題なら、そのユーザーのIDを変更する');
  console.log('   - 全体的なIDの一貫性を確保するためのマイグレーションを実行');
}

/**
 * メイン実行関数
 */
async function main() {
  try {
    console.log('===== トークン生成バグ追跡ツール =====');
    
    // ソースコードを確認
    await checkSourceCode();
    
    // 実際のユーザーを取得
    const user = await getUserFromDatabase();
    
    if (user) {
      // トークン生成をシミュレート
      simulateTokenGeneration(user);
    }
    
    // 潜在的な問題の場所を特定
    identifyPotentialIssues();
    
    console.log('\n===== 処理完了 =====');
  } catch (error) {
    console.error('予期しないエラー:', error);
  }
}

// スクリプト実行
main();