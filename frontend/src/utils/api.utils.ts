/**
 * API通信ユーティリティ関数
 * 
 * オフライン対応のAPI呼び出し処理を提供します。
 * オンライン時は通常のAPIリクエストを行い、オフライン時は
 * キャッシュからデータを取得またはオフラインキューに操作を追加します。
 */

// Type-onlyインポートに変更
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';
import { isOnline, addToOfflineQueue, getOfflineData, cacheOfflineData } from './offline.utils';
// import { getStorageItem } from './storage.utils'; // Removed unused import

// API設定をインポート
import { getApiUrl } from '../api/apiConfig';

// 開発・本番環境用の共通URL
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://patrolmanagement-backend-235426778039.asia-northeast1.run.app'
  : 'http://localhost:5001';

// オフラインフォールバックが有効なエンドポイント
const OFFLINE_ENABLED_ENDPOINTS = [
  '/api/v1/fortune/daily',
  '/api/v1/fortune/range',
  '/api/v1/fortune/date/',
  '/api/v1/fortune/saju-profile',
  '/api/v1/users/me',
  '/api/v1/conversation'
];

// オフラインキューに入れる操作（非GETリクエスト）
const QUEUABLE_OPERATIONS = [
  '/api/v1/fortune/daily/viewed',
  '/api/v1/fortune/consultation',
  '/api/v1/conversation/message'
];

// Axiosインスタンスの作成
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10秒
  headers: {
    'Content-Type': 'application/json'
  }
});

// リクエストインターセプター：認証トークンの追加
api.interceptors.request.use(
  (config) => {
    try {
      // ローカルストレージから直接トークンを取得
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('認証トークン取得エラー:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * オフライン対応のAPIリクエスト関数
 * @param endpoint APIエンドポイント（/api/v1/から始まるパス）
 * @param options リクエストオプション
 * @returns APIレスポンスまたはキャッシュされたデータ
 */
export const apiRequest = async <T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    data?: any;
    params?: any;
    headers?: Record<string, string>;
    offlineTtl?: number; // キャッシュの有効期限（ミリ秒）
    forceNetwork?: boolean; // キャッシュを無視して常にネットワークリクエストを行う
  } = {}
): Promise<T> => {
  const {
    method = 'GET',
    data,
    params,
    headers,
    offlineTtl = 24 * 60 * 60 * 1000, // デフォルトは24時間
    forceNetwork = false
  } = options;
  
  const config: AxiosRequestConfig = {
    method,
    url: endpoint,
    data,
    params,
    headers
  };
  
  // オンライン状態の確認
  const online = isOnline();
  
  // オフラインでキャッシュから取得可能なGETリクエスト
  if (!online && method === 'GET' && isOfflineEnabled(endpoint)) {
    const cacheKey = generateCacheKey(endpoint, params);
    const cachedData = getOfflineData<T>(cacheKey);
    
    if (cachedData) {
      console.log(`オフラインキャッシュからデータを取得: ${endpoint}`);
      return cachedData;
    }
    
    throw new Error('オフラインでデータを取得できません。インターネット接続を確認してください。');
  }
  
  // オフラインでキューに追加可能な操作
  if (!online && method !== 'GET' && isQueueableOperation(endpoint)) {
    // キューに追加してオフライン時に後で処理
    const token = localStorage.getItem('token') || '';
    addToOfflineQueue({
      url: getApiUrl(endpoint),
      method,
      body: data,
      headers: { 
        ...headers,
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`オフラインキューに追加: ${method} ${endpoint}`);
    
    // 仮のレスポンスを返す
    return {
      success: true,
      message: 'リクエストをオフラインキューに追加しました。オンラインに戻ったら処理されます。',
      offline: true,
      timestamp: new Date().toISOString()
    } as unknown as T;
  }
  
  try {
    // オンラインであれば通常のリクエストを実行
    const response: AxiosResponse<T> = await api(config);
    
    // GETリクエストの場合はキャッシュに保存
    if (online && method === 'GET' && isOfflineEnabled(endpoint)) {
      const cacheKey = generateCacheKey(endpoint, params);
      cacheOfflineData<T>(cacheKey, response.data, offlineTtl);
    }
    
    return response.data;
  } catch (error) {
    if (method === 'GET' && isOfflineEnabled(endpoint) && !forceNetwork) {
      // オンラインでも失敗した場合、キャッシュを試す
      const cacheKey = generateCacheKey(endpoint, params);
      const cachedData = getOfflineData<T>(cacheKey);
      
      if (cachedData) {
        console.log(`APIリクエスト失敗、キャッシュを使用: ${endpoint}`);
        return cachedData;
      }
    }
    
    throw error;
  }
};

/**
 * エンドポイントがオフラインモードをサポートしているか確認
 * @param endpoint APIエンドポイント
 * @returns サポートしていればtrue
 */
const isOfflineEnabled = (endpoint: string): boolean => {
  return OFFLINE_ENABLED_ENDPOINTS.some(pattern => {
    // パターンは常に文字列として扱う
    return endpoint.startsWith(pattern);
  });
};

/**
 * オペレーションがオフラインキューに入れられるか確認
 * @param endpoint APIエンドポイント
 * @returns キュー可能であればtrue
 */
const isQueueableOperation = (endpoint: string): boolean => {
  return QUEUABLE_OPERATIONS.some(pattern => {
    // パターンは常に文字列として扱う
    return endpoint.startsWith(pattern);
  });
};

/**
 * キャッシュキーを生成
 * @param endpoint APIエンドポイント
 * @param params URLクエリパラメータ
 * @returns キャッシュキー
 */
const generateCacheKey = (endpoint: string, params?: any): string => {
  // パラメータがあれば、それを含めたユニークなキーを生成
  if (params && Object.keys(params).length > 0) {
    const paramString = Object.entries(params)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    return `${endpoint}?${paramString}`;
  }
  
  return endpoint;
};

export default api;