# Habit Tracker (MERN)

A simple habit tracker with JWT auth, built with MongoDB, Express, React, and Node.

## Backend env (.env)

Copy `backend/.env.example` to `backend/.env` and set values:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/habit_tracker
JWT_SECRET=your_jwt_secret_here
```

Optionally set frontend env:

```
REACT_APP_API_URL=http://localhost:5000/api
```

## Run locally

Open two terminals.

Backend:

1. Install deps
2. Start dev server

# Habit Tracker

A simple habit-tracking application with user authentication, built with MongoDB, Express, React (Vite) and Node.

## Table of contents

- [Project structure](#project-structure)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Environment variables](#environment-variables)
- [Local development (quick start)](#local-development-quick-start)
	- [Backend](#backend)
	- [Frontend](#frontend)
- [Seeding an admin user](#seeding-an-admin-user)
- [API overview](#api-overview)
- [Data models](#data-models)
- [Deployment notes](#deployment-notes)
- [Contributing](#contributing)
- [License](#license)

## Project structure

Key files and folders:

- `backend/` — Express API, MongoDB connection, routes, models and controllers.
	- `server.js` — app entry.
	- `config/` — DB connection and seed script (`seedAdmin.js`).
	- `routes/`, `controllers/`, `models/`, `middleware/` — API organization.
- `frontend/` — React app scaffolded with Vite.
	- `src/` — components, pages and services.
	- `public/` — static assets.

## Features

- User signup and login (JWT).
- CRUD for habits (create, list, update, delete).
- Admin seeding script to create an initial admin account.

## Tech stack

- Backend: Node.js, Express, Mongoose (MongoDB), jsonwebtoken, bcryptjs.
- Frontend: React, Vite, MUI, Axios.

## Prerequisites

- Node.js (v16+ recommended) and npm installed.
- MongoDB running locally or a MongoDB connection string.

## Environment variables

Backend environment variables (create `backend/.env`):

- `PORT` — port for the backend (default: `5000`).
- `MONGO_URI` — MongoDB connection string (example: `mongodb://localhost:27017/habit_tracker`).
- `JWT_SECRET` — secret used to sign JWT tokens.

Optional variables used by the seeding script:

- `SEED_ADMIN_EMAIL` — email for seeded admin (default in code: `karnik@yahoo.com`).
- `SEED_ADMIN_PASSWORD` — password for seeded admin (default in code: `123456`).
- `SEED_ADMIN_NAME` — name for seeded admin (default: `Admin`).

Frontend environment variables (Vite):

- `VITE_API_URL` — base API URL used by the frontend (example: `http://localhost:5000/api`).

Note: The frontend fallback default in the code is `http://localhost:5001/api`. For local dev set `VITE_API_URL=http://localhost:5000/api` to match the backend default.

## Local development — quick start

Open two terminals (one for backend, one for frontend).

### Backend

1. Install dependencies and start dev server (uses `nodemon` if available):

```powershell
cd backend
npm install
npm run dev
```

2. Or run the production start script:

```powershell
npm start
```

The backend exposes the API under `/api`, and the health check is at `/`.

### Frontend

1. Install dependencies and start the Vite dev server:

```powershell
cd frontend
npm install
npm run dev
```

2. Open the URL shown by Vite (usually `http://localhost:5173`) in your browser.

If the frontend cannot reach the backend, set `VITE_API_URL` in `frontend/.env` (or in your shell) to `http://localhost:5000/api`.

## Seeding an admin user

There is a small script at `backend/config/seedAdmin.js` that will create an admin user using the environment variables above or sensible defaults. Run directly:

```powershell
cd backend
node config/seedAdmin.js
```

Defaults used by the script (if you don't set env vars):

- Email: `karnik@yahoo.com`
- Password: `123456`
- Name: `Admin`

After seeding, you can log in via the frontend and the account will have `isAdmin: true`.

## API overview

Authentication:

- POST `/api/auth/signup` — create a new user. Body: `{ name, email, password }`.
- POST `/api/auth/login` — login. Body: `{ email, password }`. Response includes `{ token, user }`.

Habit endpoints (require auth header `Authorization: Bearer <token>`):

- GET `/api/habits` — list habits for the authenticated user.
- POST `/api/habits` — create a habit. Body example: `{ habitName, frequency }`.
- PUT `/api/habits/:id` — update a habit.
- DELETE `/api/habits/:id` — delete a habit.

Admin endpoints are mounted under `/api/admin` (see `routes/adminRoutes.js`) and require admin middleware.

## Data models (summary)

- `User` (`backend/models/User.js`):
	- `name` (String, required)
	- `email` (String, unique, required)
	- `password` (String, required)
	- `isAdmin` (Boolean, default: false)

- `Habit` (`backend/models/Habit.js`):
	- `habitName` (String, required)
	- `frequency` (String, enum: `daily|weekly|monthly|custom`)
	- `progress` (Number, 0-100)
	- `userId` (ObjectId, ref `User`)

## Deployment notes

- Frontend is Vite-based and can be deployed to Vercel or any static host. There is a `vercel.json` file in `frontend/`.
- Backend can be hosted on platforms that support Node.js (Heroku, Render, DigitalOcean App Platform, etc.). Provide `MONGO_URI` and `JWT_SECRET` as environment variables.

When deploying frontend, set `VITE_API_URL` to the production API endpoint.

## Contributing

1. Fork the repository and create a feature branch.
2. Run the project locally and add tests when possible.
3. Open a pull request describing the change.

## License

This project does not include a license file. Add a `LICENSE` file to clarify terms if you plan to open-source it.

---