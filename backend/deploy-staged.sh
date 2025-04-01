#!/bin/bash
set -e

# ======================================================================
# 段階的デプロイスクリプト - バックエンド
# 
# deploy-cloudrun.shの機能を維持しつつ、段階的デプロイに対応した拡張版
# ======================================================================

# 引数の解析: CONFIG_METHOD, FEATURES
CONFIG_METHOD=${CONFIG_METHOD:-"env_file"}  # env_file, env_vars, secret_manager
FEATURES=${FEATURES:-"all"}  # all, auth, core, db, fortune, team, conversation, analytics

# Configuration
PROJECT_ID=${GCP_PROJECT_ID:-"yamatovision-blue-lamp"}  # GCPプロジェクトID
SERVICE_NAME=${CLOUD_RUN_SERVICE_NAME:-"patrolmanagement-backend"}  # Cloud Runサービス名
REGION=${GCP_REGION:-"asia-northeast1"}  # リージョン
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# 設定値をログ出力（機密情報は除く）
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

# 設定ファイルの読み込み方法をチェック
if [ "$CONFIG_METHOD" = "env_file" ]; then
  # 環境変数ファイルからの読み込み
  if [ -f .env.cloudrun ]; then
    echo "📄 環境変数ファイル(.env.cloudrun)から設定を読み込みます..."
    # 環境変数の安全な読み込み（改行を含む値に対応）
    while IFS= read -r line || [ -n "$line" ]; do
      # コメント行または空行をスキップ
      [[ $line =~ ^[[:space:]]*# ]] || [ -z "$line" ] && continue
      # 変数名と値を抽出して環境変数に設定
      if [[ $line =~ ^([^=]+)=(.*)$ ]]; then
        key="${BASH_REMATCH[1]}"
        value="${BASH_REMATCH[2]}"
        # 値が引用符で囲まれている場合は引用符を削除
        value="${value%\"}"
        value="${value#\"}"
        value="${value%\'}"
        value="${value#\'}"
        export "$key=$value"
      fi
    done < .env.cloudrun
  else
    echo "⚠️ .env.cloudrun ファイルが見つかりません。テンプレートを作成します..."
    cat > .env.cloudrun << EOF
# Cloud Run用環境変数 - セキュリティのため本番値は記載せず別途管理してください
DB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key
CLAUDE_API_KEY=your_claude_api_key
CLAUDE_MODEL=claude-3-haiku-20240307
CORS_ORIGIN=https://dailyfortune-app.web.app

# アクセス制御と認証設定
# USE_SECRET_MANAGER=true にするとGoogle Secret Managerからシークレットを取得します
USE_SECRET_MANAGER=false

# Google Cloud設定
GCP_PROJECT_ID=yamatovision-blue-lamp
CLOUD_RUN_SERVICE_NAME=patrolmanagement-backend
GCP_REGION=asia-northeast1

# 段階的デプロイ設定
# 有効にする機能を指定（all, auth, db, core, fortune, team, conversation, analytics）
ENABLED_FEATURES=all
EOF
    echo "📝 .env.cloudrun テンプレートを作成しました。内容を確認して適切な値に編集してください。"
    echo "⚠️ 本番環境では機密情報を直接ファイルに記載せず、Secret Managerの使用を検討してください。"
    echo "編集が終わったら再度このスクリプトを実行してください。"
    exit 1
  fi
elif [ "$CONFIG_METHOD" = "env_vars" ]; then
  echo "📄 システム環境変数から設定を使用します..."
  # 必要な環境変数が既に設定されていることを前提とします
elif [ "$CONFIG_METHOD" = "secret_manager" ]; then
  echo "🔒 Google Secret Managerから直接設定を読み込みます..."
  USE_SECRET_MANAGER=true
  # ここでの処理は後の Secret Manager セクションで行われます
else
  echo "❌ 無効な CONFIG_METHOD: $CONFIG_METHOD"
  echo "env_file, env_vars, secret_manager のいずれかを指定してください。"
  exit 1
fi

# 必須環境変数の確認
if [ -z "$DB_URI" ] || [ -z "$JWT_SECRET" ] || [ -z "$CLAUDE_API_KEY" ]; then
  echo "❌ Error: Required environment variables are missing."
  echo "Please make sure DB_URI, JWT_SECRET, and CLAUDE_API_KEY are set in .env.cloudrun or enter them now:"
  
  if [ -z "$DB_URI" ]; then
    read -p "MongoDB URI (DB_URI): " DB_URI
  fi
  
  if [ -z "$JWT_SECRET" ]; then
    read -p "JWT Secret (JWT_SECRET): " JWT_SECRET
  fi
  
  if [ -z "$CLAUDE_API_KEY" ]; then
    read -p "Claude API Key (CLAUDE_API_KEY): " CLAUDE_API_KEY
  fi
fi

# FEATURESに基づいた環境変数の設定
ENV_FEATURE_VARS=""
if [ "$FEATURES" = "all" ]; then
  echo "🌟 すべての機能を有効化します"
  ENV_FEATURE_VARS="ENABLE_AUTH=true,ENABLE_FORTUNE=true,ENABLE_TEAM=true,ENABLE_ANALYTICS=true,ENABLE_CONVERSATION=true"
else
  # デフォルトはすべて無効
  ENV_FEATURE_VARS="ENABLE_AUTH=false,ENABLE_FORTUNE=false,ENABLE_TEAM=false,ENABLE_ANALYTICS=false,ENABLE_CONVERSATION=false"
  
  # 個別の機能を有効化
  if [[ "$FEATURES" == *"auth"* ]]; then
    echo "🔑 認証機能を有効化します"
    ENV_FEATURE_VARS="${ENV_FEATURE_VARS//ENABLE_AUTH=false/ENABLE_AUTH=true}"
  fi
  
  if [[ "$FEATURES" == *"fortune"* ]]; then
    echo "🔮 運勢機能を有効化します"
    ENV_FEATURE_VARS="${ENV_FEATURE_VARS//ENABLE_FORTUNE=false/ENABLE_FORTUNE=true}"
  fi
  
  if [[ "$FEATURES" == *"team"* ]]; then
    echo "👥 チーム機能を有効化します"
    ENV_FEATURE_VARS="${ENV_FEATURE_VARS//ENABLE_TEAM=false/ENABLE_TEAM=true}"
  fi
  
  if [[ "$FEATURES" == *"analytics"* ]]; then
    echo "📊 分析機能を有効化します"
    ENV_FEATURE_VARS="${ENV_FEATURE_VARS//ENABLE_ANALYTICS=false/ENABLE_ANALYTICS=true}"
  fi
  
  if [[ "$FEATURES" == *"conversation"* ]]; then
    echo "💬 会話機能を有効化します"
    ENV_FEATURE_VARS="${ENV_FEATURE_VARS//ENABLE_CONVERSATION=false/ENABLE_CONVERSATION=true}"
  fi
  
  # coreは常に有効（基本的なサーバー機能）
  if [[ "$FEATURES" == *"core"* ]] || [[ "$FEATURES" == *"db"* ]]; then
    echo "🔄 コア機能を有効化します"
  fi
fi

# 最適化されたDockerfileを使用したビルド
echo "🔨 Building Docker image with optimized TypeScript backend implementation..."

# コンテキスト変数を構築（ビルド時に使用される）
BUILD_ARGS="--build-arg FEATURES=${FEATURES}"

# ARMアーキテクチャの場合はbuildxでクロスプラットフォームビルドを実行
if [ "$USE_BUILDX" = true ]; then
  echo "🏗️ クロスプラットフォームビルドを実行中（ARM64 -> AMD64）..."
  # Googleの認証を設定
  gcloud auth configure-docker gcr.io
  
  # buildxが利用可能か確認
  if ! docker buildx version > /dev/null 2>&1; then
    echo "docker buildxが利用できません。通常のビルドを使用します..."
    docker build ${BUILD_ARGS} -t ${IMAGE_NAME} -f Dockerfile.cloudrun .
    echo "🚀 Pushing to Google Container Registry..."
    docker push ${IMAGE_NAME}
  else
    # 正しいbuildxコマンドを実行
    docker buildx build ${BUILD_ARGS} --platform linux/amd64 -t ${IMAGE_NAME} -f Dockerfile.cloudrun . --push
  fi
else
  # 通常のビルドとプッシュ
  docker build ${BUILD_ARGS} -t ${IMAGE_NAME} -f Dockerfile.cloudrun .
  echo "🚀 Pushing to Google Container Registry..."
  # Googleの認証を設定
  gcloud auth configure-docker gcr.io
  docker push ${IMAGE_NAME}
fi

# 環境変数の設定に Secret Manager を使用するか確認
USE_SECRET_MANAGER=${USE_SECRET_MANAGER:-false}

if [ "$USE_SECRET_MANAGER" = true ]; then
  echo "🔒 Google Secret Managerを使用して機密情報を取得します..."
  
  # Secret Managerからシークレットを取得する関数
  get_secret() {
    local secret_name=$1
    local project=$PROJECT_ID
    
    # シークレットが存在するか確認
    if gcloud secrets describe $secret_name --project=$project &>/dev/null; then
      echo "✅ シークレット $secret_name を取得します"
      gcloud secrets versions access latest --secret=$secret_name --project=$project
    else
      echo "⚠️ シークレット $secret_name が見つかりません。環境変数の値を使用します。"
      return 1
    fi
  }
  
  # 各シークレットの取得を試行
  DB_URI_SECRET=$(get_secret "patrolmanagement-db-uri") || echo "⚠️ DB_URIのシークレットが見つからないため、環境変数を使用します"
  JWT_SECRET_SECRET=$(get_secret "patrolmanagement-jwt-secret") || echo "⚠️ JWT_SECRETのシークレットが見つからないため、環境変数を使用します"
  CLAUDE_API_KEY_SECRET=$(get_secret "patrolmanagement-claude-api-key") || echo "⚠️ CLAUDE_API_KEYのシークレットが見つからないため、環境変数を使用します"
  
  # シークレットが取得できた場合は使用、そうでなければ環境変数を使用
  DB_URI=${DB_URI_SECRET:-$DB_URI}
  JWT_SECRET=${JWT_SECRET_SECRET:-$JWT_SECRET}
  CLAUDE_API_KEY=${CLAUDE_API_KEY_SECRET:-$CLAUDE_API_KEY}
  
  echo "🔐 シークレットの取得完了"
fi

# 環境変数の設定文字列を構築（PORTは自動的に設定されるため削除）
ENV_VARS="NODE_ENV=production,SKIP_DB=false,SKIP_DB_ERRORS=true,DB_URI=${DB_URI},JWT_SECRET=${JWT_SECRET},CLAUDE_API_KEY=${CLAUDE_API_KEY},CLAUDE_MODEL=${CLAUDE_MODEL:-claude-3-haiku-20240307},CORS_ORIGIN=${CORS_ORIGIN:-https://dailyfortune-app.web.app},${ENV_FEATURE_VARS}"

# 環境変数が実際に設定されていることを確認（値は表示せず）
for var in DB_URI JWT_SECRET CLAUDE_API_KEY CLAUDE_MODEL CORS_ORIGIN; do
  if [ -n "${!var}" ]; then
    echo "✅ 環境変数 $var が設定されています"
  else
    echo "⚠️ 環境変数 $var が設定されていません！"
  fi
done

# Google Cloudの認証状態を確認
echo "🔐 Google Cloud認証状態を確認中..."
if ! gcloud auth list 2>&1 | grep -q "Credentialed"; then
  echo "❌ Google Cloudにログインしていません。ログインを実行します..."
  gcloud auth login
fi

# プロジェクトを設定
echo "🔧 プロジェクトを設定中: ${PROJECT_ID}..."
gcloud config set project ${PROJECT_ID}

# メモリと起動タイムアウトを調整（機能数に応じて）
MEMORY="512Mi"
TIMEOUT="300s"
if [[ "$FEATURES" == *"all"* ]]; then
  MEMORY="512Mi"
  TIMEOUT="300s"
elif [[ "$FEATURES" == *"auth"* ]] && [[ "$FEATURES" == *"core"* ]] && [[ "$FEATURES" != *"fortune"* ]] && [[ "$FEATURES" != *"team"* ]] && [[ "$FEATURES" != *"conversation"* ]]; then
  # 認証とコアのみの最小構成
  MEMORY="256Mi"
  TIMEOUT="120s"
fi

echo "⚙️ メモリ: ${MEMORY}, タイムアウト: ${TIMEOUT}"

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
  --set-env-vars="${ENV_VARS}"

# デプロイ結果を表示
if [ $? -eq 0 ]; then
  echo "✅ デプロイが完了しました！サービスURLを取得中..."
  SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format='value(status.url)')
  echo "🌍 サービスURL: ${SERVICE_URL}"
  echo "🔍 ヘルスチェックを実行するには: curl ${SERVICE_URL}/healthz"
  echo "📝 環境変数は以下のように設定されました:"
  echo "  - NODE_ENV: production"
  echo "  - SKIP_DB: false"
  echo "  - SKIP_DB_ERRORS: true"
  echo "  - DB_URI: [設定済み]"
  echo "  - JWT_SECRET: [設定済み]"
  echo "  - CLAUDE_API_KEY: [設定済み]"
  echo "  - CLAUDE_MODEL: ${CLAUDE_MODEL:-claude-3-haiku-20240307}"
  echo "  - CORS_ORIGIN: ${CORS_ORIGIN:-https://dailyfortune-app.web.app}"
  echo "  - 有効な機能: ${FEATURES}"
else
  echo "❌ デプロイ中にエラーが発生しました。エラーメッセージを確認してください。"
fi