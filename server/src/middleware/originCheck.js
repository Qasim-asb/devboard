import env from '../config/env.js'

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS']

function verifyOrigin(req, res, next) {
  if (SAFE_METHODS.includes(req.method)) {
    return next()
  }

  const origin = req.headers.origin

  if (!origin) {
    return res.status(403).json({
      message: 'Origin header required'
    })
  }

  if (origin !== env.clientUrl) {
    return res.status(403).json({
      message: 'Invalid request origin'
    })
  }

  next()
}

export default verifyOrigin
