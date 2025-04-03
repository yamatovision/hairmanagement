#!/bin/bash

# 環境変数をバックエンド.envファイルから読み込む
ENV_FILE=./backend/.env

# 環境変数設定を表示
echo "環境変数を.envファイルから読み込みます: $ENV_FILE"

# .envファイルが存在するか確認
if [ ! -f "$ENV_FILE" ]; then
  echo "エラー: .envファイルが見つかりません: $ENV_FILE"
  exit 1
fi

# .envファイルから必要な変数を読み込む
CLAUDE_API_KEY=$(grep "^CLAUDE_API_KEY=" "$ENV_FILE" | cut -d '=' -f2)
CLAUDE_API_URL=$(grep "^CLAUDE_API_URL=" "$ENV_FILE" | cut -d '=' -f2)
CLAUDE_MODEL=$(grep "^CLAUDE_MODEL=" "$ENV_FILE" | cut -d '=' -f2)

# 読み込んだ値を確認
echo "環境変数の読み込み完了"
echo "CLAUDE_API_KEY: [セキュリティのため非表示]"
echo "CLAUDE_API_URL: $CLAUDE_API_URL"
echo "CLAUDE_MODEL: $CLAUDE_MODEL"

# 必要な変数が設定されているか確認
if [ -z "$CLAUDE_API_KEY" ]; then
  echo "警告: CLAUDE_API_KEYが設定されていません。"
  read -p "続行しますか？ (y/n): " CONTINUE
  if [ "$CONTINUE" != "y" ]; then
    echo "中止します。"
    exit 1
  fi
fi

# バックエンドを起動
echo "環境変数を設定してバックエンドを起動します..."
cd backend && CLAUDE_API_KEY="$CLAUDE_API_KEY" CLAUDE_API_URL="$CLAUDE_API_URL" CLAUDE_MODEL="$CLAUDE_MODEL" npm run dev