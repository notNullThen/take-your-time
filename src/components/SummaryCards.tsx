import React from 'react';
import type { AppSettings } from '../types';
import { formatHoursToHHMM } from '../utils/calculations';

interface SummaryCardsProps {
  totalOverwork: number;
  totalUnderwork: number;
  netBalance: number;
  settings: AppSettings;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalOverwork,
  totalUnderwork,
  netBalance,
  settings,
}) => {
  return (
    <div className="grid-2">
      <div className="glass-panel">
        <h2 className="text-muted">Total Net Balance</h2>
        <h1
          className={netBalance > 0 ? 'text-success' : netBalance < 0 ? 'text-danger' : ''}
          data-testid="total-net-balance"
        >
          {netBalance > 0 ? '+' : ''}{formatHoursToHHMM(netBalance).replace('+', '').replace('-', '')} 
        </h1>
        <p className="text-muted" style={{ marginTop: '8px', fontSize: '0.85rem' }} data-testid="standard-day">
          Standard day: {settings.standardHours} hrs
        </p>
      </div>
      <div className="glass-panel">
        <h2 className="text-muted">Breakdown</h2>
        <div className="flex-between" style={{ marginBottom: '8px' }}>
          <span>Overwork (valid)</span>
          <span className="text-success" data-testid="valid-overwork-balance">+{formatHoursToHHMM(totalOverwork).replace('+', '').replace('-', '')}</span>
        </div>
        <div className="flex-between">
          <span>Underwork</span>
          <span className="text-danger" data-testid="underwork-balance">-{formatHoursToHHMM(totalUnderwork).replace('+', '').replace('-', '')}</span>
        </div>
        <p className="text-muted" style={{ marginTop: '12px', fontSize: '0.8rem' }}>
          * Overwork expires after {settings.expirationMonths} {settings.expirationMonths === 1 ? 'month' : 'months'}. Underwork does not expire.
        </p>
      </div>
    </div>
  );
};
