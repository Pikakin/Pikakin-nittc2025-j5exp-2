import { api } from './api';
import { Class } from '../types';

export const classService = {
  // クラス一覧取得
  getClasses: async (): Promise<Class[]> => {
    const response = await api.get<Class[]>('/classes');
    return response.data;
  },

  // クラス詳細取得
  getClassById: async (id: number): Promise<Class> => {
    const response = await api.get<Class>(`/classes/${id}`);
    return response.data;
  }
};
