import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import TaskCard from './TaskCard'
import { statusConfig } from '../../lib/utils'

export default function KanbanColumn({ status, tasks, onTaskClick }) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const config = statusConfig[status]

  return (
    <div className="flex-none w-72 md:w-80 flex flex-col">
      <div className="flex items-center gap-2.5 mb-3 px-1">
        <span className={`w-2 h-2 rounded-full ${config.dot}`} />
        <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-200">{config.label}</h3>
        <span className="ml-auto bg-slate-100 dark:bg-jet-elevated text-slate-500 dark:text-slate-400 text-xs font-medium px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 min-h-[200px] rounded-2xl p-2 space-y-2 transition-colors ${
          isOver
            ? 'bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-300 dark:ring-primary-700'
            : 'bg-slate-100 dark:bg-jet-card/60'
        }`}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-20 text-xs text-slate-400 dark:text-slate-600">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  )
}
