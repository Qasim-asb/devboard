import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import taskRoutes from './routes/taskRoutes.js'
import authRoutes from './routes/authRoutes.js'
import errorHandler from './middleware/errorHandler.js'
import env from './config/env.js'

const app = express()

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true
  })
)

app.use(express.json())
app.use(cookieParser())

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'DevBoard API is running'
  })
})

app.use('/api/tasks', taskRoutes)
app.use('/api/auth', authRoutes)

app.use(errorHandler)

export default app
