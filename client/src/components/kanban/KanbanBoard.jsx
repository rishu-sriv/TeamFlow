import { useState } from 'react'
import { DndContext, closestCorners, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import toast from 'react-hot-toast'
import api from '../../lib/api'
import { useTaskStore } from '../../store/taskStore'
import { useAuthStore } from '../../store/authStore'
import KanbanColumn from './KanbanColumn'
import TaskCard from './TaskCard'

const STATUSES = ['todo', 'in_progress', 'review', 'done']

export default function KanbanBoard({ tasks = [], onTaskClick, projectRole = 'member' }) {
  const { updateTask } = useTaskStore()
  const { user } = useAuthStore()
  const [activeTask, setActiveTask] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const getTasksByStatus = (status) => tasks.filter((t) => t.status === status)

  const handleDragStart = (event) => {
    const task = tasks.find((t) => t.id === event.active.id)
    if (!task) return

    // Permission check: members can only drag their own tasks
    const isAdmin = projectRole === 'admin'
    const isOwner = task.assignee_id === user?.id

    if (!isAdmin && !isOwner) {
      toast.error("You can only move tasks assigned to you")
      return
    }

    setActiveTask(task)
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event
    setActiveTask(null)
    if (!over) return

    const dragged = tasks.find((t) => t.id === active.id)
    if (!dragged) return

    // Re-check permission on drop
    const isAdmin = projectRole === 'admin'
    const isOwner = dragged.assignee_id === user?.id
    if (!isAdmin && !isOwner) return

    // Determine target status from column id or task's status
    let targetStatus = over.id
    if (!STATUSES.includes(targetStatus)) {
      const overTask = tasks.find((t) => t.id === over.id)
      if (overTask) targetStatus = overTask.status
    }

    if (!STATUSES.includes(targetStatus) || dragged.status === targetStatus) return

    // Optimistic update
    updateTask({ ...dragged, status: targetStatus })

    try {
      const res = await api.patch(`/tasks/${dragged.id}/status`, { status: targetStatus })
      updateTask(res.data.task)
      toast.success(`Moved to ${targetStatus.replace('_', ' ')}`)
    } catch {
      updateTask(dragged) // revert
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
          <div className="rotate-2 shadow-2xl opacity-90">
            <TaskCard task={activeTask} onClick={() => {}} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
