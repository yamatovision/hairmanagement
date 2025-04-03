import { inject, injectable } from 'tsyringe';
import { BaseRepository } from './base/BaseRepository';
import DailyCalendarInfoModel, { IDailyCalendarInfoDocument } from '../../domain/models/daily-calendar-info.model';

/**
 * 日次カレンダー情報のリポジトリインターフェース
 */
export interface IDailyCalendarInfoRepository {
  /**
   * 日付で日次カレンダー情報を検索
   * @param date 日付文字列 (YYYY-MM-DD形式)
   */
  findByDate(date: string): Promise<any | null>;
  
  /**
   * 日付範囲で日次カレンダー情報を検索
   * @param startDate 開始日 (YYYY-MM-DD形式)
   * @param endDate 終了日 (YYYY-MM-DD形式)
   */
  findByDateRange(startDate: string, endDate: string): Promise<any[]>;
  
  /**
   * 日次カレンダー情報の保存
   * @param data 保存するデータ
   */
  create(data: any): Promise<any>;
  
  /**
   * 日次カレンダー情報の更新
   * @param date 日付文字列 (YYYY-MM-DD形式)
   * @param data 更新するデータ
   */
  update(date: string, data: any): Promise<any | null>;
}

/**
 * MongoDBを使用した日次カレンダー情報リポジトリの実装
 */
@injectable()
export class MongoDailyCalendarInfoRepository extends BaseRepository<any, string> implements IDailyCalendarInfoRepository {
  /**
   * コンストラクタ
   * @param dailyCalendarInfoModel DailyCalendarInfoモデルのMongooseインスタンス
   */
  constructor(
    @inject('DailyCalendarInfoModel') private dailyCalendarInfoModel: any
  ) {
    super(dailyCalendarInfoModel);
  }

  /**
   * ドキュメントからエンティティへの変換
   * 現状はオブジェクトをそのまま返す簡易実装
   */
  protected toDomainEntity(doc: IDailyCalendarInfoDocument): any {
    if (!doc) return null;
    
    const entity = {
      id: doc._id.toString(),
      date: doc.date,
      yearPillar: doc.yearPillar,
      monthPillar: doc.monthPillar,
      dayPillar: doc.dayPillar,
      hourPillar: doc.hourPillar,
      mainElement: doc.mainElement,
      dayYinYang: doc.dayYinYang,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
    
    return entity;
  }

  /**
   * エンティティからモデルデータへの変換
   * 現状はオブジェクトをそのまま返す簡易実装
   */
  protected toModelData(entity: any): any {
    return {
      date: entity.date,
      yearPillar: entity.yearPillar,
      monthPillar: entity.monthPillar,
      dayPillar: entity.dayPillar,
      hourPillar: entity.hourPillar,
      mainElement: entity.mainElement,
      dayYinYang: entity.dayYinYang,
      ...(entity.id && { _id: entity.id })
    };
  }

  /**
   * 日付で日次カレンダー情報を検索
   * @param date 日付文字列 (YYYY-MM-DD形式)
   * @returns 見つかった日次カレンダー情報またはnull
   */
  async findByDate(date: string): Promise<any | null> {
    const calendarInfo = await this.dailyCalendarInfoModel.findByDate(date);
    if (!calendarInfo) {
      return null;
    }
    return this.toDomainEntity(calendarInfo);
  }

  /**
   * 日付範囲で日次カレンダー情報を検索
   * @param startDate 開始日 (YYYY-MM-DD形式)
   * @param endDate 終了日 (YYYY-MM-DD形式)
   * @returns 日次カレンダー情報の配列
   */
  async findByDateRange(startDate: string, endDate: string): Promise<any[]> {
    const calendarInfos = await this.dailyCalendarInfoModel.findByDateRange(startDate, endDate);
    return calendarInfos.map(info => this.toDomainEntity(info));
  }

  /**
   * 今日の日次カレンダー情報を取得または作成
   * @param calculator 日次カレンダー情報を計算する関数
   * @returns 今日の日次カレンダー情報
   */
  async getOrCreateTodayInfo(calculator: () => Promise<any>): Promise<any> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD形式
    
    // 今日の情報を検索
    const existingInfo = await this.findByDate(today);
    if (existingInfo) {
      return existingInfo;
    }
    
    // 存在しない場合は計算して保存
    const calculatedInfo = await calculator();
    calculatedInfo.date = today;
    
    return this.create(calculatedInfo);
  }
}