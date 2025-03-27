import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { UserProvider, useUser } from '../contexts/UserContext';
import { AuthContext } from '../contexts/AuthContext';
import ProfilePage from '../pages/ProfilePage';
import ProfileForm from '../components/profile/ProfileForm';
import NotificationSettings from '../components/profile/NotificationSettings';
import AIPersonalization from '../components/profile/AIPersonalization';
import userService from '../services/user.service';

// モック設定
jest.mock('../services/user.service');
jest.mock('../contexts/UserContext', () => {
  const originalModule = jest.requireActual('../contexts/UserContext');
  return {
    ...originalModule,
    useUser: jest.fn()
  };
});

// テスト用のモックデータ
const mockUser = {
  id: 'user-1',
  name: 'テストユーザー',
  email: 'test@example.com',
  role: 'employee' as const,
  birthDate: '1990-01-01',
  profilePicture: 'https://randomuser.me/api/portraits/women/65.jpg',
  elementalType: {
    mainElement: '木' as const,
    secondaryElement: '火' as const,
    yinYang: '陰' as const // yin: true から yinYang: '陰' as const に変更
  },
  notificationSettings: {
    dailyFortune: true,
    promptQuestions: true,
    teamEvents: true,
    goalReminders: false,
    systemUpdates: false
  },
  isActive: true
};

// モックユーザーコンテキスト
const mockUseUser = {
  user: mockUser,
  loading: false,
  error: null,
  updateProfile: jest.fn().mockResolvedValue(mockUser),
  updatePassword: jest.fn().mockResolvedValue({ message: 'パスワードが更新されました' }),
  updateNotificationSettings: jest.fn().mockResolvedValue({
    message: '通知設定が更新されました',
    notificationSettings: mockUser.notificationSettings
  }),
  refreshUserData: jest.fn()
};

// テスト用の認証コンテキスト
const mockAuthContext = {
  isAuthenticated: true,
  user: { 
    id: 'user-1', 
    email: 'test@example.com', 
    role: 'employee' as const,
    name: 'テストユーザー',
    birthDate: '1990-01-01',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  login: jest.fn(),
  logout: jest.fn(),
  loading: false,
  error: null,
  refreshToken: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
  changePassword: jest.fn(),
  clearError: jest.fn()
};

describe('ProfilePage コンポーネント', () => {
  beforeEach(() => {
    // テスト前にモックをリセット
    jest.clearAllMocks();
    (useUser as jest.Mock).mockReturnValue(mockUseUser);
  });

  test('プロフィールページのレンダリングとタブの切り替え', async () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthContext}>
          <ProfilePage />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    // ヘッダーが表示されることを確認
    expect(screen.getByText('マイプロフィール設定')).toBeInTheDocument();

    // タブが表示されることを確認
    expect(screen.getByText('基本情報')).toBeInTheDocument();
    expect(screen.getByText('通知設定')).toBeInTheDocument();
    expect(screen.getByText('AIパーソナライズ')).toBeInTheDocument();

    // タブを切り替える
    fireEvent.click(screen.getByText('通知設定'));
    
    // 通知設定タブの内容が表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('通知頻度')).toBeInTheDocument();
    });

    // AIパーソナライズタブに切り替える
    fireEvent.click(screen.getByText('AIパーソナライズ'));
    
    // AIパーソナライズタブの内容が表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('AIの話し方')).toBeInTheDocument();
    });
  });

  test('ユーザーがログインしていない場合、ログインを促すメッセージが表示される', async () => {
    // ユーザーがログインしていない状態をシミュレート
    (useUser as jest.Mock).mockReturnValue({
      ...mockUseUser,
      user: null
    });

    render(
      <MemoryRouter>
        <AuthContext.Provider value={{ 
          ...mockAuthContext, 
          isAuthenticated: false,
          user: { 
            id: 'user-1', 
            email: 'test@example.com', 
            role: 'employee' as const,
            name: 'テストユーザー',
            birthDate: '1990-01-01',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }}>
          <ProfilePage />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    // ログインを促すメッセージが表示されることを確認
    expect(screen.getByText('プロフィール情報を表示するにはログインしてください。')).toBeInTheDocument();
  });
});

describe('ProfileForm コンポーネント', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useUser as jest.Mock).mockReturnValue(mockUseUser);
  });

  test('プロフィールフォームのレンダリングと入力', async () => {
    render(
      <MemoryRouter>
        <ProfileForm user={mockUser} />
      </MemoryRouter>
    );

    // フォームの各フィールドが表示されることを確認
    expect(screen.getByLabelText('お名前')).toHaveValue(mockUser.name);
    expect(screen.getByLabelText('メールアドレス')).toHaveValue(mockUser.email);
    expect(screen.getByLabelText('生年月日')).toHaveValue(mockUser.birthDate);

    // 名前フィールドを変更
    fireEvent.change(screen.getByLabelText('お名前'), { target: { value: '新しい名前' } });
    
    // 陰陽五行属性を変更
    fireEvent.click(screen.getByText('火'));

    // フォームを送信
    fireEvent.click(screen.getByText('設定を保存'));

    // updateProfile 関数が呼ばれることを確認
    await waitFor(() => {
      expect(mockUseUser.updateProfile).toHaveBeenCalledWith(expect.objectContaining({
        name: '新しい名前',
        elementalType: expect.objectContaining({
          mainElement: '火'
        })
      }));
    });
  });
});

describe('NotificationSettings コンポーネント', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useUser as jest.Mock).mockReturnValue(mockUseUser);
  });

  test('通知設定フォームのレンダリングと設定変更', async () => {
    render(
      <MemoryRouter>
        <NotificationSettings notificationSettings={mockUser.notificationSettings} />
      </MemoryRouter>
    );

    // 各通知設定のスイッチが表示されることを確認
    const dailyFortuneSwitch = screen.getByRole('checkbox', { name: /デイリー運勢の通知/i });
    expect(dailyFortuneSwitch).toBeChecked();

    // スイッチを切り替える
    fireEvent.click(dailyFortuneSwitch);

    // 通知頻度スライダーが表示されることを確認
    expect(screen.getByText('通知頻度')).toBeInTheDocument();

    // 設定を保存
    fireEvent.click(screen.getByText('通知設定を保存'));

    // updateNotificationSettings 関数が呼ばれることを確認
    await waitFor(() => {
      expect(mockUseUser.updateNotificationSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          dailyFortune: false,
          promptQuestions: true,
          teamEvents: true
        })
      );
    });
  });
});

describe('AIPersonalization コンポーネント', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('AIパーソナライズ設定フォームのレンダリングと設定変更', async () => {
    // APIコールのモックを作成
    global.fetch = jest.fn(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })
    ) as jest.Mock;

    render(
      <MemoryRouter>
        <AIPersonalization />
      </MemoryRouter>
    );

    // AIの話し方セレクトが表示されることを確認
    expect(screen.getByText('AIの話し方')).toBeInTheDocument();
    
    // AIの話し方を変更
    fireEvent.mouseDown(screen.getByLabelText('AIの話し方'));
    fireEvent.click(screen.getByText('カジュアル（親しみやすい）'));

    // AIのサポート領域が表示されることを確認
    expect(screen.getByText('AIのサポート領域')).toBeInTheDocument();
    
    // 技術スキル向上のスイッチを切り替える
    const techSkillSwitch = screen.getByRole('checkbox', { name: /技術スキル向上/i });
    fireEvent.click(techSkillSwitch);

    // 設定を保存
    fireEvent.click(screen.getByText('設定を保存'));

    // 設定保存後、成功メッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByText('AIパーソナライズ設定が正常に更新されました。')).toBeInTheDocument();
    });
  });
});

// フロントエンドのサービスレイヤーのテスト
describe('user.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    localStorage.setItem('token', 'fake-token');
  });

  test('getCurrentUser 関数のテスト', async () => {
    // フェッチのモック実装
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser
    });

    const result = await userService.getCurrentUser();

    expect(result).toEqual(mockUser);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/users/me'),
      expect.objectContaining({
        headers: {
          Authorization: 'Bearer fake-token'
        }
      })
    );
  });

  test('updateProfile 関数のテスト', async () => {
    const updateData = {
      name: '更新された名前',
      birthDate: '1990-05-15',
      elementalType: {
        mainElement: '水' as const, // 明示的に ElementType として指定
        secondaryElement: '木' as const,
        yinYang: '陰' as const
      }
    };

    // フェッチのモック実装
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ...mockUser,
        ...updateData
      })
    });

    const result = await userService.updateProfile(updateData);

    expect(result.name).toBe(updateData.name);
    expect(result.elementalType.mainElement).toBe(updateData.elementalType.mainElement);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/users/me'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify(updateData)
      })
    );
  });

  test('updateNotificationSettings 関数のテスト', async () => {
    const notificationSettings = {
      dailyFortune: false,
      promptQuestions: true,
      teamEvents: false,
      goalReminders: true,
      systemUpdates: true
    };

    // フェッチのモック実装
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: '通知設定が更新されました',
        notificationSettings
      })
    });

    const result = await userService.updateNotificationSettings(notificationSettings);

    expect(result.message).toBe('通知設定が更新されました');
    expect(result.notificationSettings).toEqual(notificationSettings);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/users/me/notification-settings'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify(notificationSettings)
      })
    );
  });

  test('updatePassword 関数のテスト', async () => {
    const passwordData = {
      currentPassword: 'oldPassword',
      newPassword: 'newPassword'
    };

    // フェッチのモック実装
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: 'パスワードが正常に更新されました'
      })
    });

    const result = await userService.updatePassword(
      passwordData.currentPassword,
      passwordData.newPassword
    );

    expect(result.message).toBe('パスワードが正常に更新されました');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/users/me/password'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify(passwordData)
      })
    );
  });
});