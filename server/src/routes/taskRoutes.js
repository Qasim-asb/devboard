import express from 'express'
import requireAuth from '../middleware/auth.js'
import { createTask, deleteTask, getTaskById, getTasks, updateTask } from '../controllers/taskController.js'

const router = express.Router()

router.get('/', requireAuth, getTasks)

router.post('/', requireAuth, createTask)

router.get('/:id', requireAuth, getTaskById)

router.patch('/:id', requireAuth, updateTask)

router.delete('/:id', requireAuth, deleteTask)

export default router
