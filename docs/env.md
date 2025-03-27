# 環境変数リスト

このプロジェクトで使用するすべての環境変数を一元管理するドキュメントです。開発、テスト、本番環境の設定に使用してください。

## 環境変数のステータス

- [ ] - 未設定の環境変数
- [x] - 設定済みの環境変数
- [!] - 使用中または仮実装の環境変数

## バックエンド環境変数

### サーバー設定

[x] `NODE_ENV` - アプリケーションの実行環境（development, test, production）
[x] `PORT` - サーバーが使用するポート番号
[x] `API_VERSION` - APIのバージョン（例: v1）
[x] `API_PREFIX` - APIのパスプレフィックス（例: /api）
[x] `CORS_ORIGIN` - クロスオリジンリクエストを許可するオリジン
[x] `REQUEST_TIMEOUT` - APIリクエストのタイムアウト時間（ミリ秒）
[x] `RATE_LIMIT_WINDOW` - レート制限のウィンドウ（分）
[x] `RATE_LIMIT_MAX` - ウィンドウ内の最大リクエスト数

### データベース設定

[x] `DB_URI` - MongoDB接続URI（例: mongodb+srv://username:password@cluster.mongodb.net/dbname）
[x] `DB_NAME` - 使用するデータベース名
[x] `DB_USER` - データベースユーザー名
[x] `DB_PASSWORD` - データベースパスワード
[x] `DB_HOST` - データベースホスト（MongoDB Atlasの場合は不要）
[x] `DB_PORT` - データベースポート（MongoDB Atlasの場合は不要）
[x] `DB_CONNECTION_TIMEOUT` - データベース接続タイムアウト（ミリ秒）
[x] `DB_POOL_SIZE` - データベース接続プールサイズ

### 認証設定

[x] `JWT_SECRET` - JWT署名用のシークレットキー
[x] `JWT_ACCESS_EXPIRATION` - アクセストークンの有効期限（例: 1h, 1d）
[x] `JWT_REFRESH_EXPIRATION` - リフレッシュトークンの有効期限（例: 7d, 30d）
[x] `PASSWORD_SALT_ROUNDS` - パスワードハッシュのソルトラウンド数
[x] `COOKIE_SECRET` - Cookieの署名用シークレット
[x] `SESSION_SECRET` - セッションの署名用シークレット

### Claude API設定

[x] `CLAUDE_API_KEY` - Claude APIキー - Anthropic社のAPIへのアクセスキー
[x] `CLAUDE_MODEL` - 使用するClaudeモデル（例: claude-3-haiku-20240307）
[x] `CLAUDE_TEMPERATURE` - 応答のランダム性（0.0〜1.0）
[x] `CLAUDE_MAX_TOKENS` - 応答の最大トークン数
[x] `CLAUDE_TIMEOUT` - APIリクエストのタイムアウト（ミリ秒）

### OpenAI API設定

[ ] `OPENAI_API_KEY` - OpenAI APIキー（現在は使用しない）
[x] `OPENAI_MODEL` - 使用するOpenAIモデル（例: gpt-4）
[x] `OPENAI_TEMPERATURE` - 応答のランダム性（0.0〜1.0）
[x] `OPENAI_MAX_TOKENS` - 応答の最大トークン数
[x] `OPENAI_TIMEOUT` - APIリクエストのタイムアウト（ミリ秒）

### 陰陽五行エンジン設定

[x] `ELEMENT_CALCULATION_METHOD` - 陰陽五行の計算方法（'traditional', 'modern', 'hybrid'）
[x] `FORTUNE_GENERATION_TIME` - 運勢生成時刻（例: 00:00）
[x] `FORTUNE_TIME_ZONE` - 運勢の時間帯設定（例: Asia/Tokyo）
[x] `FORTUNE_CACHE_DURATION` - 運勢キャッシュの有効期間（時間）

### ロギングとモニタリング

[x] `LOG_LEVEL` - ログレベル（error, warn, info, debug, verbose）
[x] `LOG_FORMAT` - ログフォーマット（json, text）
[x] `LOG_FILE_PATH` - ログファイルパス（ファイルに書き出す場合）
[!] `SENTRY_DSN` - Sentry.ioのDSN（エラー監視用）（実際のDSNは本番環境で設定）
[x] `ENABLE_REQUEST_LOGGING` - リクエストログ記録の有効化フラグ（true/false）

### 通知設定

[x] `ENABLE_EMAIL_NOTIFICATIONS` - メール通知の有効化フラグ
[x] `EMAIL_SERVICE` - 使用するメールサービス（例: sendgrid, mailgun）
[!] `EMAIL_API_KEY` - メールサービスのAPIキー（実際のキーは各環境で個別に設定）
[x] `EMAIL_FROM` - 送信元メールアドレス
[x] `EMAIL_TEMPLATE_DIR` - メールテンプレートディレクトリ
[x] `PUSH_NOTIFICATION_ENABLED` - プッシュ通知の有効化フラグ
[!] `FIREBASE_MESSAGING_KEY` - Firebase Cloud Messagingキー（プッシュ通知用）（実際のキーは本番環境で設定）

### ファイルストレージ

[x] `STORAGE_TYPE` - ストレージタイプ（local, s3, gcs）
[x] `STORAGE_BUCKET` - ストレージバケット名
[!] `STORAGE_KEY` - ストレージアクセスキー（実際のキーは各環境で個別に設定）
[!] `STORAGE_SECRET` - ストレージシークレット（実際のシークレットは各環境で個別に設定）
[x] `STORAGE_REGION` - ストレージリージョン
[x] `FILE_UPLOAD_MAX_SIZE` - アップロード可能な最大ファイルサイズ（バイト）
[x] `ALLOWED_FILE_TYPES` - 許可されるファイルタイプ（カンマ区切り）

## フロントエンド環境変数

### API接続設定

[x] `REACT_APP_API_URL` - バックエンドAPIのURL
[x] `REACT_APP_API_TIMEOUT` - APIリクエストのタイムアウト（ミリ秒）
[x] `REACT_APP_USE_MOCK_API` - モックAPIの使用フラグ（開発用）
[x] `REACT_APP_WEBSOCKET_URL` - WebSocketサーバーのURL（リアルタイム機能用）

### UI設定

[x] `REACT_APP_DEFAULT_THEME` - デフォルトテーマ（light, dark）
[x] `REACT_APP_ANIMATION_ENABLED` - アニメーション有効化フラグ
[x] `REACT_APP_DEFAULT_LANGUAGE` - デフォルト言語（ja, en）
[x] `REACT_APP_DATE_FORMAT` - 日付表示フォーマット
[x] `REACT_APP_TIME_FORMAT` - 時刻表示フォーマット

### 機能フラグ

[x] `REACT_APP_ENABLE_TEAM_FEATURES` - チーム機能の有効化フラグ
[x] `REACT_APP_ENABLE_ANALYTICS` - 分析機能の有効化フラグ
[x] `REACT_APP_ENABLE_NOTIFICATIONS` - 通知機能の有効化フラグ
[x] `REACT_APP_ENABLE_OFFLINE_MODE` - オフラインモードの有効化フラグ
[x] `REACT_APP_FEATURE_MENTORSHIP` - メンターシップ機能の有効化フラグ

### 分析と監視

[!] `REACT_APP_GOOGLE_ANALYTICS_ID` - Google AnalyticsのID（実際のIDは本番環境で設定）
[!] `REACT_APP_HOTJAR_ID` - HotjarのID（実際のIDは本番環境で設定）
[!] `REACT_APP_SENTRY_DSN_FRONTEND` - フロントエンド用Sentry DSN（実際のDSNは本番環境で設定）
[x] `REACT_APP_ERROR_REPORTING_LEVEL` - エラー報告レベル

### PWA設定

[x] `REACT_APP_ENABLE_SERVICE_WORKER` - サービスワーカーの有効化フラグ
[x] `REACT_APP_CACHE_VERSION` - キャッシュバージョン
[x] `REACT_APP_OFFLINE_CACHE_SIZE` - オフラインキャッシュサイズ（MB）

## CI/CD環境変数

[x] `GCP_PROJECT_ID` - Google Cloud Projectのプロジェクトid (yamatovision-blue-lamp)
[x] `GCP_SA_KEY` - Google Cloud Projectのサービスアカウントキー
[x] `FIREBASE_TOKEN` - Firebase CLIトークン（デプロイ用）
[x] `FIREBASE_PROJECT` - Firebaseプロジェクト名 (hairmanagement)
[!] `GITHUB_TOKEN` - GitHub APIトークン（CI/CD用）
[!] `DOCKER_USERNAME` - DockerHubユーザー名
[!] `DOCKER_PASSWORD` - DockerHubパスワード

## 本番環境専用変数

[x] `PRODUCTION_DOMAIN` - 本番環境ドメイン (hairmanagement.web.app)
[!] `SSL_CERT_PATH` - SSL証明書パス（実際のパスはサーバー環境に依存）
[!] `SSL_KEY_PATH` - SSL秘密鍵パス（実際のパスはサーバー環境に依存）
[x] `BACKUP_CRON_SCHEDULE` - バックアップスケジュール（cron形式）
[x] `ALERT_EMAIL` - アラート通知用メールアドレス

## 設定手順

1. 開発環境:
   - `.env.development`ファイルを作成して開発環境の変数を設定
   - バックエンドとフロントエンドそれぞれのディレクトリに配置

2. テスト環境:
   - `.env.test`ファイルを作成してテスト環境の変数を設定
   - CI/CDでのテスト実行時に使用

3. 本番環境:
   - `.env.production`ファイルをデプロイプロセスで使用
   - 機密情報はGitHubリポジトリに保存せず、CI/CDサービスのシークレット管理機能を使用

## 環境変数管理のベストプラクティス

1. **機密データの保護**: 機密情報（APIキー、パスワードなど）をバージョン管理に含めない
2. **環境別の設定**: 開発/テスト/本番で異なる設定を使用
3. **デフォルト値の提供**: 必須でない環境変数にはデフォルト値を設定
4. **バリデーション**: アプリケーション起動時に必須環境変数の存在を検証
5. **文書化**: すべての環境変数の目的と使用方法を文書化
6. **定期的な監査**: 不要になった環境変数を定期的に削除・更新