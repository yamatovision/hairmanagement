// feature-flags.ts
// バックエンドの機能フラグを管理するモジュール

interface FeatureFlags {
  enableAuth: boolean;
  enableFortune: boolean;
  enableTeam: boolean;
  enableAnalytics: boolean;
  enableConversation: boolean;
}

// 環境変数から機能フラグを取得
export const getFeatureFlags = (): FeatureFlags => {
  return {
    enableAuth: process.env.ENABLE_AUTH !== 'false',
    enableFortune: process.env.ENABLE_FORTUNE !== 'false',
    enableTeam: process.env.ENABLE_TEAM !== 'false',
    enableAnalytics: process.env.ENABLE_ANALYTICS !== 'false',
    enableConversation: process.env.ENABLE_CONVERSATION !== 'false',
  };
};

// 機能フラグの状態を文字列として返す
export const getEnabledFeaturesString = (): string => {
  const flags = getFeatureFlags();
  const enabledFeatures: string[] = [];
  
  if (flags.enableAuth) enabledFeatures.push('認証');
  if (flags.enableFortune) enabledFeatures.push('運勢');
  if (flags.enableTeam) enabledFeatures.push('チーム');
  if (flags.enableAnalytics) enabledFeatures.push('分析');
  if (flags.enableConversation) enabledFeatures.push('会話');
  
  return enabledFeatures.join(', ');
};

export default getFeatureFlags;