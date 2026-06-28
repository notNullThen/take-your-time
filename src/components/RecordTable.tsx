import React, { useState } from 'react';
import type { AppSettings, WorkRecord } from '../types';
import { MONTH_NAMES } from '../utils/calculations';

interface RecordTableProps {
  records: WorkRecord[];
  settings: AppSettings;
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

// Format decimal hours to HH:MM format
function formatHoursToHHMM(decimalHours: number) {
  const isNeg = decimalHours < 0;
  const absHours = Math.abs(decimalHours);
  const h = Math.floor(absHours);
  const m = Math.round((absHours - h) * 60);
  const sign = isNeg ? '-' : '+';
  return `${isNeg ? sign : ''}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export const RecordTable: React.FC<RecordTableProps> = ({ records, settings, onUpdate, onDelete }) => {
  const currentMonthIdx = new Date().getMonth() + 1;
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonthIdx);

  const currentYear = new Date().getFullYear();
  const weeks = getMonthCalendar(currentYear, selectedMonth);
  const monthName = MONTH_NAMES[selectedMonth - 1];

  const renderRow = (dateObj: { month: number; day: number } | null, weekIdx: number, dayIdx: number) => {
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayName = dayNames[dayIdx];

    if (!dateObj) {
      return (
        <tr key={`empty-${weekIdx}-${dayIdx}`} className="empty-row">
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

    const handleTimeChange = (type: 'h' | 'm', value: string) => {
      let newH = type === 'h' ? (value === '' ? 0 : parseInt(value)) : hrs;
      let newM = type === 'm' ? (value === '' ? 0 : parseInt(value)) : mins;
      
      if (isNaN(newH)) newH = 0;
      if (isNaN(newM)) newM = 0;

      // Wrap minutes overflow into hours
      if (newM >= 60) {
        newH += Math.floor(newM / 60);
        newM = newM % 60;
      }
      
      const newVal = newH + newM / 60;
      if (newVal === 0) {
        onDelete(dateObj.month, dateObj.day);
      } else {
        onUpdate(dateObj.month, dateObj.day, newVal);
      }
    };

    const handleClear = () => {
      onDelete(dateObj.month, dateObj.day);
    };

    return (
      <tr key={`date-${dateObj.month}-${dateObj.day}`} className={!isFilled ? "empty-row" : ""}>
        <td className={!isFilled ? "text-muted" : ""}>{dayName}</td>
        <td className={!isFilled ? "text-muted" : ""}>{monthName} {dateObj.day}</td>
        <td>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <input
              type="number"
              min="0"
              value={isFilled ? String(hrs).padStart(2, '0') : ''}
              onChange={(e) => handleTimeChange('h', e.target.value)}
              placeholder="00"
              className={!isFilled ? "text-muted" : ""}
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
              type="number"
              min="0"
              max="59"
              value={isFilled ? String(mins).padStart(2, '0') : ''}
              onChange={(e) => handleTimeChange('m', e.target.value)}
              placeholder="00"
              className={!isFilled ? "text-muted" : ""}
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
          {isFilled ? (diff > 0 ? `+${formatHoursToHHMM(diff).substring(1)}` : formatHoursToHHMM(diff)) : '-'}
        </td>
        <td>
          <button 
            className="secondary" 
            onClick={handleClear}
            disabled={!isFilled}
            style={{ 
              opacity: isFilled ? 1 : 0.5,
              padding: '6px 12px',
              fontSize: '0.8rem'
            }}
          >
            Clear
          </button>
        </td>
      </tr>
    );
  };

  return (
    <div className="glass-panel">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ marginBottom: '12px' }}>View Month</h2>
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
              <th>Weekday</th>
              <th>Date</th>
              <th>Work (HH:MM)</th>
              <th>Day Balance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, weekIdx) => {
              const weekRows = week.map((dateObj, dayIdx) => renderRow(dateObj, weekIdx, dayIdx));

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
