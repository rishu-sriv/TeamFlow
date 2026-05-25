import { Router } from 'express'
import authenticate from '../middleware/authenticate.js'
import {
  getTasksByProject,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  getTaskHistory,
  updateTaskStatus,
} from '../controllers/taskController.js'

const router = Router()

router.get('/project/:projectId', authenticate, getTasksByProject)
router.post('/project/:projectId', authenticate, createTask)
router.get('/:id', authenticate, getTask)
router.put('/:id', authenticate, updateTask)
router.delete('/:id', authenticate, deleteTask)
router.get('/:id/history', authenticate, getTaskHistory)
router.patch('/:id/status', authenticate, updateTaskStatus)

export default router
