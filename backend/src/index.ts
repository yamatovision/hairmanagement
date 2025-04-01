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
import { setupDatabaseConnection, connectDB } from './db/connection';
import { healthCheck } from './utils/monitoring.util';
import { logger } from './utils/logger.util';

// 詳細なエラーハンドリングユーティリティをインポート
// TypeScriptエラーを無視：JSファイルだが必要なため
// @ts-ignore
import { requestLogger, errorHandler, getNetworkInfo } from './utils/error-handler';


// 環境変数の読み込み
dotenv.config();

// モデル登録を明示的に行う
import './domain/models/user.model';

// 依存性注入コンテナをロード
import { initializeEventHandlers } from './infrastructure/di/container';
import './infrastructure/di/container';

// クリーンアーキテクチャのルートのインポート
import { registerRoutes } from './interfaces/http/routes';
import teamRoutes from './interfaces/http/routes/team.routes';

// アプリケーションの初期化
console.log('アプリケーションの初期化を開始します...');
const app = express();
const PORT = parseInt(process.env.PORT || '5001', 10); // 数値型に変換
console.log(`使用ポート: ${PORT}`);

// ミドルウェアの設定
console.log('ミドルウェアを設定します...');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
}));
app.use(morgan('dev'));

// 詳細なCORS設定
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
console.log(`CORS設定: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);

// 詳細なリクエストロガーを追加
app.use(requestLogger);

// Winstonロガーによるリクエストログ記録も追加
app.use((req, res, next) => {
  logger.http(`${req.method} ${req.originalUrl || req.url}`, {
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent']
  });
  next();
});

// ネットワーク設定の詳細を出力
console.log('サーバーネットワーク設定:');
console.log(getNetworkInfo());

// エラーキャッチ用の未処理例外ハンドラを設定
process.on('uncaughtException', (err) => {
  console.error('未処理の例外が発生しました:');
  console.error(err);
  console.error(err.stack);
  
  // エラーをファイルに書き出して詳細を確認
  const fs = require('fs');
  fs.writeFileSync('error.log', JSON.stringify({
    message: err.message,
    stack: err.stack,
    name: err.name,
    time: new Date().toISOString()
  }, null, 2));
});

// Promiseの拒否をキャッチ
process.on('unhandledRejection', (reason, promise) => {
  console.error('未処理のPromise拒否が発生しました:');
  console.error('Reason:', reason);
  console.error('Promise:', promise);
});

// APIルートの設定
const apiPrefix = process.env.API_PREFIX || '/api';
const apiVersion = process.env.API_VERSION || 'v1';
const baseApiPath = `${apiPrefix}/${apiVersion}`;

// 機能フラグに基づいて、有効化されている機能を確認
const featureFlags = getFeatureFlags();
console.log(`有効化された機能: ${getEnabledFeaturesString()}`);

// フィーチャーフラグに関するログ
console.log('認証機能: ' + (featureFlags.enableAuth ? '有効' : '無効'));
console.log('運勢機能: ' + (featureFlags.enableFortune ? '有効' : '無効'));
console.log('チーム機能: ' + (featureFlags.enableTeam ? '有効' : '無効'));
console.log('分析機能: ' + (featureFlags.enableAnalytics ? '有効' : '無効'));
console.log('会話機能: ' + (featureFlags.enableConversation ? '有効' : '無効'));

// クリーンアーキテクチャのルート登録（機能フラグに基づく）
try {
  // クリーンアーキテクチャのルートを使用
  console.log('クリーンアーキテクチャのルート登録を試行...');
  const router = express.Router();
  registerRoutes(router);
  // 正しいAPIベースパスを設定
  app.use(baseApiPath, router);
  
  // 従来のルート構造も併用（後方互換性のために残す）
  // 但し新しいルート構造が正しく機能するためコメントアウト
  // app.use(`${apiPrefix}/teams`, teamRoutes);
  
  // デバッグ用 - ルート一覧表示
  try {
    console.log('登録されたルート:');
    if (router && router.stack) {
      router.stack.forEach((layer: any) => {
        if (layer && layer.route) {
          const methods = Object.keys(layer.route.methods).join(',');
          console.log(`${methods.toUpperCase()} ${baseApiPath}${layer.route.path}`);
        }
      });
    } else {
      console.log('ルーターが初期化されていないか、スタックが存在しません');
    }
  } catch (err) {
    console.error('ルート一覧の表示中にエラーが発生しました:', err);
  }
  
  console.log(`クリーンアーキテクチャのルート登録成功！ベースパス: ${baseApiPath}`);
} catch (error) {
  console.error('クリーンアーキテクチャのルート登録に失敗しました:', error);
  console.log('フォールバック: 最小限のルートエンドポイントのみを提供します');
  
  // 認証機能のみのフォールバックルート
  if (featureFlags.enableAuth) {
    app.post(`${baseApiPath}/auth/login`, (req: Request, res: Response) => {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'メールアドレスとパスワードが必要です' 
        });
      }
      
      res.json({
        success: true,
        message: 'ログイン成功',
        data: {
          user: {
            id: 'user-123',
            email: email,
            name: 'テストユーザー',
            role: 'user',
            element: '水',
            yinYang: '陰'
          },
          token: 'test-jwt-token-12345',
          refreshToken: 'test-refresh-token-67890'
        }
      });
    });
    
    app.get(`${baseApiPath}/auth/me`, (req: Request, res: Response) => {
      console.log('認証情報リクエストを受信: /auth/me');
      res.json({
        success: true,
        data: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            name: 'テストユーザー',
            role: 'user',
            element: '水',
            yinYang: '陰'
          }
        }
      });
    });
    
    // フロントエンドからのプロキシリクエストに対応するエンドポイント
    app.get(`${baseApiPath}/users/me`, (req: Request, res: Response) => {
      console.log('ユーザープロフィールリクエストを受信: /users/me');
      res.json({
        success: true,
        data: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            name: 'テストユーザー',
            role: 'user',
            element: '水',
            yinYang: '陰',
            profileImage: null
          }
        }
      });
    });
    
    // デバッグ用エンドポイント - プロキシ接続テスト
    app.get(`${baseApiPath}/debug/test-connection`, (req: Request, res: Response) => {
      console.log('接続テストリクエストを受信');
      res.json({
        success: true,
        message: 'バックエンド接続テスト成功',
        timestamp: new Date().toISOString(),
        headers: req.headers,
        clientIp: req.ip || req.connection.remoteAddress
      });
    });
    
    // favicon.icoリクエストに応答
    app.get('/favicon.ico', (req: Request, res: Response) => {
      console.log('favicon.icoリクエストを受信');
      res.status(204).end(); // 空の応答を返す
    });
    
    console.log('認証フォールバックルート登録完了');
  }
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

// 詳細なエラーログ記録ミドルウェア
app.use(errorHandler);

// エラーハンドラー
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('エラーハンドラーがエラーを処理中:', err.message);
  
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.errorCode,
      details: err.details,
      path: req.originalUrl || req.url,
      timestamp: new Date().toISOString()
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
      path: req.originalUrl || req.url,
      timestamp: new Date().toISOString()
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
      path: req.originalUrl || req.url,
      timestamp: new Date().toISOString()
    });
  }
  
  // プロキシエラーやネットワークエラーの特別処理
  if (err.name === 'ConnectionError' || (err as any).code === 'ECONNREFUSED') {
    console.error('接続エラーが発生しました:', err);
    return res.status(503).json({
      success: false,
      message: 'サービスに接続できません',
      code: 'CONNECTION_ERROR',
      details: {
        error: err.message,
        code: (err as any).code
      },
      path: req.originalUrl || req.url,
      timestamp: new Date().toISOString()
    });
  }
  
  const statusCode = 500;
  res.status(statusCode).json({
    success: false,
    message: 'サーバー内部エラーが発生しました',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.originalUrl || req.url,
    timestamp: new Date().toISOString()
  });
});

// データベース接続は db/connection.ts に移動

// サーバー起動（非同期DB接続処理付き）
const startServer = async (): Promise<void> => {
  try {
    console.log('============== サーバー起動プロセス開始 ==============');
    
    // 環境変数の確認
    console.log('環境変数:');
    console.log(`- NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`- PORT: ${process.env.PORT}`);
    console.log(`- MONGODB_URI: ${process.env.MONGODB_URI ? '設定済み' : '未設定'}`);
    console.log(`- DB_URI: ${process.env.DB_URI ? '設定済み' : '未設定'}`);
    console.log(`- SKIP_DB_ERRORS: ${process.env.SKIP_DB_ERRORS}`);
    console.log(`- EVENT_STORE_TYPE: ${process.env.EVENT_STORE_TYPE || 'デフォルト'}`);
    
    // 機能フラグの確認
    const featureFlags = getFeatureFlags();
    console.log('機能フラグ:');
    console.log(`- enableAuth: ${featureFlags.enableAuth}`);
    console.log(`- enableFortune: ${featureFlags.enableFortune}`);
    console.log(`- enableTeam: ${featureFlags.enableTeam}`);
    console.log(`- enableAnalytics: ${featureFlags.enableAnalytics}`);
    console.log(`- enableConversation: ${featureFlags.enableConversation}`);
    
    // データベース接続の初期化
    setupDatabaseConnection();
    
    // モデルが読み込まれていることを確認
    console.log('モデル読み込み状態:');
    if (!mongoose.models.User) {
      console.log('- Userモデルが見つかりません - 明示的に読み込みます');
      try {
        // モデルを明示的に読み込む
        require('./domain/models/user.model');
        console.log('- Userモデルを正常に読み込みました');
      } catch (modelError) {
        console.error('- Userモデルの読み込みに失敗しました:', modelError);
        if (modelError instanceof Error) {
          console.error(modelError.stack);
        }
      }
    } else {
      console.log('- Userモデルは既に登録されています');
    }
    
    // より詳細なエラーキャッチ
    try {
      console.log('データベース接続を開始します...');
      // データベース接続を適切に待機
      await connectDB();
      console.log('データベース接続が確立されました');
      
      // モデルの状態を確認
      const registeredModels = Object.keys(mongoose.models);
      console.log('登録済みMongooseモデル:', registeredModels.join(', '));
    } catch (dbError) {
      logger.error('データベース接続中にエラーが発生しました:', dbError);
      if (dbError instanceof Error) {
        logger.error('スタックトレース:', dbError.stack);
      }
      
      // データベースが必要かどうかを確認
      const needsDatabase = featureFlags.enableFortune || featureFlags.enableTeam || 
                           featureFlags.enableAnalytics || featureFlags.enableConversation;
      
      logger.info(`データベースが必要か: ${needsDatabase ? 'はい' : 'いいえ'}`);
      logger.info(`SKIP_DB_ERRORS: ${process.env.SKIP_DB_ERRORS}`);
      
      if (needsDatabase && process.env.SKIP_DB_ERRORS !== 'true') {
        logger.error('データベースが必要な機能が有効なため、起動を中止します');
        process.exit(1);
      }
      
      logger.warn('データベース接続エラーを無視して続行します (SKIP_DB_ERRORS=true または必要な機能が無効)');
    }
    
    // イベントハンドラーの初期化
    try {
      console.log('イベントハンドラーの初期化を開始します...');
      
      // イベントとハンドラーのソースファイルが存在することを確認
      try {
        const userEventsModule = require('./domain/events/user/UserEvents');
        console.log('UserEvents モジュールが正常に読み込まれました');
        
        const teamEventsModule = require('./domain/events/team/TeamEvents');
        console.log('TeamEvents モジュールが正常に読み込まれました');
        
        const conversationEventsModule = require('./domain/events/conversation/ConversationEvents');
        console.log('ConversationEvents モジュールが正常に読み込まれました');
        
        const userHandlersModule = require('./infrastructure/events/handlers/UserEventHandlers');
        console.log('UserEventHandlers モジュールが正常に読み込まれました');
        
        const teamHandlersModule = require('./infrastructure/events/handlers/TeamEventHandlers');
        console.log('TeamEventHandlers モジュールが正常に読み込まれました');
        
        const conversationHandlersModule = require('./infrastructure/events/handlers/ConversationEventHandlers');
        console.log('ConversationEventHandlers モジュールが正常に読み込まれました');
      } catch (moduleError) {
        console.error('イベント関連モジュールの読み込みに失敗しました:', moduleError);
        if (moduleError instanceof Error) {
          console.error(moduleError.stack);
        }
        throw moduleError;
      }
      
      // イベントハンドラー初期化
      initializeEventHandlers();
      console.log('イベント駆動アーキテクチャを初期化しました');
    } catch (eventError) {
      console.error('イベントハンドラー初期化エラー:', eventError);
      console.error('詳細:', eventError instanceof Error ? eventError.stack : '詳細なし');
      console.warn('イベントハンドラーのエラーを無視して最低限の機能で続行します');
    }
    
    // Cloud Run対応のために0.0.0.0にバインド（サーバー起動）
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`サーバーが起動しました: http://0.0.0.0:${PORT}`);
      console.log(`APIエンドポイント: http://0.0.0.0:${PORT}${baseApiPath}`);
      console.log(`環境変数PORT: ${process.env.PORT}`);
      console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
      
      // ルート一覧を表示
      try {
        console.log('有効なルート:');
        if (app && app._router && app._router.stack) {
          app._router.stack.forEach((r: any) => {
            if (r && r.route && r.route.path) {
              console.log(`${Object.keys(r.route.methods).join(',')} ${r.route.path}`);
            } else if (r && r.name === 'router' && r.handle && r.handle.stack) {
              r.handle.stack.forEach((stackItem: any) => {
                if (stackItem && stackItem.route) {
                  const methods = Object.keys(stackItem.route.methods).join(',');
                  console.log(`${methods} ${r.regexp} ${stackItem.route.path}`);
                }
              });
            }
          });
        } else {
          console.log('ルーターのスタックが見つかりませんでした');
        }
      } catch (err) {
        console.error('ルート一覧表示中のエラー:', err);
      }
    });
    
    // エラーハンドリングをサーバーに追加
    server.on('error', (err) => {
      if ((err as any).code === 'EADDRINUSE') {
        console.error(`ポート ${PORT} は既に使用されています。`);
        console.log('5秒後に別のポートで再試行します...');
        setTimeout(() => {
          server.close();
          app.listen(PORT + 1, '0.0.0.0', () => {
            console.log(`別のポートでサーバーが起動しました: http://0.0.0.0:${PORT + 1}`);
          });
        }, 5000);
      } else {
        console.error('サーバー起動エラー:', err);
        process.exit(1);
      }
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
  try {
    startServer().catch(err => {
      console.error('\n===================================================');
      console.error('サーバーの起動に失敗しました。シンプルサーバーを使用してください:');
      console.error('node server-minimal.js');
      console.error('===================================================\n');
      console.error('エラー詳細:', err);
      console.error('\n');
      process.exit(1);
    });
  } catch (error) {
    console.error('\n===================================================');
    console.error('サーバーの起動に失敗しました。シンプルサーバーを使用してください:');
    console.error('node server-minimal.js');
    console.error('===================================================\n');
    console.error('エラー詳細:', error);
    console.error('\n');
    process.exit(1);
  }
}

export default app;