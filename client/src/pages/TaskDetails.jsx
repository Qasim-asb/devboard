import { useEffect, useState } from 'react'
import { ArrowLeft, CalendarDays, CheckCircle2, Circle, Clock3, Pencil, Save, Trash2, X } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../lib/api'

function getDueDateLabel(dueDate) {
  if (!dueDate) {
    return 'No due date'
  }

  const today = new Date()
  const due = new Date(dueDate)

  today.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)

  const difference = Math.ceil((due - today) / (1000 * 60 * 60 * 24))

  if (difference < 0) {
    return 'Overdue'
  }

  if (difference === 0) {
    return 'Due today'
  }

  if (difference === 1) {
    return 'Due tomorrow'
  }

  return `Due ${due.toLocaleDateString()}`
}

function getDateInputValue(dueDate) {
  if (!dueDate) {
    return ''
  }

  return new Date(dueDate).toISOString().slice(0, 10)
}

function TaskDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [task, setTask] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function fetchTask() {
      try {
        setIsLoading(true)
        setError('')

        const { data } = await api.get(`/tasks/${id}`, { signal: controller.signal })

        if (controller.signal.aborted) {
          return
        }

        setTask(data)
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

    return () => { controller.abort() }
  }, [id])

  function startEditing() {
    if (!task) {
      return
    }

    setError('')
    setTitle(task.title)
    setPriority(task.priority)
    setDueDate(getDateInputValue(task.dueDate))
    setIsEditing(true)
  }

  function cancelEditing() {
    if (isSaving) {
      return
    }

    setTitle(task.title)
    setPriority(task.priority)
    setDueDate(getDateInputValue(task.dueDate))
    setIsEditing(false)
    setError('')
  }

  async function handleSave() {
    if (!task || isSaving) {
      return
    }

    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      setError('Task title is required.')
      return
    }

    const nextDueDate = dueDate || null

    const hasChanges = trimmedTitle !== task.title || priority !== task.priority || nextDueDate !== getDateInputValue(task.dueDate)

    if (!hasChanges) {
      setIsEditing(false)
      return
    }

    const previousTask = task

    const optimisticTask = {
      ...task,
      title: trimmedTitle,
      priority,
      dueDate: nextDueDate
    }

    setError('')
    setTask(optimisticTask)
    setIsEditing(false)
    setIsSaving(true)

    try {
      const { data } = await api.patch(`/tasks/${id}`, {
        title: trimmedTitle,
        priority,
        dueDate: nextDueDate
      })

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

  function handleEditKeyDown(e) {
    if (e.key === 'Escape') {
      cancelEditing()
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
          <div>
            <div className='flex items-center justify-between gap-4'>
              <div>
                <p className='text-sm font-semibold text-cyan-400'>Edit task</p>
                <h1 className='mt-1 text-xl font-bold text-slate-100'>Update task details</h1>
              </div>
            </div>

            {error && <div className='mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300'>{error}</div>}

            <div className='mt-6 space-y-5'>
              <div>
                <label htmlFor='task-title' className='mb-2 block text-sm font-medium text-slate-300'>Title</label>

                <input id='task-title' type='text' value={title} onChange={e => setTitle(e.target.value)} onKeyDown={handleEditKeyDown} autoFocus disabled={isSaving} className='w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60' />
              </div>

              <div className='grid gap-5 sm:grid-cols-2'>
                <div>
                  <label htmlFor='task-priority' className='mb-2 block text-sm font-medium text-slate-300'>Priority</label>
                  <select id='task-priority' value={priority} onChange={e => setPriority(e.target.value)} disabled={isSaving} className='w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60'>
                    <option value='low'>Low</option>
                    <option value='medium'>Medium</option>
                    <option value='high'>High</option>
                  </select>
                </div>

                <div>
                  <label htmlFor='task-due-date' className='mb-2 block text-sm font-medium text-slate-300'>Due date</label>
                  <input id='task-due-date' type='date' value={dueDate} onChange={e => setDueDate(e.target.value)} disabled={isSaving} className='w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60' />
                </div>
              </div>

              <div className='flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end'>
                <button type='button' onClick={cancelEditing} disabled={isSaving} className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50'>
                  <X size={16} />
                  Cancel
                </button>

                <button type='button' onClick={handleSave} disabled={isSaving || !title.trim()} className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50'>
                  <Save size={16} />
                  {isSaving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className='flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between'>
              <div className='min-w-0'>
                <p className='text-sm font-semibold text-cyan-400'>Task details</p>
                <h1 className={`mt-2 break-words text-2xl font-bold sm:text-3xl ${task.completed ? 'text-slate-500 line-through' : 'text-slate-100'}`}>{task.title}</h1>
              </div>

              <button type='button' onClick={handleToggle} className='inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800'>
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
              <button type='button' onClick={startEditing} className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300'>
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
