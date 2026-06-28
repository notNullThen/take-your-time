import { useState, useEffect } from "react";
import { useTimeTracker } from "./hooks/useTimeTracker";
import { calculateBalances } from "./utils/calculations";
import { SummaryCards } from "./components/SummaryCards";
import { RecordTable } from "./components/RecordTable";
import { SettingsModal } from "./components/SettingsModal";
import type { ExportData } from "./types";

const CLEARING_ALL_DATA_FLAG = "__takeYourTimeClearingAllData";

type ClearAllDataWindow = Window & {
  [CLEARING_ALL_DATA_FLAG]?: boolean;
};

const LoadIcon = () => (
  <svg className="button-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 3v12" />
    <path d="m7 10 5 5 5-5" />
    <path d="M5 21h14" />
  </svg>
);

const SaveIcon = () => (
  <svg className="button-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
    <path d="M17 21v-8H7v8" />
    <path d="M7 3v5h8" />
  </svg>
);

function App() {
  const {
    records,
    settings,
    addRecord,
    deleteRecord,
    updateSettings,
    importData,
    exportData,
    clearAllData,
  } = useTimeTracker();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Apply theme class to body
  useEffect(() => {
    let activeTheme = settings.theme;
    if (activeTheme === "auto") {
      activeTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }

    if (activeTheme === "light") {
      document.body.classList.add("light-theme");
    } else {
      document.body.classList.remove("light-theme");
    }
  }, [settings.theme]);

  // Handle system theme changes if set to auto
  useEffect(() => {
    if (settings.theme !== "auto") return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        document.body.classList.remove("light-theme");
      } else {
        document.body.classList.add("light-theme");
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [settings.theme]);

  // Warning when closing the tab
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if ((window as ClearAllDataWindow)[CLEARING_ALL_DATA_FLAG]) return;

      e.preventDefault();
      const message =
        "Please export your data before closing to prevent data loss!";
      e.returnValue = message;
      return message;
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const cycleTheme = () => {
    const nextTheme: Record<string, "auto" | "dark" | "light"> = {
      auto: "dark",
      dark: "light",
      light: "auto",
    };
    updateSettings({ theme: nextTheme[settings.theme] });
  };

  const getThemeIcon = () => {
    if (settings.theme === "auto") return "💻";
    if (settings.theme === "dark") return "🌙";
    return "☀️";
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
          alert("Invalid file format.");
        }
      } catch {
        alert("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = "";
  };

  const { totalOverwork, totalUnderwork, netBalance } = calculateBalances(
    records,
    settings,
  );

  return (
    <div className="app-container">
      <header className="app-header glass-panel">
        <h1>Take Your Time</h1>
        <div className="app-actions">
          <button
            className="secondary"
            onClick={cycleTheme}
            title={`Theme: ${settings.theme}`}
            aria-label={`Theme: ${settings.theme}`}
          >
            {getThemeIcon()}
          </button>

          <label
            className="secondary file-button collapses-on-mobile"
            title="Load Data"
            aria-label="Load Data"
          >
            <LoadIcon />
            <span className="button-label">Load Data</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden-file-input"
            />
          </label>

          <button
            className="secondary collapses-on-mobile"
            onClick={exportData}
            title="Save Data"
            aria-label="Save Data"
          >
            <SaveIcon />
            <span className="button-label">Save Data</span>
          </button>

          <button
            className="secondary"
            onClick={() => setIsSettingsOpen(true)}
            title="Settings"
            aria-label="Settings"
          >
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
          onClearAll={clearAllData}
        />
      )}
    </div>
  );
}

export default App;
