/**
 * ログインプロセスで使用される不足しているユーザーを作成するスクリプト
 */
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

// MongoDB接続
const MONGODB_URI = 'mongodb://localhost:27017/hairmanagement';
console.log(`MongoDBに接続: ${MONGODB_URI}`);

// ログイン時に返されるユーザーID
const LOGIN_USER_ID = '67e487dbc4a58a62d38ac6ac';
const EMAIL = 'admin@example.com';
const PASSWORD = 'admin123';

// ユーザースキーマ定義
const userSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  email: String,
  password: String,
  name: String,
  role: String,
  sajuProfile: {}
});

async function createLoginUser() {
  try {
    // 四柱推命データ読み込み
    const filePath = path.join(__dirname, 'saju-data.json');
    if (!fs.existsSync(filePath)) {
      console.error(`エラー: 四柱推命データファイル ${filePath} が見つかりません`);
      return;
    }
    
    const sajuDataJson = fs.readFileSync(filePath, 'utf8');
    const sajuData = JSON.parse(sajuDataJson);
    
    console.log('四柱推命データ読み込み成功');
    
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB接続成功');

    const User = mongoose.model('User', userSchema);
    
    // 既存のadminユーザーを検索
    const existingAdmin = await User.findOne({ email: EMAIL });
    
    if (existingAdmin) {
      console.log(`既存のadminユーザーが見つかりました: ID=${existingAdmin._id}`);
      console.log(`このユーザーの四柱推命データを確認します`);
      
      if (existingAdmin._id.toString() === LOGIN_USER_ID) {
        console.log('IDは既にログインIDと一致しています。四柱推命データを更新します');
        
        existingAdmin.sajuProfile = sajuData.sajuProfile;
        await existingAdmin.save();
        
        console.log('四柱推命データを更新しました');
      } else {
        console.log(`ID不一致: 既存=${existingAdmin._id}, ログイン=${LOGIN_USER_ID}`);
        console.log('新しいIDでユーザーを作成します');
        
        // パスワードハッシュ化
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(PASSWORD, salt);
        
        // 新しいユーザー作成
        const newUser = new User({
          _id: new mongoose.Types.ObjectId(LOGIN_USER_ID),
          email: EMAIL,
          password: hashedPassword,
          name: existingAdmin.name || '管理者',
          role: 'admin',
          sajuProfile: sajuData.sajuProfile
        });
        
        try {
          await newUser.save();
          console.log(`新しいユーザーを作成しました: ID=${LOGIN_USER_ID}, Email=${EMAIL}`);
        } catch (e) {
          console.error('ユーザー作成エラー:', e.message);
          
          if (e.code === 11000) {
            console.log('一意制約エラー。代替方法を試みます...');
            
            // 古いユーザーの削除が必要かもしれませんが、リスクがあるため実際には実行しません
            console.log('安全のため、データベースの手動調整が必要です。以下の手順を実行してください:');
            console.log('1. MongoDBシェルを開く');
            console.log(`2. db.users.deleteOne({email: "${EMAIL}"}) を実行`);
            console.log('3. このスクリプトを再実行');
          }
        }
      }
    } else {
      console.log(`${EMAIL} ユーザーが見つかりません。新規作成します`);
      
      // パスワードハッシュ化
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(PASSWORD, salt);
      
      // 新しいユーザー作成
      const newUser = new User({
        _id: new mongoose.Types.ObjectId(LOGIN_USER_ID),
        email: EMAIL,
        password: hashedPassword,
        name: '管理者',
        role: 'admin',
        sajuProfile: sajuData.sajuProfile
      });
      
      await newUser.save();
      console.log(`新しいユーザーを作成しました: ID=${LOGIN_USER_ID}, Email=${EMAIL}`);
    }
    
    await mongoose.connection.close();
    console.log('\nMongoDB接続を閉じました');
    
  } catch (error) {
    console.error('エラー:', error);
    try {
      await mongoose.connection.close();
    } catch (e) {}
  }
}

createLoginUser();