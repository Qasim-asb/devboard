import { createTask as createTaskService, deleteTask as deleteTaskService, findTasks, getTaskById as getTaskByIdService, updateTask as updateTaskService } from '../services/taskService.js'
import { escapeRegex, validateCompleted, validateDueDate, validateTaskId, validateTaskPriority, validateTaskQuery, validateTaskTitle } from '../validators/taskValidators.js'

async function getTasks(req, res, next) {
  try {
    const queryResult = validateTaskQuery(req.query)

    if (queryResult.error) {
      return res.status(400).json(queryResult.error)
    }

    const { page, limit, search, status, priority, sort } = queryResult.value

    const result = await findTasks({
      userId: req.userId,
      page,
      limit,
      search: search ? escapeRegex(search) : '',
      status,
      priority,
      sort
    })

    res.json(result)
  } catch (error) {
    next(error)
  }
}

async function createTask(req, res, next) {
  try {
    const titleResult = validateTaskTitle(req.body.title)

    if (titleResult.error) {
      return res.status(400).json(titleResult.error)
    }

    const priority = req.body.priority || 'medium'

    const priorityResult = validateTaskPriority(priority)

    if (priorityResult.error) {
      return res.status(400).json(priorityResult.error)
    }

    const dueDateResult = validateDueDate(req.body.dueDate)

    if (dueDateResult.error) {
      return res.status(400).json(dueDateResult.error)
    }

    const task = await createTaskService({
      title: titleResult.value,
      priority: priorityResult.value,
      dueDate: dueDateResult.value,
      userId: req.userId
    })

    res.status(201).json(task)
  } catch (error) {
    next(error)
  }
}

async function getTaskById(req, res, next) {
  try {
    const taskIdResult = validateTaskId(req.params.id)

    if (taskIdResult.error) {
      return res.status(400).json(taskIdResult.error)
    }

    const task = await getTaskByIdService({
      taskId: taskIdResult.value,
      userId: req.userId
    })

    if (!task) {
      return res.status(404).json({
        message: 'Task not found'
      })
    }

    res.json(task)
  } catch (error) {
    next(error)
  }
}

async function updateTask(req, res, next) {
  try {
    const taskIdResult = validateTaskId(req.params.id)

    if (taskIdResult.error) {
      return res.status(400).json(taskIdResult.error)
    }

    const updates = {}

    if (req.body.title !== undefined) {
      const titleResult = validateTaskTitle(req.body.title)

      if (titleResult.error) {
        return res.status(400).json(titleResult.error)
      }

      updates.title = titleResult.value
    }

    if (req.body.completed !== undefined) {
      const completedResult = validateCompleted(req.body.completed)

      if (completedResult.error) {
        return res.status(400).json(completedResult.error)
      }

      updates.completed = completedResult.value
    }

    if (req.body.priority !== undefined) {
      const priorityResult = validateTaskPriority(req.body.priority)

      if (priorityResult.error) {
        return res.status(400).json(priorityResult.error)
      }

      updates.priority = priorityResult.value
    }

    if (req.body.dueDate !== undefined) {
      const dueDateResult = validateDueDate(req.body.dueDate)

      if (dueDateResult.error) {
        return res.status(400).json(dueDateResult.error)
      }

      updates.dueDate = dueDateResult.value
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: 'No valid fields to update'
      })
    }

    const task = await updateTaskService({
      taskId: taskIdResult.value,
      userId: req.userId,
      updates
    })

    if (!task) {
      return res.status(404).json({
        message: 'Task not found'
      })
    }

    res.json(task)
  } catch (error) {
    next(error)
  }
}

async function deleteTask(req, res, next) {
  try {
    const taskIdResult = validateTaskId(req.params.id)

    if (taskIdResult.error) {
      return res.status(400).json(taskIdResult.error)
    }

    const task = await deleteTaskService({
      taskId: taskIdResult.value,
      userId: req.userId
    })

    if (!task) {
      return res.status(404).json({
        message: 'Task not found'
      })
    }

    res.json({
      message: 'Task deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}

export { createTask, deleteTask, getTaskById, getTasks, updateTask }
