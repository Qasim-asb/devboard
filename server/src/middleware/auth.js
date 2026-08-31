import jwt from 'jsonwebtoken'
import env from '../config/env.js'

function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.[env.cookie.name]

    if (!token) {
      return res.status(401).json({
        message: 'Authentication required'
      })
    }

    const decoded = jwt.verify(token, env.jwtSecret)

    req.userId = decoded.userId

    next()
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired authentication'
    })
  }
}

export default requireAuth
