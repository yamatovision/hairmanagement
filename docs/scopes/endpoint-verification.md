# バックエンドエンドポイント検証とフロントエンド連携テストガイドライン

**スコープID**: scope-1743092573590  
**説明**: バックエンドAPIエンドポイントの検証とフロントエンド連携テスト  
**重要度**: 高  
**最終更新**: 2025/03/27
**状態**: 進行中

## 1. 目的と概要

本スコープの目的は、一通りの実装が完了したパトロールマネジメントシステムの全エンドポイントが実際の環境（モックなし）で正常に動作するかを検証し、バックエンドとフロントエンドの連携が完全に機能していることを確認することです。

## 2. 前提条件の確認

### 2.1 MongoDB接続の確認

MongoDB接続が正常に機能していることを確認します。

```bash
# DB接続の確認
node scripts/test-db-connection.js
```

#### 問題が発生した場合の対応

- `.env.development`の`DB_URI`が正しく設定されていることを確認
- MongoDB Atlasのユーザー名とパスワードが有効か確認
- ネットワーク接続に問題がないか確認
- MongoDB Atlasのアクセス制限（ホワイトリスト）に現在のIPアドレスが登録されているか確認

### 2.2 テストユーザーの確認

テスト用のユーザーアカウントが存在し、アクセス可能であることを確認します。

```bash
# テストユーザー作成スクリプトの実行
node scripts/create-test-user.js

# 管理者ユーザー作成スクリプトの実行
node scripts/create-admin-user.js
```

#### テストに使用するユーザー

| ロール | メールアドレス | パスワード | 説明 |
|-------|-------------|----------|------|
| 管理者 | admin@example.com | admin123 | すべての機能へのアクセス権を持つ |
| テストユーザー | test@example.com | password123 | 基本機能のテスト用 |

### 2.3 認証フローの確認

基本的な認証フローが機能していることを確認します。新しく作成したシンプルな認証テストスクリプトを使用します。

```bash
# 認証フローのテスト（シンプルバージョン）
node scripts/simple-auth-test.js

# 上記で問題がなければ、詳細な認証フローのテスト
node scripts/test-auth-endpoints.js
```

## 3. バックエンドエンドポイント検証

### 3.1 認証機能検証

認証関連のエンドポイントが正常に動作するかを確認します。

**エンドポイント**:
- POST /api/v1/auth/login
- POST /api/v1/auth/refresh-token
- POST /api/v1/auth/logout
- GET /api/v1/auth/me
- POST /api/v1/auth/register
- PUT /api/v1/auth/me/password

**テスト方法**:
```bash
node scripts/test-auth-endpoints.js
```

### 3.2 ユーザープロフィール管理機能検証

ユーザープロフィール関連のエンドポイントが正常に動作するかを確認します。

**エンドポイント**:
- GET /api/v1/users/me
- PUT /api/v1/users/me
- PUT /api/v1/users/me/notification-settings
- GET /api/v1/users/:id (管理者のみ)
- GET /api/v1/users (管理者のみ)

**テスト方法**:
```bash
node scripts/test-user-endpoints.js
```

### 3.3 運勢予測機能検証

陰陽五行エンジンとフォーチュン関連のエンドポイントが正常に動作するかを確認します。

**エンドポイント**:
- GET /api/v1/fortune/daily
- GET /api/v1/fortune/range
- GET /api/v1/fortune/date/:date
- GET /api/v1/fortune/team-compatibility
- GET /api/v1/fortune/weekly
- GET /api/v1/fortune/today-element

**テスト方法**:
```bash
node scripts/test-fortune-endpoints.js
```

### 3.4 チーム連携機能検証

チーム関連のエンドポイントが正常に動作するかを確認します。

**エンドポイント**:
- GET /api/v1/team/contributions
- POST /api/v1/team/contributions
- GET /api/v1/team/mentorships
- POST /api/v1/team/mentorships
- GET /api/v1/team/compatibility

**テスト方法**:
```bash
node scripts/test-team-endpoints.js
```

### 3.5 AI対話システム検証

会話関連のエンドポイントが正常に動作するかを確認します。

**エンドポイント**:
- POST /api/v1/conversation/message
- GET /api/v1/conversation
- GET /api/v1/conversation/:id
- POST /api/v1/conversation/generate-prompt
- PUT /api/v1/conversation/:id/archive
- PUT /api/v1/conversation/:id/favorite

**テスト方法**:
```bash
node scripts/test-conversation-endpoints.js
```

### 3.6 経営分析ダッシュボード検証

分析関連のエンドポイントが正常に動作するかを確認します。

**エンドポイント**:
- GET /api/v1/analytics/team
- GET /api/v1/analytics/users/:userId/engagement
- GET /api/v1/analytics/follow-up-recommendations
- GET /api/v1/analytics/sentiment-trend
- GET /api/v1/analytics/goal-completion-rate

**テスト方法**:
```bash
node scripts/run-api-tests.js
node scripts/test-analytics-endpoints.js
```

## 4. フロントエンド連携テスト

バックエンドエンドポイントの検証が完了したら、フロントエンドとの連携を確認します。

### 4.1 フロントエンド環境設定

フロントエンドの環境設定を実環境向けに変更します。

1. `.env.development`ファイルを更新:
   
```bash
# API設定を実際のバックエンドに向ける
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_API_TIMEOUT=30000
REACT_APP_USE_MOCK_API=false
```

2. フロントエンドを起動: 

```bash
cd /Users/tatsuya/Desktop/システム開発/AppGenius2/patrolmanagement/frontend && npm start
```

### 4.2 連携テスト項目

以下の項目について、フロントエンドからバックエンドへの連携が正しく動作するかを確認します。

#### 4.2.1 認証連携テスト

- ログイン機能
- ログアウト機能
- 認証状態の保持
- ユーザー情報の表示
- パスワード変更機能

#### 4.2.2 ユーザープロフィール連携テスト

- プロフィール情報の表示
- プロフィール情報の編集
- 通知設定の変更

#### 4.2.3 運勢予測連携テスト

- デイリーフォーチュンの表示
- 週間予報の表示
- 日付指定の運勢表示
- チーム相性の表示

#### 4.2.4 チーム連携機能テスト

- チーム貢献の登録と表示
- メンターシップの作成と表示
- チームダッシュボードの表示

#### 4.2.5 AI対話システム連携テスト

- メッセージの送信
- 会話履歴の表示
- 特定の会話の詳細表示
- 会話のアーカイブ・お気に入り機能

#### 4.2.6 経営分析ダッシュボード連携テスト

- チーム分析データの表示
- ユーザーエンゲージメントの表示
- フォローアップ推奨リストの表示
- 感情分析トレンドの表示
- 目標達成率の表示

## 5. エラーとトラブルシューティング

### 5.1 一般的なエラーとその対応

#### CORS関連エラー

- バックエンドの`CORS_ORIGIN`設定を確認
- ブラウザの開発者ツールでネットワークタブを確認
- プロキシ設定を確認

#### 認証エラー

- 有効なトークンが生成されているか確認
- リクエストヘッダーに`Authorization: Bearer <token>`が正しく設定されているか確認
- トークンの有効期限を確認
- リフレッシュトークンの機能を確認

#### リクエスト/レスポンスエラー

- リクエストボディのフォーマットが正しいか確認
- コンテンツタイプヘッダーが正しく設定されているか確認
- サーバーのエラーログを確認

### 5.2 APIエンドポイント固有のトラブルシューティング

各テストスクリプトには、エンドポイント固有のエラーメッセージと対応策が記載されています。実行結果のログを確認してください。

## 6. テスト結果の記録

全てのテストを実行後、結果を記録します。

```bash
# 全APIエンドポイントのテスト実行
node scripts/run-all-tests.js
```

テスト結果は`logs/`ディレクトリに自動的に保存されます。

## 7. 現在の進捗と次のステップ

### 7.1 完了済み項目
- MongoDB接続の確認 ✅
- 管理者ユーザーの作成 ✅
- 認証エンドポイントのテスト ✅
- フロントエンド環境変数の更新（モックAPIの無効化） ✅

### 7.2 進行中の項目
- バックエンドエンドポイント検証
  - 認証機能検証：部分的に完了
  - ユーザープロフィール機能検証：未着手
  - 運勢予測機能検証：未着手
  - チーム連携機能検証：未着手
  - AI対話システム検証：未着手
  - 経営分析ダッシュボード検証：未着手
- フロントエンド連携テスト：未着手

### 7.3 次のステップ
1. 引き続きバックエンドエンドポイントを検証
2. 発見された問題の修正
3. フロントエンド連携テストの実施
4. TypeScriptエラー修正スコープの完了
5. 本格的なテストとデプロイスコープの開始

## 付録: 作成済みテストスクリプト

### シンプル認証テストスクリプト (simple-auth-test.js)

このスクリプトは認証の基本的な機能をテストするためのシンプルなスクリプトです。

```javascript
/**
 * シンプルな認証テスト
 */
const axios = require('axios');
const dotenv = require('dotenv');

// 環境変数の読み込み
dotenv.config();

// APIのベースURL
const API_URL = process.env.API_URL || 'http://localhost:5001/api/v1';

// 認証情報
const testUser = {
  email: 'admin@example.com',
  password: 'admin123'
};

async function testAuth() {
  console.log('認証テスト開始...');
  
  try {
    console.log(`APIエンドポイント: ${API_URL}/auth/login`);
    
    // ログイン
    console.log('ログイン試行中...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, testUser);
    
    console.log('レスポンス構造:', JSON.stringify(loginResponse.data, null, 2).substring(0, 300) + '...');
    
    if (loginResponse.data && loginResponse.data.success) {
      console.log('✅ ログイン成功!');
      
      // レスポンス構造に基づいてトークンを取得
      const token = loginResponse.data.data.token;
      console.log(`トークン: ${token.substring(0, 20)}...`);
      
      // ユーザー情報取得
      console.log('\nユーザー情報取得試行中...');
      const meResponse = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (meResponse.data) {
        console.log('✅ ユーザー情報取得成功!');
        console.log('ユーザー情報:', JSON.stringify(meResponse.data, null, 2));
      }
      
      // ログアウト
      console.log('\nログアウト試行中...');
      const logoutResponse = await axios.post(`${API_URL}/auth/logout`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (logoutResponse.data) {
        console.log('✅ ログアウト成功!');
      }
    } else {
      console.error('❌ ログイン失敗: 認証に失敗しました');
    }
  } catch (error) {
    console.error('❌ エラー発生:');
    if (error.response) {
      // サーバーからのレスポンスを受け取った場合
      console.error(`ステータスコード: ${error.response.status}`);
      console.error('レスポンスデータ:', error.response.data);
    } else if (error.request) {
      // リクエストは送信されたがレスポンスが受信されなかった場合
      console.error('サーバーからの応答がありません。サーバーが起動しているか確認してください。');
    } else {
      // リクエスト設定中にエラーが発生した場合
      console.error('リクエスト設定エラー:', error.message);
    }
  }
}

// テスト実行
testAuth();
```

### 管理者ユーザー作成スクリプト (create-admin-user.js)

このスクリプトはテスト用の管理者ユーザーを作成します。

```javascript
/**
 * 管理者ユーザー作成スクリプト
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// MongoDB接続
const connectDB = async () => {
  try {
    const dbUri = process.env.DB_URI || 'mongodb://localhost:27017/patrolmanagement';
    await mongoose.connect(dbUri);
    console.log('MongoDB接続成功！');
    return true;
  } catch (error) {
    console.error('MongoDB接続エラー:', error);
    return false;
  }
};

// ユーザースキーマ定義（簡略化）
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  birthDate: { type: String, required: true },
  role: { type: String, enum: ['employee', 'manager', 'admin'], default: 'employee' },
  elementalType: {
    mainElement: { type: String, enum: ['木', '火', '土', '金', '水'], required: true },
    secondaryElement: { type: String, enum: ['木', '火', '土', '金', '水'] },
    yinYang: { type: String, enum: ['陰', '陽'], default: '陰' }
  },
  isActive: { type: Boolean, default: true },
  // 他のフィールドも含まれています
}, { timestamps: true });

// 管理者ユーザーの作成
const createAdminUser = async () => {
  try {
    const connected = await connectDB();
    if (!connected) {
      process.exit(1);
    }

    const UserModel = mongoose.model('User', UserSchema);
    const existingUser = await UserModel.findOne({ email: 'admin@example.com' });
    
    if (existingUser) {
      console.log('管理者ユーザーは既に存在します');
      await mongoose.disconnect();
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await UserModel.create({
      email: 'admin@example.com',
      password: hashedPassword,
      name: '管理者',
      birthDate: '1985-01-01',
      role: 'admin',
      elementalType: {
        mainElement: '火',
        secondaryElement: '木',
        yinYang: '陽'
      },
      isActive: true
    });

    console.log('管理者ユーザーが正常に作成されました');
    await mongoose.disconnect();
  } catch (error) {
    console.error('管理者ユーザーの作成中にエラーが発生しました:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

createAdminUser();
```

## 付録: テストスクリプト作成ガイドライン

新しいテストスクリプトを作成する際は、以下のテンプレートを使用してください。

```javascript
/**
 * [機能名]エンドポイントテスト
 */
const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// 環境変数の読み込み
dotenv.config();

// APIのベースURL
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5001/api/v1';

// 成功したテストと失敗したテストをカウント
let successCount = 0;
let failureCount = 0;
let startTime;

// APIトークン
let authToken = null;

/**
 * テスト結果をログに記録
 */
function logTestResult(name, success, data = null, error = null) {
  // ログ記録のロジック
}

/**
 * ログイン関数
 */
async function login() {
  try {
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    if (loginResponse.data && loginResponse.data.success) {
      authToken = loginResponse.data.data.token;
      return true;
    }
    return false;
  } catch (error) {
    console.error('ログイン失敗:', error.message);
    return false;
  }
}

/**
 * APIエンドポイントをテストする関数
 */
async function testEndpoint(testName, endpoint, method = 'GET', data = null) {
  try {
    const options = {
      headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
    };
    
    let response;
    if (method === 'GET') {
      response = await axios.get(`${API_BASE_URL}${endpoint}`, options);
    } else if (method === 'POST') {
      response = await axios.post(`${API_BASE_URL}${endpoint}`, data, options);
    } else if (method === 'PUT') {
      response = await axios.put(`${API_BASE_URL}${endpoint}`, data, options);
    } else if (method === 'DELETE') {
      response = await axios.delete(`${API_BASE_URL}${endpoint}`, options);
    }
    
    logTestResult(testName, true, response.data);
    return { success: true, data: response.data };
  } catch (error) {
    logTestResult(testName, false, null, error);
    return { success: false, error };
  }
}

/**
 * テストを実行する関数
 */
async function runTests() {
  console.log('===== [機能名]関連エンドポイントのテスト開始 =====\n');
  startTime = new Date();
  
  // ログインして認証トークンを取得
  const isLoggedIn = await login();
  
  // テスト実行
  // ...
  
  // テスト結果サマリー
  // ...
}

// テストを実行
runTests().catch(error => {
  console.error('テスト実行中にエラーが発生しました:', error);
});
```