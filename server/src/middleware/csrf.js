import { doubleCsrf } from 'csrf-csrf'
import env from '../config/env.js'

const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf({
  getSecret: () => env.csrfSecret,

  getSessionIdentifier: req => req.cookies?.[env.cookie.name] || 'anonymous',

  cookieName: 'devboard-csrf',

  cookieOptions: {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/api'
  },

  size: 32,

  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],

  getCsrfTokenFromRequest: req => req.headers['x-csrf-token']
})

export {
  doubleCsrfProtection,
  generateCsrfToken
}
