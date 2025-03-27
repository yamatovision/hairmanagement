const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: '../.env' });

async function createTestUser() {
  try {
    console.log('MongoDB URI:', process.env.DB_URI);
    await mongoose.connect(process.env.DB_URI);
    console.log('MongoDB接続成功!');
    
    // Userスキーマの定義（簡易版）
    const userSchema = new mongoose.Schema({
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      name: { type: String, required: true },
      birthDate: { type: String, required: true },
      role: { 
        type: String, 
        enum: ['employee', 'manager', 'admin'],
        default: 'employee'
      },
      elementalType: {
        mainElement: { 
          type: String,
          enum: ['木', '火', '土', '金', '水']
        },
        secondaryElement: { 
          type: String,
          enum: ['木', '火', '土', '金', '水']
        },
        yin: Boolean
      },
      isActive: { type: Boolean, default: true },
    }, { timestamps: true });
    
    // モデル作成
    const User = mongoose.model('User', userSchema);
    
    // ユーザー存在確認
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('既存のテストユーザーを削除します...');
      await User.deleteOne({ email: 'test@example.com' });
    }
    
    // テストユーザー作成
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('testpassword', salt);
    
    const testUser = new User({
      email: 'test@example.com',
      password: hashedPassword,
      name: 'テストユーザー',
      birthDate: '1990-01-01',
      role: 'employee',
      elementalType: {
        mainElement: '木',
        secondaryElement: '火',
        yin: true
      },
      isActive: true
    });
    
    await testUser.save();
    console.log('テストユーザーを作成しました:');
    console.log({
      email: testUser.email,
      name: testUser.name,
      password: 'testpassword' // 平文のパスワード（表示用）
    });
    
  } catch (error) {
    console.error('エラー:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB接続を終了しました');
  }
}

createTestUser();