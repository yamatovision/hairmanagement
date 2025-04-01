/**
 * APIパス定義
 */

const API_BASE_PATH = '/api/v1';

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
  TOGGLE_FAVORITE: (conversationId: string) => `${API_BASE_PATH}/conversation/${conversationId}/favorite`,
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
  ADD_MEMBER: (teamId: string) => `${API_BASE_PATH}/teams/${teamId}/members`,
  REMOVE_MEMBER: (teamId: string, userId: string) => `${API_BASE_PATH}/teams/${teamId}/members/${userId}`,
  
  // 招待管理
  INVITE: `${API_BASE_PATH}/teams/invitations`,
  GET_INVITATIONS: (teamId: string) => `${API_BASE_PATH}/teams/${teamId}/invitations`,
  ACCEPT_INVITATION: (token: string) => `${API_BASE_PATH}/teams/invitations/${token}/accept`,
  DECLINE_INVITATION: (token: string) => `${API_BASE_PATH}/teams/invitations/${token}/decline`,
  CANCEL_INVITATION: (invitationId: string) => `${API_BASE_PATH}/teams/invitations/${invitationId}`,
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

// サブスクリプション関連
export const SUBSCRIPTION = {
  GET_TEAM_SUBSCRIPTION: (teamId: string) => `${API_BASE_PATH}/subscriptions/team/${teamId}`,
  CREATE: `${API_BASE_PATH}/subscriptions`,
  CHANGE_PLAN: (teamId: string) => `${API_BASE_PATH}/subscriptions/team/${teamId}/plan`,
  UPDATE_STATUS: (teamId: string) => `${API_BASE_PATH}/subscriptions/team/${teamId}/status`,
};