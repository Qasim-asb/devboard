import { memo, useState } from 'react'
import { CalendarDays, CheckCircle2, Circle, LoaderCircle, Pencil, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import TaskEditor from './TaskEditor'
import { getDueDateLabel } from '../lib/taskUtils'

const TaskItem = memo(function TaskItem({ task, onToggle, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleSave(updates) {
    if (isSaving) {
      return
    }

    setIsSaving(true)

    const updated = await onUpdate(task._id, updates)

    setIsSaving(false)

    if (updated) {
      setIsEditing(false)
    }
  }

  function handleCancel() {
    if (isSaving) {
      return
    }

    setIsEditing(false)
  }

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

  if (isEditing) {
    return (
      <TaskEditor task={task} onSave={handleSave} onCancel={handleCancel} isSaving={isSaving} />
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
            <Link to={`/dashboard/tasks/${task._id}`} className='block rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60'>
              <p className={`break-words text-sm leading-6 transition hover:text-cyan-300 ${task.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                {task.title}
              </p>
            </Link>

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
          <button type='button' onClick={() => setIsEditing(true)} className='rounded-lg p-2 text-slate-500 transition hover:bg-cyan-500/10 hover:text-cyan-400'>
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
