/**
 * APIの設定ファイル
 * アプリケーション全体で使用されるAPIの基本設定
 */

import axios from 'axios';

// 環境定数
const isDevelopment = process.env.NODE_ENV === 'development';

// APIのベースURL設定
// 開発環境ではプロキシ設定を使用、本番環境では本番バックエンドを使用
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.REACT_APP_API_URL || 'https://patrolmanagement-backend-235426778039.asia-northeast1.run.app'
  : '';

// IPv6の代わりにIPv4を使用するためのフラグ
const USE_IPV4 = true;

// API基本パス
const API_BASE_PATH = process.env.REACT_APP_API_BASE_PATH || '/api/v1';

// API URL解決関数
export const getApiUrl = (endpoint) => {
  // 開発環境ではプロキシを使用するため、相対パスを返す
  if (isDevelopment) {
    // エンドポイントが既にAPIパスで始まっているか確認
    if (endpoint.startsWith('/api/')) {
      return endpoint;
    }
    
    // API_BASE_PATHを追加
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${API_BASE_PATH}${path}`;
  }
  
  // 本番環境の処理 - エンドポイントが完全なパスかチェック
  if (endpoint.startsWith('/api/')) {
    return `${API_BASE_URL}${endpoint}`;
  }
  
  // API_BASE_PATHを追加
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${API_BASE_PATH}${path}`;
};

// axios設定
// 開発環境でIPv4を優先するように設定
axios.defaults.baseURL = API_BASE_URL;
if (isDevelopment && USE_IPV4) {
  console.log('開発環境でIPv4アドレスを使用します');
  // IPv4設定のためlocalhost参照を防止
  axios.interceptors.request.use((config) => {
    // localhostをIPv4形式に変換
    if (config.url && config.url.includes('localhost')) {
      config.url = config.url.replace('localhost', '127.0.0.1');
    }
    return config;
  }, (error) => {
    return Promise.reject(error);
  });
}
axios.defaults.headers.common['Content-Type'] = 'application/json';

// レスポンスインターセプター
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // エラーハンドリング
    console.error('API呼び出しエラー:', error);
    return Promise.reject(error);
  }
);

// リクエストインターセプター
axios.interceptors.request.use(
  (config) => {
    // トークンがある場合はヘッダーに追加
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export { API_BASE_URL, API_BASE_PATH, isDevelopment, USE_IPV4 };
export default axios;