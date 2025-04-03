import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { registerRoutes } from './interfaces/http/routes';
import './infrastructure/di/container'; // 依存性注入の設定を読み込む
// import { addDirectChatEndpoint } from './direct-chat'; // 直接チャットエンドポイント（新しいルートシステムに統合）

/**
 * Express アプリケーションの初期化
 * @returns 設定済みのExpressアプリケーション
 */
export function createApp(): Express {
  const app = express();
  
  // ミドルウェアの設定
  app.use(helmet()); // セキュリティヘッダーの設定
  app.use(cors()); // CORS設定
  app.use(express.json()); // JSONボディパーサー
  app.use(express.urlencoded({ extended: true })); // URL-encodedボディパーサー
  app.use(cookieParser()); // Cookieパーサー
  
  // ロギング設定
  const environment = process.env.NODE_ENV || 'development';
  if (environment === 'development') {
    app.use(morgan('dev')); // 開発環境ではリクエストログを出力
  }
  
  // 注：直接チャットエンドポイントは interfaces/http/routes/simple-conversation.routes.ts に移動しました
  // これによりクリーンアーキテクチャのルーティング機構に統合されました
  console.log('***** 直接チャットエンドポイントは標準ルート登録システム（interfaces/http/routes）で処理されます *****');
  
  // ルーターの設定
  const router = express.Router();
  registerRoutes(router);
  
  // APIのベースパスを設定 - index.tsでapi/v1の設定をしているため、二重にしない
  app.use(router);
  
  // ルートパスへのリクエスト
  app.get('/', (_, res) => {
    res.json({
      message: 'パトロールマネジメントAPIサーバー',
      version: '1.0.0',
      documentation: '/api-docs'
    });
  });
  
  // 404ハンドラー
  app.use((req, res, next) => {
    console.log('404処理対象:', req.path);
    res.status(404).json({
      message: 'リソースが見つかりません',
      code: 'NOT_FOUND'
    });
  });
  
  // エラーハンドラー
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
      message: err.message || 'サーバーエラーが発生しました',
      code: err.code || 'SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  });
  
  return app;
}