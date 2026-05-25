import { AlertTriangle, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDate } from '../../lib/utils'

export default function OverdueAlert({ tasks = [] }) {
  if (tasks.length === 0) return null

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 bg-red-100 dark:bg-red-900/40 rounded-xl flex items-center justify-center">
          <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">
            {tasks.length} Overdue Task{tasks.length !== 1 ? 's' : ''}
          </h3>
          <p className="text-xs text-red-600 dark:text-red-400">Requires immediate attention</p>
        </div>
      </div>
      <div className="space-y-2">
        {tasks.slice(0, 3).map((task) => (
          <div key={task.id} className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-white line-clamp-1">{task.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {task.project_name} · Due {formatDate(task.due_date)}
              </p>
            </div>
          </div>
        ))}
        {tasks.length > 3 && (
          <p className="text-xs text-red-600 dark:text-red-400 text-center pt-1">
            +{tasks.length - 3} more overdue tasks
          </p>
        )}
      </div>
    </div>
  )
}
