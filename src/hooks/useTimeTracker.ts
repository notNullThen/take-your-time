import { useState, useEffect } from 'react';
import type { AppSettings, WorkRecord, ExportData } from '../types';

const STORAGE_KEY = 'take_your_time_data';

const DEFAULT_SETTINGS: AppSettings = {
  standardHours: 8,
  expirationMonths: 3,
  theme: 'auto',
  skipWeekends: true,
};

const CLEARING_ALL_DATA_FLAG = '__takeYourTimeClearingAllData';

type ClearAllDataWindow = Window & {
  [CLEARING_ALL_DATA_FLAG]?: boolean;
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
        
        // Migrate old data or filter invalid
        let validRecords: WorkRecord[] = [];
        if (parsed.records) {
          validRecords = parsed.records.filter(r => typeof r.month === 'number' && typeof r.day === 'number');
        }
        setRecords(validRecords);

        if (parsed.settings) {
          setSettings({ ...DEFAULT_SETTINGS, ...parsed.settings });
        }
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

  const addRecord = (month: number, day: number, hours: number) => {
    setRecords((prev) => {
      // Check if record for month/day already exists, if so update it
      const existingIdx = prev.findIndex((r) => r.month === month && r.day === day);
      if (existingIdx >= 0) {
        const newRecords = [...prev];
        newRecords[existingIdx] = { month, day, hours };
        return newRecords;
      }
      return [...prev, { month, day, hours }];
    });
  };

  const deleteRecord = (month: number, day: number) => {
    setRecords((prev) => prev.filter((r) => !(r.month === month && r.day === day)));
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const importData = (data: ExportData) => {
    if (data.records) {
      const validRecords = data.records.filter(r => typeof r.month === 'number' && typeof r.day === 'number');
      setRecords(validRecords);
    }
    if (data.settings) setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
  };

  const exportData = () => {
    const dataToExport: ExportData = { records, settings };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `take_your_time_export.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAllData = async () => {
    (window as ClearAllDataWindow)[CLEARING_ALL_DATA_FLAG] = true;

    try {
      // Clear all local and session storage, not just the app key.
      localStorage.clear();
      sessionStorage.clear();

      // Clear all Cache API caches, including stale static assets from past deploys.
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.allSettled(cacheNames.map((name) => caches.delete(name)));
      }

      // Unregister any service workers that might keep serving old assets.
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.allSettled(registrations.map((reg) => reg.unregister()));
      }
    } finally {
      const reloadUrl = new URL(window.location.href);
      reloadUrl.searchParams.set('cache_bust', Date.now().toString());
      window.location.replace(reloadUrl.toString());
    }
  };

  return {
    records,
    settings,
    addRecord,
    deleteRecord,
    updateSettings,
    importData,
    exportData,
    clearAllData,
  };
}
