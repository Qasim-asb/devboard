import express from 'express'
import Task from '../models/Task.js'
import requireAuth from '../middleware/auth.js'

const router = express.Router()

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1)

    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 50)

    const search = req.query.search?.trim() || ''
    const status = req.query.status || 'all'
    const priority = req.query.priority || 'all'
    const sort = req.query.sort || 'newest'

    const filter = { owner: req.userId }

    if (search) {
      filter.title = { $regex: search, $options: 'i' }
    }

    if (status === 'active') {
      filter.completed = false
    }

    if (status === 'completed') {
      filter.completed = true
    }

    if (['low', 'medium', 'high'].includes(priority)) {
      filter.priority = priority
    }

    const skip = (page - 1) * limit

    let tasks

    if (sort === 'priority') {
      tasks = await Task.aggregate([
        { $match: filter },
        {
          $addFields: {
            priorityRank: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ['$priority', 'high'] },
                    then: 3
                  },
                  {
                    case: { $eq: ['$priority', 'medium'] },
                    then: 2
                  },
                  {
                    case: { $eq: ['$priority', 'low'] },
                    then: 1
                  },
                ],
                default: 0
              }
            }
          }
        },
        { $sort: { priorityRank: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        { $project: { priorityRank: 0 } }
      ])
    } else {
      const sortOptions = {
        newest: { createdAt: -1 },
        oldest: { createdAt: 1 },
        dueDate: { dueDate: 1, createdAt: -1 }
      }

      tasks = await Task.find(filter).sort(sortOptions[sort] || sortOptions.newest).skip(skip).limit(limit)
    }

    const [total, completedTotal, inProgressTotal] = await Promise.all([
      Task.countDocuments(filter),
      Task.countDocuments({ ...filter, completed: true }),
      Task.countDocuments({ ...filter, completed: false })
    ])

    const pages = Math.ceil(total / limit)

    res.json({
      tasks,
      statistics: {
        total,
        completed: completedTotal,
        inProgress: inProgressTotal
      },
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
    const task = await Task.findOneAndDelete({
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
