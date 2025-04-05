/**
 * JSONファイルから読み込んだ四柱推命データをログインユーザーに適用するスクリプト
 */
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// MongoDB接続
const MONGODB_URI = 'mongodb://localhost:27017/hairmanagement';
console.log(`MongoDBに接続: ${MONGODB_URI}`);

// ログイン時に返されるユーザーID
const LOGIN_USER_ID = '67e487dbc4a58a62d38ac6ac';

// ユーザースキーマ定義（簡略化）
const userSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  email: String,
  name: String,
  sajuProfile: {
    fourPillars: {
      yearPillar: {
        stem: String,
        branch: String,
        fullStemBranch: String,
        hiddenStems: [String]
      },
      monthPillar: {
        stem: String,
        branch: String,
        fullStemBranch: String,
        hiddenStems: [String]
      },
      dayPillar: {
        stem: String,
        branch: String,
        fullStemBranch: String,
        hiddenStems: [String]
      },
      hourPillar: {
        stem: String,
        branch: String,
        fullStemBranch: String,
        hiddenStems: [String]
      }
    },
    mainElement: String,
    secondaryElement: String,
    yinYang: String,
    tenGods: {},
    branchTenGods: {}
  }
});

async function applySajuData() {
  try {
    // JSONデータ読み込み
    const filePath = path.join(__dirname, 'saju-data.json');
    if (!fs.existsSync(filePath)) {
      console.error(`エラー: 四柱推命データファイル ${filePath} が見つかりません`);
      process.exit(1);
    }
    
    const sajuDataJson = fs.readFileSync(filePath, 'utf8');
    const sajuData = JSON.parse(sajuDataJson);
    
    console.log('四柱推命データ読み込み成功');
    if (sajuData.sajuProfile.mainElement) {
      console.log(`- 主要五行: ${sajuData.sajuProfile.mainElement}`);
    }
    
    // MongoDB接続
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB接続成功');

    const User = mongoose.model('User', userSchema);
    
    // ユーザー情報取得
    const loginUser = await User.findById(LOGIN_USER_ID);
    
    if (!loginUser) {
      console.error(`エラー: ログインID ${LOGIN_USER_ID} のユーザーが見つかりません`);
      
      // ユーザーが存在しない場合、メールアドレスでユーザーを検索
      const userByEmail = await User.findOne({ email: 'admin@example.com' });
      if (userByEmail) {
        console.log(`注: 'admin@example.com' ユーザーは存在しますが、IDが ${userByEmail._id} です`);
      }
      return;
    }
    
    console.log(`ユーザー情報取得成功: ${loginUser.email} (${loginUser.name})`);
    
    // 四柱推命データを更新
    loginUser.sajuProfile = sajuData.sajuProfile;
    await loginUser.save();
    
    console.log(`ユーザー ${loginUser.email} (${LOGIN_USER_ID}) の四柱推命データを更新しました`);
    
    // 更新結果を確認
    const updatedUser = await User.findById(LOGIN_USER_ID);
    
    if (updatedUser && updatedUser.sajuProfile) {
      console.log('\n更新後の四柱推命データ:');
      const sp = updatedUser.sajuProfile;
      if (sp.mainElement) console.log(`- 主要五行: ${sp.mainElement}`);
      if (sp.yinYang) console.log(`- 陰陽: ${sp.yinYang}`);
      
      if (sp.tenGods) console.log(`- 十神関係: ${JSON.stringify(sp.tenGods)}`);
      if (sp.branchTenGods) console.log(`- 地支十神関係: ${JSON.stringify(sp.branchTenGods)}`);
    }
    
    await mongoose.connection.close();
    console.log('\nMongoDB接続を閉じました');
    
  } catch (error) {
    console.error('エラー:', error);
    try {
      await mongoose.connection.close();
    } catch (e) {}
    process.exit(1);
  }
}

applySajuData();