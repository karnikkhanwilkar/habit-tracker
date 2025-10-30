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

```
cd backend
npm install
npm run dev
```

Frontend:

1. Install deps
2. Start dev server

```
cd frontend
npm install
npm start
```

Visit http://localhost:3000

## API

- POST /api/auth/signup
- POST /api/auth/login
- GET /api/habits (auth)
- POST /api/habits (auth)
- PUT /api/habits/:id (auth)
- DELETE /api/habits/:id (auth)


## Admin Login

Initial admin credentials (seeded by backend/config/seedAdmin.js):

- **Email:** admin@habit.com
- **Password:** Admin@123

Log in with these credentials, then visit `/admin` to access the admin panel.

## Notes

- JWT stored in localStorage.
- Requests send `Authorization: Bearer <token>` header.
- Input validation via express-validator.
