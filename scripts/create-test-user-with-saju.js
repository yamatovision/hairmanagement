/**
 * テスト用の四柱推命プロフィル付きユーザーを作成するスクリプト
 */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
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
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  birthDate: String,
  role: {
    type: String,
    enum: ['admin', 'manager', 'employee'],
    default: 'employee'
  },
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
    branchTenGods: {} // 追加
  },
  personalGoal: String,
  notificationSettings: {
    dailyFortune: Boolean,
    promptQuestions: Boolean,
    teamEvents: Boolean,
    goalReminders: Boolean,
    systemUpdates: Boolean
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// モデル定義
const User = mongoose.model('User', userSchema);

// パスワードをハッシュ化する関数
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// テストユーザーのデータ
async function createTestUser() {
  try {
    // ユーザーが既に存在するか確認
    const existingUser = await User.findOne({ email: 'saju@example.com' });
    
    if (existingUser) {
      console.log('既にユーザーが存在します。更新します...');
      
      // 既存ユーザーの四柱推命情報を更新
      existingUser.sajuProfile = {
        fourPillars: {
          yearPillar: {
            stem: '甲',
            branch: '子',
            fullStemBranch: '甲子',
            hiddenStems: ['癸']
          },
          monthPillar: {
            stem: '丙',
            branch: '午',
            fullStemBranch: '丙午',
            hiddenStems: ['丁', '己']
          },
          dayPillar: {
            stem: '戊',
            branch: '申',
            fullStemBranch: '戊申',
            hiddenStems: ['庚', '壬', '戊']
          },
          hourPillar: {
            stem: '癸',
            branch: '亥',
            fullStemBranch: '癸亥',
            hiddenStems: ['壬', '甲']
          }
        },
        mainElement: '土',
        secondaryElement: '金',
        yinYang: '陽',
        tenGods: {
          '年柱': '比肩',
          '月柱': '食神',
          '日柱': '日主',
          '時柱': '正財'
        },
        branchTenGods: {
          '年柱地支': '印綬',
          '月柱地支': '傷官',
          '日柱地支': '劫財',
          '時柱地支': '偏財'
        }
      };
      
      existingUser.personalGoal = '業務効率化と顧客満足度の向上';
      
      await existingUser.save();
      console.log('ユーザー更新完了:', existingUser.email);
    } else {
      // パスワードをハッシュ化
      const hashedPassword = await hashPassword('password123');
      
      // 新しいユーザーを作成
      const newUser = new User({
        email: 'saju@example.com',
        password: hashedPassword,
        name: '四柱 太郎',
        birthDate: '1985-06-15',
        role: 'employee',
        elementalType: {
          mainElement: '土',
          secondaryElement: '金',
          yinYang: '陽'
        },
        sajuProfile: {
          fourPillars: {
            yearPillar: {
              stem: '甲',
              branch: '子',
              fullStemBranch: '甲子',
              hiddenStems: ['癸']
            },
            monthPillar: {
              stem: '丙',
              branch: '午',
              fullStemBranch: '丙午',
              hiddenStems: ['丁', '己']
            },
            dayPillar: {
              stem: '戊',
              branch: '申',
              fullStemBranch: '戊申',
              hiddenStems: ['庚', '壬', '戊']
            },
            hourPillar: {
              stem: '癸',
              branch: '亥',
              fullStemBranch: '癸亥',
              hiddenStems: ['壬', '甲']
            }
          },
          mainElement: '土',
          secondaryElement: '金',
          yinYang: '陽',
          tenGods: {
            '年柱': '比肩',
            '月柱': '食神',
            '日柱': '日主',
            '時柱': '正財'
          },
          branchTenGods: {
            '年柱地支': '印綬',
            '月柱地支': '傷官',
            '日柱地支': '劫財',
            '時柱地支': '偏財'
          }
        },
        personalGoal: '業務効率化と顧客満足度の向上',
        notificationSettings: {
          dailyFortune: true,
          promptQuestions: true,
          teamEvents: true,
          goalReminders: true,
          systemUpdates: true
        }
      });
      
      await newUser.save();
      console.log('新しいユーザー作成完了:', newUser.email);
    }
    
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
createTestUser();