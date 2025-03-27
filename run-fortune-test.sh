#\!/bin/bash

# テスト環境を設定
export NODE_ENV=test

# バックエンドディレクトリに移動
cd "$(dirname "$0")/backend"

# テスト実行
echo "運勢APIエンドポイントのテストを実行します..."
node ../scripts/test-fortune-endpoints.js

# 終了ステータスを保持
EXIT_CODE=$?

# 終了
exit $EXIT_CODE
