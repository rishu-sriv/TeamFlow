import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import db from '../db.js'

const signupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  action: z.enum(['create', 'join']),
  team_name: z.string().min(2).max(100),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const AVATAR_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, team_id: user.team_id, is_team_admin: user.is_team_admin },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export const signup = async (req, res, next) => {
  const client = await db.getClient()
  try {
    const { name, email, password, action, team_name } = signupSchema.parse(req.body)

    await client.query('BEGIN')

    // Check email uniqueness
    const existing = await client.query('SELECT id FROM users WHERE email = $1', [email])
    if (existing.rows.length > 0) {
      await client.query('ROLLBACK')
      return res.status(409).json({ error: 'Email already registered' })
    }

    let teamId
    let isTeamAdmin = false

    if (action === 'create') {
      // Check team name not taken
      const teamExists = await client.query('SELECT id FROM teams WHERE LOWER(name) = LOWER($1)', [team_name])
      if (teamExists.rows.length > 0) {
        await client.query('ROLLBACK')
        return res.status(409).json({ error: 'Team name already taken. Choose a different name.' })
      }
      // Create the team
      const teamResult = await client.query(
        'INSERT INTO teams (name) VALUES ($1) RETURNING id',
        [team_name]
      )
      teamId = teamResult.rows[0].id
      isTeamAdmin = true
    } else {
      // Join existing team — look up by name (case-insensitive)
      const teamResult = await client.query(
        'SELECT id FROM teams WHERE LOWER(name) = LOWER($1)',
        [team_name]
      )
      if (teamResult.rows.length === 0) {
        await client.query('ROLLBACK')
        return res.status(404).json({ error: `Team "${team_name}" not found. Check the team name and try again.` })
      }
      teamId = teamResult.rows[0].id
      isTeamAdmin = false
    }

    const password_hash = await bcrypt.hash(password, 12)
    const avatar_color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]

    const result = await client.query(
      `INSERT INTO users (name, email, password_hash, avatar_color, team_id, is_team_admin)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, avatar_color, team_id, is_team_admin`,
      [name, email, password_hash, avatar_color, teamId, isTeamAdmin]
    )

    const newUser = result.rows[0]

    // Auto-add new member to all existing team projects
    if (action === 'join') {
      const teamProjects = await client.query(
        'SELECT id FROM projects WHERE team_id = $1',
        [teamId]
      )
      for (const project of teamProjects.rows) {
        await client.query(
          `INSERT INTO project_members (project_id, user_id, role)
           VALUES ($1, $2, 'member')
           ON CONFLICT (project_id, user_id) DO NOTHING`,
          [project.id, newUser.id]
        )
      }
    }

    await client.query('COMMIT')

    const user = newUser
    const token = generateToken(user)

    return res.status(201).json({ user, token })
  } catch (err) {
    await client.query('ROLLBACK')
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: err.errors })
    }
    next(err)
  } finally {
    client.release()
  }
}

export const login = async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body)

    const result = await db.query(
      `SELECT u.id, u.name, u.email, u.password_hash, u.avatar_color, u.team_id, u.is_team_admin,
        t.name as team_name
       FROM users u
       LEFT JOIN teams t ON t.id = u.team_id
       WHERE u.email = $1`,
      [email]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const user = result.rows[0]
    const isMatch = await bcrypt.compare(password, user.password_hash)
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = generateToken(user)
    const { password_hash, ...safeUser } = user

    return res.status(200).json({ user: safeUser, token })
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: err.errors })
    }
    next(err)
  }
}

export const getMe = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT u.id, u.name, u.email, u.avatar_color, u.team_id, u.is_team_admin, u.created_at,
        t.name as team_name
       FROM users u
       LEFT JOIN teams t ON t.id = u.team_id
       WHERE u.id = $1`,
      [req.user.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    return res.json({ user: result.rows[0] })
  } catch (err) {
    next(err)
  }
}

export { signupSchema, loginSchema }
