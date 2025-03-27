#!/bin/bash

# パトロール管理システム デプロイスクリプト
# 使用方法: ./scripts/deploy.sh [環境名]
# 例: ./scripts/deploy.sh production

set -e

# カラー定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 環境の指定
ENV=${1:-production}
echo -e "${YELLOW}パトロール管理システムを ${ENV} 環境にデプロイします${NC}"

# 環境ファイルのチェック
ENV_FILE=".env.${ENV}"
if [ ! -f "$ENV_FILE" ]; then
  echo -e "${RED}エラー: ${ENV_FILE} が見つかりません${NC}"
  exit 1
fi

# Google Cloud認証確認
echo -e "${GREEN}Google Cloud認証を確認しています...${NC}"
if ! gcloud auth list 2>&1 | grep -q "ACTIVE"; then
  echo -e "${YELLOW}Google Cloudにログインしていません。ログインしてください...${NC}"
  gcloud auth login
fi

# プロジェクトIDの取得
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
  echo -e "${YELLOW}プロジェクトIDが設定されていません。プロジェクトIDを入力してください:${NC}"
  read -p "プロジェクトID: " PROJECT_ID
  gcloud config set project "$PROJECT_ID"
else
  echo -e "${GREEN}プロジェクトID: ${PROJECT_ID}${NC}"
fi

# リージョンの設定
REGION="asia-northeast1"
echo -e "${GREEN}デプロイリージョン: ${REGION}${NC}"

# バックエンドのビルドとデプロイ
echo -e "${GREEN}バックエンドをビルドしています...${NC}"
cd backend
npm ci
npm run build

echo -e "${GREEN}バックエンドをコンテナ化しています...${NC}"
TIMESTAMP=$(date +%Y%m%d%H%M%S)
IMAGE_NAME="gcr.io/${PROJECT_ID}/patrolmanagement-backend:${TIMESTAMP}"
gcloud builds submit --tag "$IMAGE_NAME"

echo -e "${GREEN}バックエンドをCloud Runにデプロイしています...${NC}"
# 環境変数の読み込み
source "../${ENV_FILE}"

# 環境変数の設定文字列を構築
ENV_VARS="NODE_ENV=${ENV}"
ENV_VARS="${ENV_VARS},PORT=8080"
ENV_VARS="${ENV_VARS},DB_URI=${DB_URI}"
ENV_VARS="${ENV_VARS},JWT_SECRET=${JWT_SECRET}"
ENV_VARS="${ENV_VARS},OPENAI_API_KEY=${OPENAI_API_KEY}"

gcloud run deploy patrolmanagement-backend \
  --image "$IMAGE_NAME" \
  --platform managed \
  --region "$REGION" \
  --allow-unauthenticated \
  --set-env-vars="$ENV_VARS"

# バックエンドのURLを取得
BACKEND_URL=$(gcloud run services describe patrolmanagement-backend --platform managed --region "$REGION" --format 'value(status.url)')
echo -e "${GREEN}バックエンドのURL: ${BACKEND_URL}${NC}"

# フロントエンドのビルドとデプロイ
echo -e "${GREEN}フロントエンドをビルドしています...${NC}"
cd ../frontend

# フロントエンド用の環境変数を設定
echo "REACT_APP_API_URL=${BACKEND_URL}/api" > .env.production.local

npm ci
npm run build

echo -e "${GREEN}フロントエンドをFirebase Hostingにデプロイしています...${NC}"
if ! command -v firebase &>/dev/null; then
  echo -e "${YELLOW}Firebase CLIがインストールされていません。インストールしています...${NC}"
  npm install -g firebase-tools
fi

# Firebaseにログイン
firebase login --no-localhost

# Firebase初期化（初回のみ）
if [ ! -f "firebase.json" ]; then
  echo -e "${YELLOW}Firebaseプロジェクトを初期化しています...${NC}"
  firebase init hosting
fi

# デプロイ
firebase deploy --only hosting

echo -e "${GREEN}デプロイが完了しました！${NC}"
echo -e "${YELLOW}フロントエンドURL: $(firebase hosting:info --json | jq -r '.result[0].hostingSite')${NC}"
echo -e "${YELLOW}バックエンドURL: ${BACKEND_URL}${NC}"

exit 0