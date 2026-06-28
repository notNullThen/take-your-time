import type { AppSettings, WorkRecord } from '../types';

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function calculateBalances(
  records: WorkRecord[],
  settings: AppSettings,
  currentMonth: number = new Date().getMonth() + 1
) {
  let totalOverwork = 0;
  let totalUnderwork = 0;

  records.forEach((record) => {
    const diff = record.hours - settings.standardHours;

    if (diff < 0) {
      // Underwork has infinite lifetime
      totalUnderwork += diff; // diff is negative
    } else if (diff > 0) {
      // Overwork expires
      if (settings.expirationMonths === 'endless') {
        totalOverwork += diff;
      } else {
        // Calculate month difference circularly
        // e.g., currentMonth = 2 (Feb), record.month = 11 (Nov)
        // (2 - 11 + 12) % 12 = 3 months ago
        const monthsDiff = (currentMonth - record.month + 12) % 12;

        if (monthsDiff < settings.expirationMonths) {
          totalOverwork += diff;
        }
      }
    }
  });

  return {
    totalOverwork,
    totalUnderwork,
    netBalance: totalOverwork + totalUnderwork,
  };
}

// Groups by month, returning an array sorted by month (1 to 12)
export function groupAndSortRecords(records: WorkRecord[]) {
  const grouped: Record<number, WorkRecord[]> = {};
  
  records.forEach((r) => {
    if (!grouped[r.month]) grouped[r.month] = [];
    grouped[r.month].push(r);
  });

  // Sort days within each month descending (newest first, 31 to 1)
  Object.keys(grouped).forEach((m) => {
    grouped[Number(m)].sort((a, b) => b.day - a.day);
  });

  // Return sorted entries by month descending (12 to 1)
  return Object.entries(grouped)
    .sort(([m1], [m2]) => Number(m2) - Number(m1))
    .map(([monthStr, monthRecords]) => ({
      month: Number(monthStr),
      records: monthRecords,
    }));
}

// Format decimal hours to HH:MM format
export function formatHoursToHHMM(decimalHours: number) {
  const isNeg = decimalHours < 0;
  const absHours = Math.abs(decimalHours);
  const h = Math.floor(absHours);
  const m = Math.round((absHours - h) * 60);
  const sign = isNeg ? '-' : '+';
  return `${isNeg ? sign : ''}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
