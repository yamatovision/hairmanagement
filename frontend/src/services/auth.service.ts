import { 
  IUser, 
  API_BASE_PATH,
  AUTH
} from '../types';

// 追加型定義
type UserLoginRequest = {
  email: string;
  password: string;
};

type UserLoginResponse = {
  user: Omit<IUser, 'password'>;
  token: string;
  refreshToken: string;
};

type UserRegistrationRequest = {
  email: string;
  password: string;
  name: string;
  birthDate: string;
  role?: 'employee' | 'manager' | 'admin';
};

// APIのBase URL
// 環境に応じて適切なURLを選択
const isDevelopment = process.env.NODE_ENV === 'development';
// 開発環境ではプロキシを使用
const API_URL = isDevelopment ? '' : 'https://patrolmanagement-backend-235426778039.asia-northeast1.run.app';

/**
 * 認証サービス
 * バックエンドの認証APIとの通信を担当
 */
class AuthService {
  /**
   * ユーザーログイン
   * @param email メールアドレス
   * @param password パスワード
   * @returns ログイン情報（ユーザー情報、トークン）
   */
  async login(email: string, password: string): Promise<{user: IUser, token: string}> {
    const response = await fetch(`${API_URL}${API_BASE_PATH}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password } as UserLoginRequest),
      credentials: 'include', // クッキーを含める
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'ログインに失敗しました');
    }

    const data = await response.json();
    return {
      user: data.data.user,
      token: data.data.token
    };
  }

  /**
   * ユーザーログアウト
   */
  async logout(): Promise<void> {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${API_URL}${API_BASE_PATH}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include', // クッキーを含める
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'ログアウトに失敗しました');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // エラーがあってもローカルストレージはクリア
    }

    // ローカルストレージからユーザー情報とトークンを削除
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  /**
   * トークンリフレッシュ
   * @returns 新しいアクセストークンとユーザー情報
   */
  async refreshToken(): Promise<{user: IUser, token: string}> {
    const refreshToken = localStorage.getItem('refreshToken');
    
    const response = await fetch(`${API_URL}${API_BASE_PATH}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
      credentials: 'include', // クッキーを含める
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'トークンのリフレッシュに失敗しました');
    }

    const data = await response.json();
    return {
      user: data.data.user,
      token: data.data.token
    };
  }

  /**
   * 現在のユーザー情報を取得
   * @returns ユーザー情報
   */
  async getCurrentUser(): Promise<IUser> {
    const token = localStorage.getItem('token');
    
    // Clean Architectureに合わせてエンドポイントをusers/meに変更
    const response = await fetch(`${API_URL}${API_BASE_PATH}/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include', // クッキーを含める
    });

    if (!response.ok) {
      // 404エラーの場合は、古いエンドポイントを試す（フォールバック）
      if (response.status === 404) {
        console.log('新しいエンドポイントが見つからないため、従来のエンドポイントを試します');
        const fallbackResponse = await fetch(`${API_URL}${API_BASE_PATH}/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        });
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          return fallbackData.data;
        }
      }
      
      const errorData = await response.json().catch(() => ({ message: '不明なエラー' }));
      throw new Error(errorData.message || 'ユーザー情報の取得に失敗しました');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * パスワードリセットメール送信
   * @param email メールアドレス
   */
  async forgotPassword(email: string): Promise<void> {
    const response = await fetch(`${API_URL}${API_BASE_PATH}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'パスワードリセットメールの送信に失敗しました');
    }
  }

  /**
   * パスワードリセット
   * @param token リセットトークン
   * @param password 新しいパスワード
   */
  async resetPassword(token: string, password: string): Promise<void> {
    const response = await fetch(`${API_URL}${API_BASE_PATH}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'パスワードリセットに失敗しました');
    }
  }

  /**
   * パスワード変更
   * @param currentPassword 現在のパスワード
   * @param newPassword 新しいパスワード
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}${API_BASE_PATH}/auth/me/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
      credentials: 'include', // クッキーを含める
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'パスワード変更に失敗しました');
    }
  }

  /**
   * ユーザー登録（管理者用）
   * @param userData ユーザー登録データ
   * @returns 作成されたユーザー情報
   */
  async registerUser(userData: UserRegistrationRequest): Promise<IUser> {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}${API_BASE_PATH}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
      credentials: 'include', // クッキーを含める
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'ユーザー登録に失敗しました');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * トークンが有効かどうかを確認
   * @returns トークンが有効かどうか
   */
  isTokenValid(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      // トークンが存在する場合は有効と見なす
      // 実際のリクエスト時に401エラーが発生すればリフレッシュが試みられる
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const authService = new AuthService();