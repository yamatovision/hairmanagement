import { IUser, NotificationSettingsType, USER, ISajuProfile } from '../types';
import { apiRequest } from '../utils/api.utils';

// UserUpdateRequest型定義
type UserUpdateRequest = Partial<Omit<IUser, 'id' | 'createdAt' | 'updatedAt' | 'password'>>;

// apiRequestはトークンを自動的に追加するため、個別のヘルパー関数は不要

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
      // apiRequestを使用して安全にリクエスト
      const userData = await apiRequest<IUser>(USER.ME, {
        method: 'GET',
        offlineTtl: 60 * 60 * 1000 // 1時間キャッシュ
      });
      
      // フィールド名の変換: elementalProfile → elementalType
      if (userData.elementalProfile && !userData.elementalType) {
        userData.elementalType = userData.elementalProfile;
        delete userData.elementalProfile;
        console.log('GetCurrentUser - フィールド名変換: elementalProfile → elementalType', userData);
      }
      
      // 生年月日がないユーザーの場合、コンソールに警告
      if (!userData.birthDate) {
        console.warn('生年月日が設定されていません。プロフィール設定で生年月日を登録してください。');
      }
      
      return userData;
    } catch (error) {
      console.error('ユーザー情報取得エラー:', error);
      throw error;
    }
  }
  
  /**
   * ユーザーの四柱推命プロファイルを取得
   */
  async getSajuProfile(): Promise<ISajuProfile | null> {
    try {
      const response = await apiRequest<ISajuProfile>(USER.GET_SAJU_PROFILE, {
        method: 'GET',
        offlineTtl: 60 * 60 * 1000 // 1時間キャッシュ
      });
      
      // 応答が空の場合やフォーマットが正しくない場合のチェック
      if (!response || !response.fourPillars) {
        console.warn('四柱推命プロファイルのフォーマットが不正:', response);
        return null;
      }
      
      console.log('四柱推命プロファイル取得成功:', response);
      return response;
    } catch (error) {
      console.error('四柱推命プロファイル取得エラー:', error);
      // エラーの場合でも処理を続行できるようnullを返す
      return null;
    }
  }

  /**
   * ユーザープロフィールを更新
   */
  async updateProfile(updateData: UserUpdateRequest): Promise<IUser> {
    try {
      const response = await apiRequest<{message: string, user: IUser}>(USER.UPDATE_PROFILE, {
        method: 'PUT',
        data: updateData
      });
      
      // バックエンドの応答形式に合わせて、user フィールドを返す
      if (response.user) {
        // フィールド名の変換: elementalProfile → elementalType
        const userData = { ...response.user };
        if (userData.elementalProfile && !userData.elementalType) {
          userData.elementalType = userData.elementalProfile;
          delete userData.elementalProfile;
          console.log('フィールド名変換: elementalProfile → elementalType', userData);
        }
        return userData;
      } else if ('message' in response && typeof response === 'object') {
        // 古い応答形式の場合は、最新のユーザー情報を取得する
        const userData = await this.getCurrentUser();
        return userData;
      }
      
      // それ以外の場合は応答全体を返す（型キャスト）
      return response as unknown as IUser;
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
      const response = await apiRequest<{ message: string }>(USER.UPDATE_PASSWORD, {
        method: 'PUT',
        data: { currentPassword, newPassword }
      });
      return response;
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
      const response = await apiRequest<{ message: string; notificationSettings: NotificationSettingsType }>(
        USER.UPDATE_NOTIFICATION_SETTINGS,
        {
          method: 'PUT',
          data: notificationSettings
        }
      );
      return response;
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
      const response = await apiRequest<{ message: string }>(
        USER.DELETE_BY_ID(userId),
        {
          method: 'DELETE'
        }
      );
      return response;
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
      const users = await apiRequest<IUser[]>(
        USER.GET_ALL,
        {
          method: 'GET',
          offlineTtl: 60 * 60 * 1000 // 1時間キャッシュ
        }
      );
      return users;
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
      const user = await apiRequest<IUser>(
        USER.GET_BY_ID(userId),
        {
          method: 'GET',
          offlineTtl: 60 * 60 * 1000 // 1時間キャッシュ
        }
      );
      return user;
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
      const user = await apiRequest<IUser>(
        USER.UPDATE_BY_ID(userId),
        {
          method: 'PUT',
          data: updateData
        }
      );
      return user;
    } catch (error) {
      console.error('ユーザー更新エラー:', error);
      throw error;
    }
  }
}

const userService = new UserService();
export default userService;