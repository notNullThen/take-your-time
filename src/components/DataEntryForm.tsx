import React, { useState } from 'react';

interface DataEntryFormProps {
  onAdd: (date: string, hours: number) => void;
  defaultHours: number;
}

export const DataEntryForm: React.FC<DataEntryFormProps> = ({ onAdd, defaultHours }) => {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [hours, setHours] = useState<number | string>(defaultHours);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (date && typeof hours === 'number') {
      onAdd(date, hours);
    } else if (typeof hours === 'string' && !isNaN(Number(hours))) {
      onAdd(date, Number(hours));
    }
  };

  return (
    <form className="glass-panel" onSubmit={handleSubmit}>
      <h2>Log Work Hours</h2>
      <div className="grid-2" style={{ alignItems: 'end' }}>
        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="hours">Hours Worked</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="number"
              id="hours"
              value={hours}
              onChange={(e) => setHours(e.target.value === '' ? '' : Number(e.target.value))}
              step="0.5"
              min="0"
              required
              style={{ flex: 1 }}
            />
            <button type="submit" className="primary">Save</button>
          </div>
        </div>
      </div>
    </form>
  );
};
