import { Request, Response, NextFunction } from 'express';
import { authService } from '../../services/auth.service';
import { CustomError } from '../../utils/error.util';

/**
 * 認証コントローラー
 * ユーザー認証関連のエンドポイントを処理する
 */
export const authController = {
  /**
   * ユーザー登録（管理者のみ実行可能）
   */
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData = req.body;
      const newUser = await authService.registerUser(userData);
      
      res.status(201).json({
        success: true,
        message: 'ユーザーが正常に登録されました',
        data: newUser
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * ユーザーログイン
   */
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const loginResult = await authService.login(email, password);
      
      // アクセストークンをHTTPOnlyクッキーとして設定
      res.cookie('accessToken', loginResult.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000 // 1時間
      });
      
      // リフレッシュトークンをHTTPOnlyクッキーとして設定
      res.cookie('refreshToken', loginResult.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7日間
      });
      
      res.status(200).json({
        success: true,
        message: 'ログインに成功しました',
        data: {
          user: loginResult.user,
          token: loginResult.token // クライアント側の保存用
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * トークンリフレッシュ
   */
  refreshToken: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // クッキーまたはリクエストボディからリフレッシュトークンを取得
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      
      if (!refreshToken) {
        throw new CustomError('リフレッシュトークンが見つかりません', 401);
      }
      
      const result = await authService.refreshToken(refreshToken);
      
      // 新しいアクセストークンをクッキーに設定
      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000 // 1時間
      });
      
      res.status(200).json({
        success: true,
        message: 'トークンが正常に更新されました',
        data: {
          user: result.user,
          token: result.accessToken
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * ログアウト
   */
  logout: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      const userId = req.user?._id.toString();
      
      if (refreshToken && userId) {
        // リフレッシュトークンが提供された場合は無効化
        await authService.logout(userId, refreshToken);
      }
      
      // クッキーをクリア
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      
      res.status(200).json({
        success: true,
        message: 'ログアウトに成功しました'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * パスワードリセットメール送信
   */
  forgotPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      await authService.sendPasswordResetEmail(email);
      
      res.status(200).json({
        success: true,
        message: 'パスワードリセットメールを送信しました'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * パスワードリセット
   */
  resetPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, password } = req.body;
      await authService.resetPassword(token, password);
      
      res.status(200).json({
        success: true,
        message: 'パスワードが正常にリセットされました'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * メール検証
   */
  verifyEmail: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.params;
      await authService.verifyEmail(token);
      
      // フロントエンドの確認ページにリダイレクト
      res.redirect(`${process.env.FRONTEND_URL}/email-verified`);
    } catch (error) {
      next(error);
    }
  },

  /**
   * 現在のユーザー情報取得
   */
  getCurrentUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id.toString();
      
      if (!userId) {
        throw new CustomError('認証されていません', 401);
      }
      
      const user = await authService.getUserById(userId);
      
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * パスワード変更
   */
  changePassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id.toString();
      
      if (!userId) {
        throw new CustomError('認証されていません', 401);
      }
      
      const { currentPassword, newPassword } = req.body;
      
      await authService.changePassword(userId, currentPassword, newPassword);
      
      res.status(200).json({
        success: true,
        message: 'パスワードが正常に変更されました'
      });
    } catch (error) {
      next(error);
    }
  }
};