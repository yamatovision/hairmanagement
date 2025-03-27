/**
 * 管理者ユーザー作成スクリプト
 * 
 * このスクリプトは、システムの管理者ユーザーを作成します。
 * 実行方法: npx ts-node -r tsconfig-paths/register src/scripts/create-admin.ts
 */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import UserModel from '../models/user.model';

// 環境変数の読み込み
dotenv.config();

// 管理者ユーザー情報
const adminUser = {
  email: 'admin@example.com',
  password: 'admin123',
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
};

// データベース接続とユーザー作成
async function createAdmin() {
  try {
    // データベース接続
    const dbUri = process.env.DB_URI || 'mongodb://localhost:27017/patrolmanagement';
    console.log(`データベースに接続中: ${dbUri}`);
    await mongoose.connect(dbUri);
    console.log('データベース接続成功');

    // 既存のユーザーチェック
    const existingUser = await UserModel.findOne({ email: adminUser.email });
    if (existingUser) {
      console.log(`ユーザー ${adminUser.email} は既に存在します`);
      await mongoose.disconnect();
      return;
    }

    // パスワードのハッシュ化
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminUser.password, salt);

    // ユーザーの作成
    const newUser = await UserModel.create({
      ...adminUser,
      password: hashedPassword
    });

    console.log(`管理者ユーザーが作成されました: ${newUser.email} (ID: ${newUser._id})`);
    console.log('ログイン情報:');
    console.log(`メールアドレス: ${adminUser.email}`);
    console.log(`パスワード: ${adminUser.password}`);
  } catch (error) {
    console.error('管理者ユーザーの作成に失敗しました:', error);
  } finally {
    // 接続を閉じる
    await mongoose.disconnect();
    console.log('データベース接続を終了しました');
  }
}

// スクリプト実行
createAdmin();