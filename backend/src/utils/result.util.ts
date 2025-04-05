/**
 * 結果型ユーティリティ
 * エラーハンドリングと値の安全な処理のためのユーティリティ
 * 
 * null/undefinedの安全な処理やエラーハンドリング改善のため使用
 * 
 * 作成日: 2025/04/05
 * 更新日: 2025/04/05 - エラーコンテキストとメタデータ機能追加
 * 作成者: Claude
 */

/**
 * 処理結果を表す型 - 成功または失敗のどちらかを表現
 */
export type Result<T, E = Error> = Success<T> | Failure<E>;

/**
 * 成功を表す型
 */
export class Success<T> {
  readonly isSuccess: true = true;
  readonly isFailure: false = false;
  
  /**
   * 成功データを持つインスタンスを作成
   * @param value 成功データ
   */
  constructor(readonly value: T) {}
  
  /**
   * データを取得 - 値が存在することが保証されている
   */
  getValue(): T {
    return this.value;
  }
  
  /**
   * エラーを取得 - 常にundefinedを返す
   */
  getError(): undefined {
    return undefined;
  }
  
  /**
   * 成功の場合に関数を適用し、新しいResultを返す
   * @param fn 適用する関数
   */
  map<U>(fn: (value: T) => U): Result<U, never> {
    return success(fn(this.value));
  }
  
  /**
   * 成功の場合に関数を適用し、その関数が返すResultをそのまま返す
   * @param fn 適用する関数
   */
  flatMap<U, E>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return fn(this.value);
  }
  
  /**
   * 成功の場合に副作用を実行し、元のResultを返す
   * @param fn 実行する関数
   */
  tap(fn: (value: T) => void): Success<T> {
    fn(this.value);
    return this;
  }
  
  /**
   * 成功の場合に値を返し、失敗の場合は何もしない（このケースでは常に値を返す）
   */
  match<U>(onSuccess: (value: T) => U, onFailure: (error: never) => U): U {
    return onSuccess(this.value);
  }
}

/**
 * エラーコンテキスト情報
 */
export interface ErrorContext {
  operationName?: string;
  source?: string;
  timestamp?: Date;
  details?: Record<string, unknown>;
  severity?: 'info' | 'warning' | 'error' | 'critical';
}

/**
 * 失敗を表す型
 */
export class Failure<E = Error> {
  readonly isSuccess: false = false;
  readonly isFailure: true = true;
  readonly context: ErrorContext;
  
  /**
   * エラーデータを持つインスタンスを作成
   * @param error エラーデータ
   * @param context エラーコンテキスト情報
   */
  constructor(readonly error: E, context: ErrorContext = {}) {
    this.context = {
      timestamp: new Date(),
      severity: 'error',
      ...context
    };
  }
  
  /**
   * データを取得 - 常にundefinedを返す
   */
  getValue(): undefined {
    return undefined;
  }
  
  /**
   * エラーを取得
   */
  getError(): E {
    return this.error;
  }
  
  /**
   * エラーコンテキストを取得
   */
  getContext(): ErrorContext {
    return this.context;
  }
  
  /**
   * エラーコンテキストを拡張した新しいFailureを作成
   * @param newContext 追加のコンテキスト情報
   */
  withContext(newContext: Partial<ErrorContext>): Failure<E> {
    return new Failure(this.error, {
      ...this.context,
      ...newContext,
      details: {
        ...(this.context.details || {}),
        ...(newContext.details || {})
      }
    });
  }
  
  /**
   * エラーを変換して新しいFailureを作成
   * @param fn 変換関数
   */
  mapError<F>(fn: (error: E) => F): Failure<F> {
    return new Failure(fn(this.error), this.context);
  }
  
  /**
   * 成功の場合に関数を適用（このケースでは何もしない）
   */
  map<U>(fn: (value: never) => U): Failure<E> {
    return this;
  }
  
  /**
   * 成功の場合に関数を適用（このケースでは何もしない）
   */
  flatMap<U, F>(fn: (value: never) => Result<U, F>): Failure<E> {
    return this;
  }
  
  /**
   * エラーメッセージを取得
   */
  getErrorMessage(): string {
    if (typeof this.error === 'string') {
      return this.error;
    }
    
    if (this.error instanceof Error) {
      return this.error.message;
    }
    
    return String(this.error);
  }
  
  /**
   * エラー情報をフォーマットして文字列で取得
   */
  format(): string {
    const { operationName, source, timestamp, severity } = this.context;
    
    const formattedTimestamp = timestamp 
      ? timestamp.toISOString()
      : new Date().toISOString();
    
    let result = `[${severity?.toUpperCase() || 'ERROR'}] `;
    
    if (operationName) {
      result += `${operationName}: `;
    }
    
    result += this.getErrorMessage();
    
    if (source) {
      result += ` (source: ${source})`;
    }
    
    result += ` [${formattedTimestamp}]`;
    
    return result;
  }
  
  /**
   * エラーを処理するためのマッチングパターン
   */
  match<U>(onSuccess: (value: never) => U, onFailure: (error: E) => U): U {
    return onFailure(this.error);
  }
}

/**
 * 成功結果を作成
 * @param value 成功データ
 */
export function success<T>(value: T): Success<T> {
  return new Success(value);
}

/**
 * 失敗結果を作成
 * @param error エラーデータ
 * @param context エラーコンテキスト
 */
export function failure<E = Error>(error: E, context?: ErrorContext): Failure<E> {
  return new Failure(error, context);
}

/**
 * 関数を実行し、結果をResultで包む
 * @param fn 実行する関数
 * @param errorTransformer エラー変換関数（オプション）
 * @param context エラーコンテキスト
 */
export function tryCatch<T, E = Error>(
  fn: () => T,
  errorTransformer?: (error: unknown) => E,
  context?: ErrorContext
): Result<T, E> {
  try {
    return success(fn());
  } catch (error) {
    if (errorTransformer) {
      return failure(errorTransformer(error), {
        ...context,
        details: {
          ...(context?.details || {}),
          originalError: error
        }
      });
    }
    return failure(error as E, context);
  }
}

/**
 * 非同期関数を実行し、結果をResultで包む
 * @param fn 実行する非同期関数
 * @param errorTransformer エラー変換関数（オプション）
 * @param context エラーコンテキスト
 */
export async function tryCatchAsync<T, E = Error>(
  fn: () => Promise<T>,
  errorTransformer?: (error: unknown) => E,
  context?: ErrorContext
): Promise<Result<T, E>> {
  try {
    const result = await fn();
    return success(result);
  } catch (error) {
    if (errorTransformer) {
      return failure(errorTransformer(error), {
        ...context,
        details: {
          ...(context?.details || {}),
          originalError: error
        }
      });
    }
    return failure(error as E, context);
  }
}

/**
 * Resultを配列に適用し、すべての結果を単一のResultにまとめる
 * @param results Result配列
 */
export function combine<T, E>(results: Result<T, E>[]): Result<T[], E> {
  const values: T[] = [];
  
  for (const result of results) {
    if (result.isFailure) {
      return result;
    }
    values.push(result.getValue());
  }
  
  return success(values);
}

/**
 * Resultを非同期配列に適用し、すべての結果を単一のResultにまとめる
 * @param promises Result Promiseの配列
 */
export async function combineAsync<T, E>(promises: Promise<Result<T, E>>[]): Promise<Result<T[], E>> {
  try {
    const results = await Promise.all(promises);
    return combine(results);
  } catch (error) {
    return failure(error as E);
  }
}

/**
 * Optional型 - 値が存在するかどうか不確かな場合に使用
 */
export class Optional<T> {
  /**
   * 値を持つインスタンスを作成
   * @param value 値（nullまたはundefinedの場合あり）
   */
  constructor(private readonly value: T | null | undefined) {}
  
  /**
   * 値が存在するかどうかを確認
   */
  isPresent(): boolean {
    return this.value !== null && this.value !== undefined;
  }
  
  /**
   * 値が存在しないかどうかを確認
   */
  isEmpty(): boolean {
    return !this.isPresent();
  }
  
  /**
   * 値が存在する場合にのみ取得
   * @returns 値（存在しない場合はundefined）
   */
  get(): T | undefined {
    return this.value as T;
  }
  
  /**
   * 値が存在する場合にのみ取得、存在しない場合はデフォルト値を返す
   * @param defaultValue デフォルト値
   * @returns 値またはデフォルト値
   */
  orElse(defaultValue: T): T {
    return this.isPresent() ? (this.value as T) : defaultValue;
  }
  
  /**
   * 値が存在する場合にのみ取得、存在しない場合は例外をスロー
   * @param errorMessage エラーメッセージ
   * @returns 値
   * @throws Error 値が存在しない場合
   */
  orThrow(errorMessage = 'Value is not present'): T {
    if (this.isPresent()) {
      return this.value as T;
    }
    throw new Error(errorMessage);
  }
  
  /**
   * 値が存在する場合に関数を適用
   * @param fn 適用する関数
   * @returns 新しいOptional
   */
  map<U>(fn: (value: T) => U): Optional<U> {
    if (this.isPresent()) {
      return Optional.of(fn(this.value as T));
    }
    return Optional.empty();
  }
  
  /**
   * 値が存在する場合に関数を実行
   * @param fn 実行する関数
   */
  ifPresent(fn: (value: T) => void): void {
    if (this.isPresent()) {
      fn(this.value as T);
    }
  }
  
  /**
   * 値が存在する場合に値を返し、存在しない場合に関数を実行して結果を返す
   * @param fn 実行する関数
   * @returns 値または関数の結果
   */
  orElseGet(fn: () => T): T {
    return this.isPresent() ? (this.value as T) : fn();
  }
  
  /**
   * 値を持つOptionalを作成
   * @param value 値
   */
  static of<T>(value: T | null | undefined): Optional<T> {
    return new Optional(value);
  }
  
  /**
   * 空のOptionalを作成
   */
  static empty<T>(): Optional<T> {
    return new Optional<T>(undefined);
  }
  
  /**
   * Optionalをすべて処理し、最初に存在する値を持つOptionalを返す
   * @param optionals Optionalの配列
   */
  static firstPresent<T>(...optionals: Optional<T>[]): Optional<T> {
    for (const optional of optionals) {
      if (optional.isPresent()) {
        return optional;
      }
    }
    return Optional.empty();
  }
  
  /**
   * Resultから値を取り出してOptionalに変換
   * @param result 変換元のResult
   */
  static fromResult<T, E>(result: Result<T, E>): Optional<T> {
    return result.isSuccess
      ? Optional.of(result.getValue())
      : Optional.empty();
  }
  
  /**
   * Optionalから値を取り出してResultに変換
   * @param optional 変換元のOptional
   * @param errorFn 値が存在しない場合のエラー生成関数
   */
  toResult<E>(errorFn: () => E): Result<T, E> {
    return this.isPresent()
      ? success(this.value as T)
      : failure(errorFn());
  }
}