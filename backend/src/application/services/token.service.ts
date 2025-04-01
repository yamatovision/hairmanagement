import jwt from 'jsonwebtoken';
import { injectable } from 'tsyringe';
import { AuthenticationError } from '../errors/authentication.error';

/**
 * トークンペイロード
 */
export interface TokenPayload {
  userId: string;
  role?: string;
  [key: string]: any;
}

/**
 * トークンサービスインターフェース
 * 認証トークンの生成と検証を行うサービスのインターフェース
 */
export interface ITokenService {
  /**
   * アクセストークンを生成する
   * @param payload トークンに含めるデータ
   * @returns 生成されたアクセストークン
   */
  generateAccessToken(payload: TokenPayload): string;
  
  /**
   * リフレッシュトークンを生成する
   * @param payload トークンに含めるデータ
   * @returns 生成されたリフレッシュトークン
   */
  generateRefreshToken(payload: TokenPayload): string;
  
  /**
   * アクセストークンを検証する
   * @param token 検証するアクセストークン
   * @returns トークンペイロード
   * @throws AuthenticationError トークン無効時
   */
  verifyAccessToken(token: string): TokenPayload;
  
  /**
   * リフレッシュトークンを検証する
   * @param token 検証するリフレッシュトークン
   * @returns トークンペイロード
   * @throws AuthenticationError トークン無効時
   */
  verifyRefreshToken(token: string): TokenPayload;
}

/**
 * JWT実装のトークンサービス
 */
@injectable()
export class JwtTokenService implements ITokenService {
  /**
   * アクセストークンの有効期間（秒）
   * デフォルト: 1時間
   */
  private readonly accessTokenExpiration = 3600;
  
  /**
   * リフレッシュトークンの有効期間（秒）
   * デフォルト: 7日間
   */
  private readonly refreshTokenExpiration = 604800;
  
  /**
   * JWTシークレットキー
   * 環境変数から取得
   */
  private get accessTokenSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET環境変数が設定されていません');
    }
    return secret;
  }
  
  /**
   * JWTリフレッシュトークンシークレットキー
   * 環境変数から取得
   */
  private get refreshTokenSecret(): string {
    const secret = process.env.JWT_REFRESH_SECRET || this.accessTokenSecret;
    return secret;
  }
  
  /**
   * アクセストークンを生成する
   * @param payload トークンに含めるデータ
   * @returns 生成されたアクセストークン
   */
  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiration
    });
  }
  
  /**
   * リフレッシュトークンを生成する
   * @param payload トークンに含めるデータ
   * @returns 生成されたリフレッシュトークン
   */
  generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.refreshTokenSecret, {
      expiresIn: this.refreshTokenExpiration
    });
  }
  
  /**
   * アクセストークンを検証する
   * @param token 検証するアクセストークン
   * @returns トークンペイロード
   * @throws AuthenticationError トークン無効時
   */
  verifyAccessToken(token: string): TokenPayload {
    try {
      console.log('[TokenService] トークン検証開始:', token.substring(0, 10) + '...');
      console.log('[TokenService] シークレットキー:', this.accessTokenSecret.substring(0, 3) + '***');
      console.log('[TokenService] 環境変数NODE_ENV:', process.env.NODE_ENV || 'undefined');
      
      try {
        // トークンのデコード（検証なし）
        const decoded = jwt.decode(token, { complete: true });
        console.log('[TokenService] トークンデコード結果(検証なし):', 
                    JSON.stringify(decoded?.payload || {}, null, 2));
      } catch (decodeErr) {
        console.error('[TokenService] トークンデコードエラー:', decodeErr);
      }
      
      const payload = jwt.verify(token, this.accessTokenSecret) as TokenPayload;
      console.log('[TokenService] トークン検証成功:', JSON.stringify(payload));
      return payload;
    } catch (error) {
      console.error('[TokenService] トークン検証エラー:', error instanceof Error ? error.message : 'Unknown error');
      if (error instanceof jwt.JsonWebTokenError) {
        console.error('JWT詳細エラー:', error.name, error.message);
      }
      throw new AuthenticationError('無効なアクセストークンです');
    }
  }
  
  /**
   * リフレッシュトークンを検証する
   * @param token 検証するリフレッシュトークン
   * @returns トークンペイロード
   * @throws AuthenticationError トークン無効時
   */
  verifyRefreshToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.refreshTokenSecret) as TokenPayload;
    } catch (error) {
      throw new AuthenticationError('無効なリフレッシュトークンです');
    }
  }
}