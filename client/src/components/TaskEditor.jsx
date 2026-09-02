import { useState } from 'react'
import { CheckCircle2, Save, X } from 'lucide-react'
import { getDateInputValue } from '../lib/taskUtils'

function TaskEditor({ task, onSave, onCancel, isSaving = false }) {
  const [title, setTitle] = useState(task.title)
  const [priority, setPriority] = useState(task.priority || 'medium')
  const [dueDate, setDueDate] = useState(getDateInputValue(task.dueDate))

  function handleSubmit(e) {
    e.preventDefault()

    const trimmedTitle = title.trim()

    if (!trimmedTitle || isSaving) {
      return
    }

    onSave({
      title: trimmedTitle,
      priority,
      dueDate: dueDate || null
    })
  }

  function handleKeyDown(event) {
    if (event.key === 'Escape' && !isSaving) {
      onCancel()
    }
  }

  return (
    <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className='rounded-xl border border-cyan-400/40 bg-slate-950 p-4'>
      <div className='space-y-4'>
        <div>
          <label htmlFor={`task-title-${task._id}`} className='mb-2 block text-sm font-medium text-slate-300'>Title</label>
          <input id={`task-title-${task._id}`} type='text' value={title} onChange={e => setTitle(e.target.value)} autoFocus disabled={isSaving} className='w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60' />
        </div>

        <div className='grid gap-3 sm:grid-cols-2'>
          <div>
            <label htmlFor={`task-priority-${task._id}`} className='mb-2 block text-sm font-medium text-slate-300'>Priority</label>
            <select id={`task-priority-${task._id}`} value={priority} onChange={e => setPriority(e.target.value)} disabled={isSaving} className='w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60'>
              <option value='low'>Low</option>
              <option value='medium'>Medium</option>
              <option value='high'>High</option>
            </select>
          </div>

          <div>
            <label htmlFor={`task-due-date-${task._id}`} className='mb-2 block text-sm font-medium text-slate-300'>Due date</label>
            <input id={`task-due-date-${task._id}`} type='date' value={dueDate} onChange={e => setDueDate(e.target.value)} disabled={isSaving} className='w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60' />
          </div>
        </div>

        <div className='flex flex-col gap-2 sm:flex-row sm:justify-end'>
          <button type='button' onClick={onCancel} disabled={isSaving} className='inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50'>
            <X size={16} />
            Cancel
          </button>

          <button type='submit' disabled={isSaving || !title.trim()} className='inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50'>
            {isSaving ? (
              <>
                <Save size={16} className='animate-pulse' />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                Save changes
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  )
}

export default TaskEditor
