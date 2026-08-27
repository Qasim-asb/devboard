import express from 'express'
import Task from '../models/Task.js'

const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 })

    res.json(tasks)
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const title = req.body.title?.trim()

    if (!title) {
      return res.status(400).json({ message: 'Task title is required' })
    }

    const task = await Task.create({ title })

    res.status(201).json(task)
  } catch (error) {
    next(error)
  }
})

router.patch('/:id', async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
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

router.delete('/:id', async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id)

    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    res.json({ message: 'Task deleted successfully' })
  } catch (error) {
    next(error)
  }
})

export default router
