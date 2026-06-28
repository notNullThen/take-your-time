# Data Model & State Management

Because the app is entirely client-side, the source of truth is `localStorage`.

## 1. Types (`src/types.ts`)
The application stores records without years. It operates on a perpetual annual cycle to simplify inputs.
```typescript
export interface WorkRecord {
  month: number; // 1-12
  day: number;   // 1-31
  hours: number; // Stored as decimal (e.g., 4.5 = 4h 30m)
}

export interface AppSettings {
  standardHours: number; // default 8
  expirationMonths: number | 'endless'; // default 3
  theme: 'auto' | 'dark' | 'light';
}
```

## 2. State Hook (`useTimeTracker.ts`)
- Encapsulates `localStorage` reads/writes.
- Automatically handles migrations (ignoring old JSON models that relied on string `date` fields).
- Handles Import/Export logic by directly stringifying the React state into `.json` blobs.

## 3. Business Logic (`src/utils/calculations.ts`)
The core algorithms of the app live here.

**Overwork Expiration Policy**:
Because years are excluded from the data model, expiration calculates "months elapsed" cyclically using modulo arithmetic:
```typescript
// Example: current month is 2 (Feb), record month is 11 (Nov)
const monthsDiff = (currentMonth - record.month + 12) % 12;
// Result: 3 months ago.
```
- **Underwork** (negative balance) has an infinite lifespan.
- **Overwork** (positive balance) is discarded from the `Total Net Balance` once `monthsDiff >= settings.expirationMonths`. With the default 3-month policy, months 0, 1, and 2 remain valid; at month 3 the overwork no longer counts.

**Time Formatting**:
- Data is stored as decimal floats for easy math but converted strictly to `HH:MM` in the UI via `formatHoursToHHMM()`.
