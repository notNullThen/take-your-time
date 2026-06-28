import React, { useEffect, useState } from 'react';
import type { AppSettings } from '../types';
import { formatHoursToHHMM } from '../utils/calculations';

interface SummaryCardsProps {
  totalOverwork: number;
  totalUnderwork: number;
  netBalance: number;
  settings: AppSettings;
}

const ChevronDownIcon = () => (
  <svg className="breakdown-toggle-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalOverwork,
  totalUnderwork,
  netBalance,
  settings,
}) => {
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !window.matchMedia('(max-width: 640px)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 640px)');
    const handleChange = (event: MediaQueryListEvent) => {
      setIsBreakdownOpen(!event.matches);
    };

    setIsBreakdownOpen(!mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

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
      <details
        className="glass-panel breakdown-card"
        open={isBreakdownOpen}
        onToggle={(event) => setIsBreakdownOpen(event.currentTarget.open)}
      >
        <summary className="breakdown-summary">
          <h2 className="text-muted">Breakdown</h2>
          <span className="breakdown-toggle-button" aria-hidden="true">
            <ChevronDownIcon />
          </span>
        </summary>
        <div className="breakdown-content">
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
      </details>
    </div>
  );
};
