/**
 * チームAPIのテストスイート
 * 
 * チーム関連のエンドポイントをテストし、機能が正しく動作することを確認します。
 * 
 * 変更履歴:
 * - 2025/03/26: 初期実装 (AppGenius)
 */

import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app from '../index';
import * as authHelper from './helpers/auth.helper';
import User from '../models/user.model';

describe('Team API Tests', () => {
  let authToken: string;
  let adminAuthToken: string;
  let regularUserId: string;
  let adminUserId: string;
  let testContributionId: string;
  let testMentorshipId: string;

  // テスト前の準備
  beforeAll(async () => {
    // テスト環境の準備
    process.env.NODE_ENV = 'test';
    
    // MongoDBに接続
    await mongoose.connect('mongodb://localhost:27017/fortune-test');
    
    // テストユーザーの作成
    const regularUser = await User.create({
      email: 'employee@example.com',
      password: '$2b$10$JXCQjj0yFURZXvoEvyT1wOEp8cSIiMicH4hJA2KmLaL6r7ky15zZi', // password123
      name: 'Test Employee',
      birthDate: '1990-01-01',
      role: 'employee',
      elementalType: {
        mainElement: '木',
        secondaryElement: '火',
        yin: true
      },
      isActive: true
    });
    
    const adminUser = await User.create({
      email: 'admin@example.com',
      password: '$2b$10$JXCQjj0yFURZXvoEvyT1wOEp8cSIiMicH4hJA2KmLaL6r7ky15zZi', // password123
      name: 'Test Admin',
      birthDate: '1985-05-05',
      role: 'admin',
      elementalType: {
        mainElement: '金',
        secondaryElement: '土',
        yin: false
      },
      isActive: true
    });
    
    regularUserId = regularUser._id.toString();
    adminUserId = adminUser._id.toString();
    
    // トークンの生成
    const jwtSecret = process.env.JWT_SECRET || 'test-secret';
    authToken = jwt.sign({ id: regularUserId, role: 'employee' }, jwtSecret, { expiresIn: '1h' });
    adminAuthToken = jwt.sign({ id: adminUserId, role: 'admin' }, jwtSecret, { expiresIn: '1h' });
  });

  // テスト後のクリーンアップ
  afterAll(async () => {
    // テストユーザーの削除
    await User.deleteMany({ email: { $in: ['employee@example.com', 'admin@example.com'] } });
    
    // MongoDB接続を閉じる
    await mongoose.connection.close();
  });

  describe('GET /api/v1/team/contributions', () => {
    it('認証されたユーザーがチーム貢献一覧を取得できること', async () => {
      const response = await request(app)
        .get('/api/v1/team/contributions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('認証なしでアクセスするとエラーになること', async () => {
      const response = await request(app)
        .get('/api/v1/team/contributions');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/v1/team/contributions', () => {
    it('認証されたユーザーが新しいチーム貢献を追加できること', async () => {
      const contributionData = {
        title: 'カットセミナー開催',
        description: 'チームメンバー向けにカットの技術セミナーを開催しました',
        date: new Date().toISOString().split('T')[0],
        category: 'mentorship',
        impact: 'medium'
      };

      const response = await request(app)
        .post('/api/v1/team/contributions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(contributionData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('userId', regularUserId);
      expect(response.body).toHaveProperty('title', contributionData.title);
      
      // 後続のテストで使用するためにIDを保存
      testContributionId = response.body.id;
    });

    it('必須フィールドが欠けているとエラーになること', async () => {
      const invalidData = {
        // title が欠けている
        description: 'チームメンバー向けにカットの技術セミナーを開催しました',
        // date が欠けている
        category: 'mentorship'
      };

      const response = await request(app)
        .post('/api/v1/team/contributions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/v1/team/contributions/user/:userId', () => {
    it('認証されたユーザーが自分の貢献一覧を取得できること', async () => {
      const response = await request(app)
        .get(`/api/v1/team/contributions/user/${regularUserId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // 自分の貢献が含まれていることを確認
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('userId', regularUserId);
      }
    });

    it('管理者が他のユーザーの貢献一覧を取得できること', async () => {
      const response = await request(app)
        .get(`/api/v1/team/contributions/user/${regularUserId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('PUT /api/v1/team/contributions/:id', () => {
    it('認証されたユーザーが自分の貢献を更新できること', async () => {
      if (!testContributionId) {
        fail('テスト用のcontributionIdが設定されていません');
        return;
      }

      const updateData = {
        title: '更新されたタイトル',
        impact: 'high'
      };

      const response = await request(app)
        .put(`/api/v1/team/contributions/${testContributionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('title', updateData.title);
      expect(response.body).toHaveProperty('impact', updateData.impact);
    });

    it('他のユーザーの貢献を更新しようとするとエラーになること', async () => {
      if (!testContributionId) {
        fail('テスト用のcontributionIdが設定されていません');
        return;
      }

      const updateData = {
        title: '他のユーザーによる更新'
      };

      const response = await request(app)
        .put(`/api/v1/team/contributions/${testContributionId}`)
        .set('Authorization', `Bearer ${adminAuthToken}`) // 管理者でも他のユーザーの貢献は更新不可
        .send(updateData);

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/v1/team/contributions/:id', () => {
    it('認証されたユーザーが自分の貢献を削除できること', async () => {
      if (!testContributionId) {
        fail('テスト用のcontributionIdが設定されていません');
        return;
      }

      const response = await request(app)
        .delete(`/api/v1/team/contributions/${testContributionId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('削除済みの貢献にアクセスするとエラーになること', async () => {
      if (!testContributionId) {
        fail('テスト用のcontributionIdが設定されていません');
        return;
      }

      const response = await request(app)
        .get(`/api/v1/team/contributions/${testContributionId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/v1/team/mentorships', () => {
    it('認証されたユーザーがメンターシップ一覧を取得できること', async () => {
      const response = await request(app)
        .get('/api/v1/team/mentorships')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/v1/team/mentorships', () => {
    it('認証されたユーザーが新しいメンターシップを作成できること', async () => {
      const mentorshipData = {
        mentorId: regularUserId,
        menteeId: adminUserId,
        startDate: new Date().toISOString().split('T')[0],
        focus: 'カットテクニック',
        status: 'active'
      };

      const response = await request(app)
        .post('/api/v1/team/mentorships')
        .set('Authorization', `Bearer ${authToken}`)
        .send(mentorshipData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('mentorId', regularUserId);
      expect(response.body).toHaveProperty('menteeId', adminUserId);
      
      // 後続のテストで使用するためにIDを保存
      testMentorshipId = response.body.id;
    });

    it('必須フィールドが欠けているとエラーになること', async () => {
      const invalidData = {
        // mentorId が欠けている
        menteeId: adminUserId,
        // startDate が欠けている
        focus: 'カットテクニック'
      };

      const response = await request(app)
        .post('/api/v1/team/mentorships')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/v1/team/mentorships/user/:userId', () => {
    it('認証されたユーザーが自分のメンターシップ一覧を取得できること', async () => {
      const response = await request(app)
        .get(`/api/v1/team/mentorships/user/${regularUserId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // 自分のメンターシップが含まれていることを確認
      if (response.body.length > 0) {
        const hasMentorship = response.body.some((mentorship: any) => 
          mentorship.mentorId === regularUserId || mentorship.menteeId === regularUserId
        );
        expect(hasMentorship).toBe(true);
      }
    });
  });

  describe('PUT /api/v1/team/mentorships/:id', () => {
    it('メンターシップの関係者がメンターシップを更新できること', async () => {
      if (!testMentorshipId) {
        fail('テスト用のmentorshipIdが設定されていません');
        return;
      }

      const updateData = {
        focus: '更新されたフォーカス',
        status: 'completed'
      };

      const response = await request(app)
        .put(`/api/v1/team/mentorships/${testMentorshipId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('focus', updateData.focus);
      expect(response.body).toHaveProperty('status', updateData.status);
    });
  });

  describe('POST /api/v1/team/mentorships/:id/sessions', () => {
    it('メンターシップの関係者がセッションを追加できること', async () => {
      if (!testMentorshipId) {
        fail('テスト用のmentorshipIdが設定されていません');
        return;
      }

      const sessionData = {
        date: new Date().toISOString().split('T')[0],
        notes: 'レイヤーカットの基本練習',
        rating: 4
      };

      const response = await request(app)
        .post(`/api/v1/team/mentorships/${testMentorshipId}/sessions`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(sessionData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('sessions');
      expect(response.body.sessions.length).toBeGreaterThan(0);
      
      // 追加したセッションが含まれていることを確認
      const lastSession = response.body.sessions[response.body.sessions.length - 1];
      expect(lastSession).toHaveProperty('date', sessionData.date);
      expect(lastSession).toHaveProperty('notes', sessionData.notes);
    });

    it('日付がないセッションを追加しようとするとエラーになること', async () => {
      if (!testMentorshipId) {
        fail('テスト用のmentorshipIdが設定されていません');
        return;
      }

      const invalidSessionData = {
        // date が欠けている
        notes: 'メモのみ',
        rating: 3
      };

      const response = await request(app)
        .post(`/api/v1/team/mentorships/${testMentorshipId}/sessions`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidSessionData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/v1/team/compatibility', () => {
    it('認証されたユーザーがチーム相性情報を取得できること', async () => {
      const response = await request(app)
        .get('/api/v1/team/compatibility')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('teamElementDistribution');
      expect(response.body).toHaveProperty('compatibilityMatrix');
      expect(response.body).toHaveProperty('teamBalance');
    });

    it('認証なしでアクセスするとエラーになること', async () => {
      const response = await request(app)
        .get('/api/v1/team/compatibility');

      expect(response.status).toBe(401);
    });
  });
});