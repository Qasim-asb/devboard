import { useCallback, useMemo, useState } from 'react'

const initialTasks = [
  { id: 1, title: 'Design the dashboard', completed: true },
  { id: 2, title: 'Create task API', completed: false },
  { id: 3, title: 'Build task filtering', completed: false }
]

function useTasks() {
  const [tasks, setTasks] = useState(initialTasks)

  const addTask = useCallback(title => {
    const newTask = { id: Date.now(), title, completed: false }

    setTasks((currentTasks) => [newTask, ...currentTasks])
  }, [])

  const toggleTask = useCallback(id => {
    setTasks(currentTasks => currentTasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task))
  }, [])

  const deleteTask = useCallback(id => {
    setTasks(currentTasks => currentTasks.filter(task => task.id !== id))
  }, [])

  const statistics = useMemo(() => {
    const completed = tasks.filter(task => task.completed).length

    return {
      total: tasks.length,
      completed,
      inProgress: tasks.length - completed,
    }
  }, [tasks])

  return { tasks, statistics, addTask, toggleTask, deleteTask }
}

export default useTasks
