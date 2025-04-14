import React from 'react';
import { Navigate, RouteObject } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { AuthLayout } from './layouts/AuthLayout';
import { MainLayout } from './layouts/MainLayout';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { NotificationPage } from './pages/notification/NotificationPage';
import { RequestCreatePage } from './pages/request/RequestCreatePage';
import { RequestDetailPage } from './pages/request/RequestDetailPage';
import { RequestListPage } from './pages/request/RequestListPage';
import { ScheduleDetailPage } from './pages/schedule/ScheduleDetailPage';
import { SchedulePage } from './pages/schedule/SchedulePage';
import { ProfilePage } from './pages/settings/ProfilePage';

// ルートガード（認証済みユーザーのみアクセス可能）
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

// ロールベースのルートガード
const RoleRoute: React.FC<{ 
  children: React.ReactNode;
  allowedRoles: ('admin' | 'teacher' | 'student')[];
}> = ({ children, allowedRoles }) => {
  const { authState } = useAuth();
  
  if (authState.loading) {
    return <div>Loading...</div>;
  }
  
  if (!authState.isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (authState.user && !allowedRoles.includes(authState.user.role)) {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
};

// ルート定義を生成する関数
export const getRoutes = (): RouteObject[] => [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" /> },
      { 
        path: 'dashboard', 
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'schedule', 
        element: (
          <ProtectedRoute>
            <SchedulePage />
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'schedule/:id', 
        element: (
          <ProtectedRoute>
            <ScheduleDetailPage />
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'requests', 
        element: (
          <ProtectedRoute>
            <RequestListPage />
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'requests/:id', 
        element: (
          <ProtectedRoute>
            <RequestDetailPage />
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'requests/create', 
        element: (
          <RoleRoute allowedRoles={['admin', 'teacher']}>
            <RequestCreatePage />
          </RoleRoute>
        ) 
      },
      { 
        path: 'notifications', 
        element: (
          <ProtectedRoute>
            <NotificationPage />
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'profile', 
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ) 
      },
    ],
  },
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" /> },
];
