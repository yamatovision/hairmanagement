import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import AuthPage from '../pages/AuthPage';
// 遅延ロードするページコンポーネント
const DailyFortunePage = React.lazy(() => import('../pages/DailyFortunePage'));
const ManagerDashboardPage = React.lazy(() => import('../pages/ManagerDashboardPage'));
const ConversationPage = React.lazy(() => import('../pages/ConversationPage'));
const ProfilePage = React.lazy(() => import('../pages/ProfilePage'));
const TeamPage = React.lazy(() => import('../pages/TeamPage'));

// ダミーのホームページコンポーネント（後で実際の実装に置き換え）
const HomePage = () => (
  <div className="container p-4">
    <h1>陰陽五行AIケアコンパニオン</h1>
    <p>ようこそ！このアプリケーションは現在開発中です。</p>
    <div className="element-tag element-wood">木</div>
    <div className="element-tag element-fire">火</div>
    <div className="element-tag element-earth">土</div>
    <div className="element-tag element-metal">金</div>
    <div className="element-tag element-water">水</div>
  </div>
);

// 未認証時に表示されるページ
const UnauthorizedPage = () => (
  <div className="container p-4">
    <h1>アクセス権限がありません</h1>
    <p>このページへのアクセス権限がありません。</p>
  </div>
);

/**
 * アプリケーションのルーティング設定
 */
const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* 認証ページ */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/" /> : <AuthPage />} 
      />
      
      {/* 認証が必要なページ */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } 
      />
      
      {/* デイリーフォーチュンページ */}
      <Route 
        path="/fortune" 
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<div>読み込み中...</div>}>
              <DailyFortunePage />
            </React.Suspense>
          </ProtectedRoute>
        } 
      />
      {/* ダミールート - コメントアウト
      <Route 
        path="/fortune" 
        element={
          <ProtectedRoute>
            <div>運勢ページ（開発中）</div>
          </ProtectedRoute>
        } 
      /> */}
      
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<div>読み込み中...</div>}>
              <ProfilePage />
            </React.Suspense>
          </ProtectedRoute>
        } 
      />
      
      {/* チームページ */}
      <Route 
        path="/team" 
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<div>読み込み中...</div>}>
              <TeamPage />
            </React.Suspense>
          </ProtectedRoute>
        } 
      />
      
      {/* AI対話ページ */}
      <Route 
        path="/conversation" 
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<div>読み込み中...</div>}>
              <ConversationPage />
            </React.Suspense>
          </ProtectedRoute>
        } 
      />
      
      {/* 特定の会話IDを指定した場合 */}
      <Route 
        path="/conversation/:conversationId" 
        element={
          <ProtectedRoute>
            <React.Suspense fallback={<div>読み込み中...</div>}>
              <ConversationPage />
            </React.Suspense>
          </ProtectedRoute>
        } 
      />
      
      {/* 経営者ダッシュボードページ (manager/admin権限のみ) */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute requiredRole={['manager', 'admin']}>
            <React.Suspense fallback={<div>読み込み中...</div>}>
              <ManagerDashboardPage />
            </React.Suspense>
          </ProtectedRoute>
        } 
      />
      {/* ダミールート - コメントアウト
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute requiredRole={['manager', 'admin']}>
            <div>経営者ダッシュボード（開発中）</div>
          </ProtectedRoute>
        } 
      /> */}

      {/* 権限エラーページ */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      
      {/* 存在しないページへのリダイレクト */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;