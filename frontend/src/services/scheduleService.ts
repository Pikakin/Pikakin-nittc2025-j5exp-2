import { ApiResponse, ChangeRequest, PaginatedResponse, Schedule, ScheduleFilter } from '../types';
import { api } from './api';

// 時間割関連のAPIサービス
export const scheduleService = {
  // 時間割一覧の取得
  async getSchedules(filter?: ScheduleFilter): Promise<ApiResponse<Schedule[]>> {
    return api.get<Schedule[]>('/schedules', filter);
  },

  // クラス別時間割の取得
  async getSchedulesByClass(classId: number): Promise<ApiResponse<Schedule[]>> {
    return api.get<Schedule[]>(`/schedules/class/${classId}`);
  },

  // 教員別時間割の取得
  async getSchedulesByTeacher(teacherId: number): Promise<ApiResponse<Schedule[]>> {
    return api.get<Schedule[]>(`/schedules/teacher/${teacherId}`);
  },

  // 教室別時間割の取得
  async getSchedulesByRoom(roomId: number): Promise<ApiResponse<Schedule[]>> {
    return api.get<Schedule[]>(`/schedules/room/${roomId}`);
  },

  // 時間割詳細の取得
  async getScheduleById(id: number): Promise<ApiResponse<Schedule>> {
    return api.get<Schedule>(`/schedules/${id}`);
  },

  // 時間割のCSVエクスポート
  async exportSchedules(filter?: ScheduleFilter): Promise<Blob> {
    return api.exportCsv('/export/schedules', filter);
  },

  // 時間割のCSVインポート
  async importSchedules(file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<{ imported: number }>> {
    return api.upload<{ imported: number }>('/import/schedules', file, onProgress);
  }
};

// 時間割変更申請関連のAPIサービス
export const requestService = {
  // 変更申請一覧の取得
  async getRequests(page: number = 1, pageSize: number = 10, status?: string): Promise<PaginatedResponse<ChangeRequest>> {
    return api.getPaginated<ChangeRequest>('/requests', page, pageSize, { status });
  },

  // 自分の申請一覧の取得
  async getMyRequests(page: number = 1, pageSize: number = 10, status?: string): Promise<PaginatedResponse<ChangeRequest>> {
    return api.getPaginated<ChangeRequest>('/requests/my', page, pageSize, { status });
  },

  // クラス別の申請一覧の取得
  async getRequestsByClass(classId: number, page: number = 1, pageSize: number = 10, status?: string): Promise<PaginatedResponse<ChangeRequest>> {
    return api.getPaginated<ChangeRequest>(`/requests/class/${classId}`, page, pageSize, { status });
  },

  // 申請詳細の取得
  async getRequestById(id: number): Promise<ApiResponse<ChangeRequest>> {
    return api.get<ChangeRequest>(`/requests/${id}`);
  },

  // 申請の作成
  async createRequest(data: Partial<ChangeRequest>): Promise<ApiResponse<ChangeRequest>> {
    return api.post<ChangeRequest>('/requests', data);
  },

  // 申請の更新
  async updateRequest(id: number, data: Partial<ChangeRequest>): Promise<ApiResponse<ChangeRequest>> {
    return api.put<ChangeRequest>(`/requests/${id}`, data);
  },

  // 申請の承認
  async approveRequest(id: number, comment?: string): Promise<ApiResponse<ChangeRequest>> {
    return api.put<ChangeRequest>(`/requests/${id}/approve`, { comment });
  },

  // 申請の却下
  async rejectRequest(id: number, reason: string): Promise<ApiResponse<ChangeRequest>> {
    return api.put<ChangeRequest>(`/requests/${id}/reject`, { reason });
  },

  // 申請の取り消し
  async cancelRequest(id: number): Promise<ApiResponse<void>> {
    return api.delete<void>(`/requests/${id}`);
  }
};
