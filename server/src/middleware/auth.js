import jwt from 'jsonwebtoken'

function requireAuth(req, res, next) {
  const authorization = req.headers.authorization

  if (!authorization?.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Authentication required',
    })
  }

  const token = authorization.split(' ')[1]

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)

    req.userId = payload.userId

    next()
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired token',
    })
  }
}

export default requireAuth
