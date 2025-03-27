import { Request, Response } from 'express';
import { userService } from '../../services/user.service';
import { IUser, UserUpdateRequest } from '../../../../shared';

/**
 * ユーザーコントローラー
 * ユーザー関連のリクエストを処理する
 */
class UserController {
  /**
   * 現在ログイン中のユーザー情報を取得
   */
  async getCurrentUser(req: Request, res: Response) {
    try {
      const userId = req.user._id || req.user.id; // _idまたはidを使用
      const user = await userService.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'ユーザーが見つかりません' });
      }
      
      // パスワードを除外してレスポンスを返す
      const { password, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error('ユーザー情報取得エラー:', error);
      res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  }

  /**
   * 現在ログイン中のユーザー情報を更新
   */
  async updateCurrentUser(req: Request, res: Response) {
    try {
      const userId = req.user._id || req.user.id; // _idまたはidを使用
      const updateData: UserUpdateRequest = req.body;
      
      // 更新されたユーザー情報を取得
      const updatedUser = await userService.updateUser(userId, updateData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'ユーザーが見つかりません' });
      }
      
      // パスワードを除外してレスポンスを返す
      const { password, ...userWithoutPassword } = updatedUser;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error('ユーザー情報更新エラー:', error);
      res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  }

  /**
   * 現在ログイン中のユーザーのパスワードを更新
   */
  async updatePassword(req: Request, res: Response) {
    try {
      const userId = req.user._id || req.user.id; // _idまたはidを使用
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: '現在のパスワードと新しいパスワードが必要です' });
      }
      
      // パスワード更新を実行
      const success = await userService.updatePassword(userId, currentPassword, newPassword);
      
      if (!success) {
        return res.status(400).json({ message: '現在のパスワードが正しくありません' });
      }
      
      res.status(200).json({ message: 'パスワードが正常に更新されました' });
    } catch (error) {
      console.error('パスワード更新エラー:', error);
      res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  }

  /**
   * 現在ログイン中のユーザーの通知設定を更新
   */
  async updateNotificationSettings(req: Request, res: Response) {
    try {
      // _idとidの両方をチェック
      const userId = req.user._id || req.user.id;
      const notificationSettings = req.body;
      
      console.log('通知設定更新リクエスト - ユーザーID:', userId);
      console.log('通知設定更新リクエスト - データ:', notificationSettings);
      
      // 通知設定の更新を実行
      const updatedUser = await userService.updateNotificationSettings(userId, notificationSettings);
      
      if (!updatedUser) {
        console.log('通知設定更新エラー: ユーザーが見つかりません - ID:', userId);
        return res.status(404).json({ message: 'ユーザーが見つかりません' });
      }
      
      res.status(200).json({ 
        message: '通知設定が更新されました', 
        notificationSettings: updatedUser.notificationSettings 
      });
    } catch (error) {
      console.error('通知設定更新エラー:', error);
      res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  }

  /**
   * 特定のユーザー情報を取得（管理者用）
   */
  async getUserById(req: Request, res: Response) {
    try {
      // 管理者権限チェック
      if (req.user.role !== 'admin' && req.user.role !== 'manager') {
        return res.status(403).json({ message: '権限がありません' });
      }
      
      const userId = req.params.id;
      const user = await userService.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'ユーザーが見つかりません' });
      }
      
      // パスワードを除外してレスポンスを返す
      const { password, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error('ユーザー情報取得エラー:', error);
      res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  }

  /**
   * 全ユーザーのリストを取得（管理者用）
   */
  async getAllUsers(req: Request, res: Response) {
    try {
      // 管理者権限チェック
      if (req.user.role !== 'admin' && req.user.role !== 'manager') {
        return res.status(403).json({ message: '権限がありません' });
      }
      
      const users = await userService.getAllUsers();
      
      // 各ユーザーからパスワードを除外
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.status(200).json(usersWithoutPasswords);
    } catch (error) {
      console.error('全ユーザー取得エラー:', error);
      res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  }

  /**
   * 特定のユーザー情報を更新（管理者用）
   */
  async updateUserById(req: Request, res: Response) {
    try {
      // 管理者権限チェック
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: '権限がありません' });
      }
      
      const userId = req.params.id;
      const updateData: UserUpdateRequest = req.body;
      
      // 更新されたユーザー情報を取得
      const updatedUser = await userService.updateUser(userId, updateData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'ユーザーが見つかりません' });
      }
      
      // パスワードを除外してレスポンスを返す
      const { password, ...userWithoutPassword } = updatedUser;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error('ユーザー情報更新エラー:', error);
      res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  }

  /**
   * 特定のユーザーを削除（管理者用）
   */
  async deleteUserById(req: Request, res: Response) {
    try {
      // 管理者権限チェック
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: '権限がありません' });
      }
      
      const userId = req.params.id;
      
      // 自分自身を削除しようとしていないかチェック
      if (userId === req.user.id) {
        return res.status(400).json({ message: '自分自身を削除することはできません' });
      }
      
      const success = await userService.deleteUser(userId);
      
      if (!success) {
        return res.status(404).json({ message: 'ユーザーが見つかりません' });
      }
      
      res.status(200).json({ message: 'ユーザーが正常に削除されました' });
    } catch (error) {
      console.error('ユーザー削除エラー:', error);
      res.status(500).json({ message: 'サーバーエラーが発生しました' });
    }
  }
}

export const userController = new UserController();