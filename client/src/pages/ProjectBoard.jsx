import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Plus, Users, Activity, Sparkles, Filter, ChevronLeft, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { useTaskStore } from '../store/taskStore'
import { useProjectStore } from '../store/projectStore'
import { useAuthStore } from '../store/authStore'
import KanbanBoard from '../components/kanban/KanbanBoard'
import TaskModal from '../components/tasks/TaskModal'
import AISummaryPanel from '../components/ai/AISummaryPanel'
import ConfirmModal from '../components/shared/ConfirmModal'

function CreateTaskModal({ projectId, members, onClose, onCreated }) {
  const { user } = useAuthStore()
  const [form, setForm] = useState({ title: '', description: '', assignee_id: '', priority: 'medium', due_date: '', status: 'todo' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return toast.error('Task title is required')
    setLoading(true)
    try {
      const payload = {
        title: form.title,
        description: form.description || undefined,
        assignee_id: form.assignee_id || undefined,
        priority: form.priority,
        due_date: form.due_date || undefined,
      }
      const res = await api.post(`/tasks/project/${projectId}`, payload)
      toast.success('Task created!')
      onCreated(res.data.task)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-jet-elevated rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-5">New Task</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Title *</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="What needs to be done?"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-jet-border bg-slate-50 dark:bg-jet-card text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Add details..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-jet-border bg-slate-50 dark:bg-jet-card text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-jet-border bg-slate-50 dark:bg-jet-card text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Assignee</label>
              <select
                value={form.assignee_id}
                onChange={(e) => setForm({ ...form, assignee_id: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-jet-border bg-slate-50 dark:bg-jet-card text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.user_id} value={m.user_id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Due Date</label>
            <input
              type="date"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-jet-border bg-slate-50 dark:bg-jet-card text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-jet-border text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-sm transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ProjectBoard() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { setTasks, addTask, tasks, filters, setFilters, clearFilters } = useTaskStore()
  const { currentProject, setCurrentProject, members, setMembers } = useProjectStore()

  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState(null)
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const [showDeleteProject, setShowDeleteProject] = useState(false)
  const [deletingProject, setDeletingProject] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [projRes, tasksRes] = await Promise.all([
          api.get(`/projects/${id}`),
          api.get(`/tasks/project/${id}`),
        ])
        setCurrentProject(projRes.data.project)
        setMembers(projRes.data.members || [])
        setTasks(tasksRes.data.tasks || [])
      } catch (err) {
        toast.error('Failed to load project')
        navigate('/projects')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    return () => { clearFilters() }
  }, [id])

  const projectRole = currentProject?.user_role || 'member'
  const isAdmin = projectRole === 'admin'

  const filteredTasks = tasks.filter((t) => {
    if (filters.priority && t.priority !== filters.priority) return false
    if (filters.assignee_id && t.assignee_id !== filters.assignee_id) return false
    return true
  })

  const handleDeleteProject = async () => {
    setDeletingProject(true)
    try {
      await api.delete(`/projects/${id}`)
      toast.success('Project deleted')
      navigate('/projects')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete project')
      setDeletingProject(false)
      setShowDeleteProject(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-64 mb-2" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-96 mb-8" />
          <div className="flex gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-72 h-96 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-slate-200 dark:border-jet-border bg-white dark:bg-jet-card">
        <div className="flex items-center gap-2 mb-3">
          <Link to="/projects" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">{currentProject?.name}</h1>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Priority filter */}
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ priority: e.target.value })}
              className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-jet-border bg-white dark:bg-jet-elevated text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Assignee filter */}
            <select
              value={filters.assignee_id}
              onChange={(e) => setFilters({ assignee_id: e.target.value })}
              className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-jet-border bg-white dark:bg-jet-elevated text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="">All Assignees</option>
              {members.map((m) => (
                <option key={m.user_id} value={m.user_id}>{m.name}</option>
              ))}
            </select>

            {(filters.priority || filters.assignee_id) && (
              <button onClick={clearFilters} className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
                Clear filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/projects/${id}/members`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-jet-border text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-jet-elevated text-xs font-medium transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              Members
            </Link>
            <Link
              to={`/projects/${id}/activity`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-jet-border text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-jet-elevated text-xs font-medium transition-colors"
            >
              <Activity className="w-3.5 h-3.5" />
              Activity
            </Link>
            <button
              onClick={() => setShowAI(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800 hover:bg-violet-100 dark:hover:bg-violet-900/50 text-xs font-medium transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Summary
            </button>
            {isAdmin && (
              <button
                onClick={() => setShowCreateTask(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                New Task
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => setShowDeleteProject(true)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="Delete project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-x-auto p-6">
        <KanbanBoard
          tasks={filteredTasks}
          onTaskClick={(task) => setSelectedTask(task)}
          projectRole={projectRole}
        />
      </div>

      {/* Modals */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          projectRole={projectRole}
          members={members}
          onClose={() => setSelectedTask(null)}
          onDeleted={() => setSelectedTask(null)}
        />
      )}

      {showCreateTask && (
        <CreateTaskModal
          projectId={id}
          members={members}
          onClose={() => setShowCreateTask(false)}
          onCreated={(task) => addTask(task)}
        />
      )}

      <AISummaryPanel projectId={id} isOpen={showAI} onClose={() => setShowAI(false)} />

      <ConfirmModal
        isOpen={showDeleteProject}
        onClose={() => setShowDeleteProject(false)}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        message={`Are you sure you want to delete "${currentProject?.name}"? All tasks and data will be permanently lost.`}
        confirmLabel="Delete Project"
        loading={deletingProject}
      />
    </div>
  )
}
