/**
 * 共有型定義
 * ※このファイルは ../../../shared/src/index.ts からコピーした型定義です
 * フロントエンドアプリケーション内で参照しやすくするために配置しています
 */

// ===============================================================
// 基本型定義（陰陽五行関連）
// ===============================================================

// 五行の基本要素
export type ElementType = '木' | '火' | '土' | '金' | '水';

// 陰陽
export type YinYangType = '陰' | '陽';

// 五行の相生関係 (相互に育む関係)
export const ELEMENT_GENERATING_RELATIONS = {
  '木': '火', // 木は火を生む
  '火': '土', // 火は土を生む
  '土': '金', // 土は金を生む
  '金': '水', // 金は水を生む
  '水': '木'  // 水は木を生む
};

// 五行の相剋関係 (相互に抑制する関係)
export const ELEMENT_CONTROLLING_RELATIONS = {
  '木': '土', // 木は土を剋する
  '土': '水', // 土は水を剋する
  '水': '火', // 水は火を剋する
  '火': '金', // 火は金を剋する
  '金': '木'  // 金は木を剋する
};

// 相生の説明文
export const GENERATING_DESCRIPTIONS = {
  '木→火': '木は燃えて火を育みます',
  '火→土': '火の灰は土を豊かにします',
  '土→金': '土の中から金属が産出されます',
  '金→水': '金属が冷えると水滴が生じます',
  '水→木': '水は木の成長を助けます'
};

// 相剋の説明文
export const CONTROLLING_DESCRIPTIONS = {
  '木→土': '木の根は土を抑えます',
  '土→水': '土は水を堰き止めます',
  '水→火': '水は火を消します',
  '火→金': '火は金属を溶かします',
  '金→木': '金属の刃物は木を切ります'
};

// 運勢に関連するカテゴリ
export enum FortuneCategory {
  CAREER = 'career',       // キャリア運
  RELATIONSHIP = 'relationship', // 人間関係運
  CREATIVITY = 'creativity',   // 創造力運
  HEALTH = 'health',       // 健康運
  WEALTH = 'wealth'        // 金運
}

// 五行要素ごとの色とキーワード
export const ELEMENT_PROPERTIES = {
  '木': {
    color: '#a5d6a7',          // 緑
    textColor: '#1b5e20',
    keywords: ['成長', '発展', '柔軟性', '創造性', '決断力'],
    season: '春',
    direction: '東',
    strengths: ['適応力', '計画性', '直感力', '優しさ', '寛容さ'],
    weaknesses: ['怒りっぽさ', '頑固さ', '焦り', '自己中心的', '批判的']
  },
  '火': {
    color: '#ffab91',          // 赤
    textColor: '#bf360c',
    keywords: ['情熱', '変化', '行動力', '表現力', '拡大'],
    season: '夏',
    direction: '南',
    strengths: ['情熱', 'リーダーシップ', '社交性', '魅力', '直感'],
    weaknesses: ['衝動的', '短気', '支配的', '自己顕示欲', '落ち着きのなさ']
  },
  '土': {
    color: '#d7ccc8',          // 黄土色
    textColor: '#4e342e',
    keywords: ['安定', '中心', '思考力', '調和', '信頼'],
    season: '季節の変わり目',
    direction: '中央',
    strengths: ['信頼性', '実用性', '堅実さ', '思慮深さ', '安定感'],
    weaknesses: ['心配性', '保守的', '優柔不断', '固執', '頑固さ']
  },
  '金': {
    color: '#e0e0e0',          // 銀/白
    textColor: '#424242',
    keywords: ['収穫', '確実性', '正確さ', '決断力', '潔癖'],
    season: '秋',
    direction: '西',
    strengths: ['効率性', '几帳面さ', '正確さ', '分析力', '完璧主義'],
    weaknesses: ['批判的', '冷淡', '独断的', '融通が利かない', '強迫観念']
  },
  '水': {
    color: '#81d4fa',          // 青
    textColor: '#01579b',
    keywords: ['知恵', '柔軟性', '持久力', '深み', '静けさ'],
    season: '冬',
    direction: '北',
    strengths: ['知性', '洞察力', '直感', '柔軟性', '忍耐力'],
    weaknesses: ['恐れ', '優柔不断', '意志薄弱', '冷たさ', '無関心']
  }
};

// 陰陽の特性
export const YIN_YANG_PROPERTIES = {
  '陰': {
    nature: ['静', '暗', '寒', '内向', '物質的'],
    traits: ['内省的', '受動的', '秩序を好む', '落ち着いている', '協調的'],
    energy: '収縮するエネルギー'
  },
  '陽': {
    nature: ['動', '明', '熱', '外向', '精神的'],
    traits: ['活動的', '能動的', '冒険好き', 'エネルギッシュ', '独立心が強い'],
    energy: '拡張するエネルギー'
  }
};

// 日ごとの陰陽五行の組み合わせを生成するための干支マッピング
// 専門的な実装には易学や九星気学に基づいた複雑な計算を要するため
// ここでは単純化したモデルを使用する
export const SIMPLIFIED_DAY_CALCULATION = {
  // 日付から五行を単純計算（月+日を5で割った余り）
  dayElementMap: [
    '木', // 余り0
    '火', // 余り1
    '土', // 余り2
    '金', // 余り3
    '水'  // 余り4
  ],
  // 日付から陰陽を計算（奇数=陽、偶数=陰）
  dayYinYangMap: {
    odd: '陽',
    even: '陰'
  }
};

// 相性評価レベル
export enum CompatibilityLevel {
  EXCELLENT = 'excellent', // 相生で強い相性
  GOOD = 'good',       // 相生
  NEUTRAL = 'neutral',   // 中立
  CHALLENGING = 'challenging', // 相剋があるが成長の可能性
  DIFFICULT = 'difficult'   // 相剋で困難な相性
}

// 相性レベルの説明と数値評価
export const COMPATIBILITY_RATINGS = {
  [CompatibilityLevel.EXCELLENT]: {
    value: 5,
    description: '非常に良い相性。お互いを高め合う関係です。'
  },
  [CompatibilityLevel.GOOD]: {
    value: 4,
    description: '良い相性。協力することで成果を上げられます。'
  },
  [CompatibilityLevel.NEUTRAL]: {
    value: 3,
    description: '普通の相性。特に問題はありませんが、特別な強みもありません。'
  },
  [CompatibilityLevel.CHALLENGING]: {
    value: 2,
    description: '挑戦的な相性。お互いの理解が必要です。'
  },
  [CompatibilityLevel.DIFFICULT]: {
    value: 1,
    description: '難しい相性。意識的な調和が必要です。'
  }
};

// ===============================================================
// データモデル定義
// ===============================================================

/**
 * 共通基本型定義
 * MongooseとTypeScriptの互換性を確保するための基本型
 */
export type BaseModelType = {
  id: string;            // TypeScript側でのID (クライアント側表示用)
  _id?: string;          // Mongoose側のID (_idをそのまま渡される場合用)
  createdAt: string | Date; // 互換性のために文字列・日付両方を許容
  updatedAt: string | Date; // 互換性のために文字列・日付両方を許容
};

// チーム型定義
export interface ITeam extends BaseModelType {
  name: string;
  description?: string;
  ownerId: string;
  admins: string[];
  members: string[];
  isActive: boolean;
}

// 招待ロール定義 - この型は deprecated です。models.ts を参照してください
export type InvitationRole = 'admin' | 'member';

// 招待ステータス定義 - この型は deprecated です。models.ts を参照してください
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';

// 招待型定義
export interface IInvitation extends BaseModelType {
  email: string;
  teamId: string;
  inviterId?: string;
  invitationToken?: string;
  token?: string;
  status: InvitationStatus;
  role: InvitationRole;
  expiresAt: string | Date;
  acceptedAt?: string | Date;
  declinedAt?: string | Date;
};

/**
 * Mongooseドキュメント表現のための基本インターフェース
 * 実際のMongooseモデル定義には拡張された独自インターフェースを使用する
 */
export interface IMongooseDocument {
  _id: string | any;     // MongooseのID (ObjectId型)
  createdAt?: Date;      // 作成日時
  updatedAt?: Date;      // 更新日時
  id?: string;          // 仮想プロパティとしてのid
}

export type ErrorResponseType = {
  message: string;
  code?: string;
  details?: any;
};

// 四柱情報の型定義
export interface IPillar {
  stem?: string;
  branch?: string;
  fullStemBranch?: string;
  hiddenStems?: string[];
}

export interface ISajuProfile {
  fourPillars?: {
    yearPillar?: IPillar;
    monthPillar?: IPillar;
    dayPillar?: IPillar;
    hourPillar?: IPillar;
  };
  mainElement?: string;
  secondaryElement?: string;
  yinYang?: string;
  tenGods?: Record<string, string>;
}

// ユーザー関連型定義
export interface IUser extends BaseModelType {
  email: string;
  password?: string; // APIレスポンスには含まれない
  name: string;
  birthDate: string; // YYYY-MM-DD形式
  birthHour?: number; // 出生時間（0-23）
  birthLocation?: string; // 出生地
  role: 'employee' | 'manager' | 'admin' | 'superadmin';
  teamIds?: string[]; // 所属チームID
  profilePicture?: string;
  elementalType?: ElementalType;
  elementalProfile?: ElementalType; // バックエンドとの互換性のため
  sajuProfile?: ISajuProfile; // 四柱推命プロファイル
  notificationSettings?: NotificationSettingsType;
  isActive: boolean;
  lastLoginAt?: string | Date; // mongooseとの互換性のため両方サポート
}

export type ElementalType = {
  mainElement: ElementType;
  secondaryElement?: ElementType;
  yinYang: YinYangType; // 「陰」または「陽」
};

export type NotificationSettingsType = {
  dailyFortune: boolean;
  promptQuestions: boolean;
  teamEvents: boolean;
  goalReminders: boolean;
  systemUpdates: boolean;
};

export type UserRegistrationRequest = {
  email: string;
  password: string;
  name: string;
  birthDate: string;
  role?: 'employee' | 'manager' | 'admin';
};

export type UserLoginRequest = {
  email: string;
  password: string;
};

export type UserLoginResponse = {
  user: Omit<IUser, 'password'>;
  token: string;
  refreshToken: string;
};

export type UserUpdateRequest = Partial<Omit<IUser, 'id' | 'createdAt' | 'updatedAt' | 'password' | 'sajuProfile'>>;

// 運勢関連型定義
export interface IFortune extends BaseModelType {
  userId: string;
  date: string; // YYYY-MM-DD形式
  dailyElement: ElementType;
  yinYang: YinYangType;
  overallLuck: number; // 1-100のスケール
  careerLuck: number;
  relationshipLuck: number;
  creativeEnergyLuck: number;
  healthLuck: number;
  wealthLuck: number;
  description: string;
  advice: string;
  luckyColors?: string[];
  luckyDirections?: string[];
  compatibleElements?: ElementType[];
  incompatibleElements?: ElementType[];
  viewedAt?: string | Date;
  // エラーハンドリング用の追加フィールド
  error?: boolean;
  message?: string;
}

export type FortuneQueryRequest = {
  startDate?: string;
  endDate?: string;
  userId?: string;
  birthDate?: string;
};

// 会話関連型定義
export interface IConversation extends BaseModelType {
  userId: string;
  messages: IMessage[];
  context?: {
    fortuneId?: string;
    relatedGoalId?: string;
    teamRelated?: boolean;
    sentimentScore?: number; // -1.0〜1.0のスケール
  };
  isArchived: boolean;
}

export interface IMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: string | Date;
  isPromptQuestion?: boolean;
  promptCategory?: 'growth' | 'team' | 'career' | 'organization';
}

// 会話タイプ
export enum ConversationType {
  GENERAL = 'general',                     // 一般的な対話
  FORTUNE_RELATED = 'fortune_related',     // 運勢関連の対話
  TEAM_COMPATIBILITY = 'team_compatibility', // チーム相性分析関連の対話
  TEAM_CONSULTATION = 'team_consultation',  // チーム目標コンサルティング対話
  PERSONAL_GROWTH = 'personal_growth'      // 個人の成長に関する対話
}

export type SendMessageRequest = {
  conversationId?: string; // 新規対話の場合は空
  content: string;
  conversationType?: ConversationType; // 対話のタイプ（新規会話の場合）
  metadata?: {                     // メタデータ（コンテキスト情報）
    fortuneId?: string;         // 関連する運勢ID
    relatedGoalId?: string;      // 関連する目標ID
    teamId?: string;           // 関連するチームID
    userId?: string;           // 特定ユーザー関連の対話の場合
  };
  context?: {                     // 後方互換性のために残す
    fortuneId?: string;
    relatedGoalId?: string;
  };
};

export type GeneratePromptQuestionRequest = {
  userId: string;
  fortuneId?: string;
  category?: 'growth' | 'team' | 'career' | 'organization';
};

// 目標関連型定義
export interface IGoal extends BaseModelType {
  userId: string;
  title: string;
  description?: string;
  targetDate?: string | Date;
  category: 'skill' | 'career' | 'personal' | 'team';
  priority: 'low' | 'medium' | 'high';
  status: 'not_started' | 'in_progress' | 'completed' | 'canceled';
  progress: number; // 0-100のパーセンテージ
  milestones?: IMilestone[];
  relatedElement?: ElementType;
  notes?: string;
}

export interface IMilestone {
  id: string;
  title: string;
  dueDate?: string | Date;
  isCompleted: boolean;
  completedAt?: string | Date;
}

export type GoalCreateRequest = Omit<IGoal, 'id' | 'createdAt' | 'updatedAt' | '_id'>;
export type GoalUpdateRequest = Partial<Omit<IGoal, 'id' | '_id' | 'userId' | 'createdAt' | 'updatedAt'>>;

// チーム関連型定義
export interface ITeamContribution extends BaseModelType {
  userId: string;
  title: string;
  description: string;
  date: string | Date;
  category: 'event' | 'project' | 'mentorship' | 'innovation' | 'support';
  impact: 'low' | 'medium' | 'high';
  recognizedBy?: string[]; // ユーザーID配列
  attachments?: string[]; // 添付ファイルURL
}

export interface IMentorship extends BaseModelType {
  mentorId: string;
  menteeId: string;
  startDate: string | Date;
  endDate?: string | Date;
  focus: string;
  status: 'active' | 'completed' | 'paused';
  sessions?: {
    date: string | Date;
    notes?: string;
    rating?: number; // 1-5のスケール
  }[];
  goals?: string[]; // 目標ID配列
}

// 分析関連型定義
export interface IEngagementAnalytics extends BaseModelType {
  userId: string;
  period: {
    startDate: string | Date;
    endDate: string | Date;
  };
  metrics: {
    appUsage: {
      dailyFortuneViews: number;
      conversationCount: number;
      averageConversationLength: number;
      responseRate: number; // 0-1のスケール
    };
    sentiment: {
      average: number; // -1.0〜1.0のスケール
      trend: 'improving' | 'stable' | 'declining' | 'fluctuating';
      topPositiveTopics?: string[];
      topNegativeTopics?: string[];
    };
    goals: {
      active: number;
      completed: number;
      progressRate: number; // 0-1のスケール
    };
    teamEngagement?: {
      contributionCount: number;
      mentorshipActivity: number;
      peerRecognition: number;
    };
  };
}

export interface ITeamAnalytics extends BaseModelType {
  period: {
    startDate: string | Date;
    endDate: string | Date;
  };
  overallEngagement: number; // 0-100のスケール
  responseRate: number; // 0-100のパーセンテージ
  sentimentDistribution: {
    positive: number; // パーセンテージ
    neutral: number;
    negative: number;
  };
  topConcerns: Array<{
    topic: string;
    frequency: number;
    averageSentiment: number;
  }>;
  topStrengths: Array<{
    topic: string;
    frequency: number;
    averageSentiment: number;
  }>;
  followUpRecommendations: Array<{
    userId: string;
    urgency: 'low' | 'medium' | 'high';
    reason: string;
    suggestedApproach?: string;
  }>;
}

// ===============================================================
// APIパス定義
// ===============================================================

// APIベースパス
export const API_BASE_PATH = '/api/v1';

// 認証関連
export const AUTH = {
  REGISTER: `${API_BASE_PATH}/auth/register`,
  LOGIN: `${API_BASE_PATH}/auth/login`,
  REFRESH_TOKEN: `${API_BASE_PATH}/auth/refresh-token`,
  LOGOUT: `${API_BASE_PATH}/auth/logout`,
  FORGOT_PASSWORD: `${API_BASE_PATH}/auth/forgot-password`,
  RESET_PASSWORD: `${API_BASE_PATH}/auth/reset-password`,
  VERIFY_EMAIL: `${API_BASE_PATH}/auth/verify-email`,
};

// ユーザー関連
export const USER = {
  ME: `${API_BASE_PATH}/users/me`,
  UPDATE_PROFILE: `${API_BASE_PATH}/users/me`,
  UPDATE_PASSWORD: `${API_BASE_PATH}/users/me/password`,
  UPDATE_NOTIFICATION_SETTINGS: `${API_BASE_PATH}/users/me/notification-settings`,
  GET_SAJU_PROFILE: `${API_BASE_PATH}/users/me/saju-profile`,
  GET_BY_ID: (userId: string) => `${API_BASE_PATH}/users/${userId}`,
  GET_ALL: `${API_BASE_PATH}/users`,
  UPDATE_BY_ID: (userId: string) => `${API_BASE_PATH}/users/${userId}`,
  DELETE_BY_ID: (userId: string) => `${API_BASE_PATH}/users/${userId}`,
};

// 運勢関連
export const FORTUNE = {
  GET_DAILY: `${API_BASE_PATH}/fortune/daily`,
  GET_USER_DAILY: (userId: string) => `${API_BASE_PATH}/fortune/users/${userId}/daily`,
  GET_RANGE: `${API_BASE_PATH}/fortune/range`,
  GET_BY_DATE: (date: string) => `${API_BASE_PATH}/fortune/date/${date}`,
  GET_USER_BY_DATE: (userId: string, date: string) => `${API_BASE_PATH}/fortune/users/${userId}/date/${date}`,
  MARK_AS_VIEWED: (fortuneId: string) => `${API_BASE_PATH}/fortune/${fortuneId}/viewed`,
  GET_TEAM_COMPATIBILITY: `${API_BASE_PATH}/fortune/team-compatibility`,
};

// 会話関連
export const CONVERSATION = {
  SEND_MESSAGE: `${API_BASE_PATH}/conversation/message`,
  GET_ALL: `${API_BASE_PATH}/conversation`,
  GET_BY_ID: (conversationId: string) => `${API_BASE_PATH}/conversation/${conversationId}`,
  GENERATE_PROMPT_QUESTION: `${API_BASE_PATH}/conversation/generate-prompt`,
  ARCHIVE: (conversationId: string) => `${API_BASE_PATH}/conversation/${conversationId}/archive`,
};

// 目標関連
export const GOAL = {
  CREATE: `${API_BASE_PATH}/goals`,
  GET_ALL: `${API_BASE_PATH}/goals`,
  GET_BY_ID: (goalId: string) => `${API_BASE_PATH}/goals/${goalId}`,
  UPDATE: (goalId: string) => `${API_BASE_PATH}/goals/${goalId}`,
  DELETE: (goalId: string) => `${API_BASE_PATH}/goals/${goalId}`,
  ADD_MILESTONE: (goalId: string) => `${API_BASE_PATH}/goals/${goalId}/milestones`,
  UPDATE_MILESTONE: (goalId: string, milestoneId: string) => `${API_BASE_PATH}/goals/${goalId}/milestones/${milestoneId}`,
  DELETE_MILESTONE: (goalId: string, milestoneId: string) => `${API_BASE_PATH}/goals/${goalId}/milestones/${milestoneId}`,
  GET_BY_CATEGORY: (category: string) => `${API_BASE_PATH}/goals/category/${category}`,
};

// チーム関連
export const TEAM = {
  // チーム管理
  CREATE: `${API_BASE_PATH}/teams`,
  GET_ALL: `${API_BASE_PATH}/teams`,
  GET_BY_ID: (teamId: string) => `${API_BASE_PATH}/teams/${teamId}`,
  UPDATE: (teamId: string) => `${API_BASE_PATH}/teams/${teamId}`,
  DELETE: (teamId: string) => `${API_BASE_PATH}/teams/${teamId}`,
  GET_MEMBERS: (teamId: string) => `${API_BASE_PATH}/teams/${teamId}/members`,
  ADD_MEMBER: (teamId: string) => `${API_BASE_PATH}/teams/${teamId}/members`,
  REMOVE_MEMBER: (teamId: string, userId: string) => `${API_BASE_PATH}/teams/${teamId}/members/${userId}`,
  
  // 招待管理
  INVITE: `${API_BASE_PATH}/teams/invitations`,
  GET_INVITATIONS: (teamId: string) => `${API_BASE_PATH}/teams/${teamId}/invitations`,
  CANCEL_INVITATION: (invitationId: string) => `${API_BASE_PATH}/teams/invitations/${invitationId}`,
  ACCEPT_INVITATION: (token: string) => `${API_BASE_PATH}/teams/invitations/${token}/accept`,
  DECLINE_INVITATION: (token: string) => `${API_BASE_PATH}/teams/invitations/${token}/decline`,
  RESEND_INVITATION: (invitationId: string) => `${API_BASE_PATH}/teams/invitations/${invitationId}/resend`,
  
  // チーム貢献
  ADD_CONTRIBUTION: `${API_BASE_PATH}/team/contributions`,
  GET_ALL_CONTRIBUTIONS: `${API_BASE_PATH}/team/contributions`,
  GET_USER_CONTRIBUTIONS: (userId: string) => `${API_BASE_PATH}/team/contributions/user/${userId}`,
  UPDATE_CONTRIBUTION: (contributionId: string) => `${API_BASE_PATH}/team/contributions/${contributionId}`,
  DELETE_CONTRIBUTION: (contributionId: string) => `${API_BASE_PATH}/team/contributions/${contributionId}`,
  
  // メンターシップ
  CREATE_MENTORSHIP: `${API_BASE_PATH}/team/mentorships`,
  GET_ALL_MENTORSHIPS: `${API_BASE_PATH}/team/mentorships`,
  GET_MENTORSHIP_BY_ID: (mentorshipId: string) => `${API_BASE_PATH}/team/mentorships/${mentorshipId}`,
  GET_USER_MENTORSHIPS: (userId: string) => `${API_BASE_PATH}/team/mentorships/user/${userId}`,
  UPDATE_MENTORSHIP: (mentorshipId: string) => `${API_BASE_PATH}/team/mentorships/${mentorshipId}`,
  ADD_MENTORSHIP_SESSION: (mentorshipId: string) => `${API_BASE_PATH}/team/mentorships/${mentorshipId}/sessions`,
};

// 分析関連
export const ANALYTICS = {
  GET_USER_ENGAGEMENT: (userId: string) => `${API_BASE_PATH}/analytics/users/${userId}/engagement`,
  GET_TEAM_ANALYTICS: `${API_BASE_PATH}/analytics/team`,
  GET_FOLLOW_UP_RECOMMENDATIONS: `${API_BASE_PATH}/analytics/follow-up-recommendations`,
  GET_SENTIMENT_TREND: `${API_BASE_PATH}/analytics/sentiment-trend`,
  GET_GOAL_COMPLETION_RATE: `${API_BASE_PATH}/analytics/goal-completion-rate`,
};