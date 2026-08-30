import { useCallback, useEffect, useRef, useState } from 'react'
import useDebounce from './useDebounce'
import api from '../lib/api'

const DEFAULT_LIMIT = 10

async function requestTasks({ query, controller, setTasks, setStatistics, setPagination, setIsLoading, setError }) {
  try {
    setIsLoading(true)
    setError('')

    const params = new URLSearchParams({
      page: String(query.page),
      limit: String(query.limit),
      search: query.search,
      status: query.status,
      priority: query.priority,
      sort: query.sort
    })

    const { data } = await api.get(`/tasks?${params.toString()}`, { signal: controller.signal })

    setTasks(data.tasks)
    setStatistics(data.statistics)
    setPagination(data.pagination)
  } catch (error) {
    if (error.code === 'ERR_CANCELED') {
      return
    }

    console.error(error)

    setError(error.response?.data?.message || 'Unable to load tasks.')
  } finally {
    if (!controller.signal.aborted) {
      setIsLoading(false)
    }
  }
}

function useTasks(initialQuery = {}) {
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [query, setQuery] = useState({
    page: initialQuery.page || 1,
    limit: DEFAULT_LIMIT,
    search: initialQuery.search || '',
    status: initialQuery.status || 'all',
    priority: initialQuery.priority || 'all',
    sort: initialQuery.sort || 'newest'
  })

  const debouncedSearch = useDebounce(query.search, 300)

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
  const queryRef = useRef(query)
  const debouncedSearchRef = useRef(debouncedSearch)
  const requestControllerRef = useRef(null)

  useEffect(() => {
    tasksRef.current = tasks
  }, [tasks])

  useEffect(() => {
    queryRef.current = query
  }, [query])

  useEffect(() => {
    debouncedSearchRef.current = debouncedSearch
  }, [debouncedSearch])

  useEffect(() => {
    requestControllerRef.current?.abort()

    const controller = new AbortController()

    requestControllerRef.current = controller

    const requestQuery = {
      page: query.page,
      limit: query.limit,
      search: debouncedSearch,
      status: query.status,
      priority: query.priority,
      sort: query.sort
    }

    requestTasks({
      query: requestQuery,
      controller,
      setTasks,
      setStatistics,
      setPagination,
      setIsLoading,
      setError
    })
  }, [query.page, query.limit, query.status, query.priority, query.sort, debouncedSearch])

  useEffect(() => {
    return () => {
      requestControllerRef.current?.abort()
    }
  }, [])

  const refetchCurrentQuery = useCallback(async () => {
    requestControllerRef.current?.abort()

    const controller = new AbortController()

    requestControllerRef.current = controller

    await requestTasks({
      query: { ...queryRef.current, search: debouncedSearchRef.current },
      controller,
      setTasks,
      setStatistics,
      setPagination,
      setIsLoading,
      setError
    })
  }, [])

  const updateQuery = useCallback((changes) => {
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
      await api.post('/tasks', {
        title,
        priority: optimisticTask.priority,
        dueDate: optimisticTask.dueDate
      })

      await refetchCurrentQuery()

      return true
    } catch (error) {
      console.error(error)

      setTasks(currentTasks => currentTasks.filter(task => task._id !== temporaryId))
      setError(error.response?.data?.message || 'Unable to create task.')
      return false
    }
  }, [refetchCurrentQuery])

  const updateTask = useCallback(async (id, updates) => {
    const title = updates.title?.trim()

    if (!title) {
      return false
    }

    const currentTask = tasksRef.current.find(task => task._id === id)

    if (!currentTask) {
      return false
    }

    const previousTask = currentTask

    const optimisticTask = {
      ...currentTask,
      title,
      priority: updates.priority ?? currentTask.priority,
      dueDate: updates.dueDate !== undefined ? updates.dueDate || null : currentTask.dueDate
    }

    setError('')

    setTasks(currentTasks => currentTasks.map(task => task._id === id ? optimisticTask : task))

    try {
      await api.patch(`/tasks/${id}`, {
        title: optimisticTask.title,
        priority: optimisticTask.priority,
        dueDate: optimisticTask.dueDate
      })

      await refetchCurrentQuery()

      return true
    } catch (error) {
      console.error(error)

      setTasks(currentTasks => currentTasks.map(task => task._id === id ? previousTask : task))

      setError(error.response?.data?.message || 'Unable to update task.')

      return false
    }
  }, [refetchCurrentQuery])

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

      await refetchCurrentQuery()

      return true
    } catch (error) {
      console.error(error)

      setTasks(currentTasks => currentTasks.map(task => task._id === id ? { ...task, completed: previousCompleted } : task))
      setError(error.response?.data?.message || 'Unable to update task.')

      return false
    }
  }, [refetchCurrentQuery])

  const deleteTask = useCallback(async (id) => {
    const currentTask = tasksRef.current.find(task => task._id === id)

    if (!currentTask) {
      return false
    }

    setError('')

    setTasks(currentTasks => currentTasks.filter(task => task._id !== id))

    try {
      await api.delete(`/tasks/${id}`)

      await refetchCurrentQuery()

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
  }, [refetchCurrentQuery])

  return { tasks, statistics, pagination, query, isLoading, error, addTask, updateTask, toggleTask, deleteTask, updateQuery, changePage, refetch: refetchCurrentQuery }
}

export default useTasks
