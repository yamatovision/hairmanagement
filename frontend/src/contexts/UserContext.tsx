import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { IUser, NotificationSettingsType, ISajuProfile } from '../types/models';
import userService from '../services/user.service';
import { useAuth } from './AuthContext';

// UserUpdateRequestの型定義
type UserUpdateRequest = Partial<Omit<IUser, 'id' | 'createdAt' | 'updatedAt' | 'password'>>;

// コンテキストの型定義
interface UserContextType {
  user: IUser | null;
  sajuProfile: ISajuProfile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (data: UserUpdateRequest) => Promise<IUser | null>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateNotificationSettings: (settings: NotificationSettingsType) => Promise<void>;
  loadSajuProfile: () => Promise<ISajuProfile | null>;
  refreshUserData: () => Promise<void>;
}

// デフォルト値で初期化
const UserContext = createContext<UserContextType>({
  user: null,
  sajuProfile: null,
  loading: true,
  error: null,
  updateProfile: async () => null,
  updatePassword: async () => {},
  updateNotificationSettings: async () => {},
  loadSajuProfile: async () => null,
  refreshUserData: async () => {}
});

// カスタムフック
export const useUser = () => useContext(UserContext);

// プロバイダーコンポーネント
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [sajuProfile, setSajuProfile] = useState<ISajuProfile | null>(null);
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
      
      // 四柱推命プロファイルの取得を試みる
      try {
        const profile = await userService.getSajuProfile();
        if (profile) {
          setSajuProfile(profile);
          // ユーザーデータにも四柱推命プロファイルを設定
          userData.sajuProfile = profile;
        }
      } catch (profileErr) {
        console.error('四柱推命プロファイル取得エラー:', profileErr);
      }
      
      setUser(userData);
      setError(null);
    } catch (err) {
      setError('ユーザー情報の取得に失敗しました');
      console.error('ユーザー情報取得エラー:', err);
    } finally {
      setLoading(false);
    }
  };

  // 四柱推命プロファイルを読み込む関数
  const loadSajuProfile = async (): Promise<ISajuProfile | null> => {
    try {
      const profile = await userService.getSajuProfile();
      if (profile) {
        setSajuProfile(profile);
        
        // userオブジェクトにもsajuProfileを設定
        if (user) {
          const updatedUser = { ...user, sajuProfile: profile };
          setUser(updatedUser);
        }
      }
      return profile;
    } catch (err) {
      console.error('四柱推命プロファイル取得エラー:', err);
      return null;
    }
  };

  // 認証状態が変わったら、ユーザーデータを取得
  // fetchUserDataをdependencyから外し、無限ループを防止
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserData();
    } else {
      setUser(null);
      setSajuProfile(null);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // プロフィール更新
  const updateProfile = async (data: UserUpdateRequest) => {
    try {
      setLoading(true);
      const updatedUser = await userService.updateProfile(data);
      
      if (updatedUser) {
        // 生年月日、出生時間、出生地のいずれかが更新された場合、sajuProfileも更新
        if (data.birthDate || data.birthHour !== undefined || data.birthLocation) {
          try {
            // 四柱推命プロファイルを再取得
            const newSajuProfile = await userService.getSajuProfile();
            if (newSajuProfile) {
              setSajuProfile(newSajuProfile);
              
              // 重要: sajuProfileをupdatedUserオブジェクトにも追加
              updatedUser.sajuProfile = newSajuProfile;
              console.log('四柱推命プロファイルを更新:', newSajuProfile);
            }
          } catch (error) {
            console.error('四柱推命プロファイル更新エラー:', error);
          }
        } else if (sajuProfile) {
          // sajuProfileが既に存在する場合は、それを保持
          updatedUser.sajuProfile = sajuProfile;
        }
        
        // 更新されたユーザー情報をセット
        setUser(updatedUser);
        setError(null);
        return updatedUser;
      } else {
        throw new Error('ユーザー情報の更新に失敗しました');
      }
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
    
    // 生年月日があれば四柱推命プロファイルも取得（出生時間は省略可）
    // 生年月日が設定されていれば常にsajuProfileを取得する
    if (user?.birthDate) {
      await loadSajuProfile();
    }
  };

  // コンテキスト値
  const value = {
    user,
    sajuProfile,
    loading,
    error,
    updateProfile,
    updatePassword,
    updateNotificationSettings,
    loadSajuProfile,
    refreshUserData
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserContext;