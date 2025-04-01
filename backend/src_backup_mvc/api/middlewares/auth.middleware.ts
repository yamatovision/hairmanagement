import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import UserModel from '../../models/user.model';
import { CustomError } from '../../utils/error.util';
import config from '../../config/auth.config';

// Testing flag for test environment
const isTestEnvironment = process.env.NODE_ENV === 'test';

// JWT関連の型定義
interface JwtPayload {
  id: string;
  role?: string;
  iat?: number;
  exp?: number;
}

/**
 * 認証関連のミドルウェア
 */
export const authMiddleware = {
  /**
   * JWT認証ミドルウェア
   * リクエストヘッダーまたはクッキーからトークンを取得し、ユーザーを認証する
   */
  authenticate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // デバッグモードのチェック - 開発環境でのテスト用
      if (req.headers['x-debug-mode'] === 'true' && process.env.NODE_ENV === 'development') {
        console.log('デバッグモードのため認証をスキップします');
        
        // デバッグ用のモックユーザー
        if (!req.user) {
          req.user = {
            _id: 'debug-user-id',
            id: 'debug-user-id',
            email: 'admin@example.com',
            name: 'デバッグユーザー',
            role: 'admin',
            birthDate: '1985-01-01', // デバッグ用の生年月日を追加
            elementalType: {
              mainElement: '火',
              secondaryElement: '木',
              yinYang: '陽'
            }
          }
        }
        return next();
      }
      
      // テスト環境対応 - NODE_ENV=testまたはテストモードヘッダーがある場合は認証をスキップ
      const isTestEnv = process.env.NODE_ENV === 'test';
      const hasTestHeader = req.headers['x-test-mode'] === 'true';
      // ログを削除
      
      if (isTestEnv || hasTestHeader) {
        console.log('テスト環境のため認証をスキップします');
        
        // テスト用のモックユーザー
        if (!req.user) {
          req.user = {
            _id: 'test-user-id',
            id: 'test-user-id',
            email: 'test@example.com',
            name: 'テストユーザー',
            role: 'admin',
            birthDate: '1990-01-01', // テスト用の生年月日を追加
            elementalType: {
              mainElement: '水',
              secondaryElement: '木',
              yinYang: '陽'
            }
          }
        }
        return next();
      }
      
      // トークンの取得（AuthorizationヘッダーまたはCookie）
      let token: string | undefined;
      
      // Authorizationヘッダーからの取得
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
      
      // クッキーからの取得
      if (!token && req.cookies && req.cookies.accessToken) {
        token = req.cookies.accessToken;
      }
      
      if (!token) {
        throw new CustomError('認証トークンがありません', 401);
      }
      
      // トークンの検証
      const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
      
      // ユーザーの取得
      const user = await UserModel.findById(decoded.id);
      if (!user || !user.isActive) {
        throw new CustomError('ユーザーが見つからないか無効です', 401);
      }
      
      // リクエストオブジェクトにユーザー情報を追加
      req.user = {
        _id: String(user._id),
        id: String(user._id), // idも追加して互換性を持たせる
        email: user.email,
        name: user.name,
        role: user.role,
        birthDate: user.birthDate, // 運勢計算用に生年月日を追加
        elementalType: user.elementalType // 陰陽五行属性も追加
      };
      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        if (error instanceof jwt.TokenExpiredError) {
          return next(new CustomError('認証トークンの有効期限が切れています', 401));
        }
        return next(new CustomError('無効な認証トークンです', 401));
      }
      next(error);
    }
  },

  /**
   * ロールベースアクセス制御ミドルウェア
   * 指定されたロール以上の権限を持つユーザーのみアクセスを許可する
   * @param role 必要なロール（単一または配列）
   */
  requireRole: (role: string | string[]) => {
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
  }
};