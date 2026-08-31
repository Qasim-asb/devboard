import Task from '../models/Task.js'

async function findTasks({ userId, page, limit, search, status, priority, sort }) {
  const filter = { owner: userId }

  if (search) {
    filter.title = {
      $regex: search,
      $options: 'i'
    }
  }

  if (status === 'active') {
    filter.completed = false
  }

  if (status === 'completed') {
    filter.completed = true
  }

  if (priority !== 'all') {
    filter.priority = priority
  }

  const filteredTotal = await Task.countDocuments(filter)

  const pages = Math.ceil(filteredTotal / limit)

  const currentPage = pages > 0 ? Math.min(page, pages) : 1

  const skip = (currentPage - 1) * limit

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
                }
              ],
              default: 0
            }
          }
        }
      },
      { $sort: { priorityRank: -1, createdAt: -1, _id: -1 } },
      { $skip: skip },
      { $limit: limit },
      { $project: { priorityRank: 0 } }
    ])
  } else if (sort === 'dueDate') {
    tasks = await Task.aggregate([
      { $match: filter },
      { $addFields: { dueDateRank: { $cond: [{ $eq: ['$dueDate', null] }, 1, 0] } } },
      { $sort: { dueDateRank: 1, dueDate: 1, createdAt: -1, _id: -1 } },
      { $skip: skip },
      { $limit: limit },
      { $project: { dueDateRank: 0 } }
    ])
  } else {
    const sortOptions = {
      newest: { createdAt: -1, _id: -1 },
      oldest: { createdAt: 1, _id: 1 }
    }

    tasks = await Task.find(filter).sort(sortOptions[sort] || sortOptions.newest).skip(skip).limit(limit)
  }

  const userFilter = { owner: userId }

  const [total, completedTotal, inProgressTotal] = await Promise.all([
    Task.countDocuments(userFilter),
    Task.countDocuments({ ...userFilter, completed: true }),
    Task.countDocuments({ ...userFilter, completed: false })
  ])

  return {
    tasks,
    statistics: {
      total,
      completed: completedTotal,
      inProgress: inProgressTotal
    },
    pagination: {
      page: currentPage,
      limit,
      total: filteredTotal,
      pages,
      hasNextPage: currentPage < pages,
      hasPreviousPage: currentPage > 1
    }
  }
}

async function createTask({ title, priority, dueDate, userId }) {
  return Task.create({
    title,
    priority,
    dueDate,
    owner: userId
  })
}

async function getTaskById({ taskId, userId }) {
  return Task.findOne({ _id: taskId, owner: userId })
}

async function updateTask({ taskId, userId, updates }) {
  return Task.findOneAndUpdate(
    {
      _id: taskId,
      owner: userId
    },
    updates,
    {
      new: true,
      runValidators: true
    }
  )
}

async function deleteTask({ taskId, userId }) {
  return Task.findOneAndDelete({ _id: taskId, owner: userId })
}

export { createTask, deleteTask, findTasks, getTaskById, updateTask }
