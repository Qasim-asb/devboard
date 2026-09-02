export function getDateInputValue(dueDate) {
  if (!dueDate) {
    return ''
  }

  return new Date(dueDate).toISOString().slice(0, 10)
}

export function getDueDateLabel(dueDate) {
  if (!dueDate) {
    return 'No due date'
  }

  const today = new Date()
  const due = new Date(dueDate)

  today.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)

  const difference = Math.ceil((due - today) / (1000 * 60 * 60 * 24))

  if (difference < 0) {
    return 'Overdue'
  }

  if (difference === 0) {
    return 'Due today'
  }

  if (difference === 1) {
    return 'Due tomorrow'
  }

  return `Due ${due.toLocaleDateString()}`
}

export function getErrorMessage(error, fallback) {
  return error.response?.data?.message || fallback
}
