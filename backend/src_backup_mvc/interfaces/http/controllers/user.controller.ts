import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { GetUserProfileUseCase } from '../../../application/user/use-cases/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from '../../../application/user/use-cases/update-user-profile.use-case';
import { UpdateUserPasswordUseCase } from '../../../application/user/use-cases/update-user-password.use-case';
import { TokenPayload } from '../../../application/services/token.service';

/**
 * ユーザーコントローラー
 * ユーザープロフィール関連のHTTPリクエストを処理する
 */
@injectable()
export class UserController {
  /**
   * コンストラクタ
   * @param getUserProfileUseCase プロフィール取得ユースケース
   * @param updateProfileUseCase プロフィール更新ユースケース
   * @param updatePasswordUseCase パスワード更新ユースケース
   */
  constructor(
    @inject('GetUserProfileUseCase') private getUserProfileUseCase: GetUserProfileUseCase,
    @inject('UpdateUserProfileUseCase') private updateProfileUseCase: UpdateUserProfileUseCase,
    @inject('UpdateUserPasswordUseCase') private updatePasswordUseCase: UpdateUserPasswordUseCase
  ) {}
  
  /**
   * 現在のユーザープロフィールを取得する
   * @param req リクエスト
   * @param res レスポンス
   */
  async getCurrentUserProfile(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as TokenPayload;
      
      if (!user || !user.userId) {
        res.status(401).json({
          message: '認証されていません',
          code: 'UNAUTHORIZED'
        });
        return;
      }
      
      const profile = await this.getUserProfileUseCase.getCurrentUserProfile(user.userId);
      res.status(200).json(profile);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        message: error.message,
        code: error.code,
        details: error.details
      });
    }
  }
  
  /**
   * ユーザープロフィールを取得する
   * @param req リクエスト
   * @param res レスポンス
   */
  async getUserProfile(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const user = req.user as TokenPayload;
      
      if (!user || !user.userId) {
        res.status(401).json({
          message: '認証されていません',
          code: 'UNAUTHORIZED'
        });
        return;
      }
      
      const profile = await this.getUserProfileUseCase.execute(userId, user.userId);
      res.status(200).json(profile);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        message: error.message,
        code: error.code,
        details: error.details
      });
    }
  }
  
  /**
   * ユーザープロフィールを更新する
   * @param req リクエスト
   * @param res レスポンス
   */
  async updateUserProfile(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as TokenPayload;
      const { name, profileImage } = req.body;
      
      if (!user || !user.userId) {
        res.status(401).json({
          message: '認証されていません',
          code: 'UNAUTHORIZED'
        });
        return;
      }
      
      await this.updateProfileUseCase.execute(
        user.userId,
        { name, profileImage },
        user.userId
      );
      
      res.status(200).json({
        message: 'プロフィールが更新されました'
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        message: error.message,
        code: error.code,
        details: error.details
      });
    }
  }
  
  /**
   * ユーザーパスワードを更新する
   * @param req リクエスト
   * @param res レスポンス
   */
  async updateUserPassword(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as TokenPayload;
      const { currentPassword, newPassword, confirmPassword } = req.body;
      
      if (!user || !user.userId) {
        res.status(401).json({
          message: '認証されていません',
          code: 'UNAUTHORIZED'
        });
        return;
      }
      
      await this.updatePasswordUseCase.execute(
        user.userId,
        { currentPassword, newPassword, confirmPassword },
        user.userId
      );
      
      res.status(200).json({
        message: 'パスワードが更新されました'
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        message: error.message,
        code: error.code,
        details: error.details
      });
    }
  }
}