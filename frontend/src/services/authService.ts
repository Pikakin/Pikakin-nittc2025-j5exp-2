import { User } from '../types';
import { api } from './api';

interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export const authService = {
  // ログイン
  login: async (username: string, password: string) => {
    try {
      console.log('Sending login request with:', { username, password });
      const response = await api.post<any>('/auth/login', { username, password });
      
      console.log('Login response:', response);
      
      // レスポンスが undefined の場合のエラーハンドリング
      if (!response) {
        throw new Error('サーバーからのレスポンスがありません');
      }
      
      // レスポンスから直接トークンと情報を取得
      const { token, refreshToken, user } = response;
      
      if (!token) {
        throw new Error('トークンが見つかりません');
      }
      
      console.log('Extracted data:', { user, token, refreshToken });
      
      // トークンをローカルストレージに保存
      localStorage.setItem('token', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      
      return {
        user,
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
    } catch (error: any) {
      throw new Error(error.message || '認証情報の取得に失敗しました');
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
    } catch (error: any) {
      throw new Error(error.message || 'パスワード変更に失敗しました');
    }
  },
  
  // パスワードリセット要求
  requestPasswordReset: async (email: string) => {
    try {
      const response = await api.post<{ success: boolean }>('/auth/forgot-password', {
        email
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'パスワードリセット要求に失敗しました');
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
    } catch (error: any) {
      throw new Error(error.message || 'パスワードリセットに失敗しました');
    }
  }
};
