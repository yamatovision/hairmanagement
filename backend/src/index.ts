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
import testAnalyticsRoutes from './api/routes/test-analytics.routes';
import { testModeMiddleware } from './api/middlewares/test-mode.middleware';

// アプリケーションの初期化
const app = express();
const PORT = process.env.PORT || 5001; // 5001に戻す

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

// テストモードミドルウェアを追加
app.use(testModeMiddleware);

// APIルートの設定
const apiPrefix = process.env.API_PREFIX || '/api';
const apiVersion = process.env.API_VERSION || 'v1';
const baseApiPath = `${apiPrefix}/${apiVersion}`;

app.use(`${baseApiPath}/auth`, authRoutes);
app.use(`${baseApiPath}/analytics`, analyticsRoutes);
app.use(`${baseApiPath}/fortune`, fortuneRoutes);
app.use(`${baseApiPath}/team`, teamRoutes);
app.use(`${baseApiPath}/teams`, team2Routes); // 新しいチーム管理APIを追加
// テスト用ルート（認証なし）
app.use(`${baseApiPath}/test`, testAnalyticsRoutes);
// すべてのルートを有効化
app.use(`${baseApiPath}/conversation`, conversationRoutes);
app.use(`${baseApiPath}/users`, userRoutes); // ユーザー情報APIを有効化

// ルートレスポンス
app.get('/', (req: Request, res: Response) => {
  res.json({ message: '美容師向け陰陽五行AIケアコンパニオン API' });
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
    const dbUri = process.env.DB_URI || 'mongodb://localhost:27017/patrolmanagement';
    await mongoose.connect(dbUri);
    console.log('MongoDB接続成功！');
  } catch (error) {
    console.error('MongoDB接続エラー:', error);
    process.exit(1);
  }
};

// サーバー起動
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`サーバーが起動しました: http://localhost:${PORT}`);
      console.log(`APIエンドポイント: http://localhost:${PORT}${baseApiPath}`);
    });
  } catch (error) {
    console.error('サーバー起動エラー:', error);
  }
};

// テスト用にアプリケーションをエクスポート
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;