import { Router } from 'express'
import {
  createService,
  getAllServices,
  getServiceById,
  deactivateService
} from '../controllers/service.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { validateCreateService, validateServiceId } from '../validations/service.validation.js'

const router = Router()

router.post('/', authMiddleware, validateCreateService, createService)
router.get('/', authMiddleware, getAllServices)
router.get('/:id', authMiddleware, validateServiceId, getServiceById)
router.patch('/:id/deactivate', authMiddleware, validateServiceId, deactivateService)

export default router
