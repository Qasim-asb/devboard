import dotenv from 'dotenv'

dotenv.config()

const requiredEnvVariables = ['MONGO_URI', 'JWT_SECRET', 'CLIENT_URL', 'MONGO_DB_NAME', 'CSRF_SECRET', 'NODE_ENV']

const missingEnvVariables = requiredEnvVariables.filter(name => !process.env[name])

if (missingEnvVariables.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVariables.join(', ')}`)
}

const validNodeEnvironments = ['development', 'production']

if (!validNodeEnvironments.includes(process.env.NODE_ENV)) {
  throw new Error('NODE_ENV must be either development or production')
}

const isProduction = process.env.NODE_ENV === 'production'

const env = {
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  clientUrl: process.env.CLIENT_URL,
  port: process.env.PORT || 4000,
  mongoDbName: process.env.MONGO_DB_NAME,
  csrfSecret: process.env.CSRF_SECRET,
  cookie: {
    name: 'devboard-token',
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api'
  }
}

export default env
