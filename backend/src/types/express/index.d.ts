import { Services } from '../../tests/setup';

declare global {
  namespace Express {
    export interface Request {
      user?: {
        _id: string;
        email: string;
        name: string;
        role: string;
        [key: string]: any;
      };
      services?: Services;
    }
  }
}