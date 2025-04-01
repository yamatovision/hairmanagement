/**
 * 開発効率特化サーバー
 * セキュリティ考慮なし、エラー表示を最大化
 */
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const helmet = require('helmet');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// アプリケーションの初期化
console.log('開発効率特化サーバーを起動します...');
const app = express();
const PORT = process.env.PORT || 5001;

// 環境変数のオーバーライド
process.env.NODE_ENV = 'development';
process.env.DEBUG = '*';

// エラーが発生したら最大限詳細を表示する設定
process.on('uncaughtException', (err) => {
  console.error('\n==================== 未処理の例外 ====================');
  console.error(`時刻: ${new Date().toISOString()}`);
  console.error(`名前: ${err.name}`);
  console.error(`メッセージ: ${err.message}`);
  console.error(`スタックトレース:\n${err.stack}`);
  
  // エラーの詳細プロパティ表示
  try {
    const errorDetails = Object.getOwnPropertyNames(err)
      .filter(key => key !== 'name' && key !== 'message' && key !== 'stack')
      .reduce((obj, key) => {
        obj[key] = err[key];
        return obj;
      }, {});
      
    if (Object.keys(errorDetails).length > 0) {
      console.error('詳細情報:', errorDetails);
    }
  } catch (detailsError) {
    console.error('エラー詳細の抽出中にエラーが発生:', detailsError);
  }
  
  console.error('======================================================\n');
  
  // プロセスを終了しない - エラーがあっても継続
  // process.exit(1); 
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n================ 未処理のPromise拒否 ================');
  console.error(`時刻: ${new Date().toISOString()}`);
  console.error('理由:', reason);
  console.error('Promise:', promise);
  console.error('======================================================\n');
});

// 詳細なロギング
app.use(morgan('dev'));
app.use((req, res, next) => {
  console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Query:', req.query);
  console.log('Body:', req.body);
  next();
});

// 基本的なミドルウェア
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet({ contentSecurityPolicy: false }));

// CORSをすべて許可
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: '*',
  credentials: true
}));

// データベース接続
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/patrolmanagement')
  .then(() => console.log('データベース接続成功'))
  .catch(err => {
    console.error('データベース接続エラー:', err);
    console.log('データベースなしでサーバーを継続します');
  });

// エラー詳細表示ミドルウェア
app.use((err, req, res, next) => {
  console.error('\n================== API エラー詳細 ==================');
  console.error(`時刻: ${new Date().toISOString()}`);
  console.error(`エンドポイント: ${req.method} ${req.originalUrl || req.url}`);
  console.error(`エラー名: ${err.name}`);
  console.error(`メッセージ: ${err.message}`);
  console.error(`スタックトレース:\n${err.stack}`);
  
  // エラーオブジェクトの詳細をJSON化
  const errorDetails = {};
  Object.getOwnPropertyNames(err).forEach(key => {
    if (key !== 'name' && key !== 'message' && key !== 'stack') {
      errorDetails[key] = err[key];
    }
  });
  
  // エラーをクライアントに送信 - すべての詳細を含む
  res.status(err.statusCode || 500).json({
    success: false,
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
      details: errorDetails,
      code: err.code || err.errorCode
    },
    request: {
      method: req.method,
      url: req.originalUrl || req.url,
      body: req.body,
      query: req.query,
      headers: req.headers
    },
    timestamp: new Date().toISOString()
  });
  
  console.error('======================================================\n');
  next();
});

// 実際のTypeScriptサーバーを実行するためのプロキシ設定
// 本来のサーバーが別ポートで起動する設定
const childProcess = require('child_process');
let tsServer;

function startTsServer() {
  console.log('TypeScriptサーバーを起動します...');
  
  tsServer = childProcess.spawn('ts-node', [
    '-r', 'tsconfig-paths/register', 
    'src/index.ts',
    '--inspect'
  ], {
    env: { 
      ...process.env, 
      TS_NODE_TRANSPILE_ONLY: 'true',
      NODE_ENV: 'development',
      PORT: (PORT + 1).toString()
    },
    stdio: 'pipe'
  });
  
  tsServer.stdout.on('data', (data) => {
    console.log(`TS出力: ${data.toString().trim()}`);
  });
  
  tsServer.stderr.on('data', (data) => {
    console.error(`TSエラー: ${data.toString().trim()}`);
  });
  
  tsServer.on('close', (code) => {
    console.log(`TypeScriptサーバーが終了しました (コード: ${code})`);
    // 再起動
    setTimeout(startTsServer, 2000);
  });
}

// TypeScriptサーバーの起動試行
try {
  startTsServer();
} catch (err) {
  console.error('TypeScriptサーバーの起動に失敗しました:', err);
}

// APIエンドポイント
app.get('/', (req, res) => {
  res.json({
    message: '開発効率特化サーバー',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    tips: [
      'すべてのエラーはコンソールに詳細に表示されます',
      'TypeScriptサーバーはバックグラウンドで実行されています',
      'エラーが発生してもサーバーは継続して実行されます',
      'CORSはすべて許可されています'
    ]
  });
});

// サーバー起動
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n開発効率特化サーバーが起動しました: http://0.0.0.0:${PORT}`);
  console.log(`TypeScriptサーバーはポート ${PORT + 1} で実行されています`);
  console.log('すべてのエラーとログは詳細に表示されます');
  console.log('CTRL+C で終了します\n');
});