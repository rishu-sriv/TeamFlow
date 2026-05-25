import 'dotenv/config'
import bcrypt from 'bcrypt'
import { readdir, readFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import db from './db.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

async function dropTables() {
  await db.query(`
    DROP TABLE IF EXISTS activity_logs CASCADE;
    DROP TABLE IF EXISTS task_history CASCADE;
    DROP TABLE IF EXISTS tasks CASCADE;
    DROP TABLE IF EXISTS project_members CASCADE;
    DROP TABLE IF EXISTS projects CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
    DROP TABLE IF EXISTS teams CASCADE;
  `)
  console.log('[SEED] Tables dropped')
}

async function runMigrations() {
  const migrationsDir = join(__dirname, 'migrations')
  const files = await readdir(migrationsDir)
  const sqlFiles = files.filter((f) => f.endsWith('.sql')).sort()

  for (const file of sqlFiles) {
    const sql = await readFile(join(migrationsDir, file), 'utf-8')
    await db.query(sql)
    console.log(`[SEED] Migration: ${file}`)
  }
}

async function seed() {
  try {
    await dropTables()
    await runMigrations()

    // Create team
    const teamResult = await db.query(
      `INSERT INTO teams (name) VALUES ($1) RETURNING *`,
      ['TeamFlow Demo']
    )
    const team = teamResult.rows[0]
    console.log('[SEED] Team created: TeamFlow Demo')

    // Create users
    const adminPass  = await bcrypt.hash('Admin@123', 12)
    const memberPass = await bcrypt.hash('Member@123', 12)

    const rohitResult = await db.query(
      `INSERT INTO users (name, email, password_hash, avatar_color, team_id, is_team_admin) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      ['Rohit', 'rohit@teamflow.com', adminPass, '#6366f1', team.id, true]
    )
    const riyaResult = await db.query(
      `INSERT INTO users (name, email, password_hash, avatar_color, team_id, is_team_admin) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      ['Riya', 'riya@teamflow.com', memberPass, '#ec4899', team.id, false]
    )
    const viratResult = await db.query(
      `INSERT INTO users (name, email, password_hash, avatar_color, team_id, is_team_admin) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      ['Virat', 'virat@teamflow.com', memberPass, '#10b981', team.id, false]
    )
    const ankurResult = await db.query(
      `INSERT INTO users (name, email, password_hash, avatar_color, team_id, is_team_admin) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      ['Ankur', 'ankur@teamflow.com', memberPass, '#f59e0b', team.id, false]
    )
    const kushResult = await db.query(
      `INSERT INTO users (name, email, password_hash, avatar_color, team_id, is_team_admin) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      ['Kush', 'kush@teamflow.com', memberPass, '#3b82f6', team.id, false]
    )

    const rohit = rohitResult.rows[0]
    const riya  = riyaResult.rows[0]
    const virat = viratResult.rows[0]
    const ankur = ankurResult.rows[0]
    const kush  = kushResult.rows[0]

    console.log('[SEED] Users created: Rohit, Riya, Virat, Ankur, Kush')

    // ── Project 1: Product Launch Q1 ─────────────────────────────────────────
    const p1Result = await db.query(
      `INSERT INTO projects (name, description, owner_id, team_id) VALUES ($1, $2, $3, $4) RETURNING *`,
      ['Product Launch Q1', 'Launch our flagship product for Q1 with all core features completed.', rohit.id, team.id]
    )
    const p1 = p1Result.rows[0]

    await db.query(
      `INSERT INTO project_members (project_id, user_id, role)
       VALUES ($1, $2, 'admin'), ($1, $3, 'member'), ($1, $4, 'member'), ($1, $5, 'member'), ($1, $6, 'member')`,
      [p1.id, rohit.id, riya.id, virat.id, ankur.id, kush.id]
    )

    const tasksP1 = [
      { title: 'Set up CI/CD pipeline',        description: 'Configure GitHub Actions for automated testing and deployment', status: 'done',        priority: 'high',     assignee_id: virat.id, due_date: null,         is_overdue: false },
      { title: 'Design landing page mockups',   description: 'Create Figma mockups for the product landing page',           status: 'done',        priority: 'medium',   assignee_id: riya.id,  due_date: null,         is_overdue: false },
      { title: 'Implement user authentication', description: 'JWT-based auth with refresh tokens',                          status: 'done',        priority: 'critical', assignee_id: virat.id, due_date: null,         is_overdue: false },
      { title: 'Write API documentation',       description: 'Document all REST endpoints using OpenAPI spec',              status: 'in_progress', priority: 'medium',   assignee_id: ankur.id, due_date: '2026-06-01', is_overdue: false },
      { title: 'Performance optimization',      description: 'Profile and optimize database queries for production load',   status: 'in_progress', priority: 'high',     assignee_id: kush.id,  due_date: '2026-05-30', is_overdue: false },
      { title: 'Security audit',                description: 'Review codebase for vulnerabilities and implement fixes',     status: 'review',      priority: 'critical', assignee_id: rohit.id, due_date: '2026-05-28', is_overdue: false },
      { title: 'Load testing',                  description: 'Run k6 load tests — ensure system handles 1k concurrent users', status: 'review',   priority: 'high',     assignee_id: virat.id, due_date: '2026-05-27', is_overdue: false },
      { title: 'Update pricing page',           description: 'Reflect new pricing tiers on the marketing site',            status: 'todo',        priority: 'medium',   assignee_id: riya.id,  due_date: '2026-05-20', is_overdue: true  },
      { title: 'Fix payment gateway bug',       description: 'Stripe webhook is not processing refunds correctly',         status: 'todo',        priority: 'critical', assignee_id: ankur.id, due_date: '2026-05-15', is_overdue: true  },
      { title: 'User onboarding flow',          description: 'Implement guided onboarding for new users',                  status: 'todo',        priority: 'high',     assignee_id: null,     due_date: '2026-05-18', is_overdue: true  },
    ]

    for (const t of tasksP1) {
      await db.query(
        `INSERT INTO tasks (title, description, project_id, assignee_id, created_by, status, priority, due_date, is_overdue)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [t.title, t.description, p1.id, t.assignee_id, rohit.id, t.status, t.priority, t.due_date, t.is_overdue]
      )
    }

    console.log('[SEED] Project 1 tasks created')

    await db.query(
      `INSERT INTO activity_logs (project_id, user_id, action, entity_type, metadata)
       VALUES ($1, $2, 'project_created', 'project', $3)`,
      [p1.id, rohit.id, JSON.stringify({ name: p1.name })]
    )
    for (const m of [riya, virat, ankur, kush]) {
      await db.query(
        `INSERT INTO activity_logs (project_id, user_id, action, entity_type, metadata)
         VALUES ($1, $2, 'member_added', 'user', $3)`,
        [p1.id, rohit.id, JSON.stringify({ userName: m.name })]
      )
    }

    // ── Project 2: Website Redesign ───────────────────────────────────────────
    const p2Result = await db.query(
      `INSERT INTO projects (name, description, owner_id, team_id) VALUES ($1, $2, $3, $4) RETURNING *`,
      ['Website Redesign', 'Complete overhaul of the company website with new branding and improved UX.', rohit.id, team.id]
    )
    const p2 = p2Result.rows[0]

    await db.query(
      `INSERT INTO project_members (project_id, user_id, role)
       VALUES ($1, $2, 'admin'), ($1, $3, 'member'), ($1, $4, 'member')`,
      [p2.id, rohit.id, riya.id, virat.id]
    )

    const tasksP2 = [
      { title: 'Brand guidelines update', description: 'Update color palette, typography, and logo usage guidelines',    status: 'done',        priority: 'high',   assignee_id: riya.id,  due_date: null         },
      { title: 'Homepage redesign',        description: 'Redesign homepage with new hero section and feature highlights', status: 'in_progress', priority: 'high',   assignee_id: riya.id,  due_date: '2026-06-05' },
      { title: 'Mobile responsiveness',    description: 'Ensure all pages are fully responsive on mobile and tablet',    status: 'todo',        priority: 'medium', assignee_id: virat.id, due_date: '2026-06-10' },
      { title: 'SEO optimization',         description: 'Implement meta tags, structured data, and sitemap',             status: 'todo',        priority: 'medium', assignee_id: null,     due_date: '2026-06-15' },
      { title: 'Analytics integration',    description: 'Set up Google Analytics 4 and conversion tracking',            status: 'review',      priority: 'low',    assignee_id: riya.id,  due_date: '2026-05-29' },
    ]

    for (const t of tasksP2) {
      await db.query(
        `INSERT INTO tasks (title, description, project_id, assignee_id, created_by, status, priority, due_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [t.title, t.description, p2.id, t.assignee_id, rohit.id, t.status, t.priority, t.due_date]
      )
    }

    await db.query(
      `INSERT INTO activity_logs (project_id, user_id, action, entity_type, metadata)
       VALUES ($1, $2, 'project_created', 'project', $3)`,
      [p2.id, rohit.id, JSON.stringify({ name: p2.name })]
    )

    console.log('[SEED] Project 2 tasks created')
    console.log('\n[SEED] ✓ Database seeded successfully!')
    console.log('\nAccounts:')
    console.log('  rohit@teamflow.com  / Admin@123   (Admin)')
    console.log('  riya@teamflow.com   / Member@123  (Member)')
    console.log('  virat@teamflow.com  / Member@123  (Member)')
    console.log('  ankur@teamflow.com  / Member@123  (Member)')
    console.log('  kush@teamflow.com   / Member@123  (Member)')
  } catch (err) {
    console.error('[SEED] Error:', err.message)
    process.exit(1)
  } finally {
    await db.pool.end()
    process.exit(0)
  }
}

seed()
