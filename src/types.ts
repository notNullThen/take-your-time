export interface WorkRecord {
  month: number; // 1-12
  day: number;   // 1-31
  hours: number;
}

export interface AppSettings {
  standardHours: number; // default 8
  expirationMonths: number | 'endless'; // default 3
  theme: 'auto' | 'dark' | 'light'; // default auto
  skipWeekends: boolean; // default false
}

export interface ExportData {
  records: WorkRecord[];
  settings: AppSettings;
}
