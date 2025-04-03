import { inject, injectable } from 'tsyringe';
import { BaseRepository } from './base/BaseRepository';
import { IFortuneRepository } from '../../domain/repositories/IFortuneRepository';
import { Fortune, FortuneRating } from '../../domain/entities/Fortune';
import FortuneModel, { IFortuneDocument } from '../../domain/models/fortune.model';

/**
 * MongoDBを使用した運勢リポジトリの実装
 */
@injectable()
export class MongoFortuneRepository extends BaseRepository<Fortune, string> implements IFortuneRepository {
  /**
   * コンストラクタ
   * @param fortuneModel FortuneモデルのMongooseインスタンス
   */
  constructor(
    @inject('FortuneModel') private fortuneModel: any
  ) {
    super(fortuneModel);
  }

  /**
   * Mongooseドキュメントからドメインエンティティへの変換
   * @param doc MongooseのFortuneドキュメント
   * @returns ドメインエンティティのFortune
   */
  protected toDomainEntity(doc: IFortuneDocument): Fortune {
    // 変換前のログ出力
    console.log(`[MongoFortuneRepository] toDomainEntity: docId=${doc._id}, hasAiGeneratedAdvice=${!!doc.aiGeneratedAdvice}`);
    
    // aiGeneratedAdviceを持つか確認し、適切に変換
    let advice = doc.advice;
    
    // aiGeneratedAdviceを持っている場合、構造化データとして渡す
    if (doc.aiGeneratedAdvice) {
      console.log('[MongoFortuneRepository] aiGeneratedAdviceを構造化データとして処理します');
      // 適切な形式かチェック - 必要なフィールドが欠けていたら追加
      if (!doc.aiGeneratedAdvice.summary) {
        console.log('[MongoFortuneRepository] aiGeneratedAdviceにsummaryが不足しているため追加します');
        doc.aiGeneratedAdvice.summary = typeof doc.advice === 'string' ? doc.advice : "本日は五行のエネルギーを活かして行動しましょう。";
      }
      if (!doc.aiGeneratedAdvice.personalAdvice) {
        console.log('[MongoFortuneRepository] aiGeneratedAdviceにpersonalAdviceが不足しているため追加します');
        doc.aiGeneratedAdvice.personalAdvice = "個人目標に向けて集中して取り組みましょう。";
      }
      if (!doc.aiGeneratedAdvice.teamAdvice) {
        console.log('[MongoFortuneRepository] aiGeneratedAdviceにteamAdviceが不足しているため追加します');
        doc.aiGeneratedAdvice.teamAdvice = "チームとの連携を大切にしてください。";
      }
      // luckyPointsをチェック
      if (!doc.aiGeneratedAdvice.luckyPoints) {
        console.log('[MongoFortuneRepository] aiGeneratedAdviceにluckyPointsが不足しているため追加します');
        doc.aiGeneratedAdvice.luckyPoints = {
          color: "赤",
          items: ["鈴", "明るい色の文房具"],
          number: 8,
          action: "朝日を浴びる"
        };
      } else {
        // luckyPointsの各項目をチェック
        if (!doc.aiGeneratedAdvice.luckyPoints.color) {
          doc.aiGeneratedAdvice.luckyPoints.color = "赤";
        }
        if (!Array.isArray(doc.aiGeneratedAdvice.luckyPoints.items) || doc.aiGeneratedAdvice.luckyPoints.items.length === 0) {
          doc.aiGeneratedAdvice.luckyPoints.items = ["鈴", "明るい色の文房具"];
        }
        if (!doc.aiGeneratedAdvice.luckyPoints.number) {
          doc.aiGeneratedAdvice.luckyPoints.number = 8;
        }
        if (!doc.aiGeneratedAdvice.luckyPoints.action) {
          doc.aiGeneratedAdvice.luckyPoints.action = "朝日を浴びる";
        }
      }
    } else {
      // 古いフォーマットでadviceがJSON文字列かどうかをチェック
      try {
        if (typeof doc.advice === 'string' && doc.advice.trim().startsWith('{') && doc.advice.trim().endsWith('}')) {
          console.log('[MongoFortuneRepository] adviceをJSON文字列として解析を試みます');
          const parsedAdvice = JSON.parse(doc.advice);
          if (parsedAdvice.summary || parsedAdvice.luckyPoints) {
            console.log('[MongoFortuneRepository] adviceからaiGeneratedAdviceを抽出しました');
            // 必要なフィールドを全て設定
            doc.aiGeneratedAdvice = {
              summary: parsedAdvice.summary || (typeof doc.advice === 'string' ? doc.advice : "本日は五行のエネルギーを活かして行動しましょう。"),
              personalAdvice: parsedAdvice.personalAdvice || "個人目標に向けて集中して取り組みましょう。",
              teamAdvice: parsedAdvice.teamAdvice || "チームとの連携を大切にしてください。",
              luckyPoints: {
                color: parsedAdvice.luckyPoints?.color || "赤",
                items: (parsedAdvice.luckyPoints && Array.isArray(parsedAdvice.luckyPoints.items) && parsedAdvice.luckyPoints.items.length > 0) ? 
                  parsedAdvice.luckyPoints.items : ["鈴", "明るい色の文房具"],
                number: parsedAdvice.luckyPoints?.number || 8,
                action: parsedAdvice.luckyPoints?.action || "朝日を浴びる"
              }
            };
          }
        }
      } catch (error) {
        console.log('[MongoFortuneRepository] adviceのJSON解析に失敗しました。通常の文字列として扱います');
      }
    }
    
    return {
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      date: new Date(doc.date),
      overallScore: doc.overallLuck,
      rating: this.mapScoreToRating(doc.overallLuck),
      // 分野別カテゴリースコアは削除されました（2025/4/3）
      luckyItems: doc.luckyColors,  // 簡略化のため色をラッキーアイテムとして使用
      yinYangBalance: {
        yin: doc.yinYang === '陰' ? 70 : 30,
        yang: doc.yinYang === '陽' ? 70 : 30
      },
      advice: doc.aiGeneratedAdvice ? JSON.stringify(doc.aiGeneratedAdvice) : doc.advice,
      aiGeneratedAdvice: doc.aiGeneratedAdvice, // 追加: aiGeneratedAdviceを直接保持
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  }

  /**
   * ドメインエンティティからMongooseモデルデータへの変換
   * @param entity ドメインエンティティのFortune
   * @returns MongooseモデルデータとしてのFortune
   */
  protected toModelData(entity: Fortune): any {
    // 日付をYYYY-MM-DD形式に変換
    const dateStr = entity.date instanceof Date 
      ? entity.date.toISOString().split('T')[0]
      : new Date(entity.date).toISOString().split('T')[0];
    
    // entity.adviceがJSON文字列かオブジェクトか確認
    let adviceText = entity.advice;
    let aiGeneratedAdvice = entity.aiGeneratedAdvice;
    
    // adviceがJSON文字列で、aiGeneratedAdviceが直接設定されていない場合
    if (typeof entity.advice === 'string' && 
        entity.advice.trim().startsWith('{') && 
        entity.advice.trim().endsWith('}') && 
        !entity.aiGeneratedAdvice) {
      try {
        console.log('[MongoFortuneRepository] adviceをJSON文字列として解析を試みます');
        const parsedAdvice = JSON.parse(entity.advice);
        if (parsedAdvice.summary || parsedAdvice.luckyPoints) {
          console.log('[MongoFortuneRepository] adviceからaiGeneratedAdviceを抽出しました');
          // 必要なフィールドを全て設定
          aiGeneratedAdvice = {
            summary: parsedAdvice.summary || "本日は五行のエネルギーを活かして行動しましょう。",
            personalAdvice: parsedAdvice.personalAdvice || "個人目標に向けて集中して取り組みましょう。",
            teamAdvice: parsedAdvice.teamAdvice || "チームとの連携を大切にしてください。",
            luckyPoints: {
              color: parsedAdvice.luckyPoints?.color || "赤",
              items: Array.isArray(parsedAdvice.luckyPoints?.items) && parsedAdvice.luckyPoints.items.length > 0 
                ? parsedAdvice.luckyPoints.items 
                : ["鈴", "明るい色の文房具"],
              number: parsedAdvice.luckyPoints?.number || 8,
              action: parsedAdvice.luckyPoints?.action || "朝日を浴びる"
            }
          };
          adviceText = parsedAdvice.summary || entity.advice; // 要約を通常のアドバイスとしても使用
        }
      } catch (error) {
        console.log('[MongoFortuneRepository] adviceのJSON解析に失敗しました:', error.message);
      }
    }
    
    // aiGeneratedAdviceの処理状況をログ出力
    console.log(`[MongoFortuneRepository] toModelData: entityId=${entity.id}, hasAiGeneratedAdvice=${!!aiGeneratedAdvice}`);
    
    // aiGeneratedAdviceがある場合は必要なフィールドを全て追加する
    if (aiGeneratedAdvice) {
      console.log('[MongoFortuneRepository] aiGeneratedAdviceの内容:', {
        hasSummary: !!aiGeneratedAdvice.summary,
        hasPersonalAdvice: !!aiGeneratedAdvice.personalAdvice,
        hasTeamAdvice: !!aiGeneratedAdvice.teamAdvice,
        hasLuckyPoints: !!aiGeneratedAdvice.luckyPoints
      });
      
      // 必要なフィールドが欠けていたら追加
      if (!aiGeneratedAdvice.summary) {
        console.log('[MongoFortuneRepository] aiGeneratedAdviceにsummaryが不足しているため追加します');
        aiGeneratedAdvice.summary = "本日は五行のエネルギーを活かして行動しましょう。";
      }
      if (!aiGeneratedAdvice.personalAdvice) {
        console.log('[MongoFortuneRepository] aiGeneratedAdviceにpersonalAdviceが不足しているため追加します');
        aiGeneratedAdvice.personalAdvice = "個人目標に向けて集中して取り組みましょう。";
      }
      if (!aiGeneratedAdvice.teamAdvice) {
        console.log('[MongoFortuneRepository] aiGeneratedAdviceにteamAdviceが不足しているため追加します');
        aiGeneratedAdvice.teamAdvice = "チームとの連携を大切にしてください。";
      }
      
      // luckyPointsをチェック
      if (!aiGeneratedAdvice.luckyPoints) {
        console.log('[MongoFortuneRepository] aiGeneratedAdviceにluckyPointsが不足しているため追加します');
        aiGeneratedAdvice.luckyPoints = {
          color: "赤",
          items: ["鈴", "明るい色の文房具"],
          number: 8,
          action: "朝日を浴びる"
        };
      } else {
        // luckyPointsの各項目をチェック
        if (!aiGeneratedAdvice.luckyPoints.color) {
          aiGeneratedAdvice.luckyPoints.color = "赤";
        }
        if (!Array.isArray(aiGeneratedAdvice.luckyPoints.items) || aiGeneratedAdvice.luckyPoints.items.length === 0) {
          aiGeneratedAdvice.luckyPoints.items = ["鈴", "明るい色の文房具"];
        }
        if (!aiGeneratedAdvice.luckyPoints.number) {
          aiGeneratedAdvice.luckyPoints.number = 8;
        }
        if (!aiGeneratedAdvice.luckyPoints.action) {
          aiGeneratedAdvice.luckyPoints.action = "朝日を浴びる";
        }
      }
      
      // 更新内容をログ出力
      console.log('[MongoFortuneRepository] 完成したaiGeneratedAdvice構造:', {
        hasSummary: !!aiGeneratedAdvice.summary,
        hasPersonalAdvice: !!aiGeneratedAdvice.personalAdvice,
        hasTeamAdvice: !!aiGeneratedAdvice.teamAdvice,
        hasLuckyPoints: !!aiGeneratedAdvice.luckyPoints,
        luckyPointsComplete: aiGeneratedAdvice.luckyPoints ? (
          !!aiGeneratedAdvice.luckyPoints.color && 
          Array.isArray(aiGeneratedAdvice.luckyPoints.items) && 
          aiGeneratedAdvice.luckyPoints.items.length > 0 &&
          !!aiGeneratedAdvice.luckyPoints.number && 
          !!aiGeneratedAdvice.luckyPoints.action
        ) : false
      });
    }
      
    return {
      userId: entity.userId,
      date: dateStr,
      dailyElement: this.determineDailyElement(entity.date),
      yinYang: entity.yinYangBalance?.yin > entity.yinYangBalance?.yang ? '陰' : '陽',
      overallLuck: entity.overallScore,
      // カテゴリスコアは最小値1が必要
      careerLuck: entity.careerLuck || Math.floor(Math.random() * 100) + 1, // 既存値または1-100のランダム値
      relationshipLuck: entity.relationshipLuck || Math.floor(Math.random() * 100) + 1, // 既存値または1-100のランダム値 
      healthLuck: entity.healthLuck || Math.floor(Math.random() * 100) + 1, // 既存値または1-100のランダム値
      creativeEnergyLuck: entity.creativeEnergyLuck || Math.floor(Math.random() * 100) + 1, // 既存値または1-100のランダム値
      wealthLuck: entity.wealthLuck || Math.floor(Math.random() * 100) + 1, // 既存値または1-100のランダム値
      description: this.generateDescription(entity),
      advice: adviceText, // テキスト形式のアドバイス
      aiGeneratedAdvice: aiGeneratedAdvice, // 構造化されたアドバイス
      luckyColors: entity.luckyItems || [],
      luckyDirections: ['東', '南', '西', '北'].sort(() => Math.random() - 0.5).slice(0, 2),
      compatibleElements: this.getCompatibleElements(this.determineDailyElement(entity.date)),
      incompatibleElements: this.getIncompatibleElements(this.determineDailyElement(entity.date)),
      ...(entity.id && { _id: entity.id })
    };
  }

  /**
   * ユーザーIDと日付で運勢を検索する
   * @param userId ユーザーID
   * @param date 日付
   * @returns 見つかった運勢またはnull
   */
  async findByUserIdAndDate(userId: string, date: Date): Promise<Fortune | null> {
    // 日付をYYYY-MM-DD形式に変換
    const dateStr = date.toISOString().split('T')[0];
    
    console.log(`[MongoFortuneRepository] findByUserIdAndDate: userId=${userId}, date=${dateStr}`);
    
    try {
      // findByUserAndDateメソッドを使用して運勢を検索
      const fortune = await this.fortuneModel.findByUserAndDate(userId, dateStr);
      
      if (!fortune) {
        console.log(`[MongoFortuneRepository] 運勢が見つかりませんでした: userId=${userId}, date=${dateStr}`);
        return null;
      }
      
      console.log(`[MongoFortuneRepository] 運勢が見つかりました: _id=${fortune._id}, userId=${fortune.userId}, date=${fortune.date}`);
      
      // Mongooseドキュメントからドメインエンティティへ変換
      return this.toDomainEntity(fortune);
    } catch (error) {
      console.error(`[MongoFortuneRepository] findByUserIdAndDate エラー: ${error}`);
      return null;
    }
  }

  /**
   * ユーザーIDに基づいて運勢履歴を取得する
   * @param userId ユーザーID
   * @param limit 取得する最大件数（オプション）
   * @returns ユーザーの運勢履歴
   */
  async findHistoryByUserId(userId: string, limit?: number): Promise<Fortune[]> {
    const history = await this.fortuneModel.findLatestByUser(userId, limit);
    return history.map(item => this.toDomainEntity(item));
  }

  /**
   * 特定の日付の全ユーザーの運勢を取得する
   * @param date 日付
   * @returns 指定日付の全ユーザーの運勢
   */
  async findAllByDate(date: Date): Promise<Fortune[]> {
    const dateStr = date.toISOString().split('T')[0];
    const fortunes = await this.fortuneModel.find({ date: dateStr }).exec();
    return fortunes.map(fortune => this.toDomainEntity(fortune));
  }

  /**
   * 特定のスコア範囲内の運勢を検索する
   * @param minScore 最小スコア
   * @param maxScore 最大スコア
   * @param date 特定の日付（オプション）
   * @returns スコア範囲内の運勢リスト
   */
  async findByScoreRange(minScore: number, maxScore: number, date?: Date): Promise<Fortune[]> {
    const query: any = {
      overallLuck: { $gte: minScore, $lte: maxScore }
    };
    
    if (date) {
      query.date = date.toISOString().split('T')[0];
    }
    
    const fortunes = await this.fortuneModel.find(query).exec();
    return fortunes.map(fortune => this.toDomainEntity(fortune));
  }
  
  /**
   * 運勢を閲覧済みとしてマークする
   * 
   * @deprecated この機能は削除されました。フロントエンドで閲覧状態を管理するようになりました。
   * @param fortuneId 運勢ID
   * @returns 操作が成功したかどうか
   */
  async markAsViewed(fortuneId: string): Promise<boolean> {
    console.warn(`[MongoFortuneRepository] markAsViewed: この機能は廃止されました。fortuneId=${fortuneId}`);
    return false;
  }
  
  /**
   * 文字列がMongoose ObjectIdとして有効かチェック
   * @param id チェックする文字列
   * @returns 有効なObjectIdかどうか
   */
  private isValidObjectId(id: string): boolean {
    try {
      const { Types } = require('mongoose');
      return Types.ObjectId.isValid(id);
    } catch (error) {
      return false;
    }
  }

  /**
   * 運勢スコアからレーティングへの変換
   * @param score 運勢スコア（1-100）
   * @returns 運勢レーティング
   */
  private mapScoreToRating(score: number): FortuneRating {
    if (score >= 80) return FortuneRating.EXCELLENT;
    if (score >= 60) return FortuneRating.GOOD;
    if (score >= 40) return FortuneRating.NEUTRAL;
    if (score >= 20) return FortuneRating.CAUTION;
    return FortuneRating.POOR;
  }

  /**
   * 日付から日次の属性を決定する
   * @param date 日付
   * @returns 五行の属性（木、火、土、金、水）
   */
  private determineDailyElement(date: Date | string): string {
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
      '木': ['水', '土'],
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

  /**
   * 運勢の説明文を生成
   * @param fortune 運勢エンティティ
   * @returns 説明文
   */
  private generateDescription(fortune: Fortune): string {
    const rating = this.mapScoreToRating(fortune.overallScore);
    const element = this.determineDailyElement(fortune.date);
    
    const descriptions: Record<FortuneRating, string> = {
      [FortuneRating.EXCELLENT]: `本日の五行は「${element}」で、全体運は非常に良好です。特に仕事面でのパフォーマンスが期待できる一日です。`,
      [FortuneRating.GOOD]: `本日の五行「${element}」の影響で、運気は上向きです。チームとの協力が成功をもたらすでしょう。`,
      [FortuneRating.NEUTRAL]: `本日の五行は「${element}」。平穏な一日ですが、コミュニケーションには注意が必要です。`,
      [FortuneRating.CAUTION]: `五行「${element}」の影響で、やや運気が低下しています。健康面に気を配り、無理をしないようにしましょう。`,
      [FortuneRating.POOR]: `本日の五行「${element}」は運気に影響を与えており、困難が予想されます。慎重な行動と柔軟な対応が重要です。`
    };
    
    return descriptions[rating];
  }
}