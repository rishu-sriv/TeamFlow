import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'

import authRoutes from './routes/auth.js'
import projectRoutes from './routes/projects.js'
import taskRoutes from './routes/tasks.js'
import dashboardRoutes from './routes/dashboard.js'
import aiRoutes from './routes/ai.js'
import { authRateLimiter } from './middleware/rateLimiter.js'

// Import and start cron job
import './jobs/overdueDetection.js'

const app = express()

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())

// Request logger
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const ms = Date.now() - start
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode} ${ms}ms`)
  })
  next()
})

// Routes
app.use('/api/v1/auth', authRateLimiter, authRoutes)
app.use('/api/v1/projects', projectRoutes)
app.use('/api/v1/tasks', taskRoutes)
app.use('/api/v1/dashboard', dashboardRoutes)
app.use('/api/v1/ai', aiRoutes)

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date(), version: '1.0.0' })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack || err.message)

  const statusCode = err.statusCode || err.status || 500
  const message = err.message || 'Internal server error'

  res.status(statusCode).json({
    error: message,
    code: err.code || 'INTERNAL_ERROR',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  })
})

const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
  console.log(`[SERVER] TeamFlow API running on port ${PORT}`)
  console.log(`[SERVER] Environment: ${process.env.NODE_ENV || 'development'}`)
})

export default app
