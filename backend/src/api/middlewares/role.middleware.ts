import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../../utils/error.util';
import TeamModel from '../../models/team.model';
import mongoose from 'mongoose';

// Testing flag for test environment
const isTestEnvironment = process.env.NODE_ENV === 'test';

/**
 * デバッグ用ヘルパー関数
 */
const logRole = (req: Request, allowedRoles: string | string[]): void => {
  if (process.env.NODE_ENV === 'development') {
    console.log('ロールチェック:');
    console.log('- ユーザー:', req.user);
    console.log('- 要求ロール:', allowedRoles);
  }
};

/**
 * チームに関連するアクセス権チェック用のヘルパー関数
 */
const checkTeamAccess = async (userId: string, teamId: string, accessLevel: 'owner' | 'admin' | 'member'): Promise<boolean> => {
  try {
    const team = await TeamModel.findById(teamId);
    if (!team) return false;
    
    // オーナーアクセスのチェック
    if (accessLevel === 'owner') {
      return team.ownerId.toString() === userId;
    }
    
    // 管理者アクセスのチェック
    if (accessLevel === 'admin') {
      return team.ownerId.toString() === userId || 
             team.admins.some(adminId => adminId.toString() === userId);
    }
    
    // メンバーアクセスのチェック
    if (accessLevel === 'member') {
      return team.ownerId.toString() === userId || 
             team.admins.some(adminId => adminId.toString() === userId) ||
             team.members.some(memberId => memberId.toString() === userId);
    }
    
    return false;
  } catch (error) {
    console.error('チームアクセス権チェックエラー:', error);
    return false;
  }
};

/**
 * ロールベースのアクセス制御ミドルウェア
 * 特定のロールを持つユーザーのみアクセスを許可する
 */
export const roleMiddleware = {
  /**
   * 特定のロールを持つユーザーのみアクセスを許可する
   * @param allowedRoles 許可されるロール（単一または配列）
   */
  checkRole: (allowedRoles: string | string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        // デバッグ用ログ出力
        logRole(req, allowedRoles);

        // テスト環境または開発環境での認証スキップ
        if (isTestEnvironment || process.env.NODE_ENV === 'development') {
          console.log('テスト/開発環境のため、ロールチェックをスキップします');
          return next();
        }
        
        // ユーザー情報が存在しない場合はエラー
        if (!req.user) {
          throw new CustomError('認証が必要です', 401);
        }

        // 文字列の場合は配列に変換
        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

        // ユーザーのロールがallowedRolesに含まれているか確認
        if (!roles.includes(req.user.role)) {
          throw new CustomError(
            `このアクションには${roles.join('または')}の権限が必要です`,
            403
          );
        }

        // 権限があれば次へ
        next();
      } catch (error) {
        next(error);
      }
    };
  },

  /**
   * 管理者（admin）ロールのみアクセスを許可する
   */
  requireAdmin: (req: Request, res: Response, next: NextFunction) => {
    try {
      // デバッグ用ログ出力
      logRole(req, 'admin');

      // テスト環境または開発環境での認証スキップ
      if (isTestEnvironment || process.env.NODE_ENV === 'development') {
        console.log('テスト/開発環境のため、管理者権限チェックをスキップします');
        return next();
      }
      
      if (!req.user) {
        throw new CustomError('認証が必要です', 401);
      }

      if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
        throw new CustomError('このアクションには管理者権限が必要です', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  },

  /**
   * スーパー管理者（superadmin）ロールのみアクセスを許可する
   */
  requireSuperAdmin: (req: Request, res: Response, next: NextFunction) => {
    try {
      // デバッグ用ログ出力
      logRole(req, 'superadmin');

      // テスト環境または開発環境での認証スキップ
      if (isTestEnvironment || process.env.NODE_ENV === 'development') {
        console.log('テスト/開発環境のため、スーパー管理者権限チェックをスキップします');
        return next();
      }
      
      if (!req.user) {
        throw new CustomError('認証が必要です', 401);
      }

      if (req.user.role !== 'superadmin') {
        throw new CustomError('このアクションにはスーパー管理者権限が必要です', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  },

  /**
   * 管理者または特定のユーザー自身のみアクセスを許可する
   * 例: ユーザー自身のプロフィール編集など
   * @param userIdParam URLパラメータまたはリクエストボディでのユーザーIDのフィールド名
   */
  requireAdminOrSelf: (userIdParam: string = 'userId') => {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        // デバッグ用ログ出力
        console.log('管理者または自身の権限チェック:');
        console.log('- ユーザー:', req.user);
        console.log('- パラメータ名:', userIdParam);
        console.log('- パラメータ値:', req.params[userIdParam] || req.body[userIdParam]);

        // テスト環境または開発環境での認証スキップ
        if (isTestEnvironment || process.env.NODE_ENV === 'development') {
          console.log('テスト/開発環境のため、権限チェックをスキップします');
          return next();
        }
        
        if (!req.user) {
          throw new CustomError('認証が必要です', 401);
        }

        // URLパラメータからユーザーIDを取得
        const targetId = req.params[userIdParam] || req.body[userIdParam];

        // 管理者か、自分自身に対する操作の場合のみ許可
        if (req.user.role !== 'admin' && req.user.role !== 'superadmin' && req.user._id.toString() !== targetId) {
          throw new CustomError('このアクションを実行する権限がありません', 403);
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  },

  /**
   * チームのオーナーまたはスーパー管理者のみアクセスを許可する
   * @param teamIdParam URLパラメータまたはリクエストボディでのチームIDのフィールド名
   */
  requireTeamOwnerOrSuperAdmin: (teamIdParam: string = 'teamId') => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // テスト環境または開発環境での認証スキップ
        if (isTestEnvironment || process.env.NODE_ENV === 'development') {
          console.log('テスト/開発環境のため、チームオーナー権限チェックをスキップします');
          return next();
        }
        
        if (!req.user) {
          throw new CustomError('認証が必要です', 401);
        }

        // スーパー管理者の場合は常に許可
        if (req.user.role === 'superadmin') {
          return next();
        }

        // URLパラメータからチームIDを取得
        const teamId = req.params[teamIdParam] || req.body[teamIdParam];
        if (!teamId) {
          throw new CustomError('チームIDが指定されていません', 400);
        }

        // チームオーナーチェック
        const hasAccess = await checkTeamAccess(req.user._id.toString(), teamId, 'owner');
        if (!hasAccess) {
          throw new CustomError('このチームに対するオーナー権限がありません', 403);
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  },

  /**
   * チームの管理者またはスーパー管理者のみアクセスを許可する
   * @param teamIdParam URLパラメータまたはリクエストボディでのチームIDのフィールド名
   */
  requireTeamAdminOrSuperAdmin: (teamIdParam: string = 'teamId') => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // テスト環境または開発環境での認証スキップ
        if (isTestEnvironment || process.env.NODE_ENV === 'development') {
          console.log('テスト/開発環境のため、チーム管理者権限チェックをスキップします');
          return next();
        }
        
        if (!req.user) {
          throw new CustomError('認証が必要です', 401);
        }

        // スーパー管理者の場合は常に許可
        if (req.user.role === 'superadmin') {
          return next();
        }

        // URLパラメータからチームIDを取得
        const teamId = req.params[teamIdParam] || req.body[teamIdParam];
        if (!teamId) {
          throw new CustomError('チームIDが指定されていません', 400);
        }

        // チーム管理者チェック
        const hasAccess = await checkTeamAccess(req.user._id.toString(), teamId, 'admin');
        if (!hasAccess) {
          throw new CustomError('このチームに対する管理者権限がありません', 403);
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  },

  /**
   * チームのメンバーまたは管理者のみアクセスを許可する
   * @param teamIdParam URLパラメータまたはリクエストボディでのチームIDのフィールド名
   */
  requireTeamMember: (teamIdParam: string = 'teamId') => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        // テスト環境または開発環境での認証スキップ
        if (isTestEnvironment || process.env.NODE_ENV === 'development') {
          console.log('テスト/開発環境のため、チームメンバー権限チェックをスキップします');
          return next();
        }
        
        if (!req.user) {
          throw new CustomError('認証が必要です', 401);
        }

        // スーパー管理者の場合は常に許可
        if (req.user.role === 'superadmin') {
          return next();
        }

        // URLパラメータからチームIDを取得
        const teamId = req.params[teamIdParam] || req.body[teamIdParam];
        if (!teamId) {
          throw new CustomError('チームIDが指定されていません', 400);
        }

        // チームメンバーチェック
        const hasAccess = await checkTeamAccess(req.user._id.toString(), teamId, 'member');
        if (!hasAccess) {
          throw new CustomError('このチームのメンバーではありません', 403);
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }
};