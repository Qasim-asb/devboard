import { useEffect } from 'react'
import { CheckCircle2, Clock3, ListTodo, Search } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import useTasks from '../hooks/useTasks'
import TaskForm from '../components/TaskForm'
import TaskItem from '../components/TaskItem'

const VALID_STATUSES = ['all', 'active', 'completed']

const VALID_PRIORITIES = ['all', 'high', 'medium', 'low']

const VALID_SORTS = ['newest', 'oldest', 'priority', 'dueDate']

function getQueryFromSearchParams(searchParams) {
  return {
    page: Math.max(Number(searchParams.get('page')) || 1, 1),
    search: searchParams.get('search') || '',
    status: VALID_STATUSES.includes(searchParams.get('status')) ? searchParams.get('status') : 'all',
    priority: VALID_PRIORITIES.includes(searchParams.get('priority')) ? searchParams.get('priority') : 'all',
    sort: VALID_SORTS.includes(searchParams.get('sort')) ? searchParams.get('sort') : 'newest'
  }
}

function createSearchParamsFromQuery(query) {
  const params = new URLSearchParams()

  if (query.search) {
    params.set('search', query.search)
  }

  if (query.status !== 'all') {
    params.set('status', query.status)
  }

  if (query.priority !== 'all') {
    params.set('priority', query.priority)
  }

  if (query.sort !== 'newest') {
    params.set('sort', query.sort)
  }

  if (query.page > 1) {
    params.set('page', String(query.page))
  }

  return params
}

function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams()

  const initialQuery = getQueryFromSearchParams(searchParams)

  const { tasks, statistics, pagination, query, isLoading, error, addTask, updateTask, toggleTask, deleteTask, updateQuery } = useTasks(initialQuery)

  const { user } = useAuth()

  useEffect(() => {
    const nextQuery = getQueryFromSearchParams(searchParams)

    const queryIsDifferent =
      query.page !== nextQuery.page ||
      query.search !== nextQuery.search ||
      query.status !== nextQuery.status ||
      query.priority !== nextQuery.priority ||
      query.sort !== nextQuery.sort

    if (queryIsDifferent) {
      updateQuery(nextQuery)
    }
  }, [searchParams, query.page, query.search, query.status, query.priority, query.sort, updateQuery])

  useEffect(() => {
    if (isLoading) {
      return
    }

    const urlPage = Math.max(Number(searchParams.get('page')) || 1, 1)

    if (pagination.page === urlPage) {
      return
    }

    const params = new URLSearchParams(searchParams)

    if (pagination.page > 1) {
      params.set('page', String(pagination.page))
    } else {
      params.delete('page')
    }

    setSearchParams(params, { replace: true })
  }, [isLoading, pagination.page, searchParams, setSearchParams])

  function updateTaskQuery(changes, { replace = false } = {}) {
    const nextQuery = { ...query, ...changes }

    updateQuery(changes)

    const params = createSearchParamsFromQuery(nextQuery)

    setSearchParams(params, { replace })
  }

  function handlePreviousPage() {
    if (isLoading || !pagination.hasPreviousPage) {
      return
    }

    updateTaskQuery({ page: pagination.page - 1 })
  }

  function handleNextPage() {
    if (isLoading || !pagination.hasNextPage) {
      return
    }

    updateTaskQuery({ page: pagination.page + 1 })
  }

  return (
    <section className='mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:py-14'>
      <div className='max-w-2xl'>
        <p className='text-sm font-semibold text-cyan-400'>Developer workspace</p>
        <h1 className='mt-2 text-3xl font-bold tracking-tight sm:text-4xl'>
          Welcome back,{' '}
          {user?.name || 'Developer'}.
        </h1>
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
                {pagination.total}{' '}
                {pagination.total === 1 ? 'task' : 'tasks'}
              </p>
            </div>

            <div className='flex flex-col gap-3 sm:flex-row sm:flex-wrap'>
              <div className='flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3'>
                <Search size={17} className='shrink-0 text-slate-500' />

                <input type='text' value={query.search}
                  onChange={e =>
                    updateTaskQuery(
                      { search: e.target.value, page: 1 },
                      { replace: true }
                    )
                  }
                  placeholder='Search tasks' className='min-w-0 flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500' />
              </div>

              <select value={query.status} onChange={e => updateTaskQuery({ status: e.target.value, page: 1 })} className='w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-400 sm:w-auto'>
                <option value='all'>All tasks</option>
                <option value='active'>In progress</option>
                <option value='completed'>Completed</option>
              </select>

              <select value={query.priority} onChange={e => updateTaskQuery({ priority: e.target.value, page: 1 })} className='w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-400 sm:w-auto'>
                <option value='all'>All priorities</option>
                <option value='high'>High priority</option>
                <option value='medium'>Medium priority</option>
                <option value='low'>Low priority</option>
              </select>

              <select value={query.sort} onChange={e => updateTaskQuery({ sort: e.target.value, page: 1 })} className='w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-400 sm:w-auto'>
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
            ) : tasks.length > 0 ? (
              tasks.map(task => (
                <TaskItem key={task._id} task={task} onToggle={toggleTask} onUpdate={updateTask} onDelete={deleteTask} />
              ))
            ) : (
              <div className='rounded-xl border border-dashed border-slate-800 p-8 text-center'>
                <p className='font-medium'>No matching tasks</p>
                <p className='mt-2 text-sm text-slate-400'>Try a different search, status, or priority.</p>
              </div>
            )}
          </div>

          {!isLoading &&
            pagination.pages > 1 && (
              <div className='mt-6 flex flex-col gap-3 border-t border-slate-800 pt-5 sm:flex-row sm:items-center sm:justify-between'>
                <button type='button' onClick={handlePreviousPage} disabled={isLoading || !pagination.hasPreviousPage} className='rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40'>
                  Previous
                </button>

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
