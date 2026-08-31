import mongoose from 'mongoose'
import env from './env.js'

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected')
})

mongoose.connection.on('error', error => {
  console.error('MongoDB error:', error.message)
})

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected')
})

async function connectDatabase() {
  await mongoose.connect(env.mongoUri, {
    dbName: env.mongoDbName,
    serverSelectionTimeoutMS: 5000
  })
}

async function disconnectDatabase() {
  await mongoose.connection.close()

  console.log('MongoDB connection closed')
}

export { connectDatabase, disconnectDatabase }
