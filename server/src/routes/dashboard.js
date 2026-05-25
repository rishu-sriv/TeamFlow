import { Router } from 'express'
import authenticate from '../middleware/authenticate.js'
import { getDashboard, getOverdueTasks } from '../controllers/dashboardController.js'

const router = Router()

router.get('/', authenticate, getDashboard)
router.get('/overdue', authenticate, getOverdueTasks)

export default router
