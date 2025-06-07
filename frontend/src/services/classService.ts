import { api } from './api';

export interface Class {
  id: number;
  grade: number;
  class_name: string;
  created_at: string;
  updated_at: string;
}

export const classService = {
  // クラス一覧取得
  getClasses: async (): Promise<Class[]> => {
    try {
      const response = await api.get<Class[]>('/classes');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // クラス詳細取得
  getClass: async (id: number): Promise<Class> => {
    try {
      const response = await api.get<Class>(`/classes/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // クラス作成
  createClass: async (data: {
    grade: number;
    class_name: string;
  }): Promise<Class> => {
    try {
      const response = await api.post<Class>('/classes', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // クラス更新
  updateClass: async (id: number, data: {
    grade?: number;
    class_name?: string;
  }): Promise<Class> => {
    try {
      const response = await api.put<Class>(`/classes/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // クラス削除
  deleteClass: async (id: number): Promise<void> => {
    try {
      await api.delete(`/classes/${id}`);
    } catch (error) {
      throw error;
    }
  }
};
