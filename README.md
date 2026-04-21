# Weather Pulse

Weather Pulse is a polished React weather application built for portfolio and recruiter demos. It lets users search any city and see current weather conditions in a clean, modern interface.

## Why this version is safe to publish

- no private API keys are required
- no `.env` file is needed for production
- the app consumes public Open-Meteo services
- `.gitignore` already blocks future environment files from being committed

## Features

- city search with Enter key or search button
- current temperature, humidity, and wind speed
- day and night weather icons
- clear empty and error states
- responsive UI for desktop and mobile
- deploy-friendly Vite setup

## Tech stack

- React
- Vite
- CSS
- Open-Meteo Geocoding API
- Open-Meteo Forecast API

## Run locally

```bash
npm install
npm run dev
```

## Build for production

```bash
npm run build
```

## Recommended deployment

This app is ready for static hosting on:

- Vercel
- Netlify
- GitHub Pages

For Vercel or Netlify, the default build settings are enough:

- Build command: `npm run build`
- Output directory: `dist`
