import { ChangeRequest, PaginatedResponse } from '../types';
import { api, handleApiError } from './api';

interface CreateRequestData {
  originalScheduleId: number;
  newDayOfWeek: number;
  newPeriodId: number;
  newRoomIds: number[];
  reason: string;
}

export const requestService = {
  // 変更申請一覧を取得（管理者用）
  getRequests: async (page = 1, limit = 10, status?: string) => {
    try {
      const params: Record<string, any> = { page, limit };
      if (status) {
        params.status = status;
      }
      
      const response = await api.get<PaginatedResponse<ChangeRequest>>('/requests', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  
  // 自分の変更申請一覧を取得（教員用）
  getMyRequests: async (page = 1, limit = 10, status?: string) => {
    try {
      const params: Record<string, any> = { page, limit };
      if (status) {
        params.status = status;
      }
      
      const response = await api.get<PaginatedResponse<ChangeRequest>>('/requests/my', { params });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  
  // 変更申請詳細を取得
  getRequestById: async (id: number) => {
    try {
      const response = await api.get<{ data: ChangeRequest }>(`/requests/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  
  // 変更申請を作成
  createRequest: async (data: CreateRequestData) => {
    try {
      const response = await api.post<{ data: ChangeRequest }>('/requests', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  
  // 変更申請を承認
  approveRequest: async (id: number, comment?: string) => {
    try {
      const response = await api.post<{ success: boolean }>(`/requests/${id}/approve`, {
        comment
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  
  // 変更申請を却下
  rejectRequest: async (id: number, rejectReason: string) => {
    try {
      const response = await api.post<{ success: boolean }>(`/requests/${id}/reject`, {
        rejectReason
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  
  // 変更申請を取り消し（申請者のみ可能）
  cancelRequest: async (id: number) => {
    try {
      const response = await api.post<{ success: boolean }>(`/requests/${id}/cancel`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
};
