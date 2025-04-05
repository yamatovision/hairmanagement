/**
 * エラーハンドリングユーティリティ
 * 
 * エラー処理の標準化と詳細なエラー情報の提供
 * エラーログの一元管理と分類を行う
 * 
 * 作成日: 2025/04/05
 * 作成者: Claude
 */

import { Request, Response, NextFunction } from 'express';
import { Failure, ErrorContext } from './result.util';
import { ApplicationError } from '../application/errors/application.error';
import { ValidationError as AppValidationError } from '../application/errors/validation.error';
import { NotFoundError } from '../application/errors/not-found.error';
import { AuthenticationError } from '../application/errors/authentication.error';

// ServiceValidationError型定義
interface ServiceValidationError {
  field: string;
  message: string;
  severity: 'warning' | 'error' | 'critical';
  value?: any;
}

/**
 * APIエラーレスポンス形式
 */
interface ApiErrorResponse {
  status: 'error';
  code: string;
  message: string;
  details?: any; // 明示的にany型を許可
  path?: string;
  timestamp: string;
}

/**
 * エラーコード列挙型
 */
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  DATA_ERROR = 'DATA_ERROR',
  SERVICE_ERROR = 'SERVICE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * エラーログレベル列挙型
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

/**
 * エラーハンドラクラス - Express用のエラーハンドリング
 */
export class ErrorHandler {
  /**
   * ExpressミドルウェアとしてのエラーハンドラーQR
   * @param err エラーオブジェクト
   * @param req リクエストオブジェクト
   * @param res レスポンスオブジェクト
   * @param next 次のミドルウェア
   */
  static handleError(err: any, req: Request, res: Response, next: NextFunction) {
    // エラーをログに記録
    const logLevel = ErrorHandler.getLogLevelForError(err);
    ErrorHandler.logError(err, logLevel, {
      request: {
        method: req.method,
        path: req.path,
        query: req.query,
        headers: req.headers,
        ip: req.ip
      }
    });
    
    // APIレスポンス用のエラー情報を生成
    const { statusCode, apiError } = ErrorHandler.createApiErrorResponse(err, req);
    
    // レスポンスを返す
    res.status(statusCode).json(apiError);
  }
  
  /**
   * エラーのHTTPステータスコードとAPI用エラーレスポンスを生成
   * @param err エラーオブジェクト
   * @param req リクエストオブジェクト
   * @returns ステータスコードとAPIエラーレスポンス
   */
  private static createApiErrorResponse(err: any, req: Request): { statusCode: number, apiError: ApiErrorResponse } {
    let statusCode = 500;
    let code = ErrorCode.UNKNOWN_ERROR;
    let message = 'サーバーエラーが発生しました';
    let details: any = undefined; // any型として定義して様々な型を受け入れられるようにする
    
    // エラータイプに基づいてレスポンスをカスタマイズ
    if (err instanceof AppValidationError) {
      statusCode = 400;
      code = ErrorCode.VALIDATION_ERROR;
      message = err.message || 'バリデーションエラーが発生しました';
    } 
    else if (err && typeof err === 'object' && 'field' in err && 'message' in err && 'severity' in err) {
      // ServiceValidationErrorの特性を持つオブジェクトかチェック
      statusCode = 400;
      code = ErrorCode.VALIDATION_ERROR;
      message = err.message || 'バリデーションエラーが発生しました';
      details = err;
    }
    else if (err instanceof AuthenticationError) {
      statusCode = 401;
      code = ErrorCode.AUTHENTICATION_ERROR;
      message = err.message || '認証エラーが発生しました';
    } 
    else if (err instanceof NotFoundError) {
      statusCode = 404;
      code = ErrorCode.NOT_FOUND_ERROR;
      message = err.message || 'リソースが見つかりません';
    } 
    else if (err instanceof ApplicationError) {
      statusCode = 400;
      code = ErrorCode.SERVICE_ERROR;
      message = err.message || 'アプリケーションエラーが発生しました';
    } 
    else if (err instanceof Failure) {
      statusCode = 400;
      code = ErrorCode.SERVICE_ERROR;
      message = err.getErrorMessage();
      details = err.getContext();
    }
    else if (Array.isArray(err) && err.length > 0 && 
      typeof err[0] === 'object' && err[0] !== null && 
      'field' in err[0] && 'message' in err[0] && 'severity' in err[0]) {
      statusCode = 400;
      code = ErrorCode.VALIDATION_ERROR;
      message = 'データ検証エラーが発生しました';
      details = err;
    }
    
    // 開発環境でのみエラー詳細を含める
    const isDev = process.env.NODE_ENV === 'development';
    
    // APIレスポンス形式のエラーオブジェクトを生成
    const apiError: ApiErrorResponse = {
      status: 'error',
      code,
      message,
      details: isDev ? details : undefined,
      path: req.path,
      timestamp: new Date().toISOString()
    };
    
    return { statusCode, apiError };
  }
  
  /**
   * エラーのログレベルを決定
   * @param err エラーオブジェクト
   * @returns ログレベル
   */
  private static getLogLevelForError(err: any): LogLevel {
    if (err instanceof AppValidationError || 
        (err && typeof err === 'object' && 'field' in err && 'message' in err && 'severity' in err)) {
      return LogLevel.WARN;
    }
    
    if (err instanceof NotFoundError) {
      return LogLevel.INFO;
    }
    
    if (err instanceof Failure) {
      const severity = err.getContext().severity;
      switch (severity) {
        case 'critical':
          return LogLevel.CRITICAL;
        case 'error':
          return LogLevel.ERROR;
        case 'warning':
          return LogLevel.WARN;
        case 'info':
          return LogLevel.INFO;
        default:
          return LogLevel.ERROR;
      }
    }
    
    return LogLevel.ERROR;
  }
  
  /**
   * エラーをログに記録
   * @param err エラーオブジェクト
   * @param level ログレベル
   * @param context コンテキスト情報
   */
  private static logError(err: any, level: LogLevel, context?: any) {
    const timestamp = new Date().toISOString();
    let message = '';
    let errorDetails: Record<string, any> = {};
    
    // エラータイプに応じてログメッセージを構築
    if (err instanceof Error) {
      message = err.message;
      errorDetails = {
        name: err.name,
        stack: err.stack
      };
    } else if (err instanceof Failure) {
      message = err.getErrorMessage();
      errorDetails = {
        context: err.getContext(),
        formattedError: err.format()
      };
    } else if (typeof err === 'string') {
      message = err;
    } else {
      message = 'Unknown error';
      errorDetails = typeof err === 'object' ? { ...err } : { value: err };
    }
    
    // ログ出力オブジェクトを構築
    const logEntry = {
      timestamp,
      level,
      message,
      errorDetails,
      context
    };
    
    // ログレベルに応じて適切なロガーを使用
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(`[DEBUG] ${timestamp} - ${message}`, { errorDetails, context });
        break;
      case LogLevel.INFO:
        console.info(`[INFO] ${timestamp} - ${message}`, { errorDetails, context });
        break;
      case LogLevel.WARN:
        console.warn(`[WARN] ${timestamp} - ${message}`, { errorDetails, context });
        break;
      case LogLevel.ERROR:
        console.error(`[ERROR] ${timestamp} - ${message}`, { errorDetails, context });
        break;
      case LogLevel.CRITICAL:
        console.error(`[CRITICAL] ${timestamp} - ${message}`, { errorDetails, context });
        // 重大エラーの場合は外部監視サービスに通知するなどの追加処理を行うことも可能
        break;
    }
  }
  
  /**
   * エラーを適切な型にラップして返す
   * @param err 元のエラー
   * @param customMessage カスタムエラーメッセージ
   * @returns 適切にラップされたエラー
   */
  static wrapError(err: any, customMessage?: string): Error {
    // 既にErrorインスタンスの場合はそのまま返す
    if (err instanceof Error) {
      if (customMessage) {
        err.message = `${customMessage}: ${err.message}`;
      }
      return err;
    }
    
    // 文字列の場合は新しいErrorを作成
    if (typeof err === 'string') {
      return new Error(customMessage ? `${customMessage}: ${err}` : err);
    }
    
    // その他の場合は文字列化してErrorを作成
    try {
      const errStr = JSON.stringify(err);
      return new Error(customMessage 
        ? `${customMessage}: ${errStr}` 
        : `Unknown error: ${errStr}`);
    } catch (e) {
      return new Error(customMessage 
        ? `${customMessage}: [Unstringifiable error]` 
        : 'Unstringifiable error');
    }
  }
  
  /**
   * ValidationErrorの配列を生成
   * @param field フィールド名
   * @param message エラーメッセージ
   * @param severity 重要度
   * @param value エラー値
   * @returns ServiceValidationError配列（Failureのcontextで使用可能）
   */
  static createValidationErrors(
    field: string, 
    message: string, 
    severity: 'warning' | 'error' | 'critical' = 'error',
    value?: any
  ): ServiceValidationError[] {
    return [{
      field,
      message,
      severity,
      value
    }];
  }
}

/**
 * エラーハンドリングのためのグローバル関数
 */
export const handleGlobalErrors = () => {
  // 未処理のPromiseエラーをキャッチ
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });
  
  // 未処理の例外をキャッチ
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // 安全に終了するために、プロセスを終了する前にリソースのクリーンアップを行うことができる
    process.exit(1);
  });
};

/**
 * 非同期エラーを処理するためのユーティリティ関数
 * @param fn 非同期関数
 * @returns エラーハンドラでラップされた関数
 */
export const asyncErrorHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

// エクスポート
export default ErrorHandler;