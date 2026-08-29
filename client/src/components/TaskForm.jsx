import { useState } from 'react'
import { LoaderCircle, Plus } from 'lucide-react'

function TaskForm({ onAddTask }) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()

    const trimmedTitle = title.trim()

    if (!trimmedTitle || isSubmitting) {
      return
    }

    setIsSubmitting(true)

    const created = await onAddTask({
      title: trimmedTitle,
      priority,
      dueDate: dueDate || null
    })

    if (created) {
      setTitle('')
      setPriority('medium')
      setDueDate('')
    }

    setIsSubmitting(false)
  }

  return (
    <div className='rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6'>
      <h2 className='text-lg font-semibold'>Add a task</h2>
      <p className='mt-1 text-sm text-slate-400'>Create a piece of work to track.</p>

      <form onSubmit={handleSubmit} className='mt-6 space-y-4'>
        <div>
          <label className='mb-2 block text-sm text-slate-300'>Task</label>
          <input type='text' value={title} onChange={e => setTitle(e.target.value)} placeholder='e.g. Build login form' disabled={isSubmitting} className='w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60' />
        </div>

        <div>
          <label className='mb-2 block text-sm text-slate-300'>Priority</label>
          <select value={priority} onChange={e => setPriority(e.target.value)} disabled={isSubmitting} className='w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60'>
            <option value='low'>Low</option>
            <option value='medium'>Medium</option>
            <option value='high'>High</option>
          </select>
        </div>

        <div>
          <label className='mb-2 block text-sm text-slate-300'>Due date</label>
          <input type='date' value={dueDate} onChange={e => setDueDate(e.target.value)} disabled={isSubmitting} className='w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60' />
        </div>

        <button type='submit' disabled={isSubmitting || !title.trim()} className='inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50'>
          {isSubmitting ? (
            <>
              <LoaderCircle size={17} className='animate-spin' />
              Adding...
            </>
          ) : (
            <>
              <Plus size={17} />
              Add task
            </>
          )}
        </button>
      </form>
    </div>
  )
}

export default TaskForm
