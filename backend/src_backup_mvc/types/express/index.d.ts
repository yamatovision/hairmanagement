import { TokenPayload } from '../../application/services/token.service';
import { Services } from '../../tests/setup';

declare global {
  namespace Express {
    export interface Request {
      user?: TokenPayload;
      services?: Services;
    }
  }
}