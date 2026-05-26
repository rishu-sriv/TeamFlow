import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, AlertTriangle, UserCircle2 } from 'lucide-react'
import PriorityBadge from '../shared/PriorityBadge'
import { formatDate, getInitials } from '../../lib/utils'

function UserPill({ name, color, prefix }) {
  if (!name) return null
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <span className="text-[10px] text-slate-400 dark:text-slate-500 flex-shrink-0">{prefix}</span>
      <div
        className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0 shadow-sm"
        style={{ backgroundColor: color || '#6366f1' }}
      >
        {getInitials(name).slice(0, 1)}
      </div>
      <span className="text-[11px] text-slate-600 dark:text-slate-300 truncate font-medium">
        {name.split(' ')[0]}
      </span>
    </div>
  )
}

export default function TaskCard({ task, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const showCreatedBy = task.created_by_name && task.created_by_name !== task.assignee_name

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`bg-white dark:bg-jet-elevated rounded-xl p-3.5 cursor-pointer transition-all select-none group ${
        task.is_overdue
          ? 'border-l-4 border-l-red-400 border border-red-100 dark:border-red-900 shadow-sm hover:shadow-md'
          : 'border border-slate-100 dark:border-jet-border shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-slate-600'
      } ${isDragging ? 'shadow-2xl rotate-2 z-50 scale-105' : ''}`}
    >
      {/* Overdue banner */}
      {task.is_overdue && (
        <div className="flex items-center gap-1 text-red-500 text-[11px] font-semibold mb-2">
          <AlertTriangle className="w-3 h-3" />
          Overdue
        </div>
      )}

      {/* Title */}
      <p className="text-sm font-semibold text-slate-800 dark:text-white line-clamp-2 mb-2.5 leading-snug">
        {task.title}
      </p>

      {/* Priority + Due date row */}
      <div className="flex items-center justify-between mb-2.5">
        <PriorityBadge priority={task.priority} />
        {task.due_date && (
          <div className={`flex items-center gap-1 text-[11px] font-medium ${
            task.is_overdue ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'
          }`}>
            <Calendar className="w-3 h-3" />
            {formatDate(task.due_date)}
          </div>
        )}
      </div>

      {/* Assignee + Created by */}
      <div className="border-t border-slate-100 dark:border-jet-border pt-2 space-y-1.5">
        {task.assignee_name ? (
          <UserPill name={task.assignee_name} color={task.assignee_avatar_color} prefix="To:" />
        ) : (
          <div className="flex items-center gap-1.5">
            <UserCircle2 className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
            <span className="text-[10px] text-slate-300 dark:text-slate-600 italic">Unassigned</span>
          </div>
        )}
        {showCreatedBy && (
          <UserPill name={task.created_by_name} color="#94a3b8" prefix="By:" />
        )}
      </div>
    </div>
  )
}
