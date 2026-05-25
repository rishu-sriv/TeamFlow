import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error:', err.message)
})

pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[DB] New client connected to PostgreSQL')
  }
})

const db = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  pool,
}

export default db
