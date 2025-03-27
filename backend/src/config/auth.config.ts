/**
 * 認証関連の設定
 * 各種トークンのシークレットキーと有効期限を環境変数から取得
 */

interface AuthConfig {
  jwtSecret: string;
  refreshTokenSecret: string;
  resetTokenSecret: string;
  verificationTokenSecret: string;
  accessTokenExpiration: string;
  refreshTokenExpiration: number;
  resetTokenExpiration: string;
  verificationTokenExpiration: string;
  passwordSaltRounds: number;
  cookieSecret: string;
  sessionSecret: string;
}

const config: AuthConfig = {
  // 各種トークンのシークレットキー
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET || 'your_refresh_token_secret_here',
  resetTokenSecret: process.env.RESET_TOKEN_SECRET || process.env.JWT_SECRET || 'your_reset_token_secret_here',
  verificationTokenSecret: process.env.VERIFICATION_TOKEN_SECRET || process.env.JWT_SECRET || 'your_verification_token_secret_here',
  
  // トークンの有効期限
  accessTokenExpiration: process.env.JWT_ACCESS_EXPIRATION || '1h',
  refreshTokenExpiration: parseInt(process.env.JWT_REFRESH_EXPIRATION_SECONDS || '604800', 10), // デフォルト: 7日間（秒単位）
  resetTokenExpiration: process.env.RESET_TOKEN_EXPIRATION || '1h',
  verificationTokenExpiration: process.env.VERIFICATION_TOKEN_EXPIRATION || '24h',
  
  // パスワードハッシュ化用のソルトラウンド
  passwordSaltRounds: parseInt(process.env.PASSWORD_SALT_ROUNDS || '10', 10),
  
  // クッキーとセッション用のシークレット
  cookieSecret: process.env.COOKIE_SECRET || 'your_cookie_secret_here',
  sessionSecret: process.env.SESSION_SECRET || 'your_session_secret_here',
};

// JWT_REFRESH_EXPIRATION が時間文字列 (例: '7d') の場合は秒数に変換
if (process.env.JWT_REFRESH_EXPIRATION && typeof process.env.JWT_REFRESH_EXPIRATION === 'string' && 
    process.env.JWT_REFRESH_EXPIRATION.match(/^\d+[smhd]$/)) {
  const value = process.env.JWT_REFRESH_EXPIRATION;
  const num = parseInt(value.slice(0, -1), 10);
  const unit = value.slice(-1);
  
  let seconds = num;
  switch (unit) {
    case 'm': seconds = num * 60; break;            // 分
    case 'h': seconds = num * 60 * 60; break;       // 時間
    case 'd': seconds = num * 24 * 60 * 60; break;  // 日
  }
  
  config.refreshTokenExpiration = seconds;
}

export default config;