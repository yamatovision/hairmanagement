const jwt = require('jsonwebtoken');

// JWT秘密鍵
const JWT_SECRET = process.env.JWT_SECRET || 'aikaresumei2025';

/**
 * 認証ミドルウェア
 * リクエストヘッダーからJWTを取得・検証し、ユーザーIDをリクエストオブジェクトに追加
 */
module.exports = function(req, res, next) {
  // ヘッダーからトークンを取得
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // トークンがない場合
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: '認証トークンがありません。アクセスが拒否されました' 
    });
  }

  try {
    // トークンの検証
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // ユーザー情報をリクエストに追加
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(401).json({ 
      success: false, 
      message: 'トークンが無効です' 
    });
  }
};