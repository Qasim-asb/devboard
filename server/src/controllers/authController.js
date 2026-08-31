import { authenticateUser, getUserById, registerUser } from '../services/authService.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isValidEmail(email) {
  return EMAIL_PATTERN.test(email)
}

async function signup(req, res, next) {
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

    const result = await registerUser({ name, email, password })

    res.status(201).json(result)
  } catch (error) {
    next(error)
  }
}

async function login(req, res, next) {
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

    const result = await authenticateUser({ email, password })

    res.json(result)
  } catch (error) {
    next(error)
  }
}

async function getCurrentUser(req, res, next) {
  try {
    const user = await getUserById(req.userId)

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      })
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    next(error)
  }
}

export { getCurrentUser, login, signup }
