import { Timetable, WeeklyTimetable, TimetableFilter, ApiResponse } from '../types';
import { api } from './api';

export const timetableService = {
  // 時間割一覧取得
  getTimetables: async (filter?: TimetableFilter): Promise<Timetable[]> => {
    const params: any = {};
    
    if (filter?.grade) params.grade = filter.grade;
    if (filter?.class_id) params.class_id = filter.class_id;
    if (filter?.class_name) params.class_name = filter.class_name;
    if (filter?.day_of_week) params.day_of_week = filter.day_of_week;
    if (filter?.teacher_id) params.teacher_id = filter.teacher_id;

    const response = await api.get<Timetable[]>('/timetables', params);
    return response.data;
  },

  // 週間時間割取得
  getWeeklyTimetable: async (classId: number): Promise<WeeklyTimetable> => {
    const response = await api.get<WeeklyTimetable>(`/timetables/weekly/${classId}`);
    return response.data;
  },

  // 時間割詳細取得
  getTimetableById: async (id: number): Promise<Timetable> => {
    const response = await api.get<Timetable>(`/timetables/${id}`);
    return response.data;
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