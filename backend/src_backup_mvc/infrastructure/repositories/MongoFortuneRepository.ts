import { inject, injectable } from 'tsyringe';
import { BaseRepository } from './base/BaseRepository';
import { IFortuneRepository } from '../../domain/repositories/IFortuneRepository';
import { Fortune, FortuneRating } from '../../domain/entities/Fortune';
import FortuneModel, { IFortuneDocument } from '../../models/fortune.model';

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
    @inject('FortuneModel') private fortuneModel: typeof FortuneModel
  ) {
    super(fortuneModel);
  }

  /**
   * Mongooseドキュメントからドメインエンティティへの変換
   * @param doc MongooseのFortuneドキュメント
   * @returns ドメインエンティティのFortune
   */
  protected toDomainEntity(doc: IFortuneDocument): Fortune {
    return {
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      date: new Date(doc.date),
      overallScore: doc.overallLuck,
      rating: this.mapScoreToRating(doc.overallLuck),
      categories: {
        work: doc.careerLuck,
        teamwork: doc.relationshipLuck,
        health: doc.healthLuck,
        communication: doc.creativeEnergyLuck
      },
      luckyItems: doc.luckyColors,  // 簡略化のため色をラッキーアイテムとして使用
      yinYangBalance: {
        yin: doc.yinYang === '陰' ? 70 : 30,
        yang: doc.yinYang === '陽' ? 70 : 30
      },
      advice: doc.advice,
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
      
    return {
      userId: entity.userId,
      date: dateStr,
      dailyElement: this.determineDailyElement(entity.date),
      yinYang: entity.yinYangBalance?.yin > entity.yinYangBalance?.yang ? '陰' : '陽',
      overallLuck: entity.overallScore,
      careerLuck: entity.categories.work,
      relationshipLuck: entity.categories.teamwork,
      healthLuck: entity.categories.health,
      creativeEnergyLuck: entity.categories.communication,
      wealthLuck: Math.floor(Math.random() * 100) + 1, // 派生値として計算
      description: this.generateDescription(entity),
      advice: entity.advice,
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
    const dateStr = date.toISOString().split('T')[0];
    const fortune = await this.fortuneModel.findByUserAndDate(userId, dateStr);
    if (!fortune) {
      return null;
    }
    return this.toDomainEntity(fortune);
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