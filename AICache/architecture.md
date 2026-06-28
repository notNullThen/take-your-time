# System Architecture & Application Flow

**Take Your Time** is a client-side only React + TypeScript + Vite application. It requires no backend and relies exclusively on the browser's `localStorage` for persistence.

## Core Structure
- **Vite & React**: The application is built as a Single Page Application (SPA).
- **CSS**: Pure Vanilla CSS (`index.css`), avoiding utility frameworks to maintain explicit control over the "glassmorphism" aesthetic.

## Component Breakdown

1. **`App.tsx` (The Orchestrator)**
   - Initializes the local storage hook `useTimeTracker()`.
   - Renders the global layout (Header).
   - Manages Theme switching logic (dark/light/auto).
   - Injects the `beforeunload` event listener to warn users against closing the tab without exporting their data.

2. **`RecordTable.tsx` (The Core UI)**
   - Renders the calendar data for the selected month.
   - Calculates weeks using a helper `getMonthCalendar()` which constructs standard Monday-Sunday weeks based on the current year.
   - Provides inline, dual-input fields (HH:MM) for entering work time directly into the table.
   - Displays both Daily Balances and Weekly Balances dynamically.

3. **`SummaryCards.tsx`**
   - Displays top-level metrics: Total Net Balance, Valid Overwork, and Total Underwork.

4. **`SettingsModal.tsx`**
   - Allows users to change system-wide parameters such as the length of a standard workday and the expiration policy for overworked hours.

## Deployment Profile
Since there is no server-side processing, the app builds to a strictly static folder (`dist`) via `npm run build` and can be hosted freely on Render, Vercel, Netlify, or GitHub Pages.
