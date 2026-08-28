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

    if (!title) {
      return res.status(400).json({ message: 'Task title is required' })
    }

    const task = await Task.create({ title, owner: req.userId })

    res.status(201).json(task)
  } catch (error) {
    next(error)
  }
})

router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(
      {
        _id: req.params.id,
        owner: req.userId
      },
      req.body,
      {
        new: true,
        runValidators: true
      }
    )

    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
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
