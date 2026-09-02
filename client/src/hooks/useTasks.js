import { useCallback, useEffect, useReducer, useRef } from 'react'
import useDebounce from './useDebounce'
import { createTask, deleteTask as deleteTaskApi, fetchTaskList, updateTask as updateTaskApi } from '../lib/taskApi'
import { getErrorMessage } from '../lib/taskUtils'

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
      page: initialQuery.page ?? 1,
      limit: DEFAULT_LIMIT,
      search: initialQuery.search ?? '',
      status: initialQuery.status ?? 'all',
      priority: initialQuery.priority ?? 'all',
      sort: initialQuery.sort ?? 'newest'
    },
    isLoading: true,
    error: ''
  }
}

function createRequestQuery(query, search) {
  return {
    page: query.page,
    limit: query.limit,
    search,
    status: query.status,
    priority: query.priority,
    sort: query.sort
  }
}

function updateTaskInList(tasks, id, updater) {
  return tasks.map(task => task._id === id ? updater(task) : task)
}

function removeTaskFromList(tasks, id) {
  return tasks.filter(task => task._id !== id)
}

function handleFetchError(error, signal, dispatch) {
  if (error.code === 'ERR_CANCELED' || signal.aborted) {
    return
  }

  console.error(error)

  dispatch({
    type: 'FETCH_ERROR',
    payload: getErrorMessage(error, 'Unable to load tasks.')
  })
}

function handleMutationError(error, fallback, dispatch) {
  console.error(error)

  dispatch({
    type: 'FETCH_ERROR',
    payload: getErrorMessage(error, fallback)
  })
}

function handleTaskListSuccess(data, requestQuery, dispatch) {
  dispatch({ type: 'FETCH_SUCCESS', payload: data })

  if (data.pagination.page !== requestQuery.page) {
    dispatch({
      type: 'SET_QUERY',
      payload: { page: data.pagination.page }
    })
  }
}

function useTasks(initialQuery = {}) {
  const [state, dispatch] = useReducer(tasksReducer, initialQuery, createInitialState)

  const { tasks, statistics, pagination, query, isLoading, error } = state

  const debouncedSearch = useDebounce(query.search, 300)

  const tasksRef = useRef(tasks)
  const requestControllerRef = useRef(null)

  useEffect(() => {
    tasksRef.current = tasks
  }, [tasks])

  useEffect(() => {
    requestControllerRef.current?.abort()

    const controller = new AbortController()

    requestControllerRef.current = controller

    const requestQuery = createRequestQuery(query, debouncedSearch)

    dispatch({ type: 'FETCH_START' })

    async function fetchTasks() {
      try {
        const data = await fetchTaskList(requestQuery, controller.signal)

        if (controller.signal.aborted) {
          return
        }

        handleTaskListSuccess(data, requestQuery, dispatch)
      } catch (error) {
        handleFetchError(error, controller.signal, dispatch)
      }
    }

    fetchTasks()

    return () => {
      controller.abort()
    }
  }, [query, debouncedSearch])

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

    const currentQuery = query

    const requestQuery = createRequestQuery(currentQuery, debouncedSearch)

    try {
      const data = await fetchTaskList(requestQuery, controller.signal)

      if (controller.signal.aborted) {
        return
      }

      handleTaskListSuccess(data, requestQuery, dispatch)
    } catch (error) {
      handleFetchError(error, controller.signal, dispatch)
    }
  }, [query, debouncedSearch])

  const updateQuery = useCallback(changes => {
    dispatch({ type: 'SET_QUERY', payload: changes })
  }, [])

  const changePage = useCallback(page => {
    updateQuery({ page })
  }, [updateQuery])

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
      await createTask({
        title,
        priority: optimisticTask.priority,
        dueDate: optimisticTask.dueDate
      })

      await refetchCurrentQuery()

      return true
    } catch (error) {
      dispatch({
        type: 'SET_TASKS',
        payload: tasksRef.current.filter(task => task._id !== temporaryId)
      })

      handleMutationError(error, 'Unable to create task.', dispatch)

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
      payload: updateTaskInList(tasksRef.current, id, () => optimisticTask)
    })

    try {
      await updateTaskApi(id, {
        title: optimisticTask.title,
        priority: optimisticTask.priority,
        dueDate: optimisticTask.dueDate
      })

      await refetchCurrentQuery()

      return true
    } catch (error) {
      dispatch({
        type: 'SET_TASKS',
        payload: updateTaskInList(tasksRef.current, id, () => previousTask)
      })

      handleMutationError(error, 'Unable to update task.', dispatch)

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
      payload: updateTaskInList(
        tasksRef.current,
        id,
        task => ({ ...task, completed: nextCompleted })
      )
    })

    try {
      await updateTaskApi(id, { completed: nextCompleted })

      await refetchCurrentQuery()

      return true
    } catch (error) {
      dispatch({
        type: 'SET_TASKS',
        payload: updateTaskInList(
          tasksRef.current,
          id,
          task => ({ ...task, completed: previousCompleted })
        )
      })

      handleMutationError(error, 'Unable to update task.', dispatch)

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
      payload: removeTaskFromList(tasksRef.current, id)
    })

    try {
      await deleteTaskApi(id)

      await refetchCurrentQuery()

      return true
    } catch (error) {
      const taskExists = tasksRef.current.some(task => task._id === id)

      if (!taskExists) {
        dispatch({
          type: 'SET_TASKS',
          payload: [currentTask, ...tasksRef.current]
        })
      }

      handleMutationError(error, 'Unable to delete task.', dispatch)

      return false
    }
  }, [refetchCurrentQuery])

  return { tasks, statistics, pagination, query, isLoading, error, addTask, updateTask, toggleTask, deleteTask, updateQuery, changePage, refetch: refetchCurrentQuery }
}

export default useTasks
