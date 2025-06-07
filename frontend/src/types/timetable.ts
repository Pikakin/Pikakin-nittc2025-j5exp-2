export interface Timetable {
    id: number;
    class_id: number;
    subject_id: number;
    teacher_id: number;
    day: string;
    period: number;
    room: string;
    created_at: string;
    updated_at: string;
    class?: Class;
    subject?: Subject;
    teacher?: User;
  }
  
  export interface WeeklyTimetable {
    [day: string]: {
      [period: number]: Timetable;
    };
  }
  
  // 名前を変更: TimetableFilter → TimetableFilterParams
  export interface TimetableFilterParams {
    grade?: number;
    class_id?: number;
    day?: string;
  }
  
  export interface Class {
    id: number;
    grade: number;
    class_name: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface Subject {
    id: number;
    code: string;
    name: string;
    category: string;
    term: string;
    credits: number;
    created_at: string;
    updated_at: string;
  }
  
  export interface User {
    id: number;
    email: string;
    name: string;
    role: string;
    created_at: string;
    updated_at: string;
  }
  