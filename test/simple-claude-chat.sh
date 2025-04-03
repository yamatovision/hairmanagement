#!/bin/bash

# シンプルClaudeAI会話シェルスクリプト
# 
# 使い方:
# ./test/simple-claude-chat.sh "あなたの質問をここに入力"

# 色の設定
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# プロジェクトのルートディレクトリを取得
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# ユーザーメッセージの取得
if [ $# -eq 0 ]; then
  echo -e "${RED}エラー: メッセージが指定されていません${NC}"
  echo "使い方: $0 \"あなたの質問をここに入力\""
  exit 1
fi

USER_MESSAGE="$1"

# Nodeスクリプト実行
echo -e "${BLUE}シンプルClaudeAI会話を開始します...${NC}"
cd "$ROOT_DIR" && node test/simple-claude-chat.js "$USER_MESSAGE"

# 終了コード
exit_code=$?
if [ $exit_code -ne 0 ]; then
  echo -e "\n${RED}エラーが発生しました（終了コード: $exit_code）${NC}"
  exit $exit_code
fi