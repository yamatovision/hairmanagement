/**
 * ロガーユーティリティ
 * アプリケーション全体で使用される一貫したログ記録を提供します
 */
export const logger = {
  /**
   * デバッグレベルのログを記録
   * @param message ログメッセージ
   * @param data 追加データ（オプション）
   */
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEBUG] ${message}`, data || '');
    }
  },
  
  /**
   * 情報レベルのログを記録
   * @param message ログメッセージ
   * @param data 追加データ（オプション）
   */
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data || '');
  },
  
  /**
   * 警告レベルのログを記録
   * @param message ログメッセージ
   * @param data 追加データ（オプション）
   */
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data || '');
  },
  
  /**
   * エラーレベルのログを記録
   * @param message ログメッセージ
   * @param data 追加データ（オプション）
   */
  error: (message: string, data?: any) => {
    console.error(`[ERROR] ${message}`, data || '');
  }
};