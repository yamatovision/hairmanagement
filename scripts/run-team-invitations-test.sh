#!/bin/bash

# チーム招待機能のテストスクリプト実行ファイル

EXEC_DIR=$(dirname "$0")
PROJECT_ROOT=$(dirname "$EXEC_DIR")

cd "$PROJECT_ROOT/backend" && node "$PROJECT_ROOT/scripts/test-team-invitations.js"
