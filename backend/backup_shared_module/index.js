"use strict";
/**
 * 共有インポートファイル
 *
 * 陰陽五行運勢アプリケーションの共有型定義
 *
 * 変更履歴:
 * - 2025/03/26: 初期モデル・APIパス定義 (AppGenius)
 * - 2025/03/27: BaseModelType修正、Mongoose互換性対応 (Claude)
 * - 2025/03/27: 陰陽五行型定義の完全実装 (Claude)
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ANALYTICS = exports.TEAM = exports.GOAL = exports.CONVERSATION = exports.FORTUNE = exports.USER = exports.AUTH = exports.COMPATIBILITY_RATINGS = exports.CompatibilityLevel = exports.SIMPLIFIED_DAY_CALCULATION = exports.YIN_YANG_PROPERTIES = exports.ELEMENT_PROPERTIES = exports.FortuneCategory = exports.CONTROLLING_DESCRIPTIONS = exports.GENERATING_DESCRIPTIONS = exports.ELEMENT_CONTROLLING_RELATIONS = exports.ELEMENT_GENERATING_RELATIONS = exports.API_BASE_PATH = void 0;
// ユーティリティーのインポート
__exportStar(require("./utils/elemental-types"), exports);
// APIベースパス
exports.API_BASE_PATH = '/api/v1';
// 五行の相生関係 (相互に育む関係)
exports.ELEMENT_GENERATING_RELATIONS = {
    '木': '火', // 木は火を生む
    '火': '土', // 火は土を生む
    '土': '金', // 土は金を生む
    '金': '水', // 金は水を生む
    '水': '木' // 水は木を生む
};
// 五行の相剋関係 (相互に抑制する関係)
exports.ELEMENT_CONTROLLING_RELATIONS = {
    '木': '土', // 木は土を剋する
    '土': '水', // 土は水を剋する
    '水': '火', // 水は火を剋する
    '火': '金', // 火は金を剋する
    '金': '木' // 金は木を剋する
};
// 相生の説明文
exports.GENERATING_DESCRIPTIONS = {
    '木→火': '木は燃えて火を育みます',
    '火→土': '火の灰は土を豊かにします',
    '土→金': '土の中から金属が産出されます',
    '金→水': '金属が冷えると水滴が生じます',
    '水→木': '水は木の成長を助けます'
};
// 相剋の説明文
exports.CONTROLLING_DESCRIPTIONS = {
    '木→土': '木の根は土を抑えます',
    '土→水': '土は水を堰き止めます',
    '水→火': '水は火を消します',
    '火→金': '火は金属を溶かします',
    '金→木': '金属の刃物は木を切ります'
};
// 運勢に関連するカテゴリ
var FortuneCategory;
(function (FortuneCategory) {
    FortuneCategory["CAREER"] = "career";
    FortuneCategory["RELATIONSHIP"] = "relationship";
    FortuneCategory["CREATIVITY"] = "creativity";
    FortuneCategory["HEALTH"] = "health";
    FortuneCategory["WEALTH"] = "wealth"; // 金運
})(FortuneCategory || (exports.FortuneCategory = FortuneCategory = {}));
// 五行要素ごとの色とキーワード
exports.ELEMENT_PROPERTIES = {
    '木': {
        color: '#a5d6a7', // 緑
        textColor: '#1b5e20',
        keywords: ['成長', '発展', '柔軟性', '創造性', '決断力'],
        season: '春',
        direction: '東',
        strengths: ['適応力', '計画性', '直感力', '優しさ', '寛容さ'],
        weaknesses: ['怒りっぽさ', '頑固さ', '焦り', '自己中心的', '批判的']
    },
    '火': {
        color: '#ffab91', // 赤
        textColor: '#bf360c',
        keywords: ['情熱', '変化', '行動力', '表現力', '拡大'],
        season: '夏',
        direction: '南',
        strengths: ['情熱', 'リーダーシップ', '社交性', '魅力', '直感'],
        weaknesses: ['衝動的', '短気', '支配的', '自己顕示欲', '落ち着きのなさ']
    },
    '土': {
        color: '#d7ccc8', // 黄土色
        textColor: '#4e342e',
        keywords: ['安定', '中心', '思考力', '調和', '信頼'],
        season: '季節の変わり目',
        direction: '中央',
        strengths: ['信頼性', '実用性', '堅実さ', '思慮深さ', '安定感'],
        weaknesses: ['心配性', '保守的', '優柔不断', '固執', '頑固さ']
    },
    '金': {
        color: '#e0e0e0', // 銀/白
        textColor: '#424242',
        keywords: ['収穫', '確実性', '正確さ', '決断力', '潔癖'],
        season: '秋',
        direction: '西',
        strengths: ['効率性', '几帳面さ', '正確さ', '分析力', '完璧主義'],
        weaknesses: ['批判的', '冷淡', '独断的', '融通が利かない', '強迫観念']
    },
    '水': {
        color: '#81d4fa', // 青
        textColor: '#01579b',
        keywords: ['知恵', '柔軟性', '持久力', '深み', '静けさ'],
        season: '冬',
        direction: '北',
        strengths: ['知性', '洞察力', '直感', '柔軟性', '忍耐力'],
        weaknesses: ['恐れ', '優柔不断', '意志薄弱', '冷たさ', '無関心']
    }
};
// 陰陽の特性
exports.YIN_YANG_PROPERTIES = {
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
exports.SIMPLIFIED_DAY_CALCULATION = {
    // 日付から五行を単純計算（月+日を5で割った余り）
    dayElementMap: [
        '木', // 余り0
        '火', // 余り1
        '土', // 余り2
        '金', // 余り3
        '水' // 余り4
    ],
    // 日付から陰陽を計算（奇数=陽、偶数=陰）
    dayYinYangMap: {
        odd: '陽',
        even: '陰'
    }
};
// 相性評価レベル
var CompatibilityLevel;
(function (CompatibilityLevel) {
    CompatibilityLevel["EXCELLENT"] = "excellent";
    CompatibilityLevel["GOOD"] = "good";
    CompatibilityLevel["NEUTRAL"] = "neutral";
    CompatibilityLevel["CHALLENGING"] = "challenging";
    CompatibilityLevel["DIFFICULT"] = "difficult"; // 相剋で困難な相性
})(CompatibilityLevel || (exports.CompatibilityLevel = CompatibilityLevel = {}));
// 相性レベルの説明と数値評価
exports.COMPATIBILITY_RATINGS = {
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
// APIパス定義
// ===============================================================
// 認証関連
exports.AUTH = {
    REGISTER: `${exports.API_BASE_PATH}/auth/register`,
    LOGIN: `${exports.API_BASE_PATH}/auth/login`,
    REFRESH_TOKEN: `${exports.API_BASE_PATH}/auth/refresh-token`,
    LOGOUT: `${exports.API_BASE_PATH}/auth/logout`,
    FORGOT_PASSWORD: `${exports.API_BASE_PATH}/auth/forgot-password`,
    RESET_PASSWORD: `${exports.API_BASE_PATH}/auth/reset-password`,
    VERIFY_EMAIL: `${exports.API_BASE_PATH}/auth/verify-email`,
};
// ユーザー関連
exports.USER = {
    ME: `${exports.API_BASE_PATH}/users/me`,
    UPDATE_PROFILE: `${exports.API_BASE_PATH}/users/me`,
    UPDATE_PASSWORD: `${exports.API_BASE_PATH}/users/me/password`,
    UPDATE_NOTIFICATION_SETTINGS: `${exports.API_BASE_PATH}/users/me/notification-settings`,
    GET_BY_ID: (userId) => `${exports.API_BASE_PATH}/users/${userId}`,
    GET_ALL: `${exports.API_BASE_PATH}/users`,
    UPDATE_BY_ID: (userId) => `${exports.API_BASE_PATH}/users/${userId}`,
    DELETE_BY_ID: (userId) => `${exports.API_BASE_PATH}/users/${userId}`,
};
// 運勢関連
exports.FORTUNE = {
    GET_DAILY: `${exports.API_BASE_PATH}/fortune/daily`,
    GET_USER_DAILY: (userId) => `${exports.API_BASE_PATH}/fortune/users/${userId}/daily`,
    GET_RANGE: `${exports.API_BASE_PATH}/fortune/range`,
    GET_BY_DATE: (date) => `${exports.API_BASE_PATH}/fortune/date/${date}`,
    GET_USER_BY_DATE: (userId, date) => `${exports.API_BASE_PATH}/fortune/users/${userId}/date/${date}`,
    MARK_AS_VIEWED: (fortuneId) => `${exports.API_BASE_PATH}/fortune/${fortuneId}/viewed`,
    GET_TEAM_COMPATIBILITY: `${exports.API_BASE_PATH}/fortune/team-compatibility`,
};
// 会話関連
exports.CONVERSATION = {
    SEND_MESSAGE: `${exports.API_BASE_PATH}/conversation/message`,
    GET_ALL: `${exports.API_BASE_PATH}/conversation`,
    GET_BY_ID: (conversationId) => `${exports.API_BASE_PATH}/conversation/${conversationId}`,
    GENERATE_PROMPT_QUESTION: `${exports.API_BASE_PATH}/conversation/generate-prompt`,
    ARCHIVE: (conversationId) => `${exports.API_BASE_PATH}/conversation/${conversationId}/archive`,
};
// 目標関連
exports.GOAL = {
    CREATE: `${exports.API_BASE_PATH}/goals`,
    GET_ALL: `${exports.API_BASE_PATH}/goals`,
    GET_BY_ID: (goalId) => `${exports.API_BASE_PATH}/goals/${goalId}`,
    UPDATE: (goalId) => `${exports.API_BASE_PATH}/goals/${goalId}`,
    DELETE: (goalId) => `${exports.API_BASE_PATH}/goals/${goalId}`,
    ADD_MILESTONE: (goalId) => `${exports.API_BASE_PATH}/goals/${goalId}/milestones`,
    UPDATE_MILESTONE: (goalId, milestoneId) => `${exports.API_BASE_PATH}/goals/${goalId}/milestones/${milestoneId}`,
    DELETE_MILESTONE: (goalId, milestoneId) => `${exports.API_BASE_PATH}/goals/${goalId}/milestones/${milestoneId}`,
    GET_BY_CATEGORY: (category) => `${exports.API_BASE_PATH}/goals/category/${category}`,
};
// チーム関連
exports.TEAM = {
    // チーム貢献
    ADD_CONTRIBUTION: `${exports.API_BASE_PATH}/team/contributions`,
    GET_ALL_CONTRIBUTIONS: `${exports.API_BASE_PATH}/team/contributions`,
    GET_USER_CONTRIBUTIONS: (userId) => `${exports.API_BASE_PATH}/team/contributions/user/${userId}`,
    UPDATE_CONTRIBUTION: (contributionId) => `${exports.API_BASE_PATH}/team/contributions/${contributionId}`,
    DELETE_CONTRIBUTION: (contributionId) => `${exports.API_BASE_PATH}/team/contributions/${contributionId}`,
    // メンターシップ
    CREATE_MENTORSHIP: `${exports.API_BASE_PATH}/team/mentorships`,
    GET_ALL_MENTORSHIPS: `${exports.API_BASE_PATH}/team/mentorships`,
    GET_MENTORSHIP_BY_ID: (mentorshipId) => `${exports.API_BASE_PATH}/team/mentorships/${mentorshipId}`,
    GET_USER_MENTORSHIPS: (userId) => `${exports.API_BASE_PATH}/team/mentorships/user/${userId}`,
    UPDATE_MENTORSHIP: (mentorshipId) => `${exports.API_BASE_PATH}/team/mentorships/${mentorshipId}`,
    ADD_MENTORSHIP_SESSION: (mentorshipId) => `${exports.API_BASE_PATH}/team/mentorships/${mentorshipId}/sessions`,
};
// 分析関連
exports.ANALYTICS = {
    GET_USER_ENGAGEMENT: (userId) => `${exports.API_BASE_PATH}/analytics/users/${userId}/engagement`,
    GET_TEAM_ANALYTICS: `${exports.API_BASE_PATH}/analytics/team`,
    GET_FOLLOW_UP_RECOMMENDATIONS: `${exports.API_BASE_PATH}/analytics/follow-up-recommendations`,
    GET_SENTIMENT_TREND: `${exports.API_BASE_PATH}/analytics/sentiment-trend`,
    GET_GOAL_COMPLETION_RATE: `${exports.API_BASE_PATH}/analytics/goal-completion-rate`,
};
