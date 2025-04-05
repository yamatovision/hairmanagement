/**
 * hairmanagementデータベースからpatrolmanagementデータベースへの
 * 四柱推命データ（特にbranchTenGods）の移行スクリプト
 */
const mongoose = require('mongoose');
require('dotenv').config();

// データベース接続情報
const SOURCE_DB_URI = 'mongodb://localhost:27017/hairmanagement';
const TARGET_DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/patrolmanagement';

// ユーザースキーマ定義（簡略化）
const userSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  email: String,
  name: String,
  role: String,
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
    tenGods: Object,
    branchTenGods: Object
  }
}, { strict: false });

/**
 * データベース接続関数
 */
async function connectToDatabases() {
  console.log('=== データベース接続 ===');
  
  // 移行元データベース（hairmanagement）に接続
  const sourceConnection = await mongoose.createConnection(SOURCE_DB_URI);
  console.log(`移行元データベース(hairmanagement)に接続しました`);
  
  // 移行先データベース（patrolmanagement）に接続
  const targetConnection = await mongoose.createConnection(TARGET_DB_URI);
  console.log(`移行先データベース(patrolmanagement)に接続しました`);
  
  return { sourceConnection, targetConnection };
}

/**
 * 四柱推命データを持つユーザーを取得
 */
async function getUsersWithSajuData(connection) {
  const User = connection.model('User', userSchema);
  
  // sajuProfileとbranchTenGodsを持つユーザーを検索
  const users = await User.find({
    'sajuProfile.fourPillars': { $exists: true }
  }).exec();
  
  console.log(`${users.length}人のユーザーが四柱推命データを持っています`);
  return users;
}

/**
 * メールアドレスで対応するユーザーを検索
 */
async function findUserByEmail(connection, email) {
  const User = connection.model('User', userSchema);
  return await User.findOne({ email }).exec();
}

/**
 * 四柱推命データを更新
 */
async function updateSajuProfile(connection, userId, sajuProfileData) {
  const User = connection.model('User', userSchema);
  
  const updateResult = await User.updateOne(
    { _id: userId },
    { 
      $set: {
        'sajuProfile.fourPillars': sajuProfileData.fourPillars,
        'sajuProfile.mainElement': sajuProfileData.mainElement,
        'sajuProfile.secondaryElement': sajuProfileData.secondaryElement,
        'sajuProfile.yinYang': sajuProfileData.yinYang,
        'sajuProfile.tenGods': sajuProfileData.tenGods,
        'sajuProfile.branchTenGods': sajuProfileData.branchTenGods
      }
    }
  );
  
  return updateResult.modifiedCount > 0;
}

/**
 * メイン移行関数
 */
async function migrateSajuData() {
  try {
    // データベース接続
    const { sourceConnection, targetConnection } = await connectToDatabases();
    
    // 移行元（hairmanagement）から四柱推命データを持つユーザーを取得
    const sourceUsers = await getUsersWithSajuData(sourceConnection);
    
    let successCount = 0;
    let failCount = 0;
    let skipCount = 0;
    
    // 各ユーザーについて処理
    for (const sourceUser of sourceUsers) {
      console.log(`\n処理中: ${sourceUser.email || '名前なし'} (ID: ${sourceUser._id})`);
      
      // 四柱推命データが実際にあるか確認
      if (!sourceUser.sajuProfile || !sourceUser.sajuProfile.fourPillars) {
        console.log(`  四柱推命データなし。スキップします`);
        skipCount++;
        continue;
      }
      
      // 移行先（patrolmanagement）で対応するユーザーを検索
      const targetUser = await findUserByEmail(targetConnection, sourceUser.email);
      
      if (!targetUser) {
        console.log(`  移行先データベースに対応するユーザーが見つかりません: ${sourceUser.email}`);
        failCount++;
        continue;
      }
      
      // 四柱推命データを移行
      console.log(`  四柱推命データの移行: ${sourceUser.email} -> ${targetUser._id}`);
      
      // 移行対象のデータを構築
      const sajuProfileData = {
        fourPillars: sourceUser.sajuProfile.fourPillars || {},
        mainElement: sourceUser.sajuProfile.mainElement || '',
        secondaryElement: sourceUser.sajuProfile.secondaryElement || '',
        yinYang: sourceUser.sajuProfile.yinYang || '',
        tenGods: sourceUser.sajuProfile.tenGods || {},
        branchTenGods: sourceUser.sajuProfile.branchTenGods || {}
      };
      
      // ブランチ十神データの有無を確認
      const hasBranchTenGods = 
        sajuProfileData.branchTenGods && 
        Object.keys(sajuProfileData.branchTenGods).length > 0;
      
      console.log(`  地支十神データ: ${hasBranchTenGods ? 'あり' : 'なし'}`);
      
      // すでに地支十神データがある場合はスキップ
      if (targetUser.sajuProfile && 
          targetUser.sajuProfile.branchTenGods && 
          Object.keys(targetUser.sajuProfile.branchTenGods).length > 0) {
        console.log(`  移行先のユーザーには既に地支十神データがあります。スキップします。`);
        skipCount++;
        continue;
      }
      
      // データ更新
      const updated = await updateSajuProfile(targetConnection, targetUser._id, sajuProfileData);
      
      if (updated) {
        console.log(`  ✅ ${sourceUser.email} のデータを正常に移行しました`);
        successCount++;
      } else {
        console.log(`  ❌ ${sourceUser.email} のデータ移行に失敗しました`);
        failCount++;
      }
    }
    
    // 結果を表示
    console.log('\n=== 移行結果 ===');
    console.log(`処理したユーザー数: ${sourceUsers.length}`);
    console.log(`成功: ${successCount}`);
    console.log(`失敗: ${failCount}`);
    console.log(`スキップ: ${skipCount}`);
    
    // 接続を閉じる
    await sourceConnection.close();
    await targetConnection.close();
    console.log('\nデータベース接続を閉じました');
    
  } catch (error) {
    console.error('エラー:', error);
    process.exit(1);
  }
}

// 移行を実行
migrateSajuData();