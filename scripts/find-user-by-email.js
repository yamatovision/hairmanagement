/**
 * ユーザーメールアドレスからユーザー情報を取得し、ID情報を確認するスクリプト
 * 
 * 使用方法: node find-user-by-email.js admin@example.com
 */

require('dotenv').config();
const mongoose = require('mongoose');

// MongoDBに接続
async function connectToDatabase() {
  try {
    const mongUri = process.env.MONGODB_URI;
    if (!mongUri) {
      throw new Error('環境変数 MONGODB_URI が設定されていません');
    }
    
    console.log(`MongoDB URI: ${mongUri}`);
    await mongoose.connect(mongUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDBに接続しました');
  } catch (error) {
    console.error('データベース接続エラー:', error);
    process.exit(1);
  }
}

// Userモデル（スキーマ定義）
const userSchema = new mongoose.Schema({
  email: String,
  name: String,
  password: String,
  role: String,
  sajuProfile: {
    fourPillars: {
      yearPillar: {
        stem: String,
        branch: String,
        fullStemBranch: String
      },
      monthPillar: {
        stem: String,
        branch: String,
        fullStemBranch: String
      },
      dayPillar: {
        stem: String,
        branch: String,
        fullStemBranch: String
      },
      hourPillar: {
        stem: String,
        branch: String,
        fullStemBranch: String
      }
    },
    mainElement: String,
    yinYang: String,
    tenGods: {
      type: Map,
      of: String
    },
    branchTenGods: {
      type: Map,
      of: String
    }
  }
});

// statics.findByEmail メソッドの追加
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() }).exec();
};

const User = mongoose.model('User', userSchema);

// メインの処理
async function main() {
  // コマンドライン引数からメールアドレスを取得
  const email = process.argv[2];
  
  if (!email) {
    console.log('使用方法: node find-user-by-email.js <メールアドレス>');
    process.exit(1);
  }
  
  try {
    await connectToDatabase();
    
    // 通常のfind操作でユーザーを検索
    console.log(`通常検索: ${email}`);
    const user = await User.findOne({ email: email.toLowerCase() }).exec();
    
    if (user) {
      console.log('ユーザーが見つかりました（通常検索）');
      console.log(`ID: ${user._id}`);
      console.log(`名前: ${user.name}`);
      console.log(`メール: ${user.email}`);
      console.log(`ロール: ${user.role}`);
      console.log('四柱推命情報:');
      console.log(JSON.stringify(user.sajuProfile, null, 2));
    } else {
      console.log('ユーザーが見つかりませんでした（通常検索）');
    }
    
    // モデルのstatics.findByEmailメソッドでユーザーを検索
    console.log('\nfindByEmailメソッド使用:');
    const userByEmail = await User.findByEmail(email);
    
    if (userByEmail) {
      console.log('ユーザーが見つかりました（findByEmail）');
      console.log(`ID: ${userByEmail._id}`);
      console.log(`名前: ${userByEmail.name}`);
    } else {
      console.log('ユーザーが見つかりませんでした（findByEmail）');
    }
    
    // IDが67e487dbc4a58a62d38ac6acのユーザーが存在するか確認
    const problematicId = '67e487dbc4a58a62d38ac6ac';
    console.log(`\n問題のIDでユーザーを検索: ${problematicId}`);
    
    const userByProblemId = await User.findById(problematicId).exec();
    if (userByProblemId) {
      console.log('問題のIDのユーザーが見つかりました');
      console.log(`ID: ${userByProblemId._id}`);
      console.log(`メール: ${userByProblemId.email}`);
    } else {
      console.log('問題のIDのユーザーは存在しません');
    }
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  } finally {
    // データベース接続を閉じる
    await mongoose.disconnect();
    console.log('MongoDBとの接続を閉じました');
  }
}

main();