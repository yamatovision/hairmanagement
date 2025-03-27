/**
 * 認証・認可関連のモック
 */

// テストユーザー
const testUser = {
  id: '1',
  name: 'テストユーザー',
  email: 'test@example.com',
  role: 'manager',
};

// 認証ミドルウェアのモック
const mockAuthenticate = (req, res, next) => {
  req.user = testUser;
  next();
};

// 認可ミドルウェアのモック
const mockAuthorize = (req, res, next) => {
  // req.userが存在し、roleが'manager'または'admin'であれば次へ
  if (req.user && ['manager', 'admin'].includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({ message: 'アクセス権限がありません' });
  }
};

module.exports = {
  testUser,
  mockAuthenticate,
  mockAuthorize,
};