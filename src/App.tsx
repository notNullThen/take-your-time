import { useState, useEffect } from 'react';
import { useTimeTracker } from './hooks/useTimeTracker';
import { calculateBalances } from './utils/calculations';
import { SummaryCards } from './components/SummaryCards';
import { RecordTable } from './components/RecordTable';
import { SettingsModal } from './components/SettingsModal';
import type { ExportData } from './types';

function App() {
  const {
    records,
    settings,
    addRecord,
    deleteRecord,
    updateSettings,
    importData,
    exportData,
  } = useTimeTracker();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Apply theme class to body
  useEffect(() => {
    let activeTheme = settings.theme;
    if (activeTheme === 'auto') {
      activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    if (activeTheme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [settings.theme]);

  // Handle system theme changes if set to auto
  useEffect(() => {
    if (settings.theme !== 'auto') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        document.body.classList.remove('light-theme');
      } else {
        document.body.classList.add('light-theme');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.theme]);

  // Warning when closing the tab
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      const message = "Please export your data before closing to prevent data loss!";
      e.returnValue = message;
      return message;
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const cycleTheme = () => {
    const nextTheme: Record<string, 'auto' | 'dark' | 'light'> = {
      auto: 'dark',
      dark: 'light',
      light: 'auto',
    };
    updateSettings({ theme: nextTheme[settings.theme] });
  };

  const getThemeIcon = () => {
    if (settings.theme === 'auto') return '💻';
    if (settings.theme === 'dark') return '🌙';
    return '☀️';
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string) as ExportData;
        if (json.records || json.settings) {
          importData(json);
        } else {
          alert('Invalid file format.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const { totalOverwork, totalUnderwork, netBalance } = calculateBalances(records, settings);

  return (
    <div className="app-container">
      <header className="flex-between glass-panel" style={{ padding: '16px 24px', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h1>Take Your Time</h1>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          
          <button className="secondary" onClick={cycleTheme} title={`Theme: ${settings.theme}`}>
            {getThemeIcon()}
          </button>
          
          <label className="secondary" style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '10px 16px',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius)',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 500,
          }}>
            Import JSON
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden-file-input"
            />
          </label>

          <button className="secondary" onClick={exportData}>
            Export JSON
          </button>

          <button className="secondary" onClick={() => setIsSettingsOpen(true)}>
            ⚙️
          </button>
        </div>
      </header>

      <SummaryCards
        totalOverwork={totalOverwork}
        totalUnderwork={totalUnderwork}
        netBalance={netBalance}
        settings={settings}
      />

      <h2 style={{ marginTop: '32px' }}>History</h2>
      <RecordTable 
        records={records} 
        settings={settings} 
        onUpdate={addRecord}
        onDelete={deleteRecord} 
      />

      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onSave={updateSettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
