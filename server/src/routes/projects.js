import { Router } from 'express'
import authenticate from '../middleware/authenticate.js'
import authorize from '../middleware/authorize.js'
import {
  getAllProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  updateMemberRole,
  getProjectActivity,
} from '../controllers/projectController.js'

const router = Router()

router.get('/', authenticate, getAllProjects)
router.post('/', authenticate, createProject)
router.get('/:id', authenticate, authorize('member'), getProject)
router.put('/:id', authenticate, authorize('admin'), updateProject)
router.delete('/:id', authenticate, authorize('admin'), deleteProject)
router.post('/:id/members', authenticate, authorize('admin'), addMember)
router.delete('/:id/members/:userId', authenticate, authorize('admin'), removeMember)
router.put('/:id/members/:userId/role', authenticate, authorize('admin'), updateMemberRole)
router.get('/:id/activity', authenticate, authorize('member'), getProjectActivity)

export default router
