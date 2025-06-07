// ユーザー関連の型
export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  name: string;
}

// 認証関連の型
export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'teacher' | 'student';
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

// API関連の型
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 時間割関連の型をエクスポート
export * from './timetable';


// 学科・クラス関連の型
export interface Department {
  id: number;
  name: string;
  shortName: string;
}

export interface Class {
  id: number;
  grade: number;
  classNumber: number;
  name: string;
  departmentId: number;
  department?: Department;
}

// 教員関連の型
export interface Teacher {
  id: number;
  userId: number;
  name: string;
  departmentId: number;
  department?: Department;
}

// 教室関連の型
export interface Room {
  id: number;
  name: string;
  capacity: number;
  building: string;
  floor: number;
}

// 科目関連の型
export type Term = 'first_semester' | 'second_semester' | 'full_year';

export interface Subject {
  id: number;
  name: string;
  code: string;
  term: Term;
  requiredSessions: number;
  departmentId: number;
  department?: Department;
}

// 時間割関連の型
export interface Period {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  order: number;
}

export interface Schedule {
  id: number;
  subjectId: number;
  subject?: Subject;
  classId: number;
  class?: Class;
  dayOfWeek: number; // 1: 月曜日, 2: 火曜日, ...
  periodId: number;
  period?: Period;
  isOriginal: boolean;
  teachers: Teacher[];
  rooms: Room[];
}

// 時間割変更申請関連の型
export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface ChangeRequest {
  id: number;
  originalScheduleId: number;
  originalSchedule?: Schedule;
  newDayOfWeek: number;
  newPeriodId: number;
  newPeriod?: Period;
  subjectId: number;
  subject?: Subject;
  classId: number;
  class?: Class;
  reason: string;
  status: RequestStatus;
  requestedBy: number;
  requestedByUser?: User;
  approvedBy: number | null;
  approvedByUser?: User;
  createdAt: string;
  updatedAt: string;
  teachers: Teacher[];
  rooms: Room[];
}

// 通知関連の型
export interface Notification {
  id: number;
  userId: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// フィルター型
export interface ScheduleFilter {
  classId?: number;
  teacherId?: number;
  roomId?: number;
  dayOfWeek?: number;
  term?: Term;
}
