# デプロイ戦略：美容師向け陰陽五行AIケアコンパニオン

## 概要

本プロジェクトでは、美容師向け陰陽五行AIケアコンパニオンを効率的かつ安定的に運用するための環境構築とデプロイ戦略について詳述します。非技術者のユーザーでも管理・運用できることを念頭に置いた環境選定となっています。

## インフラストラクチャ選定

### データベース: MongoDB Atlas

**選定理由**:
- フレキシブルなデータモデル（スキーマレス）で、運勢データや対話履歴など多様な構造のデータを格納可能
- スケーラブルな容量と処理能力を提供
- 日本語ドキュメント・サポートが充実
- 無料枠から始められ、成長に合わせて段階的にスケールアップ可能
- マネージドサービスのため運用・保守の負担が少ない

**具体的な構成**:
- M0 Sandbox（開発・テスト環境）：無料枠
- M5 Cluster（本番環境）：プロダクション用（月額約$25〜）

### バックエンド: Google Cloud Run

**選定理由**:
- コンテナベースのサーバーレスプラットフォームで運用負担が最小限
- 使用量に応じた課金体系で経済的
- 高いスケーラビリティと可用性
- 日本リージョンの提供による低レイテンシー
- 日本語ドキュメント・サポートが充実
- CLIツールやコンソールの使いやすさ

**具体的な構成**:
- 開発環境：最小インスタンス数0、最大2（自動スケーリング）
- 本番環境：最小インスタンス数1、最大5（自動スケーリング）
- プロジェクトID: yamatovision-blue-lamp
- リージョン: asia-northeast1 (東京)

### フロントエンド: Firebase Hosting

**選定理由**:
- 静的ウェブサイトのホスティングに最適
- グローバルCDNによる高速なコンテンツ配信
- SSL証明書の自動発行・更新
- Google Cloud Runとの連携が容易
- デプロイが簡単（CI/CDと連携可能）
- 日本語サポートが充実

**具体的な構成**:
- 開発用環境とプロダクション環境を分離
- GitHub Actionsを活用した自動デプロイパイプラインの構築
- プロジェクト名: hairmanagement

### AI処理: Anthropic Claude API

**選定理由**:
- 高品質な会話AIの提供
- 感情認識能力と自然な対話フロー
- 美容コンサルテーションに適した共感的な応答
- 陰陽五行に関する知識を持ち、カウンセリングに活用可能
- 長いコンテキストウィンドウで詳細な会話履歴を記憶
- シンプルなAPI設計と使いやすいドキュメント

**具体的な構成**:
- モデル: claude-3-haiku-20240307（コスト効率の良いモデル）
- 温度設定: 0.7（創造性とコンシステンシーのバランス）
- 最大トークン: 1000（応答の詳細度を調整）

## CI/CDパイプライン

### GitHub Actions

**選定理由**:
- GitHubリポジトリとの緊密な統合
- 無料枠が十分なプロジェクト規模
- YAMLベースの簡単な設定
- クラウドプロバイダー（GCP、Firebase）との連携が容易

**具体的な構成**:
- ワークフロー1: CI（継続的インテグレーション）
  - プルリクエストとブランチプッシュ時に実行
  - コードの静的解析とビルド確認
  - 自動テストの実行

- ワークフロー2: CD（継続的デプロイ）
  - mainブランチへのマージ時に実行
  - バックエンドのDocker化とGCRへのプッシュ
  - Cloud Runへのデプロイ
  - フロントエンドのビルドとFirebaseデプロイ

## デプロイフロー

### 1. 開発環境のセットアップ

1. **ローカル開発環境**:
   ```bash
   # リポジトリのクローン
   git clone https://github.com/yamatovision/hairmanagement.git
   cd hairmanagement
   
   # フロントエンド依存関係のインストール
   cd frontend
   npm install
   
   # バックエンド依存関係のインストール
   cd ../backend
   npm install
   
   # 環境変数の設定
   cp .env.example .env.local
   # .env.localファイルを編集して必要な値を設定
   ```

2. **開発用データベースのセットアップ**:
   - MongoDB Atlasにアクセス（https://www.mongodb.com/cloud/atlas）
   - 無料のM0クラスターを作成
   - データベースユーザーを作成
   - 接続文字列を環境変数に設定

3. **Claude APIキーの取得**:
   - Anthropicコンソールにアクセス（https://console.anthropic.com/）
   - APIキーを生成
   - バックエンドの環境変数に設定: [REDACTED]

### 2. テスト環境へのデプロイ

1. **バックエンドのデプロイ（Google Cloud Run）**:
   ```bash
   # Google Cloudへのログイン
   gcloud auth login
   
   # プロジェクトの選択
   gcloud config set project yamatovision-blue-lamp
   
   # Dockerイメージのビルドと提出
   gcloud builds submit --tag gcr.io/yamatovision-blue-lamp/hairmanagement-backend
   
   # Cloud Runへのデプロイ
   gcloud run deploy hairmanagement-backend \
     --image gcr.io/yamatovision-blue-lamp/hairmanagement-backend \
     --platform managed \
     --region asia-northeast1 \
     --allow-unauthenticated \
     --set-env-vars="NODE_ENV=production,DB_URI=[REDACTED],JWT_SECRET=[REDACTED],CLAUDE_API_KEY=[REDACTED]"
   ```

2. **フロントエンドのデプロイ（Firebase Hosting）**:
   ```bash
   # Firebaseツールのインストール（初回のみ）
   npm install -g firebase-tools
   
   # Firebaseへのログイン
   firebase login
   
   # Firebaseプロジェクトの初期化（初回のみ）
   cd frontend
   firebase init hosting
   
   # 環境変数の設定
   echo "REACT_APP_API_URL=https://hairmanagement-backend-xxxxxx.a.run.app/api" > .env.production
   
   # ビルドとデプロイ
   npm run build
   firebase deploy --only hosting
   ```

### 3. 本番環境へのデプロイ（GitHub Actions）

CI/CDパイプラインが構築され、mainブランチへのマージによって自動デプロイが行われます：

1. **GitHub Secretsの設定**:
   - GCP_PROJECT_ID: yamatovision-blue-lamp
   - GCP_SA_KEY: Google Cloudサービスアカウントのキー（JSONファイル）
   - FIREBASE_TOKEN: Firebaseデプロイトークン
   - JWT_SECRET: JWTシークレットキー
   - CLAUDE_API_KEY: Claude APIキー
   - DB_URI: MongoDB接続URI

2. **GitHub Actionsワークフロー**:
   - `.github/workflows/ci.yml`: コードの品質検証
   - `.github/workflows/cd.yml`: 本番環境へのデプロイ

## 監視とスケーリング

1. **パフォーマンス監視**:
   - Google Cloud Monitoring/Loggingの活用
   - MongoDB Atlas監視ツールでのデータベースパフォーマンス監視

2. **自動スケーリング設定**:
   - Google Cloud Runの自動スケーリング設定に基づく処理能力調整
   - MongoDB Atlasのスケーリング計画

3. **予算アラート**:
   - Google Cloud予算アラートの設定
   - Claude API使用量の監視

## バックアップと障害復旧

1. **データベースバックアップ**:
   - MongoDB Atlasの自動バックアップ機能の有効化
   - 7日分のポイントインタイムリカバリー保持

2. **障害復旧計画**:
   - 障害時の手順書の整備
   - クラスター障害時のリージョン間フェイルオーバー

## セキュリティ対策

1. **認証・認可**:
   - JWTベースの認証システム
   - 適切な権限設定と検証

2. **データ保護**:
   - 転送中データの暗号化（HTTPS/TLS）
   - 保存データの暗号化（MongoDB Atlas暗号化）

3. **API保護**:
   - レート制限の実装
   - CORS設定の適切な構成

## 運用メンテナンス

1. **定期的なアップデート**:
   - 依存パッケージの更新
   - セキュリティパッチの適用

2. **ユーザーフィードバックサイクル**:
   - フィードバック収集の仕組み
   - 改善のためのリリースサイクル

## 費用見積もり

| サービス | 項目 | 月額費用 (概算) |
|---------|------|--------------|
| MongoDB Atlas | M5クラスター (本番) | $25 〜 $50 |
| Google Cloud Run | コンピューティングとメモリ | $20 〜 $50 |
| Firebase Hosting | ストレージと転送 | $0 〜 $10 |
| Claude API | API呼び出し | $20 〜 $100 |
| **合計** | | **$65 〜 $210** |

※ 実際の費用は使用量とスケーリングによって変動します。

## デプロイチェックリスト

- [x] 環境変数がすべて設定されている
- [x] データベース接続が構成されている
- [x] APIキー（Claude）が設定されている
- [ ] フロントエンドのビルドが正常に完了した
- [ ] バックエンドのビルドが正常に完了した
- [ ] CORSの設定が適切に行われている
- [ ] SSL証明書が設定されている
- [x] 自動スケーリングのパラメータが設定されている
- [ ] 監視とアラートが設定されている
- [ ] バックアップが設定されている

## トラブルシューティング

**よくある問題と解決策**:

1. **API接続エラー**:
   - CORSの設定を確認
   - フロントエンドのAPI URLが正しく設定されているかを確認

2. **データベース接続エラー**:
   - 接続文字列の正確性を確認
   - ネットワークアクセスリストに現在のIPアドレスが含まれているか確認

3. **デプロイ失敗**:
   - ビルドログを確認
   - 環境変数がすべて設定されているか確認

4. **Claude API接続エラー**:
   - APIキーの有効性と制限を確認
   - リクエスト形式が正しいか確認

## 結論

本デプロイ戦略により、美容師向け陰陽五行AIケアコンパニオンは、信頼性が高く、スケーラブルな形でエンドユーザーに提供されます。MongoDB Atlas、Google Cloud Run、Firebase Hosting、Claude APIの組み合わせは、特に日本市場でのサービス提供に適しており、非技術者でも管理しやすい環境を実現します。CI/CDパイプラインの活用により、デプロイプロセスを自動化し、品質と安定性を確保します。