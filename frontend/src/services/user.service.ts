import axios from 'axios';
import { IUser, NotificationSettingsType, USER } from '../types';

// UserUpdateRequest型定義
type UserUpdateRequest = Partial<Omit<IUser, 'id' | 'createdAt' | 'updatedAt' | 'password'>>;

// トークンを取得するヘルパー関数
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

/**
 * ユーザーサービス
 * ユーザー関連のAPI呼び出しを管理
 */
class UserService {
  /**
   * 現在のユーザー情報を取得
   */
  async getCurrentUser(): Promise<IUser> {
    try {
      const response = await axios.get(USER.ME, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('ユーザー情報取得エラー:', error);
      throw error;
    }
  }

  /**
   * ユーザープロフィールを更新
   */
  async updateProfile(updateData: UserUpdateRequest): Promise<IUser> {
    try {
      const response = await axios.put(USER.UPDATE_PROFILE, updateData, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('プロフィール更新エラー:', error);
      throw error;
    }
  }

  /**
   * パスワードを更新
   */
  async updatePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    try {
      const response = await axios.put(
        USER.UPDATE_PASSWORD, 
        { currentPassword, newPassword }, 
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('パスワード更新エラー:', error);
      throw error;
    }
  }

  /**
   * 通知設定を更新
   */
  async updateNotificationSettings(
    notificationSettings: NotificationSettingsType
  ): Promise<{ message: string; notificationSettings: NotificationSettingsType }> {
    try {
      const response = await axios.put(
        USER.UPDATE_NOTIFICATION_SETTINGS, 
        notificationSettings, 
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('通知設定更新エラー:', error);
      throw error;
    }
  }

  /**
   * ユーザーを削除（管理者用）
   */
  async deleteUser(userId: string): Promise<{ message: string }> {
    try {
      const response = await axios.delete(USER.DELETE_BY_ID(userId), getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('ユーザー削除エラー:', error);
      throw error;
    }
  }

  /**
   * すべてのユーザーを取得（管理者用）
   */
  async getAllUsers(): Promise<IUser[]> {
    try {
      const response = await axios.get(USER.GET_ALL, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('全ユーザー取得エラー:', error);
      throw error;
    }
  }

  /**
   * 特定のユーザーを取得（管理者用）
   */
  async getUserById(userId: string): Promise<IUser> {
    try {
      const response = await axios.get(USER.GET_BY_ID(userId), getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('ユーザー取得エラー:', error);
      throw error;
    }
  }

  /**
   * ユーザー情報を更新（管理者用）
   */
  async updateUserById(userId: string, updateData: UserUpdateRequest): Promise<IUser> {
    try {
      const response = await axios.put(USER.UPDATE_BY_ID(userId), updateData, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('ユーザー更新エラー:', error);
      throw error;
    }
  }
}

export default new UserService();