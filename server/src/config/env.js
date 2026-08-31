import dotenv from 'dotenv'

dotenv.config()

const requiredEnvVariables = ['MONGO_URI', 'JWT_SECRET', 'CLIENT_URL']

const missingEnvVariables = requiredEnvVariables.filter(name => !process.env[name])

if (missingEnvVariables.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVariables.join(', ')}`)
}

const env = {
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  clientUrl: process.env.CLIENT_URL,
  port: process.env.PORT || 4000
}

export default env
