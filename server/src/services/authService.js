import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import env from '../config/env.js'

function createToken(userId) {
  return jwt.sign({ userId }, env.jwtSecret, { expiresIn: '7d' })
}

function getPublicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email
  }
}

function createAuthenticationError() {
  const error = new Error('Invalid email or password')

  error.statusCode = 401

  return error
}

async function registerUser({ name, email, password }) {
  const existingUser = await User.findOne({ email })

  if (existingUser) {
    const error = new Error('An account with this email already exists')

    error.statusCode = 409

    throw error
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  const user = await User.create({
    name,
    email,
    password: hashedPassword
  })

  return {
    user: getPublicUser(user),
    token: createToken(user._id.toString())
  }
}

async function authenticateUser({ email, password }) {
  const user = await User.findOne({ email }).select('+password')

  if (!user) {
    throw createAuthenticationError()
  }

  const passwordMatches = await bcrypt.compare(password, user.password)

  if (!passwordMatches) {
    throw createAuthenticationError()
  }

  return {
    user: getPublicUser(user),
    token: createToken(user._id.toString())
  }
}

async function getUserById(userId) {
  return User.findById(userId).select('name email')
}

export { authenticateUser, getUserById, registerUser }
