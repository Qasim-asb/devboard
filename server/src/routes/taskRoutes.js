import express from 'express'
import Task from '../models/Task.js'
import requireAuth from '../middleware/auth.js'

const router = express.Router()

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const tasks = await Task.find({ owner: req.userId }).sort({ createdAt: -1 })

    res.json(tasks)
  } catch (error) {
    next(error)
  }
})

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const title = req.body.title?.trim()
    const priority = req.body.priority || 'medium'
    const dueDate = req.body.dueDate || null

    if (!title) {
      return res.status(400).json({
        message: 'Task title is required'
      })
    }

    if (!['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({
        message: 'Invalid task priority'
      })
    }

    const task = await Task.create({
      title,
      priority,
      dueDate,
      owner: req.userId
    })

    res.status(201).json(task)
  } catch (error) {
    next(error)
  }
})

router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const updates = {}

    if (req.body.title !== undefined) {
      const title = req.body.title.trim()

      if (!title) {
        return res.status(400).json({
          message: 'Task title cannot be empty'
        })
      }

      updates.title = title
    }

    if (req.body.completed !== undefined) {
      updates.completed = Boolean(req.body.completed)
    }

    if (req.body.priority !== undefined) {
      if (!['low', 'medium', 'high'].includes(req.body.priority)) {
        return res.status(400).json({
          message: 'Invalid task priority'
        })
      }

      updates.priority = req.body.priority
    }

    if (req.body.dueDate !== undefined) {
      updates.dueDate = req.body.dueDate || null
    }

    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        owner: req.userId
      },
      updates,
      {
        new: true,
        runValidators: true
      }
    )

    if (!task) {
      return res.status(404).json({
        message: 'Task not found'
      })
    }

    res.json(task)
  } catch (error) {
    next(error)
  }
})

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete({
      _id: req.params.id,
      owner: req.userId
    })

    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    res.json({ message: 'Task deleted successfully' })
  } catch (error) {
    next(error)
  }
})

export default router
