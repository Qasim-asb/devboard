import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import requireAuth from '../middleware/auth.js'

const router = express.Router()

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function createToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

function isValidEmail(email) {
  return EMAIL_PATTERN.test(email)
}

function getPublicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email
  }
}

router.post('/signup', async (req, res, next) => {
  try {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : ''

    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : ''

    const password = typeof req.body.password === 'string' ? req.body.password : ''

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email, and password are required'
      })
    }

    if (name.length < 2) {
      return res.status(400).json({
        message: 'Name must be at least 2 characters'
      })
    }

    if (name.length > 50) {
      return res.status(400).json({
        message: 'Name must be at most 50 characters'
      })
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: 'Please provide a valid email'
      })
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters'
      })
    }

    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return res.status(409).json({
        message: 'An account with this email already exists'
      })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    })

    const token = createToken(user._id.toString())

    res.status(201).json({
      user: getPublicUser(user),
      token
    })
  } catch (error) {
    next(error)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : ''

    const password = typeof req.body.password === 'string' ? req.body.password : ''

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      })
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: 'Please provide a valid email'
      })
    }

    const user = await User.findOne({ email }).select('+password')

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password',
      })
    }

    const passwordMatches = await bcrypt.compare(password, user.password)

    if (!passwordMatches) {
      return res.status(401).json({
        message: 'Invalid email or password',
      })
    }

    const token = createToken(user._id.toString())

    res.json({
      user: getPublicUser(user),
      token
    })
  } catch (error) {
    next(error)
  }
})

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('name email')

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      })
    }

    res.json({
      user: getPublicUser(user)
    })
  } catch (error) {
    next(error)
  }
})

export default router
