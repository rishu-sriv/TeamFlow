import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, ChevronRight } from 'lucide-react'
import { getInitials, formatDate } from '../../lib/utils'
import InfoTooltip from '../shared/InfoTooltip'

const TABS = ['All', 'Uncompleted', 'Completed']

const priorityDot = {
  critical: 'bg-red-500',
  high:     'bg-orange-400',
  medium:   'bg-blue-400',
  low:      'bg-gray-300',
}

const badge = {
  critical:    { label: 'Do this first', cls: 'bg-orange-50 text-orange-600 border border-orange-200' },
  in_progress: { label: 'in progress',   cls: 'bg-blue-50   text-blue-600   border border-blue-200'   },
  review:      { label: 'in review',     cls: 'bg-amber-50  text-amber-600  border border-amber-200'  },
}

export default function TaskTracker({ tasks = [] }) {
  const [tab, setTab] = useState('All')

  const filtered = tasks.filter(t => {
    if (tab === 'Completed')   return t.status === 'done'
    if (tab === 'Uncompleted') return t.status !== 'done'
    return true
  }).slice(0, 5)

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-bold text-gray-900">Task tracker</p>
          <InfoTooltip text="All tasks across every project in your team, sorted by priority and deadline." />
        </div>
        <Link to="/projects" className="text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors">
          Show all
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all ${
              tab === t
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">No tasks found</p>
        ) : (
          filtered.map(task => {
            const dot = priorityDot[task.priority] || 'bg-gray-300'
            const b = task.priority === 'critical'
              ? badge.critical
              : badge[task.status]

            return (
              <div key={task.id} className="flex items-start gap-3 group">
                {/* Priority dot */}
                <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${dot}`} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-sm font-medium leading-tight ${task.status === 'done' ? 'line-through text-gray-300' : 'text-gray-800'}`}>
                      {task.title}
                    </p>
                    {b && task.status !== 'done' && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md flex-shrink-0 ${b.cls}`}>
                        {b.label}
                      </span>
                    )}
                    {task.status === 'done' && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-green-50 text-green-600 border border-green-200 flex-shrink-0">
                        done
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[10px] text-gray-400 font-medium">
                      {task.due_date ? (
                        <span className={`flex items-center gap-1 ${task.is_overdue ? 'text-red-400' : ''}`}>
                          <Calendar className="w-2.5 h-2.5" />
                          Deadline: {formatDate(task.due_date)}
                        </span>
                      ) : (
                        'No deadline'
                      )}
                    </span>

                    {task.assignee_name && (
                      <span className="flex items-center gap-1 text-[10px] text-gray-400">
                        <div
                          className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-white text-[7px] font-bold flex-shrink-0"
                          style={{ backgroundColor: task.assignee_avatar_color || '#6366f1' }}
                        >
                          {getInitials(task.assignee_name).slice(0, 1)}
                        </div>
                        {task.assignee_name.split(' ')[0]}
                      </span>
                    )}
                  </div>
                </div>

                <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
