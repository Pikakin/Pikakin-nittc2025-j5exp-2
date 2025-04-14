import { User } from '../types';
import { api, handleApiError } from './api';

interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export const authService = {
  // ログイン
  login: async (username: string, password: string) => {
    try {
      const response = await api.post<LoginResponse>('/auth/login', {
        username,
        password
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
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
