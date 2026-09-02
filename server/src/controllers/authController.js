import { authenticateUser, getUserById, registerUser } from '../services/authService.js'
import { validateEmail, validateName, validatePassword } from '../validators/authValidators.js'

import env from '../config/env.js'

function setAuthCookie(res, token) {
  res.cookie(env.cookie.name, token, {
    httpOnly: env.cookie.httpOnly,
    secure: env.cookie.secure,
    sameSite: env.cookie.sameSite,
    maxAge: env.cookie.maxAge,
    path: env.cookie.path
  })
}

async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email, and password are required'
      })
    }

    const nameResult = validateName(name)

    if (nameResult.error) {
      return res.status(400).json(nameResult.error)
    }

    const emailResult = validateEmail(email)

    if (emailResult.error) {
      return res.status(400).json(emailResult.error)
    }

    const passwordResult = validatePassword(password)

    if (passwordResult.error) {
      return res.status(400).json(passwordResult.error)
    }

    const result = await registerUser({
      name: nameResult.value,
      email: emailResult.value,
      password: passwordResult.value
    })

    setAuthCookie(res, result.token)

    res.status(201).json({
      user: result.user
    })
  } catch (error) {
    next(error)
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      })
    }

    const emailResult = validateEmail(email)

    if (emailResult.error) {
      return res.status(400).json(emailResult.error)
    }

    const passwordResult = validatePassword(password)

    if (passwordResult.error) {
      return res.status(400).json(passwordResult.error)
    }

    const result = await authenticateUser({
      email: emailResult.value,
      password: passwordResult.value
    })

    setAuthCookie(res, result.token)

    res.json({
      user: result.user
    })
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

async function logout(req, res, next) {
  try {
    res.clearCookie(env.cookie.name, {
      httpOnly: env.cookie.httpOnly,
      secure: env.cookie.secure,
      sameSite: env.cookie.sameSite,
      path: env.cookie.path
    })

    res.json({
      message: 'Logged out successfully'
    })
  } catch (error) {
    next(error)
  }
}

export { getCurrentUser, login, signup, logout }
