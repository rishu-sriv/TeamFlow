# TeamFlow — Implementation Plan
> AI-powered Team Task Manager | React + Node/Express + PostgreSQL + Gemini AI

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Database Schema](#4-database-schema)
5. [Backend Implementation](#5-backend-implementation)
6. [Frontend Implementation](#6-frontend-implementation)
7. [AI Integration](#7-ai-integration)
8. [Deployment (Railway)](#8-deployment-railway)
9. [Claude Code Prompts](#9-claude-code-prompts--copy-paste-ready)
10. [README Template](#10-readme-template)
11. [Demo Video Script](#11-demo-video-script)
12. [Time Budget](#12-time-budget)
13. [Differentiators Checklist](#13-differentiators-checklist)

---

## 1. Project Overview

**TeamFlow** is a full-stack team task manager with role-based access control, a Kanban board, real-time activity logging, and an AI-powered project health summary powered by Gemini.

### What makes it stand out from 100 other submissions
| Feature | Most Submissions | TeamFlow |
|---|---|---|
| UI | Plain table/list | Drag-and-drop Kanban board |
| Dashboard | Basic counts | Charts (Recharts) + overdue alerts |
| Task fields | Title + status | + Priority, due date, change history |
| Activity | None | Full timestamped audit log |
| AI | None | Gemini project health summary |
| Auth security | Basic JWT | + Rate limiting on auth routes |
| API design | Flat routes | Versioned `/api/v1/` + proper error codes |
| DB | Raw SQL | Tracked migrations |
| README | Setup steps | Architecture diagram + API docs table |
| Demo | Screen record | Narrated story walkthrough |

---

## 2. Tech Stack

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Database**: PostgreSQL 15
- **Auth**: JWT (`jsonwebtoken`) + `bcrypt`
- **Security**: `express-rate-limit`, `helmet`, `cors`
- **Scheduling**: `node-cron` (overdue detection)
- **AI**: `@google/generative-ai` (Gemini 1.5 Flash)
- **DB Client**: `pg` (node-postgres)
- **Migrations**: `node-pg-migrate`
- **Validation**: `zod`

### Frontend
- **Framework**: React 18 + Vite
- **State**: Zustand
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Drag & Drop**: `@dnd-kit/core` + `@dnd-kit/sortable`
- **Charts**: Recharts
- **HTTP**: Axios
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

### DevOps
- **Deployment**: Railway
- **Version Control**: GitHub
- **Environment**: `.env` files (never committed)

---

## 3. Project Structure

```
teamflow/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   └── SignupForm.jsx
│   │   │   ├── dashboard/
│   │   │   │   ├── StatsCard.jsx
│   │   │   │   ├── StatusChart.jsx        ← Recharts donut
│   │   │   │   └── OverdueAlert.jsx
│   │   │   ├── kanban/
│   │   │   │   ├── KanbanBoard.jsx        ← @dnd-kit drag & drop
│   │   │   │   ├── KanbanColumn.jsx
│   │   │   │   └── TaskCard.jsx
│   │   │   ├── tasks/
│   │   │   │   ├── TaskModal.jsx
│   │   │   │   └── TaskHistory.jsx
│   │   │   ├── projects/
│   │   │   │   ├── ProjectCard.jsx
│   │   │   │   └── MemberPanel.jsx
│   │   │   ├── ai/
│   │   │   │   └── AISummaryPanel.jsx     ← Gemini integration
│   │   │   └── shared/
│   │   │       ├── Navbar.jsx
│   │   │       ├── Sidebar.jsx
│   │   │       ├── RoleBadge.jsx
│   │   │       ├── PriorityBadge.jsx
│   │   │       ├── SkeletonLoader.jsx
│   │   │       └── EmptyState.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Projects.jsx
│   │   │   ├── ProjectBoard.jsx           ← Main Kanban page
│   │   │   ├── ProjectMembers.jsx
│   │   │   └── ActivityLog.jsx
│   │   ├── store/
│   │   │   ├── authStore.js
│   │   │   ├── projectStore.js
│   │   │   └── taskStore.js
│   │   ├── lib/
│   │   │   ├── api.js                     ← Axios instance + interceptors
│   │   │   └── utils.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── projects.js
│   │   │   ├── tasks.js
│   │   │   ├── dashboard.js
│   │   │   └── ai.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── projectController.js
│   │   │   ├── taskController.js
│   │   │   ├── dashboardController.js
│   │   │   └── aiController.js
│   │   ├── middleware/
│   │   │   ├── authenticate.js            ← JWT verification
│   │   │   ├── authorize.js               ← Role-based access
│   │   │   ├── rateLimiter.js
│   │   │   └── validate.js                ← Zod schema validation
│   │   ├── models/
│   │   │   ├── userModel.js
│   │   │   ├── projectModel.js
│   │   │   ├── taskModel.js
│   │   │   └── activityModel.js
│   │   ├── migrations/
│   │   │   ├── 001_create_users.sql
│   │   │   ├── 002_create_projects.sql
│   │   │   ├── 003_create_project_members.sql
│   │   │   ├── 004_create_tasks.sql
│   │   │   ├── 005_create_activity_logs.sql
│   │   │   └── 006_create_task_history.sql
│   │   ├── jobs/
│   │   │   └── overdueDetection.js        ← node-cron hourly job
│   │   ├── db.js                          ← pg pool connection
│   │   └── index.js                       ← Express app entry
│   ├── .env.example
│   └── package.json
│
├── README.md
├── railway.toml
└── .gitignore
```

---

## 4. Database Schema

### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_color VARCHAR(7) DEFAULT '#6366f1',   -- for avatar initials
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### projects
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### project_members
```sql
CREATE TABLE project_members (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) CHECK (role IN ('admin', 'member')) DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (project_id, user_id)
);
```

### tasks
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) CHECK (status IN ('todo', 'in_progress', 'review', 'done')) DEFAULT 'todo',
  priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  due_date DATE,
  is_overdue BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### task_history
```sql
CREATE TABLE task_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  changed_by UUID REFERENCES users(id),
  field VARCHAR(50) NOT NULL,          -- 'status', 'assignee', 'priority', etc.
  old_value TEXT,
  new_value TEXT,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);
```

### activity_logs
```sql
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,        -- 'task_created', 'member_added', etc.
  entity_type VARCHAR(50),             -- 'task', 'project', 'member'
  entity_id UUID,
  metadata JSONB DEFAULT '{}',         -- extra context as JSON
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_project ON activity_logs(project_id, created_at DESC);
CREATE INDEX idx_tasks_overdue ON tasks(due_date, is_overdue) WHERE is_overdue = FALSE;
```

---

## 5. Backend Implementation

### 5.1 Server Entry (`server/src/index.js`)

```javascript
// Key middleware setup order:
// helmet → cors → express.json → rateLimiter → routes → errorHandler

app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL }))
app.use(express.json())

app.use('/api/v1/auth', authRateLimiter, authRoutes)
app.use('/api/v1/projects', authenticate, projectRoutes)
app.use('/api/v1/tasks', authenticate, taskRoutes)
app.use('/api/v1/dashboard', authenticate, dashboardRoutes)
app.use('/api/v1/ai', authenticate, aiRoutes)
```

### 5.2 All API Endpoints

#### Auth Routes — `/api/v1/auth`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/signup` | Public | Register new user |
| POST | `/login` | Public | Login, returns JWT |
| GET | `/me` | Auth | Get current user profile |

#### Project Routes — `/api/v1/projects`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Auth | List all user's projects |
| POST | `/` | Auth | Create new project (creator = admin) |
| GET | `/:id` | Member+ | Get project detail + members |
| PUT | `/:id` | Admin | Update project name/description |
| DELETE | `/:id` | Admin | Delete project |
| POST | `/:id/members` | Admin | Add member by email |
| DELETE | `/:id/members/:userId` | Admin | Remove member |
| PUT | `/:id/members/:userId/role` | Admin | Change member role |

#### Task Routes — `/api/v1/tasks`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/project/:projectId` | Member+ | Get all tasks (filter: status, priority, assignee) |
| POST | `/project/:projectId` | Admin | Create task |
| GET | `/:id` | Member+ | Get single task detail |
| PUT | `/:id` | Member+ | Update task (status by member, all fields by admin) |
| DELETE | `/:id` | Admin | Delete task |
| GET | `/:id/history` | Member+ | Get task change history |
| PATCH | `/:id/status` | Member+ | Quick status update (for Kanban drag) |

#### Dashboard Routes — `/api/v1/dashboard`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Auth | Stats: total tasks, by status, overdue count, recent activity |
| GET | `/overdue` | Auth | All overdue tasks across projects |

#### AI Routes — `/api/v1/ai`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/projects/:id/summarize` | Member+ | Gemini project health summary |

### 5.3 Middleware

**authenticate.js** — Verifies JWT, attaches `req.user`
```javascript
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No token provided' })
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}
```

**authorize.js** — Checks project role
```javascript
// Usage: router.delete('/:id', authenticate, authorize('admin'), deleteProject)
const authorize = (requiredRole) => async (req, res, next) => {
  const member = await getProjectMember(req.params.id, req.user.id)
  if (!member || (requiredRole === 'admin' && member.role !== 'admin')) {
    return res.status(403).json({ error: 'Insufficient permissions' })
  }
  req.projectRole = member.role
  next()
}
```

**rateLimiter.js**
```javascript
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 10,                      // 10 attempts
  message: { error: 'Too many attempts. Try again in 15 minutes.' }
})
```

### 5.4 Activity Logging Pattern

Call this helper inside every controller mutation:
```javascript
// activityModel.js
export const logActivity = async (projectId, userId, action, entityType, entityId, metadata = {}) => {
  await db.query(
    `INSERT INTO activity_logs (project_id, user_id, action, entity_type, entity_id, metadata)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [projectId, userId, action, entityType, entityId, JSON.stringify(metadata)]
  )
}

// Example usage in taskController.js
await logActivity(projectId, req.user.id, 'task_created', 'task', task.id, { title: task.title })
await logActivity(projectId, req.user.id, 'task_status_changed', 'task', task.id, {
  from: oldStatus, to: newStatus, taskTitle: task.title
})
```

### 5.5 Overdue Detection Cron Job

```javascript
// jobs/overdueDetection.js
import cron from 'node-cron'
import db from '../db.js'

// Runs every hour
cron.schedule('0 * * * *', async () => {
  await db.query(`
    UPDATE tasks
    SET is_overdue = TRUE
    WHERE due_date < CURRENT_DATE
      AND status != 'done'
      AND is_overdue = FALSE
  `)
  console.log('[CRON] Overdue detection ran at', new Date().toISOString())
})
```

### 5.6 Error Response Standard

All errors follow this format:
```json
{
  "error": "Human readable message",
  "code": "TASK_NOT_FOUND",
  "details": {}
}
```

Status codes used:
- `400` — Validation error
- `401` — Not authenticated
- `403` — Not authorized (role)
- `404` — Resource not found
- `409` — Conflict (duplicate email)
- `429` — Rate limited
- `500` — Internal server error

---

## 6. Frontend Implementation

### 6.1 Zustand Stores

**authStore.js**
```javascript
// Persisted to localStorage
// State: user, token, isAuthenticated
// Actions: login(), logout(), setUser()
```

**projectStore.js**
```javascript
// State: projects[], currentProject, members[]
// Actions: fetchProjects(), createProject(), addMember()
```

**taskStore.js**
```javascript
// State: tasks{} (keyed by projectId), filters
// Actions: fetchTasks(), createTask(), updateTaskStatus(), moveTask()
```

### 6.2 Page Breakdown

#### `/dashboard`
- 4 stats cards: Total Tasks, Completed, In Progress, Overdue (highlighted red)
- Recharts `PieChart` showing task status distribution
- Recent activity feed (last 10 entries across all projects)
- Quick links to each project

#### `/projects`
- Grid of ProjectCards
- Each card shows: name, member count, task completion bar, admin badge
- "New Project" button (admin only) → modal form
- Empty state with illustration if no projects

#### `/projects/:id` (Main Kanban Board)
- 4 draggable columns: **To Do** | **In Progress** | **Review** | **Done**
- `@dnd-kit` for smooth drag-and-drop between columns
- Each TaskCard shows:
  - Title
  - Priority badge (color-coded: Low=gray, Medium=blue, High=orange, Critical=red)
  - Assignee avatar (initials + color)
  - Due date (red if overdue)
  - Click → opens TaskModal
- "AI Summary" button in top-right → opens AISummaryPanel
- Filters bar: status, priority, assignee dropdown

#### TaskModal (create/edit)
- Fields: title, description, assignee (dropdown of members), priority, due date
- History tab: timeline of all field changes

#### `/projects/:id/members`
- Table of all members with their role badge
- "Add Member" by email input (admin only)
- Role toggle (admin only)
- Remove member button (admin only)

#### `/projects/:id/activity`
- Full timeline of all project activity
- Grouped by date
- Icons per action type (task created, status changed, member added, etc.)

### 6.3 Key UI Details

**Priority Badges**
```
🔴 Critical  — red background
🟠 High      — orange background
🔵 Medium    — blue background
⚪ Low       — gray background
```

**Overdue Task Cards** — red left border + red due date text

**Skeleton Loaders** — show while fetching, prevent layout shift

**Empty States** — illustrated empty state per page (no projects, no tasks, etc.)

**Dark Mode** — Tailwind `dark:` classes, toggle in Navbar, persisted to localStorage

**Toast Notifications** — `react-hot-toast` for success/error feedback on every action

### 6.4 Axios API Client (`lib/api.js`)

```javascript
// Base instance with auth interceptor
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL + '/api/v1' })

// Auto-attach JWT
api.interceptors.request.use(config => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-logout on 401
api.interceptors.response.use(null, error => {
  if (error.response?.status === 401) useAuthStore.getState().logout()
  return Promise.reject(error)
})
```

---

## 7. AI Integration

### Gemini Project Health Summary

**Endpoint**: `POST /api/v1/ai/projects/:id/summarize`

**What the server sends to Gemini:**
```javascript
const prompt = `
You are a project management assistant. Analyze this project data and give a concise 3-4 sentence health summary.

Project: ${project.name}
Total Tasks: ${stats.total}
Completion Rate: ${stats.completionRate}%
Overdue Tasks: ${stats.overdue}
Task Breakdown: ${JSON.stringify(stats.byStatus)}
Priority Breakdown: ${JSON.stringify(stats.byPriority)}
Team Members: ${stats.memberCount}
Top Workload: ${stats.topAssignee} (${stats.topAssigneeTaskCount} tasks)

Be direct. Highlight risks. Suggest one action. Keep it under 80 words.
`
```

**Frontend (`AISummaryPanel.jsx`)**
```jsx
// Shows a panel with:
// - "✨ Summarize with AI" button
// - Loading spinner while fetching
// - Rendered summary text in a card
// - "Regenerate" option
// - Small "Powered by Gemini" attribution
```

---

## 8. Deployment (Railway)

### Step 1 — Create Railway Account
Go to [railway.app](https://railway.app) → Sign up with GitHub

### Step 2 — New Project on Railway
- Click "New Project"
- Select "Deploy from GitHub repo" → select your `teamflow` repo

### Step 3 — Add PostgreSQL
- In your Railway project → "New Service" → "Database" → "PostgreSQL"
- Copy the `DATABASE_URL` from the Variables tab

### Step 4 — Configure Backend Service
In Railway backend service → Variables tab, add:
```
DATABASE_URL=<from postgresql service>
JWT_SECRET=<generate a random 64-char string>
GEMINI_API_KEY=<your gemini api key>
CLIENT_URL=<your frontend railway URL>
NODE_ENV=production
PORT=8080
```

### Step 5 — Configure Frontend Service
In Railway frontend service → Variables tab, add:
```
VITE_API_URL=<your backend railway URL>
```

### Step 6 — railway.toml
```toml
[build]
builder = "nixpacks"

[[services]]
name = "server"
source = "server"
[services.deploy]
startCommand = "npm run migrate && npm start"

[[services]]
name = "client"
source = "client"
[services.build]
buildCommand = "npm run build"
[services.deploy]
startCommand = "npx serve -s dist -p $PORT"
```

### Step 7 — Custom Domain
In Railway → Settings → Domains → Generate domain
Format it as: `teamflow-app.up.railway.app`

### Step 8 — Demo Credentials
Add these via a seed script so evaluators can log in immediately:
```
Admin:  admin@teamflow.com / Admin@123
Member: member@teamflow.com / Member@123
```

---

## 9. Claude Code Prompts — Copy-Paste Ready

Run these **in order** inside your `teamflow/` repo directory.

---

### Prompt 1 — Backend Foundation
```
Create a Node.js Express backend in a folder called `server/`.

Setup:
- Use ES modules (type: module in package.json)
- PostgreSQL connection using `pg` pool in src/db.js
- Install: express, pg, bcrypt, jsonwebtoken, cors, helmet, express-rate-limit, node-cron, @google/generative-ai, zod, dotenv, node-pg-migrate
- Read DATABASE_URL, JWT_SECRET, PORT from .env

Create SQL migrations in server/src/migrations/:
001_create_users.sql — id (UUID), name, email, password_hash, avatar_color, created_at
002_create_projects.sql — id, name, description, owner_id → users, created_at, updated_at
003_create_project_members.sql — project_id, user_id, role (admin/member), joined_at; composite PK
004_create_tasks.sql — id, title, description, project_id, assignee_id, created_by, status (todo/in_progress/review/done), priority (low/medium/high/critical), due_date, is_overdue, created_at, updated_at
005_create_task_history.sql — id, task_id, changed_by, field, old_value, new_value, changed_at
006_create_activity_logs.sql — id, project_id, user_id, action, entity_type, entity_id, metadata (JSONB), created_at; index on (project_id, created_at DESC)

Create src/index.js:
- helmet, cors, express.json middleware
- Rate limit /api/v1/auth routes (10 req / 15 min)
- Mount routes under /api/v1/
- Global error handler middleware

Create src/routes/auth.js and src/controllers/authController.js:
- POST /signup — validate email+password with zod, hash password with bcrypt (rounds=12), insert user, return JWT
- POST /login — verify credentials, return JWT (expires 7d)
- GET /me — protected, return user without password

Create src/middleware/authenticate.js — verify JWT Bearer token, attach req.user
Create src/middleware/rateLimiter.js — export authRateLimiter using express-rate-limit

Create .env.example with: DATABASE_URL, JWT_SECRET, GEMINI_API_KEY, CLIENT_URL, PORT, NODE_ENV

Create a package.json script "migrate" that runs all SQL migration files in order using pg.
```

---

### Prompt 2 — Projects & Tasks APIs
```
Add the following to the existing Express server in server/src/:

1. src/middleware/authorize.js
- async middleware factory: authorize(requiredRole)
- Queries project_members table to check if req.user.id is in the project
- Returns 403 if not a member, or if requiredRole='admin' and user role is 'member'
- Attaches req.projectRole to the request

2. src/models/activityModel.js
- Export logActivity(projectId, userId, action, entityType, entityId, metadata={})
- Inserts into activity_logs table

3. src/routes/projects.js + src/controllers/projectController.js
- GET / — list all projects where user is a member, include task count and member count
- POST / — create project, auto-add creator as admin in project_members, log 'project_created'
- GET /:id — get project + all members with their roles
- PUT /:id — admin only, update name/description, log 'project_updated'
- DELETE /:id — admin only, cascades via DB
- POST /:id/members — admin only, find user by email, add to project_members as 'member', log 'member_added'
- DELETE /:id/members/:userId — admin only, log 'member_removed'
- PUT /:id/members/:userId/role — admin only, update role, log 'member_role_changed'

4. src/routes/tasks.js + src/controllers/taskController.js
- GET /project/:projectId — return tasks with optional query filters: status, priority, assignee_id. Include assignee name+avatar_color
- POST /project/:projectId — admin only, create task, log 'task_created', record in task_history
- GET /:id — single task with assignee info
- PUT /:id — admin can update all fields; member can only update status. Log changes. For every changed field, insert into task_history (field, old_value, new_value, changed_by). Log 'task_updated' in activity_logs
- DELETE /:id — admin only, log 'task_deleted'
- GET /:id/history — return task_history ordered by changed_at DESC
- PATCH /:id/status — update status only (used by Kanban drag), available to all members, log activity

5. src/routes/dashboard.js + src/controllers/dashboardController.js
- GET / — return:
  - total tasks across user's projects
  - count by status (todo, in_progress, review, done)
  - overdue count
  - tasks due in next 7 days count
  - last 10 activity_log entries across user's projects (include user name, action, metadata)
- GET /overdue — all overdue tasks across user's projects with project name + assignee name

6. src/jobs/overdueDetection.js
- Use node-cron, run every hour ('0 * * * *')
- UPDATE tasks SET is_overdue=TRUE WHERE due_date < CURRENT_DATE AND status != 'done' AND is_overdue = FALSE

Mount all new routes in index.js. Import and start the cron job in index.js.
```

---

### Prompt 3 — Gemini AI Endpoint
```
Add the Gemini AI summarization endpoint to the Express server.

Create src/routes/ai.js + src/controllers/aiController.js:

POST /projects/:id/summarize
- Authenticate user, verify they are a member of the project
- Query the database to gather:
  - Project name and description
  - Total task count
  - Count by status (todo, in_progress, review, done)
  - Count by priority (low, medium, high, critical)
  - Overdue task count
  - Member count
  - Assignee with the most tasks (name + count)
  - Completion rate percentage

- Call Gemini API (model: gemini-1.5-flash) using @google/generative-ai:
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

- Send this prompt:
  "You are a project management assistant. Analyze this project data and write a concise 3-4 sentence health summary for the team lead.
  
  Project: {name}
  Total Tasks: {total} | Completion Rate: {rate}%
  Status: Todo={todo}, In Progress={in_progress}, Review={review}, Done={done}
  Overdue: {overdue} | Priority Critical: {critical} | High: {high}
  Team Size: {members} | Highest Workload: {person} ({count} tasks)
  
  Be direct. Flag risks. Suggest one concrete action. Max 80 words."

- Return: { summary: string, generatedAt: timestamp, stats: { total, completionRate, overdue } }
- Handle API errors gracefully (return 503 if Gemini is unavailable)

Mount the route: app.use('/api/v1/ai', authenticate, aiRoutes)
```

---

### Prompt 4 — React Frontend Foundation
```
Create a React frontend using Vite in a folder called `client/`.

Install: react-router-dom, zustand, axios, tailwindcss, @tailwindcss/forms, lucide-react, react-hot-toast, recharts

Setup Tailwind with dark mode class strategy.

Create src/lib/api.js:
- Axios instance with baseURL from import.meta.env.VITE_API_URL + '/api/v1'
- Request interceptor: attach Bearer token from Zustand authStore
- Response interceptor: on 401, call logout() and redirect to /login

Create src/store/authStore.js (Zustand):
- State: user (object), token (string), isAuthenticated (bool)
- Persist token+user to localStorage
- Actions: login(user, token), logout(), setUser(user)

Create src/store/projectStore.js (Zustand):
- State: projects[], currentProject, members[]
- Actions: setProjects, setCurrentProject, setMembers, addProject, removeProject

Create src/store/taskStore.js (Zustand):
- State: tasks{} (object keyed by projectId), filters{ status, priority, assigneeId }
- Actions: setTasks(projectId, tasks), updateTask(taskId, updates), moveTask(taskId, newStatus), setFilters

Create src/App.jsx with React Router v6:
- Public routes: /login, /signup
- Protected routes (redirect to /login if not authenticated): /dashboard, /projects, /projects/:id, /projects/:id/members, /projects/:id/activity
- Use a ProtectedRoute wrapper component

Create src/components/shared/Navbar.jsx:
- Logo "TeamFlow" on left
- Dark mode toggle button (sun/moon icon from lucide-react)
- User avatar (initials) + name on right
- Logout button

Create src/components/shared/Sidebar.jsx for the protected layout:
- Links to: Dashboard, My Projects
- Active link highlighting

Create src/pages/Login.jsx and src/pages/Signup.jsx:
- Clean centered card design
- Form validation (show inline errors)
- Call auth API, store token, redirect to /dashboard on success
- Link between login and signup pages
```

---

### Prompt 5 — Dashboard & Projects Pages
```
Build the Dashboard and Projects pages for the TeamFlow React app.

src/pages/Dashboard.jsx:
- Fetch GET /api/v1/dashboard on mount
- Show 4 StatsCards in a grid:
  * Total Tasks (blue, ListTodo icon)
  * Completed (green, CheckCircle icon)
  * In Progress (yellow, Clock icon)
  * Overdue (red, AlertTriangle icon) — pulse animation if count > 0
- Show a Recharts PieChart (donut) with task status distribution using these colors:
  * todo: #94a3b8, in_progress: #3b82f6, review: #f59e0b, done: #22c55e
- Show recent activity feed below the charts:
  * List of last 10 activity entries
  * Each entry: icon based on action type, user name, action description, relative time (e.g. "2 hours ago")
  * Group by date header (Today, Yesterday, date)
- Show skeleton loaders while fetching

src/pages/Projects.jsx:
- Fetch GET /api/v1/projects on mount
- Grid of ProjectCards (2 columns desktop, 1 mobile)
- ProjectCard shows: project name, description truncated, member count, task progress bar (done/total), admin badge if user is admin
- "New Project" button (top right) → modal with name + description fields
- EmptyState component if no projects: illustration + "Create your first project" CTA
- Clicking a card navigates to /projects/:id

Create src/components/shared/SkeletonLoader.jsx — animated gray pulse placeholder boxes
Create src/components/shared/EmptyState.jsx — centered SVG illustration + title + subtitle + optional CTA button
Create src/components/shared/PriorityBadge.jsx — colored pill based on priority string
Create src/components/shared/RoleBadge.jsx — "Admin" (purple) or "Member" (gray) pill badge
```

---

### Prompt 6 — Kanban Board (Main Feature)
```
Build the Kanban board page using @dnd-kit/core and @dnd-kit/sortable.

Install: @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

src/pages/ProjectBoard.jsx:
- Fetch project detail (GET /api/v1/projects/:id) and tasks (GET /api/v1/tasks/project/:id) on mount
- Show project name + description in header
- Filters bar: status dropdown, priority dropdown, assignee dropdown — filter tasks client-side
- "AI Summary" button (top right, purple, sparkles icon) → opens AISummaryPanel slide-in drawer
- "Add Task" button (admin only) → opens TaskModal

src/components/kanban/KanbanBoard.jsx:
- DndContext with onDragEnd handler
- 4 SortableContext columns: todo, in_progress, review, done
- On drag end: call PATCH /api/v1/tasks/:id/status optimistically (update UI first, revert on error)

src/components/kanban/KanbanColumn.jsx:
- Column header with label, count badge, and column accent color
- todo=slate, in_progress=blue, review=amber, done=green
- useDroppable from @dnd-kit
- Renders list of TaskCards
- Empty column shows dashed drop zone

src/components/kanban/TaskCard.jsx:
- useSortable from @dnd-kit/sortable
- Shows: title, PriorityBadge, assignee avatar circle (initials + avatar_color), due date
- If is_overdue=true: red left border (border-l-4 border-red-500) + red due date text
- Hover: subtle shadow lift
- Click → opens TaskModal in edit mode

src/components/tasks/TaskModal.jsx:
- Create or edit mode
- Fields: title (required), description (textarea), assignee (dropdown of project members), priority (select), due date (date input)
- Two tabs: "Details" and "History"
- History tab: fetch GET /api/v1/tasks/:id/history, show timeline of changes (who changed what, from→to, when)
- Submit calls POST (create) or PUT (edit) task API
- Admin sees all fields editable; Member sees only status editable in edit mode
- Delete button (admin only, bottom left, red)
```

---

### Prompt 7 — Members, Activity & AI Panel
```
Build the remaining pages and the AI summary panel.

src/pages/ProjectMembers.jsx:
- Fetch project members from GET /api/v1/projects/:id
- Table with columns: Name, Email, Role, Joined Date, Actions
- RoleBadge component for role display
- "Add Member" form (admin only): email input + "Invite" button → POST /api/v1/projects/:id/members
- Role toggle button (admin only): click to switch between admin/member → PUT /api/v1/projects/:id/members/:userId/role
- Remove button (admin only, red trash icon) → DELETE with confirm dialog
- Cannot remove yourself if you're the last admin

src/pages/ActivityLog.jsx:
- Fetch GET /api/v1/dashboard (or add GET /api/v1/projects/:id/activity endpoint)
- Full timeline sorted by date descending
- Group by date sections with dividers
- Each entry: colored icon by action type, "[User] [action] [entity]" formatted text, timestamp
- Action icons (lucide-react):
  * task_created → Plus
  * task_status_changed → ArrowRight
  * task_updated → Edit
  * task_deleted → Trash
  * member_added → UserPlus
  * member_removed → UserMinus
  * project_updated → Settings

src/components/ai/AISummaryPanel.jsx:
- Slide-in drawer from the right (translate-x animation)
- Header: "✨ AI Project Summary" with close button
- "Generate Summary" button → POST /api/v1/ai/projects/:id/summarize
- Loading state: animated sparkle spinner + "Analyzing project health..."
- Result card: summary text in a styled blockquote, stats chips (completion %, overdue count), timestamp
- "Regenerate" button to re-fetch
- "Powered by Gemini" small attribution at bottom
- Error state: "Unable to generate summary. Try again."

Add Toasts (react-hot-toast) for all API success and error actions throughout the app.
Add a ThemeToggle component to Navbar that toggles dark mode class on document.documentElement and persists to localStorage.
```

---

### Prompt 8 — Polish & Production Ready
```
Add final polish and production configuration to the TeamFlow app.

Backend:
1. Add a seed script (server/src/seed.js) that creates:
   - Admin user: admin@teamflow.com / Admin@123, name "Alex Admin"
   - Member user: member@teamflow.com / Member@123, name "Sam Member"
   - One sample project "Product Launch Q1" with both users
   - 8 sample tasks across all statuses and priorities, some with past due dates (to show overdue)
   Add "seed" to package.json scripts

2. Add GET /api/v1/health endpoint returning { status: 'ok', timestamp, version: '1.0.0' }

3. Ensure all controllers have try/catch blocks with next(err) for centralized error handling

4. Add request logging middleware (simple console.log with method, path, status, duration)

Frontend:
5. Add a loading spinner overlay on the Login/Signup pages during API call

6. Add 404 Not Found page for unmatched routes

7. Add a "Back to Projects" breadcrumb on ProjectBoard, ProjectMembers, ActivityLog pages

8. Ensure all forms show field-level error messages from API responses

9. Add meta tags in index.html: title "TeamFlow — Team Task Manager", description, theme-color

10. Make the app fully responsive (mobile-friendly) using Tailwind responsive prefixes

Deployment config:
11. Create railway.toml in the root with separate service configs for server and client

12. Create a comprehensive .gitignore covering node_modules, .env, dist, build

13. Add start scripts:
    - server/package.json: "start": "node src/index.js", "migrate": "node src/runMigrations.js", "seed": "node src/seed.js"
    - client/package.json: "build": "vite build", "preview": "vite preview"

14. Create README.md (see README template in the implementation plan)
```

---

## 10. README Template

```markdown
# TeamFlow 🚀
> AI-powered team task manager with role-based access control

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://teamflow-app.up.railway.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repo-blue)](https://github.com/yourusername/teamflow)

## 🌐 Live Demo
**URL**: https://teamflow-app.up.railway.app

| Role   | Email                  | Password   |
|--------|------------------------|------------|
| Admin  | admin@teamflow.com     | Admin@123  |
| Member | member@teamflow.com    | Member@123 |

## ✨ Features
- **Authentication** — JWT-based signup/login with rate limiting
- **Role-Based Access** — Admins manage projects/tasks; members update status
- **Kanban Board** — Drag-and-drop task management across 4 status columns
- **Task Management** — Priority levels, due dates, assignees, change history
- **Dashboard** — Stats cards + Recharts status distribution chart
- **Overdue Detection** — Hourly cron job flags overdue tasks automatically
- **Activity Log** — Full audit trail of every project action
- **AI Summary** — Gemini-powered project health analysis in plain English
- **Dark Mode** — System-aware with manual toggle

## 🏗️ Architecture

```
[React Client] ←→ [Express API /api/v1] ←→ [PostgreSQL]
                         ↕
                   [Gemini AI API]
                   [node-cron Jobs]
```

## 🛠️ Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Zustand |
| Backend | Node.js, Express, JWT auth |
| Database | PostgreSQL with tracked migrations |
| AI | Google Gemini 1.5 Flash |
| Drag & Drop | @dnd-kit |
| Charts | Recharts |
| Deployment | Railway |

## 🚀 Local Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 15+

### Backend
```bash
cd server
cp .env.example .env
# Fill in DATABASE_URL, JWT_SECRET, GEMINI_API_KEY
npm install
npm run migrate
npm run seed      # creates demo users + sample data
npm start
```

### Frontend
```bash
cd client
cp .env.example .env
# Set VITE_API_URL=http://localhost:8080
npm install
npm run dev
```

## 📡 API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/v1/auth/signup | Public | Register |
| POST | /api/v1/auth/login | Public | Login |
| GET | /api/v1/projects | Member | List projects |
| POST | /api/v1/projects | Auth | Create project |
| POST | /api/v1/projects/:id/members | Admin | Add member |
| GET | /api/v1/tasks/project/:id | Member | List tasks |
| PATCH | /api/v1/tasks/:id/status | Member | Update status |
| POST | /api/v1/ai/projects/:id/summarize | Member | AI summary |
| GET | /api/v1/health | Public | Health check |

## 🚂 Deployment
Deployed on Railway with 3 services:
1. PostgreSQL database
2. Node/Express backend
3. React static frontend (served via `serve`)
```

---

## 11. Demo Video Script

**Length**: 3–4 minutes | **Tool**: Loom (free)

```
[0:00–0:20] — Hook
"Hi, I'm [Name]. This is TeamFlow — a full-stack team task manager
with AI-powered project insights. Let me show you how it works."

[0:20–0:50] — Auth & Roles
Show signup → login as Admin
"Admins can create projects and manage teams.
Members can update task progress."

[0:50–1:30] — Create Project & Add Member
Create "Product Launch" project
Add member@teamflow.com → show them appear in members list
"Role-based access is enforced at the API level —
members literally cannot see admin-only buttons."

[1:30–2:30] — Kanban Board (the star)
Create 3-4 tasks with different priorities and due dates
Drag tasks across columns — show smooth animation
Click a task → show task modal with history tab
"Every field change is tracked with who changed it and when."

[2:30–3:00] — Dashboard
Switch to dashboard
"The dashboard shows real-time stats and a chart.
That red card — 2 overdue tasks — is detected by a background cron job
that runs every hour."

[3:00–3:30] — AI Summary (the differentiator)
Click "AI Summary" on project board
Wait for Gemini response → read it out
"This calls Google Gemini with project health data and returns
a natural language summary — flags risks, suggests next actions."

[3:30–3:50] — Activity Log
Show the activity log timeline
"Every action is logged — task created, member added, status changed."

[3:50–4:00] — Close
"Full source on GitHub. Live on Railway. Thanks."
```

---

## 12. Time Budget

| Phase | Tasks | Time |
|---|---|---|
| **Phase 1** | Prompt 1: Backend foundation + DB + Auth | 1.5 hrs |
| **Phase 2** | Prompt 2: Projects + Tasks + Dashboard APIs | 2 hrs |
| **Phase 3** | Prompt 3: Gemini AI endpoint | 0.5 hrs |
| **Phase 4** | Prompt 4: React foundation + Auth pages | 1.5 hrs |
| **Phase 5** | Prompt 5: Dashboard + Projects pages | 1.5 hrs |
| **Phase 6** | Prompt 6: Kanban board (main feature) | 2 hrs |
| **Phase 7** | Prompt 7: Members + Activity + AI panel | 1.5 hrs |
| **Phase 8** | Prompt 8: Polish + deploy config | 1 hr |
| **Deploy** | Railway setup + env vars + test live URL | 1 hr |
| **README** | Architecture diagram + API table | 0.5 hrs |
| **Demo Video** | Record + upload to Loom | 0.5 hrs |
| **Buffer** | Debugging, Claude Code re-runs | 1 hr |
| **Total** | | **~15 hrs** |

---

## 13. Differentiators Checklist

Use this to verify your submission is complete before sending.

### Engineering
- [ ] All routes use `/api/v1/` prefix
- [ ] Rate limiting on `/auth` routes (10 req / 15 min)
- [ ] JWT expiry set (7 days)
- [ ] Role-based middleware on every protected route
- [ ] Input validation with Zod on all POST/PUT routes
- [ ] Consistent error response format `{ error, code, details }`
- [ ] DB migrations tracked in numbered SQL files
- [ ] Overdue detection cron job running
- [ ] Activity log on every mutation
- [ ] Task change history table populated

### Features
- [ ] Drag-and-drop Kanban board works
- [ ] 4 task priorities with color-coded badges
- [ ] Overdue tasks show red highlight
- [ ] Gemini AI summary generates successfully
- [ ] Dark mode toggle works + persists
- [ ] Skeleton loaders on all data-fetching pages
- [ ] Empty states on projects and kanban columns
- [ ] Toast notifications on success/error
- [ ] TaskModal has History tab with change timeline
- [ ] Activity log page shows full project timeline

### Deployment
- [ ] Live URL works without any local setup
- [ ] Demo credentials work: admin@teamflow.com + member@teamflow.com
- [ ] Seed data shows variety (all statuses, priorities, some overdue)
- [ ] GET /api/v1/health returns 200

### Presentation
- [ ] README has live URL at the top
- [ ] README has demo credentials table
- [ ] README has architecture diagram
- [ ] README has full API reference table
- [ ] Demo video is 3–4 minutes, narrated
- [ ] Demo video shows AI summary feature explicitly
- [ ] GitHub repo is public
- [ ] No `.env` files committed (check with `git log`)
```
