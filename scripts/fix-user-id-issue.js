/**
 * ユーザーIDの不一致問題を修正するスクリプト
 * 
 * 問題：
 * - admin@example.comとしてログインすると、ID 67e487dbc4a58a62d38ac6ac が返される
 * - しかし、このIDのユーザーはMongoDBに存在しない
 * - 実際のadmin@example.comユーザーのIDは 67e52f32fb1b7bc2b73744ce
 * 
 * 解決策：
 * 1. ログイン時に使われるIDを特定
 * 2. そのIDのユーザーを作成または修正し、四柱推命データを移行
 */
const mongoose = require('mongoose');

// MongoDB接続
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hairmanagement';
console.log(`MongoDBに接続: ${MONGODB_URI}`);

// 問題のあるID
const LOGIN_ID = '67e487dbc4a58a62d38ac6ac'; // ログインで返されるID
const ACTUAL_ID = '67e52f32fb1b7bc2b73744ce'; // 実際のデータがあるID
const EMAIL = 'admin@example.com';

// ユーザースキーマ定義（完全なスキーマ定義）
const userSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  email: String,
  password: String,
  name: String,
  role: String,
  lastLoginAt: Date,
  personalGoal: String,
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
    branchTenGods: {},
  }
});

async function fixUserIdIssue() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB接続成功');

    const User = mongoose.model('User', userSchema);
    
    // 実際のユーザーデータを取得
    console.log(`ID:${ACTUAL_ID} のユーザー情報を取得中...`);
    const actualUser = await User.findById(ACTUAL_ID);
    
    if (!actualUser) {
      console.error(`エラー: ID:${ACTUAL_ID} のユーザーが見つかりません`);
      return;
    }
    
    console.log(`ユーザー情報取得成功: ${actualUser.email}`);
    
    // 別の方法: 既存ユーザーのIDを変更する
    console.log(`実際のユーザーIDを ${ACTUAL_ID} から ${LOGIN_ID} に更新します...`);
    
    try {
      // IDを変更するために、古いドキュメントを削除して新しいドキュメントを作成
      const userData = actualUser.toObject();
      delete userData._id; // 古いIDを削除
      
      // 新しいIDでドキュメントを作成
      const newUser = new User({
        _id: new mongoose.Types.ObjectId(LOGIN_ID),
        ...userData
      });
      
      // 新しいドキュメントを保存
      await newUser.save();
      console.log(`新しいID ${LOGIN_ID} でユーザーを作成しました`);
      
      // 古いドキュメントを削除
      await User.deleteOne({ _id: ACTUAL_ID });
      console.log(`古いID ${ACTUAL_ID} のユーザーを削除しました`);
    } catch (error) {
      console.error('ID更新中にエラーが発生しました:', error);
      console.log('代替方法を試みます...');
      
      // 代替方法: 既存ユーザーのsajuProfileを更新するJSONファイルを作成
      const fs = require('fs');
      const sajuProfileData = JSON.stringify(actualUser.sajuProfile || {}, null, 2);
      fs.writeFileSync('saju-profile-data.json', sajuProfileData);
      console.log('四柱推命データをsaju-profile-data.jsonに保存しました');
      console.log('このデータを別のユーザーに適用するには手動での更新が必要です');
    }
    
    console.log('ユーザーID修正処理が完了しました');
    
    // 確認のため両方のIDでユーザーを取得
    const updatedLoginUser = await User.findById(LOGIN_ID);
    const updatedActualUser = await User.findById(ACTUAL_ID);
    
    console.log('\n=== 更新後のユーザー情報 ===');
    console.log(`ログインID (${LOGIN_ID}): ${updatedLoginUser ? updatedLoginUser.email : '存在しません'}`);
    console.log(`実際のID (${ACTUAL_ID}): ${updatedActualUser ? updatedActualUser.email : '存在しません'}`);
    
    if (updatedLoginUser && updatedLoginUser.sajuProfile) {
      console.log('\nログインIDのユーザーの四柱推命データ:');
      console.log(`- 主要五行: ${updatedLoginUser.sajuProfile.mainElement}`);
      console.log(`- 陰陽: ${updatedLoginUser.sajuProfile.yinYang}`);
      console.log(`- 十神関係: ${JSON.stringify(updatedLoginUser.sajuProfile.tenGods)}`);
      console.log(`- 地支十神関係: ${JSON.stringify(updatedLoginUser.sajuProfile.branchTenGods)}`);
    }
    
    await mongoose.connection.close();
    console.log('\nMongoDB接続を閉じました');
    
  } catch (error) {
    console.error('エラー:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

fixUserIdIssue();