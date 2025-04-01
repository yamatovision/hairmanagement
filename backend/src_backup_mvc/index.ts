import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { CustomError } from './utils/error.util';
import getFeatureFlags, { getEnabledFeaturesString } from './feature-flags';
import { setupDatabaseConnection } from './db/connection';
import { healthCheck } from './utils/monitoring.util';

// 環境変数の読み込み
dotenv.config();

// 依存性注入コンテナをロード
import { initializeEventHandlers } from './infrastructure/di/container';
import './infrastructure/di/container';

// ルートのインポート
import authRoutes from './api/routes/auth.routes';
import analyticsRoutes from './api/routes/analytics.routes';
import fortuneRoutes from './api/routes/fortune.routes';
import teamRoutes from './api/routes/team.routes';
import team2Routes from './api/routes/team2.routes';
import conversationRoutes from './api/routes/conversation.routes';
import { userRoutes } from './api/routes/user.routes';
// 本番環境用の設定 - テストルートやモックは使用しない

// アプリケーションの初期化
const app = express();
const PORT = parseInt(process.env.PORT || '5001', 10); // 数値型に変換

// ミドルウェアの設定
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// 本番環境ではモックは使用しない

// APIルートの設定
const apiPrefix = process.env.API_PREFIX || '/api';
const apiVersion = process.env.API_VERSION || 'v1';
const baseApiPath = `${apiPrefix}/${apiVersion}`;

// 機能フラグに基づいて、有効化されている機能を確認
const featureFlags = getFeatureFlags();
console.log(`有効化された機能: ${getEnabledFeaturesString()}`);

// 認証ルートは常に有効（コアのセキュリティ機能）
app.use(`${baseApiPath}/auth`, authRoutes);
app.use(`${baseApiPath}/users`, userRoutes); // ユーザー情報APIを有効化

// 条件付きでルートを有効化
if (featureFlags.enableAnalytics) {
  console.log('分析ルートを有効化しています');
  app.use(`${baseApiPath}/analytics`, analyticsRoutes);
}

if (featureFlags.enableFortune) {
  console.log('運勢ルートを有効化しています');
  app.use(`${baseApiPath}/fortune`, fortuneRoutes);
}

if (featureFlags.enableTeam) {
  console.log('チームルートを有効化しています');
  app.use(`${baseApiPath}/team`, teamRoutes);
  app.use(`${baseApiPath}/teams`, team2Routes); // 新しいチーム管理APIを追加
}

if (featureFlags.enableConversation) {
  console.log('会話ルートを有効化しています');
  app.use(`${baseApiPath}/conversation`, conversationRoutes);
}

// ルートレスポンス
// ルートハンドラー（削除：重複しているため）

// 健康チェックエンドポイント（Cloud Run用）
app.get('/_ah/health', async (req: Request, res: Response) => {
  console.log('健康チェックリクエスト受信: /_ah/health');
  // 詳細なヘルスチェック情報を返す
  const healthInfo = await healthCheck();
  res.status(healthInfo.status === 'up' ? 200 : 503).json(healthInfo);
});

// 標準ヘルスチェックエンドポイント
app.get('/healthz', async (req: Request, res: Response) => {
  console.log('健康チェックリクエスト受信: /healthz');
  
  // シンプルモードの場合は迅速に応答
  if (req.query.mode === 'simple') {
    return res.status(200).send('OK');
  }
  
  // 詳細モードの場合は完全なヘルスチェックを実行
  const healthInfo = await healthCheck();
  res.status(healthInfo.status === 'up' ? 200 : 503).json(healthInfo);
});

// Cloud Run自動ヘルスチェック用の特別なエンドポイント
app.get('/', (req: Request, res: Response) => {
  if (req.headers['user-agent']?.includes('Google-Cloud-Run')) {
    console.log('Cloud Runヘルスチェック検出');
    return res.status(200).send('OK - Cloud Run Health Check');
  }
  // 通常のルートレスポンス - 有効化された機能も表示
  res.json({ 
    message: '美容師向け陰陽五行AIケアコンパニオン API',
    enabled_features: getEnabledFeaturesString(),
    version: process.env.npm_package_version || 'unknown',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// 404ハンドラー
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'リソースが見つかりません' });
});

// エラーハンドラー
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.errorCode,
      details: err.details
    });
  }
  
  // MongooseのValidationErrorの処理
  if (err.name === 'ValidationError') {
    const validationErrors: { [key: string]: string } = {};
    
    // @ts-ignore - Mongooseのエラーオブジェクトのため
    Object.keys(err.errors).forEach(key => {
      // @ts-ignore
      validationErrors[key] = err.errors[key].message;
    });
    
    return res.status(400).json({
      success: false,
      message: 'バリデーションエラー',
      code: 'VALIDATION_ERROR',
      details: validationErrors,
    });
  }

  // MongoDBの重複キーエラー
  // @ts-ignore - MongoDBの特定エラータイプ
  if (err.code === 11000) {
    // @ts-ignore
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `この${field}は既に使用されています`,
      code: 'DUPLICATE_KEY_ERROR',
      details: { field },
    });
  }
  
  const statusCode = 500;
  res.status(statusCode).json({
    success: false,
    message: 'サーバー内部エラーが発生しました',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// データベース接続は db/connection.ts に移動

// サーバー起動（非同期DB接続処理付き）
const startServer = async () => {
  try {
    // より詳細なエラーキャッチ
    try {
      // 非同期でDB接続を設定 - エラーを捕捉するために先に実行
      setupDatabaseConnection();
    } catch (dbError) {
      console.error('データベース接続中にエラーが発生しました:', dbError);
      console.error('エラー詳細:', JSON.stringify(dbError, null, 2));
      // データベースエラーはスキップして続行
    }
    
    // イベントハンドラーの初期化
    initializeEventHandlers();
    console.log('イベント駆動アーキテクチャを初期化しました');
    
    // Cloud Run対応のために0.0.0.0にバインド（先にサーバー起動）
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`サーバーが起動しました: http://0.0.0.0:${PORT}`);
      console.log(`APIエンドポイント: http://0.0.0.0:${PORT}${baseApiPath}`);
      console.log(`環境変数PORT: ${process.env.PORT}`);
      console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
      
      // ルート一覧を表示
      console.log('有効なルート:');
      app._router.stack.forEach((r: any) => {
        if (r.route && r.route.path) {
          console.log(`${Object.keys(r.route.methods).join(',')} ${r.route.path}`);
        } else if (r.name === 'router' && r.handle.stack) {
          r.handle.stack.forEach((stackItem: any) => {
            if (stackItem.route) {
              const methods = Object.keys(stackItem.route.methods).join(',');
              console.log(`${methods} ${r.regexp} ${stackItem.route.path}`);
            }
          });
        }
      });
    });
    
    // 適切なシャットダウン処理
    const signals = ['SIGTERM', 'SIGINT'];
    signals.forEach(signal => {
      process.on(signal, () => {
        console.log(`${signal}を受信しました。サーバーをシャットダウンします...`);
        server.close(() => {
          console.log('サーバーを正常にシャットダウンしました');
          // DB切断
          if (mongoose.connection.readyState !== 0) {
            mongoose.connection.close().then(() => {
              console.log('MongoDB接続を正常に終了しました');
              process.exit(0);
            }).catch(() => process.exit(0));
          } else {
            process.exit(0);
          }
        });
      });
    });
  } catch (error) {
    console.error('サーバー起動エラー:', error);
    console.error('エラースタック:', error instanceof Error ? error.stack : 'スタックなし');
    // エラーステータスで終了
    process.exit(1);
  }
};

// テスト用にアプリケーションをエクスポート
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;