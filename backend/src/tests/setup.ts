/**
 * Jestテスト設定ファイル
 * 
 * テスト実行前の共通セットアップを行います
 * 
 * 変更履歴:
 * - 2025/03/26: 初期実装 (AppGenius)
 */

// タイムアウトを延長（ネットワークリクエストなどがある場合）
jest.setTimeout(30000);

// モックのクリーンアップを確認
beforeEach(() => {
  jest.resetAllMocks();
});

// 型拡張：Expressリクエストにservicesプロパティを追加
// この型定義はエクスポートして使用（グローバル宣言を避ける）
export interface Services {
  user: {
    getUserById: (userId: string) => Promise<any>;
  };
  team: {
    getTeamMembers: (userId: string) => Promise<any[]>;
  };
}

// リクエストオブジェクトにサービスをモック
// これはコントローラーがサービスを使用するときに必要
beforeEach(() => {
  // テスト用のExpress.Requestサービスモック拡張
  const mockUserService = {
    getUserById: jest.fn().mockImplementation(async (userId: string) => {
      return {
        _id: userId,
        name: 'Test User',
        email: 'test@example.com',
        birthDate: '1990-01-01',
        elementalType: {
          mainElement: '木',
          secondaryElement: '火',
          yin: true
        }
      };
    })
  };

  const mockTeamService = {
    getTeamMembers: jest.fn().mockImplementation(async (userId: string) => {
      return [
        {
          id: '5f8f8c9d8a7b6a5e4d3c2b1a',
          name: 'Team Member 1',
          elementalType: {
            mainElement: '水',
            yin: false
          }
        },
        {
          id: '5f8f8c9d8a7b6a5e4d3c2b1b',
          name: 'Team Member 2',
          elementalType: {
            mainElement: '火',
            yin: true
          }
        }
      ];
    })
  };

  // Express.Requestにサービスを注入するミドルウェアをモック
  const originalApp = require('../index').default;
  originalApp.use((req: any, res: any, next: any) => {
    req.services = {
      user: mockUserService,
      team: mockTeamService
    };
    next();
  });
});