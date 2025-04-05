/**
 * Result ユーティリティ
 * 関数からの成功または失敗結果を型安全に表現するためのパターン
 * 
 * 作成日: 2025/04/05
 */

/**
 * 成功または失敗を表現するResult型
 */
export class Result<T, E extends Error> {
  private readonly _value?: T;
  private readonly _error?: E;
  private readonly _isSuccess: boolean;

  private constructor(value?: T, error?: E, isSuccess = true) {
    this._value = value;
    this._error = error;
    this._isSuccess = isSuccess;
  }

  /**
   * 成功値を取得
   * エラーの場合は例外をスロー
   */
  public getValue(): T {
    if (!this._isSuccess) {
      throw new Error(`Cannot get value from error result: ${this._error?.message}`);
    }
    
    return this._value as T;
  }

  /**
   * エラーを取得
   * 成功の場合は例外をスロー
   */
  public getError(): E {
    if (this._isSuccess) {
      throw new Error('Cannot get error from success result');
    }
    
    return this._error as E;
  }

  /**
   * 成功かどうかを確認
   */
  public get isSuccess(): boolean {
    return this._isSuccess;
  }

  /**
   * 失敗かどうかを確認
   */
  public get isFailure(): boolean {
    return !this._isSuccess;
  }

  /**
   * 成功結果を作成
   */
  public static success<T, E extends Error>(value?: T): Result<T, E> {
    return new Result<T, E>(value, undefined, true);
  }

  /**
   * 失敗結果を作成
   */
  public static failure<T, E extends Error>(error: E): Result<T, E> {
    return new Result<T, E>(undefined, error, false);
  }

  /**
   * 条件に基づいて成功または失敗を作成
   */
  public static fromCondition<T, E extends Error>(condition: boolean, value: T, error: E): Result<T, E> {
    return condition ? this.success(value) : this.failure(error);
  }

  /**
   * mapメソッド: 成功値を変換
   */
  public map<U>(fn: (value: T) => U): Result<U, E> {
    if (this._isSuccess) {
      return Result.success<U, E>(fn(this._value as T));
    }
    
    return Result.failure<U, E>(this._error as E);
  }

  /**
   * bind/flatMapメソッド: 成功値を新しいResultに変換
   */
  public flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    if (this._isSuccess) {
      return fn(this._value as T);
    }
    
    return Result.failure<U, E>(this._error as E);
  }

  /**
   * asyncMap: 非同期の変換関数をサポート
   */
  public async asyncMap<U>(fn: (value: T) => Promise<U>): Promise<Result<U, E>> {
    if (this._isSuccess) {
      try {
        const result = await fn(this._value as T);
        return Result.success<U, E>(result);
      } catch (error) {
        if (error instanceof Error) {
          return Result.failure<U, E>(error as E);
        }
        
        const genericError = new Error('Unknown async error') as E;
        return Result.failure<U, E>(genericError);
      }
    }
    
    return Result.failure<U, E>(this._error as E);
  }

  /**
   * recoverメソッド: 失敗を成功値に回復
   */
  public recover(fallbackValue: T): T {
    return this._isSuccess ? this._value as T : fallbackValue;
  }
}

/**
 * AsyncResult型: 非同期操作を表現するためのユーティリティ型
 * Promise<Result<T, E>>の短縮形
 */
export type AsyncResult<T, E extends Error> = Promise<Result<T, E>>;

/**
 * 汎用エラー型
 */
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * 標準エラー型（ValidationError、NotFoundError、AuthorizationErrorなど）
 */
export class ValidationError extends AppError {
  public readonly errors: Record<string, string>;
  
  constructor(message: string, errors: Record<string, string> = {}) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class DataIntegrityError extends AppError {
  constructor(message: string) {
    super(message);
    this.name = 'DataIntegrityError';
  }
}

/**
 * Resultをラップするユーティリティ関数
 */
export function tryResult<T>(fn: () => T): Result<T, Error> {
  try {
    const result = fn();
    return Result.success<T, Error>(result);
  } catch (error) {
    if (error instanceof Error) {
      return Result.failure<T, Error>(error);
    }
    
    return Result.failure<T, Error>(new Error('Unknown error'));
  }
}

/**
 * 非同期関数をResultでラップするユーティリティ関数
 */
export async function tryAsyncResult<T>(fn: () => Promise<T>): AsyncResult<T, Error> {
  try {
    const result = await fn();
    return Result.success<T, Error>(result);
  } catch (error) {
    if (error instanceof Error) {
      return Result.failure<T, Error>(error);
    }
    
    return Result.failure<T, Error>(new Error('Unknown async error'));
  }
}