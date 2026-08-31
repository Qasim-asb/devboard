import { authenticateUser, getUserById, registerUser } from '../services/authService.js'
import { validateEmail, validateName, validatePassword } from '../validators/authValidators.js'

async function signup(req, res, next) {
  try {
    if (!req.body.name || !req.body.email || !req.body.password) {
      return res.status(400).json({
        message: 'Name, email, and password are required'
      })
    }

    const nameResult = validateName(req.body.name)

    if (nameResult.error) {
      return res.status(400).json(nameResult.error)
    }

    const emailResult = validateEmail(req.body.email)

    if (emailResult.error) {
      return res.status(400).json(emailResult.error)
    }

    const passwordResult = validatePassword(req.body.password)

    if (passwordResult.error) {
      return res.status(400).json(passwordResult.error)
    }

    const result = await registerUser({
      name: nameResult.value,
      email: emailResult.value,
      password: passwordResult.value
    })

    res.status(201).json(result)
  } catch (error) {
    next(error)
  }
}

async function login(req, res, next) {
  try {
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({
        message: 'Email and password are required'
      })
    }

    const emailResult = validateEmail(req.body.email)

    if (emailResult.error) {
      return res.status(400).json(emailResult.error)
    }

    const passwordResult = validatePassword(req.body.password)

    if (passwordResult.error) {
      return res.status(400).json(passwordResult.error)
    }

    const result = await authenticateUser({
      email: emailResult.value,
      password: passwordResult.value
    })

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
