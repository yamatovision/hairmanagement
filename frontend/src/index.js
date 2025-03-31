import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css';
import './api/apiConfig'; // グローバルAPI設定をインポート
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as serviceWorker from './serviceWorker';
import { AuthProvider } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
import { FortuneProvider } from './contexts/FortuneContext';
import { BrowserRouter } from 'react-router-dom';
import { OfflineProvider } from './contexts/OfflineContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <UserProvider>
          <FortuneProvider>
            <OfflineProvider>
              <App />
            </OfflineProvider>
          </FortuneProvider>
        </UserProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// パフォーマンス測定が必要な場合はwebVitalsを利用
reportWebVitals();

// PWA対応のためのサービスワーカー登録
// オフラインサポートを有効にするには register() を呼び出します
// 詳細は https://cra.link/PWA を参照
serviceWorker.register({
  onUpdate: registration => {
    // 新しいバージョンがあることをユーザーに通知
    const confirmUpdate = window.confirm(
      'アプリケーションの新しいバージョンが利用可能です。更新しますか？'
    );
    
    if (confirmUpdate && registration.waiting) {
      // 即時更新を実行
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  },
  onSuccess: registration => {
    console.log('オフラインモードが有効になりました');
  }
});