import { useMemo, useState } from 'react'
import { CheckCircle2, Clock3, ListTodo, Search } from 'lucide-react'
import useTasks from '../hooks/useTasks'
import TaskForm from '../components/TaskForm'
import TaskItem from '../components/TaskItem'
import { useAuth } from '../context/AuthContext'

function Dashboard() {
  const { tasks, statistics, isLoading, error, addTask, updateTask, toggleTask, deleteTask } = useTasks()

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const { user } = useAuth()

  const filteredTasks = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(normalizedSearch)

      const matchesFilter = filter === 'all' || (filter === 'active' && !task.completed) || (filter === 'completed' && task.completed)

      return matchesSearch && matchesFilter
    })
  }, [tasks, search, filter])

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

            <div className='flex flex-col gap-3 sm:flex-row'>
              <div className='flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3'>
                <Search size={17} className='shrink-0 text-slate-500' />
                <input type='text' value={search} onChange={e => setSearch(e.target.value)} placeholder='Search tasks' className='min-w-0 flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500' />
              </div>
              <select value={filter} onChange={e => setFilter(e.target.value)} className='rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-400'>
                <option value='all'>All tasks</option>
                <option value='active'>In progress</option>
                <option value='completed'>Completed</option>
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
