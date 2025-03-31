/**
 * APIの設定ファイル
 * アプリケーション全体で使用されるAPIの基本設定
 */

import axios from 'axios';

// APIのベースURL設定
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// axios設定
axios.defaults.baseURL = API_BASE_URL;
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

export default axios;