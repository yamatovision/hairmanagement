/**
 * チームルート
 * 
 * チーム関連のAPIエンドポイント定義
 * 
 * 変更履歴:
 * - 2025/04/02: 初期実装 (Claude)
 */

import { Router } from 'express';
import container from '../../../infrastructure/di/container';
import { TeamController } from '../controllers/team.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';

/**
 * チームルートを登録
 * @param router Expressルーター
 */
export const registerTeamRoutes = (router: Router): void => {
  // TeamControllerはここで作成せず、各ルート登録時に取得
  // クリーンな依存性注入を維持するため
  
  const authMiddleware = container.resolve(AuthMiddleware);

  // チーム関連のエンドポイント
  router.get('/teams', authMiddleware.handle(), (req, res, next) => {
    const teamController = container.resolve(TeamController);
    return teamController.getUserTeams(req, res, next);
  });
  
  router.get('/teams/:teamId', authMiddleware.handle(), (req, res, next) => {
    const teamController = container.resolve(TeamController);
    return teamController.getTeam(req, res, next);
  });
  
  router.post('/teams', authMiddleware.handle(), (req, res, next) => {
    const teamController = container.resolve(TeamController);
    return teamController.createTeam(req, res, next);
  });
  
  router.put('/teams/:teamId', authMiddleware.handle(), (req, res, next) => {
    const teamController = container.resolve(TeamController);
    return teamController.updateTeam(req, res, next);
  });
  
  router.delete('/teams/:teamId', authMiddleware.handle(), (req, res, next) => {
    const teamController = container.resolve(TeamController);
    return teamController.deleteTeam(req, res, next);
  });
  
  router.post('/teams/:teamId/members', authMiddleware.handle(), (req, res, next) => {
    const teamController = container.resolve(TeamController);
    return teamController.addMember(req, res, next);
  });
  
  router.delete('/teams/:teamId/members/:memberId', authMiddleware.handle(), (req, res, next) => {
    const teamController = container.resolve(TeamController);
    return teamController.removeMember(req, res, next);
  });
  
  router.put('/teams/:teamId/members/:memberId/role', authMiddleware.handle(), (req, res, next) => {
    const teamController = container.resolve(TeamController);
    return teamController.updateMemberRole(req, res, next);
  });
  
  router.get('/teams/:teamId/compatibility', authMiddleware.handle(), (req, res, next) => {
    const teamController = container.resolve(TeamController);
    return teamController.getTeamCompatibility(req, res, next);
  });
  
  router.post('/teams/:teamId/invite', authMiddleware.handle(), (req, res, next) => {
    const teamController = container.resolve(TeamController);
    return teamController.inviteMember(req, res, next);
  });
};

// 後方互換性のために残す従来のルート定義
const router = Router();
const authMiddleware = container.resolve(AuthMiddleware).handle();

/**
 * @route GET /api/teams
 * @desc ユーザーが所属するチーム一覧を取得
 * @access Private
 */
router.get('/', 
  authMiddleware,
  (req, res, next) => {
    const teamController = container.resolve(TeamController);
    return teamController.getUserTeams(req, res, next);
  }
);

/**
 * @route GET /api/teams/:teamId
 * @desc チーム詳細を取得
 * @access Private
 */
router.get('/:teamId', 
  authMiddleware,
  (req, res, next) => {
    const teamController = container.resolve(TeamController);
    return teamController.getTeam(req, res, next);
  }
);

/**
 * @route POST /api/teams
 * @desc 新しいチームを作成
 * @access Private
 */
router.post('/', 
  authMiddleware,
  (req, res, next) => {
    const teamController = container.resolve(TeamController);
    return teamController.createTeam(req, res, next);
  }
);

/**
 * @route PUT /api/teams/:teamId
 * @desc チーム情報を更新
 * @access Private
 */
router.put('/:teamId', 
  authMiddleware,
  (req, res, next) => {
    const teamController = container.resolve(TeamController);
    return teamController.updateTeam(req, res, next);
  }
);

/**
 * @route DELETE /api/teams/:teamId
 * @desc チームを削除
 * @access Private
 */
router.delete('/:teamId', 
  authMiddleware,
  (req, res, next) => {
    const teamController = container.resolve(TeamController);
    return teamController.deleteTeam(req, res, next);
  }
);

/**
 * @route POST /api/teams/:teamId/members
 * @desc チームにメンバーを追加
 * @access Private
 */
router.post('/:teamId/members', 
  authMiddleware,
  (req, res, next) => {
    const teamController = container.resolve(TeamController);
    return teamController.addMember(req, res, next);
  }
);

/**
 * @route DELETE /api/teams/:teamId/members/:memberId
 * @desc チームからメンバーを削除
 * @access Private
 */
router.delete('/:teamId/members/:memberId', 
  authMiddleware,
  (req, res, next) => {
    const teamController = container.resolve(TeamController);
    return teamController.removeMember(req, res, next);
  }
);

/**
 * @route PUT /api/teams/:teamId/members/:memberId/role
 * @desc メンバーの役割を更新
 * @access Private
 */
router.put('/:teamId/members/:memberId/role', 
  authMiddleware,
  (req, res, next) => {
    const teamController = container.resolve(TeamController);
    return teamController.updateMemberRole(req, res, next);
  }
);

/**
 * @route GET /api/teams/:teamId/compatibility
 * @desc チームメンバー間の相性を分析
 * @access Private
 */
router.get('/:teamId/compatibility', 
  authMiddleware,
  (req, res, next) => {
    const teamController = container.resolve(TeamController);
    return teamController.getTeamCompatibility(req, res, next);
  }
);

/**
 * @route POST /api/teams/:teamId/invite
 * @desc メンバー招待を送信
 * @access Private
 */
router.post('/:teamId/invite', 
  authMiddleware,
  (req, res, next) => {
    const teamController = container.resolve(TeamController);
    return teamController.inviteMember(req, res, next);
  }
);

export default router;