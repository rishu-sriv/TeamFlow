import { readdir, readFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import db from './db.js'

dotenv.config()

const __dirname = dirname(fileURLToPath(import.meta.url))

async function runMigrations() {
  const migrationsDir = join(__dirname, 'migrations')

  try {
    const files = await readdir(migrationsDir)
    const sqlFiles = files.filter((f) => f.endsWith('.sql')).sort()

    console.log(`[MIGRATIONS] Found ${sqlFiles.length} migration files`)

    for (const file of sqlFiles) {
      const filePath = join(migrationsDir, file)
      const sql = await readFile(filePath, 'utf-8')

      try {
        await db.query(sql)
        console.log(`[MIGRATIONS] ✓ ${file}`)
      } catch (err) {
        console.error(`[MIGRATIONS] ✗ ${file}: ${err.message}`)
        process.exit(1)
      }
    }

    console.log('[MIGRATIONS] All migrations completed successfully')
  } catch (err) {
    console.error('[MIGRATIONS] Failed to read migrations directory:', err.message)
    process.exit(1)
  } finally {
    await db.pool.end()
    process.exit(0)
  }
}

runMigrations()
