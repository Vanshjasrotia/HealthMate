# HealthMate

HealthMate is a full-stack health assistant built with a React frontend and a FastAPI backend. It combines local ML prediction models, Gemini-powered report/chat features, JWT authentication, SQLite persistence, and medication reminders.

## Stack

- Frontend: React, Vite, React Router, Tailwind CSS
- Backend: FastAPI, SQLAlchemy, SQLite, APScheduler
- AI and ML: Gemini API, pandas, scikit-learn, joblib

## Features

- Disease risk prediction for diabetes, heart, liver, and kidney conditions
- Medical chatbot with saved conversation history for signed-in users
- Lab report analysis for PDF, image, and text uploads
- Medication reminders with persistence and WebSocket notifications
- Personal dashboard with predictions, report counts, reminder counts, and health tips

## Project Structure

```text
HealthMate/
├── backend/
├── ml/
├── public/
├── src/
├── .env.example
├── package.json
└── README.md
```

## Local Setup

### 1. Frontend

```bash
npm install
cp .env.example .env
npm run dev
```

Frontend runs on `http://127.0.0.1:5173`.

### 2. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python -m backend
```

Backend runs on `http://127.0.0.1:8000`.

### 3. ML Models

The backend expects trained models inside `ml/models/`.

If they are missing:

```bash
cd ml
pip install -r requirements-ml.txt
python train_all_disease_models.py
```

## Environment Variables

### Frontend

See [.env.example](/c:/Users/91817/HealthMate/.env.example).

- `VITE_API_BASE_URL`
- `VITE_WS_BASE_URL`

### Backend

See [backend/.env.example](/c:/Users/91817/HealthMate/backend/.env.example).

- `APP_NAME`
- `APP_VERSION`
- `DEBUG`
- `DATABASE_URL`
- `CORS_ALLOW_ORIGINS`
- `JWT_SECRET_KEY`
- `JWT_ALGORITHM`
- `JWT_EXPIRE_MINUTES`
- `GEMINI_API_KEY`

## Deployment Notes

- The frontend now reads API and WebSocket endpoints from environment variables instead of hardcoded localhost values.
- The backend exposes `GET /health` for health checks.
- The backend starts the reminder scheduler during app startup and mounts the reminder WebSocket on the same app.
- Internal backend imports were normalized for package-based startup with `uvicorn backend.main:app`.
- SQLite is fine for small deployments; for larger production use, move `DATABASE_URL` to PostgreSQL or MySQL.
- Use a strong `JWT_SECRET_KEY` in production.
- Do not commit `.env`, database files, or trained artifacts unless you intentionally want them versioned.

## Recommended Production Commands

### Frontend build

```bash
npm run build
```

### Backend app server

```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

## Health Check

```bash
GET /health
```

Expected response:

```json
{
  "status": "ok",
  "service": "HealthMate API",
  "version": "1.0.0"
}
```

## Render Deployment

This repo now includes [render.yaml](/c:/Users/91817/HealthMate/render.yaml) for deploying only the backend on Render.

It creates:

- `healthmate-api` as a Python web service
- `healthmate-db` as a Render Postgres database

### Deploy steps

1. Push this repo to GitHub.
2. In Render, create a new Blueprint and select the repo.
3. Set `GEMINI_API_KEY`.
4. Set `CORS_ALLOW_ORIGINS` to your Vercel frontend URL.
5. Deploy the Blueprint.

Example:

```text
https://your-app.vercel.app
```

If you use both preview and production Vercel domains, separate them with commas:

```text
https://your-app.vercel.app,https://your-app-git-main-your-team.vercel.app
```

### Vercel frontend settings

In Vercel, set:

- `VITE_API_BASE_URL=https://your-render-backend.onrender.com`
- `VITE_WS_BASE_URL=wss://your-render-backend.onrender.com`

Then redeploy the frontend so it points to the Render backend.

### Render-specific notes

- Backend health check path: `/health`
- Backend start command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
- Backend database comes from Render Postgres via `DATABASE_URL`
- `CORS_ALLOW_ORIGINS` is intentionally left unset in the Blueprint so you can provide your real Vercel domain in Render
