# パトロールマネジメント

## システム概要

陰陽五行の原理に基づいた運勢分析と組織マネジメントを統合するウェブアプリケーション。ユーザー（社員）の個人属性に基づく運勢予測、チーム編成の最適化、AI対話による業務サポートを提供します。

## セットアップ手順

### 前提条件

- Node.js (v18以上)
- MongoDB (v6.0以上)
- Git
- Docker (オプション)

### インストール

1. リポジトリをクローン
   ```bash
   git clone <repository-url>
   cd patrolmanagement
   ```

2. 依存関係のインストール
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   cd ../shared && npm install
   cd ..
   ```

3. 環境変数の設定
   ```bash
   # バックエンド用
   cd backend
   cp .env.example .env
   ```
   `.env`ファイルを編集して必要な設定を行います（最低限DB_URIとJWT_SECRET）。

### データベースのセットアップ

1. MongoDBが起動していることを確認します。

2. テストデータを投入します：
   ```bash
   npm run seed:test-data
   ```

3. 管理者ユーザーの作成：
   ```bash
   cd backend && npm run create-admin
   ```

### 開発サーバーの起動

**開発モードでの起動（推奨）**:
```bash
./start-dev.sh
```

これにより、フロントエンドサーバー（ポート3000）とバックエンドサーバー（ポート5001）が同時に起動します。

## テスト

### ユニットテスト
```bash
# バックエンドのテスト
cd backend && npm test

# フロントエンドのテスト
cd frontend && npm test
```

### E2Eテスト
```bash
# テストモードでCypressを開く
npm run cy:open

# ヘッドレスモードでテストを実行
npm run cy:run
```

## ログイン

テスト用アカウント：
- **管理者**: admin@example.com / Admin123!
- **マネージャー**: manager@example.com / Manager123!
- **一般ユーザー**: user@example.com / User123!

## 主要機能

- **五行属性プロファイル**: ユーザーの五行属性に基づいた個人プロファイル
- **日次運勢予測**: 属性に基づく日々の運勢とアドバイス提供
- **チーム相性分析**: メンバー間の相性を分析し最適な組み合わせを提案
- **AI対話サポート**: 業務や運勢に関するAIとの対話機能
- **経営者ダッシュボード**: 組織全体の相性状況と効率性の可視化

## プロジェクト構造

- `backend/` - クリーンアーキテクチャに基づくバックエンドAPI（Node.js, Express, MongoDB, TypeScript）
- `frontend/` - Reactベースのフロントエンドアプリケーション（TypeScript, React）
- `cypress/` - E2Eテスト
- `shared/` - バックエンドとフロントエンド間で共有される型定義とユーティリティ
- `docs/` - プロジェクトドキュメント
- `patrolmanagement-clean/` - クリーンアーキテクチャに移行中の新構造

## ドキュメント

詳細なドキュメントは`docs/`ディレクトリにあります：

- [要件定義](./docs/requirements.md)
- [開発状況](./docs/CURRENT_STATUS.md)
- [認証システム](./docs/auth-system.md)
- [E2Eテスト実装ガイド](./docs/e2e-testing-guide.md)
- [デプロイ戦略](./docs/deploy.md)
- [エラーハンドリングガイド](./docs/error-handling-guide.md)
- [ロギングガイド](./docs/logging-guide.md)
- [クリーンアーキテクチャ実装計画](./docs/clean-architecture-implementation-plan-final.md)

## CI/CD

GitHub Actionsワークフローが設定されており、以下のプロセスが自動化されています：

1. `ci.yml` - ビルドとテスト
   - 依存関係のインストール
   - TypeScriptのビルド
   - ユニットテストの実行
   - ESLintの実行

2. `cd.yml` - Cloud Runへのデプロイ
   - TypeScriptビルドと検証
   - Dockerイメージのビルドとプッシュ
   - Cloud Runへのデプロイ
   - デプロイ後の検証

3. `e2e-tests.yml` - E2Eテスト
   - 並列テスト実行
   - テスト結果の集計と報告

## ライセンス

Copyright © 2025 AppGenius2