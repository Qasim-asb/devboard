import express from 'express'
import Task from '../models/Task.js'
import requireAuth from '../middleware/auth.js'

const router = express.Router()

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1)

    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 50)

    const skip = (page - 1) * limit

    const filter = { owner: req.userId }

    const [tasks, total] = await Promise.all([
      Task.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Task.countDocuments(filter)
    ])

    const pages = Math.ceil(total / limit)

    res.json({
      tasks,
      pagination: {
        page,
        limit,
        total,
        pages,
        hasNextPage: page < pages,
        hasPreviousPage: page > 1
      }
    })
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
