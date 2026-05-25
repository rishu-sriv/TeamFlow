import db from '../db.js'

export const logActivity = async (projectId, userId, action, entityType, entityId, metadata = {}) => {
  try {
    await db.query(
      `INSERT INTO activity_logs (project_id, user_id, action, entity_type, entity_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [projectId, userId, action, entityType, entityId, JSON.stringify(metadata)]
    )
  } catch (err) {
    console.error('[ActivityModel] Failed to log activity:', err.message)
  }
}

export default { logActivity }
