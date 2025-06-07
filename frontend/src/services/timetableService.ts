import { api } from './api';
import { Timetable, WeeklyTimetable } from '../types';

export const timetableService = {
  // 時間割一覧取得
  getTimetables: async (params?: {
    class_id?: number;
    grade?: number;
    day?: string;
  }) => {
    try {
      const response = await api.get<Timetable[]>('/timetables', params);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 週間時間割取得
  getWeeklyTimetable: async (classId: number) => {
    try {
      const response = await api.get<WeeklyTimetable>(`/timetables/weekly/${classId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 時間割詳細取得
  getTimetable: async (id: number) => {
    try {
      const response = await api.get<Timetable>(`/timetables/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 時間割作成
  createTimetable: async (data: {
    class_id: number;
    subject_id: number;
    teacher_id: number;
    day: string;
    period: number;
    room: string;
  }) => {
    try {
      const response = await api.post<Timetable>('/timetables', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 時間割更新
  updateTimetable: async (id: number, data: {
    class_id?: number;
    subject_id?: number;
    teacher_id?: number;
    day?: string;
    period?: number;
    room?: string;
  }) => {
    try {
      const response = await api.put<Timetable>(`/timetables/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 時間割削除
  deleteTimetable: async (id: number) => {
    try {
      const response = await api.delete(`/timetables/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};