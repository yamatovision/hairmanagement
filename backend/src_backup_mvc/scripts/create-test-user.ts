/**
 * テストユーザー作成スクリプト (直接パスワードを設定するバージョン)
 */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import fs from 'fs';
import { exit } from 'process';

// 環境変数の読み込み
dotenv.config();

// MongoDB 接続設定
const dbUri = process.env.DB_URI || 'mongodb://localhost:27017/hairmanagement';

// 実行する関数
async function createTestUser() {
  try {
    console.log(`データベースに接続中: ${dbUri}`);
    await mongoose.connect(dbUri);
    console.log('データベース接続成功');

    // モデルを直接定義（スキーマフックを回避）
    const userSchema = new mongoose.Schema({
      email: String,
      password: String,
      name: String,
      birthDate: String,
      role: String,
      isActive: Boolean,
      elementalType: {
        mainElement: String,
        secondaryElement: String,
        yinYang: String
      },
      notificationSettings: {
        dailyFortune: Boolean,
        promptQuestions: Boolean,
        teamEvents: Boolean,
        goalReminders: Boolean,
        systemUpdates: Boolean
      }
    }, { timestamps: true });

    // モデルを作成
    const User = mongoose.model('User', userSchema);

    // ユーザーが存在するかチェック
    const existingUser = await User.findOne({ email: 'admin@example.com' });
    
    // すでに存在する場合は更新
    if (existingUser) {
      console.log('既存のユーザーを見つけました。パスワードを更新します。');
      
      // パスワードをハッシュ化
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      // パスワードを直接更新
      await User.updateOne(
        { email: 'admin@example.com' },
        { $set: { password: hashedPassword } }
      );
      
      console.log('パスワードが更新されました');
    } 
    // 存在しない場合は作成
    else {
      console.log('新しいユーザーを作成します');
      
      // パスワードをハッシュ化
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      // ユーザーを作成
      const newUser = await User.create({
        email: 'admin@example.com',
        password: hashedPassword,
        name: '管理者',
        birthDate: '1990-01-01',
        role: 'admin',
        isActive: true,
        elementalType: {
          mainElement: '木',
          secondaryElement: '火',
          yinYang: '陽'
        },
        notificationSettings: {
          dailyFortune: true,
          promptQuestions: true,
          teamEvents: true,
          goalReminders: true,
          systemUpdates: true
        }
      });
      
      console.log(`ユーザーが作成されました: ${newUser.email}`);
    }
    
    console.log('ログイン情報:');
    console.log('メールアドレス: admin@example.com');
    console.log('パスワード: admin123');
    
    await mongoose.disconnect();
    console.log('データベース接続を終了しました');
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
    await mongoose.disconnect();
  }
}

// スクリプトを実行
createTestUser();