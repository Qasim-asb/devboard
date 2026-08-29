import { useMemo, useState } from 'react'
import { CheckCircle2, Clock3, ListTodo, Search } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import useTasks from '../hooks/useTasks'
import useDebounce from '../hooks/useDebounce'
import TaskForm from '../components/TaskForm'
import TaskItem from '../components/TaskItem'

function Dashboard() {
  const { tasks, statistics, pagination, isLoading, error, addTask, updateTask, toggleTask, deleteTask, changePage } = useTasks()

  const { user } = useAuth()

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  const debouncedSearch = useDebounce(search, 300)

  const filteredTasks = useMemo(() => {
    const normalizedSearch = debouncedSearch.trim().toLowerCase()

    const priorityOrder = { high: 3, medium: 2, low: 1 }

    const visibleTasks = tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(normalizedSearch)

      const matchesStatus = filter === 'all' || (filter === 'active' && !task.completed) || (filter === 'completed' && task.completed)

      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter

      return (matchesSearch && matchesStatus && matchesPriority)
    })

    return [...visibleTasks].sort((a, b) => {
      if (sortBy === 'priority') {
        return (priorityOrder[b.priority] - priorityOrder[a.priority])
      }

      if (sortBy === 'dueDate') {
        if (!a.dueDate && !b.dueDate) {
          return 0
        }

        if (!a.dueDate) {
          return 1
        }

        if (!b.dueDate) {
          return -1
        }

        return (new Date(a.dueDate) - new Date(b.dueDate))
      }

      if (sortBy === 'oldest') {
        return (new Date(a.createdAt) - new Date(b.createdAt))
      }

      return (new Date(b.createdAt) - new Date(a.createdAt))
    })
  }, [tasks, debouncedSearch, filter, priorityFilter, sortBy])

  function handlePreviousPage() {
    if (isLoading || !pagination.hasPreviousPage) {
      return
    }

    changePage(pagination.page - 1)
  }

  function handleNextPage() {
    if (isLoading || !pagination.hasNextPage) {
      return
    }

    changePage(pagination.page + 1)
  }

  return (
    <section className='mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:py-14'>
      <div className='max-w-2xl'>
        <p className='text-sm font-semibold text-cyan-400'>Developer workspace</p>
        <h1 className='mt-2 text-3xl font-bold tracking-tight sm:text-4xl'>Welcome back, {user?.name || 'Developer'}.</h1>
        <p className='mt-4 leading-7 text-slate-400'>Keep your development tasks organized and focused.</p>
      </div>

      <div className='mt-8 grid gap-4 sm:grid-cols-3'>
        <StatCard label='Total tasks' value={statistics.total} icon={ListTodo} />
        <StatCard label='In progress' value={statistics.inProgress} icon={Clock3} />
        <StatCard label='Completed' value={statistics.completed} icon={CheckCircle2} />
      </div>

      <div className='mt-8 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]'>
        <TaskForm onAddTask={addTask} />

        <div className='min-w-0 rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-6'>
          <div className='flex flex-col gap-4'>
            <div>
              <h2 className='text-lg font-semibold'>Your tasks</h2>
              <p className='mt-1 text-sm text-slate-400'>
                {filteredTasks.length} of {tasks.length} tasks shown
              </p>
            </div>

            <div className='flex flex-col gap-3 sm:flex-row sm:flex-wrap'>
              <div className='flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3'>
                <Search size={17} className='shrink-0 text-slate-500' />
                <input type='text' value={search} onChange={e => setSearch(e.target.value)} placeholder='Search tasks' className='min-w-0 flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500' />
              </div>
              <select value={filter} onChange={e => setFilter(e.target.value)} className='w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-400 sm:w-auto'>
                <option value='all'>All tasks</option>
                <option value='active'>In progress</option>
                <option value='completed'>Completed</option>
              </select>

              <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className='w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none 
                focus:border-cyan-400 sm:w-auto'>
                <option value='all'> ll priorities</option>
                <option value='high'>High priority</option>
                <option value='medium'>Medium priority</option>
                <option value='low'>Low priority</option>
              </select>

              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className='w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-400 sm:w-auto'>
                <option value='newest'>Newest</option>
                <option value='oldest'>Oldest</option>
                <option value='priority'>Priority</option>
                <option value='dueDate'>Due date</option>
              </select>
            </div>
          </div>

          {error && <div className='mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300'>{error}</div>}

          <div className='mt-6 space-y-3'>
            {isLoading ? (
              <>
                <TaskSkeleton />
                <TaskSkeleton />
                <TaskSkeleton />
              </>
            ) : filteredTasks.length > 0 ? (
              filteredTasks.map(task => (
                <TaskItem key={task._id} task={task} onToggle={toggleTask} onUpdate={updateTask} onDelete={deleteTask} />
              ))
            ) : (
              <div className='rounded-xl border border-dashed border-slate-800 p-8 text-center'>
                <p className='font-medium'>No matching tasks</p>
                <p className='mt-2 text-sm text-slate-400'>Try a different search or filter.</p>
              </div>
            )}
          </div>

          {!isLoading && pagination.pages > 1 && (
            <div className='mt-6 flex flex-col gap-3 border-t border-slate-800 pt-5 sm:flex-row sm:items-center sm:justify-between'>
              <button type='button' onClick={handlePreviousPage} disabled={isLoading || !pagination.hasPreviousPage} className='rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40'>Previous</button>

              <span className='text-center text-sm text-slate-400'>
                Page {pagination.page} of{' '}
                {pagination.pages}
              </span>

              <button type='button' onClick={handleNextPage} disabled={isLoading || !pagination.hasNextPage} className='rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40'>
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className='rounded-2xl border border-slate-800 bg-slate-900 p-5'>
      <div className='flex items-center justify-between'>
        <span className='text-sm text-slate-400'>{label}</span>
        <Icon size={18} className='text-cyan-400' />
      </div>
      <p className='mt-3 text-3xl font-bold'>{value}</p>
    </div>
  )
}

function TaskSkeleton() {
  return (
    <div className='animate-pulse rounded-xl border border-slate-800 bg-slate-950 p-4'>
      <div className='h-4 w-3/4 rounded bg-slate-800' />
    </div>
  )
}

export default Dashboard
