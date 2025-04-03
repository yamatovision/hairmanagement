# テストスクリプト集

このディレクトリには、システムの各コンポーネントをテストするためのスクリプトが含まれています。

## 利用可能なテストスクリプト

### Claude AI接続テスト

ClaudeAI APIへの接続をテストするシンプルなスクリプトです。

- **JavaScript版**: `test-claude-ai.js`
- **TypeScript版**: `test-claude-ai.ts`

#### 実行方法

JavaScript版:
```bash
node test/test-claude-ai.js
```

TypeScript版:
```bash
npx ts-node test/test-claude-ai.ts
```

#### 必要な環境変数

`.env`ファイルに以下の環境変数を設定してください:

```
CLAUDE_API_KEY=your_api_key_here
CLAUDE_API_URL=https://api.anthropic.com/v1/messages
CLAUDE_MODEL=claude-3-7-sonnet-20250219
```

`CLAUDE_API_URL`と`CLAUDE_MODEL`はオプションで、デフォルト値が設定されています。

### AI対話システムテスト

このディレクトリには、AI対話システム機能をテストするためのスクリプトとツールも含まれています。

#### テスト内容

1. バックエンドAPIテスト
   - 呼び水質問生成 API
   - メッセージ送信 API
   - 会話履歴取得 API
   - 会話詳細取得 API 
   - お気に入り登録 API
   - 会話アーカイブ API

2. フロントエンドUIテスト
   - チャットインターフェース
   - 呼び水質問コンポーネント
   - 会話履歴表示
   - メッセージのお気に入り機能

## テスト方法

### バックエンドAPIテスト

1. スクリプトによるテスト実行:

```bash
# プロジェクトルートディレクトリから実行
./scripts/test-conversation-api.sh
```

2. Postmanを使用したテスト:

Postmanコレクションファイル: `./test/postman/ai-conversation-api-tests.json`

使用方法:
- Postmanにコレクションをインポート
- 環境変数を設定:
  - `base_url`: APIのベースURL（デフォルト: http://localhost:5000）
  - `test_user_email`: テストユーザーのメールアドレス
  - `test_user_password`: テストユーザーのパスワード
- 「ログイン」リクエストを実行してトークンを取得
- 他のAPIエンドポイントをテスト

### フロントエンドUIテスト

1. 開発サーバーを起動:

```bash
cd frontend
npm start
```

2. ブラウザでアクセス:
   - http://localhost:3000/conversation

3. 以下の機能をテスト:
   - 呼び水質問の表示と回答機能
   - メッセージの送信と受信
   - 会話履歴の表示
   - メッセージのお気に入り登録
   - 会話のアーカイブ機能

## 自動テスト

フロントエンドの自動テストを実行:

```bash
cd frontend
npm test -- --testPathPattern=src/tests/conversation.test.tsx
```

## テスト結果

テスト実行後の期待される結果:

1. バックエンドAPIテスト:
   - すべてのエンドポイントが適切なレスポンスを返す
   - エラーハンドリングが正常に機能する
   - データベースへの保存が正しく行われる

2. フロントエンドUIテスト:
   - コンポーネントが正しくレンダリングされる
   - メッセージの送受信が視覚的に表示される
   - 状態管理が正しく機能する
   - ユーザー操作が適切に処理される

## 注意事項

- テスト実行前にバックエンドサーバーが稼働していることを確認してください
- テストユーザーが事前に作成されていることを確認してください
- Claude APIの認証情報が正しく設定されているかを確認してください