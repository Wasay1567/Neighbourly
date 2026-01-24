import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'Unauthorized' })

  req.user = jwt.verify(token, env.JWT_SECRET)
  next()
}
