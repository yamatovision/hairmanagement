/**
 * API通信の型安全性を確保するためのユーティリティ
 */
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import * as SharedTypes from '../types';

// API応答の標準形式
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

// APIのBase URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// 型付きApiクライアント
export const apiClient = {
  // GETリクエスト
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await axios.get(url, config);
      return handleResponse<T>(response);
    } catch (error) {
      return handleError<T>(error as AxiosError);
    }
  },

  // POSTリクエスト
  async post<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await axios.post(url, data, config);
      return handleResponse<T>(response);
    } catch (error) {
      return handleError<T>(error as AxiosError);
    }
  },

  // PUTリクエスト
  async put<T, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await axios.put(url, data, config);
      return handleResponse<T>(response);
    } catch (error) {
      return handleError<T>(error as AxiosError);
    }
  },

  // DELETEリクエスト
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await axios.delete(url, config);
      return handleResponse<T>(response);
    } catch (error) {
      return handleError<T>(error as AxiosError);
    }
  }
};

// レスポンス処理
function handleResponse<T>(response: AxiosResponse<ApiResponse<T>>): T {
  const { data } = response;
  
  if (!data.success || !data.data) {
    throw new Error(data.error?.message || '不明なエラーが発生しました。');
  }
  
  return data.data;
}

// エラー処理
function handleError<T>(error: AxiosError): never {
  if (error.response) {
    const errorData = error.response.data as ApiResponse<T>;
    throw new Error(errorData.error?.message || `HTTPエラー: ${error.response.status}`);
  } else if (error.request) {
    throw new Error('サーバーに接続できませんでした。ネットワーク接続を確認してください。');
  } else {
    throw new Error(error.message || '不明なエラーが発生しました。');
  }
}

// APIサービス実装例
export const authApi = {
  login: async (credentials: SharedTypes.UserLoginRequest): Promise<SharedTypes.UserLoginResponse> => {
    return apiClient.post<SharedTypes.UserLoginResponse>(
      `${API_URL}${SharedTypes.AUTH.LOGIN}`, 
      credentials
    );
  },
  
  logout: async (): Promise<void> => {
    const token = localStorage.getItem('token');
    return apiClient.post<void>(
      `${API_URL}${SharedTypes.AUTH.LOGOUT}`, 
      undefined, 
      {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true
      }
    );
  },
  
  refreshToken: async (refreshToken: string): Promise<SharedTypes.UserLoginResponse> => {
    return apiClient.post<SharedTypes.UserLoginResponse>(
      `${API_URL}${SharedTypes.AUTH.REFRESH_TOKEN}`, 
      { refreshToken },
      { withCredentials: true }
    );
  },
  
  getCurrentUser: async (): Promise<SharedTypes.IUser> => {
    const token = localStorage.getItem('token');
    return apiClient.get<SharedTypes.IUser>(
      `${API_URL}${SharedTypes.USER.ME}`, 
      {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true
      }
    );
  },
  
  registerUser: async (userData: SharedTypes.UserRegistrationRequest): Promise<SharedTypes.IUser> => {
    const token = localStorage.getItem('token');
    return apiClient.post<SharedTypes.IUser>(
      `${API_URL}${SharedTypes.AUTH.REGISTER}`, 
      userData,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true
      }
    );
  }
};