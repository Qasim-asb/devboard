import mongoose from 'mongoose'
import env from './env.js'

async function connectDatabase() {
  try {
    await mongoose.connect(env.mongoUri)

    console.log('MongoDB connected')
  } catch (error) {
    console.error('MongoDB connection failed:', error)

    throw error
  }
}

export default connectDatabase
