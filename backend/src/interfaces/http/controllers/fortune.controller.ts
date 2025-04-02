import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { IFortuneRepository } from '../../../domain/repositories/IFortuneRepository';
import { ElementalCalculatorService } from '../../../application/services/elemental-calculator.service';
import { SajuCalculatorService } from '../../../application/services/saju-calculator.service';
import { ElementType, YinYangType } from '../../../shared';
import { SajuFortune } from '../../../shared/utils/saju-types';

/**
 * 運勢コントローラー
 * 運勢関連のHTTPリクエストを処理する
 */
@injectable()
export class FortuneController {
  /**
   * コンストラクタ
   * @param fortuneRepository 運勢リポジトリ
   * @param elementalCalculatorService 元素計算サービス
   * @param sajuCalculatorService 四柱推命計算サービス
   */
  constructor(
    @inject('IFortuneRepository') private fortuneRepository: IFortuneRepository,
    @inject(ElementalCalculatorService) private elementalCalculatorService: ElementalCalculatorService,
    @inject(SajuCalculatorService) private sajuCalculatorService: SajuCalculatorService
  ) {}
  
  /**
   * 今日の運勢を取得
   * @param req リクエスト
   * @param res レスポンス
   */
  async getDailyFortune(req: Request, res: Response): Promise<void> {
    try {
      // ユーザーIDを取得（認証ミドルウェアから）
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: '認証が必要です' });
        return;
      }
      
      // デバッグ情報を出力
      console.log('[FortuneController] getDailyFortune リクエスト:', {
        userId,
        query: req.query,
        headers: req.headers['content-type'],
        auth: req.headers.authorization ? '設定済み' : '未設定'
      });
      
      // ユーザーの誕生日を取得（本来はユーザープロファイルから取得するが、簡略化のためリクエストから取得）
      let birthDate = req.query.birthDate as string;
      
      // birthDateが設定されていない場合はデフォルト値を使用
      if (!birthDate || typeof birthDate !== 'string') {
        console.log('[FortuneController] birthDateが未指定のため、デフォルト値を使用します');
        // デフォルト生年月日（1990-01-01）を設定
        birthDate = '1990-01-01';
      }

      if (!this.isValidDateFormat(birthDate)) {
        console.log('[FortuneController] 無効な日付形式:', birthDate);
        // 無効な日付形式の場合もデフォルト値を使用
        birthDate = '1990-01-01';
      }
      
      console.log('[FortuneController] 運勢計算用パラメータ:', { userId, birthDate });
      
      // サービスから今日の運勢を取得
      const fortune = await this.elementalCalculatorService.getDailyFortune(userId, birthDate);
      
      // 運勢データをAPIレスポンス形式に変換
      const response = this.formatFortuneResponse(fortune);
      
      // 四柱推命情報を追加（birthHourが指定されていれば使用、なければデフォルト12時）
      let birthHour = 12; // デフォルト値
      if (req.query.birthHour && !isNaN(Number(req.query.birthHour))) {
        birthHour = Number(req.query.birthHour);
      }
      
      // 四柱推命情報で運勢を拡張
      // 文字列から日付オブジェクトに変換
      const birthDateObj = new Date(birthDate);
      
      const enhancedFortune = await this.sajuCalculatorService.enhanceFortuneWithSaju(
        response,
        birthDateObj,
        birthHour
      );
      
      console.log('[FortuneController] 運勢生成成功:', { fortuneId: response.id });
      
      res.status(200).json(enhancedFortune);
    } catch (error: any) {
      console.error('[FortuneController] getDailyFortune エラー:', error);
      res.status(500).json({
        message: '運勢の取得中にエラーが発生しました',
        error: error.message
      });
    }
  }
  
  /**
   * 指定日の運勢を取得
   * @param req リクエスト
   * @param res レスポンス
   */
  async getFortuneByDate(req: Request, res: Response): Promise<void> {
    try {
      // ユーザーIDを取得（認証ミドルウェアから）
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: '認証が必要です' });
        return;
      }
      
      // デバッグ情報を出力
      console.log('[FortuneController] getFortuneByDate リクエスト:', {
        userId,
        params: req.params,
        query: req.query,
        headers: req.headers['content-type'],
        auth: req.headers.authorization ? '設定済み' : '未設定'
      });
      
      // URLパラメータから日付を取得
      const { date } = req.params;
      
      // 日付形式をチェック
      if (!this.isValidDateFormat(date)) {
        console.log('[FortuneController] 無効な日付形式:', date);
        res.status(400).json({ message: '無効な日付形式です。YYYY-MM-DD形式で指定してください。' });
        return;
      }

      // ユーザーの誕生日を取得（本来はユーザープロファイルから取得するが、簡略化のためリクエストから取得）
      let birthDate = req.query.birthDate as string;
      
      // birthDateが設定されていない場合はデフォルト値を使用
      if (!birthDate || typeof birthDate !== 'string') {
        console.log('[FortuneController] birthDateが未指定のため、デフォルト値を使用します');
        // デフォルト生年月日（1990-01-01）を設定
        birthDate = '1990-01-01';
      }

      if (!this.isValidDateFormat(birthDate)) {
        console.log('[FortuneController] 無効な日付形式:', birthDate);
        // 無効な日付形式の場合もデフォルト値を使用
        birthDate = '1990-01-01';
      }
      
      console.log('[FortuneController] 運勢計算用パラメータ:', { userId, birthDate, date });
      
      // サービスから指定日の運勢を取得
      const fortune = await this.elementalCalculatorService.getFortuneByDate(
        userId, 
        birthDate, 
        new Date(date)
      );
      
      // 運勢データをAPIレスポンス形式に変換
      const response = this.formatFortuneResponse(fortune);
      
      // 四柱推命情報を追加（birthHourが指定されていれば使用、なければデフォルト12時）
      let birthHour = 12; // デフォルト値
      if (req.query.birthHour && !isNaN(Number(req.query.birthHour))) {
        birthHour = Number(req.query.birthHour);
      }
      
      // 四柱推命情報で運勢を拡張
      // 文字列から日付オブジェクトに変換
      const birthDateObj = new Date(birthDate);
      
      const enhancedFortune = await this.sajuCalculatorService.enhanceFortuneWithSaju(
        response,
        birthDateObj,
        birthHour
      );
      
      console.log('[FortuneController] 運勢生成成功:', { fortuneId: response.id });
      
      res.status(200).json(enhancedFortune);
    } catch (error: any) {
      console.error('[FortuneController] getFortuneByDate エラー:', error);
      res.status(500).json({
        message: '運勢の取得中にエラーが発生しました',
        error: error.message
      });
    }
  }
  
  /**
   * 日付範囲の運勢を取得
   * @param req リクエスト
   * @param res レスポンス
   */
  async getFortuneRange(req: Request, res: Response): Promise<void> {
    try {
      console.log('[FortuneController] getFortuneRange 呼び出し, リクエスト:', {
        path: req.path,
        query: req.query,
        user: req.user,
        auth: req.headers.authorization ? '設定済み' : '未設定'
      });
      
      // ユーザーIDを取得（認証ミドルウェアから）
      const userId = req.user?.id;
      if (!userId) {
        console.log('[FortuneController] ユーザーID不明:', req.user);
        res.status(401).json({ message: '認証が必要です' });
        return;
      }
      
      // クエリパラメータから日付範囲を取得
      const { startDate, endDate, birthDate } = req.query;
      console.log('[FortuneController] 日付範囲パラメータ:', { startDate, endDate, birthDate });
      
      // パラメータのチェック
      if (!startDate || !endDate) {
        res.status(400).json({ message: '開始日（startDate）と終了日（endDate）は必須です。' });
        return;
      }

      if (!birthDate || typeof birthDate !== 'string') {
        res.status(400).json({ message: '生年月日（birthDate）は必須です。' });
        return;
      }
      
      // 日付形式をチェック
      if (!this.isValidDateFormat(startDate as string) || 
          !this.isValidDateFormat(endDate as string) || 
          !this.isValidDateFormat(birthDate)) {
        res.status(400).json({ message: '無効な日付形式です。YYYY-MM-DD形式で指定してください。' });
        return;
      }
      
      // サービスから日付範囲の運勢を取得
      const fortunes = await this.elementalCalculatorService.getFortuneRange(
        userId,
        birthDate,
        new Date(startDate as string),
        new Date(endDate as string)
      );
      
      // 運勢データをAPIレスポンス形式に変換
      const formattedFortunes = fortunes.map(fortune => this.formatFortuneResponse(fortune));
      
      // 四柱推命情報を追加（birthHourが指定されていれば使用、なければデフォルト12時）
      let birthHour = 12; // デフォルト値
      if (req.query.birthHour && !isNaN(Number(req.query.birthHour))) {
        birthHour = Number(req.query.birthHour);
      }
      
      // 文字列から日付オブジェクトに変換
      const birthDateObj = new Date(birthDate);
      
      // 各運勢に四柱推命情報を追加
      const enhancedFortunes = await Promise.all(formattedFortunes.map(fortune => 
        this.sajuCalculatorService.enhanceFortuneWithSaju(
          fortune,
          birthDateObj,
          birthHour
        )
      ));
      
      console.log('[FortuneController] 運勢生成成功:', enhancedFortunes.length);
      res.status(200).json(enhancedFortunes);
    } catch (error: any) {
      console.error('[FortuneController] エラー発生:', error);
      res.status(500).json({
        message: '運勢の取得中にエラーが発生しました',
        error: error.message
      });
    }
  }
  
  /**
   * チーム相性を取得
   * @param req リクエスト
   * @param res レスポンス
   */
  async getTeamCompatibility(req: Request, res: Response): Promise<void> {
    try {
      // ユーザーIDを取得（認証ミドルウェアから）
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: '認証が必要です' });
        return;
      }
      
      // リクエストボディからチームメンバー情報を取得
      const { teamMembers } = req.body;
      
      if (!teamMembers || !Array.isArray(teamMembers) || teamMembers.length === 0) {
        // リクエストボディが適切でない場合は、サンプルデータを返す
        // 実際の実装では、リクエストから取得したチームメンバー情報を使用する
        const mockTeamMembers = [
          {
            id: userId,
            name: '山田太郎',
            mainElement: '木' as ElementType,
            yinYang: '陽' as YinYangType
          },
          {
            id: 'user2',
            name: '佐藤次郎',
            mainElement: '火' as ElementType,
            yinYang: '陰' as YinYangType
          },
          {
            id: 'user3',
            name: '鈴木三郎',
            mainElement: '金' as ElementType,
            yinYang: '陽' as YinYangType
          }
        ];
        
        // チーム分析の実行
        const teamAnalysis = this.elementalCalculatorService.analyzeTeamDynamics(mockTeamMembers);
        
        // ペアごとの相性も計算
        const memberPairs = [];
        for (let i = 0; i < mockTeamMembers.length; i++) {
          for (let j = i + 1; j < mockTeamMembers.length; j++) {
            const compatibility = this.elementalCalculatorService.calculateUserCompatibility(
              mockTeamMembers[i],
              mockTeamMembers[j]
            );
            
            memberPairs.push({
              user1: {
                id: mockTeamMembers[i].id,
                name: mockTeamMembers[i].name,
                elementalType: {
                  mainElement: mockTeamMembers[i].mainElement,
                  yinYang: mockTeamMembers[i].yinYang
                }
              },
              user2: {
                id: mockTeamMembers[j].id,
                name: mockTeamMembers[j].name,
                elementalType: {
                  mainElement: mockTeamMembers[j].mainElement,
                  yinYang: mockTeamMembers[j].yinYang
                }
              },
              compatibility: compatibility.level,
              details: compatibility.analysis
            });
          }
        }
        
        // レスポンスの構築
        res.status(200).json({
          teamId: 'team-default',
          overall: {
            elementDistribution: teamAnalysis.elementDistribution,
            yinYangRatio: teamAnalysis.yinYangRatio,
            compatibilityScore: 75, // サンプル値
            strengths: teamAnalysis.recommendations.slice(0, 2),
            weaknesses: ['意思決定の遅さ'], // サンプル値
            recommendations: teamAnalysis.recommendations
          },
          memberPairs
        });
      } else {
        // 実際のチームメンバー情報がある場合の処理
        // チーム分析の実行
        const teamAnalysis = this.elementalCalculatorService.analyzeTeamDynamics(teamMembers);
        
        // ペアごとの相性も計算
        const memberPairs = [];
        for (let i = 0; i < teamMembers.length; i++) {
          for (let j = i + 1; j < teamMembers.length; j++) {
            const compatibility = this.elementalCalculatorService.calculateUserCompatibility(
              teamMembers[i],
              teamMembers[j]
            );
            
            memberPairs.push({
              user1: {
                id: teamMembers[i].id,
                name: teamMembers[i].name,
                elementalType: {
                  mainElement: teamMembers[i].mainElement,
                  yinYang: teamMembers[i].yinYang
                }
              },
              user2: {
                id: teamMembers[j].id,
                name: teamMembers[j].name,
                elementalType: {
                  mainElement: teamMembers[j].mainElement,
                  yinYang: teamMembers[j].yinYang
                }
              },
              compatibility: compatibility.level,
              details: compatibility.analysis
            });
          }
        }
        
        // レスポンスの構築
        res.status(200).json({
          teamId: req.query.teamId || 'team-custom',
          overall: {
            elementDistribution: teamAnalysis.elementDistribution,
            yinYangRatio: teamAnalysis.yinYangRatio,
            compatibilityScore: this.calculateAverageScore(memberPairs),
            strengths: teamAnalysis.recommendations.slice(0, 2),
            weaknesses: teamAnalysis.missingElements.length > 0 
              ? [`${teamAnalysis.missingElements.join('、')}の属性が不足`] 
              : ['意思決定の遅さ'],
            recommendations: teamAnalysis.recommendations
          },
          memberPairs
        });
      }
    } catch (error: any) {
      console.error('[FortuneController] getTeamCompatibility エラー:', error);
      res.status(500).json({
        message: 'チーム相性の取得中にエラーが発生しました',
        error: error.message
      });
    }
  }
  
  /**
   * 運勢を閲覧済みとしてマーク
   * @param req リクエスト
   * @param res レスポンス
   */
  async markFortuneAsViewed(req: Request, res: Response): Promise<void> {
    try {
      // ユーザーIDを取得（認証ミドルウェアから）
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: '認証が必要です' });
        return;
      }
      
      // パラメータから運勢IDを取得
      const { fortuneId } = req.params;
      
      if (!fortuneId) {
        res.status(400).json({ message: '運勢IDが必要です' });
        return;
      }
      
      console.log(`運勢を閲覧済みとしてマークするリクエスト: fortuneId=${fortuneId}`);

      // カスタムIDフォーマット（fortune-userId-date）からデータを抽出
      if (fortuneId.startsWith('fortune-')) {
        try {
          // カスタムIDから日付とユーザーIDを抽出
          const parts = fortuneId.split('-');
          if (parts.length === 3) {
            const idUserId = parts[1];
            const dateStr = parts[2];
            
            console.log(`抽出されたデータ: userId=${idUserId}, date=${dateStr}`);
            
            if (idUserId && dateStr && this.isValidDateFormat(dateStr)) {
              // 日付とユーザーIDで運勢を検索し、閲覧済みとしてマーク
              const fortune = await this.fortuneRepository.findByUserIdAndDate(idUserId, new Date(dateStr));
              
              if (fortune) {
                // 運勢IDを使用して閲覧済みとしてマーク
                const success = await this.fortuneRepository.markAsViewed(fortune.id);
                
                if (success) {
                  res.status(200).json({
                    id: fortuneId,
                    isViewed: true,
                    viewedAt: new Date().toISOString()
                  });
                  return;
                }
              }
            }
          }
        } catch (err) {
          console.error(`カスタムID形式の解析中にエラーが発生しました: ${err}`);
        }
      }
      
      // 標準IDフォーマットの場合、またはカスタムID処理が失敗した場合
      // リポジトリで運勢を閲覧済みとしてマーク
      const success = await this.fortuneRepository.markAsViewed(fortuneId);
      
      if (!success) {
        res.status(404).json({ message: '指定された運勢が見つかりません' });
        return;
      }
      
      // 成功レスポンスを返す
      res.status(200).json({
        id: fortuneId,
        isViewed: true,
        viewedAt: new Date().toISOString()
      });
    } catch (error: any) {
      console.error(`運勢を閲覧済みとしてマークする際にエラーが発生しました: ${error}`);
      res.status(500).json({
        message: '運勢の更新中にエラーが発生しました',
        error: error.message
      });
    }
  }
  
  /**
   * 日付文字列のバリデーション (YYYY-MM-DD)
   * @param dateStr 検証する日付文字列
   * @returns 有効な日付形式かどうか
   */
  private isValidDateFormat(dateStr: string): boolean {
    // 基本的な形式チェック
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return false;
    }
    
    // 日付としての妥当性チェック
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  }
  
  /**
   * 四柱推命情報を取得するエンドポイント
   * @param req リクエスト
   * @param res レスポンス
   */
  async getSajuInfo(req: Request, res: Response): Promise<void> {
    try {
      // ユーザーIDを取得（認証ミドルウェアから）
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: '認証が必要です' });
        return;
      }
      
      // パラメータを取得
      const { birthDate, birthHour = 12, useKoreanMethod = 'true' } = req.query;
      
      // パラメータのチェック
      if (!birthDate || typeof birthDate !== 'string') {
        res.status(400).json({ message: '生年月日（birthDate）は必須です。' });
        return;
      }
      
      if (!this.isValidDateFormat(birthDate)) {
        res.status(400).json({ message: '無効な日付形式です。YYYY-MM-DD形式で指定してください。' });
        return;
      }
      
      // 計算方式のパラメータ変換
      const useKoreanMethodBool = useKoreanMethod === 'true';
      console.log(`[FortuneController] 四柱推命計算方式: ${useKoreanMethodBool ? '韓国式' : '通常'}`);
      
      // 生年月日と時間から四柱推命プロファイルを計算
      const sajuProfile = await this.sajuCalculatorService.calculateSajuProfile(
        new Date(birthDate), // 文字列日付をDate型に変換
        Number(birthHour)
      );
      
      // 現在の四柱情報（本日の四柱）も計算
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const todayFourPillars = this.sajuCalculatorService.calculateDayFourPillars(todayStr, useKoreanMethodBool);
      
      // レスポンスを返す
      res.status(200).json({
        userId,
        birthDate,
        birthHour: Number(birthHour),
        calculationMethod: useKoreanMethodBool ? 'korean' : 'standard',
        elementalProfile: {
          mainElement: sajuProfile.mainElement,
          secondaryElement: sajuProfile.secondaryElement,
          yinYang: sajuProfile.yinYang
        },
        saju: {
          dayMaster: sajuProfile.dayMaster,
          fourPillars: sajuProfile.fourPillars,
          todayPillars: todayFourPillars
        }
      });
    } catch (error: any) {
      console.error('[FortuneController] getSajuInfo エラー:', error);
      res.status(500).json({
        message: '四柱推命情報の取得中にエラーが発生しました',
        error: error.message
      });
    }
  }
  
  /**
   * 運勢エンティティからAPIレスポンス形式への変換
   * @param fortune 運勢エンティティ
   * @returns APIレスポンス形式の運勢データ
   */
  private formatFortuneResponse(fortune: any): any {
    // 日付をYYYY-MM-DD形式に変換
    const dateStr = fortune.date instanceof Date 
      ? fortune.date.toISOString().split('T')[0]
      : new Date(fortune.date).toISOString().split('T')[0];
      
    // 五行要素を決定
    const element = this.determineElementFromDate(fortune.date);
    
    // ドメインモデルからフロントエンド用のレスポンス形式に変換
    return {
      id: `fortune-${fortune.userId}-${dateStr}`, // クライアント側のキャッシュ用にカスタムID
      date: dateStr,
      element,
      yinYang: fortune.yinYangBalance?.yin > fortune.yinYangBalance?.yang ? '陰' : '陽',
      overallLuck: fortune.overallScore,
      careerLuck: fortune.categories.work,
      relationshipLuck: fortune.categories.teamwork,
      healthLuck: fortune.categories.health,
      communicationLuck: fortune.categories.communication,
      dailyAdvice: fortune.advice,
      luckyItems: fortune.luckyItems || [],
      compatibleElements: this.getCompatibleElements(element),
      incompatibleElements: this.getIncompatibleElements(element),
      isViewed: true, // 簡略化のため常にtrue
      createdAt: fortune.createdAt instanceof Date 
        ? fortune.createdAt.toISOString()
        : new Date(fortune.createdAt).toISOString()
    };
  }
  
  /**
   * ペアの相性スコアの平均を計算
   * @param pairs ペアの配列
   * @returns 平均スコア
   */
  private calculateAverageScore(pairs: any[]): number {
    if (pairs.length === 0) return 0;
    
    const totalScore = pairs.reduce((sum, pair) => sum + pair.score, 0);
    return Math.round(totalScore / pairs.length);
  }
  
  /**
   * 日付から五行属性を決定
   * @param date 日付
   * @returns 五行属性
   */
  private determineElementFromDate(date: Date | string): string {
    const dateObj = date instanceof Date ? date : new Date(date);
    const day = dateObj.getDate();
    const elements = ['木', '火', '土', '金', '水'];
    return elements[day % 5];
  }
  
  /**
   * 相性の良い属性を取得
   * @param element 五行の属性
   * @returns 相性の良い属性の配列
   */
  private getCompatibleElements(element: string): string[] {
    const compatMap: Record<string, string[]> = {
      '木': ['水', '火'],
      '火': ['木', '土'],
      '土': ['火', '金'],
      '金': ['土', '水'],
      '水': ['金', '木']
    };
    return compatMap[element] || [];
  }
  
  /**
   * 相性の悪い属性を取得
   * @param element 五行の属性
   * @returns 相性の悪い属性の配列
   */
  private getIncompatibleElements(element: string): string[] {
    const incompatMap: Record<string, string[]> = {
      '木': ['金'],
      '火': ['水'],
      '土': ['木'],
      '金': ['火'],
      '水': ['土']
    };
    return incompatMap[element] || [];
  }
}