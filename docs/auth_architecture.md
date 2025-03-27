# 認証システムアーキテクチャ設計

## 1. 概要

美容師向け陰陽五行AIケアコンパニオンの認証システムは、セキュアかつユーザーフレンドリーな設計を目指します。本ドキュメントでは、ユーザーの認証プロセス、アクセス制御、権限管理の仕組みについて詳細に説明します。

## 2. 認証システムの基本方針

### 2.1 中央管理された認証フロー

- **単一の認証コンテキスト**：フロントエンド全体で一貫した認証状態を管理
- **AuthContext**：React Contextを使用したグローバルな認証状態管理
- **JWT（JSON Web Token）**：標準的なトークンベース認証を採用
- **リフレッシュトークン**：長期的なセッション維持のための機能実装

### 2.2 ルート保護パターン

- **ProtectedRoute**：認証必須ルートを一元的に保護するコンポーネント
- **リダイレクト**：未認証アクセス時の適切なリダイレクト処理
- **状態保持**：ログイン後に元のルートに戻る機能

### 2.3 権限管理

- **ロールベースのアクセス制御（RBAC）**：ユーザーロールに基づく機能制限
- **細粒度のアクセス制御**：特定の機能やデータに対する詳細な権限設定
- **フロントエンド/バックエンド両方での検証**：二重のセキュリティ

## 3. 使用する認証技術とフレームワーク

### 3.1 選定した認証サービス

本プロジェクトでは、**カスタム認証システム**を採用します。理由は以下の通りです：

- ユーザーデータと陰陽五行データの緊密な統合が必要
- 美容業界特有の階層構造と権限設定のカスタマイズ性
- データのプライバシーと完全なコントロール確保

### 3.2 技術スタック

- **バックエンド**：Node.js + Express + Mongoose
- **トークン**：JWT（jsonwebtoken）
- **暗号化**：bcrypt（パスワードハッシュ化）
- **フロントエンド**：React + Context API

## 4. ユーザー階層と権限構造

### 4.1 ユーザーロール

| ロール | 説明 | 主な権限 |
|------|------|--------|
| **従業員（Employee）** | 一般の美容師スタッフ | - 自分の運勢閲覧<br>- AI対話機能の利用<br>- 自分のキャリア情報管理<br>- チーム情報の閲覧 |
| **管理者（Manager）** | サロン責任者、店長など | - 従業員の全権限<br>- チームダッシュボードアクセス<br>- メンター割り当て<br>- 匿名エンゲージメント分析閲覧 |
| **システム管理者（Admin）** | サロンオーナー、本部管理者 | - 全権限<br>- ユーザー管理（追加/編集/削除）<br>- システム設定変更<br>- 詳細な分析データアクセス |

### 4.2 アクセス境界

**従業員（Employee）**:
- 自身のプロフィール情報と運勢のみアクセス可能
- チーム全体の情報は匿名化されたものだけアクセス可能
- メンターシップは自分が関与するものだけ表示

**管理者（Manager）**:
- チーム全体の運勢相性や傾向を閲覧可能
- フォローが必要な従業員の特定（匿名データから）
- メンターシップの管理と促進

**システム管理者（Admin）**:
- 全データへのフルアクセス
- ユーザーアカウントのライフサイクル管理
- システム設定の構成

## 5. 認証フロー詳細

### 5.1 登録プロセス

```
1. 従業員情報登録（Admin/Managerのみ実行可能）
   ↓
2. システムが初期パスワードを生成
   ↓
3. 従業員にメール/SMSで招待送信
   ↓
4. 初回ログイン時にパスワード変更を強制
   ↓
5. 詳細なプロフィール情報入力
   ↓
6. アカウント有効化完了
```

### 5.2 ログインプロセス

```
1. メールアドレスとパスワード入力
   ↓
2. バックエンドでの認証
   ↓
3. 認証成功: アクセストークン + リフレッシュトークン発行
   ↓
4. フロントエンドでトークン保存
   ↓
5. AuthContextの状態更新
   ↓
6. ダッシュボードにリダイレクト
```

### 5.3 トークン管理

- **アクセストークン**：短期間有効（1時間）、HttpOnlyクッキーで保存
- **リフレッシュトークン**：長期間有効（7日間）、セキュアなストレージに保存
- **自動リフレッシュ**：アクセストークン期限切れ時に自動更新

### 5.4 ログアウトプロセス

```
1. ユーザーがログアウトをクリック
   ↓
2. フロントエンドのトークンをクリア
   ↓
3. バックエンドにログアウトリクエスト送信
   ↓
4. サーバーがリフレッシュトークンを無効化
   ↓
5. AuthContextの状態をリセット
   ↓
6. ログインページにリダイレクト
```

## 6. 実装詳細

### 6.1 フロントエンド実装

#### AuthContext.tsx
```typescript
import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/auth.service';

interface AuthContextType {
  isAuthenticated: boolean;
  user: IUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 初期ロード時に認証状態をチェック
    const initAuth = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);
      } catch (err) {
        // エラー処理
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // トークンリフレッシュのタイマー設定
  useEffect(() => {
    if (isAuthenticated) {
      const refreshInterval = setInterval(() => {
        refreshToken();
      }, 50 * 60 * 1000); // 50分ごとにリフレッシュ

      return () => clearInterval(refreshInterval);
    }
  }, [isAuthenticated]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      setUser(response.user);
      setIsAuthenticated(true);
      setError(null);
    } catch (err) {
      setError('ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const refreshToken = async () => {
    try {
      const response = await authService.refreshToken();
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (err) {
      // リフレッシュ失敗時はログアウト
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      loading, 
      error, 
      login, 
      logout, 
      refreshToken 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

#### ProtectedRoute.tsx
```typescript
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'employee' | 'manager' | 'admin';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole = 'employee' 
}) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    // ログイン後に元のページにリダイレクトするためにパスを保存
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ロールベースのアクセス制御
  if (requiredRole && user) {
    const roleHierarchy = { 'employee': 0, 'manager': 1, 'admin': 2 };
    const userRoleLevel = roleHierarchy[user.role];
    const requiredRoleLevel = roleHierarchy[requiredRole];

    if (userRoleLevel < requiredRoleLevel) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};
```

### 6.2 バックエンド実装

#### auth.routes.ts
```typescript
import express from 'express';
import { authController } from '../controllers/auth.controller';
import { validateRequest, authMiddleware } from '../middlewares';

const router = express.Router();

// 公開API - 認証不要
router.post('/login', validateRequest.login, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', validateRequest.email, authController.forgotPassword);
router.post('/reset-password', validateRequest.resetPassword, authController.resetPassword);

// 保護されたAPI - 認証必要
router.use(authMiddleware.authenticate);
router.post('/logout', authController.logout);
router.get('/me', authController.getCurrentUser);
router.patch('/me/password', validateRequest.changePassword, authController.changePassword);

// 管理者用API - 管理者権限必要
router.use(authMiddleware.requireRole('admin'));
router.post('/register', validateRequest.register, authController.register);
router.get('/users', authController.getUsers);
router.patch('/users/:userId', validateRequest.updateUser, authController.updateUser);
router.delete('/users/:userId', authController.deleteUser);

export default router;
```

#### auth.middleware.ts
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model';
import { CustomError } from '../utils/error';
import config from '../config/auth.config';

interface JwtPayload {
  id: string;
  role: string;
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // トークンの取得: Authorization: Bearer <token> の形式
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new CustomError('認証トークンがありません', 401);
    }

    const token = authHeader.split(' ')[1];
    
    // トークンの検証
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    
    // ユーザーの取得
    const user = await UserModel.findById(decoded.id).select('-password');
    if (!user || !user.isActive) {
      throw new CustomError('ユーザーが見つからないか無効です', 401);
    }
    
    // リクエストオブジェクトにユーザー情報を追加
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new CustomError('無効な認証トークンです', 401));
    }
    next(error);
  }
};

export const requireRole = (role: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new CustomError('認証されていません', 401));
    }

    const roles = Array.isArray(role) ? role : [role];
    
    // ロールヒエラルキーの定義
    const roleHierarchy: Record<string, number> = {
      'employee': 0,
      'manager': 1,
      'admin': 2
    };

    // ユーザーのロールが必要なロール以上の権限を持っているか確認
    const userRoleLevel = roleHierarchy[req.user.role];
    const hasRequiredRole = roles.some(r => userRoleLevel >= roleHierarchy[r]);

    if (!hasRequiredRole) {
      return next(new CustomError('この操作を行う権限がありません', 403));
    }
    
    next();
  };
};
```

#### auth.service.ts
```typescript
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { UserModel } from '../models/user.model';
import { TokenModel } from '../models/token.model';
import { CustomError } from '../utils/error';
import config from '../config/auth.config';

export class AuthService {
  async login(email: string, password: string) {
    // ユーザー検索
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new CustomError('メールアドレスまたはパスワードが正しくありません', 401);
    }

    // パスワード検証
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new CustomError('メールアドレスまたはパスワードが正しくありません', 401);
    }

    // 各種トークン生成
    const accessToken = this.generateAccessToken(user._id, user.role);
    const refreshToken = this.generateRefreshToken(user._id);

    // リフレッシュトークンをDBに保存
    await TokenModel.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + config.refreshTokenExpiration * 1000)
    });

    // 最終ログイン日時更新
    user.lastLoginAt = new Date();
    await user.save();

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        // その他必要なユーザー情報...
      },
      accessToken,
      refreshToken
    };
  }

  async refreshToken(token: string) {
    // リフレッシュトークンの検証
    const tokenDoc = await TokenModel.findOne({ token });
    if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
      throw new CustomError('無効なリフレッシュトークンです', 401);
    }

    try {
      // トークン内容の検証
      const decoded = jwt.verify(token, config.refreshTokenSecret) as { id: string };
      const userId = decoded.id;

      // ユーザー情報取得
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new CustomError('ユーザーが見つかりません', 401);
      }

      // 新しいアクセストークン生成
      const accessToken = this.generateAccessToken(user._id, user.role);

      return {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          // その他必要なユーザー情報...
        },
        accessToken
      };
    } catch (error) {
      throw new CustomError('トークンの検証に失敗しました', 401);
    }
  }

  async logout(userId: string, token: string) {
    // リフレッシュトークンを無効化
    await TokenModel.deleteOne({ userId, token });
    return { success: true };
  }

  async registerUser(userData: any) {
    // メールアドレスの重複チェック
    const existingUser = await UserModel.findOne({ email: userData.email });
    if (existingUser) {
      throw new CustomError('このメールアドレスは既に使用されています', 400);
    }

    // パスワードハッシュ化
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // ユーザー作成
    const user = await UserModel.create({
      ...userData,
      password: hashedPassword,
      isActive: true
    });

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };
  }

  // アクセストークン生成
  private generateAccessToken(userId: string, role: string) {
    return jwt.sign(
      { id: userId, role }, 
      config.jwtSecret, 
      { expiresIn: config.accessTokenExpiration }
    );
  }

  // リフレッシュトークン生成
  private generateRefreshToken(userId: string) {
    return jwt.sign(
      { id: userId }, 
      config.refreshTokenSecret, 
      { expiresIn: config.refreshTokenExpiration }
    );
  }
}

export const authService = new AuthService();
```

## 7. 認証状態の永続化

フロントエンドでの認証状態の永続化には、**ローカルストレージとHttpOnlyクッキーの組み合わせ**を採用します：

- **アクセストークン**：HttpOnlyクッキーに保存（XSS対策）
- **リフレッシュトークン**：HttpOnlyクッキーに保存（XSS対策）
- **ユーザー基本情報**：ローカルストレージに保存（UI表示用）

この方式により、セキュリティとユーザーエクスペリエンスのバランスを保ちます。

## 8. セキュリティ対策

### 8.1 主な脅威と対策

| 脅威 | 対策 |
|------|------|
| **クロスサイトスクリプティング（XSS）** | - HttpOnlyクッキーの使用<br>- ReactのJSX Escaping<br>- コンテンツセキュリティポリシー（CSP） |
| **クロスサイトリクエストフォージェリ（CSRF）** | - トークンベースの検証<br>- SameSite=Strict クッキー設定 |
| **パスワード侵害** | - bcryptによるハッシュ化<br>- 強力なパスワードポリシー強制<br>- アカウントロックアウト |
| **中間者攻撃** | - HTTPS/TLS必須<br>- HTTPSトランスポートのみのクッキー |
| **ブルートフォース攻撃** | - レート制限<br>- 進行的なアカウントロックアウト<br>- CAPTCHAの統合 |

### 8.2 追加セキュリティ機能

- **2要素認証**：管理者アカウントに実装検討（Phase 2）
- **ログイン監査**：不審なログインアクティビティの検出と通知
- **セッション管理**：アクティブセッションの表示と強制ログアウト機能
- **パスワードリセット**：安全なワンタイムリンクによるフロー

## 9. テスト戦略

認証システムの堅牢性を確保するために、以下のテストを実施します：

1. **単体テスト**：個々の認証機能の正確性テスト
2. **統合テスト**：認証フローのエンドツーエンドテスト
3. **セキュリティテスト**：脆弱性スキャンと侵入テスト
4. **ユーザビリティテスト**：認証UXの操作性と明瞭性テスト

## 10. 今後の拡張

### Phase 2での拡張予定

- **OAuth/SNS連携認証**：Google, LINEなどのソーシャルログイン
- **2要素認証（2FA）**：管理者アカウント向けの追加セキュリティ
- **アクセス履歴**：ユーザーごとのログイン履歴表示
- **デバイス管理**：ログイン済みデバイスの表示と管理

## 11. 注意点と課題

1. **美容師のユーザー体験**：技術に不慣れなユーザーも考慮した直感的なフロー設計
2. **モバイルアプリとの一貫性**：将来的なモバイルアプリ展開を見据えた設計
3. **オフライン利用**：ネットワーク接続が安定しない環境での動作考慮
4. **マルチテナント対応**：将来的な複数サロン対応の拡張性確保

## 12. 結論

このアーキテクチャ設計により、美容師向け陰陽五行AIケアコンパニオンは、安全でユーザーフレンドリーな認証体験を提供します。カスタム認証システムを採用することで、サロン特有のユーザー階層と権限モデルを正確に実装し、将来の拡張にも対応できる柔軟性を備えています。