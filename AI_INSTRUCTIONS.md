# AI Agent Instructions

## Before Changing Code

1. Start by reading the markdown files located inside the `AICache/` directory.
2. The `AICache/` contains distilled context about the application's non-standard architecture, including:
   - Client-side only persistence logic.
   - The cyclic (year-less) date and expiration algorithms.
   - Strict styling guidelines (flat glassmorphism, no box-shadows, vanilla CSS).
3. Prefer the existing client-side architecture, vanilla CSS, and lightweight date logic unless the task clearly calls for a different direction.
4. After each code change, run `npm run test` and inspect the result before wrapping up. If tests cannot be run, document the reason and the remaining risk.

Once you have read the `AICache/` files, proceed with the user's request.
