// Mock axios adapter — intercepts all requests when VITE_MOCK_MODE=true
// Remove VITE_MOCK_MODE from .env to switch to real backend

import {
  CREDENTIALS, USERS, PROJECTS, MEMBERS, TASKS,
  ACTIVITY_LOGS, TASK_HISTORY, DASHBOARD_STATS, RECENT_ACTIVITY,
} from './data.js'

// In-memory state so mutations (drag, edit, delete) persist during the session
let projects = JSON.parse(JSON.stringify(PROJECTS))
let members  = JSON.parse(JSON.stringify(MEMBERS))
let tasks    = JSON.parse(JSON.stringify(TASKS))
let activity = JSON.parse(JSON.stringify(ACTIVITY_LOGS))
let history  = JSON.parse(JSON.stringify(TASK_HISTORY))

const ok   = (data, status = 200) => ({ data, status, headers: {}, config: {} })
const fail = (message, status)    => { const e = new Error(message); e.response = { data: { error: message }, status }; throw e }

// Parse JSON body string safely
const parseBody = (data) => {
  if (!data) return {}
  try { return typeof data === 'string' ? JSON.parse(data) : data } catch { return {} }
}

// Find task by id across all projects
const findTask = (taskId) => {
  for (const [pid, list] of Object.entries(tasks)) {
    const t = list.find(t => t.id === taskId)
    if (t) return { task: t, projectId: pid }
  }
  return null
}

export function mockAdapter(config) {
  return new Promise((resolve, reject) => {
    try {
      const result = handleRequest(config)
      resolve(result)
    } catch (err) {
      reject(err)
    }
  })
}

function handleRequest(config) {
  const method = (config.method || 'get').toLowerCase()
  // Strip baseURL prefix for matching
  const rawUrl = config.url || ''
  const url = rawUrl.replace(/^\/api\/v1/, '')
  const body = parseBody(config.data)

  // ─── AUTH ──────────────────────────────────────────────────────────────────
  if (method === 'post' && url === '/auth/login') {
    const cred = CREDENTIALS[body.email]
    if (!cred || cred.password !== body.password) fail('Invalid credentials', 401)
    const token = `mock-jwt-${cred.user.id}`
    return ok({ user: cred.user, token })
  }

  if (method === 'post' && url === '/auth/signup') {
    if (CREDENTIALS[body.email]) fail('Email already registered', 409)
    const user = { id: `usr-new-${Date.now()}`, name: body.name, email: body.email, avatar_color: '#6366f1' }
    const token = `mock-jwt-${user.id}`
    return ok({ user, token }, 201)
  }

  if (method === 'get' && url === '/auth/me') {
    // Derive user from token header
    const auth = config.headers?.Authorization || ''
    const userId = auth.replace('Bearer mock-jwt-', '')
    const user = Object.values(USERS).find(u => u.id === userId) || USERS.admin
    return ok({ user })
  }

  // ─── DASHBOARD ─────────────────────────────────────────────────────────────
  if (method === 'get' && url === '/dashboard') {
    return ok({ stats: DASHBOARD_STATS, recentActivity: RECENT_ACTIVITY })
  }

  if (method === 'get' && url === '/dashboard/overdue') {
    const overdue = Object.entries(tasks).flatMap(([pid, list]) =>
      list.filter(t => t.is_overdue).map(t => ({
        ...t,
        project_name: projects.find(p => p.id === pid)?.name || '',
      }))
    )
    return ok(overdue)
  }

  // ─── PROJECTS ──────────────────────────────────────────────────────────────
  if (method === 'get' && url === '/projects') {
    return ok(projects)
  }

  if (method === 'post' && url === '/projects') {
    const proj = {
      id: `proj-${Date.now()}`,
      name: body.name,
      description: body.description || '',
      owner_id: 'usr-admin-001',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_role: 'admin',
      member_count: '1',
      task_count: '0',
      done_count: '0',
    }
    projects.unshift(proj)
    members[proj.id] = [{ id: 'usr-admin-001', name: 'Alex Admin', email: 'admin@teamflow.com', avatar_color: '#6366f1', role: 'admin', joined_at: new Date().toISOString() }]
    tasks[proj.id] = []
    return ok({ ...proj }, 201)
  }

  // GET /projects/:id
  const projectMatch = url.match(/^\/projects\/([^/]+)$/)
  if (projectMatch && method === 'get') {
    const id = projectMatch[1]
    const proj = projects.find(p => p.id === id)
    if (!proj) fail('Project not found', 404)
    return ok({ project: proj, members: members[id] || [] })
  }

  // PUT /projects/:id
  if (projectMatch && method === 'put') {
    const id = projectMatch[1]
    const proj = projects.find(p => p.id === id)
    if (!proj) fail('Project not found', 404)
    if (body.name) proj.name = body.name
    if (body.description !== undefined) proj.description = body.description
    proj.updated_at = new Date().toISOString()
    return ok(proj)
  }

  // DELETE /projects/:id
  if (projectMatch && method === 'delete') {
    const id = projectMatch[1]
    projects = projects.filter(p => p.id !== id)
    return ok({ message: 'Project deleted' })
  }

  // GET /projects/:id/activity
  const activityMatch = url.match(/^\/projects\/([^/]+)\/activity$/)
  if (activityMatch && method === 'get') {
    const id = activityMatch[1]
    return ok(activity[id] || [])
  }

  // POST /projects/:id/members
  const membersBaseMatch = url.match(/^\/projects\/([^/]+)\/members$/)
  if (membersBaseMatch && method === 'post') {
    const id = membersBaseMatch[1]
    const user = Object.values(USERS).find(u => u.email === body.email)
    if (!user) fail('User not found', 404)
    const existing = (members[id] || []).find(m => m.id === user.id)
    if (existing) fail('Already a member', 409)
    const newMember = { ...user, role: 'member', joined_at: new Date().toISOString() }
    members[id] = [...(members[id] || []), newMember]
    const proj = projects.find(p => p.id === id)
    if (proj) proj.member_count = String(Number(proj.member_count) + 1)
    return ok(newMember, 201)
  }

  // DELETE /projects/:id/members/:userId
  const removeMemberMatch = url.match(/^\/projects\/([^/]+)\/members\/([^/]+)$/)
  if (removeMemberMatch && method === 'delete') {
    const [, projId, userId] = removeMemberMatch
    members[projId] = (members[projId] || []).filter(m => m.id !== userId)
    return ok({ message: 'Member removed' })
  }

  // PUT /projects/:id/members/:userId/role
  const roleMatch = url.match(/^\/projects\/([^/]+)\/members\/([^/]+)\/role$/)
  if (roleMatch && method === 'put') {
    const [, projId, userId] = roleMatch
    const member = (members[projId] || []).find(m => m.id === userId)
    if (!member) fail('Member not found', 404)
    member.role = body.role
    return ok(member)
  }

  // ─── TASKS ─────────────────────────────────────────────────────────────────

  // GET /tasks/project/:projectId
  const tasksByProjectMatch = url.match(/^\/tasks\/project\/([^/]+)/)
  if (tasksByProjectMatch && method === 'get') {
    const pid = tasksByProjectMatch[1]
    let list = tasks[pid] || []
    const params = config.params || {}
    if (params.status)      list = list.filter(t => t.status === params.status)
    if (params.priority)    list = list.filter(t => t.priority === params.priority)
    if (params.assignee_id) list = list.filter(t => t.assignee_id === params.assignee_id)
    return ok(list)
  }

  // POST /tasks/project/:projectId
  if (url.match(/^\/tasks\/project\/([^/]+)$/) && method === 'post') {
    const pid = url.match(/^\/tasks\/project\/([^/]+)$/)[1]
    const assignee = body.assignee_id ? Object.values(USERS).find(u => u.id === body.assignee_id) : null
    const task = {
      id: `task-${Date.now()}`,
      title: body.title,
      description: body.description || '',
      project_id: pid,
      assignee_id: body.assignee_id || null,
      created_by: 'usr-admin-001',
      status: 'todo',
      priority: body.priority || 'medium',
      due_date: body.due_date || null,
      is_overdue: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      assignee_name: assignee?.name || null,
      assignee_avatar_color: assignee?.avatar_color || null,
      created_by_name: 'Alex Admin',
    }
    tasks[pid] = [task, ...(tasks[pid] || [])]
    const proj = projects.find(p => p.id === pid)
    if (proj) proj.task_count = String(Number(proj.task_count) + 1)
    return ok(task, 201)
  }

  // GET /tasks/:id
  const singleTaskMatch = url.match(/^\/tasks\/([^/]+)$/)
  if (singleTaskMatch && method === 'get') {
    const found = findTask(singleTaskMatch[1])
    if (!found) fail('Task not found', 404)
    return ok(found.task)
  }

  // PUT /tasks/:id
  if (singleTaskMatch && method === 'put') {
    const found = findTask(singleTaskMatch[1])
    if (!found) fail('Task not found', 404)
    const { task, projectId } = found
    const trackable = ['status', 'priority', 'assignee_id', 'title', 'due_date']
    for (const field of trackable) {
      if (body[field] !== undefined && String(body[field]) !== String(task[field])) {
        const entry = { id: `hist-${Date.now()}-${field}`, task_id: task.id, changed_by: 'usr-admin-001', field, old_value: String(task[field] ?? ''), new_value: String(body[field] ?? ''), changed_at: new Date().toISOString(), changed_by_name: 'Alex Admin' }
        history[task.id] = [entry, ...(history[task.id] || [])]
      }
    }
    Object.assign(task, { ...body, updated_at: new Date().toISOString() })
    if (body.assignee_id) {
      const assignee = Object.values(USERS).find(u => u.id === body.assignee_id)
      task.assignee_name = assignee?.name || null
      task.assignee_avatar_color = assignee?.avatar_color || null
    }
    return ok(task)
  }

  // DELETE /tasks/:id
  if (singleTaskMatch && method === 'delete') {
    const taskId = singleTaskMatch[1]
    for (const pid of Object.keys(tasks)) {
      const before = tasks[pid].length
      tasks[pid] = tasks[pid].filter(t => t.id !== taskId)
      if (tasks[pid].length < before) {
        const proj = projects.find(p => p.id === pid)
        if (proj) proj.task_count = String(Math.max(0, Number(proj.task_count) - 1))
      }
    }
    return ok({ message: 'Task deleted' })
  }

  // GET /tasks/:id/history
  const historyMatch = url.match(/^\/tasks\/([^/]+)\/history$/)
  if (historyMatch && method === 'get') {
    return ok(history[historyMatch[1]] || [])
  }

  // PATCH /tasks/:id/status
  const statusMatch = url.match(/^\/tasks\/([^/]+)\/status$/)
  if (statusMatch && method === 'patch') {
    const found = findTask(statusMatch[1])
    if (!found) fail('Task not found', 404)
    const { task } = found
    const oldStatus = task.status
    task.status = body.status
    task.updated_at = new Date().toISOString()
    const entry = { id: `hist-${Date.now()}`, task_id: task.id, changed_by: 'usr-admin-001', field: 'status', old_value: oldStatus, new_value: body.status, changed_at: new Date().toISOString(), changed_by_name: 'Alex Admin' }
    history[task.id] = [entry, ...(history[task.id] || [])]
    return ok(task)
  }

  // ─── AI ────────────────────────────────────────────────────────────────────
  const aiMatch = url.match(/^\/ai\/projects\/([^/]+)\/summarize$/)
  if (aiMatch && method === 'post') {
    const pid = aiMatch[1]
    const proj = projects.find(p => p.id === pid)
    const taskList = tasks[pid] || []
    const done  = taskList.filter(t => t.status === 'done').length
    const total = taskList.length
    const rate  = total ? Math.round((done / total) * 100) : 0
    const overdue = taskList.filter(t => t.is_overdue).length
    return ok({
      summary: `${proj?.name || 'This project'} is at ${rate}% completion with ${total} tasks tracked. ${overdue > 0 ? `⚠️ ${overdue} task(s) are overdue and need immediate attention.` : 'No overdue tasks — great momentum!'} The team has ${done} completed tasks. Recommend a quick sync to unblock any items stuck in review.`,
      generatedAt: new Date().toISOString(),
      stats: { total, completionRate: rate, overdue },
    })
  }

  // ─── HEALTH ────────────────────────────────────────────────────────────────
  if (url === '/health' && method === 'get') {
    return ok({ status: 'ok (mock)', timestamp: new Date(), version: '1.0.0' })
  }

  // Fallback
  fail(`Mock: no handler for ${method.toUpperCase()} ${url}`, 404)
}
