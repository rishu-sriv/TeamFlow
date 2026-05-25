import { Link } from 'react-router-dom'
import InfoTooltip from '../shared/InfoTooltip'

const barColors = ['bg-accent-400', 'bg-blue-400', 'bg-purple-400', 'bg-orange-400']

export default function GoalsTracker({ projects = [] }) {
  const goals = projects.map((p, i) => ({
    id: p.id,
    label: p.name,
    pct: p.task_count > 0
      ? Math.round((Number(p.done_count) / Number(p.task_count)) * 100)
      : 0,
    color: barColors[i % barColors.length],
  }))

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-bold text-gray-900">Goals tracker</p>
          <InfoTooltip text="Each bar shows how many tasks are done vs total tasks in that project. Click a project to open its board." />
        </div>
        <Link to="/projects" className="text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors">
          Show all
        </Link>
      </div>

      {goals.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-4">No projects yet</p>
      ) : (
        <div className="space-y-4">
          {goals.map(goal => (
            <Link key={goal.id} to={`/projects/${goal.id}`} className="block group">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-medium text-gray-700 truncate max-w-[75%] group-hover:text-gray-900 transition-colors">
                  {goal.label}
                </p>
                <span className="text-xs font-bold text-gray-600">{goal.pct}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${goal.color} rounded-full transition-all duration-700`}
                  style={{ width: `${goal.pct}%` }}
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
