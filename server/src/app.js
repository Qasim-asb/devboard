import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import taskRoutes from './routes/taskRoutes.js'
import authRoutes from './routes/authRoutes.js'

const app = express()

app.use(
  cors({
    origin: process.env.CLIENT_URL
  })
)

app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'DevBoard API is running'
  })
})

app.use('/api/tasks', taskRoutes)
app.use('/api/auth', authRoutes)

app.use((error, req, res, next) => {
  console.error(error)

  if (
    error instanceof
    mongoose.Error.ValidationError
  ) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: Object.fromEntries(
        Object.entries(error.errors).map(([field, fieldError]) => [field, fieldError.message]))
    })
  }

  if (
    error instanceof mongoose.Error.CastError
  ) {
    return res.status(400).json({
      message: 'Invalid request data'
    })
  }

  if (error.code === 11000) {
    return res.status(409).json({
      message: 'A record with this value already exists'
    })
  }

  res.status(500).json({
    message: 'Internal server error'
  })
})

export default app
