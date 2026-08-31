import dotenv from 'dotenv'
import mongoose from 'mongoose'
import app from './app.js'

dotenv.config()

const requiredEnvVariables = ['MONGO_URI', 'JWT_SECRET', 'CLIENT_URL']

const missingEnvVariables = requiredEnvVariables.filter(name => !process.env[name])

if (missingEnvVariables.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVariables.join(', ')}`)
}

const PORT = process.env.PORT || 4000

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
