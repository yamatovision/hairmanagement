/**
 * 二つのユーザーIDの関係を確認するスクリプト
 */
const mongoose = require('mongoose');

// MongoDB接続
const MONGODB_URI = 'mongodb://localhost:27017/hairmanagement';
console.log(`MongoDBに接続: ${MONGODB_URI}`);

// 調査対象のIDとメール
const ID_1 = '67e487dbc4a58a62d38ac6ac'; // ログインで返されるID
const ID_2 = '67e52f32fb1b7bc2b73744ce'; // sajuProfileが含まれるID
const EMAIL = 'admin@example.com';

// ユーザースキーマ定義
const userSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  email: String,
  password: String,
  name: String,
  role: String,
  sajuProfile: Object,
  personalGoal: String
});

async function checkUserIds() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB接続成功');

    const User = mongoose.model('User', userSchema);
    
    // IDによる検索
    console.log(`\n=== ID:${ID_1} による検索 ===`);
    const user1 = await User.findById(ID_1);
    if (user1) {
      console.log(`ユーザー情報: email=${user1.email}, name=${user1.name}, role=${user1.role}`);
      console.log(`sajuProfile: ${user1.sajuProfile ? '存在します' : '存在しません'}`);
    } else {
      console.log(`ID:${ID_1} に該当するユーザーは見つかりません`);
    }
    
    console.log(`\n=== ID:${ID_2} による検索 ===`);
    const user2 = await User.findById(ID_2);
    if (user2) {
      console.log(`ユーザー情報: email=${user2.email}, name=${user2.name}, role=${user2.role}`);
      console.log(`sajuProfile: ${user2.sajuProfile ? '存在します' : '存在しません'}`);
      if (user2.sajuProfile) {
        console.log(`sajuProfile.mainElement: ${user2.sajuProfile.mainElement}`);
        console.log(`tenGods: ${user2.sajuProfile.tenGods ? JSON.stringify(user2.sajuProfile.tenGods) : '存在しません'}`);
        console.log(`branchTenGods: ${user2.sajuProfile.branchTenGods ? JSON.stringify(user2.sajuProfile.branchTenGods) : '存在しません'}`);
      }
    } else {
      console.log(`ID:${ID_2} に該当するユーザーは見つかりません`);
    }
    
    // メールアドレスによる検索
    console.log(`\n=== メール:${EMAIL} による検索 ===`);
    const userByEmail = await User.findOne({ email: EMAIL });
    if (userByEmail) {
      console.log(`ユーザー情報: _id=${userByEmail._id}, name=${userByEmail.name}, role=${userByEmail.role}`);
      console.log(`sajuProfile: ${userByEmail.sajuProfile ? '存在します' : '存在しません'}`);
    } else {
      console.log(`メール:${EMAIL} に該当するユーザーは見つかりません`);
    }
    
    // すべてのユーザーを表示
    console.log('\n=== すべてのユーザー ===');
    const allUsers = await User.find({}, { email: 1, _id: 1 });
    allUsers.forEach((user, index) => {
      console.log(`${index+1}. ID: ${user._id}, Email: ${user.email}`);
    });
    
    // IDの不一致の可能性
    if (ID_1 !== ID_2) {
      console.log('\n=== ID不一致の可能性 ===');
      console.log(`ログインで返されるID (${ID_1}) と sajuProfileを持つID (${ID_2}) が異なります。`);
      console.log('これが四柱推命情報が渡されない原因となっている可能性があります。');
    }
    
    await mongoose.connection.close();
    console.log('\nMongoDB接続を閉じました');
    
  } catch (error) {
    console.error('エラー:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

checkUserIds();