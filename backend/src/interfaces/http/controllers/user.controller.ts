import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { GetUserProfileUseCase } from '../../../application/user/use-cases/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from '../../../application/user/use-cases/update-user-profile.use-case';
import { UpdateUserPasswordUseCase } from '../../../application/user/use-cases/update-user-password.use-case';
import { TokenPayload } from '../../../application/services/token.service';
import { SajuCalculatorService } from '../../../application/services/saju-calculator.service';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';

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
   * @param sajuCalculatorService 四柱推命計算サービス
   * @param userRepository ユーザーリポジトリ
   */
  constructor(
    @inject('GetUserProfileUseCase') private getUserProfileUseCase: GetUserProfileUseCase,
    @inject('UpdateUserProfileUseCase') private updateProfileUseCase: UpdateUserProfileUseCase,
    @inject('UpdateUserPasswordUseCase') private updatePasswordUseCase: UpdateUserPasswordUseCase,
    @inject('SajuCalculatorService') private sajuCalculatorService: SajuCalculatorService,
    @inject('IUserRepository') private userRepository: IUserRepository
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
   * 現在のユーザーの四柱推命プロファイルを取得する
   * @param req リクエスト
   * @param res レスポンス
   */
  async getUserSajuProfile(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as TokenPayload;
      
      if (!user || !user.userId) {
        res.status(401).json({
          message: '認証されていません',
          code: 'UNAUTHORIZED'
        });
        return;
      }
      
      // ユーザー情報を取得
      const userEntity = await this.userRepository.findById(user.userId);
      if (!userEntity) {
        res.status(404).json({
          message: 'ユーザーが見つかりません',
          code: 'USER_NOT_FOUND'
        });
        return;
      }
      
      // 生年月日データから四柱推命プロファイルを生成
      // 生年月日が設定されているか確認
      const birthDate = userEntity.birthDate;
      if (!birthDate) {
        res.status(400).json({
          message: '生年月日情報がありません。プロフィール設定で生年月日を登録してください。',
          code: 'MISSING_BIRTH_DATA'
        });
        return;
      }
      
      // 出生時間と出生地の確認
      const birthHour = userEntity.birthHour;
      const birthLocation = userEntity.birthLocation;
      
      // 四柱推命プロファイル計算（出生地も渡す）
      const sajuProfile = await this.sajuCalculatorService.calculateSajuProfile(
        new Date(birthDate),
        birthHour,
        birthLocation
      );
      
      // ユーザー情報を四柱推命プロファイルで更新
      // チャンスがあれば、計算された四柱推命プロファイルをユーザーに保存する
      // これにより、次回の取得では計算せずに保存された値を返すことができる
      try {
        if (userEntity && sajuProfile) {
          const updatedUser = userEntity.withUpdatedSajuProfile(sajuProfile);
          await this.userRepository.update(userEntity.id, updatedUser);
          console.log(`ユーザー ${userEntity.id} の四柱推命プロファイルを更新しました`);
        }
      } catch (updateError) {
        // 更新に失敗しても、計算結果は返す（エラーログのみ記録）
        console.error('四柱推命プロファイル更新エラー:', updateError);
      }
      
      // プロファイルをJSONとして返す
      res.status(200).json(sajuProfile);
    } catch (error: any) {
      console.error('四柱推命プロファイル取得エラー:', error);
      res.status(error.statusCode || 500).json({
        message: error.message || '四柱推命プロファイルの取得に失敗しました',
        code: error.code || 'INTERNAL_SERVER_ERROR',
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
      const { name, profileImage, birthDate, birthHour, birthLocation, elementalType } = req.body;
      
      if (!user || !user.userId) {
        res.status(401).json({
          message: '認証されていません',
          code: 'UNAUTHORIZED'
        });
        return;
      }
      
      await this.updateProfileUseCase.execute(
        user.userId,
        { name, profileImage, birthDate, birthHour, birthLocation, elementalType },
        user.userId
      );
      
      // 更新後の最新プロフィールを取得して返す
      const updatedProfile = await this.getUserProfileUseCase.getCurrentUserProfile(user.userId);
      
      res.status(200).json({
        message: 'プロフィールが更新されました',
        user: updatedProfile
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