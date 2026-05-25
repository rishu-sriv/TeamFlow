import { z } from 'zod'
import db from '../db.js'
import { logActivity } from '../models/activityModel.js'

const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional().default(''),
  assignee_id: z.string().uuid().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional().default('medium'),
  due_date: z.string().optional().nullable(),
})

const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  assignee_id: z.string().uuid().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  due_date: z.string().optional().nullable(),
  status: z.enum(['todo', 'in_progress', 'review', 'done']).optional(),
})

const updateStatusSchema = z.object({
  status: z.enum(['todo', 'in_progress', 'review', 'done']),
})

const isProjectMember = async (projectId, userId) => {
  const result = await db.query(
    'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
    [projectId, userId]
  )
  return result.rows[0] || null
}

export const getTasksByProject = async (req, res, next) => {
  try {
    const { projectId } = req.params
    const { status, priority, assignee_id } = req.query

    const member = await isProjectMember(projectId, req.user.id)
    if (!member) {
      return res.status(403).json({ error: 'Not a project member' })
    }

    let query = `
      SELECT t.*,
        u.name as assignee_name,
        u.avatar_color as assignee_avatar_color,
        u.email as assignee_email
      FROM tasks t
      LEFT JOIN users u ON u.id = t.assignee_id
      WHERE t.project_id = $1
    `
    const params = [projectId]
    let idx = 2

    if (status) {
      query += ` AND t.status = $${idx++}`
      params.push(status)
    }
    if (priority) {
      query += ` AND t.priority = $${idx++}`
      params.push(priority)
    }
    if (assignee_id) {
      query += ` AND t.assignee_id = $${idx++}`
      params.push(assignee_id)
    }

    query += ` ORDER BY CASE t.priority
      WHEN 'critical' THEN 1
      WHEN 'high' THEN 2
      WHEN 'medium' THEN 3
      WHEN 'low' THEN 4
    END, t.created_at ASC`

    const result = await db.query(query, params)

    return res.json({ tasks: result.rows })
  } catch (err) {
    next(err)
  }
}

export const createTask = async (req, res, next) => {
  try {
    const { projectId } = req.params
    const member = await isProjectMember(projectId, req.user.id)
    if (!member) {
      return res.status(403).json({ error: 'Not a project member' })
    }

    const data = createTaskSchema.parse(req.body)

    const result = await db.query(
      `INSERT INTO tasks (title, description, project_id, assignee_id, created_by, priority, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.title,
        data.description,
        projectId,
        data.assignee_id || null,
        req.user.id,
        data.priority,
        data.due_date || null,
      ]
    )

    const task = result.rows[0]

    // Get assignee info if assigned
    let taskWithAssignee = task
    if (task.assignee_id) {
      const assigneeResult = await db.query(
        'SELECT name, email, avatar_color FROM users WHERE id = $1',
        [task.assignee_id]
      )
      if (assigneeResult.rows.length > 0) {
        const a = assigneeResult.rows[0]
        taskWithAssignee = {
          ...task,
          assignee_name: a.name,
          assignee_email: a.email,
          assignee_avatar_color: a.avatar_color,
        }
      }
    }

    await logActivity(projectId, req.user.id, 'task_created', 'task', task.id, { title: task.title })

    return res.status(201).json({ task: taskWithAssignee })
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: err.errors })
    }
    next(err)
  }
}

export const getTask = async (req, res, next) => {
  try {
    const { id } = req.params

    const result = await db.query(
      `SELECT t.*,
        u.name as assignee_name,
        u.avatar_color as assignee_avatar_color,
        u.email as assignee_email,
        cb.name as created_by_name
      FROM tasks t
      LEFT JOIN users u ON u.id = t.assignee_id
      LEFT JOIN users cb ON cb.id = t.created_by
      WHERE t.id = $1`,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' })
    }

    const task = result.rows[0]
    const member = await isProjectMember(task.project_id, req.user.id)
    if (!member) {
      return res.status(403).json({ error: 'Not a project member' })
    }

    return res.json({ task })
  } catch (err) {
    next(err)
  }
}

export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params

    const taskResult = await db.query('SELECT * FROM tasks WHERE id = $1', [id])
    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' })
    }

    const task = taskResult.rows[0]
    const member = await isProjectMember(task.project_id, req.user.id)
    if (!member) {
      return res.status(403).json({ error: 'Not a project member' })
    }

    const data = updateTaskSchema.parse(req.body)

    // Members can only update status
    const isAdmin = member.role === 'admin'
    const allowedFields = isAdmin
      ? ['title', 'description', 'assignee_id', 'priority', 'due_date', 'status']
      : ['status']

    const fieldsToUpdate = Object.keys(data).filter((k) => allowedFields.includes(k) && data[k] !== undefined)

    if (fieldsToUpdate.length === 0) {
      return res.status(400).json({ error: 'No permitted fields to update' })
    }

    // Track history for specific fields
    const historyFields = ['status', 'priority', 'assignee_id', 'title', 'due_date']
    const historyInserts = []

    for (const field of historyFields) {
      if (fieldsToUpdate.includes(field) && data[field] !== task[field]) {
        historyInserts.push({
          field,
          old_value: task[field] !== null ? String(task[field]) : null,
          new_value: data[field] !== null ? String(data[field]) : null,
        })
      }
    }

    // Build update query
    const setClauses = []
    const values = []
    let idx = 1

    for (const field of fieldsToUpdate) {
      setClauses.push(`${field} = $${idx++}`)
      values.push(data[field] !== undefined ? data[field] : task[field])
    }

    setClauses.push(`updated_at = NOW()`)
    values.push(id)

    const updatedResult = await db.query(
      `UPDATE tasks SET ${setClauses.join(', ')} WHERE id = $${idx}
       RETURNING *`,
      values
    )

    // Insert history records
    for (const h of historyInserts) {
      await db.query(
        `INSERT INTO task_history (task_id, changed_by, field, old_value, new_value)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, req.user.id, h.field, h.old_value, h.new_value]
      )
    }

    await logActivity(task.project_id, req.user.id, 'task_updated', 'task', id, { fields: fieldsToUpdate })

    // Get with assignee info
    const finalResult = await db.query(
      `SELECT t.*, u.name as assignee_name, u.avatar_color as assignee_avatar_color, u.email as assignee_email
       FROM tasks t
       LEFT JOIN users u ON u.id = t.assignee_id
       WHERE t.id = $1`,
      [id]
    )

    return res.json({ task: finalResult.rows[0] })
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: err.errors })
    }
    next(err)
  }
}

export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params

    const taskResult = await db.query('SELECT * FROM tasks WHERE id = $1', [id])
    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' })
    }

    const task = taskResult.rows[0]
    const member = await isProjectMember(task.project_id, req.user.id)
    if (!member) {
      return res.status(403).json({ error: 'Not a project member' })
    }
    if (member.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' })
    }

    await db.query('DELETE FROM tasks WHERE id = $1', [id])
    await logActivity(task.project_id, req.user.id, 'task_deleted', 'task', id, { title: task.title })

    return res.json({ message: 'Task deleted successfully' })
  } catch (err) {
    next(err)
  }
}

export const getTaskHistory = async (req, res, next) => {
  try {
    const { id } = req.params

    const taskResult = await db.query('SELECT project_id FROM tasks WHERE id = $1', [id])
    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' })
    }

    const member = await isProjectMember(taskResult.rows[0].project_id, req.user.id)
    if (!member) {
      return res.status(403).json({ error: 'Not a project member' })
    }

    const result = await db.query(
      `SELECT th.*, u.name as changed_by_name, u.avatar_color as changed_by_avatar_color
       FROM task_history th
       LEFT JOIN users u ON u.id = th.changed_by
       WHERE th.task_id = $1
       ORDER BY th.changed_at DESC`,
      [id]
    )

    return res.json({ history: result.rows })
  } catch (err) {
    next(err)
  }
}

export const updateTaskStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status } = updateStatusSchema.parse(req.body)

    const taskResult = await db.query('SELECT * FROM tasks WHERE id = $1', [id])
    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' })
    }

    const task = taskResult.rows[0]
    const member = await isProjectMember(task.project_id, req.user.id)
    if (!member) {
      return res.status(403).json({ error: 'Not a project member' })
    }

    const result = await db.query(
      `UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    )

    await db.query(
      `INSERT INTO task_history (task_id, changed_by, field, old_value, new_value)
       VALUES ($1, $2, 'status', $3, $4)`,
      [id, req.user.id, task.status, status]
    )

    await logActivity(task.project_id, req.user.id, 'task_status_changed', 'task', id, {
      from: task.status,
      to: status,
      title: task.title,
    })

    return res.json({ task: result.rows[0] })
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation failed', details: err.errors })
    }
    next(err)
  }
}
