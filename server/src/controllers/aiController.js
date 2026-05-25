import { GoogleGenerativeAI } from '@google/generative-ai'
import db from '../db.js'

// Rule-based fallback summary when Gemini quota is exhausted
function buildFallbackSummary({ overdue, upcoming, critical, done, total }) {
  const lines = []

  lines.push('🔴 Overdue')
  if (overdue.length === 0) {
    lines.push('• No overdue tasks — great work!')
  } else {
    overdue.slice(0, 4).forEach(t =>
      lines.push(`• ${t.title} [${t.project_name}${t.assignee_name ? ` → ${t.assignee_name}` : ''}]`)
    )
    if (overdue.length > 4) lines.push(`• …and ${overdue.length - 4} more overdue tasks`)
  }

  lines.push('')
  lines.push('⚠️ Due Soon')
  if (upcoming.length === 0) {
    lines.push('• No tasks due this week')
  } else {
    upcoming.slice(0, 4).forEach(t => {
      const due = t.due_date ? new Date(t.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''
      lines.push(`• ${t.title}${due ? ` — due ${due}` : ''} [${t.project_name}]`)
    })
  }

  lines.push('')
  lines.push('⭐ Critical')
  if (critical.length === 0) {
    lines.push('• No critical tasks outstanding')
  } else {
    critical.slice(0, 4).forEach(t =>
      lines.push(`• ${t.title} [${t.project_name}${t.assignee_name ? ` → ${t.assignee_name}` : ''}]`)
    )
  }

  lines.push('')
  lines.push('✅ Completed')
  if (done.length === 0) {
    lines.push('• No completed tasks yet')
  } else {
    lines.push(`• ${done.length} of ${total} tasks completed across all projects`)
    done.slice(0, 3).forEach(t => lines.push(`• ${t.title} [${t.project_name}]`))
  }

  return lines.join('\n')
}

async function callGemini(prompt) {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not set in .env')

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  // Try models in order — fall back on quota (429) or model-not-found (404)
  const models = [
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash',
    'gemini-1.5-flash-8b',
    'gemini-1.0-pro',
  ]
  let lastErr
  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName })
      const result = await model.generateContent(prompt)
      console.log(`[AI] Success with model: ${modelName}`)
      return result.response.text()
    } catch (err) {
      lastErr = err
      const msg = String(err.message)
      console.error(`[AI] ${modelName} error:`, msg.slice(0, 120))
      const shouldFallback =
        msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED') ||
        msg.includes('404') || msg.includes('not found') || msg.includes('not supported')
      if (!shouldFallback) throw err // hard error (auth, network) — don't retry
      // availability/quota issue — try next model
    }
  }
  throw lastErr
}

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
      summary = await callGemini(prompt)
    } catch (aiErr) {
      console.error('[AI] Gemini error:', aiErr.message)
      const msg = aiErr.message || ''
      const isQuota = msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')
      const isKey   = msg.includes('API_KEY') || msg.includes('API key') || msg.includes('not set')
      return res.status(isQuota ? 429 : 503).json({
        error: isKey
          ? 'Invalid or missing Gemini API key. Update GEMINI_API_KEY in server/.env and restart.'
          : isQuota
          ? 'Gemini quota exceeded — wait a minute and try again.'
          : `AI error: ${msg}`,
      })
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

export const summarizeDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id

    // Get all projects user belongs to
    const memberResult = await db.query(
      `SELECT pm.project_id, pm.role, p.name as project_name
       FROM project_members pm JOIN projects p ON p.id = pm.project_id
       WHERE pm.user_id = $1`,
      [userId]
    )
    if (memberResult.rows.length === 0) {
      return res.status(400).json({ error: 'You are not in any projects' })
    }

    const projectIds = memberResult.rows.map(r => r.project_id)

    // Fetch all tasks across all projects with assignee info
    const tasksResult = await db.query(
      `SELECT t.title, t.status, t.priority, t.due_date, t.is_overdue,
        p.name as project_name,
        u.name as assignee_name
       FROM tasks t
       JOIN projects p ON p.id = t.project_id
       LEFT JOIN users u ON u.id = t.assignee_id
       WHERE t.project_id = ANY($1)
       ORDER BY
         CASE t.priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,
         t.due_date ASC NULLS LAST`,
      [projectIds]
    )

    const tasks = tasksResult.rows
    const overdue   = tasks.filter(t => t.is_overdue && t.status !== 'done')
    const done      = tasks.filter(t => t.status === 'done')
    const upcoming  = tasks.filter(t => {
      if (t.is_overdue || t.status === 'done' || !t.due_date) return false
      const due = new Date(t.due_date)
      const today = new Date(); today.setHours(0,0,0,0)
      const in7 = new Date(today); in7.setDate(today.getDate() + 7)
      return due >= today && due <= in7
    })
    const critical  = tasks.filter(t => t.priority === 'critical' && t.status !== 'done')

    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''
    const fmt = (t) => `"${t.title}" [${t.project_name}${t.assignee_name ? `, assigned to ${t.assignee_name}` : ''}${t.due_date ? `, due ${fmtDate(t.due_date)}` : ''}]`

    const prompt = `You are a project management assistant. The user is part of ${projectIds.length} project(s). Analyze the following task data and generate a concise bullet-point summary in 4 sections. Use plain text bullets (•), no markdown headers. Be direct and actionable.

OVERDUE TASKS (${overdue.length}):
${overdue.slice(0, 5).map(fmt).join('\n') || 'None'}

UPCOMING THIS WEEK (${upcoming.length}):
${upcoming.slice(0, 5).map(fmt).join('\n') || 'None'}

CRITICAL PRIORITY (${critical.length}):
${critical.slice(0, 5).map(fmt).join('\n') || 'None'}

COMPLETED (${done.length} total):
${done.slice(0, 3).map(fmt).join('\n') || 'None'}

Generate exactly 4 labeled sections:
1. 🔴 Overdue — list what's late and most urgent
2. ⚠️ Due Soon — what needs attention this week
3. ⭐ Critical — highest priority outstanding work
4. ✅ Completed — recent wins

Keep each bullet under 15 words. Maximum 4 bullets per section.`

    let summary
    let aiPowered = true
    try {
      summary = await callGemini(prompt)
    } catch (aiErr) {
      // Graceful fallback — generate rule-based summary from task data
      console.warn('[AI] Falling back to rule-based summary:', aiErr.message.slice(0, 80))
      summary = buildFallbackSummary({ overdue, upcoming, critical, done, total: tasks.length })
      aiPowered = false
    }

    return res.json({
      summary,
      aiPowered,
      generatedAt: new Date(),
      stats: { total: tasks.length, overdue: overdue.length, done: done.length, upcoming: upcoming.length },
    })
  } catch (err) {
    next(err)
  }
}
