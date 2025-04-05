/**
 * 両方のデータベースのチームモデルの存在を確認するスクリプト
 */
const mongoose = require('mongoose');

// データベース接続情報
const PATROL_DB_URI = 'mongodb://localhost:27017/patrolmanagement';
const HAIR_DB_URI = 'mongodb://localhost:27017/hairmanagement';

// チームスキーマ定義（想定される構造）
const teamSchema = new mongoose.Schema({
  name: String,
  goal: String,
  createdBy: String,
  members: Array,
  createdAt: Date,
  updatedAt: Date
});

async function checkTeamModel(dbUri, dbName) {
  const connection = await mongoose.createConnection(dbUri);
  console.log(`${dbName}データベースに接続しました`);
  
  try {
    // チームモデルを作成
    const Team = connection.model('Team', teamSchema);
    
    // コレクション名を取得して存在を確認
    const collections = await connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    const teamsCollectionExists = collectionNames.includes('teams');
    
    console.log(`${dbName}: teams コレクションの存在: ${teamsCollectionExists ? 'あり' : 'なし'}`);
    
    if (teamsCollectionExists) {
      // チームデータの数を確認
      const teamCount = await Team.countDocuments();
      console.log(`${dbName}: チーム数 = ${teamCount}`);
      
      // サンプルを表示
      if (teamCount > 0) {
        const teams = await Team.find().limit(2);
        console.log(`${dbName}: チームサンプル:`);
        teams.forEach((team, index) => {
          console.log(`チーム ${index+1}:`);
          console.log(`- ID: ${team._id}`);
          console.log(`- 名前: ${team.name || '未設定'}`);
          console.log(`- 目標: ${team.goal || '未設定'}`);
          console.log(`- メンバー数: ${team.members ? team.members.length : 0}`);
        });
      }
    }
    
    return {
      exists: teamsCollectionExists,
      count: teamsCollectionExists ? await Team.countDocuments() : 0
    };
  } catch (error) {
    console.error(`${dbName}でのエラー:`, error.message);
    return { exists: false, count: 0 };
  } finally {
    await connection.close();
    console.log(`${dbName}データベース接続を閉じました`);
  }
}

async function main() {
  console.log('===== チームモデル検証スクリプト =====');
  
  const patrolResult = await checkTeamModel(PATROL_DB_URI, 'patrolmanagement');
  const hairResult = await checkTeamModel(HAIR_DB_URI, 'hairmanagement');
  
  console.log('\n=== 結果サマリー ===');
  console.log(`patrolmanagement: チームモデル ${patrolResult.exists ? 'あり' : 'なし'}, チーム数: ${patrolResult.count}`);
  console.log(`hairmanagement: チームモデル ${hairResult.exists ? 'あり' : 'なし'}, チーム数: ${hairResult.count}`);
  
  console.log('\n=== 分析 ===');
  if (patrolResult.exists && !hairResult.exists) {
    console.log('patrolmanagementデータベースのみにチームモデルが存在します');
  } else if (!patrolResult.exists && hairResult.exists) {
    console.log('hairmanagementデータベースのみにチームモデルが存在します');
  } else if (patrolResult.exists && hairResult.exists) {
    console.log('両方のデータベースにチームモデルが存在します');
    
    if (patrolResult.count > hairResult.count) {
      console.log('patrolmanagementデータベースにはより多くのチームデータがあります');
    } else if (hairResult.count > patrolResult.count) {
      console.log('hairmanagementデータベースにはより多くのチームデータがあります');
    } else {
      console.log('両方のデータベースのチーム数は同じです');
    }
  } else {
    console.log('どちらのデータベースにもチームモデルが存在しません');
  }
  
  console.log('\n===== スクリプト完了 =====');
}

main().catch(error => {
  console.error('エラー:', error);
  process.exit(1);
});