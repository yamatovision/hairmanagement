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
    
    // aiGeneratedAdviceを持っている場合、構造化データとして処理
    if (doc.aiGeneratedAdvice) {
      console.log('[MongoFortuneRepository] aiGeneratedAdviceを構造化データとして処理します');
      
      // 型アサーションを使用して旧構造のプロパティにアクセス
      const oldFormat = doc.aiGeneratedAdvice as any;
      
      // 新しい構造（advice + luckyPoints）のチェック
      if (doc.aiGeneratedAdvice.advice === undefined && 
          (oldFormat.summary || oldFormat.personalAdvice || oldFormat.teamAdvice)) {
        // 旧構造から新構造への変換（移行用コード）
        console.log('[MongoFortuneRepository] 旧構造のaiGeneratedAdviceを新構造に変換します');
        
        // マークダウン形式のアドバイスを構築
        let adviceText = '';
        
        if (oldFormat.summary) {
          adviceText += `# 今日のあなたの運気\n${oldFormat.summary}\n\n`;
        }
        
        if (oldFormat.personalAdvice) {
          adviceText += `# 個人目標へのアドバイス\n${oldFormat.personalAdvice}\n\n`;
        }
        
        if (oldFormat.teamAdvice) {
          adviceText += `# チーム目標へのアドバイス\n${oldFormat.teamAdvice}\n\n`;
        }
        
        // 新しい構造に変換
        doc.aiGeneratedAdvice = {
          advice: adviceText.trim(),
          luckyPoints: oldFormat.luckyPoints || {
            color: "赤",
            items: ["鈴", "明るい色の文房具"],
            number: 8,
            action: "朝日を浴びる"
          }
        };
      }
      
      // adviceフィールドのチェック
      if (!doc.aiGeneratedAdvice.advice) {
        console.log('[MongoFortuneRepository] aiGeneratedAdviceにadviceが不足しているため追加します');
        doc.aiGeneratedAdvice.advice = typeof doc.advice === 'string' ? doc.advice : 
          "# 今日のあなたの運気\n本日は五行のエネルギーを活かして行動しましょう。\n\n# 個人目標へのアドバイス\n個人目標に向けて集中して取り組みましょう。\n\n# チーム目標へのアドバイス\nチームとの連携を大切にしてください。";
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
          const parsedAdvice = JSON.parse(doc.advice) as any;
          
          // 古い形式の構造化データ（summary, personalAdvice, teamAdvice）
          if (parsedAdvice.summary || parsedAdvice.personalAdvice || parsedAdvice.teamAdvice || parsedAdvice.luckyPoints) {
            console.log('[MongoFortuneRepository] adviceからaiGeneratedAdviceを抽出しました');
            
            // マークダウン形式のアドバイスを構築
            let adviceText = '';
            
            if (parsedAdvice.summary) {
              adviceText += `# 今日のあなたの運気\n${parsedAdvice.summary}\n\n`;
            }
            
            if (parsedAdvice.personalAdvice) {
              adviceText += `# 個人目標へのアドバイス\n${parsedAdvice.personalAdvice}\n\n`;
            }
            
            if (parsedAdvice.teamAdvice) {
              adviceText += `# チーム目標へのアドバイス\n${parsedAdvice.teamAdvice}\n\n`;
            }
            
            // 新形式が既に含まれている場合はそれを優先
            if (parsedAdvice.advice) {
              adviceText = parsedAdvice.advice;
            }
            
            doc.aiGeneratedAdvice = {
              advice: adviceText.trim() || (typeof doc.advice === 'string' ? doc.advice : 
                "# 今日のあなたの運気\n本日は五行のエネルギーを活かして行動しましょう。\n\n# 個人目標へのアドバイス\n個人目標に向けて集中して取り組みましょう。\n\n# チーム目標へのアドバイス\nチームとの連携を大切にしてください。"),
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
      
      // aiGeneratedAdviceが存在しない場合、マークダウン形式のデフォルト値を作成
      if (!doc.aiGeneratedAdvice) {
        console.log('[MongoFortuneRepository] aiGeneratedAdviceが存在しないため、デフォルト値を作成します');
        const defaultAdvice = typeof doc.advice === 'string' ? doc.advice : 
          "本日は五行のエネルギーを活かして行動しましょう。";
          
        doc.aiGeneratedAdvice = {
          advice: `# 今日のあなたの運気\n${defaultAdvice}\n\n# 個人目標へのアドバイス\n個人目標に向けて集中して取り組みましょう。\n\n# チーム目標へのアドバイス\nチームとの連携を大切にしてください。`,
          luckyPoints: {
            color: "赤",
            items: ["鈴", "明るい色の文房具"],
            number: 8,
            action: "朝日を浴びる"
          }
        };
      }
    }
    
    // 変換済みのaiGeneratedAdviceの詳細をログ出力
    console.log('[MongoFortuneRepository] 変換後のaiGeneratedAdvice:', {
      hasAdvice: !!doc.aiGeneratedAdvice?.advice,
      adviceLength: doc.aiGeneratedAdvice?.advice ? doc.aiGeneratedAdvice.advice.length : 0,
      hasLuckyPoints: !!doc.aiGeneratedAdvice?.luckyPoints,
      luckyPointsComplete: doc.aiGeneratedAdvice?.luckyPoints ? (
        !!doc.aiGeneratedAdvice.luckyPoints.color && 
        Array.isArray(doc.aiGeneratedAdvice.luckyPoints.items) && 
        doc.aiGeneratedAdvice.luckyPoints.items.length > 0 &&
        !!doc.aiGeneratedAdvice.luckyPoints.number && 
        !!doc.aiGeneratedAdvice.luckyPoints.action
      ) : false
    });
    
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
    
    // 初期値を設定
    let adviceText = entity.advice;
    let aiGeneratedAdvice = entity.aiGeneratedAdvice;
    
    console.log(`[MongoFortuneRepository] toModelData 開始: entityId=${entity.id}, adviceType=${typeof entity.advice}, hasAiGeneratedAdvice=${!!entity.aiGeneratedAdvice}`);
    
    // adviceがJSON文字列かチェック
    if (typeof entity.advice === 'string' && 
        entity.advice.trim().startsWith('{') && 
        entity.advice.trim().endsWith('}') && 
        !entity.aiGeneratedAdvice) {
      try {
        console.log('[MongoFortuneRepository] adviceをJSON文字列として解析を試みます');
        const parsedAdvice = JSON.parse(entity.advice);
        
        // parsedAdviceの構造をログ出力
        console.log('[MongoFortuneRepository] JSON解析結果:', {
          hasAdvice: !!parsedAdvice.advice,
          hasSummary: !!parsedAdvice.summary,
          hasPersonalAdvice: !!parsedAdvice.personalAdvice,
          hasTeamAdvice: !!parsedAdvice.teamAdvice,
          hasLuckyPoints: !!parsedAdvice.luckyPoints
        });
        
        // 新形式のデータ（advice + luckyPoints）
        if (parsedAdvice.advice || parsedAdvice.summary || parsedAdvice.personalAdvice || parsedAdvice.teamAdvice || parsedAdvice.luckyPoints) {
          console.log('[MongoFortuneRepository] adviceから構造化データを抽出しました');
          
          // マークダウン形式のアドバイスを構築
          let adviceMarkdown = '';
          
          // 既に新形式（advice）がある場合はそれを使用
          if (parsedAdvice.advice) {
            adviceMarkdown = parsedAdvice.advice;
          } 
          // 旧形式（summary, personalAdvice, teamAdvice）から構築
          else if (parsedAdvice.summary || parsedAdvice.personalAdvice || parsedAdvice.teamAdvice) {
            if (parsedAdvice.summary) {
              adviceMarkdown += `# 今日のあなたの運気\n${parsedAdvice.summary}\n\n`;
            }
            
            if (parsedAdvice.personalAdvice) {
              adviceMarkdown += `# 個人目標へのアドバイス\n${parsedAdvice.personalAdvice}\n\n`;
            }
            
            if (parsedAdvice.teamAdvice) {
              adviceMarkdown += `# チーム目標へのアドバイス\n${parsedAdvice.teamAdvice}\n\n`;
            }
          }
          
          // デフォルトのマークダウン形式
          if (!adviceMarkdown) {
            adviceMarkdown = "# 今日のあなたの運気\n本日は五行のエネルギーを活かして行動しましょう。\n\n# 個人目標へのアドバイス\n個人目標に向けて集中して取り組みましょう。\n\n# チーム目標へのアドバイス\nチームとの連携を大切にしてください。";
          }
          
          // 新形式のaiGeneratedAdviceオブジェクトを作成
          aiGeneratedAdvice = {
            advice: adviceMarkdown.trim(),
            luckyPoints: {
              color: parsedAdvice.luckyPoints?.color || "赤",
              items: Array.isArray(parsedAdvice.luckyPoints?.items) && parsedAdvice.luckyPoints.items.length > 0 
                ? parsedAdvice.luckyPoints.items 
                : ["鈴", "明るい色の文房具"],
              number: parsedAdvice.luckyPoints?.number || 8,
              action: parsedAdvice.luckyPoints?.action || "朝日を浴びる"
            }
          };
          
          // 通常のアドバイステキストも更新
          adviceText = parsedAdvice.summary || parsedAdvice.advice || entity.advice;
        }
      } catch (error) {
        console.log('[MongoFortuneRepository] adviceのJSON解析に失敗しました:', 
          error instanceof Error ? error.message : 'Unknown error');
      }
    }
    
    // aiGeneratedAdviceの処理状況をログ出力
    console.log(`[MongoFortuneRepository] JSON解析後: entityId=${entity.id}, hasAiGeneratedAdvice=${!!aiGeneratedAdvice}`);
    
    // aiGeneratedAdviceがある場合は必要なフィールドを全て追加する
    if (aiGeneratedAdvice) {
      console.log('[MongoFortuneRepository] aiGeneratedAdviceの内容:', {
        hasAdvice: !!aiGeneratedAdvice.advice,
        adviceLength: aiGeneratedAdvice.advice ? aiGeneratedAdvice.advice.length : 0,
        hasLuckyPoints: !!aiGeneratedAdvice.luckyPoints,
        luckyPointsComplete: aiGeneratedAdvice.luckyPoints ? (
          !!aiGeneratedAdvice.luckyPoints.color && 
          Array.isArray(aiGeneratedAdvice.luckyPoints.items) && 
          aiGeneratedAdvice.luckyPoints.items.length > 0 &&
          !!aiGeneratedAdvice.luckyPoints.number && 
          !!aiGeneratedAdvice.luckyPoints.action
        ) : false
      });
      
      // 旧形式のプロパティへのアクセス（移行用）
      const oldFormat = aiGeneratedAdvice as any;
      
      // 旧形式から新形式への変換（移行用コード）
      if (aiGeneratedAdvice.advice === undefined && 
          (oldFormat.summary || oldFormat.personalAdvice || oldFormat.teamAdvice)) {
        console.log('[MongoFortuneRepository] 旧形式から新形式へ変換します');
        
        // マークダウン形式のアドバイスを構築
        let adviceMarkdown = '';
        
        if (oldFormat.summary) {
          adviceMarkdown += `# 今日のあなたの運気\n${oldFormat.summary}\n\n`;
        }
        
        if (oldFormat.personalAdvice) {
          adviceMarkdown += `# 個人目標へのアドバイス\n${oldFormat.personalAdvice}\n\n`;
        }
        
        if (oldFormat.teamAdvice) {
          adviceMarkdown += `# チーム目標へのアドバイス\n${oldFormat.teamAdvice}\n\n`;
        }
        
        // 新しい形式のオブジェクトを作成
        aiGeneratedAdvice = {
          advice: adviceMarkdown.trim(),
          luckyPoints: oldFormat.luckyPoints || {
            color: "赤",
            items: ["鈴", "明るい色の文房具"],
            number: 8,
            action: "朝日を浴びる"
          }
        };
      }
      
      // adviceフィールドの確認と補完
      if (!aiGeneratedAdvice.advice) {
        console.log('[MongoFortuneRepository] aiGeneratedAdviceにadviceが不足しているため追加します');
        aiGeneratedAdvice.advice = "# 今日のあなたの運気\n本日は五行のエネルギーを活かして行動しましょう。\n\n# 個人目標へのアドバイス\n個人目標に向けて集中して取り組みましょう。\n\n# チーム目標へのアドバイス\nチームとの連携を大切にしてください。";
      }
      
      // luckyPointsの確認と補完
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
    } 
    // aiGeneratedAdviceがない場合、デフォルト値を作成
    else if (typeof entity.advice === 'string') {
      console.log('[MongoFortuneRepository] aiGeneratedAdviceが存在しないため、デフォルト値を作成します');
      
      // 通常のアドバイスからマークダウン形式のアドバイスを作成
      const defaultAdvice = entity.advice || "本日は五行のエネルギーを活かして行動しましょう。";
      
      aiGeneratedAdvice = {
        advice: `# 今日のあなたの運気\n${defaultAdvice}\n\n# 個人目標へのアドバイス\n個人目標に向けて集中して取り組みましょう。\n\n# チーム目標へのアドバイス\nチームとの連携を大切にしてください。`,
        luckyPoints: {
          color: "赤",
          items: ["鈴", "明るい色の文房具"],
          number: 8,
          action: "朝日を浴びる"
        }
      };
    }
    
    // 最終的なaiGeneratedAdvice構造をログ出力
    console.log('[MongoFortuneRepository] 最終的なaiGeneratedAdvice構造:', {
      hasAdvice: !!aiGeneratedAdvice?.advice,
      adviceLength: aiGeneratedAdvice?.advice ? aiGeneratedAdvice.advice.length : 0,
      hasLuckyPoints: !!aiGeneratedAdvice?.luckyPoints,
      luckyPointsComplete: aiGeneratedAdvice?.luckyPoints ? (
        !!aiGeneratedAdvice.luckyPoints.color && 
        Array.isArray(aiGeneratedAdvice.luckyPoints.items) && 
        aiGeneratedAdvice.luckyPoints.items.length > 0 &&
        !!aiGeneratedAdvice.luckyPoints.number && 
        !!aiGeneratedAdvice.luckyPoints.action
      ) : false
    });
    
    // 最終的なトレースログ
    console.log(`[MongoFortuneRepository] toModelData 完了: aiGeneratedAdvice=${!!aiGeneratedAdvice}`);
      
    return {
      userId: entity.userId,
      date: dateStr,
      dailyElement: this.determineDailyElement(entity.date),
      yinYang: entity.yinYangBalance && 
        typeof entity.yinYangBalance.yin === 'number' && 
        typeof entity.yinYangBalance.yang === 'number' && 
        entity.yinYangBalance.yin > entity.yinYangBalance.yang ? '陰' : '陽',
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