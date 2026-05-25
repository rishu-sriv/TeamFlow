import { Router } from 'express'
import { signup, login, getMe, signupSchema, loginSchema } from '../controllers/authController.js'
import authenticate from '../middleware/authenticate.js'
import validate from '../middleware/validate.js'

const router = Router()

router.post('/signup', validate(signupSchema), signup)
router.post('/login', validate(loginSchema), login)
router.get('/me', authenticate, getMe)

export default router
