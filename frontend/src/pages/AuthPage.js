import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/auth.css';

/**
 * 認証ページ
 * ログイン、パスワードリセットのフォームを提供
 */
const AuthPage = () => {
  // 現在表示するフォームの状態
  const [formType, setFormType] = useState('login');
  
  // ログインフォームの状態
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });
  
  // パスワードリセットフォームの状態
  const [forgotPasswordForm, setForgotPasswordForm] = useState({
    email: '',
  });
  
  // 成功・エラーメッセージの状態
  const [successMessage, setSuccessMessage] = useState(null);
  
  // 認証コンテキストとルーター
  const { login, forgotPassword, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // ログイン後のリダイレクト先（URLパラメータから取得）
  const from = location.state?.from?.pathname || '/';
  
  // ログインフォームの送信ハンドラ
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setSuccessMessage(null);
    
    try {
      await login(loginForm.email, loginForm.password);
      // ログイン成功後、元のページまたはデフォルトページにリダイレクト
      navigate(from, { replace: true });
    } catch (error) {
      // エラー処理はuseAuthで行われる
      console.error('Login error:', error);
    }
  };
  
  // パスワードリセットフォームの送信ハンドラ
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setSuccessMessage(null);
    
    try {
      await forgotPassword(forgotPasswordForm.email);
      setSuccessMessage('パスワードリセットメールを送信しました。メールをご確認ください。');
    } catch (error) {
      // エラー処理はuseAuthで行われる
      console.error('Forgot password error:', error);
    }
  };
  
  // ログインフォーム入力変更ハンドラ
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm({
      ...loginForm,
      [name]: value,
    });
  };
  
  // パスワードリセットフォーム入力変更ハンドラ
  const handleForgotPasswordChange = (e) => {
    const { name, value } = e.target;
    setForgotPasswordForm({
      ...forgotPasswordForm,
      [name]: value,
    });
  };
  
  // フォームタイプ切り替えハンドラ
  const toggleFormType = () => {
    clearError();
    setSuccessMessage(null);
    setFormType(formType === 'login' ? 'forgotPassword' : 'login');
  };
  
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-logo">
          <h1>陰陽五行AIケアコンパニオン</h1>
        </div>
        
        {formType === 'login' ? (
          // ログインフォーム
          <div className="auth-form">
            <h2>ログイン</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label htmlFor="email">メールアドレス</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={loginForm.email}
                  onChange={handleLoginChange}
                  required
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">パスワード</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  required
                  className="form-control"
                />
              </div>
              <button type="submit" className="btn btn-primary">ログイン</button>
            </form>
            <p className="form-toggle">
              パスワードをお忘れですか？{' '}
              <button onClick={toggleFormType} className="link-button">
                パスワードをリセット
              </button>
            </p>
          </div>
        ) : (
          // パスワードリセットフォーム
          <div className="auth-form">
            <h2>パスワードリセット</h2>
            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}
            <form onSubmit={handleForgotPasswordSubmit}>
              <div className="form-group">
                <label htmlFor="reset-email">メールアドレス</label>
                <input
                  type="email"
                  id="reset-email"
                  name="email"
                  value={forgotPasswordForm.email}
                  onChange={handleForgotPasswordChange}
                  required
                  className="form-control"
                />
              </div>
              <button type="submit" className="btn btn-primary">パスワードリセット</button>
            </form>
            <p className="form-toggle">
              アカウントをお持ちですか？{' '}
              <button onClick={toggleFormType} className="link-button">
                ログイン
              </button>
            </p>
          </div>
        )}
        
        <div className="auth-footer">
          <p>© 2025 美容師向け陰陽五行AIケアコンパニオン</p>
        </div>
      </div>
      
      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #9c27b0, #f50057);
          padding: 20px;
        }
        
        .auth-container {
          width: 100%;
          max-width: 400px;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          padding: 30px;
        }
        
        .auth-logo {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .auth-logo h1 {
          font-size: 1.5rem;
          color: #9c27b0;
          margin: 0;
        }
        
        .auth-form h2 {
          font-size: 1.5rem;
          margin-bottom: 20px;
          text-align: center;
          color: #333;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #555;
        }
        
        .form-group input {
          width: 100%;
          padding: 12px 15px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          transition: border-color 0.3s;
        }
        
        .form-group input:focus {
          border-color: #9c27b0;
          outline: none;
        }
        
        .btn-primary {
          width: 100%;
          background-color: #9c27b0;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 12px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        
        .btn-primary:hover {
          background-color: #7b1fa2;
        }
        
        .error-message {
          background-color: #ffebee;
          color: #d32f2f;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
          font-size: 0.9rem;
        }
        
        .success-message {
          background-color: #e8f5e9;
          color: #2e7d32;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
          font-size: 0.9rem;
        }
        
        .form-toggle {
          text-align: center;
          margin-top: 20px;
          font-size: 0.9rem;
          color: #666;
        }
        
        .link-button {
          background: none;
          border: none;
          color: #9c27b0;
          text-decoration: underline;
          cursor: pointer;
          font-size: 0.9rem;
          padding: 0;
        }
        
        .auth-footer {
          text-align: center;
          margin-top: 30px;
          font-size: 0.8rem;
          color: #999;
        }
      `}</style>
    </div>
  );
};

export default AuthPage;