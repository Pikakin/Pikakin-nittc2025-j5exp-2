import { ApiResponse, Notification, PaginatedResponse } from '../types';
import { api } from './api';

// 通知関連のAPIサービス
export const notificationService = {
  // 通知一覧の取得
  async getNotifications(page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Notification>> {
    return api.getPaginated<Notification>('/notifications', page, pageSize);
  },

  // 未読通知数の取得
  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    return api.get<{ count: number }>('/notifications/unread/count');
  },

  // 通知を既読にする
  async markAsRead(id: number): Promise<ApiResponse<void>> {
    return api.put<void>(`/notifications/${id}/read`);
  },

  // すべての通知を既読にする
  async markAllAsRead(): Promise<ApiResponse<void>> {
    return api.put<void>('/notifications/read-all');
  }
};
