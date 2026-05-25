import { z } from 'zod'
import db from '../db.js'
import { logActivity } from '../models/activityModel.js'

const createProjectSchema = z.object({
  name: z.string().min(1).max(150),
  description: z.string().optional().default(''),
})

const updateProjectSchema = z.object({
  name: z.string().min(1).max(150).optional(),
  description: z.string().optional(),
})

const addMemberSchema = z.object({
  email: z.string().email(),
})

const updateRoleSchema = z.object({
  role: z.enum(['admin', 'member']),
})

export const getAllProjects = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT p.*,
        pm.role as user_role,
        COUNT(DISTINCT pm2.user_id) as member_count,
        COUNT(DISTINCT t.id) as task_count,
        COUNT(DISTINCT CASE WHEN t.status = 'done' THEN t.id END) as done_count
      FROM projects p
      JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = $1
      LEFT JOIN project_members pm2 ON pm2.project_id = p.id
      LEFT JOIN tasks t ON t.project_id = p.id
      GROUP BY p.id, pm.role
      ORDER BY p.created_at DESC`,
      [req.user.id]
    )

    return res.json({ projects: result.rows })
  } catch (err) {
    next(err)
  }
}

export const createProject = async (req, res, next) => {
  try {
    const { name, description } = createProjectSchema.parse(req.body)

    const client = await db.getClient()
    try {
      await client.query('BEGIN')

      const projectResult = await client.query(
        `INSERT INTO projects (name, description, owner_id)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [name, description, req.user.id]
      )

      const project = projectResult.rows[0]

      await client.query(
        `INSERT INTO project_members (project_id, user_id, role)
         VALUES ($1, $2, 'admin')`,
        [project.id, req.user.id]
      )

      await client.query('COMMIT')

      await logActivity(project.id, req.user.id, 'project_created', 'project', project.id, { name: project.name })

      return res.status(201).json({
        project: { ...project, user_role: 'admin', member_count: 1, task_count: 0, done_count: 0 },
      })
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: err.errors })
    }
    next(err)
  }
}

export const getProject = async (req, res, next) => {
  try {
    const { id } = req.params

    const projectResult = await db.query(
      `SELECT p.*, pm.role as user_role
       FROM projects p
       JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = $2
       WHERE p.id = $1`,
      [id, req.user.id]
    )

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' })
    }

    const membersResult = await db.query(
      `SELECT pm.*, u.name, u.email, u.avatar_color
       FROM project_members pm
       JOIN users u ON u.id = pm.user_id
       WHERE pm.project_id = $1
       ORDER BY pm.joined_at ASC`,
      [id]
    )

    return res.json({
      project: projectResult.rows[0],
      members: membersResult.rows,
    })
  } catch (err) {
    next(err)
  }
}

export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params
    const data = updateProjectSchema.parse(req.body)

    const fields = []
    const values = []
    let idx = 1

    if (data.name !== undefined) {
      fields.push(`name = $${idx++}`)
      values.push(data.name)
    }
    if (data.description !== undefined) {
      fields.push(`description = $${idx++}`)
      values.push(data.description)
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' })
    }

    fields.push(`updated_at = NOW()`)
    values.push(id)

    const result = await db.query(
      `UPDATE projects SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    )

    await logActivity(id, req.user.id, 'project_updated', 'project', id, data)

    return res.json({ project: result.rows[0] })
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: err.errors })
    }
    next(err)
  }
}

export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params

    await db.query('DELETE FROM projects WHERE id = $1', [id])

    return res.json({ message: 'Project deleted successfully' })
  } catch (err) {
    next(err)
  }
}

export const addMember = async (req, res, next) => {
  try {
    const { id } = req.params
    const { email } = addMemberSchema.parse(req.body)

    const userResult = await db.query('SELECT id, name, email, avatar_color FROM users WHERE email = $1', [email])
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    const user = userResult.rows[0]

    const existing = await db.query(
      'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2',
      [id, user.id]
    )

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Already a member' })
    }

    await db.query(
      `INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, 'member')`,
      [id, user.id]
    )

    await logActivity(id, req.user.id, 'member_added', 'user', user.id, { userName: user.name })

    return res.status(201).json({ member: { ...user, role: 'member' } })
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: err.errors })
    }
    next(err)
  }
}

export const removeMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params

    const projectResult = await db.query('SELECT owner_id FROM projects WHERE id = $1', [id])
    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' })
    }

    if (projectResult.rows[0].owner_id === userId) {
      return res.status(400).json({ error: 'Cannot remove project owner' })
    }

    await db.query(
      'DELETE FROM project_members WHERE project_id = $1 AND user_id = $2',
      [id, userId]
    )

    await logActivity(id, req.user.id, 'member_removed', 'user', userId, {})

    return res.json({ message: 'Member removed successfully' })
  } catch (err) {
    next(err)
  }
}

export const updateMemberRole = async (req, res, next) => {
  try {
    const { id, userId } = req.params
    const { role } = updateRoleSchema.parse(req.body)

    // Cannot demote yourself if you're the only admin
    if (userId === req.user.id && role === 'member') {
      const adminCount = await db.query(
        `SELECT COUNT(*) FROM project_members WHERE project_id = $1 AND role = 'admin'`,
        [id]
      )
      if (parseInt(adminCount.rows[0].count) <= 1) {
        return res.status(400).json({ error: 'Cannot demote yourself as the only admin' })
      }
    }

    const result = await db.query(
      `UPDATE project_members SET role = $1 WHERE project_id = $2 AND user_id = $3
       RETURNING *`,
      [role, id, userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' })
    }

    await logActivity(id, req.user.id, 'member_role_changed', 'user', userId, { role })

    return res.json({ member: result.rows[0] })
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: err.errors })
    }
    next(err)
  }
}

export const getProjectActivity = async (req, res, next) => {
  try {
    const { id } = req.params

    const result = await db.query(
      `SELECT al.*, u.name as user_name, u.avatar_color
       FROM activity_logs al
       LEFT JOIN users u ON u.id = al.user_id
       WHERE al.project_id = $1
       ORDER BY al.created_at DESC
       LIMIT 50`,
      [id]
    )

    return res.json({ activity: result.rows })
  } catch (err) {
    next(err)
  }
}
