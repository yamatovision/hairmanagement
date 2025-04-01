/**
 * エラーユーティリティ
 * アプリケーション全体で使用されるエラー定義と処理を提供します
 */
import { loggerWithContext } from './logger.util';

const errorLogger = loggerWithContext('ErrorHandler');

/**
 * アプリケーション基本エラークラス
 * すべてのアプリケーション固有エラーの基底クラスです
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errorCode: string;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    errorCode: string = 'INTERNAL_ERROR',
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    this.details = details;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * バリデーションエラー
 * ユーザー入力やデータ検証に関するエラー
 */
export class ValidationError extends AppError {
  constructor(message: string, errorCode: string = 'VALIDATION_ERROR', details?: any) {
    super(message, 400, errorCode, true, details);
  }
}

/**
 * 認証エラー
 * ユーザー認証に関するエラー
 */
export class AuthenticationError extends AppError {
  constructor(message: string, errorCode: string = 'AUTHENTICATION_ERROR', details?: any) {
    super(message, 401, errorCode, true, details);
  }
}

/**
 * 認可エラー
 * ユーザー権限に関するエラー
 */
export class AuthorizationError extends AppError {
  constructor(message: string, errorCode: string = 'AUTHORIZATION_ERROR', details?: any) {
    super(message, 403, errorCode, true, details);
  }
}

/**
 * リソース不在エラー
 * 要求されたリソースが見つからない場合のエラー
 */
export class NotFoundError extends AppError {
  constructor(message: string, errorCode: string = 'NOT_FOUND', details?: any) {
    super(message, 404, errorCode, true, details);
  }
}

/**
 * リソース競合エラー
 * 一意性制約違反などのリソース競合エラー
 */
export class ConflictError extends AppError {
  constructor(message: string, errorCode: string = 'CONFLICT', details?: any) {
    super(message, 409, errorCode, true, details);
  }
}

/**
 * データベースエラー
 * データベース操作に関するエラー
 */
export class DatabaseError extends AppError {
  constructor(
    message: string, 
    errorCode: string = 'DATABASE_ERROR',
    isOperational: boolean = true,
    details?: any
  ) {
    super(message, 500, errorCode, isOperational, details);
  }
}

/**
 * 外部サービスエラー
 * 外部API等のサービスとの通信エラー
 */
export class ExternalServiceError extends AppError {
  constructor(
    message: string, 
    errorCode: string = 'EXTERNAL_SERVICE_ERROR',
    details?: any
  ) {
    super(message, 502, errorCode, true, details);
  }
}

/**
 * 後方互換性のためのエイリアス
 */
export class CustomError extends AppError {
  constructor(message: string, statusCode = 500, code?: string, details?: any) {
    super(message, statusCode, code || 'CUSTOM_ERROR', true, details);
  }
}

/**
 * エラー処理ミドルウェア
 * Expressアプリケーションでのグローバルエラーハンドリング
 */
export const errorHandler = (err: any, req: any, res: any, next: any): void => {
  // AppErrorのインスタンスかどうかをチェック
  if (err instanceof AppError) {
    const { statusCode, message, errorCode, isOperational, details } = err;
    
    // エラー情報をログに記録
    if (isOperational) {
      errorLogger.info(`Operational error: ${message}`, {
        statusCode,
        errorCode,
        path: req.path,
        method: req.method,
        details
      });
    } else {
      errorLogger.error(`Application error: ${message}`, {
        statusCode,
        errorCode,
        stack: err.stack,
        path: req.path,
        method: req.method,
        details
      });
    }

    // クライアントへのレスポンス
    return res.status(statusCode).json({
      success: false,
      message,
      code: errorCode,
      details
    });
  }

  // MongooseのValidationErrorの処理
  if (err.name === 'ValidationError') {
    const validationErrors: { [key: string]: string } = {};
    
    Object.keys(err.errors).forEach(key => {
      validationErrors[key] = err.errors[key].message;
    });
    
    errorLogger.warn('Validation error', { details: validationErrors });
    
    return res.status(400).json({
      success: false,
      message: 'バリデーションエラー',
      code: 'VALIDATION_ERROR',
      details: validationErrors,
    });
  }

  // MongoDBの重複キーエラー
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    
    errorLogger.warn('Duplicate key error', { field, value: err.keyValue[field] });
    
    return res.status(400).json({
      success: false,
      message: `この${field}は既に使用されています`,
      code: 'DUPLICATE_KEY_ERROR',
      details: { field },
    });
  }

  // AppError以外の未処理エラー（予期しないエラー）
  errorLogger.error(`Unhandled error: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // 本番環境では一般的なエラーメッセージを返す
  const message = process.env.NODE_ENV === 'production'
    ? 'サーバーで問題が発生しました。しばらく経ってからもう一度お試しください。'
    : err.message;

  const response = {
    success: false,
    message,
    code: 'INTERNAL_SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  return res.status(500).json(response);
};

/**
 * 非同期ハンドラーラッパー
 * Express.jsのroutes定義において非同期関数のエラーを確実にキャッチする
 */
export const asyncHandler = (fn: Function) => 
  (req: any, res: any, next: any): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };