import { ServiceModel } from '../models/Service.model.js'

export const ServiceService = {
  create: async ({ provider_id, title, description, category, price_per_hour }) => {
    return ServiceModel.create({ provider_id, title, description, category, price_per_hour })
  },

  getAll: async (filters) => {
    return ServiceModel.findAll(filters)
  },

  getById: async (id) => {
    const service = await ServiceModel.findById(id)
    if (!service) throw new Error('Service not found')
    return service
  },

  deactivate: async (id, user_id) => {
    const service = await ServiceModel.findById(id)
    if (!service) throw new Error('Service not found')
    if (service.provider_id !== user_id) throw new Error('Unauthorized')

    return ServiceModel.deactivate(id)
  }
}
