# Take Your Time

A client-side utility to track your work hours and calculate valid overwork and underwork balances.

## Features
- **Local Storage:** All your data remains private and securely stored within your browser.
- **Expiration Policies:** Overworked hours can be configured to expire after a certain number of months. Underwork hours do not expire.
- **Data Portability:** Export your configurations and raw input data to JSON format, and seamlessly import it on another device.
- **Responsive UI:** Premium glassmorphism design that works perfectly on both desktop and mobile devices.

## Running Locally

To run the application locally on your machine, follow these steps:

1. Ensure you have [Node.js](https://nodejs.org/) installed.
2. Open a terminal in the project directory (`/home/e-ubuntu/projects/take-your-time`).
3. Install the required dependencies:
   ```bash
   npm install
   ```
4. Start the local development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`).

## Deployment

This app is entirely client-side and can be hosted statically. To deploy on platforms like Render.com:
- Connect your GitHub repository.
- Set the build command to: `npm run build`
- Set the publish directory to: `dist`
