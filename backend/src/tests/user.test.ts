/**
 * ユーザーAPIのテストスイート
 * 
 * ユーザー関連のエンドポイントをテストし、機能が正しく動作することを確認します。
 * 
 * 変更履歴:
 * - 2025/03/26: 初期実装 (AppGenius)
 */

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../index';
import * as authHelper from './helpers/auth.helper';
import User from '../models/user.model';
import bcrypt from 'bcrypt';

describe('User API Tests', () => {
  let authToken: string;
  let adminAuthToken: string;
  let regularUserId: string;
  let adminUserId: string;
  let testUser: any;

  // テスト前の準備
  beforeAll(async () => {
    // 認証トークンを取得
    const { token: regularToken, userId } = await authHelper.getAuthToken('employee@example.com', 'password123');
    const { token: adminToken, userId: adminId } = await authHelper.getAuthToken('admin@example.com', 'adminpass123');

    authToken = regularToken;
    adminAuthToken = adminToken;
    regularUserId = userId;
    adminUserId = adminId;

    // テストデータのセットアップ
    await createTestUser();
  });

  // テスト後のクリーンアップ
  afterAll(async () => {
    // テストで作成したデータを削除
    await cleanupTestData();
    
    // MongoDB接続を閉じる
    await mongoose.connection.close();
  });

  // テスト用のユーザーデータを作成
  async function createTestUser() {
    // テスト用のユーザーデータ
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('testpassword', salt);

    testUser = await User.create({
      email: 'test.user@example.com',
      password: hashedPassword,
      name: 'Test User',
      birthDate: '1995-05-15',
      role: 'employee',
      elementalType: {
        mainElement: '水',
        secondaryElement: '木',
        yin: false
      },
      notificationSettings: {
        dailyFortune: true,
        promptQuestions: true,
        teamEvents: true,
        goalReminders: false,
        systemUpdates: false
      },
      isActive: true
    });
  }

  // テストデータのクリーンアップ
  async function cleanupTestData() {
    // テストで作成したユーザーデータを削除
    if (testUser) {
      await User.deleteOne({ _id: testUser._id });
    }
  }

  describe('GET /api/v1/users/me', () => {
    it('認証されたユーザーが自分の情報を取得できること', async () => {
      const response = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('name');
      expect(response.body).not.toHaveProperty('password'); // パスワードは含まれないこと
    });

    it('認証なしでアクセスするとエラーになること', async () => {
      const response = await request(app)
        .get('/api/v1/users/me');

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/v1/users/me', () => {
    it('認証されたユーザーが自分の情報を更新できること', async () => {
      const updateData = {
        name: 'Updated Name',
        elementalType: {
          mainElement: '火',
          secondaryElement: '土',
          yin: true
        }
      };

      const response = await request(app)
        .put('/api/v1/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', updateData.name);
      expect(response.body.elementalType).toHaveProperty('mainElement', updateData.elementalType.mainElement);
    });

    it('無効なデータで更新するとエラーになること', async () => {
      const invalidData = {
        role: 'superadmin' // 存在しないロール
      };

      const response = await request(app)
        .put('/api/v1/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expect(response.status).not.toBe(200);
    });
  });

  describe('PUT /api/v1/users/me/notification-settings', () => {
    it('認証されたユーザーが通知設定を更新できること', async () => {
      const notificationSettings = {
        dailyFortune: false,
        promptQuestions: true,
        teamEvents: false,
        goalReminders: true,
        systemUpdates: true
      };

      const response = await request(app)
        .put('/api/v1/users/me/notification-settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(notificationSettings);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('notificationSettings');
      expect(response.body.notificationSettings).toHaveProperty('dailyFortune', notificationSettings.dailyFortune);
      expect(response.body.notificationSettings).toHaveProperty('promptQuestions', notificationSettings.promptQuestions);
    });
  });

  describe('PUT /api/v1/users/me/password', () => {
    it('認証されたユーザーがパスワードを更新できること', async () => {
      // 現在のパスワードと新しいパスワード
      const passwordData = {
        currentPassword: 'password123',
        newPassword: 'newPassword123'
      };

      const response = await request(app)
        .put('/api/v1/users/me/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');

      // パスワードを元に戻す
      const resetPasswordData = {
        currentPassword: 'newPassword123',
        newPassword: 'password123'
      };

      await request(app)
        .put('/api/v1/users/me/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(resetPasswordData);
    });

    it('間違った現在のパスワードでリクエストするとエラーになること', async () => {
      const invalidPasswordData = {
        currentPassword: 'wrongPassword',
        newPassword: 'newPassword123'
      };

      const response = await request(app)
        .put('/api/v1/users/me/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidPasswordData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/v1/users', () => {
    it('管理者がすべてのユーザーのリストを取得できること', async () => {
      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${adminAuthToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('email');
      expect(response.body[0]).not.toHaveProperty('password'); // パスワードは含まれないこと
    });

    it('一般ユーザーがアクセスするとエラーになること', async () => {
      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('管理者が特定のユーザー情報を取得できること', async () => {
      const response = await request(app)
        .get(`/api/v1/users/${testUser._id}`)
        .set('Authorization', `Bearer ${adminAuthToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', testUser._id.toString());
      expect(response.body).toHaveProperty('email', testUser.email);
      expect(response.body).not.toHaveProperty('password');
    });

    it('一般ユーザーがアクセスするとエラーになること', async () => {
      const response = await request(app)
        .get(`/api/v1/users/${adminUserId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
    });

    it('存在しないユーザーIDを指定するとエラーになること', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .get(`/api/v1/users/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/v1/users/:id', () => {
    it('管理者が他のユーザー情報を更新できること', async () => {
      const updateData = {
        name: 'Admin Updated Name',
        role: 'manager'
      };

      const response = await request(app)
        .put(`/api/v1/users/${testUser._id}`)
        .set('Authorization', `Bearer ${adminAuthToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', updateData.name);
      expect(response.body).toHaveProperty('role', updateData.role);
    });

    it('一般ユーザーがアクセスするとエラーになること', async () => {
      const updateData = {
        name: 'Updated By Regular User'
      };

      const response = await request(app)
        .put(`/api/v1/users/${testUser._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/v1/users/:id', () => {
    it('管理者がユーザーを削除できること', async () => {
      // テスト用の新しいユーザーを作成
      const tempUser = await authHelper.createTestUser('temp.user@example.com', 'temppass123');

      const response = await request(app)
        .delete(`/api/v1/users/${tempUser._id}`)
        .set('Authorization', `Bearer ${adminAuthToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');

      // ユーザーが削除されたことを確認
      const deletedUser = await User.findById(tempUser._id);
      expect(deletedUser).toBeNull();
    });

    it('管理者が自分自身を削除しようとするとエラーになること', async () => {
      const response = await request(app)
        .delete(`/api/v1/users/${adminUserId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('一般ユーザーがアクセスするとエラーになること', async () => {
      const response = await request(app)
        .delete(`/api/v1/users/${testUser._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
    });
  });
});