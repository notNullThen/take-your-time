# UI, UX, and Styling Guidelines

The application strictly adheres to a clean, flat, glass-like aesthetic without heavy frameworks.

## CSS Rules (`src/index.css`)
- **No Box Shadows**: All drop shadows and lift effects (`transform: translateY`) have been removed across the entire application to maintain a perfectly flat, non-intrusive UI.
- **Glassmorphism**: Elements use a semi-transparent `rgba` background combined with `backdrop-filter: blur(12px)` and a subtle `rgba` border.
- **Themes**:
  - The default state is a deep dark theme.
  - The `.light-theme` class applies to the `<body>` element to override the CSS Custom Properties (`--bg-color`, `--text-color`, etc.) for a crisp, high-contrast light mode.

## Input Mechanisms
- **Work Input**: The user inputs data directly into the `RecordTable`.
- **HH:MM Splitting**: The app uses two independent `<input type="number">` fields side by side, separated by a colon (`:`).
- **Hidden Spinners**: Browser-native up/down spin buttons on number inputs are hidden via `-webkit-inner-spin-button` CSS rules to simulate a digital clock display rather than standard inputs.

## Visual States
- **Unfilled Rows**: If a user clears their time (or sets it to `00:00`), the row immediately reverts to an "unfilled" state. 
- **Empty Rows**: Denoted by the `.empty-row` class, these rows gain a distinct, dim background color (`rgba(255, 255, 255, 0.03)`) and use the `text-muted` color class to visually fall back, making actual work entries "pop" out to the user.
