import express from 'express'
import authRoutes from './routes/auth.routes.js'
import serviceRoutes from './routes/service.routes.js'
import { errorHandler } from './middlewares/error.middleware.js'

const app = express()
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/services', serviceRoutes)

app.use(errorHandler)

export default app
