/**
 * admin@example.com ユーザーに四柱推命情報を追加するスクリプト
 */
const mongoose = require('mongoose');
require('dotenv').config();

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
  elementalType: {
    mainElement: String,
    secondaryElement: String,
    yinYang: String
  },
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
    branchTenGods: {}
  },
  personalGoal: String
});

// モデル定義
const User = mongoose.model('User', userSchema);

// admin@example.comに四柱推命情報を追加する関数
async function updateAdminWithSaju() {
  try {
    // admin@example.comユーザーを検索
    const admin = await User.findOne({ email: 'admin@example.com' });
    
    if (!admin) {
      console.error('admin@example.com ユーザーが見つかりません');
      await mongoose.connection.close();
      return;
    }
    
    console.log('admin@example.com ユーザーが見つかりました');
    
    // 四柱推命情報を設定
    admin.sajuProfile = {
      fourPillars: {
        yearPillar: {
          stem: '丙',
          branch: '寅',
          fullStemBranch: '丙寅',
          hiddenStems: ['甲', '丙', '戊']
        },
        monthPillar: {
          stem: '己',
          branch: '丑',
          fullStemBranch: '己丑',
          hiddenStems: ['己', '辛', '癸']
        },
        dayPillar: {
          stem: '甲',
          branch: '午',
          fullStemBranch: '甲午',
          hiddenStems: ['丙', '己', '庚']
        },
        hourPillar: {
          stem: '壬',
          branch: '申',
          fullStemBranch: '壬申',
          hiddenStems: ['庚', '壬', '戊']
        }
      },
      mainElement: '木',  // elementalTypeの値を継承
      secondaryElement: '火',  // elementalTypeの値を継承
      yinYang: '陽',  // elementalTypeの値を継承
      tenGods: {
        '年柱': '偏印',
        '月柱': '劫財',
        '日柱': '日主',
        '時柱': '食神'
      },
      branchTenGods: {
        '年柱地支': '比肩',
        '月柱地支': '財星',
        '日柱地支': '官星',
        '時柱地支': '傷官'
      }
    };
    
    // 個人目標を追加
    admin.personalGoal = 'チームの生産性向上と新規プロジェクトの成功';
    
    // 保存
    await admin.save();
    console.log('admin@example.com ユーザーの四柱推命情報を更新しました');
    
    // 更新後のユーザー情報を表示
    const updatedAdmin = await User.findOne({ email: 'admin@example.com' });
    console.log('更新後のユーザー情報:');
    console.log(JSON.stringify(updatedAdmin, null, 2));
    
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
updateAdminWithSaju();