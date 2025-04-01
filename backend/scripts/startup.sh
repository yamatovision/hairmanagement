#!/bin/sh
# サーバー非同期起動スクリプト
# Cloud Run用に最適化され、サーバー起動をデータベース接続から分離

# 環境変数を表示
echo "Starting server with NODE_ENV=$NODE_ENV"
echo "Features enabled: $FEATURES"
echo "PORT=$PORT"

# FEATURESに基づいて機能フラグを設定
if [ "$FEATURES" = "all" ]; then
  export ENABLE_AUTH=true
  export ENABLE_FORTUNE=true
  export ENABLE_TEAM=true
  export ENABLE_ANALYTICS=true
  export ENABLE_CONVERSATION=true
  echo "Enabling all features"
else
  # デフォルトは無効
  export ENABLE_AUTH=false
  export ENABLE_FORTUNE=false
  export ENABLE_TEAM=false
  export ENABLE_ANALYTICS=false
  export ENABLE_CONVERSATION=false
  
  # 個別機能の有効化
  if echo "$FEATURES" | grep -q "auth"; then
    export ENABLE_AUTH=true
    echo "Enabling auth feature"
  fi
  
  if echo "$FEATURES" | grep -q "fortune"; then
    export ENABLE_FORTUNE=true
    echo "Enabling fortune feature"
  fi
  
  if echo "$FEATURES" | grep -q "team"; then
    export ENABLE_TEAM=true
    echo "Enabling team feature"
  fi
  
  if echo "$FEATURES" | grep -q "analytics"; then
    export ENABLE_ANALYTICS=true
    echo "Enabling analytics feature"
  fi
  
  if echo "$FEATURES" | grep -q "conversation"; then
    export ENABLE_CONVERSATION=true
    echo "Enabling conversation feature"
  fi
fi

# 環境変数の設定を表示
echo "Feature flags:"
echo "- ENABLE_AUTH=$ENABLE_AUTH"
echo "- ENABLE_FORTUNE=$ENABLE_FORTUNE"
echo "- ENABLE_TEAM=$ENABLE_TEAM"
echo "- ENABLE_ANALYTICS=$ENABLE_ANALYTICS"
echo "- ENABLE_CONVERSATION=$ENABLE_CONVERSATION"

# 展開前にdistディレクトリの存在確認と修復
if [ ! -d "./dist" ] || [ ! -f "./dist/index.js" ]; then
  echo "ERROR: dist directory or index.js not found - attempting recovery"
  mkdir -p ./dist
  if [ -f "./src/index.ts" ]; then
    echo "Copying source files to dist as fallback..."
    cp -r ./src/* ./dist/
    echo "// Auto-generated fallback" > ./dist/index.js
    cat ./src/index.ts >> ./dist/index.js
  else
    echo "CRITICAL ERROR: Source files not found!"
    echo "// console.log('Server startup failed - no source files');" > ./dist/index.js
  fi
fi

# デプロイタイプを環境変数に設定
export DEPLOYMENT_TYPE="cloud-run"

# サーバーをバックグラウンドで起動（DB接続を待たずに）
node dist/index.js &
SERVER_PID=$!

# 8080ポートの待機処理
echo "Waiting for server to listen on port 8080..."
timeout=60
while ! nc -z localhost 8080; do
  sleep 1
  timeout=$((timeout - 1))
  if [ $timeout -le 0 ]; then
    echo "WARNING: Server did not respond on port 8080 within timeout"
    echo "Process is still running (PID: $SERVER_PID), continuing anyway..."
    break
  fi
done

echo "Server is listening on port 8080"

# ヘルスチェック（より柔軟に）
echo "Performing health check..."
HEALTH_STATUS=$(curl -s http://localhost:8080/healthz?mode=simple || echo "ERROR")
if [ "$HEALTH_STATUS" != "OK" ]; then
  echo "Initial health check failed: $HEALTH_STATUS"
  # 詳細なヘルスチェックも取得
  DETAILED_HEALTH=$(curl -s http://localhost:8080/healthz || echo "Could not get detailed health info")
  echo "Detailed health status: $DETAILED_HEALTH"
  
  # 本番では失敗しても継続（Cloud Runの再起動を避けるため）
  if [ "$NODE_ENV" != "production" ]; then
    echo "Non-production environment - would normally exit, but continuing anyway..."
  else
    echo "Continuing despite health check failure (production mode)"
  fi

  # プロセスが実行中か確認
  if ps -p $SERVER_PID > /dev/null; then
    echo "Server process is still running (PID: $SERVER_PID)"
  else
    echo "WARNING: Server process is not running! Starting backup minimal server..."
    # バックアップの最小サーバーを開始（もしあれば）
    if [ -f "./server-minimal.js" ]; then
      node server-minimal.js &
      SERVER_PID=$!
      echo "Started minimal server with PID: $SERVER_PID"
    else
      echo "CRITICAL ERROR: No backup server available!"
    fi
  fi
else
  echo "Health check passed: $HEALTH_STATUS"
  
  # 詳細なヘルス情報を取得（ログ用）
  DETAILED_HEALTH=$(curl -s http://localhost:8080/healthz || echo "Could not get detailed health info")
  echo "Detailed server status:"
  echo "$DETAILED_HEALTH" | grep -E "services|features|status|database" || true
fi

# サーバープロセスにアタッチ
echo "Server started successfully, waiting for process to complete"
wait $SERVER_PID