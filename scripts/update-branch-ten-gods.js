/**
 * branchTenGods フィールドを既存のユーザーに追加するマイグレーションスクリプト
 */
const mongoose = require('mongoose');
require('dotenv').config(); // 環境変数を読み込む

// MongoDB接続
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/patrolmanagement';
console.log(`MongoDBに接続: ${MONGODB_URI}`);

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB接続成功'))
  .catch(err => {
    console.error('MongoDB接続失敗:', err);
    process.exit(1);
  });

// ユーザースキーマ定義
const userSchema = new mongoose.Schema({
  email: String,
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
    branchTenGods: {} // 追加されたフィールド
  }
});

// モデル定義
const User = mongoose.model('User', userSchema);

// branchTenGods フィールドを追加する関数
async function updateBranchTenGodsField() {
  try {
    // sajuProfile を持つユーザーを検索
    const users = await User.find({
      'sajuProfile.fourPillars': { $exists: true }
    });
    
    console.log(`${users.length} 人のユーザーが sajuProfile を持っています`);
    
    let updateCount = 0;
    
    for (const user of users) {
      // branchTenGods フィールドがない場合は追加
      if (!user.sajuProfile.branchTenGods || Object.keys(user.sajuProfile.branchTenGods).length === 0) {
        // 基本的な地支十神関係を設定
        const branchTenGods = {
          '年柱地支': '印綬',    // 例として固定値を設定
          '月柱地支': '食神',
          '日柱地支': '日主',
          '時柱地支': '偏官'
        };
        
        // branchTenGods フィールドを更新
        user.sajuProfile.branchTenGods = branchTenGods;
        await user.save();
        
        updateCount++;
        console.log(`ユーザー ${user.email} の branchTenGods フィールドを更新しました`);
      }
    }
    
    console.log(`${updateCount} 人のユーザーの branchTenGods フィールドを更新しました`);
    
    // データベース接続を閉じる
    await mongoose.connection.close();
    console.log('MongoDB接続を閉じました');
    
  } catch (error) {
    console.error('エラー:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// 実行
updateBranchTenGodsField();