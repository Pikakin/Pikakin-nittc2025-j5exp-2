import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';
import { AuthState, User } from '../types';

// 認証アクションの型
type AuthAction =
  | { type: 'LOGIN_REQUEST' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'LOAD_USER_REQUEST' }
  | { type: 'LOAD_USER_SUCCESS'; payload: User }
  | { type: 'LOAD_USER_FAILURE'; payload: string };

// 認証コンテキストの型
interface AuthContextType {
  authState: AuthState;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// 初期状態
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null
};

// Reducer関数
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_REQUEST':
    case 'LOAD_USER_REQUEST':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
    case 'LOAD_USER_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
        error: null
      };
    case 'LOGIN_FAILURE':
    case 'LOAD_USER_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

// コンテキストの作成
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// プロバイダーコンポーネント
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, dispatch] = useReducer(authReducer, initialState);

  // アプリ起動時にユーザー情報を取得
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        dispatch({ type: 'LOAD_USER_FAILURE', payload: 'No token found' });
        return;
      }
      
      try {
        dispatch({ type: 'LOAD_USER_REQUEST' });
        const response = await authService.getCurrentUser();
        dispatch({ type: 'LOAD_USER_SUCCESS', payload: response.data });
      } catch (error: any) {
        dispatch({ type: 'LOAD_USER_FAILURE', payload: error.message });
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }
    };
    
    loadUser();
  }, []);

  // ログイン処理
  const login = async (username: string, password: string) => {
    try {
      dispatch({ type: 'LOGIN_REQUEST' });
      console.log('AuthContext login - username:', username, 'password:', password);
      
      const response = await authService.login(username, password);
      console.log('AuthContext login - response:', response);
      
      // ユーザー情報を取得
      const user = response.user;
      
      if (!user) {
        throw new Error('ユーザー情報が見つかりません');
      }
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } catch (error: any) {
      console.error('AuthContext login - error:', error);
      dispatch({ type: 'LOGIN_FAILURE', payload: error.message || '認証に失敗しました' });
      throw error;
    }
  };

  // ログアウト処理
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    dispatch({ type: 'LOGOUT' });
  };

  // エラークリア
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

// カスタムフック
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
