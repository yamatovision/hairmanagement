/**
 * カスタムエラークラス
 * ステータスコードとエラーメッセージを含む
 */
export class CustomError extends Error {
  statusCode: number;
  code?: string;
  details?: any;

  /**
   * @param message エラーメッセージ
   * @param statusCode HTTPステータスコード（デフォルト: 500）
   * @param code エラーコード（オプション）
   * @param details 追加のエラー詳細（オプション）
   */
  constructor(message: string, statusCode = 500, code?: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * エラーハンドラーミドルウェア
 * Express アプリケーションの中央エラーハンドリング用
 */
export const errorHandler = (err: any, req: any, res: any, next: any) => {
  if (err instanceof CustomError) {
    // カスタムエラーの場合
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      details: err.details,
    });
  }

  // MongooseのValidationErrorの処理
  if (err.name === 'ValidationError') {
    const validationErrors: { [key: string]: string } = {};
    
    Object.keys(err.errors).forEach(key => {
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
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `この${field}は既に使用されています`,
      code: 'DUPLICATE_KEY_ERROR',
      details: { field },
    });
  }

  // デフォルトのエラーハンドリング（開発環境ではスタックトレースを含める）
  const statusCode = err.statusCode || 500;
  const response = {
    success: false,
    message: err.message || 'サーバー内部エラー',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  // エラーログ（本番環境では適切なロギングサービスに送信）
  console.error(`[${new Date().toISOString()}] Error:`, err);

  return res.status(statusCode).json(response);
};