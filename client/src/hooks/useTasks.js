import { useCallback, useEffect, useReducer, useRef } from 'react'
import useDebounce from './useDebounce'
import api from '../lib/api'

const DEFAULT_LIMIT = 10

const initialPagination = {
  page: 1,
  limit: DEFAULT_LIMIT,
  total: 0,
  pages: 0,
  hasNextPage: false,
  hasPreviousPage: false
}

const initialStatistics = { total: 0, completed: 0, inProgress: 0 }

function tasksReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return {
        ...state,
        isLoading: true,
        error: ''
      }

    case 'FETCH_SUCCESS':
      return {
        ...state,
        tasks: action.payload.tasks,
        statistics: action.payload.statistics,
        pagination: action.payload.pagination,
        isLoading: false,
        error: ''
      }

    case 'FETCH_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload
      }

    case 'SET_QUERY':
      return {
        ...state,
        query: {
          ...state.query,
          ...action.payload
        }
      }

    case 'SET_TASKS':
      return {
        ...state,
        tasks: action.payload
      }

    default:
      return state
  }
}

function createInitialState(initialQuery) {
  return {
    tasks: [],
    statistics: initialStatistics,
    pagination: initialPagination,
    query: {
      page: initialQuery.page || 1,
      limit: DEFAULT_LIMIT,
      search: initialQuery.search || '',
      status: initialQuery.status || 'all',
      priority: initialQuery.priority || 'all',
      sort: initialQuery.sort || 'newest'
    },
    isLoading: true,
    error: ''
  }
}

function getErrorMessage(error, fallback) {
  return (error.response?.data?.message || fallback)
}

function useTasks(initialQuery = {}) {
  const [state, dispatch] = useReducer(tasksReducer, initialQuery, createInitialState)

  const { tasks, statistics, pagination, query, isLoading, error } = state

  const debouncedSearch = useDebounce(query.search, 300)

  const tasksRef = useRef(tasks)
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

    dispatch({ type: 'FETCH_START' })

    async function fetchTasks() {
      try {
        const params = new URLSearchParams({
          page: String(requestQuery.page),
          limit: String(requestQuery.limit),
          search: requestQuery.search,
          status: requestQuery.status,
          priority: requestQuery.priority,
          sort: requestQuery.sort
        })

        const { data } = await api.get(`/tasks?${params.toString()}`, { signal: controller.signal })

        if (controller.signal.aborted) {
          return
        }

        dispatch({ type: 'FETCH_SUCCESS', payload: data })

        if (data.pagination.page !== requestQuery.page) {
          dispatch({
            type: 'SET_QUERY',
            payload: { page: data.pagination.page }
          })
        }
      } catch (error) {
        if (error.code === 'ERR_CANCELED' || controller.signal.aborted) {
          return
        }

        console.error(error)

        dispatch({
          type: 'FETCH_ERROR',
          payload: getErrorMessage(error, 'Unable to load tasks.')
        })
      }
    }

    fetchTasks()

    return () => {
      controller.abort()
    }
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

    dispatch({ type: 'FETCH_START' })

    const currentQuery = queryRef.current

    const requestQuery = { ...currentQuery, search: debouncedSearchRef.current }

    try {
      const params = new URLSearchParams({
        page: String(requestQuery.page),
        limit: String(requestQuery.limit),
        search: requestQuery.search,
        status: requestQuery.status,
        priority: requestQuery.priority,
        sort: requestQuery.sort
      })

      const { data } = await api.get(`/tasks?${params.toString()}`, { signal: controller.signal })

      if (controller.signal.aborted) {
        return
      }

      dispatch({ type: 'FETCH_SUCCESS', payload: data })

      if (data.pagination.page !== requestQuery.page) {
        dispatch({
          type: 'SET_QUERY',
          payload: { page: data.pagination.page }
        })
      }
    } catch (error) {
      if (error.code === 'ERR_CANCELED' || controller.signal.aborted) {
        return
      }

      console.error(error)

      dispatch({
        type: 'FETCH_ERROR',
        payload: getErrorMessage(error, 'Unable to load tasks.')
      })
    }
  }, [])

  const updateQuery = useCallback(changes => {
    dispatch({ type: 'SET_QUERY', payload: changes })
  }, [])

  const changePage = useCallback(page => {
    dispatch({
      type: 'SET_QUERY',
      payload: { page }
    })
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

    dispatch({
      type: 'SET_TASKS',
      payload: [optimisticTask, ...tasksRef.current]
    })

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

      dispatch({
        type: 'SET_TASKS',
        payload: tasksRef.current.filter(task => task._id !== temporaryId)
      })

      dispatch({
        type: 'FETCH_ERROR',
        payload: getErrorMessage(error, 'Unable to create task.')
      })

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

    dispatch({
      type: 'SET_TASKS',
      payload: tasksRef.current.map(task => task._id === id ? optimisticTask : task)
    })

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

      dispatch({
        type: 'SET_TASKS',
        payload: tasksRef.current.map(task => task._id === id ? previousTask : task)
      })

      dispatch({
        type: 'FETCH_ERROR',
        payload: getErrorMessage(error, 'Unable to update task.')
      })

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

    dispatch({
      type: 'SET_TASKS',
      payload: tasksRef.current.map(task => task._id === id ? { ...task, completed: nextCompleted } : task)
    })

    try {
      await api.patch(`/tasks/${id}`, { completed: nextCompleted })

      await refetchCurrentQuery()

      return true
    } catch (error) {
      console.error(error)

      dispatch({
        type: 'SET_TASKS',
        payload: tasksRef.current.map(task => task._id === id ? { ...task, completed: previousCompleted } : task)
      })

      dispatch({
        type: 'FETCH_ERROR',
        payload: getErrorMessage(error, 'Unable to update task.')
      })

      return false
    }
  }, [refetchCurrentQuery])

  const deleteTask = useCallback(async (id) => {
    const currentTask = tasksRef.current.find(task => task._id === id)

    if (!currentTask) {
      return false
    }

    dispatch({
      type: 'SET_TASKS',
      payload: tasksRef.current.filter(task => task._id !== id)
    })

    try {
      await api.delete(`/tasks/${id}`)

      await refetchCurrentQuery()

      return true
    } catch (error) {
      console.error(error)

      const taskExists = tasksRef.current.some(task => task._id === id)

      if (!taskExists) {
        dispatch({
          type: 'SET_TASKS',
          payload: [currentTask, ...tasksRef.current]
        })
      }

      dispatch({
        type: 'FETCH_ERROR',
        payload: getErrorMessage(error, 'Unable to delete task.')
      })

      return false
    }
  }, [refetchCurrentQuery])

  return { tasks, statistics, pagination, query, isLoading, error, addTask, updateTask, toggleTask, deleteTask, updateQuery, changePage, refetch: refetchCurrentQuery }
}

export default useTasks
