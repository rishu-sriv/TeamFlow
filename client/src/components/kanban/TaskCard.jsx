import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, AlertTriangle } from 'lucide-react'
import PriorityBadge from '../shared/PriorityBadge'
import Avatar from '../shared/Avatar'
import { formatDate } from '../../lib/utils'

export default function TaskCard({ task, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`bg-white dark:bg-slate-800 rounded-xl p-3.5 shadow-sm cursor-pointer hover:shadow-md transition-all select-none ${
        task.is_overdue ? 'ring-2 ring-red-400 dark:ring-red-600' : 'border border-slate-100 dark:border-slate-700'
      } ${isDragging ? 'shadow-2xl rotate-2 z-50' : ''}`}
    >
      {task.is_overdue && (
        <div className="flex items-center gap-1 text-red-500 dark:text-red-400 text-xs font-medium mb-2">
          <AlertTriangle className="w-3 h-3" />
          Overdue
        </div>
      )}

      <p className="text-sm font-medium text-slate-800 dark:text-white line-clamp-2 mb-2.5">{task.title}</p>

      <div className="flex items-center justify-between">
        <PriorityBadge priority={task.priority} />
        {task.assignee_id && (
          <Avatar
            name={task.assignee_name || '?'}
            color={task.assignee_avatar_color || '#6366f1'}
            size="xs"
          />
        )}
      </div>

      {task.due_date && (
        <div className={`flex items-center gap-1 mt-2 text-xs ${task.is_overdue ? 'text-red-500 dark:text-red-400' : 'text-slate-400 dark:text-slate-500'}`}>
          <Calendar className="w-3 h-3" />
          {formatDate(task.due_date)}
        </div>
      )}
    </div>
  )
}
