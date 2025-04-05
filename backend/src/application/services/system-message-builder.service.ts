/**
 * SystemMessageBuilderサービス
 * 
 * 会話タイプに応じたシステムメッセージを構築する責務を持つサービス
 * 3つの会話タイプ（運勢、チーム、経営）に対応したメッセージビルド機能を提供
 * 初期メッセージの生成機能も含む
 * 
 * 作成日: 2025/04/04
 * 更新日: 2025/04/04 - 初期メッセージ生成機能を追加
 */
import { injectable, inject } from 'tsyringe';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IFortuneRepository } from '../../domain/repositories/IFortuneRepository';
import { ITeamRepository } from '../../domain/repositories/ITeamRepository';
import mongoose from 'mongoose';
import { ElementType, PillarType } from '../../shared/types/saju/core';
import { safeObjectAccess } from '../../utils/type-safety.util';

/**
 * システムメッセージコンテキストインターフェース
 * ビルダーに渡すコンテキスト情報を定義
 */
export interface SystemMessageContext {
  type: 'fortune' | 'team' | 'management';
  user: any; // ユーザー情報
  dailyFortune?: any; // デイリー運勢情報
  targetMember?: any; // チームメンバー情報（team タイプ用）
  team?: any; // チーム情報（management タイプ用）
  todayCalendarInfo?: any; // 当日の干支情報
}

/**
 * 3つの会話タイプに対応するシステムメッセージを構築するサービス
 */
@injectable()
export class SystemMessageBuilderService {
  constructor(
    @inject('IUserRepository') private userRepository: IUserRepository,
    @inject('IFortuneRepository') private fortuneRepository: IFortuneRepository,
    @inject('ITeamRepository') private teamRepository: ITeamRepository
  ) {}

  /**
   * メインのビルドメソッド - コンテキストに基づいて適切なメッセージを構築
   */
  public buildSystemMessage(context: SystemMessageContext): string {
    switch (context.type) {
      case 'fortune':
        return this.buildFortuneMessage(context.user, context.dailyFortune, context.todayCalendarInfo);
      case 'team':
        return this.buildTeamMessage(context.user, context.targetMember);
      case 'management':
        return this.buildManagementMessage(context.user, context.team);
      default:
        return this.buildDefaultMessage();
    }
  }

  /**
   * 運勢タイプのシステムメッセージを構築
   * ユーザーの四柱推命情報（四柱、十神、地支十神など）を含む
   */
  private buildFortuneMessage(user: any, fortune: any, todayCalendarInfo?: any): string {
    // ユーザーが存在しない場合はデフォルトメッセージを返す
    if (!user) {
      return '運勢に関する相談を受け付けます。どのようなことでも相談してください。';
    }

    // システムメッセージの構築
    let systemMessage = '';

    // 四柱推命プロファイルが存在する場合は詳細情報を含める
    if (user.sajuProfile && user.sajuProfile.fourPillars) {
      const { fourPillars, mainElement, yinYang, tenGods, branchTenGods } = user.sajuProfile;
      
      // データの存在確認
      const tenGodsExists = tenGods && Object.keys(tenGods).length > 0;
      const branchTenGodsExists = branchTenGods && Object.keys(branchTenGods).length > 0;
      
      systemMessage = `デイリー運勢に基づく相談を受け付けます。本日の運勢は「${fortune?.rating || '良好'}」です。\n\n`;
      
      // 基本情報
      systemMessage += `【基本情報】\n`;
      systemMessage += `- 主要五行: ${mainElement || '木'}\n`;
      systemMessage += `- 陰陽: ${yinYang || '陽'}\n`;
      
      // 四柱情報（存在する場合）
      if (fourPillars) {
        systemMessage += `\n【四柱】\n`;
        if (fourPillars.yearPillar) {
          systemMessage += `- 年柱: ${fourPillars.yearPillar.fullStemBranch || `${fourPillars.yearPillar.stem}${fourPillars.yearPillar.branch}`}\n`;
        }
        if (fourPillars.monthPillar) {
          systemMessage += `- 月柱: ${fourPillars.monthPillar.fullStemBranch || `${fourPillars.monthPillar.stem}${fourPillars.monthPillar.branch}`}\n`;
        }
        if (fourPillars.dayPillar) {
          systemMessage += `- 日柱: ${fourPillars.dayPillar.fullStemBranch || `${fourPillars.dayPillar.stem}${fourPillars.dayPillar.branch}`} (日主)\n`;
        }
        if (fourPillars.hourPillar) {
          systemMessage += `- 時柱: ${fourPillars.hourPillar.fullStemBranch || `${fourPillars.hourPillar.stem}${fourPillars.hourPillar.branch}`}\n`;
        }
      }
      
      // 十神関係（存在する場合）- 天干の十神関係
      if (tenGodsExists) {
        systemMessage += `\n【十神関係】\n`;
        // 型安全なイテレーション - Object.entriesは型情報を保持しないため、
        // キーが適切なPillarTypeであることを確認
        Object.entries(tenGods).forEach(([key, value]) => {
          // import { PillarType } from '../../shared/types/saju/core';
          // import { safeObjectAccess } from '../../utils/type-safety.util';
          // キーがPillarTypeであることを確認する（完全な型安全性のため）
          const pillarKey = key; // as PillarType;
          const tenGodValue = value; // safeObjectAccess(tenGods, pillarKey, '比肩');
          systemMessage += `- ${pillarKey}柱: ${tenGodValue}\n`;
        });
      }
      
      // 地支十神関係（存在する場合）- 地支の十神関係
      if (branchTenGodsExists) {
        systemMessage += `\n【地支十神関係】\n`;
        // 型安全なイテレーション
        Object.entries(branchTenGods).forEach(([key, value]) => {
          const pillarKey = key; // as PillarType;
          const branchTenGodValue = value; // safeObjectAccess(branchTenGods, pillarKey, '比肩');
          systemMessage += `- ${pillarKey}柱地支: ${branchTenGodValue}\n`;
        });
      }
      
      // 個人目標（存在する場合）
      if (user.personalGoal) {
        systemMessage += `\n【個人目標】\n${user.personalGoal}\n`;
      }
      
      // 当日の干支情報（存在する場合）
      if (todayCalendarInfo) {
        systemMessage += `\n【今日の干支情報】\n`;
        if (todayCalendarInfo.dayPillar) {
          // 日柱情報の安全な取得
          const dayPillar = todayCalendarInfo.dayPillar;
          const stem = dayPillar.stem || '';
          const branch = dayPillar.branch || '';
          systemMessage += `- 日柱: ${stem}${branch}\n`;
        }
        if (todayCalendarInfo.mainElement) {
          // 五行情報の安全な取得
          const mainElement = todayCalendarInfo.mainElement;
          const yinYang = todayCalendarInfo.yinYang || '陽';
          systemMessage += `- 五行: ${mainElement}の${yinYang}\n`;
        }
      }
      
      systemMessage += `\nこの情報をもとに、ユーザーの質問に回答してください。四柱推命の原理に基づいた深い洞察と実用的なアドバイスを提供してください。特に、ユーザーの「日主」と十神関係を重視し、今日の運勢に合わせたアドバイスを心がけてください。`;
    } else {
      // 四柱推命情報がない場合は基本的なプロンプトを返す
      // 型安全にデータにアクセス
      const rating = fortune?.rating || '良好';
      const sajuProfile = user.sajuProfile || {};
      const mainElement = sajuProfile.mainElement || '木';
      const yinYang = sajuProfile.yinYang || '陽';
      const personalGoal = user.personalGoal;
      
      systemMessage = `デイリー運勢に基づく相談を受け付けます。本日の運勢は「${rating}」で、「${mainElement}」の「${yinYang}」が特徴です。`;
      
      // 条件付きで個人目標情報を追加
      if (personalGoal) {
        systemMessage += ` あなたの目標「${personalGoal}」も考慮します。`;
      }
      
      systemMessage += ` どのようなことでも相談してください。`;
    }

    return systemMessage;
  }

  /**
   * チームタイプのメッセージを構築
   * ユーザーとターゲットメンバーの間の相性情報を含む
   */
  private buildTeamMessage(user: any, targetMember: any): string {
    // ユーザーまたはターゲットメンバーが存在しない場合はデフォルトメッセージを返す
    if (!user || !targetMember) {
      return 'チームに関する相談を受け付けます。チームのメンバー構成や目標に関するアドバイスを提供します。';
    }

    let systemMessage = 'チームメンバーとの相性に関する相談を受け付けます。\n\n';

    // ユーザー情報
    systemMessage += `【あなたの情報】\n`;
    if (user.sajuProfile) {
      // 型安全なアクセスのために変数を抽出
      const sajuProfile = user.sajuProfile;
      const mainElement = sajuProfile.mainElement || '木';
      const yinYang = sajuProfile.yinYang || '陽';
      
      systemMessage += `- 主要五行: ${mainElement}\n`;
      systemMessage += `- 陰陽: ${yinYang}\n`;
      
      // 四柱情報の安全なアクセス
      if (sajuProfile.fourPillars && sajuProfile.fourPillars.dayPillar) {
        const dayPillar = sajuProfile.fourPillars.dayPillar;
        const stem = dayPillar.stem || '';
        const branch = dayPillar.branch || '';
        systemMessage += `- 日主: ${stem}${branch}\n`;
      }
    }

    // ターゲットメンバー情報
    systemMessage += `\n【メンバーの情報】\n`;
    if (targetMember.sajuProfile) {
      // 型安全なアクセスのために変数を抽出
      const memberName = targetMember.name || '名前未設定';
      const sajuProfile = targetMember.sajuProfile;
      const mainElement = sajuProfile.mainElement || '木';
      const yinYang = sajuProfile.yinYang || '陽';
      
      systemMessage += `- 名前: ${memberName}\n`;
      systemMessage += `- 主要五行: ${mainElement}\n`;
      systemMessage += `- 陰陽: ${yinYang}\n`;
      
      // 四柱情報の安全なアクセス
      if (sajuProfile.fourPillars && sajuProfile.fourPillars.dayPillar) {
        const dayPillar = sajuProfile.fourPillars.dayPillar;
        const stem = dayPillar.stem || '';
        const branch = dayPillar.branch || '';
        systemMessage += `- 日主: ${stem}${branch}\n`;
      }
    }

    systemMessage += `\nこの情報をもとに、お互いの五行属性と相性を考慮した実用的なアドバイスを提供してください。協力関係の強化方法、コミュニケーションのコツ、潜在的な課題と解決策などについて具体的に説明してください。`;

    return systemMessage;
  }

  /**
   * 経営タイプのメッセージを構築
   * チーム全体の五行バランスと目標達成のためのアドバイスを含む
   */
  private buildManagementMessage(user: any, team: any): string {
    // ユーザーまたはチームが存在しない場合はデフォルトメッセージを返す
    if (!user || !team) {
      return '経営管理に関する相談を受け付けます。チーム全体の目標達成や人員配置に関するアドバイスを提供します。';
    }

    let systemMessage = 'チーム経営と管理に関する相談を受け付けます。\n\n';

    // マネージャー情報
    systemMessage += `【マネージャー情報】\n`;
    if (user.sajuProfile) {
      // 型安全なアクセスのために変数を抽出
      const sajuProfile = user.sajuProfile;
      const mainElement = sajuProfile.mainElement || '木';
      const yinYang = sajuProfile.yinYang || '陽';
      
      systemMessage += `- 主要五行: ${mainElement}\n`;
      systemMessage += `- 陰陽: ${yinYang}\n`;
      
      // 四柱情報の安全なアクセス
      if (sajuProfile.fourPillars && sajuProfile.fourPillars.dayPillar) {
        const dayPillar = sajuProfile.fourPillars.dayPillar;
        const stem = dayPillar.stem || '';
        const branch = dayPillar.branch || '';
        systemMessage += `- 日主: ${stem}${branch}\n`;
      }
    }

    // チーム情報
    systemMessage += `\n【チーム情報】\n`;
    systemMessage += `- チーム名: ${team.name || '名称未設定チーム'}\n`;
    systemMessage += `- チーム目標: ${team.goal || '目標未設定'}\n`;
    
    if (team.members && team.members.length > 0) {
      systemMessage += `- メンバー数: ${team.members.length}人\n`;
      
      // 五行分布の集計
      // Record<ElementType, number>として定義し、型安全性を確保
      const elementalDistribution: Record<string, number> = {
        '木': 0, '火': 0, '土': 0, '金': 0, '水': 0
      };
      
      // 型安全なアクセスを使用
      team.members.forEach((member: any) => {
        if (member.sajuProfile && member.sajuProfile.mainElement) {
          const element = member.sajuProfile.mainElement;
          // 有効な五行かチェックしてからアクセス
          if (element in elementalDistribution) {
            elementalDistribution[element as keyof typeof elementalDistribution]++;
          }
        }
      });
      
      systemMessage += `- 五行分布: `;
      Object.entries(elementalDistribution).forEach(([element, count]) => {
        if (count > 0) {
          systemMessage += `${element}(${count}) `;
        }
      });
      systemMessage += `\n`;
    }

    systemMessage += `\nこの情報をもとに、チーム全体の五行バランスを考慮した経営管理アドバイスを提供してください。最適な人員配置、リーダーシップアプローチ、目標達成のための戦略などについて具体的に説明してください。`;

    return systemMessage;
  }

  /**
   * デフォルトメッセージを構築
   */
  private buildDefaultMessage(): string {
    return '何かお手伝いできることはありますか？';
  }

  /**
   * ユーザーIDを使用して運勢タイプのシステムメッセージコンテキストを構築するユーティリティメソッド
   * direct-chat.tsとsimple-conversation.routes.tsからの移行を容易にするため
   */
  public async buildFortuneContextFromUserId(userId: string): Promise<SystemMessageContext | null> {
    try {
      // ユーザー情報の取得
      let user = await this.userRepository.findById(userId);
      
      if (!user) {
        console.log(`ユーザー情報が見つかりません: ID=${userId}`);
        return null;
      }
      
      // 今日の日付を取得
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // 今日の運勢情報を取得
      const dailyFortune = await this.fortuneRepository.findByUserIdAndDate(userId, today);
      
      // 当日の干支情報を取得（あれば）
      let todayCalendarInfo = null;
      try {
        const DailyCalendarInfoModel = mongoose.model('DailyCalendarInfo');
        const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
        todayCalendarInfo = await DailyCalendarInfoModel.findOne({ date: todayStr });
      } catch (calendarError) {
        console.warn('当日の干支情報取得エラー:', calendarError instanceof Error ? calendarError.message : '不明なエラー');
      }
      
      // コンテキストを構築
      return {
        type: 'fortune',
        user,
        dailyFortune,
        todayCalendarInfo
      };
    } catch (error) {
      console.error('運勢コンテキスト構築エラー:', error instanceof Error ? error.message : '不明なエラー');
      return null;
    }
  }
  
  /**
   * ユーザーIDを使用してチームタイプのシステムメッセージコンテキストを構築するユーティリティメソッド
   */
  public async buildTeamContextFromUserId(userId: string, targetMemberId: string): Promise<SystemMessageContext | null> {
    try {
      // ユーザー情報の取得
      let user = await this.userRepository.findById(userId);
      
      if (!user) {
        console.log(`ユーザー情報が見つかりません: ID=${userId}`);
        return null;
      }
      
      // ターゲットメンバー情報の取得
      let targetMember = await this.userRepository.findById(targetMemberId);
      
      if (!targetMember) {
        console.log(`ターゲットメンバー情報が見つかりません: ID=${targetMemberId}`);
        return null;
      }
      
      // コンテキストを構築
      return {
        type: 'team',
        user,
        targetMember
      };
    } catch (error) {
      console.error('チームコンテキスト構築エラー:', error instanceof Error ? error.message : '不明なエラー');
      return null;
    }
  }
  
  /**
   * ユーザーIDとチームIDを使用して経営タイプのシステムメッセージコンテキストを構築するユーティリティメソッド
   */
  public async buildManagementContextFromUserId(userId: string, teamId: string): Promise<SystemMessageContext | null> {
    try {
      // ユーザー情報の取得
      let user = await this.userRepository.findById(userId);
      
      if (!user) {
        console.log(`ユーザー情報が見つかりません: ID=${userId}`);
        return null;
      }
      
      // チーム情報の取得
      let team = await this.teamRepository.findById(teamId);
      
      if (!team) {
        console.log(`チーム情報が見つかりません: ID=${teamId}`);
        return null;
      }
      
      // コンテキストを構築
      return {
        type: 'management',
        user,
        team
      };
    } catch (error) {
      console.error('経営コンテキスト構築エラー:', error instanceof Error ? error.message : '不明なエラー');
      return null;
    }
  }
  
  /**
   * 運勢タイプの初期メッセージを生成する
   * simple-conversation.routes.tsの初期メッセージロジックを移行
   */
  public createFortuneInitialMessage(user: any, calendarInfo: any): string {
    if (!user) {
      return '今日の運勢について相談したいです。';
    }
    
    // ユーザーの運勢情報
    const todayFortune = user.todayFortune || {};
    const sajuProfile = user.sajuProfile || {};
    const personalGoal = user.personalGoal || '';
    
    // チーム情報 (現状は空)
    const teamGoal = '';
    
    // 要素が存在しない場合のフォールバック
    const mainElement = todayFortune.mainElement || sajuProfile.mainElement || '木';
    const yinYang = todayFortune.yinYang || sajuProfile.yinYang || '陽';
    const overallScore = todayFortune.overallScore || 50;
    const rating = overallScore >= 80 ? '絶好調' : 
                   overallScore >= 60 ? '好調' : 
                   overallScore >= 40 ? '普通' : 
                   overallScore >= 20 ? '要注意' : '厳しい';
    
    // アドバイス情報
    const advice = todayFortune.advice || '';
    const aiGeneratedAdvice = todayFortune.aiGeneratedAdvice?.advice || '';
    
    // 日次カレンダー情報
    const today = new Date();
    const dayElement = calendarInfo?.mainElement || '';
    const dayYinYang = calendarInfo?.dayYinYang || '';
    const dayPillar = calendarInfo?.dayPillar 
                     ? `${calendarInfo.dayPillar.stem}${calendarInfo.dayPillar.branch}` 
                     : '';
    
    // メッセージを構築
    return `
今日の運勢情報:
五行属性: ${mainElement}の${yinYang}
運勢スコア: ${overallScore}/100点 (${rating})
${dayPillar ? `今日の干支: ${dayPillar}` : ''}
${dayElement ? `今日の五行: ${dayElement}の${dayYinYang}` : ''}

【運勢アドバイス】
${advice}

${aiGeneratedAdvice ? `【詳細アドバイス】
${aiGeneratedAdvice.length > 300 ? aiGeneratedAdvice.substring(0, 300) + '...' : aiGeneratedAdvice}` : ''}

${personalGoal ? `【個人目標】
${personalGoal}` : ''}

${teamGoal ? `【チーム目標】
${teamGoal}` : ''}

上記の情報を踏まえて、今日一日をどのように過ごすべきか相談したいです。`;
  }
}