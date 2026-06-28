export interface WorkRecord {
  date: string; // YYYY-MM-DD
  hours: number;
}

export interface AppSettings {
  standardHours: number; // default 8
  expirationMonths: number | 'endless'; // default 3
}

export interface ExportData {
  records: WorkRecord[];
  settings: AppSettings;
}
