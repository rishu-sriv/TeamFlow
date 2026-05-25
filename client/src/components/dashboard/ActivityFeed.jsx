import { timeAgo, formatAction } from '../../lib/utils'
import Avatar from '../shared/Avatar'
import { Activity } from 'lucide-react'

export default function ActivityFeed({ activities = [] }) {
  if (activities.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
        <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-4">Recent Activity</h3>
        <div className="flex items-center justify-center h-32 text-slate-400 dark:text-slate-500 text-sm">
          No activity yet
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
      <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((a) => (
          <div key={a.id} className="flex items-start gap-3">
            <Avatar
              name={a.user_name || 'Unknown'}
              color={a.avatar_color || '#6366f1'}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-700 dark:text-slate-200">
                <span className="font-medium">{a.user_name || 'Someone'}</span>{' '}
                {formatAction(a.action, a.metadata || {})}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-slate-400 dark:text-slate-500">{timeAgo(a.created_at)}</span>
                {a.project_name && (
                  <>
                    <span className="text-xs text-slate-300 dark:text-slate-600">·</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 truncate">{a.project_name}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
