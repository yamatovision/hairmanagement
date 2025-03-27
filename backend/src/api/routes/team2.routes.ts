/**
 * チームルート
 * チーム関連のAPIルートを定義
 * 
 * 変更履歴:
 * - 2025/03/27: 初期実装 (Claude)
 */

import express from 'express';
import { Team2Controller } from '../controllers/team2.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';

const router = express.Router();

// 認証が必要なルート
router.use(authMiddleware.authenticate);

// チーム管理ルート
router.post('/', roleMiddleware.checkRole(['admin', 'superadmin']), Team2Controller.createTeam);
router.get('/', Team2Controller.getAllTeams);
router.get('/:teamId', roleMiddleware.requireTeamMember('teamId'), Team2Controller.getTeam);
router.put('/:teamId', roleMiddleware.requireTeamAdminOrSuperAdmin('teamId'), Team2Controller.updateTeam);
router.delete('/:teamId', roleMiddleware.requireTeamOwnerOrSuperAdmin('teamId'), Team2Controller.deleteTeam);

// チームメンバー管理ルート
router.post('/:teamId/members', roleMiddleware.requireTeamAdminOrSuperAdmin('teamId'), Team2Controller.addTeamMember);
router.delete('/:teamId/members/:userId', roleMiddleware.requireTeamAdminOrSuperAdmin('teamId'), Team2Controller.removeTeamMember);

// チーム招待ルート
router.post('/invitations', roleMiddleware.checkRole(['admin', 'superadmin']), Team2Controller.createInvitation);
router.get('/:teamId/invitations', roleMiddleware.requireTeamAdminOrSuperAdmin('teamId'), Team2Controller.getTeamInvitations);
router.get('/invitations/:token', Team2Controller.getInvitationByToken);
router.post('/invitations/:token/accept', Team2Controller.acceptInvitation);
router.post('/invitations/:token/decline', Team2Controller.declineInvitation);
router.delete('/invitations/:invitationId', roleMiddleware.checkRole(['admin', 'superadmin']), Team2Controller.cancelInvitation);
router.post('/invitations/:invitationId/resend', roleMiddleware.checkRole(['admin', 'superadmin']), Team2Controller.resendInvitation);

export default router;