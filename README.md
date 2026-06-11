# Physique Meter

Physique Meter is a two-step fitness web app:

- a dark baseline onboarding UI inspired by the provided reference screenshot
- a body-composition scorecard with body-fat estimate, BMI, lean mass, fat mass, goal tracking, history, and responsive layout

## Project Structure

- `index.html` - GitHub Pages entry point
- `frontend/index.html` - frontend app source copy
- `backend/server.js` - small Node.js backend/API server
- `shared/physique.js` - shared body-composition calculation logic
- `.github/workflows/pages.yml` - GitHub Pages deployment workflow
- `outputs/physique-metrics.html` - exported standalone deliverable

## Run The Frontend

Open `index.html` directly in a browser, or visit the GitHub Pages deployment:

`https://umangawasthi-20.github.io/Physique-Meter/`

## Run With Backend

Install Node.js, then run:

```bash
npm start
```

Open:

`http://localhost:3000`

## Backend API

Health check:

```http
GET /api/health
```

Calculate metrics:

```http
POST /api/metrics
Content-Type: application/json

{
  "sex": "male",
  "heightCm": 178,
  "weightKg": 82,
  "goalBodyFat": 14
}
```

The API returns body-fat estimate, BMI, lean mass, fat mass, goal delta, and estimated body measurements.

## Deploy

Push to `main`. GitHub Actions deploys the static site through GitHub Pages.
