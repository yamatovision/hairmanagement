/**
 * 既存ユーザーの四柱推命データをJSONとして抽出するシンプルなスクリプト
 */
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// MongoDB接続
const MONGODB_URI = 'mongodb://localhost:27017/hairmanagement';
console.log(`MongoDBに接続: ${MONGODB_URI}`);

// 実際のデータがあるユーザーID
const USER_ID = '67e52f32fb1b7bc2b73744ce';

// ユーザースキーマ定義（簡略化）
const userSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  email: String,
  sajuProfile: {}
});

async function extractSajuData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB接続成功');

    const User = mongoose.model('User', userSchema);
    
    // ユーザーデータ取得
    const user = await User.findById(USER_ID);
    
    if (!user) {
      console.error(`エラー: ID:${USER_ID} のユーザーが見つかりません`);
      return;
    }
    
    console.log(`ユーザー情報取得成功: ${user.email}`);
    
    // 四柱推命データを抽出
    const sajuData = {
      sajuProfile: user.sajuProfile || {}
    };
    
    // JSONファイルに保存
    const filePath = path.join(__dirname, 'saju-data.json');
    fs.writeFileSync(filePath, JSON.stringify(sajuData, null, 2));
    
    console.log(`四柱推命データをファイルに保存しました: ${filePath}`);
    console.log('データ内容:');
    
    // データの概要を表示
    const sajuProfile = sajuData.sajuProfile;
    if (sajuProfile) {
      if (sajuProfile.mainElement) console.log(`- 主要五行: ${sajuProfile.mainElement}`);
      if (sajuProfile.yinYang) console.log(`- 陰陽: ${sajuProfile.yinYang}`);
      
      if (sajuProfile.fourPillars) {
        console.log('- 四柱: ');
        const fp = sajuProfile.fourPillars;
        if (fp.yearPillar) console.log(`  * 年柱: ${fp.yearPillar.fullStemBranch || `${fp.yearPillar.stem}${fp.yearPillar.branch}`}`);
        if (fp.monthPillar) console.log(`  * 月柱: ${fp.monthPillar.fullStemBranch || `${fp.monthPillar.stem}${fp.monthPillar.branch}`}`);
        if (fp.dayPillar) console.log(`  * 日柱: ${fp.dayPillar.fullStemBranch || `${fp.dayPillar.stem}${fp.dayPillar.branch}`}`);
        if (fp.hourPillar) console.log(`  * 時柱: ${fp.hourPillar.fullStemBranch || `${fp.hourPillar.stem}${fp.hourPillar.branch}`}`);
      }
      
      if (sajuProfile.tenGods) console.log(`- 十神関係: ${JSON.stringify(sajuProfile.tenGods)}`);
      if (sajuProfile.branchTenGods) console.log(`- 地支十神関係: ${JSON.stringify(sajuProfile.branchTenGods)}`);
    } else {
      console.log('四柱推命データがありません');
    }
    
    await mongoose.connection.close();
    console.log('\nMongoDB接続を閉じました');
    
    return sajuData;
  } catch (error) {
    console.error('エラー:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

extractSajuData();