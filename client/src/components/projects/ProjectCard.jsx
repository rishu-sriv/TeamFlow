import { Link } from 'react-router-dom'
import { Users, CheckSquare, ArrowRight } from 'lucide-react'
import RoleBadge from '../shared/RoleBadge'

export default function ProjectCard({ project }) {
  const completion = project.task_count > 0
    ? Math.round((project.done_count / project.task_count) * 100)
    : 0

  return (
    <Link
      to={`/projects/${project.id}`}
      className="block bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 hover:shadow-lg hover:-translate-y-0.5 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-sm">
          {project.name.slice(0, 2).toUpperCase()}
        </div>
        <RoleBadge role={project.user_role} />
      </div>

      <h3 className="font-semibold text-slate-800 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
        {project.name}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 min-h-[2.5rem]">
        {project.description || 'No description provided'}
      </p>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
          <span>Progress</span>
          <span className="font-medium text-slate-700 dark:text-slate-300">{completion}%</span>
        </div>
        <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-violet-500 rounded-full transition-all duration-500"
            style={{ width: `${completion}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {project.member_count}
          </span>
          <span className="flex items-center gap-1">
            <CheckSquare className="w-3.5 h-3.5" />
            {project.done_count}/{project.task_count}
          </span>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-primary-500 transition-colors" />
      </div>
    </Link>
  )
}
