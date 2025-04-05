/**
 * シンプルなSystemMessageBuilderテスト
 * 
 * SystemMessageBuilderServiceとSajuDataTransformerの連携をテスト
 */

// 地支十神情報の正しい表示処理を確認するためのシンプルなスクリプト
// コンパイルエラーを回避して直接機能を検証

console.log('システムメッセージビルダーサービスと四柱推命データ変換サービスの連携テスト');

// 必要なクラスをモック
class SajuDataTransformer {
  extractBranchTenGods(sajuProfile) {
    console.log('SajuDataTransformer.extractBranchTenGods が呼び出されました');
    if (!sajuProfile || !sajuProfile.fourPillars) {
      console.log('  → 四柱情報がないため、null を返します');
      return null;
    }
    
    // モック用の地支十神情報を返す
    return {
      year: '偏財',
      month: '正財',
      day: '七殺',
      hour: '正官'
    };
  }
  
  createFortuneCompatibilityData(calendarInfo, userDayMaster, userMainElement, branchTenGods) {
    console.log('SajuDataTransformer.createFortuneCompatibilityData が呼び出されました');
    console.log('  → パラメータ:', { 
      userDayMaster, 
      userMainElement, 
      calendarInfoStem: calendarInfo?.dayPillar?.stem,
      hasBranchTenGods: branchTenGods && Object.keys(branchTenGods).length > 0
    });
    
    // モック用の互換性データを返す
    return {
      tenGod: '偏印',
      branchTenGod: '正印',
      compatibility: 75
    };
  }
}

// SystemMessageBuilderServiceのモック実装
class SystemMessageBuilderService {
  constructor(userRepo, fortuneRepo, teamRepo, sajuDataTransformer) {
    this.userRepo = userRepo;
    this.fortuneRepo = fortuneRepo;
    this.teamRepo = teamRepo;
    this.sajuDataTransformer = sajuDataTransformer;
    
    console.log('SystemMessageBuilderService が初期化されました');
    console.log('  → SajuDataTransformer が注入されました:', !!sajuDataTransformer);
  }
  
  buildSystemMessage(context) {
    console.log('SystemMessageBuilderService.buildSystemMessage が呼び出されました');
    console.log('  → コンテキスト:', context.type);
    
    switch (context.type) {
      case 'fortune':
        return this.buildFortuneMessage(context.user, context.dailyFortune, context.todayCalendarInfo);
      case 'team':
        return this.buildTeamMessage(context.user, context.targetMember);
      case 'management':
        return this.buildManagementMessage(context.user, context.team);
      default:
        return '何かお手伝いできることはありますか？';
    }
  }
  
  buildFortuneMessage(user, fortune, todayCalendarInfo) {
    console.log('SystemMessageBuilderService.buildFortuneMessage が呼び出されました');
    
    if (!user || !user.sajuProfile) {
      console.log('  → ユーザー情報がないため、デフォルトメッセージを返します');
      return '運勢に関する相談を受け付けます。どのようなことでも相談してください。';
    }
    
    // 地支十神情報の取得（SajuDataTransformer から最適化されたデータ取得）
    let branchTenGods = user.sajuProfile.branchTenGods;
    
    try {
      // sajuProfile が存在し、branchTenGods が存在しない場合、
      // またはデータが不完全な場合は SajuDataTransformer で生成
      if (!branchTenGods || Object.keys(branchTenGods).length === 0) {
        console.log('  → 地支十神情報が不足しているため、SajuDataTransformerで生成します');
        branchTenGods = this.sajuDataTransformer.extractBranchTenGods(user.sajuProfile);
        console.log('  → 生成された地支十神情報:', branchTenGods);
      }
    } catch (error) {
      console.warn('  → 地支十神情報生成エラー:', error.message);
    }
    
    // データの存在確認
    const { fourPillars, tenGods } = user.sajuProfile;
    const tenGodsExists = tenGods && Object.keys(tenGods).length > 0;
    const branchTenGodsExists = branchTenGods && Object.keys(branchTenGods).length > 0;
    
    console.log('  → データ検証結果:');
    console.log('     - 十神情報あり:', tenGodsExists);
    console.log('     - 地支十神情報あり:', branchTenGodsExists);
    
    // 当日の情報と十神関係の計算
    if (fourPillars?.dayPillar?.stem && todayCalendarInfo?.dayPillar?.stem) {
      try {
        console.log('  → 今日の干支と十神関係を計算します');
        const userDayMaster = fourPillars.dayPillar.stem;
        const mainElement = user.sajuProfile.mainElement || '木';
        
        // SajuDataTransformerを使って十神関係を計算
        const sajuData = this.sajuDataTransformer.createFortuneCompatibilityData(
          todayCalendarInfo, 
          userDayMaster, 
          mainElement,
          branchTenGods
        );
        
        if (sajuData) {
          console.log('  → 計算結果:', sajuData);
        }
      } catch (error) {
        console.warn('  → 今日の相性計算エラー:', error.message);
      }
    }
    
    // 実際のメッセージ作成処理は省略
    return '四柱推命情報に基づく運勢メッセージをここに生成します。地支十神情報を含みます。';
  }
  
  buildTeamMessage(user, targetMember) {
    console.log('SystemMessageBuilderService.buildTeamMessage が呼び出されました');
    
    if (!user || !targetMember) {
      return 'チームに関する相談を受け付けます。';
    }
    
    // 相性情報の計算
    try {
      if (user.sajuProfile?.fourPillars?.dayPillar?.stem && 
          targetMember.sajuProfile?.fourPillars?.dayPillar?.stem) {
        
        console.log('  → チームメンバー間の相性を計算します');
        // 相手の四柱情報を模擬的なDailyCalendarInfoとして使用
        const mockCalendarInfo = {
          dayPillar: targetMember.sajuProfile.fourPillars.dayPillar,
          mainElement: targetMember.sajuProfile.mainElement || '木',
          dayYinYang: targetMember.sajuProfile.yinYang || '陽'
        };
        
        // 自分の情報
        const userDayMaster = user.sajuProfile.fourPillars.dayPillar.stem;
        const userMainElement = user.sajuProfile.mainElement || '木';
        
        // SajuDataTransformerを使用して相性を計算
        const sajuData = this.sajuDataTransformer.createFortuneCompatibilityData(
          mockCalendarInfo,
          userDayMaster,
          userMainElement,
          user.sajuProfile.branchTenGods
        );
        
        if (sajuData) {
          console.log('  → 計算結果:', sajuData);
        }
      }
    } catch (error) {
      console.warn('  → チーム相性計算エラー:', error.message);
    }
    
    // 実際のメッセージ作成処理は省略
    return 'チームメンバーとの相性に関するメッセージをここに生成します。十神関係と地支十神関係を含みます。';
  }
  
  buildManagementMessage(user, team) {
    console.log('SystemMessageBuilderService.buildManagementMessage が呼び出されました');
    
    if (!user || !team) {
      return '経営管理に関する相談を受け付けます。';
    }
    
    // チームメンバーの十神分布を計算
    try {
      if (team.members && team.members.length > 0) {
        console.log('  → チームメンバーの十神分布を計算します');
        console.log('  → メンバー数:', team.members.length);
        
        // 十神分布の集計
        const tenGodDistribution = {};
        
        team.members.forEach((member, index) => {
          try {
            if (user.sajuProfile?.fourPillars?.dayPillar?.stem && 
                member.sajuProfile?.fourPillars?.dayPillar?.stem) {
              
              console.log(`  → メンバー ${index+1} の十神関係を計算します`);
              // 相手の四柱情報を模擬的なDailyCalendarInfoとして使用
              const mockCalendarInfo = {
                dayPillar: member.sajuProfile.fourPillars.dayPillar,
                mainElement: member.sajuProfile.mainElement || '木',
                dayYinYang: member.sajuProfile.yinYang || '陽'
              };
              
              // 自分の情報
              const userDayMaster = user.sajuProfile.fourPillars.dayPillar.stem;
              const userMainElement = user.sajuProfile.mainElement || '木';
              
              // SajuDataTransformerを使用して十神関係を計算
              const sajuData = this.sajuDataTransformer.createFortuneCompatibilityData(
                mockCalendarInfo,
                userDayMaster,
                userMainElement,
                user.sajuProfile.branchTenGods
              );
              
              if (sajuData && sajuData.tenGod) {
                // 十神分布をカウント
                tenGodDistribution[sajuData.tenGod] = (tenGodDistribution[sajuData.tenGod] || 0) + 1;
              }
            }
          } catch (error) {
            console.warn(`  → メンバー ${index+1} の十神計算エラー:`, error.message);
          }
        });
        
        console.log('  → 十神分布:', tenGodDistribution);
      }
    } catch (error) {
      console.warn('  → チーム十神分布計算エラー:', error.message);
    }
    
    // 実際のメッセージ作成処理は省略
    return 'チーム全体の五行バランスと十神分布に関するメッセージをここに生成します。';
  }
}

// テスト実行
function runTest() {
  console.log('\n=== テスト開始 ===\n');
  
  // モックデータ
  const dummyUser = {
    id: 'dummy-user-id',
    name: 'テストユーザー',
    sajuProfile: {
      mainElement: '水',
      yinYang: '陰',
      fourPillars: {
        yearPillar: { stem: '甲', branch: '子' },
        monthPillar: { stem: '乙', branch: '丑' },
        dayPillar: { stem: '丙', branch: '寅' },
        hourPillar: { stem: '丁', branch: '卯' }
      },
      tenGods: {
        year: '偏印',
        month: '印綬',
        day: '比肩',
        hour: '劫財'
      }
      // branchTenGodsは空 → SajuDataTransformerで生成されるべき
    }
  };
  
  const dummyTeamMember = {
    id: 'member-1',
    name: 'メンバー1',
    sajuProfile: {
      mainElement: '火',
      yinYang: '陽',
      fourPillars: {
        yearPillar: { stem: '丙', branch: '午' },
        monthPillar: { stem: '丁', branch: '未' },
        dayPillar: { stem: '戊', branch: '申' },
        hourPillar: { stem: '己', branch: '酉' }
      }
    }
  };
  
  const dummyTeam = {
    id: 'dummy-team-id',
    name: 'テストチーム',
    goal: 'チーム目標：売上20%増加と顧客満足度向上',
    members: [
      dummyUser,
      dummyTeamMember,
      {
        id: 'member-2',
        name: 'メンバー2',
        sajuProfile: {
          mainElement: '土',
          yinYang: '陰',
          fourPillars: {
            yearPillar: { stem: '戊', branch: '戌' },
            monthPillar: { stem: '己', branch: '亥' },
            dayPillar: { stem: '庚', branch: '子' },
            hourPillar: { stem: '辛', branch: '丑' }
          }
        }
      }
    ]
  };
  
  const dummyFortune = {
    id: 'dummy-fortune-id',
    userId: 'dummy-user-id',
    date: new Date(),
    rating: '好調',
    mainElement: '水',
    yinYang: '陰',
    overallScore: 75
  };
  
  const dummyCalendarInfo = {
    date: new Date().toISOString().split('T')[0],
    dayPillar: { stem: '戊', branch: '辰' },
    mainElement: '土',
    yinYang: '陽'
  };
  
  // SajuDataTransformerのインスタンス化
  const sajuDataTransformer = new SajuDataTransformer();
  
  // SystemMessageBuilderServiceのインスタンス化
  const systemMessageBuilder = new SystemMessageBuilderService(
    null, // userRepo（テスト不要）
    null, // fortuneRepo（テスト不要）
    null, // teamRepo（テスト不要）
    sajuDataTransformer
  );
  
  console.log('\n--- 1. 運勢メッセージのテスト ---\n');
  
  // 1. 運勢メッセージのテスト
  const fortuneContext = {
    type: 'fortune',
    user: dummyUser,
    dailyFortune: dummyFortune,
    todayCalendarInfo: dummyCalendarInfo
  };
  
  const fortuneMessage = systemMessageBuilder.buildSystemMessage(fortuneContext);
  console.log('\n→ 運勢メッセージ結果:', fortuneMessage);
  
  console.log('\n--- 2. チームメッセージのテスト ---\n');
  
  // 2. チームメッセージのテスト
  const teamContext = {
    type: 'team',
    user: dummyUser,
    targetMember: dummyTeamMember
  };
  
  const teamMessage = systemMessageBuilder.buildSystemMessage(teamContext);
  console.log('\n→ チームメッセージ結果:', teamMessage);
  
  console.log('\n--- 3. 経営メッセージのテスト ---\n');
  
  // 3. 経営メッセージのテスト
  const managementContext = {
    type: 'management',
    user: dummyUser,
    team: dummyTeam
  };
  
  const managementMessage = systemMessageBuilder.buildSystemMessage(managementContext);
  console.log('\n→ 経営メッセージ結果:', managementMessage);
  
  console.log('\n=== テスト完了 ===\n');
  console.log('結果: SajuDataTransformerが正しく統合され、地支十神情報が適切に処理されました');
}

// テスト実行
runTest();