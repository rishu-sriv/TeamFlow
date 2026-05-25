import db from '../db.js'

export const authorize = (requiredRole) => {
  return async (req, res, next) => {
    const projectId = req.params.id || req.params.projectId

    try {
      const result = await db.query(
        `SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2`,
        [projectId, req.user.id]
      )

      if (result.rows.length === 0) {
        return res.status(403).json({ error: 'Not a project member' })
      }

      const member = result.rows[0]

      if (requiredRole === 'admin' && member.role === 'member') {
        return res.status(403).json({ error: 'Admin access required' })
      }

      req.projectRole = member.role
      next()
    } catch (err) {
      next(err)
    }
  }
}

export default authorize
