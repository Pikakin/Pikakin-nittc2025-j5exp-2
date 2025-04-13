import { ApiResponse, Class, Department, PaginatedResponse, Period, Room, Subject, Teacher } from '../types';
import { api } from './api';

// マスターデータ関連のAPIサービス
export const masterService = {
  // 学科一覧の取得
  async getDepartments(): Promise<ApiResponse<Department[]>> {
    return api.get<Department[]>('/departments');
  },

  // クラス一覧の取得
  async getClasses(): Promise<ApiResponse<Class[]>> {
    return api.get<Class[]>('/classes');
  },

  // 学科別クラス一覧の取得
  async getClassesByDepartment(departmentId: number): Promise<ApiResponse<Class[]>> {
    return api.get<Class[]>(`/departments/${departmentId}/classes`);
  },

  // 教員一覧の取得
  async getTeachers(page: number = 1, pageSize: number = 50): Promise<PaginatedResponse<Teacher>> {
    return api.getPaginated<Teacher>('/teachers', page, pageSize);
  },

  // 学科別教員一覧の取得
  async getTeachersByDepartment(departmentId: number): Promise<ApiResponse<Teacher[]>> {
    return api.get<Teacher[]>(`/departments/${departmentId}/teachers`);
  },

  // 教室一覧の取得
  async getRooms(): Promise<ApiResponse<Room[]>> {
    return api.get<Room[]>('/rooms');
  },

  // 科目一覧の取得
  async getSubjects(page: number = 1, pageSize: number = 50): Promise<PaginatedResponse<Subject>> {
    return api.getPaginated<Subject>('/subjects', page, pageSize);
  },

  // 学科別科目一覧の取得
  async getSubjectsByDepartment(departmentId: number): Promise<ApiResponse<Subject[]>> {
    return api.get<Subject[]>(`/departments/${departmentId}/subjects`);
  },

  // 時限一覧の取得
  async getPeriods(): Promise<ApiResponse<Period[]>> {
    return api.get<Period[]>('/periods');
  }
};
