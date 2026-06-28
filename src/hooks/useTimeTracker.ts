import { useState, useEffect } from 'react';
import type { AppSettings, WorkRecord, ExportData } from '../types';

const STORAGE_KEY = 'take_your_time_data';

const DEFAULT_SETTINGS: AppSettings = {
  standardHours: 8,
  expirationMonths: 3,
};

export function useTimeTracker() {
  const [records, setRecords] = useState<WorkRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage
  useEffect(() => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      try {
        const parsed = JSON.parse(data) as ExportData;
        if (parsed.records) setRecords(parsed.records);
        if (parsed.settings) setSettings({ ...DEFAULT_SETTINGS, ...parsed.settings });
      } catch (e) {
        console.error('Failed to parse local storage data', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage
  useEffect(() => {
    if (isLoaded) {
      const dataToSave: ExportData = { records, settings };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    }
  }, [records, settings, isLoaded]);

  const addRecord = (date: string, hours: number) => {
    setRecords((prev) => {
      // Check if record for date already exists, if so update it
      const existingIdx = prev.findIndex((r) => r.date === date);
      if (existingIdx >= 0) {
        const newRecords = [...prev];
        newRecords[existingIdx] = { date, hours };
        return newRecords;
      }
      return [...prev, { date, hours }];
    });
  };

  const deleteRecord = (date: string) => {
    setRecords((prev) => prev.filter((r) => r.date !== date));
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const importData = (data: ExportData) => {
    if (data.records) setRecords(data.records);
    if (data.settings) setSettings(data.settings);
  };

  const exportData = () => {
    const dataToExport: ExportData = { records, settings };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `take_your_time_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    records,
    settings,
    addRecord,
    deleteRecord,
    updateSettings,
    importData,
    exportData,
  };
}
