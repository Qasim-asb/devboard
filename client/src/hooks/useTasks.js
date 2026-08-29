import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import api from '../lib/api'

const DEFAULT_LIMIT = 10

function useTasks() {
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [pagination, setPagination] = useState({
    page: 1,
    limit: DEFAULT_LIMIT,
    total: 0,
    pages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  })

  const tasksRef = useRef([])

  useEffect(() => {
    tasksRef.current = tasks
  }, [tasks])

  const fetchTasks = useCallback(async (page = 1, limit = DEFAULT_LIMIT) => {
    try {
      setIsLoading(true)
      setError('')

      const { data } = await api.get(`/tasks?page=${page}&limit=${limit}`)

      setTasks(data.tasks)
      setPagination(data.pagination)
    } catch (error) {
      console.error(error)

      setError(error.response?.data?.message || 'Unable to load tasks.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks(1, DEFAULT_LIMIT)
  }, [fetchTasks])

  const changePage = useCallback(
    async (page) => {
      if (isLoading) {
        return
      }

      if (page < 1 || page > pagination.pages) {
        return
      }

      await fetchTasks(page, pagination.limit)
    }, [fetchTasks, isLoading, pagination.pages, pagination.limit])

  const addTask = useCallback(async (taskData) => {
    const title = taskData.title?.trim()

    if (!title) {
      return false
    }

    const temporaryId = `temp-${Date.now()}`

    const optimisticTask = {
      _id: temporaryId,
      title,
      completed: false,
      priority: taskData.priority || 'medium',
      dueDate: taskData.dueDate || null,
      isOptimistic: true
    }

    setError('')

    setTasks(currentTasks => [optimisticTask, ...currentTasks])

    try {
      const { data } = await api.post('/tasks', {
        title,
        priority: optimisticTask.priority,
        dueDate: optimisticTask.dueDate
      })

      setTasks(currentTasks => currentTasks.map(task => task._id === temporaryId ? data : task))

      return true
    } catch (error) {
      console.error(error)

      setTasks(currentTasks => currentTasks.filter(task => task._id !== temporaryId))
      setError(error.response?.data?.message || 'Unable to create task.')
      return false
    }
  }, [])

  const updateTask = useCallback(async (id, title) => {
    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      return false
    }

    const currentTask = tasksRef.current.find(task => task._id === id)

    if (!currentTask) {
      return false
    }

    const previousTitle = currentTask.title

    setError('')

    setTasks(currentTasks => currentTasks.map(task => task._id === id ? { ...task, title: trimmedTitle } : task))

    try {
      const { data } = await api.patch(`/tasks/${id}`, { title: trimmedTitle })

      setTasks(currentTasks => currentTasks.map(task => task._id === id ? data : task))

      return true
    } catch (error) {
      console.error(error)

      setTasks(currentTasks => currentTasks.map(task => task._id === id ? { ...task, title: previousTitle } : task))

      setError(error.response?.data?.message || 'Unable to update task.')

      return false
    }
  }, [])

  const toggleTask = useCallback(async (id) => {
    const currentTask = tasksRef.current.find(task => task._id === id)

    if (!currentTask) {
      return false
    }

    const previousCompleted = currentTask.completed
    const nextCompleted = !previousCompleted

    setError('')

    setTasks(currentTasks => currentTasks.map(task => task._id === id ? { ...task, completed: nextCompleted, } : task))

    try {
      await api.patch(`/tasks/${id}`, { completed: nextCompleted })

      return true
    } catch (error) {
      console.error(error)

      setTasks(currentTasks => currentTasks.map(task => task._id === id ? { ...task, completed: previousCompleted } : task))
      setError(error.response?.data?.message || 'Unable to update task.')

      return false
    }
  }, [])

  const deleteTask = useCallback(async (id) => {
    const currentTask = tasksRef.current.find(task => task._id === id)

    if (!currentTask) {
      return false
    }

    setError('')

    setTasks(currentTasks => currentTasks.filter(task => task._id !== id))

    try {
      await api.delete(`/tasks/${id}`)

      return true
    } catch (error) {
      console.error(error)

      setTasks(currentTasks => {
        const alreadyExists = currentTasks.some((task) => task._id === id)

        if (alreadyExists) {
          return currentTasks
        }

        return [currentTask, ...currentTasks]
      })

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

  return { tasks, statistics, pagination, isLoading, error, addTask, updateTask, toggleTask, deleteTask, changePage, refetch: fetchTasks }
}

export default useTasks
