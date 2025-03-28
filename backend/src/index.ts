import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { CustomError } from './utils/error.util';

// 環境変数の読み込み
dotenv.config();

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
const PORT = parseInt(process.env.PORT || '8080', 10); // 数値型に変換

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

app.use(`${baseApiPath}/auth`, authRoutes);
app.use(`${baseApiPath}/analytics`, analyticsRoutes);
app.use(`${baseApiPath}/fortune`, fortuneRoutes);
app.use(`${baseApiPath}/team`, teamRoutes);
app.use(`${baseApiPath}/teams`, team2Routes); // 新しいチーム管理APIを追加
// 本番環境ではテストルートを無効化
// すべてのルートを有効化
app.use(`${baseApiPath}/conversation`, conversationRoutes);
app.use(`${baseApiPath}/users`, userRoutes); // ユーザー情報APIを有効化

// ルートレスポンス
app.get('/', (req: Request, res: Response) => {
  res.json({ message: '美容師向け陰陽五行AIケアコンパニオン API' });
});

// 健康チェックエンドポイント（Cloud Run用）
app.get('/_ah/health', (req: Request, res: Response) => {
  console.log('健康チェックリクエスト受信');
  res.status(200).send('OK');
});

// もう一つの健康チェックエンドポイント
app.get('/healthz', (req: Request, res: Response) => {
  console.log('健康チェックリクエスト受信 (/healthz)');
  res.status(200).send('OK');
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
      code: err.code,
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

// データベース接続
const connectDB = async () => {
  try {
    // MONGODB_URIかDB_URIを試し、両方なければデフォルト値を使用
    const dbUri = process.env.MONGODB_URI || process.env.DB_URI || 'mongodb://localhost:27017/patrolmanagement';
    
    // 本番環境では必ずDBに接続
    
    await mongoose.connect(dbUri);
    console.log('MongoDB接続成功！');
  } catch (error) {
    console.error('MongoDB接続エラー:', error);
    
    // データベース接続エラーの場合は終了
    process.exit(1);
  }
};

// サーバー起動
const startServer = async () => {
  try {
    await connectDB();
    
    // Cloud Run対応のために0.0.0.0にバインド
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`サーバーが起動しました: http://0.0.0.0:${PORT}`);
      console.log(`APIエンドポイント: http://0.0.0.0:${PORT}${baseApiPath}`);
      console.log(`環境変数PORT: ${process.env.PORT}`);
      console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
    });
    
    // 適切なシャットダウン処理
    const signals = ['SIGTERM', 'SIGINT'];
    signals.forEach(signal => {
      process.on(signal, () => {
        console.log(`${signal}を受信しました。サーバーをシャットダウンします...`);
        server.close(() => {
          console.log('サーバーを正常にシャットダウンしました');
          process.exit(0);
        });
      });
    });
  } catch (error) {
    console.error('サーバー起動エラー:', error);
    // エラーステータスで終了
    process.exit(1);
  }
};

// テスト用にアプリケーションをエクスポート
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;