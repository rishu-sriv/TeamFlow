import { useEffect, useState } from 'react'
import { Plus, FolderKanban, X } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { useProjectStore } from '../store/projectStore'
import ProjectCard from '../components/projects/ProjectCard'
import SkeletonLoader from '../components/shared/SkeletonLoader'
import EmptyState from '../components/shared/EmptyState'

function CreateProjectModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', description: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Project name is required')
    setLoading(true)
    try {
      const res = await api.post('/projects', form)
      toast.success('Project created!')
      onCreated(res.data.project)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">New Project</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Project Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Product Launch Q2"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What's this project about?"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Projects() {
  const { projects, setProjects, addProject, loading, setLoading } = useProjectStore()
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true)
      try {
        const res = await api.get('/projects')
        setProjects(res.data.projects)
      } catch {
        toast.error('Failed to load projects')
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Projects</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {projects.length} project{projects.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {loading ? (
        <SkeletonLoader count={6} type="card" />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create your first project to start organizing tasks with your team."
          action={
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Project
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {showModal && (
        <CreateProjectModal
          onClose={() => setShowModal(false)}
          onCreated={addProject}
        />
      )}
    </div>
  )
}
