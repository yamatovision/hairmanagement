/**
 * テストモードミドルウェア
 * テスト環境でのAPIテスト実行をサポートするためのミドルウェア
 */

import { Request, Response, NextFunction } from 'express';
import { ElementType, YinYangType } from '@shared';

/**
 * テストモード用ミドルウェア
 * テスト環境でのAPI実行をサポート
 */
export const testModeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // テスト環境またはテストモードヘッダーが設定されているか確認
  const isTestMode = process.env.NODE_ENV === 'test' || req.headers['x-test-mode'] === 'true';
  
  if (isTestMode) {
    console.log('テストモードが有効です。モックサービスを設定します。');
    
    // モックサービスの設定
    if (!req.services) {
      req.services = {
        // ユーザーサービスのモック
        user: {
          getUserById: async (userId: string) => {
            return {
              id: userId,
              email: 'test@example.com',
              name: 'テストユーザー',
              birthDate: '1990-01-01',
              role: 'admin',
              elementalType: {
                mainElement: '水' as ElementType,
                secondaryElement: '木' as ElementType,
                yinYang: '陽' as YinYangType
              }
            };
          }
        },
        
        // チームサービスのモック
        team: {
          getTeamMembers: async (userId: string) => {
            return [
              {
                id: 'test-member-1',
                name: 'チームメンバー1',
                elementalType: {
                  mainElement: '木' as ElementType,
                  secondaryElement: '火' as ElementType,
                  yinYang: '陽' as YinYangType
                }
              },
              {
                id: 'test-member-2',
                name: 'チームメンバー2',
                elementalType: {
                  mainElement: '水' as ElementType,
                  secondaryElement: '金' as ElementType,
                  yinYang: '陰' as YinYangType
                }
              },
              {
                id: 'test-member-3',
                name: 'チームメンバー3',
                elementalType: {
                  mainElement: '火' as ElementType,
                  secondaryElement: '土' as ElementType,
                  yinYang: '陽' as YinYangType
                }
              }
            ];
          }
        }
      };
    }
  }
  
  next();
};