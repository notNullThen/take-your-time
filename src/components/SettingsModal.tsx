import { useState } from 'react';
import type { AppSettings } from '../types';

interface SettingsModalProps {
  settings: AppSettings;
  onSave: (s: Partial<AppSettings>) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onSave, onClose }) => {
  const [standardHours, setStandardHours] = useState<number | string>(settings.standardHours);
  const [expiration, setExpiration] = useState<string>(
    settings.expirationMonths === 'endless' ? 'endless' : String(settings.expirationMonths)
  );

  const handleSave = () => {
    onSave({
      standardHours: Number(standardHours) || 8,
      expirationMonths: expiration === 'endless' ? 'endless' : Number(expiration),
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-content">
        <h2>Settings</h2>
        
        <div className="form-group">
          <label htmlFor="standardHours">Standard Working Hours / Day</label>
          <input
            type="number"
            id="standardHours"
            value={standardHours}
            onChange={(e) => setStandardHours(e.target.value)}
            step="0.5"
            min="1"
          />
        </div>

        <div className="form-group">
          <label htmlFor="expiration">Overwork Expiration Policy</label>
          <select
            id="expiration"
            value={expiration}
            onChange={(e) => setExpiration(e.target.value)}
          >
            <option value="1">1 Month</option>
            <option value="3">3 Months</option>
            <option value="6">6 Months</option>
            <option value="12">12 Months</option>
            <option value="endless">Endless (Never expires)</option>
          </select>
          <small className="text-muted">How long positive overwork hours remain valid.</small>
        </div>

        <div className="flex-between" style={{ marginTop: '24px' }}>
          <button className="secondary" onClick={onClose}>Cancel</button>
          <button className="primary" onClick={handleSave}>Save Changes</button>
        </div>
      </div>
    </div>
  );
};
