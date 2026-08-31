import express from 'express'
import cors from 'cors'
import taskRoutes from './routes/taskRoutes.js'
import authRoutes from './routes/authRoutes.js'
import errorHandler from './middleware/errorHandler.js'

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

app.use(errorHandler)

export default app
