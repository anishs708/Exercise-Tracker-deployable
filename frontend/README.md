# Formwork Frontend

React and Vite frontend for the Exercise Tracker API.

## Run locally

Start the backend on port `3000`, then run:

```cmd
npm install
npm run dev
```

The frontend opens at `http://localhost:5173`.

## Environment

The API defaults to `http://localhost:3000`. To use another address, create a `.env` file based on `.env.example`:

```env
VITE_API_URL=http://localhost:3000
```

Authentication uses the backend's HTTP-only JWT cookie, so requests include credentials automatically.
