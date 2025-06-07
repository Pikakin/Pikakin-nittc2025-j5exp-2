import React from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Avatar,
  Grid,
  Divider,
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'error.main';
      case 'teacher':
        return 'primary.main';
      case 'student':
        return 'success.main';
      default:
        return 'grey.500';
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
          プロフィール
        </Typography>
        
        <Paper sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Avatar 
              sx={{ 
                width: 100, 
                height: 100, 
                mr: 3, 
                bgcolor: getRoleColor(authState.user.role),
                fontSize: '2rem'
              }}
            >
              <PersonIcon sx={{ fontSize: '3rem' }} />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ mb: 1 }}>
                {authState.user.name}
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: getRoleColor(authState.user.role),
                  fontWeight: 'medium'
                }}
              >
                {getRoleLabel(authState.user.role)}
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  ユーザーID
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {authState.user.id}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  メールアドレス
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {authState.user.email}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  権限
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {getRoleLabel(authState.user.role)}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  登録日時
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {new Date(authState.user.created_at).toLocaleString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};
