import express from 'express'
import requireAuth from '../middleware/auth.js'
import { doubleCsrfProtection, generateCsrfToken } from '../middleware/csrf.js'
import { getCurrentUser, login, logout, signup } from '../controllers/authController.js'

const router = express.Router()

router.post('/signup', doubleCsrfProtection, signup)

router.post('/login', doubleCsrfProtection, login)

router.post('/logout', doubleCsrfProtection, logout)

router.get('/csrf-token', (req, res) => {
  const csrfToken = generateCsrfToken(req, res)

  res.json({ csrfToken })
})

router.get('/me', requireAuth, getCurrentUser)

export default router
