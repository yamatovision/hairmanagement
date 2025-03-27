require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// MongoDB接続
const connectDB = async () => {
  try {
    const dbUri = process.env.DB_URI || 'mongodb://localhost:27017/patrolmanagement';
    await mongoose.connect(dbUri);
    console.log('MongoDB接続成功！');
    return true;
  } catch (error) {
    console.error('MongoDB接続エラー:', error);
    return false;
  }
};

// ユーザースキーマ定義（モデルファイルと一致させる）
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  birthDate: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['employee', 'manager', 'admin'],
    default: 'employee'
  },
  profilePicture: {
    type: String,
    default: null
  },
  elementalType: {
    mainElement: {
      type: String,
      enum: ['木', '火', '土', '金', '水'],
      required: true
    },
    secondaryElement: {
      type: String,
      enum: ['木', '火', '土', '金', '水']
    },
    yin: {
      type: Boolean
    }
  },
  notificationSettings: {
    dailyFortune: {
      type: Boolean,
      default: true
    },
    promptQuestions: {
      type: Boolean,
      default: true
    },
    teamEvents: {
      type: Boolean,
      default: true
    },
    goalReminders: {
      type: Boolean,
      default: true
    },
    systemUpdates: {
      type: Boolean,
      default: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLoginAt: {
    type: Date
  }
}, { 
  timestamps: true
});

// 管理者ユーザーの作成
const createAdminUser = async () => {
  try {
    const connected = await connectDB();
    if (!connected) {
      console.error('データベース接続に失敗しました。');
      process.exit(1);
    }

    const UserModel = mongoose.model('User', UserSchema);

    // メールアドレスでユーザーを検索
    const existingUser = await UserModel.findOne({ email: 'kazutofukushima1202@gmail.com' });
    
    if (existingUser) {
      console.log('指定されたメールアドレスのユーザーは既に存在します。');
      await mongoose.disconnect();
      process.exit(0);
    }

    // パスワードのハッシュ化
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('aikakumei', salt);

    // 管理者ユーザーの作成
    const adminUser = await UserModel.create({
      email: 'kazutofukushima1202@gmail.com',
      password: hashedPassword,
      name: 'ふくちゃん',
      birthDate: '1990-01-01', // 仮の誕生日
      role: 'admin',
      elementalType: {
        mainElement: '火', // 仮のエレメンタルタイプ
        yin: true
      },
      isActive: true
    });

    console.log('管理者ユーザーが正常に作成されました:');
    console.log(`ID: ${adminUser._id}`);
    console.log(`名前: ${adminUser.name}`);
    console.log(`メール: ${adminUser.email}`);
    console.log(`ロール: ${adminUser.role}`);

    await mongoose.disconnect();
    console.log('MongoDB 接続を終了しました。');
  } catch (error) {
    console.error('管理者ユーザーの作成中にエラーが発生しました:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

createAdminUser();