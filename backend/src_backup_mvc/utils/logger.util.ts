/**
 * 高度なロギングユーティリティ
 * Winston を使用して構造化された一貫性のあるログ記録を提供します
 */
import winston from 'winston';
import path from 'path';
import fs from 'fs';

// ログディレクトリの作成
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// ログレベルの定義
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// 環境に基づいてログレベルを選択
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development' || env === 'local';
  return isDevelopment ? 'debug' : 'info';
};

// ログフォーマットの定義
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// 出力先の定義
const transports = [
  // コンソール出力
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message} ${
          info.stack ? '\n' + info.stack : ''
        } ${
          info.context ? '\n' + JSON.stringify(info.context, null, 2) : ''
        }`
      )
    ),
  }),
  
  // エラーログファイル（errorレベル以上）
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
  
  // すべてのログ用ファイル
  new winston.transports.File({ 
    filename: path.join(logDir, 'all.log'),
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
];

// Winstonロガーのインスタンス作成
const winstonLogger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'exceptions.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'rejections.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

/**
 * 既存のAPIと互換性のあるロガーインターフェース
 */
export const logger = {
  /**
   * デバッグレベルのログを記録
   * @param message ログメッセージ
   * @param data 追加データ（オプション）
   */
  debug: (message: string, data?: any) => {
    winstonLogger.debug(message, data ? { context: data } : undefined);
  },
  
  /**
   * 情報レベルのログを記録
   * @param message ログメッセージ
   * @param data 追加データ（オプション）
   */
  info: (message: string, data?: any) => {
    winstonLogger.info(message, data ? { context: data } : undefined);
  },
  
  /**
   * 警告レベルのログを記録
   * @param message ログメッセージ
   * @param data 追加データ（オプション）
   */
  warn: (message: string, data?: any) => {
    winstonLogger.warn(message, data ? { context: data } : undefined);
  },
  
  /**
   * エラーレベルのログを記録
   * @param message ログメッセージ
   * @param data 追加データ（オプション）
   */
  error: (message: string, data?: any) => {
    winstonLogger.error(message, data ? { context: data } : undefined);
  },
  
  /**
   * HTTPリクエストログを記録
   * @param message ログメッセージ
   * @param data 追加データ（オプション）
   */
  http: (message: string, data?: any) => {
    winstonLogger.http(message, data ? { context: data } : undefined);
  }
};

/**
 * リクエストログを記録するミドルウェア
 * Express.jsミドルウェアとして使用
 */
export const requestLogger = (req: any, res: any, next: any): void => {
  const startTime = new Date().getTime();
  
  // レスポンス完了時にログを記録
  res.on('finish', () => {
    const duration = new Date().getTime() - startTime;
    const requestId = req.headers['x-request-id'] || '-';
    const userId = req.user?.id || 'anonymous';
    
    logger.http(`${req.method} ${req.originalUrl}`, {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      requestId,
      userId,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    });
  });
  
  next();
};

/**
 * コンテキスト付きロガーを生成するファクトリ関数
 * @param context ログのコンテキスト（モジュール名など）
 * @returns コンテキスト付きロガーインスタンス
 */
export const loggerWithContext = (context: string) => {
  return {
    debug: (message: string, meta?: any) => {
      winstonLogger.debug(message, { context, ...meta });
    },
    info: (message: string, meta?: any) => {
      winstonLogger.info(message, { context, ...meta });
    },
    warn: (message: string, meta?: any) => {
      winstonLogger.warn(message, { context, ...meta });
    },
    error: (message: string, meta?: any) => {
      winstonLogger.error(message, { context, ...meta });
    },
    http: (message: string, meta?: any) => {
      winstonLogger.http(message, { context, ...meta });
    },
  };
};

/**
 * メールアドレスをマスクするヘルパー関数
 * @param email マスクするメールアドレス
 * @returns マスクされたメールアドレス
 */
export const maskEmail = (email: string): string => {
  if (!email || !email.includes('@')) return email;
  const [name, domain] = email.split('@');
  if (name.length <= 2) return `${'*'.repeat(name.length)}@${domain}`;
  return `${name.charAt(0)}${'*'.repeat(name.length - 2)}${name.charAt(name.length - 1)}@${domain}`;
};