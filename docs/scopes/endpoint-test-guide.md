# エンドポイントテスト実施ガイド

**最終更新**: 2025/03/27

このガイドでは、作成済みの検証スクリプトの使い方と結果の解釈について説明します。再実装や重複作業を避けるため、このガイドを参照してください。

## 利用可能なテストスクリプト

| スクリプト名 | 目的 | 使用例 |
|-------------|------|--------|
| `scripts/test-db-connection.js` | MongoDB接続確認 | `node scripts/test-db-connection.js` |
| `scripts/create-admin-user.js` | 管理者ユーザー作成 | `node scripts/create-admin-user.js` |
| `scripts/simple-auth-test.js` | 基本認証テスト | `node scripts/simple-auth-test.js` |
| `scripts/test-user-endpoints.js` | ユーザープロフィールAPI検証 | `node scripts/test-user-endpoints.js` |
| `scripts/test-fortune-endpoints.js` | 運勢予測API検証 | `node scripts/test-fortune-endpoints.js` |
| `scripts/test-team-endpoints.js` | チーム連携API検証 | `node scripts/test-team-endpoints.js` |
| `scripts/test-conversation-endpoints.js` | AI対話API検証 | `node scripts/test-conversation-endpoints.js` |
| `scripts/run-api-tests.js` | 経営分析API検証 | `node scripts/run-api-tests.js` |

## テスト環境構築の手順

1. **バックエンドサーバーの起動**:
   ```bash
   cd backend
   npm run dev
   ```
   - 起動ポート: 5001 (注意: 環境変数設定は5000となっているがサーバーは5001で起動)

2. **フロントエンドのAPI設定**:
   - `.env.development` のAPI URL設定が正しいことを確認:
   ```
   REACT_APP_API_URL=http://localhost:5001/api
   REACT_APP_USE_MOCK_API=false
   ```

3. **フロントエンドの起動**:
   ```bash
   cd frontend
   npm start
   ```

## 詳細なテスト手順

### 1. データベース接続の確認

```bash
node scripts/test-db-connection.js
```

**成功した場合の出力例**:
```
MongoDB URIに接続中: mongodb+srv://...
MongoDB接続成功！
データベース名: hairmanagement
コレクション一覧:
- users
- tokens
- ...
MongoDB接続を終了しました。
```

### 2. 管理者ユーザーの作成

```bash
node scripts/create-admin-user.js
```

**成功した場合の出力例**:
```
MongoDB接続成功！
管理者ユーザーが正常に作成されました:
ID: 67e487dbc4a58a62d38ac6ac
名前: 管理者
メール: admin@example.com
パスワード: admin123 (ハッシュ済)
ロール: admin
MongoDB 接続を終了しました。
```

既に存在する場合は「管理者ユーザーは既に存在します」と表示されます。

### 3. 認証テスト

```bash
node scripts/simple-auth-test.js
```

**期待される処理**:
1. admin@example.com / admin123でログイン
2. ユーザー情報取得
3. ログアウト

**注意**: 認証が失敗する場合は、[API検証の問題と解決策](./api-verification-issues.md)を参照。

### 4. ユーザープロフィールAPI検証

```bash
node scripts/test-user-endpoints.js
```

**テスト対象**:
- GET /users/me - 現在のユーザー情報取得
- GET /users - ユーザーリスト取得
- PUT /users/me - ユーザー情報更新
- PUT /users/me/notification-settings - 通知設定の更新

✅ 解決済み: 通知設定の更新エンドポイントは正常に動作するようになりました。

### 5. 運勢予測API検証

```bash
node scripts/test-fortune-endpoints.js
```

**テスト対象**:
- GET /fortune/today-element - 今日の五行属性と陰陽取得
- GET /fortune/daily - デイリー運勢取得 
- GET /fortune/weekly - 週間運勢予報取得
- など

既知の問題: 認証が必要なエンドポイントは認証エラーになります。

### 6. チーム連携API検証

```bash
node scripts/test-team-endpoints.js
```

**テスト対象**:
- チーム貢献の一覧取得/追加/更新/削除
- メンターシップの取得/作成
- チーム相性取得

既知の問題: すべてのエンドポイントで認証エラーが発生します。

### 7. AI対話API検証

```bash
node scripts/test-conversation-endpoints.js
```

**テスト対象**:
- 会話履歴取得
- 呼び水質問生成
- 新規会話開始/メッセージ送信

✅ 解決済み: 会話関連のエンドポイントが正常に動作するようになりました。

## テスト結果の解釈

### エラー内容と対処法

| エラーコード | 意味 | 対処法 |
|------------|------|-------|
| 401 | 認証エラー | 認証トークンが正しく送信されているか確認。[認証問題の解決](./api-verification-issues.md#a-認証問題の解決)を参照 |
| 404 | エンドポイント未実装 | バックエンドのルーティング設定を確認。[ルーティングの修正](./api-verification-issues.md#b-ルーティングの修正)を参照 |
| 500 | サーバー内部エラー | サーバーログを確認し、エラーの詳細を把握する |
| ECONNREFUSED | 接続拒否 | サーバーが起動しているか確認。ポート番号が正しいか確認 |

### パスの不一致の対処

バックエンドのパス (`/api/v1/*`) とフロントエンドの期待するパス (`/api/*`) が一致していない場合:

1. バックエンドの `API_PREFIX` と `API_VERSION` 環境変数を確認
2. フロントエンドの `REACT_APP_API_URL` を正しいパスに設定

## テスト自動化のヒント

1. **全テストの一括実行**:
   ```bash
   for script in scripts/test-*.js; do node $script; done
   ```

2. **結果の保存**:
   ```bash
   node scripts/test-user-endpoints.js > logs/user-test-results.log
   ```

3. **エラー発生時のみ通知**:
   ```bash
   node scripts/test-user-endpoints.js || echo "テストに失敗しました"
   ```

## トラブルシューティング

1. **CORS エラー**:
   - バックエンドの `CORS_ORIGIN` 設定を確認
   - フロントエンドのオリジン（ホスト:ポート）と一致しているか確認

2. **認証エラー**:
   - ユーザー認証情報（メール/パスワード）が正しいか確認
   - トークンが正しく保存/送信されているか確認
   - トークン有効期限が切れていないか確認

3. **404 エラー**:
   - APIパスが正しいか確認（`/api/v1/` プレフィックスを含むか）
   - バックエンドのルート定義を確認
   - コメントアウトされているルートを有効化

## 次のステップ

1. [API検証の問題と解決策](./api-verification-issues.md)を参照して、既知の問題を修正
2. 1つずつエンドポイントの動作を確認
3. フロントエンドとの連携テストを実施
4. 最終的な検証結果を `docs/scopes/endpoint-verification-summary.md` に更新

このガイドに従って計画的に作業を進めれば、重複作業を避けながら効率的にエンドポイント検証を完了できます。