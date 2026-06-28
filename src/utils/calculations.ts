import type { AppSettings, WorkRecord } from '../types';

export function calculateBalances(
  records: WorkRecord[],
  settings: AppSettings,
  currentDateStr: string = new Date().toISOString().split('T')[0]
) {
  let totalOverwork = 0;
  let totalUnderwork = 0;

  const current = new Date(currentDateStr);

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
        const recordDate = new Date(record.date);
        
        // Calculate month difference
        const monthsDiff =
          (current.getFullYear() - recordDate.getFullYear()) * 12 +
          (current.getMonth() - recordDate.getMonth());

        // If current date is within the expiration period
        // Let's say expiration = 3 months. 
        // Example: Record in Jan (0). Current is Apr (3). Diff = 3. Still alive if Diff <= 3.
        // Wait, normally if it's the 4th month it expires, or exactly 3 calendar months.
        // The prompt says "overworked hours are living only 3 monhts". Let's use <= expirationMonths.
        if (monthsDiff <= settings.expirationMonths) {
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

export function groupByMonth(records: WorkRecord[]) {
  const grouped: Record<string, WorkRecord[]> = {};
  records.forEach((r) => {
    const month = r.date.substring(0, 7); // YYYY-MM
    if (!grouped[month]) grouped[month] = [];
    grouped[month].push(r);
  });
  return grouped;
}
