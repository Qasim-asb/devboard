import { memo, useState } from 'react'
import { CheckCircle2, Circle, Pencil, Trash2, X } from 'lucide-react'

const TaskItem = memo(function TaskItem({ task, onToggle, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(task.title)

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
    <div className='flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4'>
      <button type='button' onClick={() => onToggle(task._id)} className='shrink-0 text-slate-500 transition hover:text-cyan-400'>
        {task.completed ? <CheckCircle2 size={20} className='text-cyan-400' /> : <Circle size={20} />}
      </button>

      <p className={`min-w-0 flex-1 break-words text-sm ${task.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
        {task.title}
      </p>

      <div className='flex shrink-0 items-center gap-1'>
        <button type='button' onClick={handleEdit} className='rounded-lg p-2 text-slate-500 transition hover:bg-cyan-500/10 hover:text-cyan-400'>
          <Pencil size={17} />
        </button>

        <button type='button' onClick={() => onDelete(task._id)} className='rounded-lg p-2 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400'>
          <Trash2 size={17} />
        </button>
      </div>
    </div>
  )
})

export default TaskItem
