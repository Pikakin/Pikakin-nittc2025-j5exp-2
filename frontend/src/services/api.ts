import axios, { AxiosError } from 'axios';
import { ApiResponse, PaginatedResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// APIクライアントの設定
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const errorMessage = error.response?.data?.message || '予期せぬエラーが発生しました';
    console.error('API Error:', errorMessage);
    return Promise.reject(error);
  }
);

// APIエラーハンドリング関数
export const handleApiError = (error: any): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    
    // APIからのエラーメッセージがある場合
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    
    // HTTPステータスに基づくエラーメッセージ
    switch (axiosError.response?.status) {
      case 400:
        return 'リクエストが不正です';
      case 401:
        return '認証に失敗しました';
      case 403:
        return 'アクセス権限がありません';
      case 404:
        return 'リソースが見つかりません';
      case 500:
        return 'サーバーエラーが発生しました';
      default:
        return 'エラーが発生しました';
    }
  }
  
  // その他のエラー
  return error.message || 'エラーが発生しました';
};

// 汎用的なAPI関数
export const api = {
  // GETリクエスト
  async get<T>(endpoint: string, params?: any): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.get<ApiResponse<T>>(endpoint, { params });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // ページネーション付きGETリクエスト
  async getPaginated<T>(endpoint: string, page: number = 1, pageSize: number = 10, params?: any): Promise<PaginatedResponse<T>> {
    try {
      const response = await apiClient.get<ApiResponse<PaginatedResponse<T>>>(endpoint, {
        params: { page, pageSize, ...params },
      });
      return response.data.data as PaginatedResponse<T>;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // POSTリクエスト
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      console.log(`Sending POST request to ${endpoint} with data:`, data);
      const response = await apiClient.post<ApiResponse<T>>(endpoint, data);
      console.log(`Response from ${endpoint}:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`Error in POST request to ${endpoint}:`, error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
      }
      throw error.response?.data || error;
    }
  },

  // PUTリクエスト
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.put<ApiResponse<T>>(endpoint, data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // DELETEリクエスト
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.delete<ApiResponse<T>>(endpoint);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // ファイルアップロード
  async upload<T>(endpoint: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post<ApiResponse<T>>(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // CSVエクスポート
  async exportCsv(endpoint: string, params?: any): Promise<Blob> {
    try {
      const response = await apiClient.get(endpoint, {
        params,
        responseType: 'blob',
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },
};
