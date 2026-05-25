import { Link } from 'react-router-dom'
import { Folder, FolderOpen } from 'lucide-react'

const folderColors = ['#6366f1', '#f59e0b', '#10b981', '#ec4899', '#3b82f6', '#8b5cf6']

export default function ProjectsCard({ projects = [] }) {
  const shown = projects.slice(0, 3)

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-700">Documents</p>
        <Link to="/projects" className="text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors">
          Show all
        </Link>
      </div>

      {shown.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-4">No projects yet</p>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {shown.map((proj, i) => {
            const color = folderColors[i % folderColors.length]
            const pct = proj.task_count > 0
              ? Math.round((Number(proj.done_count) / Number(proj.task_count)) * 100)
              : 0
            return (
              <Link
                key={proj.id}
                to={`/projects/${proj.id}`}
                className="group flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors text-center"
              >
                {/* Folder icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: `${color}18` }}
                >
                  <FolderOpen className="w-6 h-6" style={{ color }} />
                </div>
                <p className="text-xs font-semibold text-gray-700 leading-tight line-clamp-2 group-hover:text-gray-900">
                  {proj.name}
                </p>
                <p className="text-[10px] text-gray-400">{pct}% done</p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
