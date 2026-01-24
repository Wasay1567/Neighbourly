import { UserModel } from '../models/User.model.js'
import { RoleModel } from '../models/Role.model.js'
import { hashPassword, comparePassword } from '../utils/hash.js'
import { generateToken } from '../utils/jwt.js'

export const AuthService = {
  register: async ({ full_name, email, password, role_id, phone }) => {
    const existing = await UserModel.findByEmail(email)
    if (existing) throw new Error('Email already registered')

    // Ensure role exists
    const role = await RoleModel.findById(role_id)
    if (!role) throw new Error('Invalid role')

    const password_hash = await hashPassword(password)

    const user = await UserModel.create({ full_name, email, password_hash, role_id, phone })
    const token = generateToken({ id: user.id, role_id: user.role_id })

    return { ...user, token }
  },

  login: async ({ email, password }) => {
    const user = await UserModel.findByEmail(email)
    if (!user) throw new Error('Invalid credentials')

    const valid = await comparePassword(password, user.password_hash)
    if (!valid) throw new Error('Invalid credentials')

    const token = generateToken({ id: user.id, role_id: user.role_id })
    return { ...user, token }
  }
}
