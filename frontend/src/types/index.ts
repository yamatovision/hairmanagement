/**
 * 型定義のエクスポート
 */
export * from './models';
export * from './constants';
export * from './paths';

// 追加の型定義
export type UserLoginRequest = {
  email: string;
  password: string;
};

export type UserLoginResponse = {
  user: Omit<import('./models').IUser, 'password'>;
  token: string;
  refreshToken: string;
};

export type UserRegistrationRequest = {
  email: string;
  password: string;
  name: string;
  birthDate?: string;
  birthHour?: number;
  birthLocation?: string;
  role?: 'employee' | 'manager' | 'admin' | 'custom';
  customRole?: string;
  subscriptionPlan?: 'standard' | 'premium';
};