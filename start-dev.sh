#!/bin/bash

# 開発サーバー起動スクリプト
# フロントエンドとバックエンドの両方を並行して起動します

echo "陰陽五行AIケアコンパニオン 開発サーバー起動"
echo "--------------------------------------"

# 環境変数の確認
if [ ! -f .env ]; then
  echo "⚠️ .envファイルが見つかりません。.env.exampleをコピーしてください。"
  exit 1
fi

# 必要なパッケージのインストール確認
echo "📦 依存関係を確認しています..."

# バックエンドの依存関係チェック
if [ ! -d "backend/node_modules" ]; then
  echo "🔄 バックエンドの依存関係をインストールしています..."
  cd backend && npm install
  cd ..
fi

# フロントエンドの依存関係チェック
if [ ! -d "frontend/node_modules" ]; then
  echo "🔄 フロントエンドの依存関係をインストールしています..."
  cd frontend && npm install
  cd ..
fi

# サーバー起動
echo "🚀 開発サーバーを起動しています..."
echo "📝 ログは各ターミナルに出力されます"
echo ""
echo "🔗 フロントエンド: http://localhost:3000"
echo "🔗 バックエンド API: http://localhost:5000/api/v1"
echo ""
echo "⏱️ サーバーの起動には数秒かかることがあります"
echo "📋 終了するには Ctrl+C を押してください"
echo "--------------------------------------"

# デバッグ用の環境変数を設定
echo "🔍 デバッグモードを有効化しています..."
export NODE_OPTIONS="--trace-warnings --trace-uncaught"
export DEBUG="*"
export LOG_LEVEL="debug"
export SKIP_DB_ERRORS="true"

# バックエンドのログファイルを初期化
BACKEND_LOG_FILE="./backend/logs/debug-server.log"
mkdir -p ./backend/logs
echo "🌟 サーバー起動ログ - $(date)" > $BACKEND_LOG_FILE

# 両方のサーバーを並行して起動
echo "🔍 バックエンドとフロントエンドを並行して起動しています..."
echo "📝 詳細なログは $BACKEND_LOG_FILE に記録されます"

# concurrentlyがインストールされているか確認
if ! command -v npx &> /dev/null || ! npx concurrently --version &> /dev/null; then
  echo "📦 concurrentlyをインストールしています..."
  npm install -g concurrently
fi

# 両方のサーバーを並行して起動
npx concurrently \
  "cd backend && NODE_ENV=development PORT=5001 npm run dev 2>&1 | tee -a $BACKEND_LOG_FILE" \
  "cd frontend && npm start"