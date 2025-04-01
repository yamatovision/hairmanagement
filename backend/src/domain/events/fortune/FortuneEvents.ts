/**
 * FortuneEvents
 * 運勢予測ドメインのイベント
 * 
 * 変更履歴:
 * - 2025/3/30: 初期実装 (Claude)
 */

import { DomainEvent } from '../shared/DomainEvent';

/**
 * 運勢作成イベント
 */
export class FortuneCreatedEvent extends DomainEvent {
  /**
   * コンストラクタ
   * @param fortuneId 運勢ID
   * @param userId ユーザーID
   * @param date 運勢の対象日
   * @param fortuneScore 運勢スコア
   * @param attributes 運勢の属性情報
   */
  constructor(
    public readonly fortuneId: string,
    public readonly userId: string,
    public readonly date: Date,
    public readonly fortuneScore: number,
    public readonly attributes: {
      mainElement: string;
      polarity: 'yin' | 'yang';
      secondaryElement?: string;
      keywords: string[];
      luckyItems?: string[];
    }
  ) {
    super('fortune.created', {
      source: {
        entityType: 'Fortune',
        entityId: fortuneId,
        userId: userId
      }
    });
  }

  /**
   * イベントのペイロードを取得
   */
  getPayload(): any {
    return {
      fortuneId: this.fortuneId,
      userId: this.userId,
      date: this.date.toISOString(),
      fortuneScore: this.fortuneScore,
      attributes: this.attributes
    };
  }
}

/**
 * 運勢閲覧イベント
 */
export class FortuneViewedEvent extends DomainEvent {
  /**
   * コンストラクタ
   * @param fortuneId 運勢ID
   * @param userId ユーザーID
   * @param viewDate 閲覧日時
   */
  constructor(
    public readonly fortuneId: string,
    public readonly userId: string,
    public readonly viewDate: Date = new Date()
  ) {
    super('fortune.viewed', {
      source: {
        entityType: 'Fortune',
        entityId: fortuneId,
        userId: userId
      }
    });
  }

  /**
   * イベントのペイロードを取得
   */
  getPayload(): any {
    return {
      fortuneId: this.fortuneId,
      userId: this.userId,
      viewDate: this.viewDate.toISOString()
    };
  }
}

/**
 * 相性計算イベント
 */
export class CompatibilityCalculatedEvent extends DomainEvent {
  /**
   * コンストラクタ
   * @param sourceUserId ソースユーザーID
   * @param targetUserId ターゲットユーザーID
   * @param compatibilityScore 相性スコア
   * @param context 相性計算のコンテキスト
   */
  constructor(
    public readonly sourceUserId: string,
    public readonly targetUserId: string,
    public readonly compatibilityScore: number,
    public readonly context?: {
      situation?: string;
      teamId?: string;
      calculationType?: 'personal' | 'professional' | 'team';
      strengthAreas?: string[];
      challengeAreas?: string[];
    }
  ) {
    super('fortune.compatibility.calculated', {
      source: {
        entityType: 'User',
        entityId: sourceUserId,
        userId: sourceUserId
      },
      tracking: {
        correlationId: `compatibility-${sourceUserId}-${targetUserId}`
      }
    });
  }

  /**
   * イベントのペイロードを取得
   */
  getPayload(): any {
    return {
      sourceUserId: this.sourceUserId,
      targetUserId: this.targetUserId,
      compatibilityScore: this.compatibilityScore,
      context: this.context
    };
  }
}

/**
 * エレメンタルプロファイル更新イベント
 */
export class ElementalProfileUpdatedEvent extends DomainEvent {
  /**
   * コンストラクタ
   * @param userId ユーザーID
   * @param oldProfile 古いプロファイル
   * @param newProfile 新しいプロファイル
   * @param updateSource 更新ソース
   */
  constructor(
    public readonly userId: string,
    public readonly oldProfile: {
      element: string;
      yinYang: 'yin' | 'yang';
      intensity: number;
    },
    public readonly newProfile: {
      element: string;
      yinYang: 'yin' | 'yang';
      intensity: number;
    },
    public readonly updateSource: 'user' | 'system' | 'admin' = 'user'
  ) {
    super('fortune.elemental_profile.updated', {
      source: {
        entityType: 'User',
        entityId: userId,
        userId: userId
      }
    });
  }

  /**
   * イベントのペイロードを取得
   */
  getPayload(): any {
    return {
      userId: this.userId,
      oldProfile: this.oldProfile,
      newProfile: this.newProfile,
      updateSource: this.updateSource
    };
  }
}

/**
 * 五行アドバイス生成イベント
 */
export class ElementalAdviceGeneratedEvent extends DomainEvent {
  /**
   * コンストラクタ
   * @param userId ユーザーID
   * @param adviceId アドバイスID
   * @param fortuneId 関連する運勢ID
   * @param advice アドバイス内容
   */
  constructor(
    public readonly userId: string,
    public readonly adviceId: string,
    public readonly fortuneId?: string,
    public readonly advice?: {
      type: 'daily' | 'weekly' | 'monthly' | 'situational';
      targetElement: string;
      recommendedActions: string[];
      avoidanceActions: string[];
      luckyDirections?: string[];
      luckyColors?: string[];
    }
  ) {
    super('fortune.elemental_advice.generated', {
      source: {
        entityType: 'Fortune',
        entityId: fortuneId || adviceId,
        userId: userId
      }
    });
  }

  /**
   * イベントのペイロードを取得
   */
  getPayload(): any {
    return {
      userId: this.userId,
      adviceId: this.adviceId,
      fortuneId: this.fortuneId,
      advice: this.advice
    };
  }
}