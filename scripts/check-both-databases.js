/**
 * 両方のデータベースを確認し、ユーザー情報を比較するスクリプト
 */
const mongoose = require('mongoose');

// データベース接続情報
const PATROL_DB_URI = 'mongodb://localhost:27017/patrolmanagement';
const HAIR_DB_URI = 'mongodb://localhost:27017/hairmanagement';

// ユーザースキーマ定義
const userSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  email: String,
  name: String,
  role: String,
  sajuProfile: Object
});

// admin@example.comのユーザー情報を取得する関数
async function checkAdminUserInDatabase(dbUri, dbName) {
  const connection = await mongoose.createConnection(dbUri);
  console.log(`${dbName}データベースに接続しました`);
  
  try {
    // ユーザーモデル作成
    const User = connection.model('User', userSchema);
    
    // admin@example.comのユーザーを検索
    const adminUser = await User.findOne({ email: 'admin@example.com' });
    
    if (adminUser) {
      console.log(`${dbName}: admin@example.comユーザーが見つかりました`);
      console.log(`- ID: ${adminUser._id}`);
      console.log(`- 名前: ${adminUser.name || '未設定'}`);
      console.log(`- 役割: ${adminUser.role || '未設定'}`);
      
      // 四柱推命データの確認
      if (adminUser.sajuProfile) {
        console.log(`- 四柱推命データ: あり`);
        console.log(`  - 主要五行: ${adminUser.sajuProfile.mainElement || '未設定'}`);
        console.log(`  - 陰陽: ${adminUser.sajuProfile.yinYang || '未設定'}`);
        
        if (adminUser.sajuProfile.tenGods) {
          const tenGodsCount = Object.keys(adminUser.sajuProfile.tenGods).length;
          console.log(`  - 十神関係: ${tenGodsCount}件`);
        }
        
        if (adminUser.sajuProfile.branchTenGods) {
          const branchTenGodsCount = Object.keys(adminUser.sajuProfile.branchTenGods).length;
          console.log(`  - 地支十神関係: ${branchTenGodsCount}件`);
        }
      } else {
        console.log(`- 四柱推命データ: なし`);
      }
      
      return adminUser;
    } else {
      console.log(`${dbName}: admin@example.comユーザーは見つかりませんでした`);
      return null;
    }
  } catch (error) {
    console.error(`${dbName}でのエラー:`, error.message);
    return null;
  } finally {
    await connection.close();
    console.log(`${dbName}データベース接続を閉じました`);
  }
}

// 全てのユーザー数を確認する関数
async function countUsersInDatabase(dbUri, dbName) {
  const connection = await mongoose.createConnection(dbUri);
  
  try {
    const User = connection.model('User', userSchema);
    const count = await User.countDocuments();
    console.log(`${dbName}: 合計ユーザー数 = ${count}`);
    
    // サンプルユーザーリスト
    const users = await User.find({}, { email: 1, _id: 1 }).limit(5);
    console.log(`${dbName}: ユーザーサンプル:`);
    users.forEach((user, index) => {
      console.log(`  ${index+1}. ID: ${user._id}, Email: ${user.email}`);
    });
    
    return count;
  } catch (error) {
    console.error(`${dbName}でのエラー:`, error.message);
    return 0;
  } finally {
    await connection.close();
  }
}

// データベースごとの四柱推命データを持つユーザー数を確認
async function countSajuUsersInDatabase(dbUri, dbName) {
  const connection = await mongoose.createConnection(dbUri);
  
  try {
    const User = connection.model('User', userSchema);
    const count = await User.countDocuments({ 'sajuProfile.mainElement': { $exists: true } });
    console.log(`${dbName}: 四柱推命データを持つユーザー数 = ${count}`);
    
    return count;
  } catch (error) {
    console.error(`${dbName}でのエラー:`, error.message);
    return 0;
  } finally {
    await connection.close();
  }
}

// メイン実行関数
async function main() {
  console.log('===== データベース比較スクリプト =====');
  
  // ユーザー数を確認
  console.log('\n=== ユーザー数の比較 ===');
  const patrolUserCount = await countUsersInDatabase(PATROL_DB_URI, 'patrolmanagement');
  const hairUserCount = await countUsersInDatabase(HAIR_DB_URI, 'hairmanagement');
  
  // 四柱推命データを持つユーザー数を確認
  console.log('\n=== 四柱推命データを持つユーザー数の比較 ===');
  const patrolSajuCount = await countSajuUsersInDatabase(PATROL_DB_URI, 'patrolmanagement');
  const hairSajuCount = await countSajuUsersInDatabase(HAIR_DB_URI, 'hairmanagement');
  
  // admin@example.comのユーザー情報を確認
  console.log('\n=== admin@example.comユーザーの比較 ===');
  const patrolAdminUser = await checkAdminUserInDatabase(PATROL_DB_URI, 'patrolmanagement');
  const hairAdminUser = await checkAdminUserInDatabase(HAIR_DB_URI, 'hairmanagement');
  
  // 結果分析
  console.log('\n=== 分析結果 ===');
  
  if (patrolUserCount > hairUserCount) {
    console.log('- patrolmanagementデータベースにはより多くのユーザーがあります');
  } else if (hairUserCount > patrolUserCount) {
    console.log('- hairmanagementデータベースにはより多くのユーザーがあります');
  } else {
    console.log('- 両方のデータベースのユーザー数は同じです');
  }
  
  if (patrolSajuCount > hairSajuCount) {
    console.log('- patrolmanagementデータベースにはより多くの四柱推命データがあります');
  } else if (hairSajuCount > patrolSajuCount) {
    console.log('- hairmanagementデータベースにはより多くの四柱推命データがあります');
  } else {
    console.log('- 両方のデータベースの四柱推命データ数は同じです');
  }
  
  // 推奨アクション
  console.log('\n=== 推奨アクション ===');
  
  if (hairSajuCount > 0 && patrolSajuCount === 0) {
    console.log('1. hairmanagementから四柱推命データをpatrolmanagementに移行');
    console.log('2. アプリケーションのコード修正は不要（すでにpatrolmanagementを使用している）');
    console.log('3. スクリプトの接続先をpatrolmanagementに修正');
  } else if (patrolSajuCount > 0 && hairSajuCount === 0) {
    console.log('1. すべてのスクリプトの接続先をpatrolmanagementに修正');
    console.log('2. hairmanagementデータベースを使用停止');
  } else if (patrolAdminUser && hairAdminUser) {
    if (hairAdminUser.sajuProfile && (!patrolAdminUser.sajuProfile || Object.keys(patrolAdminUser.sajuProfile).length === 0)) {
      console.log('1. hairmanagementからadminユーザーの四柱推命データをpatrolmanagementに移行');
      console.log('2. すべてのスクリプトの接続先をpatrolmanagementに修正');
    } else if (patrolAdminUser.sajuProfile && (!hairAdminUser.sajuProfile || Object.keys(hairAdminUser.sajuProfile).length === 0)) {
      console.log('1. すべてのスクリプトの接続先をpatrolmanagementに修正');
      console.log('2. hairmanagementデータベースを使用停止');
    }
  } else {
    console.log('- 状況が複雑です。詳細な分析結果に基づいて手動で判断してください');
  }
  
  console.log('\n===== スクリプト完了 =====');
}

main().catch(error => {
  console.error('エラー:', error);
  process.exit(1);
});