import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { useAuth } from './contexts/AuthContext';
import OfflineIndicator from './components/common/OfflineIndicator';
import './App.css';

// ナビゲーションアイテムの定義
const navItems = [
  {
    label: 'デイリー運勢',
    href: '/fortune',
    icon: <span className="material-icons">auto_awesome</span>
  },
  {
    label: 'AI対話',
    href: '/conversation',
    icon: <span className="material-icons">chat</span>
  },
  {
    label: 'チーム',
    href: '/team',
    icon: <span className="material-icons">groups</span>
  },
  {
    label: 'プロフィール',
    href: '/profile',
    icon: <span className="material-icons">person</span>
  },
  {
    label: 'ダッシュボード',
    href: '/dashboard',
    icon: <span className="material-icons">dashboard</span>,
    requiredRole: 'manager'
  }
];

/**
 * アプリケーションのメインコンポーネント
 */
function App() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [currentPath, setCurrentPath] = useState('/');
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // パスの更新
  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location]);

  // PWAインストールプロンプトの処理
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      // インストールプロンプトの表示をキャンセル
      e.preventDefault();
      // 後で使用するためにイベントを保存
      setInstallPrompt(e);
      // インストールバナーを表示
      setShowInstallBanner(true);
    });
  }, []);

  const handleInstallClick = () => {
    if (!installPrompt) return;
    
    // インストールプロンプトを表示
    installPrompt.prompt();
    
    // プロンプトの結果を待つ
    installPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('ユーザーがアプリをインストールしました');
      } else {
        console.log('ユーザーがインストールを拒否しました');
      }
      // プロンプトは一度しか使用できないのでリセット
      setInstallPrompt(null);
      setShowInstallBanner(false);
    });
  };

  // ログイン画面ではナビゲーションバーを表示しない
  const isLoginPage = currentPath === '/login';

  return (
    <div className="app">
      <OfflineIndicator position="top-right" />
      
      {/* PWAインストールバナー */}
      {showInstallBanner && (
        <div className="install-banner">
          <p>このアプリをホーム画面に追加して、いつでも簡単にアクセスできます。</p>
          <button onClick={handleInstallClick}>インストール</button>
          <button onClick={() => setShowInstallBanner(false)}>閉じる</button>
        </div>
      )}
      
      <main className={`app-main ${isAuthenticated && !isLoginPage ? 'with-navbar' : ''}`}>
        <AppRoutes />
      </main>
      
      {isAuthenticated && !isLoginPage && (
        <nav className="navbar">
          <div className="container">
            <div className="navbar-brand">
              <span className="material-icons">spa</span>
              <span>陰陽五行AI</span>
            </div>
            <div className="navbar-menu">
              {navItems.map((item, index) => (
                <Link 
                  key={index} 
                  to={item.href} 
                  className={`navbar-item ${currentPath === item.href ? 'active' : ''}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
            {user && (
              <div className="user-menu">
                <div className="user-avatar">
                  {user.name.charAt(0)}
                </div>
                <span className="user-name">{user.name}</span>
              </div>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}

export default App;