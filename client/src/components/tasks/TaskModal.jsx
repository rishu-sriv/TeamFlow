import { useState, useEffect } from 'react'
import { X, Trash2, Clock, User, Tag, Calendar, History, Edit3, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/api'
import { useTaskStore } from '../../store/taskStore'
import { useAuthStore } from '../../store/authStore'
import { formatDate, timeAgo, statusConfig, priorityConfig } from '../../lib/utils'
import PriorityBadge from '../shared/PriorityBadge'
import StatusBadge from '../shared/StatusBadge'
import Avatar from '../shared/Avatar'
import ConfirmModal from '../shared/ConfirmModal'

const STATUSES = ['todo', 'in_progress', 'review', 'done']
const PRIORITIES = ['low', 'medium', 'high', 'critical']

export default function TaskModal({ task: initialTask, projectRole, members = [], onClose, onDeleted }) {
  const { updateTask, removeTask, setTaskHistory, taskHistory } = useTaskStore()
  const { user } = useAuthStore()
  const [task, setTask] = useState(initialTask)
  const [activeTab, setActiveTab] = useState('details')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    title: initialTask.title,
    description: initialTask.description || '',
    assignee_id: initialTask.assignee_id || '',
    priority: initialTask.priority,
    due_date: initialTask.due_date ? initialTask.due_date.split('T')[0] : '',
    status: initialTask.status,
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)

  const isAdmin = projectRole === 'admin'

  useEffect(() => {
    if (activeTab === 'history') fetchHistory()
  }, [activeTab])

  const fetchHistory = async () => {
    setHistoryLoading(true)
    try {
      const res = await api.get(`/tasks/${task.id}/history`)
      setTaskHistory(res.data.history)
    } catch {
      toast.error('Failed to load history')
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = isAdmin
        ? { ...form, assignee_id: form.assignee_id || null, due_date: form.due_date || null }
        : { status: form.status }

      const res = await api.put(`/tasks/${task.id}`, payload)
      setTask(res.data.task)
      updateTask(res.data.task)
      setEditing(false)
      toast.success('Task updated')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update task')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/tasks/${task.id}`)
      removeTask(task.id)
      toast.success('Task deleted')
      onDeleted?.()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete task')
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
              {task.is_overdue && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                  Overdue
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <button
                  onClick={() => setEditing(!editing)}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                  title="Edit task"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-100 dark:border-slate-700 px-6">
            {['details', 'history'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-1 mr-6 text-sm font-medium border-b-2 transition-colors capitalize ${
                  activeTab === tab
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {tab === 'history' ? 'History' : 'Details'}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'details' && (
              <div className="space-y-5">
                {editing ? (
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full text-xl font-bold text-slate-800 dark:text-white bg-transparent border-b-2 border-primary-300 focus:outline-none pb-1"
                    disabled={!isAdmin}
                  />
                ) : (
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">{task.title}</h2>
                )}

                {/* Status (always editable) */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 block">Status</label>
                  <div className="flex flex-wrap gap-2">
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        onClick={() => setForm({ ...form, status: s })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                          form.status === s
                            ? `${statusConfig[s].bg} ${statusConfig[s].color} ring-2 ring-offset-1 ring-current`
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                      >
                        {statusConfig[s].label}
                      </button>
                    ))}
                  </div>
                </div>

                {isAdmin && (
                  <>
                    {/* Priority */}
                    <div>
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 block">Priority</label>
                      <div className="flex flex-wrap gap-2">
                        {PRIORITIES.map((p) => (
                          <button
                            key={p}
                            onClick={() => editing && setForm({ ...form, priority: p })}
                            disabled={!editing}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all disabled:cursor-default ${
                              form.priority === p
                                ? `${priorityConfig[p].bg} ${priorityConfig[p].color} ring-2 ring-offset-1 ring-current`
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                            } ${editing ? 'hover:bg-slate-200 dark:hover:bg-slate-600 cursor-pointer' : ''}`}
                          >
                            {priorityConfig[p].label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Assignee */}
                    <div>
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 block">Assignee</label>
                      {editing ? (
                        <select
                          value={form.assignee_id}
                          onChange={(e) => setForm({ ...form, assignee_id: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="">Unassigned</option>
                          {members.map((m) => (
                            <option key={m.user_id} value={m.user_id}>{m.name}</option>
                          ))}
                        </select>
                      ) : task.assignee_id ? (
                        <div className="flex items-center gap-2">
                          <Avatar name={task.assignee_name} color={task.assignee_avatar_color} size="sm" />
                          <span className="text-sm text-slate-700 dark:text-slate-200">{task.assignee_name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">Unassigned</span>
                      )}
                    </div>

                    {/* Due date */}
                    <div>
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 block">Due Date</label>
                      {editing ? (
                        <input
                          type="date"
                          value={form.due_date}
                          onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      ) : task.due_date ? (
                        <span className={`text-sm ${task.is_overdue ? 'text-red-500' : 'text-slate-700 dark:text-slate-200'}`}>
                          {formatDate(task.due_date)}
                        </span>
                      ) : (
                        <span className="text-sm text-slate-400">No due date</span>
                      )}
                    </div>
                  </>
                )}

                {/* Description */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 block">Description</label>
                  {editing && isAdmin ? (
                    <textarea
                      rows={4}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                  ) : (
                    <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                      {task.description || 'No description'}
                    </p>
                  )}
                </div>

                <div className="text-xs text-slate-400 dark:text-slate-500 space-y-1 pt-2 border-t border-slate-100 dark:border-slate-700">
                  {task.created_by_name && <p>Created by {task.created_by_name}</p>}
                  <p>Last updated {timeAgo(task.updated_at)}</p>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                {historyLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse flex gap-3">
                        <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : taskHistory.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">No history yet</p>
                ) : (
                  <div className="space-y-3">
                    {taskHistory.map((h) => (
                      <div key={h.id} className="flex items-start gap-3 bg-slate-50 dark:bg-slate-900 rounded-xl p-3">
                        <Avatar name={h.changed_by_name || '?'} color={h.changed_by_avatar_color || '#6366f1'} size="xs" />
                        <div>
                          <p className="text-sm text-slate-700 dark:text-slate-200">
                            <span className="font-medium">{h.changed_by_name}</span> changed{' '}
                            <span className="font-medium">{h.field}</span>
                            {h.old_value && <> from <span className="text-slate-500">"{h.old_value}"</span></>}
                            {h.new_value && <> to <span className="text-primary-600 dark:text-primary-400">"{h.new_value}"</span></>}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{timeAgo(h.changed_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer with save button */}
          {(editing || activeTab === 'details') && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
              {editing ? (
                <>
                  <button
                    onClick={() => { setEditing(false); setForm({ title: task.title, description: task.description || '', assignee_id: task.assignee_id || '', priority: task.priority, due_date: task.due_date ? task.due_date.split('T')[0] : '', status: task.status }) }}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-60"
                  >
                    {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                    Save Changes
                  </button>
                </>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={saving || form.status === task.status}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium text-sm transition-colors disabled:opacity-60"
                >
                  {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                  Update Status
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        confirmLabel="Delete Task"
        loading={deleting}
      />
    </>
  )
}
