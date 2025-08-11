# DonkMaster Frontend (Vite + React)

This is the React frontend for DonkMaster.

- Built with Vite + React + TypeScript
- Communicates with Django backend API endpoints (e.g. `/api/translate`)
- Includes a translation form and a placeholder for music/lyrics display

## Getting Started

```sh
npm install
npm run dev
```

## Features
- Translation UI (calls /api/translate)
- Placeholder for music/lyrics display (to be implemented)

## Development
- Edit `src/App.tsx` to customize the UI
- API endpoints are expected to be served from the same origin (proxy settings may be needed for local dev)
