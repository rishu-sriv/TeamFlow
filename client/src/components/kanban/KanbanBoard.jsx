import { useState } from 'react'
import { DndContext, closestCorners, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import toast from 'react-hot-toast'
import api from '../../lib/api'
import { useTaskStore } from '../../store/taskStore'
import KanbanColumn from './KanbanColumn'
import TaskCard from './TaskCard'

const STATUSES = ['todo', 'in_progress', 'review', 'done']

export default function KanbanBoard({ onTaskClick }) {
  const { tasks, updateTask } = useTaskStore()
  const [activeTask, setActiveTask] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const getTasksByStatus = (status) => tasks.filter((t) => t.status === status)

  const handleDragStart = (event) => {
    const task = tasks.find((t) => t.id === event.active.id)
    setActiveTask(task || null)
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeTask = tasks.find((t) => t.id === active.id)
    if (!activeTask) return

    // Determine target status
    let targetStatus = over.id
    if (!STATUSES.includes(targetStatus)) {
      const overTask = tasks.find((t) => t.id === over.id)
      if (overTask) targetStatus = overTask.status
    }

    if (!STATUSES.includes(targetStatus) || activeTask.status === targetStatus) return

    // Optimistically update
    updateTask({ ...activeTask, status: targetStatus })

    try {
      const res = await api.patch(`/tasks/${activeTask.id}/status`, { status: targetStatus })
      updateTask(res.data.task)
      toast.success(`Moved to ${targetStatus.replace('_', ' ')}`)
    } catch (err) {
      // Revert
      updateTask(activeTask)
      toast.error('Failed to update task status')
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 pb-4 min-w-min">
        {STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={getTasksByStatus(status)}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="rotate-3 shadow-2xl">
            <TaskCard task={activeTask} onClick={() => {}} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
