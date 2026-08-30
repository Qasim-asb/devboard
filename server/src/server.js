import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import taskRoutes from './routes/taskRoutes.js'
import authRoutes from './routes/authRoutes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

if (!process.env.CLIENT_URL) {
  throw new Error('CLIENT_URL is not configured')
}

app.use(
  cors({
    origin: process.env.CLIENT_URL
  })
)

app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'DevBoard API is running',
  })
})

app.use('/api/tasks', taskRoutes)
app.use('/api/auth', authRoutes)

app.use((error, req, res, next) => {
  console.error(error)

  if (error instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: Object.fromEntries(
        Object.entries(error.errors).map(([field, fieldError]) => [field, fieldError.message])
      )
    })
  }

  if (error instanceof mongoose.Error.CastError) {
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
    message: 'Internal server error',
  })
})

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI)

    console.log('MongoDB connected')

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
