import { useEffect, useState } from 'react'
import { Bell, Moon, Sun, Sparkles, X, RefreshCw, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { useAuthStore } from '../store/authStore'
import ProfileCard    from '../components/dashboard/ProfileCard'
import MiniStatCard   from '../components/dashboard/MiniStatCard'
import WeeklyActivity from '../components/dashboard/WeeklyActivity'
import ProjectsCard   from '../components/dashboard/ProjectsCard'
import TaskTracker    from '../components/dashboard/TaskTracker'
import GoalsTracker   from '../components/dashboard/GoalsTracker'

const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const formatDay = () => {
  const d = new Date()
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

function Pulse({ className }) {
  return <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [dark, setDark]         = useState(() => document.documentElement.classList.contains('dark'))
  const [loading, setLoading]   = useState(true)
  const [stats, setStats]       = useState({})
  const [aiOpen, setAiOpen]     = useState(false)
  const [aiState, setAiState]   = useState('idle') // idle | loading | result | error
  const [aiData, setAiData]     = useState(null)
  const [projects, setProjects] = useState([])
  const [allTasks, setAllTasks] = useState([])
  const [members, setMembers]   = useState([])
  const [firstProject, setFirst]= useState(null)

  const firstName      = user?.name?.split(' ')[0] || 'there'
  // Personal task stats (tasks assigned to me)
  const myDone         = stats?.myDone ?? 0
  const myTotal        = stats?.myTotal ?? 0
  const myRate         = myTotal > 0 ? Math.round((myDone / myTotal) * 100) : 0
  // Team completion rate (all project tasks) — for profile ring
  const teamDone       = stats?.byStatus?.done || 0
  const teamTotal      = stats?.total || 0
  const completionRate = teamTotal > 0 ? Math.round((teamDone / teamTotal) * 100) : 0

  // Attention: overdue & upcoming tasks assigned to me
  const todayMidnight = (() => { const d = new Date(); d.setHours(0,0,0,0); return d })()
  const in3Days = new Date(todayMidnight); in3Days.setDate(todayMidnight.getDate() + 3)
  const myOverdue  = allTasks.filter(t =>
    t.assignee_id === user?.id && t.is_overdue && t.status !== 'done'
  )
  const myUpcoming = allTasks.filter(t => {
    if (t.assignee_id !== user?.id || t.is_overdue || t.status === 'done' || !t.due_date) return false
    const due = new Date(t.due_date); due.setHours(0,0,0,0)
    return due >= todayMidnight && due <= in3Days
  })

  useEffect(() => {
    const load = async () => {
      try {
        const [dashRes, projRes] = await Promise.all([
          api.get('/dashboard'),
          api.get('/projects'),
        ])

        setStats(dashRes.data.stats || {})

        // API returns { projects: [...] }
        const projs = projRes.data.projects || []
        setProjects(projs)

        if (projs.length > 0) {
          const first = projs[0]
          setFirst(first)

          // Fetch tasks from ALL projects independently (don't let one failure block others)
          const taskSettled = await Promise.allSettled(
            projs.map(p => api.get(`/tasks/project/${p.id}`))
          )
          const allFetched = taskSettled
            .filter(r => r.status === 'fulfilled')
            .flatMap(r => r.value.data.tasks || [])
          const seen = new Set()
          const merged = allFetched.filter(t => { if (seen.has(t.id)) return false; seen.add(t.id); return true })
          setAllTasks(merged)

          // Load first project members separately — failure here won't affect tasks
          try {
            const projDetailRes = await api.get(`/projects/${first.id}`)
            setMembers(projDetailRes.data.members || [])
          } catch {}
        }
      } catch (err) {
        if (err.response?.status !== 401) {
          toast.error('Failed to load dashboard')
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const toggleDark = () => {
    document.documentElement.classList.toggle('dark')
    const isDark = document.documentElement.classList.contains('dark')
    localStorage.setItem('teamflow-theme', isDark ? 'dark' : 'light')
    setDark(isDark)
  }

  const generateAI = async () => {
    setAiState('loading')
    setAiData(null)
    try {
      const res = await api.post('/ai/dashboard/summarize')
      setAiData(res.data)
      setAiState('result')
    } catch (err) {
      const msg = err.response?.data?.error || 'Something went wrong.'
      setAiData({ error: msg })
      setAiState('error')
    }
  }

  const openAI = () => { setAiOpen(true); if (aiState === 'idle') generateAI() }

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div><Pulse className="h-7 w-48 mb-2" /><Pulse className="h-4 w-32" /></div>
          <Pulse className="h-10 w-64 hidden md:block" />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5">
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-5">
              <Pulse className="h-64" />
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4"><Pulse className="h-28" /><Pulse className="h-28" /></div>
                <Pulse className="h-36" />
              </div>
            </div>
            <Pulse className="h-28" />
            <Pulse className="h-36" />
          </div>
          <div className="space-y-5"><Pulse className="h-72" /><Pulse className="h-48" /></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-5 lg:p-8 max-w-[1400px] mx-auto">

      {/* Top bar */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome, {firstName}!</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">{formatDay()}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={toggleDark}
            className="w-9 h-9 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center text-gray-500 hover:border-gray-300 transition-colors"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button className="relative w-9 h-9 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center text-gray-500 hover:border-gray-300 transition-colors">
            <Bell className="w-4 h-4" />
            {(stats.overdue || 0) > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* ── Attention banners (always at top) ── */}
      {(myOverdue.length > 0 || myUpcoming.length > 0) && (
        <div className="space-y-2 mb-5">
          {myOverdue.length > 0 && (
            <button
              onClick={() => navigate(`/projects/${myOverdue[0].project_id}`)}
              className="w-full bg-red-50 border border-red-200 rounded-2xl px-5 py-3 flex items-center justify-between hover:bg-red-100 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse flex-shrink-0" />
                <p className="text-sm font-medium text-red-700">
                  {myOverdue.length} overdue task{myOverdue.length !== 1 ? 's' : ''} need your attention
                  {myOverdue.length <= 2 && ': ' + myOverdue.map(t => t.title).join(', ')}
                </p>
              </div>
              <span className="text-xs text-red-400 font-semibold flex-shrink-0 ml-3">Review →</span>
            </button>
          )}
          {myUpcoming.length > 0 && (
            <button
              onClick={() => navigate(`/projects/${myUpcoming[0].project_id}`)}
              className="w-full bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 flex items-center justify-between hover:bg-amber-100 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse flex-shrink-0" />
                <p className="text-sm font-medium text-amber-700">
                  {myUpcoming.length} task{myUpcoming.length !== 1 ? 's' : ''} due in the next 3 days
                  {myUpcoming.length <= 2 && ': ' + myUpcoming.map(t => t.title).join(', ')}
                </p>
              </div>
              <span className="text-xs text-amber-500 font-semibold flex-shrink-0 ml-3">View →</span>
            </button>
          )}
        </div>
      )}

      {/* 2-column grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5">

        {/* LEFT */}
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-5 items-stretch">

            <ProfileCard user={user} myRate={myRate} myDone={myDone} myTotal={myTotal} />

            {/* Stats + chart */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <MiniStatCard
                  label="Projects"
                  value={projects.length}
                  subtext="team completion"
                  percent={completionRate}
                  color={completionRate < 30 ? 'red' : completionRate < 60 ? 'amber' : 'lime'}
                  tooltip="Total projects in your team. Bar shows % of all team tasks marked done."
                />
                <MiniStatCard
                  label="Tasks completed"
                  value={`${myDone}/${myTotal}`}
                  subtext="my completion"
                  percent={myRate}
                  color={myRate < 30 ? 'red' : myRate < 60 ? 'amber' : 'lime'}
                  tooltip="Your personal tasks: how many you've completed out of all tasks assigned to you."
                />
              </div>
              <WeeklyActivity tasks={allTasks} userId={user?.id} />
            </div>
          </div>

          <ProjectsCard projects={projects} />
        </div>

        {/* RIGHT */}
        <div className="space-y-5">
          <TaskTracker tasks={allTasks} />
          <GoalsTracker projects={projects} />
        </div>
      </div>

      {/* ── Floating AI button ── */}
      <button
        onClick={openAI}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all text-sm font-semibold"
      >
        <Sparkles className="w-4 h-4" />
        AI Briefing
      </button>

      {/* ── AI Summary Panel ── */}
      {aiOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => setAiOpen(false)} />
          <div className="fixed top-0 right-0 h-full z-50 w-full sm:w-2/3 bg-white shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-500" />
                <h2 className="text-base font-semibold text-gray-800">AI Briefing</h2>
              </div>
              <button onClick={() => setAiOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {aiState === 'loading' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-violet-600">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <p className="text-sm font-medium">Scanning all your projects…</p>
                  </div>
                  <div className="space-y-2 animate-pulse">
                    {[100, 80, 90, 70, 85, 60].map((w, i) => (
                      <div key={i} className={`h-3 bg-gray-200 rounded-lg`} style={{ width: `${w}%` }} />
                    ))}
                  </div>
                </div>
              )}

              {aiState === 'result' && aiData && (
                <div className="space-y-4">
                  {/* Stats chips */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {aiData.stats?.overdue > 0 && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600">
                        {aiData.stats.overdue} overdue
                      </span>
                    )}
                    {aiData.stats?.upcoming > 0 && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-600">
                        {aiData.stats.upcoming} due this week
                      </span>
                    )}
                    {aiData.stats?.done > 0 && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-600">
                        {aiData.stats.done} completed
                      </span>
                    )}
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
                      {aiData.stats?.total} total tasks
                    </span>
                  </div>

                  {/* Summary text */}
                  <div className="bg-violet-50 border-l-4 border-violet-400 rounded-r-xl p-4">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{aiData.summary}</p>
                  </div>

                  <p className="text-xs text-gray-400">
                    Generated {new Date(aiData.generatedAt).toLocaleString()}
                    {aiData.aiPowered === false && (
                      <span className="ml-2 text-amber-500">(rule-based — Gemini quota exceeded)</span>
                    )}
                  </p>

                  <button
                    onClick={generateAI}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-violet-200 text-violet-600 hover:bg-violet-50 text-sm font-medium transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Regenerate
                  </button>
                </div>
              )}

              {aiState === 'error' && (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-4">
                  <p className="text-gray-700 text-sm font-medium">Unable to generate briefing</p>
                  <p className="text-gray-400 text-xs">{aiData?.error || 'Something went wrong.'}</p>
                  <button onClick={generateAI} className="px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700">
                    Try again
                  </button>
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">Powered by Gemini · Scans all your projects</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
