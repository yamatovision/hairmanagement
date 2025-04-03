/**
 * Jest テスト設定ファイル
 */
import { beforeAll, afterAll, jest } from '@jest/globals';

// テスト前の共通設定
beforeAll(async () => {
  console.log('テスト開始前の設定を実行します');
  // データベース接続など必要な設定があればここに記述
});

// テスト後の共通クリーンアップ
afterAll(async () => {
  console.log('テスト終了後のクリーンアップを実行します');
  // データベース切断など必要なクリーンアップ処理があればここに記述
});

// テストタイムアウトの設定（必要に応じて調整）
jest.setTimeout(30000);

// テスト用の環境変数設定
process.env.NODE_ENV = 'test';