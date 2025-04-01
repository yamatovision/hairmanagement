#!/bin/bash
set -e

# ======================================================================
# シンプルサーバーデプロイスクリプト
# ======================================================================

# Configuration
PROJECT_ID=${GCP_PROJECT_ID:-"yamatovision-blue-lamp"}  # GCPプロジェクトID
SERVICE_NAME=${CLOUD_RUN_SERVICE_NAME:-"patrolmanagement-simple"}  # Cloud Runサービス名
REGION=${GCP_REGION:-"asia-northeast1"}  # リージョン
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# 設定値をログ出力
echo "🔧 プロジェクト設定:"
echo "  - GCPプロジェクトID: ${PROJECT_ID}"
echo "  - Cloud Runサービス名: ${SERVICE_NAME}"
echo "  - リージョン: ${REGION}"

# システムアーキテクチャを確認
ARCH=$(uname -m)
if [ "$ARCH" = "arm64" ]; then
  echo "🔍 ARM64アーキテクチャを検出しました。クロスプラットフォームビルドを使用します..."
  USE_BUILDX=true
else
  USE_BUILDX=false
fi

# シンプルなDockerfile
echo "🔨 シンプルなExpressサーバーのイメージをビルドしています..."

# ARMアーキテクチャの場合はbuildxでクロスプラットフォームビルドを実行
if [ "$USE_BUILDX" = true ]; then
  echo "🏗️ クロスプラットフォームビルドを実行中（ARM64 -> AMD64）..."
  # Googleの認証を設定
  gcloud auth configure-docker gcr.io
  docker buildx build --platform linux/amd64 -t ${IMAGE_NAME} -f Dockerfile.simple . --push
else
  # 通常のビルドとプッシュ
  docker build -t ${IMAGE_NAME} -f Dockerfile.simple .
  echo "🚀 Pushing to Google Container Registry..."
  # Googleの認証を設定
  gcloud auth configure-docker gcr.io
  docker push ${IMAGE_NAME}
fi

# プロジェクトを設定
echo "🔧 プロジェクトを設定中: ${PROJECT_ID}..."
gcloud config set project ${PROJECT_ID}

# デプロイ（メモリと最小/最大インスタンス数、起動タイムアウトを指定）
echo "🌐 Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --memory 256Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 2 \
  --port 8080 \
  --timeout 300s \
  --concurrency 50

# デプロイ結果を表示
if [ $? -eq 0 ]; then
  echo "✅ デプロイが完了しました！サービスURLを取得中..."
  SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format='value(status.url)')
  echo "🌍 サービスURL: ${SERVICE_URL}"
  echo "🔍 ヘルスチェックを実行するには: curl ${SERVICE_URL}/healthz"
else
  echo "❌ デプロイ中にエラーが発生しました。エラーメッセージを確認してください。"
fi