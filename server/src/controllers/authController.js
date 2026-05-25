import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import db from '../db.js'

const signupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const AVATAR_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export const signup = async (req, res, next) => {
  try {
    const { name, email, password } = signupSchema.parse(req.body)

    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email])
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' })
    }

    const password_hash = await bcrypt.hash(password, 12)
    const avatar_color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]

    const result = await db.query(
      `INSERT INTO users (name, email, password_hash, avatar_color)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, avatar_color`,
      [name, email, password_hash, avatar_color]
    )

    const user = result.rows[0]
    const token = generateToken(user)

    return res.status(201).json({ user, token })
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: err.errors })
    }
    next(err)
  }
}

export const login = async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body)

    const result = await db.query(
      'SELECT id, name, email, password_hash, avatar_color FROM users WHERE email = $1',
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
      'SELECT id, name, email, avatar_color, created_at FROM users WHERE id = $1',
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
