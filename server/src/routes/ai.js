import { Router } from 'express'
import authenticate from '../middleware/authenticate.js'
import { summarizeProject } from '../controllers/aiController.js'

const router = Router()

router.post('/projects/:id/summarize', authenticate, summarizeProject)

export default router
