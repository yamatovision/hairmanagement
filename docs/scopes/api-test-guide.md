# API エンドポイントテストガイド

**作成日**: 2025年4月5日
**バージョン**: 1.0
**作成者**: Claude Code

## 概要

このガイドは、APIエンドポイントの接続性とロジックをテストするための包括的な手順とベストプラクティスを説明しています。テスト中に発生した問題と実装された解決策も含みます。

## テスト環境セットアップ

### 前提条件

- バックエンドサーバーが動作していること（ポート5001）
- Node.jsおよびnpm/yarnがインストールされていること
- axiosなどのHTTPクライアントライブラリがインストールされていること

### 基本セットアップ

```bash
# 必要なパッケージをインストール
npm install axios

# バックエンドサーバーを起動
cd backend && npm run dev
```

## テスト実行方法

### 1. 統合テスト実行

```bash
# すべてのAPIテストを実行
node scripts/run-api-tests.js all

# 特定のカテゴリのテストのみ実行
node scripts/run-api-tests.js auth,team

# 詳細モードで実行
node scripts/run-api-tests.js --verbose
```

### 2. 個別テスト実行

```bash
# 認証APIテスト
node scripts/test-auth-api.js

# チーム相性APIテスト
node scripts/test-team-compatibility.js

# 運勢APIテスト
node scripts/test-fortune-endpoints.js

# 分析APIテスト
node scripts/test-analytics-endpoints.js
```

### 3. 簡易テスト実行

以下の簡易テストスクリプトを使用して、特定のエンドポイントの動作を確認できます：

```bash
# 認証APIの簡易テスト
node test-auth-me.js

# チーム関連APIの簡易テスト
node simple-test-team.js

# 運勢関連APIの簡易テスト
node simple-test-fortune.js
```

## テスト実行中の注意点

1. **認証フロー**: ほとんどのAPIエンドポイントは認証が必要です。テストスクリプトは最初にログインを行い、取得したトークンを使用します。

2. **環境変数**: テスト設定は`.env.test`ファイル（存在する場合）またはデフォルト設定から読み込まれます。

3. **エラー処理**: テストスクリプトは失敗したテストについても情報を収集し、サマリーレポートを生成します。

4. **レポート**: テスト結果は`reports/tests/`ディレクトリに保存されます。

## 直面した問題と解決策

### 1. `/auth/me`エンドポイントが404エラーを返す

**問題**: テストで`/auth/me`エンドポイントを使用していたが、バックエンドでは実装されていなかった。

**解決策**: `AuthController`に`getCurrentUser`メソッドを追加し、`auth.routes.ts`に対応するルートを追加。

```javascript
// AuthControllerに追加
async getCurrentUser(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user as TokenPayload;
    
    if (!user || !user.userId) {
      res.status(401).json({
        message: '認証されていません',
        code: 'UNAUTHORIZED'
      });
      return;
    }
    
    const profile = await this.getUserProfileUseCase.getCurrentUserProfile(user.userId);
    res.status(200).json(profile);
  } catch (error: any) {
    console.error('ユーザー情報取得エラー:', error);
    res.status(error.statusCode || 500).json({
      message: error.message || 'ユーザー情報の取得に失敗しました',
      code: error.code || 'INTERNAL_SERVER_ERROR',
      details: error.details
    });
  }
}

// routesに追加
router.get('/auth/me', auth, (req, res) => 
  authController.getCurrentUser(req, res)
);
```

### 2. `/fortune/saju`エンドポイントが400エラーを返す

**問題**: `/fortune/saju`エンドポイントは、必須パラメータ`birthDate`が提供されていないと400エラーを返す。

**解決策**: テストスクリプトにクエリパラメータとして`birthDate`を追加する。

```javascript
// 四柱推命情報取得
const sajuResponse = await axios.get(`${baseUrl}/fortune/saju?birthDate=1990-01-01`, {
  headers: { Authorization: `Bearer ${token}` }
});
```

## エンドポイントテストチェックリスト

APIエンドポイントをテストする際は、以下の点を確認してください：

1. **認証**:
   - トークンなしでアクセスした場合、401/403エラーを返すか
   - 有効なトークンで正常にアクセスできるか

2. **入力検証**:
   - 必須パラメータがない場合、適切なエラーを返すか
   - 無効なパラメータ形式に対して、適切なエラーを返すか

3. **レスポンス形式**:
   - 期待されるレスポンス構造が返されるか
   - 適切なHTTPステータスコードが返されるか

4. **エラー処理**:
   - エラーが発生した場合、構造化されたエラーレスポンスを返すか
   - セキュリティ上の問題を引き起こす情報漏洩がないか

## 特定のエンドポイントテスト情報

### 認証API

- **ベースパス**: `/api/v1/auth`
- **認証不要エンドポイント**: `/login`, `/register`, `/refresh-token`
- **認証必要エンドポイント**: `/me`, `/logout`, `/verify-token`
- **必要な情報**: emailとpassword（ログイン/登録時）

### チームAPI

- **ベースパス**: `/api/v1/teams`
- **すべてのエンドポイントで認証が必要**
- **チーム相性エンドポイント**: `/:teamId/compatibility`（チームメンバー間の十神関係情報を含む）

### 運勢API

- **ベースパス**: `/api/v1/fortune`
- **唯一の認証不要エンドポイント**: `/debug`（APIの動作確認用）
- **主要エンドポイント**: `/daily`, `/date/:date`, `/saju`
- **sajuエンドポイントの必須パラメータ**: `birthDate`（YYYY-MM-DD形式）

### 会話API

- **ベースパス**: `/api/v1/conversations`, `/api/v1/unified-conversations`
- **すべてのエンドポイントで認証が必要**
- **メッセージ送信**: `/conversations/:id/messages`（POST）
- **直接会話**: `/unified-conversations/chat`（POST）

### サブスクリプションAPI

- **ベースパス**: `/api/v1/subscriptions`
- **すべてのエンドポイントで認証が必要**
- **ユーザーのAIモデル情報**: `/user/:userId/ai-model`（GET）
- **サブスクリプション状態更新**: `/:id/status`（PATCH）
- **必須パラメータ**: 新規作成時は`teamId`が必要

## 参考リソース

- `docs/scopes/endpoint-test-guide.md`: 詳細なエンドポイントテスト手順
- `reports/tests/api-test-summary.md`: 最新のAPIテスト結果サマリー
- `TestLABO/README.md`: TestLABOテストフレームワークのドキュメント

## まとめ

APIエンドポイントのテストは、アプリケーションの信頼性と安定性を確保するために不可欠です。このガイドで説明されているテスト方法とベストプラクティスに従うことで、APIの問題を早期に発見し、修正できます。

テスト中に問題が発生した場合は、レポートを生成し、ログを確認して、必要な修正を行ってください。