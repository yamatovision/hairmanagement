#!/bin/bash

# スクリプトの実行元ディレクトリに移動
cd "$(dirname "$0")/.."

# バックエンドを起動
cd backend
echo "バックエンドサーバーを起動しています..."
npm start &
BACKEND_PID=$!

# 3秒待ってからテストを実行
echo "3秒待機してからテストを実行します..."
sleep 3

# プロジェクトルートに戻る
cd ..

# テストを実行
echo "認証APIテストを実行します..."
node scripts/test-auth-api.js

# バックエンドサーバーを終了
echo "バックエンドサーバーを終了します..."
kill $BACKEND_PID

echo "テスト完了"