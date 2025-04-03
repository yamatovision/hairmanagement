#!/bin/bash

# 環境変数をバックエンド.envファイルから読み込むスクリプト
ENV_FILE=./backend/.env

# 環境変数設定を表示
echo "環境変数を.envファイルから読み込みます: $ENV_FILE"

# .envファイルが存在するか確認
if [ ! -f "$ENV_FILE" ]; then
  echo "エラー: .envファイルが見つかりません: $ENV_FILE"
  exit 1
fi

# .envファイルから全ての環境変数を読み込む
echo "すべての環境変数を読み込んでいます..."

# 環境変数をエクスポート
export $(grep -v '^#' "$ENV_FILE" | xargs -0)

# 特に重要な変数が読み込まれたか確認
CLAUDE_API_KEY=$(grep "^CLAUDE_API_KEY=" "$ENV_FILE" | cut -d '=' -f2)
CLAUDE_API_URL=$(grep "^CLAUDE_API_URL=" "$ENV_FILE" | cut -d '=' -f2)
CLAUDE_MODEL=$(grep "^CLAUDE_MODEL=" "$ENV_FILE" | cut -d '=' -f2)
MONGODB_URI=$(grep "^MONGODB_URI=" "$ENV_FILE" | cut -d '=' -f2)

# 読み込んだ値を確認（セキュリティのため鍵値は部分的に表示）
echo "環境変数の読み込み完了"
echo "CLAUDE_API_KEY: [${CLAUDE_API_KEY:0:10}...${CLAUDE_API_KEY: -5}]"
echo "CLAUDE_API_URL: $CLAUDE_API_URL"
echo "CLAUDE_MODEL: $CLAUDE_MODEL"
echo "MONGODB_URI: $MONGODB_URI"

# 必要な変数が設定されているか確認
if [ -z "$CLAUDE_API_KEY" ]; then
  echo "警告: CLAUDE_API_KEYが設定されていません。"
  read -p "続行しますか？ (y/n): " CONTINUE
  if [ "$CONTINUE" != "y" ]; then
    echo "中止します。"
    exit 1
  fi
fi

if [ -z "$MONGODB_URI" ]; then
  echo "警告: MONGODB_URIが設定されていません。"
  read -p "続行しますか？ (y/n): " CONTINUE
  if [ "$CONTINUE" != "y" ]; then
    echo "中止します。"
    exit 1
  fi
fi

# バックエンドを起動（環境変数を引き継いだ状態で）
echo "環境変数を設定してバックエンドを起動します..."
cd backend && npm run dev

# 起動後に状態を表示
echo "バックエンド起動完了"