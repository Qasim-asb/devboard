import express from 'express'
import requireAuth from '../middleware/auth.js'
import { createTask, deleteTask, getTaskById, getTasks, updateTask } from '../controllers/taskController.js'
import { doubleCsrfProtection } from '../middleware/csrf.js'

const router = express.Router()

router.get('/', requireAuth, getTasks)

router.post('/', requireAuth, doubleCsrfProtection, createTask)

router.get('/:id', requireAuth, getTaskById)

router.patch('/:id', requireAuth, doubleCsrfProtection, updateTask)

router.delete('/:id', requireAuth, doubleCsrfProtection, deleteTask)

export default router
