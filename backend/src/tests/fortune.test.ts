/**
 * 運勢APIのテストスイート
 * 
 * 運勢関連のエンドポイントをテストし、機能が正しく動作することを確認します。
 * 
 * 変更履歴:
 * - 2025/03/26: 初期実装 (AppGenius)
 */

import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app from '../index';
import * as authHelper from './helpers/auth.helper';
import Fortune from '../models/fortune.model';
import User from '../models/user.model';
import { FortuneService } from '../services/fortune.service';

describe('Fortune API Tests', () => {
  let authToken: string;
  let adminAuthToken: string;
  let regularUserId: string;
  let adminUserId: string;
  let testFortune: any;

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
    
    // テストデータのセットアップ
    await createTestFortune();
  });

  // テスト後のクリーンアップ
  afterAll(async () => {
    // テストで作成したデータを削除
    await cleanupTestData();
    
    // テストユーザーの削除
    await User.deleteMany({ email: { $in: ['employee@example.com', 'admin@example.com'] } });
    
    // MongoDB接続を閉じる
    await mongoose.connection.close();
  });

  // テスト用の運勢データを作成
  async function createTestFortune() {
    // ユーザー情報を取得してテスト用の運勢データを作成
    const user = await User.findById(regularUserId);
    
    if (user && user.birthDate) {
      // テスト用の運勢データ
      const today = new Date().toISOString().split('T')[0];
      testFortune = await FortuneService.getFortuneByDate(regularUserId, user.birthDate, today);
    }
  }

  // テストデータのクリーンアップ
  async function cleanupTestData() {
    // テストで作成したフォーチューンデータを削除
    if (testFortune) {
      await Fortune.deleteOne({ _id: testFortune.id });
    }
  }

  describe('GET /api/v1/fortune/daily', () => {
    it('認証されたユーザーが当日の運勢を取得できること', async () => {
      const response = await request(app)
        .get('/api/v1/fortune/daily')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('date');
      expect(response.body).toHaveProperty('dailyElement');
      expect(response.body).toHaveProperty('yinYang');
      expect(response.body).toHaveProperty('overallLuck');
    });

    it('認証なしでアクセスするとエラーになること', async () => {
      const response = await request(app)
        .get('/api/v1/fortune/daily');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/fortune/date/:date', () => {
    it('認証されたユーザーが指定日の運勢を取得できること', async () => {
      const date = new Date();
      date.setDate(date.getDate() + 1); // 明日の日付
      const formattedDate = date.toISOString().split('T')[0];

      const response = await request(app)
        .get(`/api/v1/fortune/date/${formattedDate}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('date', formattedDate);
      expect(response.body).toHaveProperty('dailyElement');
      expect(response.body).toHaveProperty('yinYang');
    });

    it('無効な日付形式を指定するとエラーになること', async () => {
      const invalidDate = '2025/03/26'; // YYYY/MM/DD形式（無効）

      const response = await request(app)
        .get(`/api/v1/fortune/date/${invalidDate}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/v1/fortune/range', () => {
    it('認証されたユーザーが日付範囲の運勢を取得できること', async () => {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 1); // 昨日
      
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + 1); // 明日
      
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];

      const response = await request(app)
        .get(`/api/v1/fortune/range?startDate=${formattedStartDate}&endDate=${formattedEndDate}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
      expect(response.body[0]).toHaveProperty('date');
      expect(response.body[0]).toHaveProperty('dailyElement');
    });

    it('日付範囲を指定しない場合エラーになること', async () => {
      const response = await request(app)
        .get('/api/v1/fortune/range')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/v1/fortune/weekly', () => {
    it('認証されたユーザーが週間運勢を取得できること', async () => {
      const response = await request(app)
        .get('/api/v1/fortune/weekly')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(7); // デフォルトでは7日間
      expect(response.body[0]).toHaveProperty('date');
      expect(response.body[0]).toHaveProperty('dailyElement');
    });

    it('日数を指定して週間運勢を取得できること', async () => {
      const days = 5;
      
      const response = await request(app)
        .get(`/api/v1/fortune/weekly?days=${days}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(days);
    });
  });

  describe('POST /api/v1/fortune/:fortuneId/viewed', () => {
    it('認証されたユーザーが運勢を閲覧済みとしてマークできること', async () => {
      if (!testFortune) {
        fail('テスト用のフォーチューンデータがセットアップされていません');
        return;
      }

      const response = await request(app)
        .post(`/api/v1/fortune/${testFortune.id}/viewed`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('fortune');
      expect(response.body.fortune).toHaveProperty('viewedAt');
    });

    it('存在しない運勢IDを指定するとエラーになること', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .post(`/api/v1/fortune/${nonExistentId}/viewed`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/v1/fortune/today-element', () => {
    it('今日の五行属性と陰陽を取得できること', async () => {
      const response = await request(app)
        .get('/api/v1/fortune/today-element');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('element');
      expect(response.body).toHaveProperty('yinYang');
      
      // 五行属性の検証
      const validElements = ['木', '火', '土', '金', '水'];
      expect(validElements).toContain(response.body.element);
      
      // 陰陽の検証
      const validYinYang = ['陰', '陽'];
      expect(validYinYang).toContain(response.body.yinYang);
    });
  });

  describe('GET /api/v1/fortune/users/:userId/daily', () => {
    it('管理者が他のユーザーの当日の運勢を取得できること', async () => {
      const response = await request(app)
        .get(`/api/v1/fortune/users/${regularUserId}/daily`)
        .set('Authorization', `Bearer ${adminAuthToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('userId', regularUserId);
      expect(response.body).toHaveProperty('date');
      expect(response.body).toHaveProperty('dailyElement');
    });

    it('一般ユーザーが他のユーザーの運勢にアクセスするとエラーになること', async () => {
      const response = await request(app)
        .get(`/api/v1/fortune/users/${adminUserId}/daily`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/v1/fortune/users/:userId/date/:date', () => {
    it('管理者が他のユーザーの指定日の運勢を取得できること', async () => {
      const today = new Date().toISOString().split('T')[0];

      const response = await request(app)
        .get(`/api/v1/fortune/users/${regularUserId}/date/${today}`)
        .set('Authorization', `Bearer ${adminAuthToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('userId', regularUserId);
      expect(response.body).toHaveProperty('date', today);
      expect(response.body).toHaveProperty('dailyElement');
    });

    it('一般ユーザーが他のユーザーの指定日の運勢にアクセスするとエラーになること', async () => {
      const today = new Date().toISOString().split('T')[0];

      const response = await request(app)
        .get(`/api/v1/fortune/users/${adminUserId}/date/${today}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/v1/fortune/team-compatibility', () => {
    it('認証されたユーザーがチーム相性を取得できること', async () => {
      const response = await request(app)
        .get('/api/v1/fortune/team-compatibility')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('teamElementDistribution');
      expect(response.body).toHaveProperty('compatibilityMatrix');
      expect(response.body).toHaveProperty('teamBalance');
    });

    it('認証なしでアクセスするとエラーになること', async () => {
      const response = await request(app)
        .get('/api/v1/fortune/team-compatibility');

      expect(response.status).toBe(401);
    });
  });
});