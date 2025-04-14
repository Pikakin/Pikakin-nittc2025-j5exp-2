import { Box, Container, Paper, Typography } from '@mui/material';
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const AuthLayout: React.FC = () => {
  const { authState } = useAuth();
  
  // 既に認証済みの場合はダッシュボードにリダイレクト
  if (authState.isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }
  
  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: (theme) => theme.palette.grey[100],
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h4" gutterBottom>
            高専時間割システム
          </Typography>
          <Outlet />
        </Paper>
      </Container>
    </Box>
  );
};
