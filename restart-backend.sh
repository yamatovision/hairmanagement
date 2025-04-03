#!/bin/bash

# バックエンドサーバーを再起動するスクリプト

# 色の設定
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}バックエンドサーバーを再起動します...${NC}"

# 現在のディレクトリを保存
CURRENT_DIR=$(pwd)

# バックエンドディレクトリに移動
cd "$(dirname "$0")/backend" || { echo -e "${RED}バックエンドディレクトリに移動できません${NC}"; exit 1; }

# 既存のNode.jsプロセスを検索して停止
echo -e "${BLUE}既存のバックエンドプロセスを停止中...${NC}"
pkill -f "node.*backend"
sleep 2

# バックエンドを起動
echo -e "${BLUE}バックエンドサーバーを起動中...${NC}"
NODE_ENV=development PORT=3001 ENABLE_CONVERSATION=true DEBUG=express:* npm run dev &

# プロセスがバックグラウンドで起動するのを待つ
echo -e "${BLUE}サーバーの起動を待機中...${NC}"
sleep 5

# サーバー起動確認
if lsof -i:3001 -t >/dev/null 2>&1; then
  echo -e "${GREEN}バックエンドサーバーが起動しました (ポート3001)${NC}"
else
  echo -e "${RED}バックエンドサーバーの起動に失敗した可能性があります${NC}"
fi

# 元のディレクトリに戻る
cd "$CURRENT_DIR" || exit 1

echo -e "${GREEN}完了しました - 直接会話エンドポイントをテストするには:${NC}"
echo -e "${GREEN}node test/test-direct-chat.js \"テストメッセージ\"${NC}"