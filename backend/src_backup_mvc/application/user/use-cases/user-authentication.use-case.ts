import { inject, injectable } from 'tsyringe';
import { IUserRepository } from '../../../domain/user/repositories/user.repository.interface';
import { Password } from '../../../domain/user/value-objects/password';
import { UserStatus } from '../../../domain/user/value-objects/user-status';
import { AuthenticationError } from '../../errors/authentication.error';
import { ValidationError } from '../../errors/validation.error';
import { ITokenService } from '../../services/token.service';

/**
 * 認証リクエスト
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * 認証レスポンス
 */
export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  token: string;
  refreshToken: string;
}

/**
 * ユーザー認証ユースケース
 * ユーザーのログイン処理と認証トークンの発行を担当
 */
@injectable()
export class UserAuthenticationUseCase {
  /**
   * コンストラクタ
   * @param userRepository ユーザーリポジトリ
   * @param tokenService トークンサービス
   */
  constructor(
    @inject('IUserRepository') private userRepository: IUserRepository,
    @inject('ITokenService') private tokenService: ITokenService
  ) {}
  
  /**
   * ユーザーログイン処理
   * @param request ログインリクエスト
   * @returns ログインレスポンス
   * @throws AuthenticationError 認証失敗時
   * @throws ValidationError 入力データ検証失敗時
   */
  async login(request: LoginRequest): Promise<LoginResponse> {
    const { email, password } = request;
    
    // 入力検証
    if (!email || !password) {
      throw new ValidationError('メールアドレスとパスワードは必須です');
    }
    
    // ユーザー検索
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AuthenticationError('無効な認証情報です');
    }
    
    // アカウント状態確認
    if (!user.isActive()) {
      throw new AuthenticationError('このアカウントは無効化されています');
    }
    
    // パスワード検証
    const isPasswordValid = await user.verifyPassword(password);
    if (!isPasswordValid) {
      throw new AuthenticationError('無効な認証情報です');
    }
    
    // 最終ログイン日時の更新
    await this.userRepository.updateLastLogin(user.id, new Date());
    
    // トークン生成
    const token = this.tokenService.generateAccessToken({
      userId: user.id,
      role: user.role
    });
    
    const refreshToken = this.tokenService.generateRefreshToken({
      userId: user.id
    });
    
    // レスポンス生成
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token,
      refreshToken
    };
  }
  
  /**
   * トークンの更新
   * @param refreshToken リフレッシュトークン
   * @returns 新しいアクセストークンとリフレッシュトークン
   * @throws AuthenticationError トークン無効時
   */
  async refreshToken(refreshToken: string): Promise<{ token: string, refreshToken: string }> {
    // リフレッシュトークンの検証
    const payload = this.tokenService.verifyRefreshToken(refreshToken);
    if (!payload || !payload.userId) {
      throw new AuthenticationError('無効なリフレッシュトークンです');
    }
    
    // ユーザー存在確認
    const user = await this.userRepository.findById(payload.userId);
    if (!user || !user.isActive()) {
      throw new AuthenticationError('ユーザーが存在しないか、無効化されています');
    }
    
    // 新しいトークン生成
    const newToken = this.tokenService.generateAccessToken({
      userId: user.id,
      role: user.role
    });
    
    const newRefreshToken = this.tokenService.generateRefreshToken({
      userId: user.id
    });
    
    return {
      token: newToken,
      refreshToken: newRefreshToken
    };
  }
}