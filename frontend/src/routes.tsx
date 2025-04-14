import React from 'react';
import { Navigate, RouteObject } from 'react-router-dom';
import { Layout } from './components/common/Layout';
import { useAuth } from './contexts/AuthContext';
import { NotFoundPage } from './pages/NotFoundPage';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { RequestCreatePage } from './pages/request/RequestCreatePage';
import { RequestDetailPage } from './pages/request/RequestDetailPage';
import { RequestListPage } from './pages/request/RequestListPage';
import { ScheduleListPage } from './pages/schedule/ScheduleListPage';

// 認証が必要なルートのラッパー
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authState } = useAuth();
  
  if (authState.loading) {
    return <div>Loading...</div>;
  }
  
  if (!authState.isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

// 管理者専用ルートのラッパー
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authState } = useAuth();
  
  if (authState.loading) {
    return <div>Loading...</div>;
  }
  
  if (!authState.isAuthenticated || authState.user?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
};

// 教員専用ルートのラッパー
const TeacherRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authState } = useAuth();
  
  if (authState.loading) {
    return <div>Loading...</div>;
  }
  
  if (!authState.isAuthenticated || authState.user?.role !== 'teacher') {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
};

// ルート定義を生成する関数
export const getRoutes = (): RouteObject[] => [
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" />
      },
      {
        path: 'dashboard',
        element: <DashboardPage />
      },
      {
        path: 'schedules',
        element: <ScheduleListPage />
      },
      {
        path: 'requests',
        element: <RequestListPage />
      },
      {
        path: 'requests/:id',
        element: <RequestDetailPage />
      },
      {
        path: 'requests/create',
        element: (
          <TeacherRoute>
            <RequestCreatePage />
          </TeacherRoute>
        )
      },
      {
        path: 'profile',
        element: <ProfilePage />
      },
      {
        path: '*',
        element: <NotFoundPage />
      }
    ]
  }
];

