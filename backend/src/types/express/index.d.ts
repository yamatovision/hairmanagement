import { TokenPayload } from '../../application/services/token.service';
import { Services } from '../../tests/setup';

declare global {
  namespace Express {
    export interface Request {
      user?: TokenPayload & {
        id: string;  // TokenPayload.userId のエイリアスとして id を追加
        role?: string;
      };
      services?: Services;
    }
  }
}