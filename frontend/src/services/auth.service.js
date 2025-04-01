// Import types and constants as needed

// APIのBase URL
// 環境に応じて適切なURLを選択
const isDevelopment = process.env.NODE_ENV === 'development';
// 開発環境ではプロキシを使用
const API_URL = isDevelopment ? '' : 'https://patrolmanagement-backend-235426778039.asia-northeast1.run.app';
const API_BASE_PATH = '/api/v1';

// axiosの代わりにfetchを使用しているため、開発環境ではCORS問題が発生する可能性がある
// 開発環境用のヘルパー関数
const getApiUrl = (endpoint) => {
  // 開発環境では直接バックエンドURLを指定、本番環境ではプロキシ設定を使用
  if (isDevelopment) {
    return `http://localhost:5001${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  }
  return `${API_URL}${endpoint}`;
};

if (isDevelopment) {
  console.log('開発環境での認証サービスの初期化');
}

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
  async login(email, password) {
    const url = getApiUrl(`${API_BASE_PATH}/auth/login`);
    console.log('Login request URL:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
      // credentials: 'include' を削除
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'ログインに失敗しました');
    }

    const data = await response.json();
    console.log('Login response:', data);
    
    // クリーンアーキテクチャのレスポンス形式に対応
    // レスポンスが data ラッパーを持っている場合と持っていない場合の両方に対応
    if (data.data) {
      // 以前の形式 (MVCアーキテクチャ): { data: { user: {...}, token: '...' } }
      return {
        user: data.data.user,
        token: data.data.token,
        refreshToken: data.data.refreshToken
      };
    } else {
      // 新しい形式 (クリーンアーキテクチャ): { user: {...}, token: '...' }
      return {
        user: data.user,
        token: data.token,
        refreshToken: data.refreshToken
      };
    }
  }

  /**
   * ユーザーログアウト
   */
  async logout() {
    const token = localStorage.getItem('token');
    
    try {
      const url = getApiUrl(`${API_BASE_PATH}/auth/logout`);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
        // credentials: 'include' を削除
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
  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    
    const url = getApiUrl(`${API_BASE_PATH}/auth/refresh-token`);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken })
      // credentials: 'include' を削除
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'トークンのリフレッシュに失敗しました');
    }

    const data = await response.json();
    console.log('Refresh token response:', data);
    
    // クリーンアーキテクチャのレスポンス形式に対応
    if (data.data) {
      // 以前の形式
      return {
        user: data.data.user,
        token: data.data.token,
        refreshToken: data.data.refreshToken
      };
    } else {
      // 新しい形式
      return {
        user: data.user || {}, // ユーザー情報がない場合は空オブジェクト
        token: data.token,
        refreshToken: data.refreshToken
      };
    }
  }

  /**
   * 現在のユーザー情報を取得
   * @returns ユーザー情報
   */
  async getCurrentUser() {
    const token = localStorage.getItem('token');
    
    // Clean Architectureに合わせてエンドポイントをusers/meに変更
    const url = getApiUrl(`${API_BASE_PATH}/users/me`);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
      // credentials: 'include' を削除
    });

    if (!response.ok) {
      // 404エラーの場合は、古いエンドポイントを試す（フォールバック）
      if (response.status === 404) {
        console.log('新しいエンドポイントが見つからないため、従来のエンドポイントを試します');
        const fallbackUrl = getApiUrl(`${API_BASE_PATH}/auth/me`);
        const fallbackResponse = await fetch(fallbackUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          // クリーンアーキテクチャのレスポンス形式に対応
          if (fallbackData.data) {
            return fallbackData.data; // 以前の形式
          } else {
            return fallbackData; // 新しい形式
          }
        }
      }
      
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || 'ユーザー情報の取得に失敗しました');
      } catch (e) {
        throw new Error('ユーザー情報の取得に失敗しました');
      }
    }

    const data = await response.json();
    console.log('Get current user response:', data);
    
    // クリーンアーキテクチャのレスポンス形式に対応
    if (data.data) {
      return data.data; // 以前の形式
    } else {
      return data; // 新しい形式
    }
  }

  /**
   * パスワードリセットメール送信
   * @param email メールアドレス
   */
  async forgotPassword(email) {
    const url = getApiUrl(`${API_BASE_PATH}/auth/forgot-password`);
    const response = await fetch(url, {
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
  async resetPassword(token, password) {
    const url = getApiUrl(`${API_BASE_PATH}/auth/reset-password`);
    const response = await fetch(url, {
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
  async changePassword(currentPassword, newPassword) {
    const token = localStorage.getItem('token');
    
    const url = getApiUrl(`${API_BASE_PATH}/auth/me/password`);
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword })
      // credentials: 'include' を削除
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'パスワード変更に失敗しました');
    }
  }

  /**
   * ユーザー登録
   * @param userData ユーザー登録データ
   * @returns 作成されたユーザー情報
   */
  async registerUser(userData) {
    const url = getApiUrl(`${API_BASE_PATH}/auth/register`);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
      // credentials: 'include' を削除
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'ユーザー登録に失敗しました');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * 管理者によるユーザー登録
   * @param userData ユーザー登録データ
   * @returns 作成されたユーザー情報
   */
  async adminRegisterUser(userData) {
    const token = localStorage.getItem('token');
    
    const url = getApiUrl(`${API_BASE_PATH}/auth/admin/register`);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData)
      // credentials: 'include' を削除
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
  isTokenValid() {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    // トークンが存在する場合は有効と見なす
    // 実際のリクエスト時に401エラーが発生すればリフレッシュが試みられる
    return true;
  }
}

export const authService = new AuthService();