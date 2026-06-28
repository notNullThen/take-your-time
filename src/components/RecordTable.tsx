import React, { useState, useCallback } from 'react';
import type { AppSettings, WorkRecord } from '../types';
import { MONTH_NAMES, formatHoursToHHMM } from '../utils/calculations';

interface RecordTableProps {
  records: WorkRecord[];
  settings: AppSettings;
  onSettingsChange: (settings: Partial<AppSettings>) => void;
  onUpdate: (month: number, day: number, hours: number) => void;
  onDelete: (month: number, day: number) => void;
}

function getMonthCalendar(year: number, month: number) {
  const weeks: ({ day: number; month: number } | null)[][] = [];
  let currentWeek: ({ day: number; month: number } | null)[] = [];
  
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  
  let firstDayOfWeek = firstDay.getDay() - 1;
  if (firstDayOfWeek === -1) firstDayOfWeek = 6;
  
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(null);
  }
  
  for (let d = 1; d <= lastDay.getDate(); d++) {
    currentWeek.push({ day: d, month: month });
    if (currentWeek.length === 7) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  }
  
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push([...currentWeek]);
  }
  
  return weeks;
}

export const RecordTable: React.FC<RecordTableProps> = ({ records, settings, onSettingsChange, onUpdate, onDelete }) => {
  const currentMonthIdx = new Date().getMonth() + 1;
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonthIdx);
  const [editState, setEditState] = useState<{ key: string; value: string } | null>(null);

  const currentYear = new Date().getFullYear();
  const weeks = getMonthCalendar(currentYear, selectedMonth);
  const monthName = MONTH_NAMES[selectedMonth - 1];

  const commitValue = useCallback((month: number, day: number, type: 'h' | 'm', value: string, otherFieldValue: number) => {
    const parsed = value === '' ? 0 : parseInt(value, 10);
    const clamped = isNaN(parsed) ? 0 : (type === 'm' ? Math.min(parsed, 59) : parsed);
    const newH = type === 'h' ? clamped : otherFieldValue;
    const newM = type === 'm' ? clamped : otherFieldValue;
    const total = newH + newM / 60;
    if (total === 0) {
      onDelete(month, day);
    } else {
      onUpdate(month, day, total);
    }
  }, [onUpdate, onDelete]);

  const focusNextRowHours = (currentInput: HTMLElement) => {
    let row = currentInput.closest('tr')?.nextElementSibling;
    while (row) {
      const nextH = row.querySelector('.time-input-hours') as HTMLInputElement;
      if (nextH) {
        if (settings.skipWeekends && row.getAttribute('data-weekend') === 'true') {
          row = row.nextElementSibling;
          continue;
        }
        setTimeout(() => { nextH.focus(); nextH.select(); }, 0);
        return;
      }
      row = row.nextElementSibling;
    }
    // No next row found - blur current input
    (currentInput as HTMLInputElement).blur();
  };

  const renderRow = (dateObj: { month: number; day: number } | null, weekIdx: number, dayIdx: number) => {
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayName = dayNames[dayIdx];
    const isWeekend = dayIdx >= 5;

    if (!dateObj) {
      return (
        <tr key={`empty-${weekIdx}-${dayIdx}`} className="empty-row" data-weekend={isWeekend}>
          <td className="text-muted">{dayName}</td>
          <td className="text-muted"></td>
          <td className="text-muted">-</td>
          <td className="text-muted">-</td>
          <td className="text-muted"></td>
        </tr>
      );
    }

    const record = records.find(r => r.month === dateObj.month && r.day === dateObj.day);
    const totalHours = record ? record.hours : 0;
    const isFilled = totalHours > 0;
    
    let diff = 0;
    if (isFilled) {
      diff = totalHours - settings.standardHours;
    }

    const hrs = Math.floor(totalHours);
    const mins = Math.round((totalHours - hrs) * 60);

    const hKey = `h-${dateObj.month}-${dateObj.day}`;
    const mKey = `m-${dateObj.month}-${dateObj.day}`;
    const hEditing = editState?.key === hKey;
    const mEditing = editState?.key === mKey;
    const hDisplay = hEditing ? editState.value : (isFilled ? String(hrs).padStart(2, '0') : '');
    const mDisplay = mEditing ? editState.value : (isFilled ? String(mins).padStart(2, '0') : '');

    const handleClear = () => {
      onDelete(dateObj.month, dateObj.day);
    };

    return (
      <tr key={`date-${dateObj.month}-${dateObj.day}`} className={!isFilled ? "empty-row" : ""} data-weekend={isWeekend}>
        <td className={!isFilled ? "text-muted" : ""}>{dayName}</td>
        <td className={!isFilled ? "text-muted" : ""}>
          <span className="desktop-only">{monthName} </span>{dateObj.day}
        </td>
        <td>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <input
              type="text"
              inputMode="numeric"
              className={`time-input-hours${!isFilled ? ' text-muted' : ''}`}
              value={hDisplay}
              onFocus={(e) => {
                setEditState({ key: hKey, value: isFilled ? String(hrs).padStart(2, '0') : '' });
                setTimeout(() => e.target.select(), 0);
              }}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                setEditState({ key: hKey, value: val });
                if (val.length === 2) {
                  commitValue(dateObj.month, dateObj.day, 'h', val, mins);
                  setEditState({ key: mKey, value: isFilled ? String(mins).padStart(2, '0') : '' });
                  const minInput = e.target.nextElementSibling?.nextElementSibling as HTMLInputElement;
                  if (minInput) {
                    setTimeout(() => { minInput.focus(); minInput.select(); }, 0);
                  }
                }
              }}
              onBlur={() => {
                if (hEditing) {
                  commitValue(dateObj.month, dateObj.day, 'h', editState.value, mins);
                  setEditState(null);
                }
              }}
              placeholder="00"
              style={{ 
                width: '56px', 
                padding: '6px',
                margin: '-6px 0',
                fontSize: '0.9rem',
                textAlign: 'center'
              }}
            />
            <span style={{ fontWeight: 'bold', color: !isFilled ? 'var(--text-muted)' : 'inherit' }}>:</span>
            <input
              type="text"
              inputMode="numeric"
              className={`time-input-minutes${!isFilled ? ' text-muted' : ''}`}
              value={mDisplay}
              onFocus={(e) => {
                setEditState({ key: mKey, value: isFilled ? String(mins).padStart(2, '0') : '' });
                setTimeout(() => e.target.select(), 0);
              }}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                setEditState({ key: mKey, value: val });
                if (val.length === 2) {
                  const clampedM = Math.min(parseInt(val, 10) || 0, 59);
                  commitValue(dateObj.month, dateObj.day, 'm', String(clampedM), hrs);
                  setEditState(null);
                  focusNextRowHours(e.target);
                }
              }}
              onBlur={() => {
                if (mEditing) {
                  commitValue(dateObj.month, dateObj.day, 'm', editState.value, hrs);
                  setEditState(null);
                }
              }}
              placeholder="00"
              style={{ 
                width: '56px', 
                padding: '6px',
                margin: '-6px 0',
                fontSize: '0.9rem',
                textAlign: 'center'
              }}
            />
          </div>
        </td>
        <td className={!isFilled ? "text-muted" : (diff > 0 ? 'text-success' : diff < 0 ? 'text-danger' : 'text-muted')} style={{ fontWeight: isFilled ? 600 : 400 }}>
          {isFilled ? (diff > 0 ? `+${formatHoursToHHMM(diff)}` : formatHoursToHHMM(diff)) : '-'}
        </td>
        <td>
          <button 
            className="secondary" 
            onClick={handleClear}
            disabled={!isFilled}
            aria-label={`Clear day ${dateObj.day}`}
            style={{ 
              opacity: isFilled ? 1 : 0.5,
              padding: '6px 12px',
              fontSize: '0.8rem'
            }}
          >
            <span className="desktop-only">Clear</span>
            <span className="mobile-only" aria-hidden="true">🧹</span>
          </button>
        </td>
      </tr>
    );
  };

  return (
    <div className="glass-panel">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ marginBottom: '8px' }}>View Month</h2>
        <div className="table-toolbar">
          <p className="text-muted table-tip">
            💡 Tip: Type 2 digits for hours → auto-jumps to minutes. Type 2 digits for minutes → auto-jumps to the next day!
          </p>
          <label className="switch-control">
            <input
              type="checkbox"
              checked={settings.skipWeekends}
              onChange={(e) => onSettingsChange({ skipWeekends: e.target.checked })}
            />
            <span className="switch-track" aria-hidden="true">
              <span className="switch-thumb" />
            </span>
            <span>Skip weekends</span>
          </label>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {MONTH_NAMES.map((name, i) => (
            <button
              key={i + 1}
              onClick={() => setSelectedMonth(i + 1)}
              className={selectedMonth === i + 1 ? 'primary' : 'secondary'}
              style={{
                borderRadius: '20px',
                padding: '6px 16px',
                fontSize: '0.85rem'
              }}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>
                <span className="desktop-only">Weekday</span>
                <span className="mobile-only">Day</span>
              </th>
              <th>Date</th>
              <th>Work (HH:MM)</th>
              <th>
                <span className="desktop-only">Day Balance</span>
                <span className="mobile-only">Day Bal.</span>
              </th>
              <th><span className="desktop-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, weekIdx) => {
              let weeklyDiff = 0;
              let anyFilled = false;
              
              const weekRows = week.map((dateObj, dayIdx) => {
                if (dateObj) {
                  const record = records.find(r => r.month === dateObj.month && r.day === dateObj.day);
                  if (record && record.hours > 0) {
                    weeklyDiff += (record.hours - settings.standardHours);
                    anyFilled = true;
                  }
                }
                return renderRow(dateObj, weekIdx, dayIdx);
              });

              weekRows.push(
                <tr key={`weekly-summary-${weekIdx}`} style={{ background: 'var(--glass-border)' }}>
                  <td colSpan={3} style={{ textAlign: 'right', fontWeight: 600 }}>Weekly Balance:</td>
                  <td colSpan={2} style={{ fontWeight: 600 }} className={!anyFilled ? "text-muted" : (weeklyDiff > 0 ? 'text-success' : weeklyDiff < 0 ? 'text-danger' : 'text-muted')}>
                    {anyFilled ? (weeklyDiff > 0 ? `+${formatHoursToHHMM(weeklyDiff)}` : formatHoursToHHMM(weeklyDiff)) : '-'}
                  </td>
                </tr>
              );

              // Add a separator between weeks
              if (weekIdx < weeks.length - 1) {
                weekRows.push(
                  <tr key={`sep-${weekIdx}`}>
                    <td colSpan={5} style={{ height: '16px', borderBottom: 'none' }}></td>
                  </tr>
                );
              }

              return weekRows;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
