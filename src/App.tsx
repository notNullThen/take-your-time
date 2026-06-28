import { useState } from 'react';
import { useTimeTracker } from './hooks/useTimeTracker';
import { calculateBalances } from './utils/calculations';
import { SummaryCards } from './components/SummaryCards';
import { DataEntryForm } from './components/DataEntryForm';
import { CalendarView } from './components/CalendarView';
import { SettingsModal } from './components/SettingsModal';

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

  const { totalOverwork, totalUnderwork, netBalance } = calculateBalances(records, settings);

  return (
    <div className="app-container">
      <header className="flex-between glass-panel" style={{ padding: '16px 24px', marginBottom: '24px' }}>
        <h1>Take Your Time</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="secondary" onClick={exportData}>
            Export JSON
          </button>
          <button className="secondary" onClick={() => setIsSettingsOpen(true)}>
            ⚙️ Settings
          </button>
        </div>
      </header>

      <SummaryCards
        totalOverwork={totalOverwork}
        totalUnderwork={totalUnderwork}
        netBalance={netBalance}
        settings={settings}
      />

      <DataEntryForm onAdd={addRecord} defaultHours={settings.standardHours} />

      <h2 style={{ marginTop: '32px' }}>History</h2>
      <CalendarView records={records} settings={settings} onDelete={deleteRecord} />

      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onSave={updateSettings}
          onClose={() => setIsSettingsOpen(false)}
          onImport={importData}
        />
      )}
    </div>
  );
}

export default App;
