export const timeAgo = (dateStr) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now - date) / 1000)

  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`
  return date.toLocaleDateString()
}

export const formatDate = (dateStr) => {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export const getInitials = (name = '') => {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export const priorityConfig = {
  low: { label: 'Low', color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800', dot: 'bg-slate-400' },
  medium: { label: 'Medium', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30', dot: 'bg-blue-400' },
  high: { label: 'High', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/30', dot: 'bg-orange-400' },
  critical: { label: 'Critical', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/30', dot: 'bg-red-500' },
}

export const statusConfig = {
  todo: { label: 'Todo', color: 'text-slate-600', bg: 'bg-slate-100 dark:bg-slate-800', dot: 'bg-slate-400' },
  in_progress: { label: 'In Progress', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30', dot: 'bg-blue-500' },
  review: { label: 'Review', color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/30', dot: 'bg-violet-500' },
  done: { label: 'Done', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/30', dot: 'bg-emerald-500' },
}

export const formatAction = (action, metadata = {}) => {
  const actions = {
    project_created: `Created project "${metadata.name || ''}"`,
    project_updated: 'Updated project details',
    task_created: `Created task "${metadata.title || ''}"`,
    task_updated: `Updated task fields: ${(metadata.fields || []).join(', ')}`,
    task_deleted: `Deleted task "${metadata.title || ''}"`,
    task_status_changed: `Moved task "${metadata.title || ''}" from ${metadata.from || ''} to ${metadata.to || ''}`,
    member_added: `Added ${metadata.userName || 'a user'} to the project`,
    member_removed: 'Removed a member from the project',
    member_role_changed: `Changed member role to ${metadata.role || ''}`,
  }
  return actions[action] || action.replace(/_/g, ' ')
}

export const cn = (...classes) => classes.filter(Boolean).join(' ')
