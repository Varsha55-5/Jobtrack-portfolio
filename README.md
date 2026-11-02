# JobTrack: Job Application Tracker

A full-stack web app for tracking job applications through four stages: Applied, Interview, Offer and Rejected. Each user has a private account and sees only their own data.

## Features
- Register and log in (passwords hashed with bcrypt, session-based login)
- Add, edit and delete applications
- Search by company or role, filter by status, paginated list
- Dashboard counts for each status
- Every record is tied to a user (`user_id`), so users cannot see each other's data

## Tech stack
- **Frontend:** React.js (Vite), plain CSS
- **Backend:** Node.js, Express.js, REST APIs
- **Database:** MySQL
- **Auth:** bcrypt + express-session
- **Tools:** Postman, Git, GitHub

## API endpoints
| Method | Endpoint | What it does |
|---|---|---|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in |
| POST | `/api/auth/logout` | Log out |
| GET | `/api/auth/me` | Get the logged-in user |
| GET | `/api/applications` | List applications (`search`, `status`, `page`, `limit`) |
| GET | `/api/applications/stats` | Count per status |
| POST | `/api/applications` | Add an application |
| PUT | `/api/applications/:id` | Edit an application |
| DELETE | `/api/applications/:id` | Delete an application |

## Run it locally

You need Node.js 18+ and MySQL installed.

**1. Create the database**
```bash
mysql -u root -p < database/schema.sql
```

**2. Start the backend**
```bash
cd server
cp .env.example .env      # then open .env and set your MySQL password
npm install
npm run dev
```
The API runs at http://localhost:5000.

**3. Start the frontend** (in a second terminal)
```bash
cd client
cp .env.example .env
npm install
npm run dev
```
Open http://localhost:5173.

## Test with Postman
Register or log in first. Postman keeps the session cookie automatically, so you can then call the `/api/applications` endpoints.

## Deployment notes
- Deploy the frontend on Vercel or Netlify (set `VITE_API_URL` to your backend URL ending in `/api`).
- Deploy the backend on Render and use a hosted MySQL database. Set `NODE_ENV=production` and `CLIENT_URL` to your frontend URL.
- The default session store keeps sessions in memory, which is fine for a demo.

## What I learned
- Designing a relational schema with a foreign key and `ON DELETE CASCADE`
- Hashing passwords and keeping users logged in with sessions
- Writing parameterized SQL queries to prevent SQL injection
- Building search, filtering and pagination with `LIKE`, `LIMIT` and `OFFSET`
- Connecting a React frontend to an Express API with cookies and CORS

## Ideas to extend
- Add a `follow_up_date` field and sort by it
- Add a salary or job link field
- Write tests for the API routes
