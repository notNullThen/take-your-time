import React from 'react';
import type { AppSettings, WorkRecord } from '../types';
import { groupByMonth } from '../utils/calculations';

interface CalendarViewProps {
  records: WorkRecord[];
  settings: AppSettings;
  onDelete: (date: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ records, settings, onDelete }) => {
  // Sort records descending
  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));
  const grouped = groupByMonth(sorted);

  return (
    <div>
      {Object.entries(grouped).length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '40px' }}>
          <h3 className="text-muted">No records found.</h3>
          <p className="text-muted">Log your hours above to see your history.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([month, monthRecords]) => {
          // Calculate monthly balance
          let mOver = 0;
          let mUnder = 0;
          monthRecords.forEach(r => {
            const diff = r.hours - settings.standardHours;
            if (diff > 0) mOver += diff;
            if (diff < 0) mUnder += diff;
          });
          const mNet = mOver + mUnder;

          return (
            <div key={month} className="glass-panel">
              <div className="flex-between" style={{ marginBottom: '16px' }}>
                <h2>{new Date(month + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 600 }}>
                    Net:{' '}
                    <span className={mNet > 0 ? 'text-success' : mNet < 0 ? 'text-danger' : ''}>
                      {mNet > 0 ? '+' : ''}{mNet} hrs
                    </span>
                  </div>
                </div>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Hours Logged</th>
                      <th>Balance</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthRecords.map((r) => {
                      const diff = r.hours - settings.standardHours;
                      return (
                        <tr key={r.date}>
                          <td>{r.date}</td>
                          <td>{r.hours}</td>
                          <td className={diff > 0 ? 'text-success' : diff < 0 ? 'text-danger' : 'text-muted'}>
                            {diff > 0 ? '+' : ''}{diff}
                          </td>
                          <td>
                            <button className="danger" onClick={() => onDelete(r.date)}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
