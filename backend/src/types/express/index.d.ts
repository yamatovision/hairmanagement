import { TokenPayload } from '../../application/services/token.service';
import { Services } from '../../tests/setup';
import { Request as ExpressRequest } from 'express';

declare global {
  namespace Express {
    export interface Request {
      user: TokenPayload & {
        id: string;  // TokenPayload.userId のエイリアスとして id を追加
        role?: string;
      };
      services?: Services;
    }
    
    export interface Response {
      flush?: () => void;
    }
  }
}

// 認証済みリクエスト用の型定義
export interface AuthenticatedRequest extends ExpressRequest {
  user: TokenPayload & {
    id: string;
    role?: string;
  };
}