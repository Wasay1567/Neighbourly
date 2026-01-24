import { ServiceService } from '../services/service.service.js'
import { success } from '../utils/response.js'

export const createService = async (req, res, next) => {
  try {
    const service = await ServiceService.create({
      ...req.body,
      provider_id: req.user.id
    })
    success(res, service, 'Service created', 201)
  } catch (err) {
    next(err)
  }
}

export const getAllServices = async (req, res, next) => {
  try {
    const services = await ServiceService.getAll(req.query)
    success(res, services)
  } catch (err) {
    next(err)
  }
}

export const getServiceById = async (req, res, next) => {
  try {
    const service = await ServiceService.getById(req.params.id)
    success(res, service)
  } catch (err) {
    next(err)
  }
}

export const deactivateService = async (req, res, next) => {
  try {
    await ServiceService.deactivate(req.params.id, req.user.id)
    success(res, null, 'Service deactivated')
  } catch (err) {
    next(err)
  }
}
