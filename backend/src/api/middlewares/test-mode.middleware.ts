/**
 * テストモードミドルウェア
 * テスト環境でのAPIテスト実行をサポートするためのミドルウェア
 */

import { Request, Response, NextFunction } from 'express';
import { ElementType, YinYangType } from '@shared';

/**
 * テストモード用ミドルウェア
 * 本番環境では利用しない
 */
export const testModeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // 本番環境ではテストモードを使用しない
  next();
};