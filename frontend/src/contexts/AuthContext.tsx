import axios from 'axios';
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthState, User, UserRole } from '../types';

// 認証コンテキストの型定義
interface AuthContextType {
  authState: AuthState;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

// 初期状態
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
};

// アクション型
type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'AUTH_CHECKED' }
  | { type: 'SET_LOADING'; payload: boolean };

// リデューサー
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      };
    case 'AUTH_CHECKED':
      return {
        ...state,
        loading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

// コンテキスト作成
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// コンテキストプロバイダー
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, dispatch] = useReducer(authReducer, initialState);

  // APIベースURL
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

  // 認証チェック
  const checkAuth = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        dispatch({ type: 'AUTH_CHECKED' });
        return;
      }

      // トークンをヘッダーに設定
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const response = await axios.get(`${API_URL}/auth/me`);
      dispatch({ type: 'LOGIN_SUCCESS', payload: response.data.data });
    } catch (error) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      dispatch({ type: 'AUTH_CHECKED' });
    }
  };

  // ログイン
  const login = async (username: string, password: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { username, password });
      const { token, user } = response.data.data;
      
      // トークンを保存
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '認証に失敗しました';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  // ログアウト
  const logout = async (): Promise<void> => {
    try {
      await axios.post(`${API_URL}/auth/logout`);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      dispatch({ type: 'LOGOUT' });
    }
  };

  // 初回マウント時に認証チェック
  useEffect(() => {
    checkAuth();
  }, []);

  // Axiosのデフォルト設定
  useEffect(() => {
    // レスポンスインターセプター
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        // 401エラーの場合、トークンが無効なのでログアウト
        if (error.response?.status === 401) {
          await logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      // クリーンアップ
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ authState, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

// カスタムフック
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
