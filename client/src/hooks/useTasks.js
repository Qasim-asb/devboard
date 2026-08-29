import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import api from '../lib/api'

const DEFAULT_LIMIT = 10

function useTasks() {
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [query, setQuery] = useState({
    page: 1,
    limit: DEFAULT_LIMIT,
    search: '',
    status: 'all',
    priority: 'all',
    sort: 'newest'
  })

  const [pagination, setPagination] = useState({
    page: 1,
    limit: DEFAULT_LIMIT,
    total: 0,
    pages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  })

  const [statistics, setStatistics] = useState({ total: 0, completed: 0, inProgress: 0 })

  const tasksRef = useRef([])

  useEffect(() => {
    tasksRef.current = tasks
  }, [tasks])

  const fetchTasks = useCallback(async (nextQuery) => {
    try {
      setIsLoading(true)
      setError('')

      const params = new URLSearchParams({
        page: String(nextQuery.page),
        limit: String(nextQuery.limit),
        search: nextQuery.search,
        status: nextQuery.status,
        priority: nextQuery.priority,
        sort: nextQuery.sort
      })

      const { data } = await api.get(`/tasks?${params.toString()}`)

      setTasks(data.tasks)
      setStatistics(data.statistics)
      setPagination(data.pagination)
    } catch (error) {
      console.error(error)

      setError(error.response?.data?.message || 'Unable to load tasks.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks(query)
  }, [fetchTasks, query])

  const updateQuery = useCallback(changes => {
    setQuery(currentQuery => ({ ...currentQuery, ...changes }))
  }, [])

  const changePage = useCallback(page => {
    setQuery(currentQuery => ({ ...currentQuery, page }))
  }, [])

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

  return { tasks, statistics, pagination, query, isLoading, error, addTask, updateTask, toggleTask, deleteTask, updateQuery, changePage, refetch: fetchTasks }
}

export default useTasks
