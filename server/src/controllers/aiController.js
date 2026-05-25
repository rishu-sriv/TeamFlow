import { GoogleGenerativeAI } from '@google/generative-ai'
import db from '../db.js'

export const summarizeProject = async (req, res, next) => {
  try {
    const { id } = req.params

    // Verify membership
    const memberCheck = await db.query(
      'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
      [id, req.user.id]
    )
    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not a project member' })
    }

    // Get project info
    const projectResult = await db.query('SELECT * FROM projects WHERE id = $1', [id])
    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' })
    }
    const project = projectResult.rows[0]

    // Get stats
    const statsResult = await db.query(
      `SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'todo' THEN 1 END) as todo,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
        COUNT(CASE WHEN status = 'review' THEN 1 END) as review,
        COUNT(CASE WHEN status = 'done' THEN 1 END) as done,
        COUNT(CASE WHEN is_overdue = TRUE THEN 1 END) as overdue,
        COUNT(CASE WHEN priority = 'critical' THEN 1 END) as critical,
        COUNT(CASE WHEN priority = 'high' THEN 1 END) as high
      FROM tasks WHERE project_id = $1`,
      [id]
    )

    const memberCountResult = await db.query(
      'SELECT COUNT(*) as count FROM project_members WHERE project_id = $1',
      [id]
    )

    const topAssigneeResult = await db.query(
      `SELECT u.name, COUNT(t.id) as task_count
       FROM tasks t
       JOIN users u ON u.id = t.assignee_id
       WHERE t.project_id = $1
       GROUP BY u.id, u.name
       ORDER BY task_count DESC
       LIMIT 1`,
      [id]
    )

    const s = statsResult.rows[0]
    const total = parseInt(s.total)
    const done = parseInt(s.done)
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0
    const memberCount = parseInt(memberCountResult.rows[0].count)
    const topAssignee = topAssigneeResult.rows[0]

    const prompt = `You are a project management assistant. Provide a concise, professional summary (3-4 sentences) of the following project status:

Project: ${project.name}
Description: ${project.description || 'No description provided'}
Team members: ${memberCount}
Total tasks: ${total}
  - Todo: ${s.todo}
  - In Progress: ${s.in_progress}
  - In Review: ${s.review}
  - Done: ${done}
Overdue tasks: ${s.overdue}
Critical priority tasks: ${s.critical}
High priority tasks: ${s.high}
Completion rate: ${completionRate}%
${topAssignee ? `Most active assignee: ${topAssignee.name} (${topAssignee.task_count} tasks)` : ''}

Focus on progress, risks (overdue tasks, critical items), and overall health. Be direct and actionable.`

    let summary
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      const result = await model.generateContent(prompt)
      summary = result.response.text()
    } catch (aiErr) {
      console.error('[AI] Gemini error:', aiErr.message)
      return res.status(503).json({ error: 'AI service temporarily unavailable. Please try again.' })
    }

    return res.json({
      summary,
      generatedAt: new Date(),
      stats: { total, completionRate, overdue: parseInt(s.overdue) },
    })
  } catch (err) {
    next(err)
  }
}
