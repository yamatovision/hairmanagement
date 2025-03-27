/**
 * シンプルな認証機能テスト - 管理者ユーザーの作成と取得
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// MongoDB接続
const connectDB = async () => {
  try {
    const dbUri = process.env.DB_URI || 'mongodb://localhost:27017/patrolmanagement';
    await mongoose.connect(dbUri);
    console.log('MongoDB接続成功！');
    return true;
  } catch (error) {
    console.error('MongoDB接続エラー:', error);
    return false;
  }
};

// JWT設定
const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

// ユーザースキーマ作成
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  birthDate: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['employee', 'manager', 'admin'],
    default: 'employee'
  },
  elementalType: {
    mainElement: {
      type: String,
      enum: ['木', '火', '土', '金', '水'],
      required: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true
});

// トークンスキーマ作成
const TokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['refresh', 'reset', 'verify'],
    default: 'refresh'
  },
  expiresAt: {
    type: Date,
    required: true
  },
  isRevoked: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true 
});

// パスワード検証メソッド
UserSchema.methods.verifyPassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password verification failed');
  }
};

async function runTest() {
  try {
    console.log('認証機能テスト開始...');

    // データベース接続
    await connectDB();

    // モデル登録
    const User = mongoose.model('User', UserSchema);
    const Token = mongoose.model('Token', TokenSchema);

    // 既存の管理者ユーザーを確認
    const existingAdmin = await User.findOne({ email: 'kazutofukushima1202@gmail.com' });
    
    if (existingAdmin) {
      console.log('既存の管理者ユーザーが見つかりました:');
      console.log(`ID: ${existingAdmin._id}`);
      console.log(`名前: ${existingAdmin.name}`);
      console.log(`メールアドレス: ${existingAdmin.email}`);
      console.log(`ロール: ${existingAdmin.role}`);
      
      // ログイン処理をシミュレーション
      console.log('\nログイン処理をシミュレーション中...');
      
      // JWTトークンを生成
      const accessToken = jwt.sign(
        { id: existingAdmin._id, role: existingAdmin.role },
        jwtSecret,
        { expiresIn: '1h' }
      );
      
      console.log('アクセストークンが生成されました');
      console.log(`トークン: ${accessToken.substring(0, 20)}...`);
      
      // トークンの検証
      try {
        const decoded = jwt.verify(accessToken, jwtSecret);
        console.log('\nトークン検証成功:');
        console.log(`ユーザーID: ${decoded.id}`);
        console.log(`ユーザーロール: ${decoded.role}`);
        console.log(`有効期限: ${new Date(decoded.exp * 1000)}`);
      } catch (error) {
        console.error('トークン検証失敗:', error);
      }
      
      // リフレッシュトークンを生成
      const refreshToken = jwt.sign(
        { id: existingAdmin._id },
        jwtSecret,
        { expiresIn: '7d' }
      );
      
      // リフレッシュトークンをDBに保存
      await Token.create({
        userId: existingAdmin._id,
        token: refreshToken,
        type: 'refresh',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7日
      });
      
      console.log('\nリフレッシュトークンがDBに保存されました');
      
      // DB内のリフレッシュトークンを確認
      const savedToken = await Token.findOne({ userId: existingAdmin._id }).sort({ createdAt: -1 });
      if (savedToken) {
        console.log(`トークンID: ${savedToken._id}`);
        console.log(`有効期限: ${savedToken.expiresAt}`);
      }
    } else {
      console.log('管理者ユーザーが見つかりません。作成します...');
      
      // パスワードハッシュ化
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('aikakumei', salt);
      
      // 新しい管理者ユーザーを作成
      const newAdmin = await User.create({
        email: 'kazutofukushima1202@gmail.com',
        password: hashedPassword,
        name: 'ふくちゃん',
        birthDate: '1990-01-01',
        role: 'admin',
        elementalType: {
          mainElement: '火'
        },
        isActive: true
      });
      
      console.log('管理者ユーザーが正常に作成されました:');
      console.log(`ID: ${newAdmin._id}`);
      console.log(`名前: ${newAdmin.name}`);
      console.log(`メールアドレス: ${newAdmin.email}`);
      console.log(`ロール: ${newAdmin.role}`);
    }
    
    console.log('\n認証機能テスト完了！');
  } catch (error) {
    console.error('テスト実行中にエラーが発生しました:', error);
  } finally {
    // MongoDB接続を閉じる
    await mongoose.disconnect();
    console.log('MongoDB接続を終了しました');
  }
}

// テスト実行
runTest();