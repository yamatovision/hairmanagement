import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// コンポーネントのプロップス型定義
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'employee' | 'manager' | 'admin';
}

/**
 * 保護されたルートコンポーネント
 * 認証が必要なページへのアクセスを制御する
 * 未認証ユーザーはログインページにリダイレクト
 * 権限不足のユーザーは権限エラーページにリダイレクト
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole = 'employee' 
}) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  // 認証状態ロード中
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>認証情報を確認中...</p>
      </div>
    );
  }

  // 未認証の場合はログインページにリダイレクト
  if (!isAuthenticated) {
    // ログイン後に元のページにリダイレクトするためにパスを保存
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ユーザーが存在しない場合（異常系）
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ロールベースのアクセス制御
  if (requiredRole) {
    const roleHierarchy = { 'employee': 0, 'manager': 1, 'admin': 2 };
    const userRoleLevel = roleHierarchy[user.role];
    const requiredRoleLevel = roleHierarchy[requiredRole];

    // 必要な権限が不足している場合は権限エラーページにリダイレクト
    if (userRoleLevel < requiredRoleLevel) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // 認証・権限チェック通過後、子コンポーネントをレンダリング
  return <>{children}</>;
};