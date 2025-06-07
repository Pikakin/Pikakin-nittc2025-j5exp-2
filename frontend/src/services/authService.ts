import { User } from '../types';
import { api } from './api';

interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

// APIエラーハンドリング関数
const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return '予期せぬエラーが発生しました';
};

export const authService = {
  // ログイン
  login: async (email: string, password: string) => {
    try {
      console.log('Sending login request with:', { email, password });
      const response = await api.post<any>('/auth/login', { email, password });
      
      console.log('Login response:', response);
      
      // レスポンスが undefined の場合のエラーハンドリング
      if (!response) {
        throw new Error('サーバーからのレスポンスがありません');
      }
      
      // レスポンスの構造に応じてデータを取得
      let userData;
      let token;
      let refreshToken;
      
      if (response.data) {
        userData = response.data.user;
        token = response.data.token;
        refreshToken = response.data.refreshToken;
      } else if (response.success && response.data) {
        userData = response.data.user;
        token = response.data.token;
        refreshToken = response.data.refreshToken;
      }
      
      if (!token) {
        throw new Error('トークンが見つかりません');
      }
      
      console.log('Extracted data:', { userData, token, refreshToken });
      
      // トークンをローカルストレージに保存
      localStorage.setItem('token', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      
      return {
        user: userData,
        token,
        refreshToken
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // 現在のユーザー情報を取得
  getCurrentUser: async () => {
    try {
      const response = await api.get<{ data: User }>('/auth/me');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  
  // パスワード変更
  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      const response = await api.post<{ success: boolean }>('/auth/change-password', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  
  // パスワードリセット要求
  requestPasswordReset: async (email: string) => {
    try {
      const response = await api.post<{ success: boolean }>('/auth/forgot-password', {
        email
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  
  // パスワードリセット
  resetPassword: async (token: string, newPassword: string) => {
    try {
      const response = await api.post<{ success: boolean }>('/auth/reset-password', {
        token,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
};

// handleApiError関数をエクスポート
export { handleApiError };
