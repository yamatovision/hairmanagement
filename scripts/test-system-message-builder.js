/**
 * SystemMessageBuilderサービスのテスト
 * 
 * 使用方法: node scripts/test-system-message-builder.js [userId] [testType]
 * 
 * - userId: テスト対象のユーザーID（省略時はシステム内のいずれかのユーザー）
 * - testType: テストタイプ（fortune, team, management, all）（デフォルト: all）
 * 
 * 例: node scripts/test-system-message-builder.js 60abbf1234567890abcdef fortune
 * 
 * SystemMessageBuilderServiceが正しくシステムメッセージを構築できるかテストします。
 * 
 * 作成日: 2025/04/04
 */

// .envファイルがあれば読み込む
require('dotenv').config();

// 共有モジュールを直接参照
process.env.NODE_PATH = __dirname + '/../';
require('module').Module._initPaths();

// @shared エイリアスを設定
const path = require('path');
const moduleAlias = require('module-alias');
moduleAlias.addAliases({
  '@shared': path.join(__dirname, '../shared/dist')
});

const mongoose = require('mongoose');

// 後ほどコンテナを取得するためにモジュールを先にロード
const containerModule = require('../backend/dist/infrastructure/di/container');

// コマンドライン引数からユーザーIDとテストタイプを取得
const userId = process.argv[2] || null;
const testType = process.argv[3] || 'all';

async function testSystemMessageBuilder() {
  try {
    console.log('SystemMessageBuilderサービスのテストを開始します');
    console.log(`テストタイプ: ${testType}`);
    
    // データベース接続
    console.log('データベースに接続中...');
    const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/patrolmanagement';
    await mongoose.connect(dbUri);
    console.log('データベース接続成功');
    
    // コンテナから必要なサービスとリポジトリを取得
    const { container } = containerModule;
    
    if (!container) {
      console.error('DIコンテナが正しく初期化されていません');
      process.exit(1);
    }
    
    console.log('コンテナからサービスを解決中...');
    const userRepository = container.resolve('IUserRepository');
    const teamRepository = container.resolve('ITeamRepository');
    const systemMessageBuilder = container.resolve('SystemMessageBuilderService');
    
    console.log('サービス解決成功:');
    console.log(`- userRepository: ${userRepository ? 'OK' : 'NULL'}`);
    console.log(`- teamRepository: ${teamRepository ? 'OK' : 'NULL'}`);
    console.log(`- systemMessageBuilder: ${systemMessageBuilder ? 'OK' : 'NULL'}`);
    
    // ユーザーを取得（指定されたIDまたはいずれかのユーザー）
    let user;
    if (userId) {
      console.log(`指定されたユーザーID: ${userId} を検索中...`);
      user = await userRepository.findById(userId);
    } else {
      console.log('システム内のユーザーを検索中...');
      // サンプルユーザーを検索（四柱推命情報を持つユーザーを優先）
      const users = await mongoose.model('User').find({
        '$or': [
          { 'sajuProfile.fourPillars': { $exists: true } },
          { 'sajuProfile': { $exists: true } }
        ]
      }).limit(1);
      
      if (users.length > 0) {
        user = users[0];
      } else {
        // 四柱推命情報を持つユーザーがなければ、任意のユーザーを取得
        const anyUsers = await mongoose.model('User').find().limit(1);
        if (anyUsers.length > 0) {
          user = anyUsers[0];
        }
      }
    }
    
    if (!user) {
      console.error('テスト用のユーザーが見つかりませんでした');
      process.exit(1);
    }
    
    console.log('テスト用ユーザー:', {
      id: user.id,
      name: user.name,
      email: user.email,
      hasSajuProfile: !!user.sajuProfile,
      hasFourPillars: !!(user.sajuProfile && user.sajuProfile.fourPillars),
      hasTeamIds: !!(user.teamIds && user.teamIds.length > 0)
    });
    
    // 運勢タイプのテスト（testType=fortuneまたはall）
    if (testType === 'fortune' || testType === 'all') {
      await testFortuneMessageBuilder(systemMessageBuilder, user);
    }
    
    // チームタイプのテスト（testType=teamまたはall）
    if (testType === 'team' || testType === 'all') {
      await testTeamMessageBuilder(systemMessageBuilder, teamRepository, user);
    }
    
    // 経営タイプのテスト（testType=managementまたはall）
    if (testType === 'management' || testType === 'all') {
      await testManagementMessageBuilder(systemMessageBuilder, teamRepository, user);
    }
    
    // 初期メッセージのテスト（testType=initialまたはall）
    if (testType === 'initial' || testType === 'all') {
      await testInitialMessageBuilder(systemMessageBuilder, user);
    }
    
    console.log('\nテスト完了');
  } catch (error) {
    console.error('テスト中にエラーが発生しました:', error);
  } finally {
    // データベース接続を閉じる
    await mongoose.disconnect();
    console.log('データベース接続を終了しました');
    process.exit(0);
  }
}

// 運勢タイプのメッセージビルダーをテスト
async function testFortuneMessageBuilder(systemMessageBuilder, user) {
  console.log('\n===== 運勢タイプのテスト =====');
  
  // 運勢タイプのコンテキストを構築
  console.log('運勢タイプのコンテキストを構築中...');
  const fortuneContext = await systemMessageBuilder.buildFortuneContextFromUserId(user.id);
  
  if (!fortuneContext) {
    console.error('運勢コンテキストの構築に失敗しました');
    return;
  }
  
  console.log('運勢コンテキスト構築成功:', {
    type: fortuneContext.type,
    userExists: !!fortuneContext.user,
    fortuneExists: !!fortuneContext.dailyFortune,
    calendarInfoExists: !!fortuneContext.todayCalendarInfo
  });
  
  // システムメッセージを構築
  console.log('システムメッセージを構築中...');
  const systemMessage = systemMessageBuilder.buildSystemMessage(fortuneContext);
  
  console.log('\n----- 構築されたシステムメッセージ -----');
  console.log(systemMessage);
  console.log('---------------------------------------\n');
  
  // テスト結果の検証
  const hasFourPillars = systemMessage.includes('【四柱】');
  const hasTenGods = systemMessage.includes('【十神関係】');
  const hasBranchTenGods = systemMessage.includes('【地支十神関係】');
  const hasPersonalGoal = systemMessage.includes('【個人目標】');
  
  console.log('検証結果:');
  console.log(`- 四柱情報が含まれているか: ${hasFourPillars ? '✅ YES' : '❌ NO'}`);
  console.log(`- 十神関係情報が含まれているか: ${hasTenGods ? '✅ YES' : '❌ NO'}`);
  console.log(`- 地支十神情報が含まれているか: ${hasBranchTenGods ? '✅ YES' : '❌ NO'}`);
  console.log(`- 個人目標情報が含まれているか: ${hasPersonalGoal ? '✅ YES' : '❌ NO'}`);
  
  // sajuProfileに情報があるか確認
  if (!hasBranchTenGods && fortuneContext.user?.sajuProfile?.branchTenGods) {
    console.warn('⚠️ 警告: ユーザーは地支十神データを持っていますが、システムメッセージには含まれていません');
    const branchTenGodsData = fortuneContext.user.sajuProfile.branchTenGods;
    console.log('地支十神データ:', typeof branchTenGodsData === 'object' ? Object.keys(branchTenGodsData).length : branchTenGodsData);
  }
  
  // 四柱情報の有無を確認
  if (!hasFourPillars && fortuneContext.user?.sajuProfile?.fourPillars) {
    console.warn('⚠️ 警告: ユーザーは四柱情報を持っていますが、システムメッセージには含まれていません');
  }
}

// チームタイプのメッセージビルダーをテスト
async function testTeamMessageBuilder(systemMessageBuilder, teamRepository, user) {
  console.log('\n===== チームタイプのテスト =====');
  
  // ユーザーが所属するチームを取得
  let targetMemberId = null;
  
  try {
    // まずチームを探す
    const teams = await teamRepository.findByFilter({
      $or: [
        { ownerId: user.id },
        { admins: user.id },
        { 'members.userId': user.id }
      ]
    });
    
    if (teams && teams.length > 0) {
      console.log(`チーム情報を取得しました: ${teams[0].name}`);
      
      // チームから自分以外のメンバーを探す
      const team = teams[0];
      if (team.members && team.members.length > 0) {
        // 自分以外のメンバーを優先
        const otherMember = team.members.find(m => m.userId !== user.id);
        if (otherMember) {
          targetMemberId = otherMember.userId;
          console.log(`ターゲットメンバーID: ${targetMemberId}`);
        } else {
          // 見つからなければ最初のメンバー
          targetMemberId = team.members[0].userId;
          console.log(`ターゲットメンバーID（自分）: ${targetMemberId}`);
        }
      } else if (team.ownerId !== user.id) {
        // メンバーがいなければオーナー
        targetMemberId = team.ownerId;
        console.log(`ターゲットメンバーID（オーナー）: ${targetMemberId}`);
      } else if (team.admins && team.admins.length > 0) {
        // オーナーが自分ならアドミン
        targetMemberId = team.admins[0];
        console.log(`ターゲットメンバーID（アドミン）: ${targetMemberId}`);
      }
    }
    
    // チームが見つからなければダミーデータを使用
    if (!targetMemberId) {
      console.log('チームまたはターゲットメンバーが見つかりませんでした。ダミーデータを使用します。');
      
      // ダミーコンテキストを作成
      const dummyContext = {
        type: 'team',
        user: user,
        targetMember: {
          name: 'テストメンバー',
          sajuProfile: {
            mainElement: '水',
            yinYang: '陰',
            fourPillars: {
              dayPillar: {
                stem: '甲',
                branch: '子'
              }
            }
          }
        }
      };
      
      // システムメッセージを構築
      console.log('ダミーコンテキストでシステムメッセージを構築中...');
      const systemMessage = systemMessageBuilder.buildSystemMessage(dummyContext);
      
      console.log('\n----- 構築されたシステムメッセージ（ダミーデータ） -----');
      console.log(systemMessage);
      console.log('-----------------------------------------------\n');
      
      return;
    }
    
    // チームタイプのコンテキストを構築
    console.log('チームタイプのコンテキストを構築中...');
    const teamContext = await systemMessageBuilder.buildTeamContextFromUserId(user.id, targetMemberId);
    
    if (!teamContext) {
      console.error('チームコンテキストの構築に失敗しました');
      return;
    }
    
    console.log('チームコンテキスト構築成功:', {
      type: teamContext.type,
      userExists: !!teamContext.user,
      targetMemberExists: !!teamContext.targetMember
    });
    
    // システムメッセージを構築
    console.log('システムメッセージを構築中...');
    const systemMessage = systemMessageBuilder.buildSystemMessage(teamContext);
    
    console.log('\n----- 構築されたシステムメッセージ -----');
    console.log(systemMessage);
    console.log('---------------------------------------\n');
    
    // テスト結果の検証
    const hasUserInfo = systemMessage.includes('【あなたの情報】');
    const hasMemberInfo = systemMessage.includes('【メンバーの情報】');
    
    console.log('検証結果:');
    console.log(`- ユーザー情報が含まれているか: ${hasUserInfo ? '✅ YES' : '❌ NO'}`);
    console.log(`- メンバー情報が含まれているか: ${hasMemberInfo ? '✅ YES' : '❌ NO'}`);
    
  } catch (error) {
    console.error('チームタイプのテスト中にエラーが発生しました:', error);
  }
}

// 経営タイプのメッセージビルダーをテスト
async function testManagementMessageBuilder(systemMessageBuilder, teamRepository, user) {
  console.log('\n===== 経営タイプのテスト =====');
  
  // ユーザーが所有または管理するチームを取得
  try {
    // 経営者または管理者として関わるチームを探す
    const teams = await teamRepository.findByFilter({
      $or: [
        { ownerId: user.id },
        { admins: user.id }
      ]
    });
    
    let teamId = null;
    if (teams && teams.length > 0) {
      console.log(`チーム情報を取得しました: ${teams[0].name}`);
      teamId = teams[0].id;
    }
    
    // チームが見つからなければダミーデータを使用
    if (!teamId) {
      console.log('管理者権限のあるチームが見つかりませんでした。ダミーデータを使用します。');
      
      // ダミーコンテキストを作成
      const dummyContext = {
        type: 'management',
        user: user,
        team: {
          name: 'テストチーム',
          goal: 'プロジェクトの成功と顧客満足度の向上',
          members: [
            {
              name: 'メンバー1',
              sajuProfile: { mainElement: '木', yinYang: '陽' }
            },
            {
              name: 'メンバー2',
              sajuProfile: { mainElement: '火', yinYang: '陰' }
            },
            {
              name: 'メンバー3',
              sajuProfile: { mainElement: '水', yinYang: '陽' }
            }
          ]
        }
      };
      
      // システムメッセージを構築
      console.log('ダミーコンテキストでシステムメッセージを構築中...');
      const systemMessage = systemMessageBuilder.buildSystemMessage(dummyContext);
      
      console.log('\n----- 構築されたシステムメッセージ（ダミーデータ） -----');
      console.log(systemMessage);
      console.log('-----------------------------------------------\n');
      
      return;
    }
    
    // 経営タイプのコンテキストを構築
    console.log('経営タイプのコンテキストを構築中...');
    const managementContext = await systemMessageBuilder.buildManagementContextFromUserId(user.id, teamId);
    
    if (!managementContext) {
      console.error('経営コンテキストの構築に失敗しました');
      return;
    }
    
    console.log('経営コンテキスト構築成功:', {
      type: managementContext.type,
      userExists: !!managementContext.user,
      teamExists: !!managementContext.team,
      teamName: managementContext.team?.name,
      memberCount: managementContext.team?.members?.length || 0
    });
    
    // システムメッセージを構築
    console.log('システムメッセージを構築中...');
    const systemMessage = systemMessageBuilder.buildSystemMessage(managementContext);
    
    console.log('\n----- 構築されたシステムメッセージ -----');
    console.log(systemMessage);
    console.log('---------------------------------------\n');
    
    // テスト結果の検証
    const hasManagerInfo = systemMessage.includes('【マネージャー情報】');
    const hasTeamInfo = systemMessage.includes('【チーム情報】');
    
    console.log('検証結果:');
    console.log(`- マネージャー情報が含まれているか: ${hasManagerInfo ? '✅ YES' : '❌ NO'}`);
    console.log(`- チーム情報が含まれているか: ${hasTeamInfo ? '✅ YES' : '❌ NO'}`);
    
  } catch (error) {
    console.error('経営タイプのテスト中にエラーが発生しました:', error);
  }
}

// 初期メッセージ生成機能をテスト
async function testInitialMessageBuilder(systemMessageBuilder, user) {
  console.log('\n===== 初期メッセージのテスト =====');
  
  try {
    // 当日の干支情報を取得（あれば）
    let todayCalendarInfo = null;
    try {
      const DailyCalendarInfoModel = mongoose.model('DailyCalendarInfo');
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      todayCalendarInfo = await DailyCalendarInfoModel.findOne({ date: today });
      console.log('当日の干支情報:', todayCalendarInfo ? '取得成功' : '未取得');
    } catch (calendarError) {
      console.warn('当日の干支情報取得エラー:', calendarError.message);
    }
    
    // 初期メッセージを生成
    console.log('初期メッセージを生成中...');
    const initialMessage = systemMessageBuilder.createFortuneInitialMessage(user, todayCalendarInfo);
    
    console.log('\n----- 生成された初期メッセージ -----');
    console.log(initialMessage);
    console.log('----------------------------------\n');
    
    // テスト結果の検証
    const hasFortuneInfo = initialMessage.includes('今日の運勢情報');
    const hasAdvice = initialMessage.includes('【運勢アドバイス】');
    const hasPersonalGoal = user.personalGoal ? initialMessage.includes('【個人目標】') : true;
    
    console.log('検証結果:');
    console.log(`- 運勢情報が含まれているか: ${hasFortuneInfo ? '✅ YES' : '❌ NO'}`);
    console.log(`- アドバイス情報が含まれているか: ${hasAdvice ? '✅ YES' : '❌ NO'}`);
    console.log(`- 個人目標情報が含まれているか: ${hasPersonalGoal ? '✅ YES' : '❌ NO'}`);
    
  } catch (error) {
    console.error('初期メッセージのテスト中にエラーが発生しました:', error);
  }
}

// テストを実行
testSystemMessageBuilder();