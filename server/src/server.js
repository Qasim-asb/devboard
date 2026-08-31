import app from './app.js'
import env from './config/env.js'
import { connectDatabase, disconnectDatabase } from './config/database.js'

let server

async function startServer() {
  try {
    await connectDatabase()

    server = app.listen(env.port, () => {
      console.log(`Server running on http://localhost:${env.port}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

async function gracefulShutdown(signal) {
  console.log(`${signal} received. Shutting down gracefully...`)

  if (server) {
    await new Promise(resolve => {
      server.close(() => {
        console.log('HTTP server closed')
        resolve()
      })
    })
  }

  try {
    await disconnectDatabase()
  } catch (error) {
    console.error('Failed to close MongoDB connection:', error)
  }

  console.log('Process terminated cleanly')
  process.exit(0)
}

process.on('SIGINT', () => {
  gracefulShutdown('SIGINT')
})

process.on('SIGTERM', () => {
  gracefulShutdown('SIGTERM')
})

startServer()
