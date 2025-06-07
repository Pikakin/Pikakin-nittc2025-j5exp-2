import { api } from './api';
import { ApiResponse } from '../types';

export interface CSVImportResult {
  success: boolean;
  total_rows: number;
  processed_rows: number;
  error_rows: Array<{
    row: number;
    error: string;
    data: string;
  }>;
  errors: string[];
  processed_at: string;
}

export const csvService = {
  // 担当者CSVインポート
  importSubjects: async (file: File, onProgress?: (progress: number) => void): Promise<CSVImportResult> => {
    try {
      const response = await api.upload<CSVImportResult>('/csv/import/subjects', file, onProgress);
      return response.data;
    } catch (error) {
      console.error('Failed to import subjects CSV:', error);
      throw new Error('担当者CSVのインポートに失敗しました');
    }
  },

  // 時間割CSVインポート
  importTimetables: async (file: File, onProgress?: (progress: number) => void): Promise<CSVImportResult> => {
    try {
      const response = await api.upload<CSVImportResult>('/csv/import/timetables', file, onProgress);
      return response.data;
    } catch (error) {
      console.error('Failed to import timetables CSV:', error);
      throw new Error('時間割CSVのインポートに失敗しました');
    }
  },

  // 時間割CSVエクスポート
  exportTimetables: async (filter?: { grade?: number }): Promise<Blob> => {
    try {
      return await api.exportCsv('/csv/export/timetables', filter);
    } catch (error) {
      console.error('Failed to export timetables CSV:', error);
      throw new Error('時間割CSVのエクスポートに失敗しました');
    }
  },

  // 担当者CSVエクスポート
  exportSubjects: async (filter?: { grade?: number }): Promise<Blob> => {
    try {
      return await api.exportCsv('/csv/export/subjects', filter);
    } catch (error) {
      console.error('Failed to export subjects CSV:', error);
      throw new Error('担当者CSVのエクスポートに失敗しました');
    }
  }
};