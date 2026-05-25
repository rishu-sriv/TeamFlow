import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ChevronLeft,
  Plus,
  ArrowRight,
  Edit2,
  Trash2,
  UserPlus,
  UserMinus,
  Shield,
  Settings,
  FolderPlus,
  ActivitySquare,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { useProjectStore } from '../store/projectStore'
import EmptyState from '../components/shared/EmptyState'

const actionConfig = {
  task_created:        { icon: Plus,        color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
  task_status_changed: { icon: ArrowRight,  color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
  task_updated:        { icon: Edit2,       color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' },
  task_deleted:        { icon: Trash2,      color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
  member_added:        { icon: UserPlus,    color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400' },
  member_removed:      { icon: UserMinus,   color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
  member_role_changed: { icon: Shield,      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
  project_updated:     { icon: Settings,    color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  project_created:     { icon: FolderPlus,  color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
}

function getActionText(entry) {
  const name = entry.user_name || 'Someone'
  const meta = entry.metadata || {}
  switch (entry.action) {
    case 'task_created':
      return `${name} created task "${meta.title || 'Untitled'}"`
    case 'task_status_changed':
      return `${name} moved a task to ${meta.to || 'a new status'}`
    case 'task_updated':
      return `${name} updated task "${meta.title || 'a task'}"`
    case 'task_deleted':
      return `${name} deleted task "${meta.title || 'a task'}"`
    case 'member_added':
      return `${name} added ${meta.userName || 'a user'} to the project`
    case 'member_removed':
      return `${name} removed ${meta.userName || 'a user'} from the project`
    case 'member_role_changed':
      return `${name} changed ${meta.userName || "a member"}'s role to ${meta.role || 'a new role'}`
    case 'project_updated':
      return `${name} updated project settings`
    case 'project_created':
      return `${name} created this project`
    default:
      return `${name} performed ${entry.action}`
  }
}

function formatGroupLabel(dateStr) {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const date = new Date(dateStr)
  const todayStr = today.toDateString()
  const yesterdayStr = yesterday.toDateString()
  const dateStrFmt = date.toDateString()

  if (dateStrFmt === todayStr) return 'Today'
  if (dateStrFmt === yesterdayStr) return 'Yesterday'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function groupByDate(entries) {
  const groups = {}
  for (const entry of entries) {
    const date = new Date(entry.created_at).toDateString()
    if (!groups[date]) groups[date] = []
    groups[date].push(entry)
  }
  return groups
}

export default function ActivityLog() {
  const { id } = useParams()
  const { currentProject } = useProjectStore()
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await api.get(`/projects/${id}/activity`)
        setActivity(res.data.activity || [])
      } catch (err) {
        toast.error('Failed to load activity')
      } finally {
        setLoading(false)
      }
    }
    fetchActivity()
  }, [id])

  const grouped = groupByDate(activity)
  const dateKeys = Object.keys(grouped)

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-2" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-64 mb-8" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          to={`/projects/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors mb-3"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to board
        </Link>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Activity</h1>
        {currentProject && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{currentProject.name}</p>
        )}
      </div>

      {/* Empty state */}
      {activity.length === 0 && (
        <EmptyState
          icon={ActivitySquare}
          title="No activity yet"
          description="Actions taken in this project will show up here."
        />
      )}

      {/* Timeline */}
      {dateKeys.map((dateKey) => (
        <div key={dateKey} className="mb-8">
          {/* Date group label */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {formatGroupLabel(dateKey)}
            </span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
          </div>

          {/* Entries */}
          <div className="space-y-3">
            {grouped[dateKey].map((entry) => {
              const config = actionConfig[entry.action] || {
                icon: Settings,
                color: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
              }
              const IconComponent = config.icon

              return (
                <div key={entry.id} className="flex items-start gap-3">
                  {/* Icon circle */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${config.color}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex items-start justify-between gap-4 pt-1.5">
                    <p className="text-sm text-slate-700 dark:text-slate-200 leading-snug">
                      {getActionText(entry)}
                    </p>
                    <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap flex-shrink-0">
                      {new Date(entry.created_at).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
