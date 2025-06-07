import React from 'react';
import { Container, Typography, Box, Alert } from '@mui/material';

export const RequestListPage: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
          申請一覧
        </Typography>
        <Alert severity="info">
          申請一覧機能は今後実装予定です。
        </Alert>
      </Box>
    </Container>
  );
};
