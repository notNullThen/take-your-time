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

export const RecordTable: React.FC<RecordTableProps> = ({ records, settings, onUpdate, onDelete }) => {
  const currentMonthIdx = new Date().getMonth() + 1;
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonthIdx);

  const currentYear = new Date().getFullYear();
  const weeks = getMonthCalendar(currentYear, selectedMonth);
  const monthName = MONTH_NAMES[selectedMonth - 1];

  const handleInputChange = (month: number, day: number, value: string) => {
    if (value === '') {
      onDelete(month, day);
    } else {
      const hours = Number(value);
      if (!isNaN(hours) && hours >= 0) {
        onUpdate(month, day, hours);
      }
    }
  };

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
        </tr>
      );
    }

    const record = records.find(r => r.month === dateObj.month && r.day === dateObj.day);
    const isFilled = !!record;
    
    let diff = 0;
    if (isFilled) {
      diff = record.hours - settings.standardHours;
    }

    return (
      <tr key={`date-${dateObj.month}-${dateObj.day}`} className={!isFilled ? "empty-row" : ""}>
        <td className={!isFilled ? "text-muted" : ""}>{dayName}</td>
        <td className={!isFilled ? "text-muted" : ""}>{monthName} {dateObj.day}</td>
        <td>
          <input
            type="number"
            min="0"
            step="0.5"
            value={isFilled ? record.hours : ''}
            onChange={(e) => handleInputChange(dateObj.month, dateObj.day, e.target.value)}
            placeholder="-"
            style={{ 
              width: '80px', 
              padding: '6px 10px',
              margin: '-6px 0', // offset padding to avoid huge rows
              fontSize: '0.9rem'
            }}
          />
        </td>
        <td className={!isFilled ? "text-muted" : (diff > 0 ? 'text-success' : diff < 0 ? 'text-danger' : 'text-muted')} style={{ fontWeight: isFilled ? 600 : 400 }}>
          {isFilled ? `${diff > 0 ? '+' : ''}${diff} hrs` : '-'}
        </td>
      </tr>
    );
  };

  return (
    <div className="glass-panel">
      <div className="flex-between" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2>View Month:</h2>
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            style={{ marginBottom: '16px', fontWeight: 'bold' }}
          >
            {MONTH_NAMES.map((name, i) => (
              <option key={i + 1} value={i + 1}>{name}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Weekday</th>
              <th>Date</th>
              <th>Work (hrs)</th>
              <th>Day Balance</th>
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, weekIdx) => {
              const weekRows = week.map((dateObj, dayIdx) => renderRow(dateObj, weekIdx, dayIdx));

              // Add a separator between weeks
              if (weekIdx < weeks.length - 1) {
                weekRows.push(
                  <tr key={`sep-${weekIdx}`}>
                    <td colSpan={4} style={{ height: '16px', borderBottom: 'none' }}></td>
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
