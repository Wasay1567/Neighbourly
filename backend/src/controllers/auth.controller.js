import { AuthService } from '../services/auth.service.js'
import { success } from '../utils/response.js'

export const register = async (req, res, next) => {
  try {
    const user = await AuthService.register(req.body)
    success(res, user, 'User registered successfully', 201)
  } catch (err) {
    next(err)
  }
}

export const login = async (req, res, next) => {
  try {
    const result = await AuthService.login(req.body)
    success(res, result, 'Login successful')
  } catch (err) {
    next(err)
  }
}
