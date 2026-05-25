<div align="center">

# TeamFlow

**AI-powered team task management — built for teams that move fast.**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Gemini AI](https://img.shields.io/badge/Gemini-1.5_Flash-4285F4?style=flat-square&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Railway](https://img.shields.io/badge/Deployed_on-Railway-0B0D0E?style=flat-square&logo=railway&logoColor=white)](https://railway.app)

</div>

---

## What is TeamFlow?

TeamFlow is a full-stack project management application that combines a drag-and-drop Kanban board, real-time dashboards, and AI-generated project health summaries into one cohesive workspace. It's built for small-to-mid-size teams who need more than a basic to-do list — but without the bloat of enterprise tooling.

At its core, TeamFlow gives every team member a clear picture of what's happening: what's overdue, who's blocked, and whether the project is on track — all without a weekly status meeting.

---

## Core Features

### Kanban Board with Drag & Drop
Tasks live in four columns — **Todo**, **In Progress**, **Review**, and **Done**. Moving a card updates its status instantly, logs the change in the activity trail, and reflects across the dashboard. Built on `@dnd-kit` for smooth, accessible interaction.

### AI Project Health Summaries
Powered by **Google Gemini 1.5 Flash**, the AI panel reads your project's current state — completion rate, overdue count, team activity — and writes a plain-English summary. No configuration needed: hit the button, get the insight.

### Dashboard & Analytics
Every project gets a live dashboard with:
- **4-stat cards** — Total Tasks, Completed, In Progress, Overdue
- **Donut chart** — visual status distribution via Recharts
- **Activity feed** — timestamped log of everything that changed
- **Overdue alerts** — surfaced automatically via a background cron job

### Role-Based Access Control
Two roles, cleanly enforced at the middleware level:
- **Admin** — full control: create/delete tasks, manage members, change roles
- **Member** — view and update tasks within assigned projects

### Complete Audit Trail
Every status change, assignment update, and priority shift is written to `task_history`. Every project-level action (member added, task created, etc.) goes to `activity_logs`. Nothing is lost.

### Automated Overdue Detection
A cron job runs hourly on the server, queries all tasks past their due date, and flags them automatically — no manual intervention required.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Zustand |
| Routing | React Router v6 |
| Drag & Drop | @dnd-kit |
| Charts | Recharts |
| HTTP Client | Axios (with JWT interceptor) |
| Icons | Lucide React |
| Notifications | React Hot Toast |
| Backend | Node.js (ESM), Express 4 |
| Database | PostgreSQL 15 (`pg` driver) |
| Auth | JWT + bcrypt |
| Validation | Zod |
| Scheduling | node-cron |
| Security | Helmet, CORS, express-rate-limit |
| AI | Google Generative AI SDK (Gemini 1.5 Flash) |
| Deployment | Railway (PostgreSQL + Node.js) |

---

## Project Structure

```
TeamFlow/
├── client/                  # React frontend
│   └── src/
│       ├── pages/           # Login, Dashboard, ProjectBoard, etc.
│       ├── components/      # Feature-organized UI components
│       │   ├── kanban/      # Board, columns, cards
│       │   ├── dashboard/   # Stats, charts, activity feed
│       │   ├── tasks/       # Task forms, history panel
│       │   ├── projects/    # Member management, project list
│       │   ├── ai/          # AI summary panel
│       │   └── shared/      # Navbar, modals, layout
│       ├── store/           # Zustand stores (auth, projects, tasks)
│       └── lib/             # Axios instance, utilities
│
└── server/                  # Express backend
    └── src/
        ├── routes/          # Auth, projects, tasks, dashboard, AI
        ├── controllers/     # Business logic per route
        ├── middleware/      # Auth, RBAC, validation, rate limiting
        ├── models/          # DB queries + activity logging
        ├── migrations/      # SQL schema initialization
        ├── jobs/            # Overdue task cron job
        └── db.js            # PostgreSQL connection pool
```

---

## Database Schema

Six tables, cleanly relational:

```
users
  └── project_members ──> projects
                              └── tasks
                                    ├── task_history
                                    └── activity_logs
```

- UUID primary keys on all tables
- Cascade deletes to keep data consistent
- Indexes on `project_id`, `due_date`, and `overdue` status for fast queries
- JSONB on `activity_logs` for flexible metadata

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- A Google Gemini API key

### 1. Clone and install

```bash
git clone https://github.com/your-username/teamflow.git
cd teamflow

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Configure environment

Create `server/.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/teamflow
JWT_SECRET=your_jwt_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
CLIENT_URL=http://localhost:5173
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

### 3. Run migrations

```bash
cd server
npm run migrate
```

### 4. Start development servers

```bash
# In one terminal
cd server && npm run dev

# In another terminal
cd client && npm run dev
```

The app will be available at `http://localhost:5173`.

---

## API Overview

All routes are versioned under `/api/v1/`.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/signup` | Register a new user |
| `POST` | `/auth/login` | Authenticate and receive JWT |
| `GET` | `/projects` | List projects for current user |
| `POST` | `/projects` | Create a new project |
| `GET` | `/projects/:id/tasks` | Get all tasks for a project |
| `POST` | `/tasks` | Create a task |
| `PATCH` | `/tasks/:id` | Update task (status, assignee, etc.) |
| `GET` | `/dashboard/:projectId` | Get dashboard stats and activity |
| `POST` | `/ai/summary/:projectId` | Generate AI project summary |
| `GET` | `/health` | Server health check |

---

## Deployment

TeamFlow is deployed on **Railway** with:
- A managed PostgreSQL instance (auto-linked via `DATABASE_URL`)
- Node.js server with environment variables set in the Railway dashboard
- Migrations run automatically on server start
- Frontend deployed as a static site

---

## Security

- Passwords hashed with bcrypt (salt rounds: 10)
- JWT tokens validated on every protected request
- Role checks enforced in middleware before any controller runs
- Auth routes rate-limited to prevent brute-force attacks
- Helmet sets secure HTTP headers on all responses
- CORS restricted to the configured `CLIENT_URL`
- All user input validated with Zod schemas before hitting the database

---

<div align="center">

Built by [Rishu](https://github.com/rishu-sriv) · Powered by Gemini AI · Deployed on Railway

</div>
