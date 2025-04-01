/**
 * チームコントローラー
 * チーム関連のリクエストを処理する
 * 
 * 変更履歴:
 * - 2025/03/26: 初期実装 (AppGenius)
 */

import { Request, Response } from 'express';
import { FortuneService } from '../../services/fortune.service';
import { TeamService } from '../../services/team.service';
import User from '../../models/user.model';
import mongoose from 'mongoose';

/**
 * チームコントローラークラス
 * チーム関連のすべてのエンドポイント処理を提供
 */
export class TeamController {
  /**
   * チーム貢献一覧を取得
   * @param req リクエスト
   * @param res レスポンス
   */
  static async getTeamContributions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id || req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: '認証が必要です' });
        return;
      }
      
      // チーム貢献を取得
      const contributions = await TeamService.getTeamContributions();
      
      res.status(200).json(contributions);
    } catch (error) {
      console.error('チーム貢献取得エラー:', error);
      res.status(500).json({ message: 'チーム貢献の取得中にエラーが発生しました' });
    }
  }
  
  /**
   * 特定のチーム貢献を取得
   * @param req リクエスト
   * @param res レスポンス
   */
  static async getContributionById(req: Request, res: Response): Promise<void> {
    try {
      const contributionId = req.params.id;
      const userId = req.user?._id || req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: '認証が必要です' });
        return;
      }
      
      // 貢献を取得
      const contribution = await TeamService.getContributionById(contributionId);
      
      if (!contribution) {
        res.status(404).json({ message: '貢献が見つかりません' });
        return;
      }
      
      res.status(200).json(contribution);
    } catch (error) {
      console.error('チーム貢献取得エラー:', error);
      res.status(500).json({ message: 'チーム貢献の取得中にエラーが発生しました' });
    }
  }
  
  /**
   * メンターシップ一覧を取得
   * @param req リクエスト
   * @param res レスポンス
   */
  static async getMentorships(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id || req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: '認証が必要です' });
        return;
      }
      
      // メンターシップを取得
      const mentorships = await TeamService.getMentorships();
      
      res.status(200).json(mentorships);
    } catch (error) {
      console.error('メンターシップ取得エラー:', error);
      res.status(500).json({ message: 'メンターシップの取得中にエラーが発生しました' });
    }
  }
  
  /**
   * 特定のメンターシップを取得
   * @param req リクエスト
   * @param res レスポンス
   */
  static async getMentorshipById(req: Request, res: Response): Promise<void> {
    try {
      const mentorshipId = req.params.id;
      const userId = req.user?._id || req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: '認証が必要です' });
        return;
      }
      
      // メンターシップを取得
      const mentorship = await TeamService.getMentorshipById(mentorshipId);
      
      if (!mentorship) {
        res.status(404).json({ message: 'メンターシップが見つかりません' });
        return;
      }
      
      res.status(200).json(mentorship);
    } catch (error) {
      console.error('メンターシップ取得エラー:', error);
      res.status(500).json({ message: 'メンターシップの取得中にエラーが発生しました' });
    }
  }
  /**
   * チームメンバー間の相性を取得
   * @param req リクエスト
   * @param res レスポンス
   */
  static async getTeamCompatibility(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id || req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: '認証が必要です' });
        return;
      }
      
      // チームメンバー（所属サロンの全ユーザー）を取得
      // 実際の実装では、ユーザーの所属サロンに基づいてフィルタリングする必要があります
      const teamMembers = await User.find(
        { isActive: true },
        { _id: 1, name: 1, elementalType: 1 }
      );
      
      // チームメンバーの陰陽五行情報を抽出
      const teamElementalInfo = teamMembers.map(member => ({
        id: member._id.toString(),
        name: member.name,
        mainElement: member.elementalType?.mainElement || '木',
        secondaryElement: member.elementalType?.secondaryElement,
        yinYang: member.elementalType?.yinYang || '陰'
      }));
      
      // チーム内の陰陽五行バランスと相性を分析
      const teamDynamics = FortuneService.analyzeTeamDynamics(teamElementalInfo);
      
      res.status(200).json(teamDynamics);
    } catch (error) {
      console.error('チーム相性取得エラー:', error);
      res.status(500).json({ message: 'チーム相性の取得中にエラーが発生しました' });
    }
  }

  /**
   * チーム貢献を追加
   * @param req リクエスト
   * @param res レスポンス
   */
  static async addContribution(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id || req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: '認証が必要です' });
        return;
      }
      
      const contributionData = req.body;
      
      // 必須フィールドの検証
      if (!contributionData.title || !contributionData.description || !contributionData.date || !contributionData.category) {
        res.status(400).json({ message: 'タイトル、説明、日付、カテゴリーは必須項目です' });
        return;
      }
      
      // チーム貢献をデータベースに追加
      const contribution = await TeamService.addContribution({
        ...contributionData,
        userId: new mongoose.Types.ObjectId(userId)
      });
      
      res.status(201).json(contribution);
    } catch (error) {
      console.error('チーム貢献追加エラー:', error);
      res.status(500).json({ message: 'チーム貢献の追加中にエラーが発生しました' });
    }
  }

  /**
   * ユーザーのチーム貢献を取得
   * @param req リクエスト
   * @param res レスポンス
   */
  static async getUserContributions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId || req.user?._id || req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: '認証が必要です' });
        return;
      }
      
      // リクエストパラメータからフィルタ条件を取得
      const { startDate, endDate, category } = req.query;
      
      // フィルタリング条件を構築
      const filter: any = { userId: new mongoose.Types.ObjectId(userId) };
      
      if (startDate && endDate) {
        filter.date = { $gte: startDate, $lte: endDate };
      } else if (startDate) {
        filter.date = { $gte: startDate };
      } else if (endDate) {
        filter.date = { $lte: endDate };
      }
      
      if (category) {
        filter.category = category;
      }
      
      // ユーザーの貢献を取得
      const contributions = await TeamService.getUserContributions(filter);
      
      res.status(200).json(contributions);
    } catch (error) {
      console.error('ユーザーのチーム貢献取得エラー:', error);
      res.status(500).json({ message: 'チーム貢献の取得中にエラーが発生しました' });
    }
  }

  /**
   * チーム貢献を更新
   * @param req リクエスト
   * @param res レスポンス
   */
  static async updateContribution(req: Request, res: Response): Promise<void> {
    try {
      const contributionId = req.params.id;
      const userId = req.user?._id || req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: '認証が必要です' });
        return;
      }
      
      const updateData = req.body;
      
      // 貢献を更新
      const updatedContribution = await TeamService.updateContribution(
        contributionId,
        userId,
        updateData
      );
      
      if (!updatedContribution) {
        res.status(404).json({ message: '貢献が見つからないか、更新する権限がありません' });
        return;
      }
      
      res.status(200).json(updatedContribution);
    } catch (error) {
      console.error('チーム貢献更新エラー:', error);
      res.status(500).json({ message: 'チーム貢献の更新中にエラーが発生しました' });
    }
  }

  /**
   * チーム貢献を削除
   * @param req リクエスト
   * @param res レスポンス
   */
  static async deleteContribution(req: Request, res: Response): Promise<void> {
    try {
      const contributionId = req.params.id;
      const userId = req.user?._id || req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: '認証が必要です' });
        return;
      }
      
      // 貢献を削除
      const result = await TeamService.deleteContribution(contributionId, userId);
      
      if (!result) {
        res.status(404).json({ message: '貢献が見つからないか、削除する権限がありません' });
        return;
      }
      
      res.status(200).json({ message: '貢献が正常に削除されました' });
    } catch (error) {
      console.error('チーム貢献削除エラー:', error);
      res.status(500).json({ message: 'チーム貢献の削除中にエラーが発生しました' });
    }
  }

  /**
   * メンターシップを作成
   * @param req リクエスト
   * @param res レスポンス
   */
  static async createMentorship(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?._id || req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: '認証が必要です' });
        return;
      }
      
      const mentorshipData = req.body;
      
      // 必須フィールドの検証
      if (!mentorshipData.mentorId || !mentorshipData.menteeId || !mentorshipData.startDate || !mentorshipData.focus) {
        res.status(400).json({ message: 'メンター、メンティー、開始日、フォーカスは必須項目です' });
        return;
      }
      
      // メンターシップをデータベースに追加
      const mentorship = await TeamService.createMentorship(mentorshipData);
      
      res.status(201).json(mentorship);
    } catch (error) {
      console.error('メンターシップ作成エラー:', error);
      res.status(500).json({ message: 'メンターシップの作成中にエラーが発生しました' });
    }
  }

  /**
   * ユーザーのメンターシップを取得
   * @param req リクエスト
   * @param res レスポンス
   */
  static async getUserMentorships(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId || req.user?._id || req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: '認証が必要です' });
        return;
      }
      
      // ステータスでフィルタリング
      const status = req.query.status as string | undefined;
      
      // ユーザーのメンターシップを取得（メンターとメンティーの両方の役割）
      const mentorships = await TeamService.getUserMentorships(userId, status);
      
      res.status(200).json(mentorships);
    } catch (error) {
      console.error('ユーザーのメンターシップ取得エラー:', error);
      res.status(500).json({ message: 'メンターシップの取得中にエラーが発生しました' });
    }
  }

  /**
   * メンターシップを更新
   * @param req リクエスト
   * @param res レスポンス
   */
  static async updateMentorship(req: Request, res: Response): Promise<void> {
    try {
      const mentorshipId = req.params.id;
      const userId = req.user?._id || req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: '認証が必要です' });
        return;
      }
      
      const updateData = req.body;
      
      // メンターシップを更新
      const updatedMentorship = await TeamService.updateMentorship(
        mentorshipId,
        userId,
        updateData
      );
      
      if (!updatedMentorship) {
        res.status(404).json({ message: 'メンターシップが見つからないか、更新する権限がありません' });
        return;
      }
      
      res.status(200).json(updatedMentorship);
    } catch (error) {
      console.error('メンターシップ更新エラー:', error);
      res.status(500).json({ message: 'メンターシップの更新中にエラーが発生しました' });
    }
  }

  /**
   * メンターシップにセッションを追加
   * @param req リクエスト
   * @param res レスポンス
   */
  static async addMentorshipSession(req: Request, res: Response): Promise<void> {
    try {
      const mentorshipId = req.params.id;
      const userId = req.user?._id || req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: '認証が必要です' });
        return;
      }
      
      const sessionData = req.body;
      
      // 必須フィールドの検証
      if (!sessionData.date) {
        res.status(400).json({ message: '日付は必須項目です' });
        return;
      }
      
      // セッションを追加
      const updatedMentorship = await TeamService.addMentorshipSession(
        mentorshipId,
        userId,
        sessionData
      );
      
      if (!updatedMentorship) {
        res.status(404).json({ message: 'メンターシップが見つからないか、更新する権限がありません' });
        return;
      }
      
      res.status(200).json(updatedMentorship);
    } catch (error) {
      console.error('メンターシップセッション追加エラー:', error);
      res.status(500).json({ message: 'メンターシップセッションの追加中にエラーが発生しました' });
    }
  }
}