import api from '../lib/api'

export async function getTask(id, signal) {
  const { data } = await api.get(`/tasks/${id}`, { signal })

  return data
}

export async function createTask(taskData) {
  const { data } = await api.post('/tasks', taskData)

  return data
}

export async function updateTask(id, updates) {
  const { data } = await api.patch(`/tasks/${id}`, updates)

  return data
}

export async function deleteTask(id) {
  const { data } = await api.delete(`/tasks/${id}`)

  return data
}

export async function fetchTaskList(query, signal) {
  const params = new URLSearchParams({
    page: String(query.page),
    limit: String(query.limit),
    search: query.search,
    status: query.status,
    priority: query.priority,
    sort: query.sort
  })

  const { data } = await api.get(`/tasks?${params.toString()}`, { signal })

  return data
}
