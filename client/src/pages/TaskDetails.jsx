import { useEffect, useState } from 'react'
import { ArrowLeft, CalendarDays, CheckCircle2, Circle, Clock3, Pencil, Trash2 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../lib/api'
import TaskEditor from '../components/TaskEditor'
import { getDueDateLabel } from '../lib/taskUtils'

function TaskDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [task, setTask] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchTask() {
      try {
        setIsLoading(true)
        setError('')

        const { data } = await api.get(`/tasks/${id}`, { signal: controller.signal })

        if (!controller.signal.aborted) {
          setTask(data)
        }
      } catch (error) {
        if (error.code === 'ERR_CANCELED') {
          return
        }

        console.error(error)

        setError(error.response?.data?.message || 'Unable to load task.')
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    fetchTask()

    return () => {
      controller.abort()
    }
  }, [id])

  async function handleSave(updates) {
    if (!task || isSaving) {
      return
    }

    const previousTask = task

    const optimisticTask = {
      ...task,
      title: updates.title,
      priority: updates.priority,
      dueDate: updates.dueDate
    }

    setError('')
    setTask(optimisticTask)
    setIsEditing(false)
    setIsSaving(true)

    try {
      const { data } = await api.patch(`/tasks/${id}`, updates)

      setTask(data)
    } catch (error) {
      console.error(error)

      setTask(previousTask)

      setError(error.response?.data?.message || 'Unable to update task.')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleToggle() {
    if (!task) {
      return
    }

    const previousCompleted = task.completed
    const nextCompleted = !previousCompleted

    setError('')

    setTask(currentTask => ({ ...currentTask, completed: nextCompleted }))

    try {
      const { data } = await api.patch(`/tasks/${id}`, { completed: nextCompleted })

      setTask(data)
    } catch (error) {
      console.error(error)

      setTask(currentTask => ({ ...currentTask, completed: previousCompleted }))

      setError(error.response?.data?.message || 'Unable to update task.')
    }
  }

  async function handleDelete() {
    if (!task || isDeleting) {
      return
    }

    const confirmed = window.confirm('Are you sure you want to delete this task?')

    if (!confirmed) {
      return
    }

    setIsDeleting(true)
    setError('')

    try {
      await api.delete(`/tasks/${id}`)

      navigate('/dashboard')
    } catch (error) {
      console.error(error)

      setError(error.response?.data?.message || 'Unable to delete task.')

      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <section className='mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-14'>
        <div className='animate-pulse rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8'>

          <div className='h-4 w-24 rounded bg-slate-800' />
          <div className='mt-5 h-8 w-3/4 rounded bg-slate-800' />
          <div className='mt-4 h-4 w-1/2 rounded bg-slate-800' />

          <div className='mt-8 grid gap-3 sm:grid-cols-2'>
            <div className='h-20 rounded-xl bg-slate-800' />
            <div className='h-20 rounded-xl bg-slate-800' />
            <div className='h-20 rounded-xl bg-slate-800' />
            <div className='h-20 rounded-xl bg-slate-800' />
          </div>
        </div>
      </section>
    )
  }

  if (error && !task) {
    return (
      <section className='mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-14'>
        <div className='rounded-2xl border border-red-500/20 bg-red-500/10 p-6'>
          <p className='text-sm text-red-300'>{error}</p>

          <Link to='/dashboard' className='mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-800'>
            <ArrowLeft size={16} />
            Back to dashboard
          </Link>
        </div>
      </section>
    )
  }

  if (!task) {
    return (
      <section className='mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-14'>
        <div className='rounded-2xl border border-red-500/20 bg-red-500/10 p-6'>
          <p className='text-sm text-red-300'>Task not found.</p>

          <Link to='/dashboard' className='mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-800'>
            <ArrowLeft size={16} />
            Back to dashboard
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className='mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-14'>
      <Link to='/dashboard' className='inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-slate-100'>
        <ArrowLeft size={16} />
        Back to dashboard
      </Link>

      <div className='mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8'>
        {isEditing ? (
          <>
            <div className='mb-6'>
              <p className='text-sm font-semibold text-cyan-400'>Edit task</p>
              <h1 className='mt-1 text-xl font-bold text-slate-100'>Update task details</h1>
            </div>

            {error && <div className='mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300'>{error}</div>}

            <TaskEditor task={task} onSave={handleSave} onCancel={() => setIsEditing(false)} isSaving={isSaving} />
          </>
        ) : (
          <>
            <div className='flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between'>
              <div className='min-w-0'>
                <p className='text-sm font-semibold text-cyan-400'>Task details</p>
                <h1 className={`mt-2 break-words text-2xl font-bold sm:text-3xl ${task.completed ? 'text-slate-500 line-through' : 'text-slate-100'}`}>{task.title}</h1>
              </div>

              <button type='button' onClick={handleToggle} disabled={isSaving} className='inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50'>
                {task.completed ? (
                  <>
                    <CheckCircle2 size={17} className='text-cyan-400' />
                    Completed
                  </>
                ) : (
                  <>
                    <Circle size={17} />
                    Mark complete
                  </>
                )}
              </button>
            </div>

            {isSaving && <div className='mt-5 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4 text-sm text-cyan-300'>Saving changes...</div>}

            {error && <div className='mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300'>{error}</div>}

            <div className='mt-8 grid gap-3 sm:grid-cols-2'>
              <InfoCard icon={Clock3} label='Status' value={task.completed ? 'Completed' : 'In progress'} />
              <InfoCard icon={Circle} label='Priority' value={task.priority} />
              <InfoCard icon={CalendarDays} label='Due date' value={getDueDateLabel(task.dueDate)} />
              <InfoCard icon={CalendarDays} label='Created' value={new Date(task.createdAt).toLocaleString()} />
              <InfoCard icon={CalendarDays} label='Updated' value={new Date(task.updatedAt).toLocaleString()} />
            </div>

            <div className='mt-8 flex flex-col gap-3 border-t border-slate-800 pt-6 sm:flex-row'>
              <button type='button' onClick={() => setIsEditing(true)} className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300'>
                <Pencil size={16} />
                Edit task
              </button>

              <Link to='/dashboard' className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800'>
                <ArrowLeft size={16} />
                Dashboard
              </Link>

              <button type='button' onClick={handleDelete} disabled={isDeleting} className='inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50'>
                <Trash2 size={16} />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className='rounded-xl border border-slate-800 bg-slate-950 p-4'>
      <div className='flex items-center gap-2 text-xs font-medium text-slate-500'>
        <Icon size={14} />
        {label}
      </div>
      <p className='mt-2 break-words text-sm capitalize text-slate-200'>{value}</p>
    </div>
  )
}

export default TaskDetails
