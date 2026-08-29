import { memo, useState } from 'react'
import { CalendarDays, CheckCircle2, Circle, LoaderCircle, Pencil, Trash2, X } from 'lucide-react'

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

const TaskItem = memo(function TaskItem({ task, onToggle, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    if (isDeleting) {
      return
    }

    setIsDeleting(true)

    const deleted = await onDelete(task._id)

    if (!deleted) {
      setIsDeleting(false)
    }
  }

  function handleEdit() {
    setTitle(task.title)
    setIsEditing(true)
  }

  function handleCancel() {
    setTitle(task.title)
    setIsEditing(false)
  }

  async function handleSave() {
    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      return
    }

    if (trimmedTitle === task.title) {
      setIsEditing(false)
      return
    }

    setIsEditing(false)

    await onUpdate(task._id, trimmedTitle)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      handleSave()
    }

    if (e.key === 'Escape') {
      handleCancel()
    }
  }

  if (isEditing) {
    return (
      <div className='flex flex-col gap-3 rounded-xl border border-cyan-400/40 bg-slate-950 p-4 sm:flex-row sm:items-center'>
        <input type='text' value={title} onChange={e => setTitle(e.target.value)} onKeyDown={handleKeyDown} autoFocus className='min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400' />

        <div className='flex items-center gap-2'>
          <button type='button' onClick={handleSave} disabled={!title.trim()} className='inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50'>
            <CheckCircle2 size={16} />
            Save
          </button>

          <button type='button' onClick={handleCancel} className='inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800'>
            <X size={16} />
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='rounded-xl border border-slate-800 bg-slate-950 p-4'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-start'>
        <div className='flex min-w-0 flex-1 items-start gap-3'>
          <button type='button' onClick={() => onToggle(task._id)} className='mt-0.5 shrink-0 text-slate-500 transition hover:text-cyan-400'>
            {task.completed ? <CheckCircle2 size={20} className='text-cyan-400' /> : <Circle size={20} />}
          </button>

          <div className='min-w-0 flex-1'>
            <p className={`break-words text-sm leading-6 ${task.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
              {task.title}
            </p>

            <div className='mt-2 flex flex-wrap items-center gap-2'>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${task.priority === 'high' ? 'bg-red-500/10 text-red-300' : task.priority === 'low' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-amber-500/10 text-amber-300'}`}>
                {task.priority}
              </span>

              <span className='inline-flex max-w-full items-center gap-1 break-words text-xs text-slate-500'>
                <CalendarDays size={13} className='shrink-0' />
                <span className='break-words'>
                  {getDueDateLabel(task.dueDate)}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className='flex shrink-0 items-center justify-end gap-1 sm:pt-0.5'>
          <button type='button' onClick={handleEdit} className='rounded-lg p-2 text-slate-500 transition hover:bg-cyan-500/10 hover:text-cyan-400'>
            <Pencil size={17} />
          </button>

          <button type='button' onClick={handleDelete} disabled={isDeleting} className='rounded-lg p-2 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50'>
            {isDeleting ? <LoaderCircle size={17} className='animate-spin' /> : <Trash2 size={17} />}
          </button>
        </div>
      </div>
    </div>
  )
})

export default TaskItem
