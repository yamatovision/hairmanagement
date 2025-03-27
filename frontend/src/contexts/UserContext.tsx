import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { IUser, UserUpdateRequest, NotificationSettingsType } from '../utils/sharedTypes';
import userService from '../services/user.service';
import { useAuth } from './AuthContext';

// コンテキストの型定義
interface UserContextType {
  user: IUser | null;
  loading: boolean;
  error: string | null;
  updateProfile: (data: UserUpdateRequest) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateNotificationSettings: (settings: NotificationSettingsType) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

// デフォルト値で初期化
const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  error: null,
  updateProfile: async () => {},
  updatePassword: async () => {},
  updateNotificationSettings: async () => {},
  refreshUserData: async () => {}
});

// カスタムフック
export const useUser = () => useContext(UserContext);

// プロバイダーコンポーネント
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  // ユーザーデータを取得する関数
  const fetchUserData = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userData = await userService.getCurrentUser();
      setUser(userData);
      setError(null);
    } catch (err) {
      setError('ユーザー情報の取得に失敗しました');
      console.error('ユーザー情報取得エラー:', err);
    } finally {
      setLoading(false);
    }
  };

  // 認証状態が変わったら、ユーザーデータを取得
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserData();
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [isAuthenticated]);

  // プロフィール更新
  const updateProfile = async (data: UserUpdateRequest) => {
    try {
      setLoading(true);
      const updatedUser = await userService.updateProfile(data);
      setUser(updatedUser);
      setError(null);
    } catch (err) {
      setError('プロフィールの更新に失敗しました');
      console.error('プロフィール更新エラー:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // パスワード更新
  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setLoading(true);
      await userService.updatePassword(currentPassword, newPassword);
      setError(null);
    } catch (err) {
      setError('パスワードの更新に失敗しました');
      console.error('パスワード更新エラー:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 通知設定更新
  const updateNotificationSettings = async (settings: NotificationSettingsType) => {
    try {
      setLoading(true);
      await userService.updateNotificationSettings(settings);
      
      // ユーザー情報を再取得して最新の状態を反映
      await fetchUserData();
      setError(null);
    } catch (err) {
      setError('通知設定の更新に失敗しました');
      console.error('通知設定更新エラー:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ユーザーデータを再取得
  const refreshUserData = async () => {
    await fetchUserData();
  };

  // コンテキスト値
  const value = {
    user,
    loading,
    error,
    updateProfile,
    updatePassword,
    updateNotificationSettings,
    refreshUserData
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserContext;