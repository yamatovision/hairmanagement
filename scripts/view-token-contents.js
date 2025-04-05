const jwt = require('jsonwebtoken');

// コマンドライン引数からトークンを取得
const token = process.argv[2];

if (!token) {
  console.log('使用方法: node view-token-contents.js <JWT_TOKEN>');
  process.exit(1);
}

try {
  // トークンをデコード（検証なし）
  const decoded = jwt.decode(token, { complete: true });
  
  if (!decoded) {
    console.log('無効なトークン形式です');
    process.exit(1);
  }
  
  console.log('==== トークンヘッダー ====');
  console.log(JSON.stringify(decoded.header, null, 2));
  
  console.log('\n==== トークンペイロード ====');
  console.log(JSON.stringify(decoded.payload, null, 2));
  
  if (decoded.payload.userId) {
    console.log('\nユーザーID:', decoded.payload.userId);
  }
  
  if (decoded.payload.exp) {
    const expDate = new Date(decoded.payload.exp * 1000);
    console.log('\n有効期限:', expDate.toISOString());
  }
} catch (error) {
  console.error('トークン解析エラー:', error.message);
}