/**
 * シンプルなSystemMessageBuilderテスト
 * 
 * DIコンテナを使わずに直接SystemMessageBuilderを使用
 */

// .envファイルがあれば読み込む
require('dotenv').config();

// tsyringeのために必要なreflect-metadata
require('reflect-metadata');

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

// システムメッセージビルダークラスを直接インポート
const { SystemMessageBuilderService } = require('../backend/dist/application/services/system-message-builder.service');

async function testSystemMessageBuilder() {
  try {
    console.log('シンプルSystemMessageBuilderテストを開始します');
    
    // データベース接続
    console.log('データベースに接続中...');
    const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/patrolmanagement';
    await mongoose.connect(dbUri);
    console.log('データベース接続成功');
    
    // モデルの登録確認
    console.log('Mongooseモデルを確認中...');
    const modelNames = mongoose.modelNames();
    console.log('登録済みモデル:', modelNames);
    
    // UserモデルとDailyCalendarInfoモデルがなければ登録
    if (!mongoose.models.User) {
      console.log('Userモデルが未登録のため登録します...');
      require('../backend/dist/domain/models/user.model');
    }
    
    if (!mongoose.models.DailyCalendarInfo) {
      console.log('DailyCalendarInfoモデルが未登録のため登録します...');
      require('../backend/dist/domain/models/daily-calendar-info.model');
    }
    
    // ダミーデータでテスト
    console.log('ダミーデータでシステムメッセージビルダーをテスト中...');
    
    // ダミーユーザー
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
        },
        branchTenGods: {
          year: '食神',
          month: '傷官',
          day: '正財',
          hour: '偏財'
        }
      },
      personalGoal: '業務効率の向上と部下の育成'
    };
    
    // ダミーフォーチュン
    const dummyFortune = {
      id: 'dummy-fortune-id',
      userId: 'dummy-user-id',
      date: new Date(),
      rating: '好調',
      mainElement: '水',
      yinYang: '陰',
      overallScore: 75
    };
    
    // ダミーカレンダー情報
    const dummyCalendarInfo = {
      date: new Date().toISOString().split('T')[0],
      dayPillar: { stem: '戊', branch: '辰' },
      mainElement: '土',
      yinYang: '陽'
    };
    
    // システムメッセージビルダーのインスタンスを作成
    // モックリポジトリを渡す
    const mockUserRepo = {
      findById: async (id) => dummyUser
    };
    
    const mockFortuneRepo = {
      findByUserIdAndDate: async (userId, date) => dummyFortune
    };
    
    const mockTeamRepo = {
      findByFilter: async (filter) => []
    };
    
    // サービスのインスタンス化
    const systemMessageBuilder = new SystemMessageBuilderService(
      mockUserRepo, 
      mockFortuneRepo, 
      mockTeamRepo
    );
    
    // コンテキストを直接作成
    const fortuneContext = {
      type: 'fortune',
      user: dummyUser,
      dailyFortune: dummyFortune,
      todayCalendarInfo: dummyCalendarInfo
    };
    
    // システムメッセージ構築
    console.log('システムメッセージを構築中...');
    const systemMessage = systemMessageBuilder.buildSystemMessage(fortuneContext);
    
    console.log('\n----- 構築されたシステムメッセージ -----');
    console.log(systemMessage);
    console.log('---------------------------------------\n');
    
    // 初期メッセージも生成
    console.log('初期メッセージを生成中...');
    const initialMessage = systemMessageBuilder.createFortuneInitialMessage(dummyUser, dummyCalendarInfo);
    
    console.log('\n----- 生成された初期メッセージ -----');
    console.log(initialMessage);
    console.log('----------------------------------\n');
    
    console.log('テスト成功！');
  } catch (error) {
    console.error('テスト中にエラーが発生しました:', error);
  } finally {
    // データベース接続を閉じる
    await mongoose.disconnect();
    console.log('データベース接続を終了しました');
  }
}

// テストを実行
testSystemMessageBuilder();