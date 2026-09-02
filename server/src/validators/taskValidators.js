import mongoose from 'mongoose'

const VALID_STATUSES = ['all', 'active', 'completed']

const VALID_PRIORITIES = ['all', 'low', 'medium', 'high']

const VALID_TASK_PRIORITIES = ['low', 'medium', 'high']

const VALID_SORTS = ['newest', 'oldest', 'priority', 'dueDate']

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function isValidDate(value) {
  if (value === null || value === undefined || value === '') {
    return true
  }

  if (typeof value !== 'string') {
    return false
  }

  const datePattern = /^\d{4}-\d{2}-\d{2}$/

  if (!datePattern.test(value)) {
    return false
  }

  const [year, month, day] = value.split('-').map(Number)

  const date = new Date(Date.UTC(year, month - 1, day))

  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

function validateTaskId(id) {
  if (!mongoose.isValidObjectId(id)) {
    return { error: { message: 'Invalid task ID' } }
  }

  return { value: id }
}

function validateTaskQuery(query) {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1)

  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 10, 1), 50)

  const search = query.search?.trim() || ''

  const status = query.status || 'all'

  const priority = query.priority || 'all'

  const sort = query.sort || 'newest'

  if (!VALID_STATUSES.includes(status)) {
    return { error: { message: 'Invalid status' } }
  }

  if (!VALID_PRIORITIES.includes(priority)) {
    return { error: { message: 'Invalid priority' } }
  }

  if (!VALID_SORTS.includes(sort)) {
    return { error: { message: 'Invalid sort' } }
  }

  return {
    value: { page, limit, search, status, priority, sort }
  }
}

function validateTaskTitle(title) {
  if (typeof title !== 'string') {
    return { error: { message: 'Invalid task title' } }
  }

  const trimmedTitle = title.trim()

  if (!trimmedTitle) {
    return { error: { message: 'Task title cannot be empty' } }
  }

  return { value: trimmedTitle }
}

function validateTaskPriority(priority) {
  if (!VALID_TASK_PRIORITIES.includes(priority)) {
    return { error: { message: 'Invalid task priority' } }
  }

  return { value: priority }
}

function validateCompleted(value) {
  if (typeof value !== 'boolean') {
    return { error: { message: 'Invalid completed value' } }
  }

  return { value }
}

function validateDueDate(value) {
  const dueDate = value || null

  if (!isValidDate(dueDate)) {
    return { error: { message: 'Invalid due date' } }
  }

  return { value: dueDate }
}

export { escapeRegex, isValidDate, validateCompleted, validateDueDate, validateTaskId, validateTaskPriority, validateTaskQuery, validateTaskTitle }
