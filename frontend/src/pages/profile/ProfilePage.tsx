import React from 'react';
import { Container, Typography, Box, Paper, Avatar } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { Person as PersonIcon } from '@mui/icons-material';

export const ProfilePage: React.FC = () => {
  const { authState } = useAuth();

  if (!authState.user) {
    return null;
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return '管理者';
      case 'teacher':
        return '教員';
      case 'student':
        return '学生';
      default:
        return role;
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
          プロフィール
        </Typography>
        
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar sx={{ width: 80, height: 80, mr: 3, bgcolor: 'primary.main' }}>
              <PersonIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ mb: 1 }}>
                {authState.user.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {getRoleLabel(authState.user.role)}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'grid', gap: 2 }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                メールアドレス
              </Typography>
              <Typography variant="body1">
                {authState.user.email}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                ユーザーID
              </Typography>
              <Typography variant="body1">
                {authState.user.id}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                登録日時
              </Typography>
              <Typography variant="body1">
                {new Date(authState.user.created_at).toLocaleString('ja-JP')}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};
