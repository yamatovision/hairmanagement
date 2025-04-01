/**
 * エラーハンドリングとデバッグのためのユーティリティ
 */

// リクエストログミドルウェア - 詳細なリクエスト情報を出力
function requestLogger(req, res, next) {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl || req.url;
  const headers = JSON.stringify(req.headers);
  const ip = req.ip || req.connection.remoteAddress;
  
  console.log(`[${timestamp}] リクエスト: ${method} ${url} - クライアントIP: ${ip}`);
  console.log(`ヘッダー: ${headers}`);
  
  // リクエストボディのログ (セキュリティ上の情報は除外する)
  if (req.body && Object.keys(req.body).length > 0) {
    const safeBody = { ...req.body };
    // パスワードなどの機密情報を隠す
    if (safeBody.password) safeBody.password = '*****';
    if (safeBody.currentPassword) safeBody.currentPassword = '*****';
    if (safeBody.newPassword) safeBody.newPassword = '*****';
    
    console.log(`ボディ: ${JSON.stringify(safeBody)}`);
  }
  
  // レスポンスログも記録
  const originalSend = res.send;
  res.send = function(body) {
    const resTimestamp = new Date().toISOString();
    console.log(`[${resTimestamp}] レスポンス: ${res.statusCode} ${method} ${url}`);
    
    // ボディサイズが大きいときは省略
    if (body && typeof body === 'string' && body.length < 1000) {
      try {
        const json = JSON.parse(body);
        console.log(`レスポンスボディ: ${JSON.stringify(json, null, 2)}`);
      } catch (e) {
        console.log(`レスポンスボディ: ${body.substring(0, 100)}...`);
      }
    } else {
      console.log('レスポンスボディ: (省略)');
    }
    
    originalSend.apply(res, arguments);
  };
  
  next();
}

// クライアントIPアドレスを取得する関数
function getClientIp(req) {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null);
}

// ネットワーク情報を取得する関数
function getNetworkInfo() {
  try {
    const os = require('os');
    const networkInterfaces = os.networkInterfaces();
    return JSON.stringify(networkInterfaces, null, 2);
  } catch (err) {
    return `ネットワーク情報の取得に失敗: ${err.message}`;
  }
}

// エラーハンドリングミドルウェア - 詳細なエラー情報を出力
function errorHandler(err, req, res, next) {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] エラー発生:`);
  console.error(`- メッセージ: ${err.message}`);
  console.error(`- URL: ${req.originalUrl || req.url}`);
  console.error(`- メソッド: ${req.method}`);
  console.error(`- クライアントIP: ${getClientIp(req)}`);
  
  if (err.stack) {
    console.error(`- スタックトレース:\n${err.stack}`);
  }
  
  // 元のミドルウェアに処理を渡す
  next(err);
}

module.exports = {
  requestLogger,
  errorHandler,
  getNetworkInfo
};