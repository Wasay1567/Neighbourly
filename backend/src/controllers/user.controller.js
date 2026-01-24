import { UserService } from '../services/user.service.js'
import { success } from '../utils/response.js'

export const getProfile = async (req, res, next) => {
  try {
    const user = await UserService.getById(req.user.id)
    success(res, user)
  } catch (err) {
    next(err)
  }
}

export const getUserById = async (req, res, next) => {
  try {
    const user = await UserService.getById(req.params.id)
    success(res, user)
  } catch (err) {
    next(err)
  }
}
