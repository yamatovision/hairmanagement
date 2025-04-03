import { inject, injectable } from 'tsyringe';
import { IFortuneRepository } from '../../domain/repositories/IFortuneRepository';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { ITeamRepository } from '../../domain/repositories/ITeamRepository';
import { SajuCalculatorService } from './saju-calculator.service';
import { ElementalCalculatorService } from './elemental-calculator.service';
import { AiModelSelectorService } from './ai-model-selector.service';
import { Fortune, FortuneRating } from '../../domain/entities/Fortune';
import { SajuProfile } from '../../domain/user/value-objects/saju-profile';

/**
 * デイリーフォーチュンサービス
 * 日次の運勢情報生成と管理を担当
 */
@injectable()
export class DailyFortuneService {
  constructor(
    @inject('IFortuneRepository') private fortuneRepository: IFortuneRepository,
    @inject('IUserRepository') private userRepository: IUserRepository,
    @inject('ITeamRepository') private teamRepository: ITeamRepository,
    @inject(SajuCalculatorService) private sajuCalculatorService: SajuCalculatorService,
    @inject(ElementalCalculatorService) private elementalCalculatorService: ElementalCalculatorService,
    @inject(AiModelSelectorService) private aiModelSelectorService: AiModelSelectorService,
    @inject('IAIService') private aiService: any
  ) {}

  /**
   * ユーザーのデイリーフォーチュンを取得
   * 存在しない場合は生成して保存
   * @param userId ユーザーID
   * @returns 運勢情報
   */
  async getDailyFortune(userId: string): Promise<any> {
    try {
      // 今日の日付を取得
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // 既存のフォーチュンを検索
      let fortune = await this.fortuneRepository.findByUserIdAndDate(userId, today);
      
      // 存在しない場合は新規生成
      if (!fortune) {
        // ユーザー情報を取得
        const user = await this.userRepository.findById(userId);
        if (!user) {
          throw new Error('ユーザーが見つかりません');
        }

        // チーム情報を取得（ユーザーがチームに所属している場合）
        const team = await this.teamRepository.findByMemberId(userId);
        
        // ユーザーの四柱推命プロファイルを取得
        const sajuProfile = await this.sajuCalculatorService.calculateSajuProfile(
          new Date(user.birthDate),
          user.birthHour,
          user.birthLocation
        );
        
        // 今日の四柱情報を取得
        const todaysFourPillars = this.sajuCalculatorService.calculateDayFourPillars();
        
        // 運勢評価とスコアを計算
        const compatibilityScore = this.calculateCompatibilityScore(sajuProfile, todaysFourPillars);
        const fortuneRating = this.mapScoreToRating(compatibilityScore);
        
        // AI運勢アドバイス生成
        const advice = await this.generateFortuneAdvice(
          sajuProfile,
          todaysFourPillars,
          user.personalGoal || '',
          team?.goal || ''
        );
        
        // 運勢エンティティを生成
        const newFortune: Fortune = {
          id: '',
          userId,
          date: today,
          overallScore: compatibilityScore,
          rating: fortuneRating,
          advice,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // 運勢を保存
        fortune = await this.fortuneRepository.create(newFortune);
      }
      
      // 運勢情報を拡張して返す
      return this.enrichFortuneData(fortune);
    } catch (error) {
      console.error('デイリーフォーチュン取得エラー:', error);
      throw error;
    }
  }

  /**
   * 日付を指定して運勢を取得
   * @param userId ユーザーID
   * @param date 日付
   * @returns 運勢情報
   */
  async getFortuneByDate(userId: string, date: Date): Promise<any> {
    try {
      // 指定日の00:00:00に設定
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      
      // 既存のフォーチュンを検索
      let fortune = await this.fortuneRepository.findByUserIdAndDate(userId, targetDate);
      
      // 存在しない場合は新規生成
      if (!fortune) {
        // ユーザー情報を取得
        const user = await this.userRepository.findById(userId);
        if (!user) {
          throw new Error('ユーザーが見つかりません');
        }

        // チーム情報を取得
        const team = await this.teamRepository.findByMemberId(userId);
        
        // ユーザーの四柱推命プロファイルを取得
        const sajuProfile = await this.sajuCalculatorService.calculateSajuProfile(
          new Date(user.birthDate),
          user.birthHour,
          user.birthLocation
        );
        
        // 指定日の四柱情報を取得
        const targetDateFourPillars = this.sajuCalculatorService.calculateDayFourPillars(targetDate);
        
        // 運勢評価とスコアを計算
        const compatibilityScore = this.calculateCompatibilityScore(sajuProfile, targetDateFourPillars);
        const fortuneRating = this.mapScoreToRating(compatibilityScore);
        
        // AI運勢アドバイス生成
        const advice = await this.generateFortuneAdvice(
          sajuProfile,
          targetDateFourPillars,
          user.personalGoal || '',
          team?.goal || ''
        );
        
        // 運勢エンティティを生成
        const newFortune: Fortune = {
          id: '',
          userId,
          date: targetDate,
          overallScore: compatibilityScore,
          rating: fortuneRating,
          advice,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // 運勢を保存
        fortune = await this.fortuneRepository.create(newFortune);
      }
      
      // 運勢情報を拡張して返す
      return this.enrichFortuneData(fortune);
    } catch (error) {
      console.error('指定日の運勢取得エラー:', error);
      throw error;
    }
  }

  /**
   * 四柱推命情報に基づく互換性スコアを計算
   * @param userSaju ユーザーの四柱推命プロファイル
   * @param dayFourPillars 指定日の四柱
   * @returns 互換性スコア（0-100）
   */
  private calculateCompatibilityScore(userSaju: SajuProfile, dayFourPillars: any): number {
    // 十二運星からのスコア計算
    const fortuneScores: { [key: string]: number } = {
      '長生': 90, '沐浴': 70, '冠帯': 80, '臨官': 85, '帝旺': 100,
      '衰': 60, '病': 50, '死': 30, '墓': 40, '絶': 20, '胎': 65, '養': 75
    };
    
    // 十神関係からの相性スコア
    const tenGodScores: { [key: string]: number } = {
      '比肩': 85, '劫財': 75, '食神': 90, '傷官': 70,
      '偏財': 80, '正財': 85, '偏官': 65, '正官': 75,
      '偏印': 80, '正印': 90
    };
    
    // 日主（ユーザーの日干）
    const dayMaster = userSaju.fourPillars.dayPillar.stem;
    
    // 当日の天干地支
    const todayStem = dayFourPillars.dayPillar.stem;
    const todayBranch = dayFourPillars.dayPillar.branch;
    
    // 当日の十神関係（日干から見た当日の天干の関係）
    // 実際には十神関係の計算ロジックが必要
    const todayTenGod = this.getTenGodRelation(dayMaster, todayStem);
    
    // 相性スコアの基本値（50点）
    let score = 50;
    
    // 十神関係に基づくスコア加算
    if (tenGodScores[todayTenGod]) {
      score += (tenGodScores[todayTenGod] - 50) * 0.5; // 50点を基準に差分の半分を加減
    }
    
    // 十二運星に基づくスコア加算（もし計算されていれば）
    if (userSaju.twelveFortunes && dayFourPillars.dayPillar.fortune) {
      const fortuneScore = fortuneScores[dayFourPillars.dayPillar.fortune] || 50;
      score += (fortuneScore - 50) * 0.3; // 50点を基準に差分の30%を加減
    }
    
    // 五行相性による調整
    const userElement = userSaju.mainElement;
    const todayElement = this.getElementFromStem(todayStem);
    
    if (this.isGenerating(userElement, todayElement)) {
      // 相生関係（ユーザーの五行が当日の五行を生む）
      score += 10;
    } else if (this.isGenerated(userElement, todayElement)) {
      // 被生関係（当日の五行がユーザーの五行を生む）
      score += 5;
    } else if (this.isControlling(userElement, todayElement)) {
      // 相剋関係（ユーザーの五行が当日の五行を剋す）
      score -= 5;
    } else if (this.isControlled(userElement, todayElement)) {
      // 被剋関係（当日の五行がユーザーの五行を剋す）
      score -= 10;
    }
    
    // スコアを0-100の範囲に収める
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * 分野別運勢スコア計算は削除されました（2025/4/3）
   * 個人・チーム目標に関するアドバイスに置き換えられています
   */

  /**
   * AI運勢アドバイス生成
   * @param userSaju ユーザーの四柱推命プロファイル
   * @param dayFourPillars 指定日の四柱
   * @param personalGoal 個人目標
   * @param teamGoal チーム目標
   * @returns 運勢アドバイスオブジェクト
   */
  private async generateFortuneAdvice(
    userSaju: SajuProfile,
    dayFourPillars: any,
    personalGoal: string,
    teamGoal: string
  ): Promise<any> {
    try {
      // デバッグログ: 開始
      console.log('[DailyFortuneService] AI運勢アドバイス生成を開始 - ユーザー属性:', {
        mainElement: userSaju.mainElement,
        yinYang: userSaju.yinYang,
        dayMaster: userSaju.fourPillars.dayPillar.stem,
        personalGoal: personalGoal ? '設定あり' : '未設定',
        teamGoal: teamGoal ? '設定あり' : '未設定'
      });

      // AIモデルを選択（常にSonnet使用）
      const model = await this.aiModelSelectorService.selectModelForFortune();
      console.log('[DailyFortuneService] 選択されたAIモデル:', model);
      
      // ユーザーの干支情報をフォーマット
      const userFourPillars = this.formatFourPillars(userSaju.fourPillars);
      const todayFourPillars = this.formatFourPillars(dayFourPillars);
      
      // 十神関係の解釈
      const tenGodInterpretation = this.generateTenGodInterpretation(
        userSaju.fourPillars.dayPillar.stem,
        dayFourPillars.dayPillar.stem
      );
      
      // プロンプト構築
      const prompt = `
あなたは四柱推命と五行の専門家です。以下の情報に基づいて今日の運勢とアドバイスを生成してください。

## ユーザープロフィール
- 五行属性: ${userSaju.yinYang}${userSaju.mainElement}
- 四柱: ${userFourPillars}

## 今日の暦情報
- 今日の四柱: ${todayFourPillars}
- 十神関係: ${tenGodInterpretation}

## 目標情報
- 個人目標: ${personalGoal || '未設定'}
- チーム目標: ${teamGoal || '未設定'}

## 出力形式
以下の正確な形式で出力してください。各セクションの見出しを含め、正確に指定された形式を守ることが非常に重要です：

1. 今日のあなたの運気
（必ず「あなたは今日、〇〇のような運気です」という形で始め、100-150文字で具体的なイメージや比喩を使い、ポジティブな表現で記述してください）

2. ラッキーポイント（五行理論に基づいて選定すること）
- ラッキーカラー: （今日の五行と相性の良い色を具体的に1つ指定）
- ラッキーアイテム: （今日の五行エネルギーを活かすアイテムを1-2つ）
- ラッキーナンバー: （1-9の数字を1つ、五行相関に基づいて）
- 開運アクション: （簡単にできる具体的な行動を15-20文字で）

3. 個人目標へのアドバイス
（「個人目標へのアドバイス」という見出しの後に、80-100文字で専門的かつ具体的なアドバイスを記述してください。ユーザーの個人目標「${personalGoal || '未設定'}」に関連したアドバイスを提供してください。）

4. チーム目標へのアドバイス
（「チーム目標へのアドバイス」という見出しの後に、80-100文字で職場での人間関係や協力に関する専門的なアドバイスを記述してください。チーム目標「${teamGoal || '未設定'}」に関連したアドバイスを提供してください。）

※出力形式を厳密に守り、各セクションの見出しを必ず含めてください。
※五行思想と十神関係に基づいた確かな裏付けのある内容にしてください。
※ラッキーポイントは表現は親しみやすくしつつも、背後には伝統的な五行理論の確かなロジックを持たせてください。
※ビジネス場面に適した内容を重視してください。
※パースのため各セクションの見出しを正確に記載することが非常に重要です。
`;
      
      // AIサービスでアドバイス生成
      console.log('[DailyFortuneService] AIサービスにリクエスト送信 - プロンプト長:', prompt.length);
      const response = await this.aiService.generateText(prompt, { model });
      console.log('[DailyFortuneService] AIからのレスポンス受信 - レスポンス長:', response ? response.length : 0);
      
      // レスポンス全体をログ出力（開発デバッグ用）
      console.log('[DailyFortuneService] AIレスポンス全文 (デバッグ用):\n', response);
      
      // レスポンスを解析して構造化
      const parsedAdvice = this.parseAIResponse(response);
      console.log('[DailyFortuneService] パース結果:', {
        hasSummary: !!parsedAdvice?.summary,
        summaryLength: parsedAdvice?.summary?.length || 0,
        hasPersonalAdvice: !!parsedAdvice?.personalAdvice,
        hasTeamAdvice: !!parsedAdvice?.teamAdvice,
        hasLuckyPoints: !!parsedAdvice?.luckyPoints,
        luckyPointsComplete: parsedAdvice?.luckyPoints ? 
          (!!parsedAdvice.luckyPoints.color && 
           !!parsedAdvice.luckyPoints.items && 
           !!parsedAdvice.luckyPoints.number && 
           !!parsedAdvice.luckyPoints.action) : false
      });
      
      // AIGeneratedAdviceが正常に生成されたことをログ
      console.log('[DailyFortuneService] AIGeneratedAdvice生成完了:', parsedAdvice ? 'success' : 'failed');
      
      // パース結果がない場合はデフォルト値を返す
      if (!parsedAdvice) {
        console.log('[DailyFortuneService] パース失敗 - デフォルト値を使用');
        return {
          summary: "本日の運勢データを準備中です。",
          personalAdvice: "個人目標に向けて着実に進みましょう。",
          teamAdvice: "チームとの連携を大切にしてください。",
          luckyPoints: {
            color: "赤",
            items: ["鈴"],
            number: 8,
            action: "朝日を浴びる"
          }
        };
      }
      
      // 正常に処理できた場合はパース結果を返す
      console.log('[DailyFortuneService] AI運勢アドバイス生成成功');
      return parsedAdvice;
    } catch (error) {
      console.error('[DailyFortuneService] AI運勢アドバイス生成エラー:', error);
      if (error instanceof Error) {
        console.error('[DailyFortuneService] エラー詳細:', error.message);
        console.error('[DailyFortuneService] スタックトレース:', error.stack);
      }
      
      // エラー時はデフォルト値を返す
      return {
        summary: "アドバイスの生成中にエラーが発生しました。",
        personalAdvice: "個人目標に向けて通常通り進めてください。",
        teamAdvice: "チームとの連携を通常通り進めてください。",
        luckyPoints: {
          color: "赤",
          items: ["鈴"],
          number: 8,
          action: "朝日を浴びる"
        }
      };
    }
  }
  
  /**
   * AIレスポンスをパースして構造化された運勢アドバイスを返す
   * @param response AIからのテキスト回答
   * @returns 構造化された運勢アドバイス
   */
  private parseAIResponse(response: string | object): any {
    // デバッグ情報：レスポンスタイプのログ
    console.log('[DailyFortuneService.parseAIResponse] レスポンスタイプ:', typeof response);
    console.log('[DailyFortuneService.parseAIResponse] nullチェック:', response === null);
    
    // オブジェクトが直接渡された場合はそのまま使用
    if (typeof response === 'object' && response !== null) {
      console.log('[DailyFortuneService.parseAIResponse] オブジェクトが直接渡されました');
      const objectResponse = response as any;
      
      // 必要な構造をチェック
      const requiredFields = ['summary', 'personalAdvice', 'teamAdvice', 'luckyPoints'];
      const missingFields = requiredFields.filter(field => !objectResponse[field]);
      
      if (missingFields.length > 0) {
        console.log('[DailyFortuneService.parseAIResponse] 警告: オブジェクトに不足しているフィールドがあります:', missingFields);
      }
      
      // luckyPointsがある場合は内部構造もチェック
      if (objectResponse.luckyPoints) {
        console.log('[DailyFortuneService.parseAIResponse] luckyPointsの検証:',{
          hasColor: !!objectResponse.luckyPoints.color,
          hasItems: !!objectResponse.luckyPoints.items,
          isItemsArray: Array.isArray(objectResponse.luckyPoints.items),
          hasNumber: !!objectResponse.luckyPoints.number,
          hasAction: !!objectResponse.luckyPoints.action
        });
        
        // luckyPoints.itemsが配列でない場合は配列に変換
        if (objectResponse.luckyPoints.items && !Array.isArray(objectResponse.luckyPoints.items)) {
          console.log('[DailyFortuneService.parseAIResponse] luckyPoints.itemsを配列に変換します');
          objectResponse.luckyPoints.items = [String(objectResponse.luckyPoints.items)];
        }
      }
      
      return objectResponse;
    }
    
    if (!response) {
      console.error('[DailyFortuneService.parseAIResponse] 空のレスポンスを受信');
      return null;
    }
    
    try {
      const responseStr = String(response);
      console.log('[DailyFortuneService.parseAIResponse] パース開始 - レスポンス長:', responseStr.length);
      
      // JSONオブジェクトの場合は、直接パースして返す
      if (responseStr.startsWith('{') && responseStr.endsWith('}')) {
        try {
          console.log('[DailyFortuneService.parseAIResponse] JSONとして解析を試みます');
          const jsonResult = JSON.parse(responseStr);
          
          // 必要なプロパティが含まれているか確認
          if (jsonResult.summary && jsonResult.luckyPoints) {
            console.log('[DailyFortuneService.parseAIResponse] 有効なJSONオブジェクトとして解析成功');
            
            // luckyPoints.itemsが配列でない場合は配列に変換
            if (jsonResult.luckyPoints && jsonResult.luckyPoints.items && !Array.isArray(jsonResult.luckyPoints.items)) {
              jsonResult.luckyPoints.items = [String(jsonResult.luckyPoints.items)];
            }
            
            return jsonResult;
          }
        } catch (e) {
          console.log('[DailyFortuneService.parseAIResponse] JSON解析に失敗しました。テキストパースを試みます:', e);
        }
      }
      
      console.log('[DailyFortuneService.parseAIResponse] パース開始 - レスポンス長:', response.length);
      
      // 初期化
      const result = {
        summary: "",
        personalAdvice: "",
        teamAdvice: "",
        luckyPoints: {
          color: "赤", // デフォルト値
          items: ["鈴"], // デフォルト値
          number: 8, // デフォルト値
          action: "朝日を浴びる" // デフォルト値
        }
      };
      
      // 1. 運気を抽出（最初の段落を抽出）
      console.log('[DailyFortuneService.parseAIResponse] 運気サマリー抽出中...');
      // 「あなたは今日」で始まる段落全体を抽出
      const summaryMatch = response.match(/あなたは今日[^\n]+([\s\S]+?)(?=\n\n|ラッキーポイント|ラッキーカラー|$)/);
      if (summaryMatch && summaryMatch[0]) {
        result.summary = summaryMatch[0].trim();
        console.log('[DailyFortuneService.parseAIResponse] メインパターンでサマリー抽出成功:', result.summary.substring(0, 50) + '...');
      } else {
        // バックアップパターン：最初の段落を抽出
        const firstParagraph = response.split(/\n\n/)[0];
        if (firstParagraph) {
          result.summary = firstParagraph.trim();
          console.log('[DailyFortuneService.parseAIResponse] バックアップパターンでサマリー抽出:', result.summary.substring(0, 50) + '...');
        } else {
          console.log('[DailyFortuneService.parseAIResponse] サマリー抽出失敗');
        }
      }
      
      // 2. ラッキーポイントを抽出
      console.log('[DailyFortuneService.parseAIResponse] ラッキーポイント抽出中...');
      
      // 色
      const colorMatch = response.match(/ラッキーカラー[:：]\s*(.+?)(?=\n|$)/);
      if (colorMatch && colorMatch[1]) {
        result.luckyPoints.color = colorMatch[1].trim();
        console.log('[DailyFortuneService.parseAIResponse] ラッキーカラー抽出成功:', result.luckyPoints.color);
      } else {
        console.log('[DailyFortuneService.parseAIResponse] ラッキーカラー抽出失敗');
      }
      
      // アイテム
      const itemsMatch = response.match(/ラッキーアイテム[:：]\s*(.+?)(?=\n|$)/);
      if (itemsMatch && itemsMatch[1]) {
        // カンマまたは読点で複数アイテムとして分割
        const items = itemsMatch[1].split(/[、,]/).map(item => item.trim());
        result.luckyPoints.items = items.filter(item => item.length > 0);
        console.log('[DailyFortuneService.parseAIResponse] ラッキーアイテム抽出成功:', result.luckyPoints.items);
      } else {
        console.log('[DailyFortuneService.parseAIResponse] ラッキーアイテム抽出失敗');
      }
      
      // 数字
      const numberMatch = response.match(/ラッキーナンバー[:：]\s*(\d+)/);
      if (numberMatch && numberMatch[1]) {
        result.luckyPoints.number = parseInt(numberMatch[1], 10);
        console.log('[DailyFortuneService.parseAIResponse] ラッキーナンバー抽出成功:', result.luckyPoints.number);
      } else {
        console.log('[DailyFortuneService.parseAIResponse] ラッキーナンバー抽出失敗');
      }
      
      // 行動
      const actionMatch = response.match(/開運アクション[:：]\s*(.+?)(?=\n|$)/);
      if (actionMatch && actionMatch[1]) {
        result.luckyPoints.action = actionMatch[1].trim();
        console.log('[DailyFortuneService.parseAIResponse] 開運アクション抽出成功:', result.luckyPoints.action);
      } else {
        console.log('[DailyFortuneService.parseAIResponse] 開運アクション抽出失敗');
      }
      
      // 3. 個人目標へのアドバイスを抽出
      console.log('[DailyFortuneService.parseAIResponse] 個人目標アドバイス抽出中...');
      // "個人目標へのアドバイス" の見出し後の文章を抽出
      const personalAdviceMatch = response.match(/個人目標へのアドバイス(?:[^\n]*\n+)([\s\S]+?)(?=\n\n|チーム目標|$)/);
      if (personalAdviceMatch && personalAdviceMatch[1]) {
        result.personalAdvice = personalAdviceMatch[1].trim();
        console.log('[DailyFortuneService.parseAIResponse] メインパターンで個人目標アドバイス抽出成功:', 
          result.personalAdvice.substring(0, 50) + '...');
      } else {
        // バックアップパターン：キーワードベースの抽出
        console.log('[DailyFortuneService.parseAIResponse] バックアップパターンで個人目標アドバイス抽出試行');
        const personalKeywords = ["個人目標", "個人の目標", "あなたの目標"];
        let foundMatch = false;
        for (const keyword of personalKeywords) {
          const match = response.match(new RegExp(`${keyword}[^\\n]+(\\S[\\s\\S]+?)(?=\\n\\n|チーム|$)`));
          if (match && match[0]) {
            result.personalAdvice = match[0].trim();
            console.log('[DailyFortuneService.parseAIResponse] バックアップパターンで個人目標アドバイス抽出成功:', 
              result.personalAdvice.substring(0, 50) + '...');
            foundMatch = true;
            break;
          }
        }
        if (!foundMatch) {
          console.log('[DailyFortuneService.parseAIResponse] 個人目標アドバイス抽出失敗');
        }
      }
      
      // 4. チーム目標へのアドバイスを抽出
      console.log('[DailyFortuneService.parseAIResponse] チームアドバイス抽出中...');
      // "チーム目標へのアドバイス" の見出し後の文章を抽出
      const teamAdviceMatch = response.match(/チーム目標へのアドバイス(?:[^\n]*\n+)([\s\S]+?)(?=\n\n|$)/);
      if (teamAdviceMatch && teamAdviceMatch[1]) {
        result.teamAdvice = teamAdviceMatch[1].trim();
        console.log('[DailyFortuneService.parseAIResponse] メインパターンでチームアドバイス抽出成功:', 
          result.teamAdvice.substring(0, 50) + '...');
      } else {
        // バックアップパターン：キーワードベースの抽出
        console.log('[DailyFortuneService.parseAIResponse] バックアップパターンでチームアドバイス抽出試行');
        const teamKeywords = ["チーム目標", "チームの目標", "協力", "連携"];
        let foundMatch = false;
        for (const keyword of teamKeywords) {
          const match = response.match(new RegExp(`${keyword}[^\\n]+(\\S[\\s\\S]+?)(?=\\n\\n|$)`));
          if (match && match[0]) {
            result.teamAdvice = match[0].trim();
            console.log('[DailyFortuneService.parseAIResponse] バックアップパターンでチームアドバイス抽出成功:', 
              result.teamAdvice.substring(0, 50) + '...');
            foundMatch = true;
            break;
          }
        }
        if (!foundMatch) {
          console.log('[DailyFortuneService.parseAIResponse] チームアドバイス抽出失敗');
        }
      }
      
      // 抽出されなかった場合のフォールバック
      if (!result.summary) {
        console.log('[DailyFortuneService.parseAIResponse] 警告: 運気サマリーが抽出できませんでした - デフォルト値を使用');
        result.summary = "本日の運勢データを準備中です。";
      }
      
      if (!result.personalAdvice) {
        console.log('[DailyFortuneService.parseAIResponse] 警告: 個人目標アドバイスが抽出できませんでした - デフォルト値を使用');
        result.personalAdvice = "個人目標に向けて着実に進みましょう。";
      }
      
      if (!result.teamAdvice) {
        console.log('[DailyFortuneService.parseAIResponse] 警告: チームアドバイスが抽出できませんでした - デフォルト値を使用');
        result.teamAdvice = "チームとの連携を大切にしてください。";
      }
      
      // ラッキーポイントの配列確認
      if (!Array.isArray(result.luckyPoints.items)) {
        console.log('[DailyFortuneService.parseAIResponse] ラッキーアイテムが配列でないため修正します');
        result.luckyPoints.items = [String(result.luckyPoints.items || "鈴")];
      }
      
      // ラッキーポイントの完全性を確認
      console.log('[DailyFortuneService.parseAIResponse] ラッキーポイント最終確認:', {
        hasColor: !!result.luckyPoints.color,
        hasItems: Array.isArray(result.luckyPoints.items) && result.luckyPoints.items.length > 0,
        hasNumber: typeof result.luckyPoints.number === 'number',
        hasAction: !!result.luckyPoints.action
      });
      
      // ロギング
      console.log('[DailyFortuneService.parseAIResponse] 抽出結果サマリー:', {
        summaryLength: result.summary.length,
        personalAdviceLength: result.personalAdvice.length,
        teamAdviceLength: result.teamAdvice.length,
        luckyPointsColor: result.luckyPoints.color,
        luckyPointsItems: result.luckyPoints.items,
        luckyPointsNumber: result.luckyPoints.number,
        luckyPointsAction: result.luckyPoints.action
      });
      
      // 構造化されたパース結果を返す
      return result;
    } catch (error) {
      console.error('[DailyFortuneService.parseAIResponse] AIレスポンスのパースに失敗しました:', error);
      if (error instanceof Error) {
        console.error('[DailyFortuneService.parseAIResponse] エラー詳細:', error.message);
        console.error('[DailyFortuneService.parseAIResponse] スタックトレース:', error.stack);
      }
      
      console.log('[DailyFortuneService.parseAIResponse] 問題のあったレスポンス全文:\n', response);
      return null;
    }
  }

  /**
   * 運勢情報を拡張して返す
   * @param fortune 基本運勢情報
   * @returns 拡張された運勢情報
   */
  private enrichFortuneData(fortune: Fortune): any {
    console.log('[DailyFortuneService.enrichFortuneData] 運勢情報の拡張開始');
    
    // 運勢日付
    const dateStr = fortune.date instanceof Date 
      ? fortune.date.toISOString().split('T')[0]
      : new Date(fortune.date).toISOString().split('T')[0];
    
    // 星評価（5段階）に変換
    const starRating = this.convertToStarRating(fortune.overallScore);
    
    // AIアドバイスがオブジェクトか文字列かを確認
    const isObjectAdvice = typeof fortune.advice === 'object';
    console.log('[DailyFortuneService.enrichFortuneData] アドバイスタイプ:', isObjectAdvice ? 'オブジェクト' : '文字列');
    
    // AIアドバイスオブジェクトの詳細をログ出力
    if (isObjectAdvice) {
      console.log('[DailyFortuneService.enrichFortuneData] AIアドバイスオブジェクトの詳細:', {
        hasAdvice: !!fortune.advice,
        adviceType: typeof fortune.advice,
        hasSummary: !!fortune.advice.summary,
        hasPersonalAdvice: !!fortune.advice.personalAdvice,
        hasTeamAdvice: !!fortune.advice.teamAdvice,
        hasLuckyPoints: !!fortune.advice.luckyPoints
      });
      
      // ラッキーポイントの詳細をログ出力
      if (fortune.advice && fortune.advice.luckyPoints) {
        console.log('[DailyFortuneService.enrichFortuneData] ラッキーポイント詳細:', {
          color: fortune.advice.luckyPoints.color,
          items: fortune.advice.luckyPoints.items,
          isItemsArray: Array.isArray(fortune.advice.luckyPoints.items),
          itemsLength: Array.isArray(fortune.advice.luckyPoints.items) ? 
            fortune.advice.luckyPoints.items.length : 'not an array',
          number: fortune.advice.luckyPoints.number,
          action: fortune.advice.luckyPoints.action
        });
      }
    }
    
    // ラッキーアイテムが配列でない場合は配列に変換
    const aiAdvice = isObjectAdvice ? fortune.advice : null;
    if (aiAdvice && aiAdvice.luckyPoints && !Array.isArray(aiAdvice.luckyPoints.items)) {
      console.log('[DailyFortuneService.enrichFortuneData] ラッキーアイテムが配列でないため修正します');
      aiAdvice.luckyPoints.items = [String(aiAdvice.luckyPoints.items || "鈴")];
    }
    
    // 拡張データを生成
    const enrichedData = {
      id: fortune.id || `fortune-${fortune.userId}-${dateStr}`,
      date: dateStr,
      overallScore: fortune.overallScore,
      starRating,
      rating: fortune.rating,
      categories: fortune.categories,
      advice: isObjectAdvice ? 'アドバイスは構造化形式で提供されています' : String(fortune.advice || ''),
      // 新しい構造化されたアドバイス形式
      aiGeneratedAdvice: aiAdvice,
      // 四柱推命データを追加（実際の実装では、これをセッションや計算済みデータから取得）
      sajuData: {
        mainElement: '未設定', // 実際にはユーザー情報から取得
        yinYang: '未設定',  // 実際にはユーザー情報から取得
        compatibility: fortune.overallScore
      },
      createdAt: fortune.createdAt instanceof Date 
        ? fortune.createdAt.toISOString()
        : new Date(fortune.createdAt).toISOString()
    };
    
    // 最終結果の構造をログ出力
    console.log('[DailyFortuneService.enrichFortuneData] 拡張された運勢データ:', {
      id: enrichedData.id,
      date: enrichedData.date,
      overallScore: enrichedData.overallScore,
      hasAiGeneratedAdvice: !!enrichedData.aiGeneratedAdvice,
      hasLuckyPoints: enrichedData.aiGeneratedAdvice && !!enrichedData.aiGeneratedAdvice.luckyPoints
    });
    
    return enrichedData;
  }

  /**
   * スコアから評価へのマッピング
   * @param score 運勢スコア（0-100）
   * @returns 運勢評価
   */
  private mapScoreToRating(score: number): FortuneRating {
    if (score >= 80) return FortuneRating.EXCELLENT;
    if (score >= 60) return FortuneRating.GOOD;
    if (score >= 40) return FortuneRating.NEUTRAL;
    if (score >= 20) return FortuneRating.CAUTION;
    return FortuneRating.POOR;
  }

  /**
   * スコアから星評価（1〜5）への変換
   * @param score 運勢スコア（0-100）
   * @returns 星評価（1-5）
   */
  private convertToStarRating(score: number): number {
    if (score >= 90) return 5;
    if (score >= 70) return 4;
    if (score >= 50) return 3;
    if (score >= 30) return 2;
    return 1;
  }

  /**
   * 四柱をフォーマット
   * @param fourPillars 四柱情報
   * @returns フォーマットされた四柱文字列
   */
  private formatFourPillars(fourPillars: any): string {
    return `年柱:${fourPillars.yearPillar.fullStemBranch}, 月柱:${fourPillars.monthPillar.fullStemBranch}, 日柱:${fourPillars.dayPillar.fullStemBranch}, 時柱:${fourPillars.hourPillar.fullStemBranch}`;
  }

  /**
   * 日柱の天干から当日の天干への十神関係を取得
   * @param dayMaster 日柱の天干
   * @param targetStem 当日の天干
   * @returns 十神関係
   */
  private getTenGodRelation(dayMaster: string, targetStem: string): string {
    // 十神関係のマッピング（簡易版）
    const tenGodMap: { [key: string]: { [key: string]: string } } = {
      '甲': { '甲': '比肩', '乙': '劫財', '丙': '食神', '丁': '傷官', '戊': '偏財', '己': '正財', '庚': '偏官', '辛': '正官', '壬': '偏印', '癸': '正印' },
      '乙': { '甲': '劫財', '乙': '比肩', '丙': '傷官', '丁': '食神', '戊': '正財', '己': '偏財', '庚': '正官', '辛': '偏官', '壬': '正印', '癸': '偏印' },
      '丙': { '甲': '偏印', '乙': '正印', '丙': '比肩', '丁': '劫財', '戊': '食神', '己': '傷官', '庚': '偏財', '辛': '正財', '壬': '偏官', '癸': '正官' },
      '丁': { '甲': '正印', '乙': '偏印', '丙': '劫財', '丁': '比肩', '戊': '傷官', '己': '食神', '庚': '正財', '辛': '偏財', '壬': '正官', '癸': '偏官' },
      '戊': { '甲': '偏官', '乙': '正官', '丙': '偏印', '丁': '正印', '戊': '比肩', '己': '劫財', '庚': '食神', '辛': '傷官', '壬': '偏財', '癸': '正財' },
      '己': { '甲': '正官', '乙': '偏官', '丙': '正印', '丁': '偏印', '戊': '劫財', '己': '比肩', '庚': '傷官', '辛': '食神', '壬': '正財', '癸': '偏財' },
      '庚': { '甲': '偏財', '乙': '正財', '丙': '偏官', '丁': '正官', '戊': '偏印', '己': '正印', '庚': '比肩', '辛': '劫財', '壬': '食神', '癸': '傷官' },
      '辛': { '甲': '正財', '乙': '偏財', '丙': '正官', '丁': '偏官', '戊': '正印', '己': '偏印', '庚': '劫財', '辛': '比肩', '壬': '傷官', '癸': '食神' },
      '壬': { '甲': '食神', '乙': '傷官', '丙': '偏財', '丁': '正財', '戊': '偏官', '己': '正官', '庚': '偏印', '辛': '正印', '壬': '比肩', '癸': '劫財' },
      '癸': { '甲': '傷官', '乙': '食神', '丙': '正財', '丁': '偏財', '戊': '正官', '己': '偏官', '庚': '正印', '辛': '偏印', '壬': '劫財', '癸': '比肩' }
    };
    
    return tenGodMap[dayMaster]?.[targetStem] || '不明';
  }

  /**
   * 十神関係の解釈を生成
   * @param dayMaster 日柱の天干
   * @param targetStem 当日の天干
   * @returns 十神関係の解釈
   */
  private generateTenGodInterpretation(dayMaster: string, targetStem: string): string {
    const tenGod = this.getTenGodRelation(dayMaster, targetStem);
    
    const interpretations: { [key: string]: string } = {
      '比肩': '協力的なエネルギーが高まる日。チームワークを活かした行動が吉。',
      '劫財': '競争力が高まる日。前向きな姿勢で挑戦すると良い結果が得られる。',
      '食神': '創造性と楽しみのエネルギーが高まる日。アイデアの発信に適している。',
      '傷官': '自己表現力が高まる日。主張すべきことを明確に伝えると吉。',
      '偏財': '臨時収入や新たな機会のエネルギーが高まる日。新規プロジェクトの開始に適している。',
      '正財': '安定した収入や成果のエネルギーが高まる日。確実な仕事の進行に適している。',
      '偏官': '権力や影響力のエネルギーが高まる日。リーダーシップを発揮すると吉。',
      '正官': '秩序や規律のエネルギーが高まる日。ルールに則った行動が重要。',
      '偏印': '知性や直観のエネルギーが高まる日。学習や情報収集に適している。',
      '正印': '知恵や洞察のエネルギーが高まる日。深い理解と分析が吉。'
    };
    
    return interpretations[tenGod] || '標準的なエネルギーの日。バランスの取れた行動を心がけると吉。';
  }

  /**
   * 天干から五行を取得
   * @param stem 天干
   * @returns 五行
   */
  private getElementFromStem(stem: string): string {
    const elementMap: { [key: string]: string } = {
      '甲': '木', '乙': '木',
      '丙': '火', '丁': '火',
      '戊': '土', '己': '土',
      '庚': '金', '辛': '金',
      '壬': '水', '癸': '水'
    };
    
    return elementMap[stem] || '不明';
  }

  /**
   * 五行の相生関係（element1がelement2を生むか）
   * @param element1 五行1
   * @param element2 五行2
   * @returns 相生関係の有無
   */
  private isGenerating(element1: string, element2: string): boolean {
    const generatesMap: { [key: string]: string } = {
      '木': '火',
      '火': '土',
      '土': '金',
      '金': '水',
      '水': '木'
    };
    
    return generatesMap[element1] === element2;
  }

  /**
   * 五行の被生関係（element2がelement1を生むか）
   * @param element1 五行1
   * @param element2 五行2
   * @returns 被生関係の有無
   */
  private isGenerated(element1: string, element2: string): boolean {
    return this.isGenerating(element2, element1);
  }

  /**
   * 五行の相剋関係（element1がelement2を剋するか）
   * @param element1 五行1
   * @param element2 五行2
   * @returns 相剋関係の有無
   */
  private isControlling(element1: string, element2: string): boolean {
    const controlsMap: { [key: string]: string } = {
      '木': '土',
      '土': '水',
      '水': '火',
      '火': '金',
      '金': '木'
    };
    
    return controlsMap[element1] === element2;
  }

  /**
   * 五行の被剋関係（element2がelement1を剋するか）
   * @param element1 五行1
   * @param element2 五行2
   * @returns 被剋関係の有無
   */
  private isControlled(element1: string, element2: string): boolean {
    return this.isControlling(element2, element1);
  }
}