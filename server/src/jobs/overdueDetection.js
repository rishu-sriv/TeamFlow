import cron from 'node-cron'
import db from '../db.js'

// Run every hour
cron.schedule('0 * * * *', async () => {
  try {
    const result = await db.query(`
      UPDATE tasks
      SET is_overdue = TRUE, updated_at = NOW()
      WHERE due_date < CURRENT_DATE
        AND status != 'done'
        AND is_overdue = FALSE
    `)
    console.log(`[CRON] Overdue check: ${result.rowCount} tasks flagged at ${new Date().toISOString()}`)
  } catch (err) {
    console.error('[CRON] Overdue detection failed:', err.message)
  }
})

export default {}
