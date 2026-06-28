import { useState } from 'react';
import type { AppSettings } from '../types';

interface SettingsModalProps {
  settings: AppSettings;
  onSave: (s: Partial<AppSettings>) => void;
  onClose: () => void;
  onClearAll: () => Promise<void>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onSave, onClose, onClearAll }) => {
  const [standardHours, setStandardHours] = useState<number | string>(settings.standardHours);
  const [expiration, setExpiration] = useState<string>(
    settings.expirationMonths === 'endless' ? 'endless' : String(settings.expirationMonths)
  );
  const [showClearWarning, setShowClearWarning] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleSave = () => {
    onSave({
      standardHours: Number(standardHours) || 8,
      expirationMonths: expiration === 'endless' ? 'endless' : Number(expiration),
    });
    onClose();
  };

  const handleClearAll = async () => {
    setIsClearing(true);
    await onClearAll();
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

        {/* Danger Zone */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          borderRadius: 'var(--radius)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          background: 'rgba(239, 68, 68, 0.05)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--danger)' }}>Clear All Data</p>
              <small className="text-muted">Permanently delete all records, settings &amp; cache.</small>
            </div>
            {!showClearWarning && (
              <button
                className="danger"
                onClick={() => setShowClearWarning(true)}
                style={{ whiteSpace: 'nowrap' }}
              >
                🗑️ Clear All
              </button>
            )}
          </div>

          {showClearWarning && (
            <div style={{
              marginTop: '12px',
              padding: '12px',
              borderRadius: 'var(--radius)',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
            }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 500, marginBottom: '12px', color: 'var(--danger)' }}>
                ⚠️ This action is irreversible. All your work records, settings, and cached data will be permanently deleted.
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button className="secondary" onClick={() => setShowClearWarning(false)}>
                  Cancel
                </button>
                <button
                  className="danger"
                  onClick={handleClearAll}
                  disabled={isClearing}
                  style={{ fontWeight: 600 }}
                >
                  {isClearing ? 'Deleting...' : 'Yes, Delete Everything'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-between" style={{ marginTop: '24px' }}>
          <button className="secondary" onClick={onClose}>Cancel</button>
          <button className="primary" onClick={handleSave}>Save Changes</button>
        </div>
      </div>
    </div>
  );
};
