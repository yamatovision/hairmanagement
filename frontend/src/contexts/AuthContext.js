import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/auth.service';

// 認証コンテキストの状態の型
const initialAuthState = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null
};

// 認証コンテキスト作成
export const AuthContext = createContext();

/**
 * 認証プロバイダーコンポーネント
 * アプリケーション全体の認証状態を管理する
 */
export const AuthProvider = ({ children }) => {
  // 認証状態
  const [state, setState] = useState(initialAuthState);

  // 初期ロード時に認証状態をチェック
  useEffect(() => {
    const initAuth = async () => {
      try {
        // ローカルストレージからユーザー情報を取得
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        
        if (storedUser && storedToken) {
          // ユーザー情報が存在する場合は認証済みとして扱う
          setState({
            ...state,
            isAuthenticated: true,
            user: JSON.parse(storedUser),
            loading: false
          });
          
          // トークンの有効性を確認
          try {
            await authService.getCurrentUser();
          } catch (error) {
            // トークンが無効な場合はリフレッシュを試みる
            try {
              await refreshToken();
            } catch (refreshError) {
              // リフレッシュに失敗した場合はログアウト
              await logout();
            }
          }
        } else {
          // ユーザー情報がない場合はロード完了
          setState({
            ...state,
            loading: false
          });
        }
      } catch (error) {
        setState({
          ...state,
          loading: false,
          error: '認証状態の初期化に失敗しました'
        });
      }
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * ログイン処理
   * @param email メールアドレス
   * @param password パスワード
   */
  const login = async (email, password) => {
    setState({ ...state, loading: true, error: null });
    
    try {
      // 実際のAPIでログイン
      const response = await authService.login(email, password);
      
      // ユーザー情報とトークンをローカルストレージに保存
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('token', response.token);
      
      setState({
        ...state,
        isAuthenticated: true,
        user: response.user,
        loading: false,
        error: null
      });
    } catch (error) {
      setState({
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: error.message || 'ログインに失敗しました'
      });
      throw error;
    }
  };

  /**
   * ログアウト処理
   */
  const logout = async () => {
    setState({ ...state, loading: true, error: null });
    
    try {
      // APIでログアウト処理
      await authService.logout();
      
      setState({
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('ログアウト時にエラーが発生しました', error);
      setState({
        ...state,
        loading: false,
        error: 'ログアウトに失敗しました'
      });
    }
  };

  /**
   * トークンリフレッシュ
   */
  const refreshToken = async () => {
    try {
      const response = await authService.refreshToken();
      
      // 新しいトークンとユーザー情報を更新
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setState({
        ...state,
        isAuthenticated: true,
        user: response.user,
        error: null
      });
    } catch (error) {
      // リフレッシュに失敗した場合はログアウト
      await logout();
      throw error;
    }
  };

  /**
   * パスワードリセットメール送信
   * @param email メールアドレス
   */
  const forgotPassword = async (email) => {
    setState({ ...state, loading: true, error: null });
    
    try {
      await authService.forgotPassword(email);
      setState({ ...state, loading: false });
    } catch (error) {
      setState({
        ...state,
        loading: false,
        error: error.message || 'パスワードリセットメールの送信に失敗しました'
      });
      throw error;
    }
  };

  /**
   * エラー情報をクリア
   */
  const clearError = () => {
    setState({ ...state, error: null });
  };

  // コンテキスト値の作成
  const contextValue = {
    ...state,
    login,
    logout,
    forgotPassword,
    clearError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * 認証コンテキストを使用するためのカスタムフック
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};