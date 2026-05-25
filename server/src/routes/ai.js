import { Router } from 'express'
import authenticate from '../middleware/authenticate.js'
import { summarizeProject, summarizeDashboard } from '../controllers/aiController.js'

const router = Router()

router.post('/projects/:id/summarize', authenticate, summarizeProject)
router.post('/dashboard/summarize', authenticate, summarizeDashboard)

export default router
