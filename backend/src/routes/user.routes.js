import { Router } from 'express'
import { getProfile, getUserById } from '../controllers/user.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'

const router = Router()

// Protected routes
router.get('/me', authMiddleware, getProfile)
router.get('/:id', authMiddleware, getUserById)

export default router
