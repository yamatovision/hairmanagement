import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { UserAuthenticationUseCase } from '../../../application/user/use-cases/user-authentication.use-case';
import { UserRegistrationUseCase } from '../../../application/user/use-cases/user-registration.use-case';

/**
 * 認証コントローラー
 * ユーザー認証関連のHTTPリクエストを処理する
 */
@injectable()
export class AuthController {
  /**
   * コンストラクタ
   * @param authUseCase 認証ユースケース
   * @param registrationUseCase 登録ユースケース
   */
  constructor(
    @inject(UserAuthenticationUseCase) private authUseCase: UserAuthenticationUseCase,
    @inject(UserRegistrationUseCase) private registrationUseCase: UserRegistrationUseCase
  ) {
    // JWT環境変数の確認をログ出力
    console.log('AuthController起動: JWT環境変数チェック');
    console.log('- JWT_SECRET:', process.env.JWT_SECRET ? '設定済み' : '未設定');
    console.log('- JWT_REFRESH_SECRET:', process.env.JWT_REFRESH_SECRET ? '設定済み' : '未設定');
    console.log('- JWT_ACCESS_EXPIRATION:', process.env.JWT_ACCESS_EXPIRATION || 'デフォルト値使用');
    console.log('- NODE_ENV:', process.env.NODE_ENV || 'undefined');
  }
  
  /**
   * ユーザーログイン処理
   * @param req リクエスト
   * @param res レスポンス
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await this.authUseCase.login({ email, password });
      
      res.status(200).json(result);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        message: error.message,
        code: error.code,
        details: error.details
      });
    }
  }
  
  /**
   * ユーザー登録処理
   * @param req リクエスト
   * @param res レスポンス
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name, birthDate, role } = req.body;
      const result = await this.registrationUseCase.register({
        email,
        password,
        name,
        birthDate,
        role
      });
      
      res.status(201).json(result);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        message: error.message,
        code: error.code,
        details: error.details
      });
    }
  }
  
  /**
   * トークン更新処理
   * @param req リクエスト
   * @param res レスポンス
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        res.status(400).json({
          message: 'リフレッシュトークンが必要です',
          code: 'MISSING_REFRESH_TOKEN'
        });
        return;
      }
      
      const result = await this.authUseCase.refreshToken(refreshToken);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        message: error.message,
        code: error.code,
        details: error.details
      });
    }
  }
  
  /**
   * ログアウト処理
   * 注: この実装ではクライアント側でトークンを破棄する前提のため、
   * サーバー側での特別な処理は行いません。
   * 実際のアプリケーションでは、トークンのブラックリスト化などが必要な場合があります。
   * @param req リクエスト
   * @param res レスポンス
   */
  async logout(req: Request, res: Response): Promise<void> {
    res.status(200).json({ message: 'ログアウトしました' });
  }
}