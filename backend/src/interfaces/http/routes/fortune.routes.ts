import { Router } from 'express';
import { container } from 'tsyringe';
import { FortuneController } from '../controllers/fortune.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';

/**
 * 運勢関連のルート登録
 * @param router Expressルーター
 */
export const registerFortuneRoutes = (router: Router): void => {
  const fortuneController = container.resolve(FortuneController);
  const authMiddleware = container.resolve(AuthMiddleware);
  
  // ミドルウェアを取得
  const auth = authMiddleware.handle();
  
  // デバッグ用のエンドポイント - 認証不要
  router.get('/fortune/debug', (req, res) => {
    res.status(200).json({
      message: '運勢APIは正常に動作しています',
      timestamp: new Date().toISOString(),
      authMiddleware: 'バイパス（デバッグモード）',
      routeInfo: {
        path: '/fortune/debug',
        method: 'GET',
        requiresAuth: false
      },
      routeStatus: '正常'
    });
  });
  
  // ユーザー認証が必要なエンドポイント
  router.get('/fortune/daily', auth, (req, res) => 
    fortuneController.getDailyFortune(req, res)
  );
  
  router.get('/fortune/date/:date([0-9]{4}-[0-9]{2}-[0-9]{2})', auth, (req, res) => 
    fortuneController.getFortuneByDate(req, res)
  );
  
  router.get('/fortune/range', auth, (req, res) => 
    fortuneController.getFortuneRange(req, res)
  );
  
  router.get('/fortune/team-compatibility', auth, (req, res) => 
    fortuneController.getTeamCompatibility(req, res)
  );
  
  // 四柱推命情報を取得するエンドポイント
  router.get('/fortune/saju', auth, (req, res) => 
    fortuneController.getSajuInfo(req, res)
  );
  
  // 運勢閲覧済みマーク機能は削除しました
};