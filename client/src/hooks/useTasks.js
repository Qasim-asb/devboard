import { useCallback, useEffect, useMemo, useState } from 'react'
import api from '../lib/api'

function useTasks() {
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')

      const { data } = await api.get('/tasks')

      setTasks(data)
    } catch (error) {
      console.error(error)

      setError(error.response?.data?.message || 'Unable to load tasks.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const addTask = useCallback(async (title) => {
    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      return false
    }

    try {
      setError('')

      const { data } = await api.post('/tasks', { title: trimmedTitle })

      setTasks(currentTasks => [data, ...currentTasks])

      return true
    } catch (error) {
      console.error(error)

      setError(error.response?.data?.message || 'Unable to create task.')
      return false
    }
  }, [])

  const updateTask = useCallback(async (id, title) => {
    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      return false
    }

    try {
      setError('')

      const { data } = await api.patch(`/tasks/${id}`, { title: trimmedTitle })

      setTasks(currentTasks => currentTasks.map(task => task._id === id ? data : task))

      return true
    } catch (error) {
      console.error(error)

      setError(error.response?.data?.message || 'Unable to update task.')

      return false
    }
  }, [])

  const toggleTask = useCallback(async (id) => {
    const currentTask = tasks.find(task => task._id === id)

    if (!currentTask) {
      return false
    }

    try {
      setError('')

      const { data } = await api.patch(`/tasks/${id}`, { completed: !currentTask.completed })

      setTasks(currentTasks => currentTasks.map(task => task._id === id ? data : task))

      return true
    } catch (error) {
      console.error(error)

      setError(error.response?.data?.message || 'Unable to update task.')

      return false
    }
  }, [tasks])

  const deleteTask = useCallback(async (id) => {
    try {
      setError('')

      await api.delete(`/tasks/${id}`)

      setTasks(currentTasks => currentTasks.filter(task => task._id !== id))

      return true
    } catch (error) {
      console.error(error)

      setError(error.response?.data?.message || 'Unable to delete task.')

      return false
    }
  }, [])

  const statistics = useMemo(() => {
    const completed = tasks.filter(task => task.completed).length

    return {
      total: tasks.length,
      completed,
      inProgress: tasks.length - completed,
    }
  }, [tasks])

  return { tasks, statistics, isLoading, error, addTask, updateTask, toggleTask, deleteTask, refetch: fetchTasks }
}

export default useTasks
