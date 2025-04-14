import {
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon,
  SwapHoriz as SwapHorizIcon
} from '@mui/icons-material';
import {
  AppBar, Avatar,Box, Divider, Drawer, IconButton, List, ListItem,
  ListItemIcon, ListItemText, 
  Menu, MenuItem, Toolbar, Tooltip, Typography, useMediaQuery, useTheme
} from '@mui/material';
import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// ドロワーの幅
const drawerWidth = 240;

export const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { authState, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // ドロワーの開閉状態
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  
  // ユーザーメニューの状態
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const userMenuOpen = Boolean(anchorEl);
  
  // ユーザーメニューを開く
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  // ユーザーメニューを閉じる
  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };
  
  // ログアウト処理
  const handleLogout = () => {
    handleUserMenuClose();
    logout();
    navigate('/login');
  };
  
  // ナビゲーションアイテム
  const navItems = [
    {
      text: 'ダッシュボード',
      icon: <DashboardIcon />,
      path: '/dashboard',
      roles: ['admin', 'teacher', 'student']
    },
    {
      text: '時間割表示',
      icon: <ScheduleIcon />,
      path: '/schedules',
      roles: ['admin', 'teacher', 'student']
    },
    {
      text: '変更申請',
      icon: <SwapHorizIcon />,
      path: '/requests',
      roles: ['admin', 'teacher']
    }
  ];
  
  // 現在のユーザーに表示すべきナビゲーションアイテムをフィルタリング
  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(authState.user?.role || '')
  );
  
  // ドロワーの内容
  const drawer = (
    <div>
      <Toolbar sx={{ justifyContent: 'center' }}>
        <Typography variant="h6" noWrap component="div">
          高専スケジュール
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {filteredNavItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => navigate(item.path)}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </div>
  );
  
  return (
    <Box sx={{ display: 'flex' }}>
      {/* アプリバー */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerOpen ? drawerWidth : 0}px)` },
          ml: { md: `${drawerOpen ? drawerWidth : 0}px` },
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {filteredNavItems.find(item => item.path === location.pathname)?.text || '高専スケジュール'}
          </Typography>
          
          {/* ユーザーアイコン */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="アカウント設定">
              <IconButton
                onClick={handleUserMenuOpen}
                size="small"
                sx={{ ml: 2 }}
                aria-controls={userMenuOpen ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={userMenuOpen ? 'true' : undefined}
              >
                <Avatar sx={{ width: 32, height: 32 }}>
                  {authState.user?.name.charAt(0) || 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
          
          {/* ユーザーメニュー */}
          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={userMenuOpen}
            onClose={handleUserMenuClose}
            onClick={handleUserMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={() => navigate('/profile')}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              プロフィール
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              ログアウト
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      {/* ドロワー */}
      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* メインコンテンツ */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerOpen ? drawerWidth : 0}px)` },
          ml: { md: `${drawerOpen ? drawerWidth : 0}px` },
          mt: '64px'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};
