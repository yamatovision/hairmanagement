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
   * @returns ミドルウェア関数
   */
  handle() {
    return (req: Request, res: Response, next: NextFunction) => {
      // 認証ヘッダーの確認
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          message: '認証トークンが必要です',
          code: 'MISSING_TOKEN'
        });
      }
      
      // トークンの抽出
      const token = authHeader.split(' ')[1];
      
      try {
        // トークンの検証
        const decodedToken = this.tokenService.verifyAccessToken(token);
        
        // リクエストオブジェクトにユーザー情報を追加
        req.user = decodedToken;
        
        next();
      } catch (error: any) {
        return res.status(401).json({
          message: '無効なトークンです',
          code: 'INVALID_TOKEN',
          details: error.message
        });
      }
    };
  }
}