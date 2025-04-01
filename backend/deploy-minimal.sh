#!/bin/bash
set -e

# ======================================================================
# 最小限のExpressサーバーデプロイスクリプト
# ======================================================================

# 引数の解析: FEATURES
FEATURES=${FEATURES:-"all"}  # all, auth, core, db, fortune, team, conversation, analytics

# Configuration
PROJECT_ID=${GCP_PROJECT_ID:-"yamatovision-blue-lamp"}  # GCPプロジェクトID
SERVICE_NAME=${CLOUD_RUN_SERVICE_NAME:-"patrolmanagement-minimal"}  # Cloud Runサービス名
REGION=${GCP_REGION:-"asia-northeast1"}  # リージョン
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# 設定値をログ出力
echo "🔧 プロジェクト設定:"
echo "  - GCPプロジェクトID: ${PROJECT_ID}"
echo "  - Cloud Runサービス名: ${SERVICE_NAME}"
echo "  - リージョン: ${REGION}"
echo "  - デプロイするFEATURES: ${FEATURES}"

# システムアーキテクチャを確認
ARCH=$(uname -m)
if [ "$ARCH" = "arm64" ]; then
  echo "🔍 ARM64アーキテクチャを検出しました。クロスプラットフォームビルドを使用します..."
  USE_BUILDX=true
else
  USE_BUILDX=false
fi

# 最小限のDockerfileを使用したビルド
echo "🔨 最小限のExpressサーバーのイメージをビルドしています..."

# コンテキスト変数を構築（ビルド時に使用される）
BUILD_ARGS="--build-arg FEATURES=${FEATURES}"

# ARMアーキテクチャの場合はbuildxでクロスプラットフォームビルドを実行
if [ "$USE_BUILDX" = true ]; then
  echo "🏗️ クロスプラットフォームビルドを実行中（ARM64 -> AMD64）..."
  # Googleの認証を設定
  gcloud auth configure-docker gcr.io
  docker buildx build ${BUILD_ARGS} --platform linux/amd64 -t ${IMAGE_NAME} -f Dockerfile.minimal . --push
else
  # 通常のビルドとプッシュ
  docker build ${BUILD_ARGS} -t ${IMAGE_NAME} -f Dockerfile.minimal .
  echo "🚀 Pushing to Google Container Registry..."
  # Googleの認証を設定
  gcloud auth configure-docker gcr.io
  docker push ${IMAGE_NAME}
fi

# Google Cloudの認証状態を確認
echo "🔐 Google Cloud認証状態を確認中..."
if ! gcloud auth list 2>&1 | grep -q "Credentialed"; then
  echo "❌ Google Cloudにログインしていません。ログインを実行します..."
  gcloud auth login
fi

# プロジェクトを設定
echo "🔧 プロジェクトを設定中: ${PROJECT_ID}..."
gcloud config set project ${PROJECT_ID}

# メモリと起動タイムアウトを調整（最小構成）
MEMORY="256Mi"
TIMEOUT="60s"

echo "⚙️ メモリ: ${MEMORY}, タイムアウト: ${TIMEOUT}"

# 環境変数の設定
echo "NODE_ENV: production" > env-vars.yaml
echo "FEATURES: ${FEATURES}" >> env-vars.yaml
echo "CORS_ORIGIN: https://dailyfortune-app.web.app" >> env-vars.yaml

# デプロイ（メモリと最小/最大インスタンス数、起動タイムアウトを指定）
echo "🌐 Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --memory ${MEMORY} \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 2 \
  --port 8080 \
  --timeout ${TIMEOUT} \
  --concurrency 50 \
  --env-vars-file env-vars.yaml

# デプロイ結果を表示
if [ $? -eq 0 ]; then
  echo "✅ デプロイが完了しました！サービスURLを取得中..."
  SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format='value(status.url)')
  echo "🌍 サービスURL: ${SERVICE_URL}"
  echo "🔍 ヘルスチェックを実行するには: curl ${SERVICE_URL}/healthz"
  echo "📝 環境変数は以下のように設定されました:"
  echo "  - NODE_ENV: production"
  echo "  - FEATURES: ${FEATURES}"
  echo "  - CORS_ORIGIN: https://dailyfortune-app.web.app"
else
  echo "❌ デプロイ中にエラーが発生しました。エラーメッセージを確認してください。"
fi