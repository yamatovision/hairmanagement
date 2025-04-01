import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'tsyringe';
import { ITokenService } from '../../../application/services/token.service';

/**
 * 認証ミドルウェア
 * JWTトークンを検証し、リクエストにユーザー情報を追加する
 */
@injectable()
export class AuthMiddleware {
  /**
   * コンストラクタ
   * @param tokenService トークンサービス
   */
  constructor(
    @inject('ITokenService') private tokenService: ITokenService
  ) {}
  
  /**
   * Express用ミドルウェア関数
   * @param allowedRoles 許可するロールの配列（省略可）
   * @returns ミドルウェア関数
   */
  handle(allowedRoles?: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      console.log('[AuthMiddleware] リクエストパス:', req.path);
      console.log('[AuthMiddleware] リクエストメソッド:', req.method);
      console.log('[AuthMiddleware] リクエストヘッダー:', req.headers);
      
      // 認証ヘッダーの確認
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('[AuthMiddleware] 認証ヘッダーがありません:', authHeader);
        return res.status(401).json({
          message: '認証トークンが必要です',
          code: 'MISSING_TOKEN'
        });
      }
      
      // トークンの抽出
      const token = authHeader.split(' ')[1];
      console.log('[AuthMiddleware] 抽出されたトークン:', token.substring(0, 10) + '...');
      
      try {
        // トークンの検証
        console.log('[AuthMiddleware] トークン検証開始');
        const decodedToken = this.tokenService.verifyAccessToken(token);
        
        // リクエストオブジェクトにユーザー情報を追加
        req.user = {
          id: decodedToken.userId,
          role: decodedToken.role,
          ...decodedToken
        };
        console.log('[AuthMiddleware] ユーザー認証成功:', decodedToken.userId);
        console.log('[AuthMiddleware] req.user設定完了:', req.user);
        
        // ロールチェック（指定されている場合）
        if (allowedRoles && allowedRoles.length > 0) {
          const userRole = decodedToken.role || 'user';
          if (!allowedRoles.includes(userRole)) {
            console.log(`[AuthMiddleware] 権限不足: ${userRole} ロールには ${allowedRoles.join(', ')} が必要です`);
            return res.status(403).json({
              message: '操作に必要な権限がありません',
              code: 'INSUFFICIENT_PERMISSIONS'
            });
          }
          console.log(`[AuthMiddleware] ロール確認成功: ${userRole}`);
        }
        
        next();
      } catch (error: any) {
        console.error('[AuthMiddleware] トークン検証エラー:', error.message);
        return res.status(401).json({
          message: '無効なトークンです',
          code: 'INVALID_TOKEN',
          details: error.message
        });
      }
    };
  }
}