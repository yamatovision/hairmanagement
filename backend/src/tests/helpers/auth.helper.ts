/**
 * 認証ヘルパー
 * テスト用の認証機能を提供
 * 
 * 変更履歴:
 * - 2025/03/26: 初期実装 (AppGenius)
 */

import request from 'supertest';
import app from '../../index';
import User from '../../models/user.model';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

/**
 * ログインしてトークンを取得
 * @param email メールアドレス
 * @param password パスワード
 * @returns トークンとユーザーID
 */
export async function getAuthToken(email: string, password: string): Promise<{ token: string, userId: string }> {
  try {
    // ユーザーの存在を確認
    let user = await User.findOne({ email });
    
    // テストユーザーが存在しない場合は作成
    if (!user) {
      user = await createTestUser(email, password);
    }
    
    // ログインAPIを呼び出してトークンを取得
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password });
    
    if (response.status !== 200 || !response.body.token) {
      // ログインに失敗した場合はトークンを生成
      const secret = process.env.JWT_SECRET || 'test-secret';
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        secret,
        { expiresIn: '1h' }
      );
      return { token, userId: user._id.toString() };
    }
    
    return { token: response.body.token, userId: user._id.toString() };
  } catch (error) {
    console.error('Auth token取得エラー:', error);
    throw error;
  }
}

/**
 * テストユーザーを作成
 * @param email メールアドレス
 * @param password パスワード
 * @param role ロール（デフォルトはemployee）
 * @returns 作成されたユーザー
 */
export async function createTestUser(
  email: string,
  password: string,
  role: 'employee' | 'manager' | 'admin' = 'employee'
): Promise<any> {
  try {
    // パスワードをハッシュ化
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // 生年月日を設定
    const birthDate = '1990-01-01';
    
    // テスト用ユーザーを作成
    const newUser = new User({
      email,
      password: hashedPassword,
      name: email.split('@')[0],
      birthDate,
      role,
      elementalType: {
        mainElement: '木',
        secondaryElement: '火',
        yin: true
      },
      isActive: true
    });
    
    await newUser.save();
    return newUser;
  } catch (error) {
    console.error('テストユーザー作成エラー:', error);
    throw error;
  }
}

/**
 * テストユーザーを削除
 * @param email メールアドレス
 */
export async function removeTestUser(email: string): Promise<void> {
  try {
    await User.deleteOne({ email });
  } catch (error) {
    console.error('テストユーザー削除エラー:', error);
    throw error;
  }
}

/**
 * 管理者ユーザーを作成
 * @returns 管理者ユーザー情報とトークン
 */
export async function createAdminUser(): Promise<{ user: any, token: string }> {
  const email = 'admin@example.com';
  const password = 'adminpass123';
  
  // 管理者ユーザーを作成
  const user = await createTestUser(email, password, 'admin');
  
  // トークンを取得
  const { token } = await getAuthToken(email, password);
  
  return { user, token };
}

/**
 * 一般ユーザーを作成
 * @returns 一般ユーザー情報とトークン
 */
export async function createRegularUser(): Promise<{ user: any, token: string }> {
  const email = 'employee@example.com';
  const password = 'password123';
  
  // 一般ユーザーを作成
  const user = await createTestUser(email, password, 'employee');
  
  // トークンを取得
  const { token } = await getAuthToken(email, password);
  
  return { user, token };
}